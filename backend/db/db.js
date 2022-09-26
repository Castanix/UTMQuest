require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;

const connectDB = async () => {
    const client = new MongoClient(process.env.MONGO_URI, { useUnifiedTopology: true });
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