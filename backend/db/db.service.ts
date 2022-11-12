import * as mongoDB from "mongodb";
import configValues from "../config";
import { UTMQuestCollections } from "../types/utmQuestCollection";

export const utmQuestCollections: UTMQuestCollections = {};

// Connects to mongoDB with MONGO_URI from .env
export default async function connectDB() {
	const client: mongoDB.MongoClient = new mongoDB.MongoClient(
		configValues.MONGO_URI
	);

	await client.connect();

	const db: mongoDB.Db = client.db(configValues.DB_NAME);

	utmQuestCollections.Accounts = db.collection("Accounts");

	utmQuestCollections.Courses = db.collection("Courses");

	utmQuestCollections.Topics = db.collection("Topics");

	utmQuestCollections.Questions = db.collection("Questions");

	utmQuestCollections.Discussions = db.collection("Discussions");

	utmQuestCollections.Badges = db.collection("Badges");
}
