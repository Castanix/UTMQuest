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
		course: req.params.courseId,
	})
		.toArray()
		.then((topics) => {
			res.status(200).send(topics);
		})
		.catch((error) => {
			res.status(500).send(`ERROR: ${error}`);
		});
});

topicRouter.delete("/deleteTopic", async (req: Request, res: Response) => {
	const topic = await utmQuestCollections.Topics?.findOne({
		_id: new ObjectID(req.body._id),
	});

	if (!topic) {
		res.status(404).send("No such topic found.");
		return;
	}

	utmQuestCollections.Topics?.findOneAndDelete({
		_id: new ObjectID(req.body._id),
	})
		.then((result) => {
			if (!result) {
				res.status(400).send(result);
				return;
			}
			res.status(200).send("Topc successfully deleted.");
		})
		.catch((error) => {
			res.status(500).send(`ERROR: ${error}`);
		});
});

topicRouter.put("/putTopic", async (req: Request, res: Response) => {
	const topic = await utmQuestCollections.Topics?.findOne({
		_id: new ObjectID(req.body._id),
	});

	if (!topic) {
		res.status(404).send("No such topic found.");
		return;
	}

	utmQuestCollections.Topics?.findOneAndUpdate(
		{ _id: new ObjectID(req.body._id) },
		{ $set: { topicName: req.body.newTopic } }
	)
		.then((result) => {
			if (!result) {
				res.status(400).send(result);
				return;
			}
			res.status(200).send("Topic successfully updated.");
		})
		.catch((error) => {
			res.status(500).send(`ERROR: ${error}`);
		});
});

export default topicRouter;
