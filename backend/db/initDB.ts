import * as mongoDB from "mongodb";
import configValues from "../config";

// Use 'npm run init' on the terminal backend to setup the database and collections
// with validation in mongoDB if collections do not exist yet.
async function initDB() {
	const client: mongoDB.MongoClient = new mongoDB.MongoClient(
		configValues.MONGO_URI
	);

	await client.connect();

	const db: mongoDB.Db = client.db(configValues.DB_NAME);

	// Creates the Accounts collection in Mongo Atlas with validation
	await db
		.createCollection("Accounts", {
			validator: {
				$jsonSchema: {
					bsonType: "object",
					title: "Accounts Object Validation",
					required: ["utorid", "utorName", "savedCourses"],
					additionalProperties: false,
					properties: {
						_id: {
							bsonType: "objectId",
							description: "auto-generated objectId",
						},
						utorid: {
							bsonType: "string",
							description:
								"'utorid' must be a string, specifically the utorid, is unique, and is required",
						},
						utorName: {
							bsonType: "string",
							description:
								"'utorName' must be a string and is required",
						},
						savedCourses: {
							bsonType: "array",
							description:
								"'savedCourses' must be an array with courseIds referencing the Courses collection, and is required",
							uniqueItems: true,
							items: {
								bsonType: "string",
								description:
									"items in array must be a string referencing the Courses collection or empty",
							},
						},
					},
				},
			},
		})
		.then(() => {
			console.log("Successfully created Accounts collection");
		})
		.catch(() => {
			console.log(
				"Error creating collections or Accounts collection already exists"
			);
		});

	// Creates the Courses collection in Mongo Atlas with validation
	await db
		.createCollection("Courses", {
			validator: {
				$jsonSchema: {
					bsonType: "object",
					title: "Courses Object Validation",
					required: ["courseId", "courseName", "numTopics", "added"],
					additionalProperties: false,
					properties: {
						_id: {
							bsonType: "objectId",
							description: "auto-generated objectId",
						},
						courseId: {
							bsonType: "string",
							description:
								"'courseId' must be a string, specifically the course code, is unique, and is required",
						},
						courseName: {
							bsonType: "string",
							description:
								"'courseName' must be a string and is required",
						},
						numTopics: {
							bsonType: "int",
							description:
								"'numTopics' must be an int and is required",
						},
						added: {
							bsonType: "bool",
							description:
								"'added' must be a bool and is required",
						},
					},
				},
			},
		})
		.then(() => {
			console.log("Successfully created Courses collection");
		})
		.catch(() => {
			console.log(
				"Error creating collections or Courses collection already exists"
			);
		});

	// add index into topics; this index ensures combination of topicName and course is unique as well as ignores case
	await db
		.collection("Courses")
		.createIndex({ courseId: 1 }, { unique: true })
		.then(() => {
			console.log("Successfully created index for Topics");
		})
		.catch(() => {
			console.log("Error creating index for Topics");
		});

	// Creates the Topics collection in Mongo Atlas with validation
	await db
		.createCollection("Topics", {
			validator: {
				$jsonSchema: {
					bsonType: "object",
					title: "Topics Object Validation",
					required: [
						"topicName",
						"numApproved",
						"numPending",
						"course",
					],
					additionalProperties: false,
					properties: {
						_id: {
							bsonType: "objectId",
							description: "auto-generated objectId",
						},
						topicName: {
							bsonType: "string",
							description:
								"'topicName' must be a string and is required",
						},
						numApproved: {
							bsonType: "int",
							description:
								"'numApproved' must be an int and is required",
						},
						numPending: {
							bsonType: "int",
							description:
								"'numPending' must be an int and is required",
						},
						course: {
							bsonType: "string",
							description:
								"'course' must be a string that references a courseId from the courses collection and is required",
						},
					},
				},
			},
		})
		.then(() => {
			console.log("Successfully created Topics collection");
		})
		.catch(() => {
			console.log(
				"Error creating collections or Topics collection already exists"
			);
		});

	// add index into topics; this index ensures combination of topicName and course is unique as well as ignores case
	await db
		.collection("Topics")
		.createIndex(
			{ topicName: 1, course: 1 },
			{ collation: { locale: "en", strength: 2 }, unique: true }
		)
		.then(() => {
			console.log("Successfully created index for Topics");
		})
		.catch(() => {
			console.log("Error creating index for Topics");
		});

	// Creates the Questions collection in Mongo Atlas with validation
	await db
		.createCollection("Questions", {
			validator: {
				$jsonSchema: {
					bsonType: "object",
					title: "Questions Object Validation",
					required: [
						"topicId",
						"topicName",
						"courseId",
						"qnsName",
						"qnsStatus",
						"reviewStatus",
						"qnsType",
						"desc",
						"xplan",
						"choices",
						"ans",
						"authId",
						"authName",
						"date",
						"numDiscussions",
						"snapshot",
					],
					additionalProperties: false,
					properties: {
						_id: {
							bsonType: "objectId",
							description: "auto-generated objectId",
						},
						topicId: {
							bsonType: "objectId",
							description:
								"'topicId' must be an objectId, reference an _id from the topics collection, and is required",
						},
						topicName: {
							bsonType: "string",
							description:
								"'topicName' must be a string, reference a topicId from the topics collection, and is required",
						},
						courseId: {
							bsonType: "string",
							description:
								"'course' must be a string, reference a courseId from the courses collection, and is required",
						},
						qnsName: {
							bsonType: "string",
							description:
								"'qnsName' must be a string and is required",
						},
						qnsStatus: {
							enum: ["approved", "pending"],
							description:
								"'qnsStatus' must be specifically 'approved' or 'pending', and is required",
						},
						reviewStatus: {
							bsonType: "int",
							description:
								"'reviewStatus' must be an int if qnsStatus is pending or else null, and is required",
						},
						qnsType: {
							enum: ["mc", "short"],
							description:
								"'qnsType' must be specifically 'mc' or 'short', and is required",
						},
						desc: {
							bsonType: "string",
							description:
								"'desc' must be a string or empty, and is required",
						},
						xplan: {
							bsonType: "string",
							description:
								"'xplan' must be a string or empty, and is required",
						},
						choices: {
							bsonType: "array",
							description:
								"'choices' must be an array of strings or empty, and is required",
							uniqueItems: true,
							items: {
								bsonType: "string",
								description:
									"items in array must be a string or empty",
							},
						},
						ans: {
							bsonType: "string",
							description:
								"'ans' must be a string, and is required",
						},
						authId: {
							bsonType: "string",
							description:
								"'authId' must be a string, specifically the utorid, is unique, and is required",
						},
						authName: {
							bsonType: "string",
							description:
								"'authName' must be a string and is required",
						},
						date: {
							bsonType: "string",
							description:
								"'date' must be a date, specifically the date it was created, and is required",
						},
						numDiscussions: {
							bsonType: "int",
							description:
								"'numDiscussions' must be an int, and is required",
						},
						snapshot: {
							bsonType: ["objectId", "null"],
							description:
								"'snapshot' must be an objectId of an old copy of itself or null",
						},
					},
				},
			},
		})
		.then(() => {
			console.log("Successfully created Questions collection");
		})
		.catch(() => {
			console.log(
				"Error creating collections or Questions collection already exists"
			);
		});

	// Creates the Discussions collection in Mongo Atlas with validation
	await db
		.createCollection("Discussions", {
			validator: {
				$jsonSchema: {
					bsonType: "object",
					title: "Dicussions Object Validation",
					required: [
						"discussionId",
						"questionId",
						"op",
						"authId",
						"authName",
						"content",
						"thread",
						"date",
						"deleted",
					],
					additionalProperties: false,
					properties: {
						_id: {
							bsonType: "objectId",
							description: "auto-generated objectId",
						},
						discussionId: {
							bsonType: "int",
							description:
								"'discussionId' must be an int, is unique, and is required",
						},
						question: {
							bsonType: "string",
							description:
								"'question' must be a string, referencing a questionId from the questions collection, and is required",
						},
						op: {
							bsonType: "bool",
							description:
								"'op' must be a bool, signifying if it is an original post, and is required",
						},
						authId: {
							bsonType: "string",
							description:
								"'authId' must be a string, specifically the utorid, is unique, and is required",
						},
						authName: {
							bsonType: "string",
							description:
								"'authName' must be a string and is required",
						},
						content: {
							bsonType: "string",
							description:
								"'content' must be a string, and is required",
						},
						thread: {
							bsonType: "array",
							description:
								"'thread' must be an array of discussionIds referencing own collection or empty, and is required",
							uniqueItems: true,
							items: {
								bsonType: "int",
								description:
									"items in array must be int referencing own collection or empty",
							},
						},
						date: {
							bsonType: "string",
							description:
								"'date' must be a date, specifically the date it was created, and is required",
						},
						deleted: {
							bsonType: "bool",
							description:
								"'deleted' must be a bool and is required",
						},
					},
				},
			},
		})
		.then(() => {
			console.log("Successfully created Discussions collection");
		})
		.catch(() => {
			console.log(
				"Error creating collections or Discussions collection already exists"
			);
		});

	client.close();
}

initDB();

export {};
