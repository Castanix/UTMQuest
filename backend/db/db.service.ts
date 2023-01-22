import * as mongoDB from "mongodb";
import configValues from "../config";
import { UTMQuestCollections } from "../types/utmQuestCollection";

export const utmQuestCollections: UTMQuestCollections = {};
export let mongoDBConnection: mongoDB.MongoClient;

// Connects to mongoDB with MONGO_URI from .env
export default async function connectDB() {
	const env = process.env.NODE_ENV || "dev";

	const client: mongoDB.MongoClient = new mongoDB.MongoClient(
		env === "dev" ? configValues.MONGO_TEST_URI : configValues.MONGO_URI
	);

	await client.connect();

	mongoDBConnection = client;

	const db: mongoDB.Db = client.db(configValues.DB_NAME);

	utmQuestCollections.Accounts = db.collection("Accounts");

	utmQuestCollections.Courses = db.collection("Courses");

	utmQuestCollections.Topics = db.collection("Topics");

	utmQuestCollections.Questions = db.collection("Questions");

	utmQuestCollections.Discussions = db.collection("Discussions");

	utmQuestCollections.Badges = db.collection("Badges");
}
