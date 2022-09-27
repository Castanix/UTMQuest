import dotenv from "dotenv";
dotenv.config();

import { MongoClient } from "mongodb";

console.log(process.env);

// Connects to mongoDB with MONGO_URI from .env
const connectDB = () => {
    
    let client = new MongoClient(process.env.MONGO_URI as string);
    let database;

    client.connect().then(() => {
        database = client.db("UTMQuest");
        console.log(typeof(database));
        console.log(`Successfully connected to ${database.databaseName} mongodb`);
    }).catch((error: Error) =>{
        console.log(error);
    });

    
    return database;
}

export default connectDB;