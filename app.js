const express = require('express');
const pool = require('./database');
const hiscores = require('./routes/hiscores');
const app = express();

app.use(express.json());

app.use('/hiscores', hiscores);

app.get('/', (req, res) => {
  res.send('Welcome to the High Scores API');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});