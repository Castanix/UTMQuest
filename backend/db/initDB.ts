import * as mongoDB from "mongodb";
import configValues from "../config";

// Use 'npm run init' on the terminal backend to setup the database and collections
// with validation in mongoDB if collections do not exist yet.
async function initDB() {
	const env = process.env.NODE_ENV || "dev";

	const client: mongoDB.MongoClient = new mongoDB.MongoClient(
		env === "dev" ? configValues.MONGO_LOCAL : configValues.MONGO_URI
	);

	await client.connect();

	const db: mongoDB.Db = client.db(configValues.DB_NAME);

	// drop collections
	try {
		await Promise.all([
			db.dropCollection("Accounts"),
			db.dropCollection("Badges"),
			db.dropCollection("Courses"),
			db.dropCollection("Topics"),
			db.dropCollection("Questions"),
			db.dropCollection("Discussions"),
		]);
		// eslint-disable-next-line no-empty
	} catch (error) {}

	// Creates the Accounts collection in Mongo Atlas with validation
	const accounts = db
		.createCollection("Accounts", {
			validator: {
				$jsonSchema: {
					bsonType: "object",
					title: "Accounts Object Validation",
					required: [
						"utorId",
						"utorName",
						"userId",
						"anonId",
						"bookmarkCourses",
					],
					additionalProperties: false,
					properties: {
						_id: {
							bsonType: "objectId",
							description: "auto-generated objectId",
						},
						utorId: {
							bsonType: "string",
							description:
								"'utorId' must be a string, specifically the utorid, is unique, and is required",
						},
						utorName: {
							bsonType: "string",
							description:
								"'utorName' must be a string and is required",
						},
						userId: {
							bsonType: "string",
							description:
								"'userId' must be a string and is unique to each user",
						},
						anonId: {
							bsonType: "string",
							description:
								"'anonId' is a unique id used when the user is anon",
						},
						bookmarkCourses: {
							bsonType: "array",
							description:
								"'bookmarkCourses' must be an array with courseIds referencing the Courses collection, and is required",
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
		.then(async () => {
			console.log("Successfully created Accounts collection");

			await Promise.all([
				db.collection("Accounts").createIndex({ utorId: 1 }),
				db.collection("Accounts").createIndex({ userId: 1 }),
			])
				.then(() => {
					console.log("Added indexes for Accounts");
				})
				.catch(() => {
					console.log("Error creating indexes for Acccounts");
				});
		})
		.catch(() => {
			console.log(
				"Error creating collections or Accounts collection already exists"
			);
		});

	// await db.collection("Accounts").createIndex({ utorId: 1 });
	// await db.collection("Accounts").createIndex({ userId: 1 });

	// Creates the Courses collection in Mongo Atlas with validation
	const courses = db
		.createCollection("Courses", {
			validator: {
				$jsonSchema: {
					bsonType: "object",
					title: "Courses Object Validation",
					required: ["courseId", "courseName", "numTopics", "numQns", "added"],
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
						numQns: {
							bsonType: "int",
							description:
								"'numQns' must be an int and is required",
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
		.then(async () => {
			console.log("Successfully created Courses collection");

			// add index into topics; this index ensures combination of topicName and course is unique as well as ignores case
			await db
				.collection("Courses")
				.createIndex({ courseId: 1 }, { unique: true })
				.then(() => {
					console.log("Added indexes for Courses");
				})
				.catch(() => {
					console.log("Error creating index for Courses");
				});
		})
		.catch(() => {
			console.log(
				"Error creating collections or Courses collection already exists"
			);
		});

	// // add index into topics; this index ensures combination of topicName and course is unique as well as ignores case
	// await db
	// 	.collection("Courses")
	// 	.createIndex({ courseId: 1 }, { unique: true })
	// 	.then(() => {
	// 		console.log("Successfully created index for Topics");
	// 	})
	// 	.catch(() => {
	// 		console.log("Error creating index for Topics");
	// 	});

	// Creates the Topics collection in Mongo Atlas with validation
	const topics = db
		.createCollection("Topics", {
			validator: {
				$jsonSchema: {
					bsonType: "object",
					title: "Topics Object Validation",
					required: ["topicName", "numQns", "courseId", "deleted"],
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
						numQns: {
							bsonType: "int",
							description:
								"'numQns' must be an int and is required",
						},
						courseId: {
							bsonType: "string",
							description:
								"'courseId' must be a string that references a courseId from the courses collection and is required",
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
		.then(async () => {
			console.log("Successfully created Topics collection");

			// add index into topics; this index ensures combination of topicName and course is unique as well as ignores case
			// db.collection("Topics")
			// .createIndex(
			// 	{ topicName: 1, courseId: 1 },
			// 	{ collation: { locale: "en", strength: 2 }, unique: true }
			// )
			// .then(() => {
			// 	console.log("Successfully created index for Topics");
			// })
			// .catch(() => {
			// 	console.log("Error creating index for Topics");
			// });

			// db.collection("Topics").createIndex({ courseId: 1 });

			// await Promise.all([
			// 	db.collection("Topics").createIndex(
			// 		{ topicName: 1, courseId: 1 },
			// 		{
			// 			collation: { locale: "en", strength: 2 },
			// 			unique: true,
			// 		}
			// 	),
			// 	db.collection("Topics").createIndex({ courseId: 1 }),
			// ])
			// 	.then(() => {
			// 		console.log("Added indexes for Topics");
			// 	})
			// 	.catch(() => {
			// 		console.log("Error creating indexes for Topics");
			// 	});
		})
		.catch(() => {
			console.log(
				"Error creating collections or Topics collection already exists"
			);
		});

	// // add index into topics; this index ensures combination of topicName and course is unique as well as ignores case
	// await db
	// 	.collection("Topics")
	// 	.createIndex(
	// 		{ topicName: 1, courseId: 1 },
	// 		{ collation: { locale: "en", strength: 2 }, unique: true }
	// 	)
	// 	.then(() => {
	// 		console.log("Successfully created index for Topics");
	// 	})
	// 	.catch(() => {
	// 		console.log("Error creating index for Topics");
	// 	});

	// await db.collection("Topics").createIndex({ courseId: 1 });

	// Creates the Questions collection in Mongo Atlas with validation
	const questions = db
		.createCollection("Questions", {
			validator: {
				$jsonSchema: {
					bsonType: "object",
					title: "Questions Object Validation",
					required: [
						"qnsLink",
						"topicId",
						"topicName",
						"courseId",
						"qnsName",
						"qnsType",
						"description",
						"explanation",
						"choices",
						"answers",
						"utorId",
						"anonId",
						"utorName",
						"userId",
						"date",
						"numDiscussions",
						"anon",
						"latest",
						"rating",
						"likes",
						"dislikes",
						"views",
						"viewers",
						"score",
					],
					additionalProperties: false,
					properties: {
						_id: {
							bsonType: "objectId",
							description: "auto-generated objectId",
						},
						qnsLink: {
							bsonType: "string",
							description:
								"'qnsLink' must be a string, should be the original version's _id, and is shared by all the versions of a question",
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
							maxLength: 255,
						},
						qnsType: {
							enum: ["mc", "short"],
							description:
								"'qnsType' must be specifically 'mc' or 'short', and is required",
						},
						description: {
							bsonType: "string",
							description:
								"'description' must be a string or empty, and is required",
							maxLength: 4000,
						},
						explanation: {
							bsonType: "string",
							description:
								"'explanation' must be a string or empty, and is required",
							maxLength: 4000,
						},
						choices: {
							bsonType: "array",
							description:
								"'choices' must be an array of strings, and is required",
							uniqueItems: true,
							items: {
								bsonType: "string",
								description:
									"items in array must be a string or empty",
							},
						},
						answers: {
							bsonType: ["array", "string"],
							description:
								"'answers' must be an array of strings or a string, and is required",
							uniqueItems: true,
							items: {
								bsonType: "string",
								description:
									"items in array must be a string or empty",
							},
							maxLength: 4000,
						},
						utorId: {
							bsonType: "string",
							description:
								"'utorId' must be a string, specifically the utorid, is unique, and is required",
						},
						utorName: {
							bsonType: "string",
							description:
								"'utorName' must be a string and is required",
						},
						userId: {
							bsonType: "string",
							description:
								"'userId' must be a string and is unique to each user",
						},
						anonId: {
							bsonType: "string",
							description:
								"'anonId' is a unique id used when the user is anon",
						},
						date: {
							bsonType: "string",
							description:
								"'date' must be a string, specifically the date it was created, and is required",
						},
						numDiscussions: {
							bsonType: "int",
							description:
								"'numDiscussions' must be an int, and is required",
						},
						anon: {
							bsonType: "bool",
							description:
								"'anon' must be a bool, and is required",
						},
						latest: {
							bsonType: "bool",
							description:
								"'latest' must be a bool which represents the latest version of a question",
						},
						rating: {
							bsonType: "object",
							description:
								"'rating' is an object containing key value pair where key is the utorid and value is 0 or 1 based on question rating",
						},
						likes: {
							bsonType: "int",
							description:
								"'likes' is an int representing number of likes",
						},
						dislikes: {
							bsonType: "int",
							description:
								"'dislikes is an int representing number of dislikes",
						},
						views: {
							bsonType: "int",
							description:
								"'views' is an int that tracks how many views this question has",
						},
						viewers: {
							bsonType: "object",
							description:
								"'viwers' is an object with key representing unique users who have viewed this question",
						},
						score: {
							bsonType: "double",
							description:
								"'score' is a number representing the rating of a question",
						},
					},
				},
			},
		})
		.then(async () => {
			console.log("Successfully created Questions collection");

			await Promise.all([
				db
					.collection("Questions")
					.createIndex({ qnsLink: 1, latest: 1 }),
				db
					.collection("Questions")
					.createIndex({ courseId: 1, latest: 1, score: -1 }),
			])
				.then(() => {
					console.log("Added indexes for Questions");
				})
				.catch(() => {
					console.log("Error creating indexes for Questions");
				});
		})
		.catch(() => {
			console.log(
				"Error creating collections or Questions collection already exists"
			);
		});

	// await db.collection("Questions").createIndex({ qnsLink: 1, latest: 1 });
	// await db.collection("Questions").createIndex({ courseId: 1, latest: 1 });

	// Creates the Discussions collection in Mongo Atlas with validation
	const discussions = db
		.createCollection("Discussions", {
			validator: {
				$jsonSchema: {
					bsonType: "object",
					title: "Dicussions Object Validation",
					required: [
						"qnsLink",
						"op",
						"utorId",
						"utorName",
						"userId",
						"anonId",
						"content",
						"thread",
						"opDate",
						"editDate",
						"deleted",
						"anon",
						"edited",
					],
					additionalProperties: false,
					properties: {
						_id: {
							bsonType: "objectId",
							description: "auto-generated objectId",
						},
						qnsLink: {
							bsonType: "string",
							description:
								"'qnsLink' must be a string, referencing the link of a question from the questions collection, and is required",
						},
						op: {
							bsonType: "bool",
							description:
								"'op' must be a bool, signifying if it is an original post, and is required",
						},
						utorId: {
							bsonType: "string",
							description:
								"'utorId' must be a string, specifically the utorid, is unique, and is required",
						},
						userId: {
							bsonType: "string",
							description:
								"'userId' must be a string and is unique to each user",
						},
						utorName: {
							bsonType: "string",
							description:
								"'utorName' must be a string and is required",
						},
						anonId: {
							bsonType: "string",
							description:
								"'anonId' is a unique id used when the user is anon",
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
								bsonType: "string",
								description:
									"items in array must be string referencing own collection or empty",
							},
						},
						opDate: {
							bsonType: "string",
							description:
								"'opDate' must be a string, specifically the date it was created, and is required",
						},
						editDate: {
							bsonType: ["string", "null"],
							description:
								"'editDate' must be a string, specifically the date it was created, and is required",
						},
						deleted: {
							bsonType: "bool",
							description:
								"'deleted' must be a bool and is required",
						},
						anon: {
							bsonType: "bool",
							description:
								"'anon' must be a bool, and is required",
						},
						edited: {
							bsonType: "bool",
							description:
								"'edited' must be a bool, and is required",
						},
					},
				},
			},
		})
		.then(async () => {
			console.log("Successfully created Discussions collection");

			await db
				.collection("Discussions")
				.createIndex({ qnsLink: 1, op: 1 })
				.then(() => {
					console.log("Added indexes for Discussion");
				})
				.catch(() => {
					console.log("Error creating index for discussion");
				});
		})
		.catch(() => {
			console.log(
				"Error creating collections or Discussions collection already exists"
			);
		});

	// await db.collection("Discussions").createIndex({ qnsLink: 1, op: 1 });

	// Creates the Badges collection in Mongo Atlas with validation
	const badges = db
		.createCollection("Badges", {
			validator: {
				$jsonSchema: {
					bsonType: "object",
					title: "Badges Object Validation",
					required: [
						"utorId",
						"userId",
						"qnsAdded",
						"qnsEdited",
						"currLoginStreak",
						"longestLoginStreak",
						"lastLogin",
						"firstPostToday",
						"consecutivePosting",
						"unlockedBadges",
						"displayBadges",
					],
					additionalProperties: false,
					properties: {
						_id: {
							bsonType: "objectId",
							description: "auto-generated objectId",
						},
						utorId: {
							bsonType: "string",
							description:
								"'utorId' must be a string, referencing the account collection, and is required",
						},
						userId: {
							bsonType: "string",
							description:
								"'userId' must be a string and is unique to each user",
						},
						qnsAdded: {
							bsonType: "int",
							description:
								"'qnsAdded' must be an int and is required",
						},
						qnsEdited: {
							bsonType: "int",
							description:
								"'qnsEdited' must be an int and is required",
						},
						currLoginStreak: {
							bsonType: "int",
							description:
								"'currLoginStreak' must be an int and is required",
						},
						longestLoginStreak: {
							bsonType: "int",
							description:
								"'longestLoginStreak' must be an int and is required",
						},
						lastLogin: {
							bsonType: "string",
							description:
								"'lastLogin' must be a string and is required",
						},
						firstPostToday: {
							bsonType: "string",
							description:
								"'firstPostToday' must be a string and is required",
						},
						consecutivePosting: {
							bsonType: "int",
							description:
								"'consecutivePosting' must be an int and is required",
						},
						unlockedBadges: {
							bsonType: "object",
							description:
								"'unlockedBadges' is an object/dictionary that keeps track of unlocked badges",
						},
						displayBadges: {
							bsonType: "array",
							description:
								"'displayBadges' is an array of the badge name users want to display next to their name (up to 3) and is required",
							uniqueItems: true,
							items: {
								bsonType: "string",
								description:
									"items in array must be string of badges",
							},
						},
					},
				},
			},
		})
		.then(async () => {
			console.log("Successfully created Badges collection");

			await Promise.all([
				db.collection("Badges").createIndex({ utorId: 1 }),
				db.collection("Badges").createIndex({ userId: 1 }),
			])
				.then(() => {
					console.log("Added indexes for Badges");
				})
				.catch(() => {
					console.log("Error creating indexes for Badges");
				});
		})
		.catch(() => {
			console.log(
				"Error creating collections or Badges collection already exists"
			);
		});

	// await db.collection("Badges").createIndex({ utorId: 1 });
	// await db.collection("Badges").createIndex({ userId: 1 });
	await Promise.all([
		accounts,
		courses,
		topics,
		questions,
		discussions,
		badges,
	])
		.then(() => {})
		.catch((err) => {
			console.log(err);
		});

	client.close();
}

// initDB();

export default initDB;
