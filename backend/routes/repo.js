// backend/routes/repo.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const Repo = require('../models/repo');
const Build = require('../models/build');
const axios = require('axios');
const { exec } = require('child_process');
const router = express.Router();

// helper to exec commands
function execCommand(command, options = {}) {
  return new Promise((resolve, reject) => {
    exec(command, { maxBuffer: 1024 * 1024 * 10, ...options }, (error, stdout, stderr) => {
      if (error) return reject(stderr || stdout || error.message);
      resolve(stdout + stderr);
    });
  });
}

// Middleware - ensure authenticated
function ensureAuth(req, res, next) {
  if (!req.session?.user) return res.status(401).send('Not authenticated');
  next();
}

// GET /api/repos -> list repos for logged-in user
router.get('/api/repos', ensureAuth, async (req, res) => {
  try {
    const repos = await Repo.find({ userId: req.session.user.id }).populate({ path: 'builds', options: { sort: { createdAt: -1 } } });
    return res.json(repos);
  } catch (err) {
    console.error(err);
    return res.status(500).send('Failed to fetch repos');
  }
});

// POST /api/repos -> add new repo and trigger initial build (repoUrl required)
router.post('/api/repos', ensureAuth, async (req, res) => {
  const userId = req.session.user.id;
  const { repoUrl, branch = 'main' } = req.body;
  if (!repoUrl) return res.status(400).send('repoUrl is required');

  try {
    const repoName = path.basename(repoUrl, '.git');
    const repo = new Repo({ userId, repoUrl, repoName, branch });
    await repo.save();

    // trigger build (async) — respond immediately then run build
    triggerBuild(repo).catch(err => console.error('background build error', err));

    return res.status(201).json(repo);
  } catch (err) {
    console.error(err);
    return res.status(500).send('Failed to add repo');
  }
});

// POST /api/repos/:id/build -> trigger manual build for repo
router.post('/api/repos/:id/build', ensureAuth, async (req, res) => {
  const repoId = req.params.id;
  try {
    const repo = await Repo.findById(repoId);
    if (!repo) return res.status(404).send('Repo not found');
    if (String(repo.userId) !== req.session.user.id) return res.status(403).send('Forbidden');

    // trigger build async
    triggerBuild(repo).catch(err => console.error('background build error', err));
    return res.json({ ok: true, message: 'Build started' });
  } catch (err) {
    console.error(err);
    return res.status(500).send('Failed to trigger build');
  }
});

// GET /api/repos/:id/builds -> list builds for repo
router.get('/api/repos/:id/builds', ensureAuth, async (req, res) => {
  try {
    const repo = await Repo.findById(req.params.id).populate({ path: 'builds', options: { sort: { createdAt: -1 } }});
    if (!repo) return res.status(404).send('Repo not found');
    if (String(repo.userId) !== req.session.user.id) return res.status(403).send('Forbidden');
    return res.json(repo.builds);
  } catch (err) {
    console.error(err);
    return res.status(500).send('Failed to fetch builds');
  }
});

/* ===== build runner (shared helper) ===== */
async function triggerBuild(repo) {
  // repo: mongoose doc
  const buildsDir = path.join(__dirname, '..', 'builds');
  if (!fs.existsSync(buildsDir)) fs.mkdirSync(buildsDir);

  // create a safe working path using repo id to avoid collisions
  const safeName = `${repo.userId.toString()}_${repo._id.toString()}_${repo.branch.replace(/[^\w-]/g,'')}`;
  const repoDir = path.join(buildsDir, safeName);

  // create build doc with 'running' status
  const buildDoc = new Build({
    userId: repo.userId,
    repoId: repo._id,
    repoName: repo.repoName,
    branch: repo.branch,
    status: 'running',
    logs: ''
  });
  await buildDoc.save();

  // push to repo.builds immediately (so UI sees build exists)
  repo.builds.unshift(buildDoc._id);
  await repo.save();

  let logs = '';
  try {
    // clone or pull
    if (!fs.existsSync(repoDir)) {
      logs += `Cloning ${repo.repoUrl}...\n`;
      await execCommand(`git clone -b ${repo.branch} ${repo.repoUrl} ${repoDir}`);
      logs += `Clone complete\n`;
    } else {
      logs += `Pulling latest in ${repoDir}...\n`;
      await execCommand(`git -C ${repoDir} fetch --all`);
      await execCommand(`git -C ${repoDir} reset --hard origin/${repo.branch}`);
      logs += `Pull complete\n`;
    }

    // read package.json safely
    const pkgPath = path.join(repoDir, 'package.json');
    let hasBuild = false;
    if (fs.existsSync(pkgPath)) {
      try {
        const pkgRaw = fs.readFileSync(pkgPath, 'utf8');
        const pkg = JSON.parse(pkgRaw);
        if (pkg.scripts && pkg.scripts.build) hasBuild = true;
      } catch (e) {
        logs += `Failed to parse package.json: ${e.message}\n`;
      }
    }

    // install & build if available
    if (hasBuild) {
      logs += `Running npm install...\n`;
      logs += await execCommand('npm install --silent', { cwd: repoDir });
      logs += `Running npm run build...\n`;
      logs += await execCommand('npm run build', { cwd: repoDir });
    } else {
      logs += `No build script found (skipping build step)\n`;
    }

    // get commit SHA
    const sha = (await execCommand('git rev-parse HEAD', { cwd: repoDir })).trim();

    // update build doc
    buildDoc.commitSHA = sha;
    buildDoc.status = 'success';
    buildDoc.logs = logs;
    await buildDoc.save();

  } catch (err) {
    const errText = (err && typeof err === 'string') ? err : (err && err.message) ? err.message : String(err);
    logs += `ERROR: ${errText}\n`;
    buildDoc.status = 'fail';
    buildDoc.logs = logs;
    await buildDoc.save();
    console.error('build runner error', errText);
  }
}

module.exports = router;
