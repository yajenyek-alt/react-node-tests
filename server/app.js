const express = require('express');
const app = express();
const { reviewCode } = require('./reviewer'); // <-- ВОТ ЭТА СТРОКА ВАЖНА

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.post('/api/review', async (req, res) => {
  const { diff } = req.body;

  if (!diff) {
    return res.status(400).json({ error: 'Parameter "diff" is required' });
  }

  try {
    const reviewResult = await reviewCode(diff);
    res.json(reviewResult);
  } catch (error) {
    console.error('Review error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;