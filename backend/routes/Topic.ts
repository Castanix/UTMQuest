import * as mongoDB from "mongodb";
import { ObjectID } from "bson";
import { Request, Response, Router } from "express";
import { utmQuestCollections } from "../db/db.service";

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
	})
		.toArray()
		.then((topics) => {
			res.status(200).send(topics);
		})
		.catch((error) => {
			res.status(500).send(error);
		});
});

topicRouter.get('/getTopic/:topicId', async (req: Request, res: Response) => { 
	try { 
		const { topicId } = req.params;
		const topic = await utmQuestCollections.Topics?.findOne({_id: new ObjectID(topicId)});
		
		if (!topic){
			res.status(404).send("No such topic found");
			return;
		}

		res.status(200).send(topic);

	} catch (error) { 
		res.status(500).send(error);
	}	
});


topicRouter.delete("/deleteTopic", async (req: Request, res: Response) => {
	if (!mongoDB.ObjectId.isValid(req.body._id)) {
		res.status(400).send("Invalid ObjectId : _id");
		return;
	}

	const topic = await utmQuestCollections.Topics?.findOne({
		_id: new ObjectID(req.body._id),
	});

	if (!topic) {
		res.status(404).send("No such topic found.");
		return;
	}

	if (topic.numQns !== 0) {
		res.status(400).send(
			"Topics must contain no questions before they can be deleted."
		);
		return;
	}

	utmQuestCollections.Topics?.deleteOne(topic)
		.then((result) => {
			if (!result.acknowledged) {
				res.status(400).send(result);
				return;
			}

			// DECREMENT TOPIC COUNTER IN COURSE
			const course = {
				courseId: topic.course,
				numTopics: { $gt: 0 },
			};

			utmQuestCollections.Courses?.findOneAndUpdate(course, {
				$inc: { numTopics: -1 },
			}).then((decrementResult) => {
				if (!decrementResult) {
					res.status(500).send(
						`Unable to decrement numTopics for ${course.courseId}`
					);
					utmQuestCollections.Topics?.insertOne(topic);
					return;
				}
				res.status(200).send("Topic successfully deleted.");
			});
		})
		.catch((error) => {
			res.status(500).send(error);
		});
});


topicRouter.put("/putTopic", async (req: Request, res: Response) => {
	if (!mongoDB.ObjectId.isValid(req.body._id)) {
		res.status(400).send("Invalid ObjectId : _id");
		return;
	}

	const topic = await utmQuestCollections.Topics?.findOne({
		_id: new ObjectID(req.body._id),
	});

	if (!topic) {
		res.status(404).send("No such topic found.");
		return;
	}

	const oldTopicName = topic.topicName;
	const newTopicName = req.body.newTopic.trim();
	if (!newTopicName) {
		res.status(400).send("Cannot update with given topic name");
		return;
	}

	if (newTopicName.length > 255) {
		res.status(400).send("Topic name must be <= 255 characters.");
		return;
	}

	utmQuestCollections.Topics?.updateOne(topic, {
		$set: { topicName: newTopicName },
	})
		.then((result) => {
			if (!result.acknowledged) {
				res.status(500).send(result);
				return;
			}

			utmQuestCollections.Questions?.updateMany(
				{ topicId: new ObjectID(req.body._id) },
				{ $set: { topicName: req.body.newTopic.trim() } }
			).then((updateTopicResult) => {
				if (!result.acknowledged) {
					res.status(500).send("Could not update topic.");
					utmQuestCollections.Questions?.updateMany(
						{ topicId: new ObjectID(req.body._id),
						  topicName: newTopicName },
						{ $set: { topicName: oldTopicName } }
					);
					utmQuestCollections.Topics?.updateOne(topic, {
						$set: { topicName: oldTopicName }
					});
					return;
				}
				res.status(200).send(updateTopicResult);
			});
		})
		.catch((error) => {
			res.status(500).send(error);
		});
});


topicRouter.post("/addTopic", async (req: Request, res: Response) => {
	const course = await utmQuestCollections.Courses?.findOne({
		courseId: req.body.courseId,
	});

	if (!course) {
		res.status(404).send("The given course doesn't exist.");
		return;
	}

	const newTopicName: string = req.body.topicName.trim();
	if (!newTopicName) {
		res.status(400).send("Cannot add with given topic name");
		return;
	}

	if (newTopicName.length > 255) {
		res.status(400).send("Topic name must be <= 255 characters.");
		return;
	}

	const topicId = new ObjectID();
	const newTopic = {
		_id: topicId,
		topicName: newTopicName,
		courseId: req.body.courseId,
		numQns: 0
	};

	utmQuestCollections.Topics?.insertOne(newTopic)
		.then((result) => {
			if (!result) {
				res.status(500).send("Unable to add new topic.");
				return;
			}
			// INCREMENT COUNTER
			utmQuestCollections.Courses?.updateOne(course, {
				$inc: { numTopics: 1 },
			}).then((incrementResult) => {
				if (!incrementResult) {
					res.status(500).send(
						`Unable to increment numTopics for ${course.courseId}`
					);
					utmQuestCollections.Topics?.deleteOne(topicId);
					return;
				}
				res.status(201).send(result);
			});
		})
		.catch((error) => {
			res.status(500).send(error);
		});
});

export default topicRouter;
