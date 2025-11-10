const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'polysia-backend' });
});

app.post('/api/echo', (req, res) => {
  res.json({ youSent: req.body || null });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

