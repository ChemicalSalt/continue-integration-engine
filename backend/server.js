require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Continue Integration Engine is running!');
});

// Webhook endpoint
app.post('/webhook', async (req, res) => {
  const payload = req.body;
  console.log('Webhook received:', payload);

  const repoName = payload.repository.name;
  const cloneUrl = payload.repository.clone_url;
  const branch = payload.ref.split('/').pop(); // e.g., refs/heads/main → main

  const repoDir = path.join(__dirname, 'builds', `${repoName}_${branch}`);

  // Ensure builds folder exists
  if (!fs.existsSync(path.join(__dirname, 'builds'))) {
    fs.mkdirSync(path.join(__dirname, 'builds'));
  }

  try {
    if (!fs.existsSync(repoDir)) {
      console.log(`Cloning ${repoName}...`);
      await execCommand(`git clone -b ${branch} ${cloneUrl} ${repoDir}`);
    } else {
      console.log(`Pulling latest changes for ${repoName}...`);
      await execCommand(`git -C ${repoDir} reset --hard`);
      await execCommand(`git -C ${repoDir} pull origin ${branch}`);
    }

    console.log('Installing dependencies...');
    await execCommand(`npm install`, { cwd: repoDir });

    console.log('Running build...');
    const buildLogs = await execCommand(`npm run build`, { cwd: repoDir });

    console.log('Build finished. Logs:\n', buildLogs);

    // TODO: Save buildLogs + metadata to DB

    res.status(200).send('Webhook processed and build executed.');
  } catch (err) {
    console.error('Error processing webhook:', err);
    res.status(500).send('Error processing webhook.');
  }
});

// Helper to wrap exec in a Promise
function execCommand(command, options = {}) {
  return new Promise((resolve, reject) => {
    exec(command, { maxBuffer: 1024 * 500, ...options }, (error, stdout, stderr) => {
      if (error) return reject(stderr || error.message);
      resolve(stdout + stderr);
    });
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
