require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Continue Integration Engine is running!');
});

// Webhook endpoint
app.post('/webhook', async (req, res) => {
  console.log('Webhook received:', req.body); // logs payload

  try {
    const repoUrl = req.body.repository.clone_url;
    const branch = req.body.ref.split('/').pop(); // e.g., 'main'
    const repoName = req.body.repository.name;
    const repoDir = path.join(__dirname, 'builds', repoName);

    // Clone or pull repo
    if (!fs.existsSync(repoDir)) {
      console.log(`Cloning ${repoName}...`);
      exec(`git clone -b ${branch} ${repoUrl} ${repoDir}`, (err, stdout, stderr) => {
        console.log(stdout);
        if (err) console.error(stderr);
      });
    } else {
      console.log(`Pulling latest changes for ${repoName}...`);
      exec(`cd ${repoDir} && git reset --hard && git pull origin ${branch}`, (err, stdout, stderr) => {
        console.log(stdout);
        if (err) console.error(stderr);
      });
    }

    // Install dependencies
    exec(`cd ${repoDir} && npm install`, (err, stdout, stderr) => {
      console.log(stdout);
      if (err) console.error(stderr);
    });

    // Run build
    exec(`cd ${repoDir} && npm run build`, (err, stdout, stderr) => {
      console.log(stdout);
      if (err) console.error(stderr);
    });

    res.status(200).send('Webhook received and build started');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing webhook');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
