import configValues from '../../config'; 
import * as mongoDB from "mongodb";

const UTMQuestCollections: { 
    Accounts?: mongoDB.Collection,
    Courses?: mongoDB.Collection,
    Topics?: mongoDB.Collection,
    Questions?: mongoDB.Collection,
    Discussions?: mongoDB.Collection,
} = {}

// Connects to mongoDB with MONGO_URI from .env
export async function connectDB() { 

    const client: mongoDB.MongoClient = new mongoDB.MongoClient(configValues.MONGO_URI);

    await client.connect();

    const db: mongoDB.Db = client.db(configValues.DB_NAME);
    
    UTMQuestCollections.Accounts = db.collection("Accounts"); 
    
    UTMQuestCollections.Courses = db.collection("Courses"); 
    
    UTMQuestCollections.Topics = db.collection("Topics");
    
    UTMQuestCollections.Questions = db.collection("Questions");
    
    UTMQuestCollections.Discussions = db.collection("Discussions");

    return UTMQuestCollections;
}