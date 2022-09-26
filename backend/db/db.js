require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;

// Connects to mongoDB with MONGO_URI from .env
const connectDB = async () => {
    let client = new MongoClient(process.env.MONGO_URI, { useUnifiedTopology: true });
    let database;

    await client.connect().then(() => {
        database = client.db("UTMQuest");
        console.log(`Successfully connected to ${database.databaseName} mongodb`);
    }, error => {
        console.error(error);
    });

    return database;
}

module.exports = {
    connectDB
};