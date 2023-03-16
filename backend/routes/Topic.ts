import { ObjectID } from "bson";
import { Request, Response, Router } from "express";
import { utmQuestCollections, mongoDBConnection } from "../db/db.service";
import redisClient from "../redis/setup";

const topicRouter = Router();

topicRouter.get("/getTopics/:courseId", async (req: Request, res: Response) => {
	const course = await utmQuestCollections.Courses?.findOne({
		courseId: req.params.courseId,
	});

	if (!course) {
		res.statusMessage = "No such course found.";
		res.status(404).end();
		return;
	}

	utmQuestCollections.Topics?.find({
		courseId: req.params.courseId,
		deleted: false,
	})
		.toArray()
		.then((topics) => {
			res.status(200).send(topics);
		})
		.catch((error) => {
			res.status(500).send(error);
		});
});

topicRouter.get("/getTopic/:topicId", async (req: Request, res: Response) => {
	try {
		const { topicId } = req.params;
		const topic = await utmQuestCollections.Topics?.findOne({
			_id: new ObjectID(topicId),
		});

		if (!topic) {
			res.status(404).send({ error: "No such topic found" });
			return;
		}

		res.status(200).send(topic);
	} catch (error) {
		res.status(500).send(error);
	}
});

topicRouter.delete("/deleteTopic", async (req: Request, res: Response) => {
	const topic = await utmQuestCollections.Topics?.findOne({
		_id: new ObjectID(req.body._id),
	});

	if (!topic) {
		res.status(404).send({ error: "No such topic found" });
		return;
	}

	if (topic.numQns !== 0) {
		res.status(400).send({
			error: "Topics must contain no questions before they can be deleted.",
		});
		return;
	}

	const session = mongoDBConnection.startSession();

	try {
		session.startTransaction();

		await utmQuestCollections.Topics?.updateOne(
			topic,
			{ $set: { deleted: true } },
			{ session }
		);

		// Decrement topic counter in course
		const course = {
			courseId: topic.courseId,
			numTopics: { $gt: 0 },
		};

		await utmQuestCollections.Courses?.findOneAndUpdate(
			course,
			{ $inc: { numTopics: -1 } },
			{ session }
		);

		await session.commitTransaction();

		await redisClient.del('course');

		res.status(200).send({
			success: "Topic successfully deleted.",
		});
	} catch (err) {
		await session.abortTransaction();

		res.status(500).send(err);
	} finally {
		await session.endSession();
	}
});

topicRouter.put("/putTopic", async (req: Request, res: Response) => {
	const topic = await utmQuestCollections.Topics?.findOne({
		_id: new ObjectID(req.body._id),
	});

	if (!topic) {
		res.status(404).send({ error: "No such topic found." });
		return;
	}

	const newTopicName = req.body.newTopic.trim();
	if (!newTopicName) {
		res.status(400).send({ error: "Cannot update with given topic name" });
		return;
	}

	if (newTopicName.length > 255) {
		res.status(400).send({
			error: "Topic name must be <= 255 characters.",
		});
		return;
	}

	const session = mongoDBConnection.startSession();

	try {
		session.startTransaction();

		const updateTopicResult = await utmQuestCollections.Topics?.updateOne(
			topic,
			{ $set: { topicName: newTopicName } },
			{ session }
		);

		await utmQuestCollections.Questions?.updateMany(
			{ topicId: new ObjectID(req.body._id) },
			{ $set: { topicName: req.body.newTopic.trim() } },
			{ session }
		);

		await session.commitTransaction();

		res.status(200).send(updateTopicResult);
	} catch (err) {
		await session.abortTransaction();

		res.status(500).send(err);
	} finally {
		await session.endSession();
	}
});

topicRouter.post("/addTopic", async (req: Request, res: Response) => {
	const course = await utmQuestCollections.Courses?.findOne({
		courseId: req.body.courseId,
	});

	if (!course) {
		res.status(404).send({ error: "The given course doesn't exist." });
		return;
	}

	const newTopicName: string = req.body.topicName.trim();
	if (!newTopicName) {
		res.status(400).send({ error: "Cannot add with given topic name" });
		return;
	}

	if (newTopicName.length > 255) {
		res.status(400).send({
			error: "Topic name must be <= 255 characters.",
		});
		return;
	}

	const session = mongoDBConnection.startSession();

	try {
		session.startTransaction();

		// Increment counter
		await utmQuestCollections.Courses?.updateOne(
			course,
			{ $inc: { numTopics: 1 } },
			{ session }
		);

		await utmQuestCollections.Topics?.findOneAndUpdate(
			{
				courseId: req.body.courseId,
				topicName: newTopicName,
				deleted: true,
			},
			{ $set: { deleted: false } },
			{ session }
		)
			.then(async (updateRes) => {

				// If no existing document that is flagged as deleted with topicName is in the document, insert a new one, otherwise unflag and return document id
				if (!updateRes.value) {
					const topicId = new ObjectID();
					const newTopic = {
						_id: topicId,
						topicName: newTopicName,
						courseId: req.body.courseId,
						numQns: 0,
						deleted: false,
					};

					const insertRes =
						await utmQuestCollections.Topics?.insertOne(newTopic, {
							session,
						});

					await session.commitTransaction();

					res.status(201).send(insertRes);
				} else {

					await session.commitTransaction();

					res.status(200).send({
						insertedId: updateRes.value._id.toString(),
					});
				}
			})
			.catch((err) => {
				throw new Error(err);
			});

		await redisClient.del('course');

	} catch (err) {
		await session.abortTransaction();

		res.status(500).send(err);
	} finally {
		await session.endSession();
	}
});

export default topicRouter;
