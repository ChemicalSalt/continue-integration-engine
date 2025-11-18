require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const authRoutes = require('./routes/auth');
const Repo = require('./models/repo');
const Build = require('./models/build');

const app = express();
const PORT = process.env.PORT || 5000;

// -------------------- MONGO DB --------------------
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// -------------------- MIDDLEWARE --------------------
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));s
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, secure: true, sameSite: 'lax' } // secure:true only if HTTPS
}));

// -------------------- ROUTES --------------------
app.use('/auth', authRoutes);

// Root test
app.get('/', (req, res) => res.send('Dynamic CI Engine running!'));

// -------------------- REPO API --------------------
// Fetch user's repos
app.get('/api/repos', async (req, res) => {
  const userSession = req.session.user;
  if (!userSession) return res.status(401).send('Not authenticated');

  try {
    const repos = await Repo.find({ userId: userSession.id }).populate('builds');
    res.json(repos);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.toString());
  }
});

// Add repo
app.post('/api/repos', async (req, res) => {
  const userSession = req.session.user;
  if (!userSession) return res.status(401).send('Not authenticated');

  const { repoUrl, branch } = req.body;
  if (!repoUrl) return res.status(400).send('repoUrl is required');

  try {
    const repoName = path.basename(repoUrl, '.git');
    const repo = new Repo({ userId: userSession.id, repoUrl, repoName, branch: branch || 'main' });
    await repo.save();

    triggerBuild(repo).catch(err => console.error('triggerBuild error:', err));

    res.status(200).json(repo);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.toString());
  }
});

// -------------------- BUILD --------------------
async function triggerBuild(repo) {
  const repoDir = path.join(__dirname, 'builds', `${repo.userId}_${repo.repoName}_${repo.branch || 'main'}`);
  if (!fs.existsSync(path.join(__dirname, 'builds'))) fs.mkdirSync(path.join(__dirname, 'builds'));

  try {
    if (!fs.existsSync(repoDir)) {
      await execCommand(`git clone -b ${repo.branch || 'main'} ${repo.repoUrl} ${repoDir}`);
    } else {
      await execCommand(`git -C ${repoDir} reset --hard`);
      await execCommand(`git -C ${repoDir} pull origin ${repo.branch || 'main'}`);
    }

    const pkgJsonPath = path.join(repoDir, 'package.json');
    let buildCmd = "echo 'No build step'";

    if (fs.existsSync(pkgJsonPath)) {
      delete require.cache[require.resolve(pkgJsonPath)];
      const pkg = require(pkgJsonPath);
      if (pkg.scripts && pkg.scripts.build) buildCmd = 'npm install && npm run build';
    }

    let buildLogs = '';
    let status = 'success';
    try { buildLogs = await execCommand(buildCmd, { cwd: repoDir }); } 
    catch (err) { status = 'fail'; buildLogs = String(err); }

    const commitSHA = (await execCommand('git rev-parse HEAD', { cwd: repoDir })).trim();

    const build = new Build({
      userId: repo.userId,
      repo: repo.repoName,
      branch: repo.branch || 'main',
      commitSHA,
      status,
      logs: buildLogs
    });
    await build.save();

    repo.builds = repo.builds || [];
    repo.builds.push(build._id);
    await repo.save();

    console.log(`Build for ${repo.repoName} saved successfully`);
  } catch (err) {
    console.error('Build error:', err);
    const build = new Build({
      userId: repo.userId,
      repo: repo.repoName,
      branch: repo.branch || 'main',
      commitSHA: null,
      status: 'error',
      logs: String(err)
    });
    await build.save();
    repo.builds = repo.builds || [];
    repo.builds.push(build._id);
    await repo.save();
  }
}

function execCommand(command, options = {}) {
  return new Promise((resolve, reject) => {
    exec(command, { maxBuffer: 1024 * 500, ...options }, (error, stdout, stderr) => {
      if (error) return reject(stderr || error.message || error);
      resolve((stdout || '') + (stderr || ''));
    });
  });
}

// -------------------- START SERVER --------------------
app.listen(PORT, () => console.log(`Dynamic CI Engine running on port ${PORT}`));
