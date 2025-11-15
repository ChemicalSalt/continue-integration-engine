require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Continue Integration Engine is running!');
});

// Webhook endpoint
app.post('/webhook', (req, res) => {
  console.log('Webhook received:', req.body); // logs payload for now
  res.status(200).send('Webhook received');
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
