const express = require('express');
const { connectDB } = require('./db/db');

const app = express();
const port = process.env.PORT || 5000;

let db;
connectDB().then(database => {
    db = database;
});

app.listen(port, () => console.log(`Listening on port ${port}`));

app.get('/express_backend', (req, res) => {
  res.send({ express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT' });
});