const express = require('express');
const { connectDB } = require('./db/db');

const app = express();
const port = process.env.PORT || 5000;

let db;
connectDB().then(database => {
    db = database;


    // Insert test for invalid document to Accounts collection
    // db.collection("Accounts").insertOne({
    //   utorid: "test123",
    //   utorName: "testName",
    //   savedCourses: ["testItem", "testItem2"],
    //   reviewQns: "wrong bsonType"
    // })


    // Insert test for valid document to Accounts collection
    db.collection("Accounts").insertOne({
      utorid: "test123",
      utorName: "testName",
      savedCourses: ["testItem", "testItem2", "testing empty array in reviewQns"],
      reviewQns: []
    })
})

app.listen(port, () => console.log(`Listening on port ${port}`));

app.get('/express_backend', (req, res) => {
  res.send({ express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT' });
});