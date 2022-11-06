import { ObjectID } from "bson";
import { Request, Response, Router } from "express";
import { ObjectId } from "mongodb";
import { utmQuestCollections } from "../db/db.service";

const questionRouter = Router();


// "/:questionId"
questionRouter.get("/oneQuestion/:questionId", async (req: Request, res: Response) => {
	try {
		const question = await utmQuestCollections.Questions?.findOne({
			_id: new ObjectID(req.params.questionId),
		});
		if (!question) {
			res.status(404).send("No question found.");
			return;
		}
		res.status(200).send(question);
	} catch (error) {
		res.status(500).send(`ERROR: ${error}`);
	}
});


questionRouter.get("/allDiscussions/:questionId", async (req: Request, res: Response) => {
	try {
		const discussions = await utmQuestCollections.Discussions?.findOne({
			question: req.params.questionId,
		});
		if (!discussions) {
			res.status(404).send("Cannot find discussion");
			return;
		}

		res.status(200).send(discussions);
	} catch (error) {
		res.status(500).send(`ERROR: ${error}`);
	}
});


// /:courseId/:qnsStatus
questionRouter.get("/latestQuestions/:courseId/", async (req: Request, res: Response) => {
	try {
		const question = await utmQuestCollections.Questions?.find({
			courseId: req.params.courseId,
			latest: true
		}).toArray();

		res.status(200).send(question);
		return;
	} catch (error) {
		res.status(500).send(error);
	}
});


questionRouter.post("/addQuestion", async (req: Request, res: Response) => {
	// post a new question
	const mongoId = new ObjectID();
	const link = mongoId.toHexString();

	const question = {
		_id: mongoId,
		link: link,
		topicId: new ObjectID(req.body.topicId),
		topicName: req.body.topicName,
		courseId: req.body.courseId,
		qnsName: req.body.qnsName,
		qnsType: req.body.qnsType,
		desc: req.body.desc,
		xplan: req.body.xplan,
		choices: req.body.choices,
		ans: req.body.ans,
		authId: req.body.authId,
		authName: req.body.authName,
		date: new Date().toISOString(),
		numDiscussions: req.body.numDiscussions,
		anon: req.body.anon,
		latest: true
	};

	utmQuestCollections.Questions?.insertOne(question)
		.then((result) => {
			if (!result) {
				res.status(500).send("Unable to add new question.");
				return;
			}
			// INCREMENT COUNTER
			utmQuestCollections.Topics?.findOneAndUpdate(
				{ _id: new ObjectID(req.body.topicId) },
				{ $inc: { numQuestions: 1 } }
			).then((incrementResult) => {
				if (!incrementResult) {
					res.status(500).send(
						`Unable to increment numQuestions for ${req.body.topicName}`
					);
					return;
				}
				res.status(201).send({link});
			});
		})
		.catch((error) => {
			res.status(500).send(error);
		});
});


questionRouter.put("/edit/:questionId", async (req: Request, res: Response) => {
	try {
		const findQuestion = await utmQuestCollections.Questions?.findOne({
			_id: new ObjectID(req.params.questionId),
		});
		if (!findQuestion) {
			res.status(404).send("No such question found.");
			return;
		}

		const question = {
			link: req.body.link,
			topicId: new ObjectID(req.body.topicId),
			topicName: req.body.topicName,
			courseId: req.body.courseId,
			qnsName: req.body.qnsName,
			qnsType: req.body.qnsType,
			desc: req.body.desc,
			xplan: req.body.xplan,
			choices: req.body.choices,
			ans: req.body.ans,
			authId: req.body.authId,
			authName: req.body.authName,
			date: new Date().toISOString(),
			numDiscussions: req.body.numDiscussions,
			anon: req.body.anon,
			latest: true
		};

		utmQuestCollections.Questions?.insertOne(question)
			.then((result) => {
				if (!result) {
					res.status(500).send("Unable to add new question.");
					return;
				}

				// Set previous question version's latest flag to false
				utmQuestCollections.Questions?.findOneAndUpdate(
					{ _id: new ObjectID(req.body.oldVersion) },
					{ $set: { latest: false } }
				).then((result) => {
					if (!result) {
						res.status(500).send(
							`Unable to update latest flag for ${req.body.oldVersion}`
						);
						return;
					};
					res.status(201).send(result);
				});
			}).catch((error) => {
				res.status(500).send(error);
			});
	} catch (error) {
		res.status(500).send(`ERROR: ${error}`);
	}
});


questionRouter.get("/similar/:topicId/:term", async (req: Request, res: Response) => {
	const { topicId } = req.params;
	const { term } = req.params;

	const result = await utmQuestCollections.Questions?.aggregate([
		{
			$search: {
				index: "duplicate-questions",
				compound: {
					must: [
						{
							equals: {
								path: "topicId",
								value: new ObjectId(topicId),
							},
						},
					],
					should: [
						{
							text: {
								query: term,
								path: ["qnsName", "desc"],
								fuzzy: {
									maxEdits: 2,
								},
							},
						},
					],
				},
				highlight: {
					path: ["qnsName", "desc"],
				},
			},
		},
		{
			$limit: 10,
		},
		{
			$project: {
				_id: 1,
				qnsName: 1,
				desc: 1,
				score: { $meta: "searchScore" },
				highlights: { $meta: "searchHighlights" },
			},
		},
		{
			$match: {
				score: { $gt: 1.0 },
			},
		},
	]).toArray();

	res.status(200).send(result);
});


/******** Currently not being used ********/
// questionRouter.delete("/:questionId", async (req: Request, res: Response) => {
// 	try {
// 		const question = await utmQuestCollections.Questions?.findOne({
// 			_id: new ObjectID(req.params.questionId),
// 		});
// 		if (!question) {
// 			res.status(404).send("Question does not exist");
// 			return;
// 		}

// 		await utmQuestCollections.Questions?.deleteOne({
// 			_id: new ObjectID(req.params.questionId),
// 		});
// 		res.status(202).send("Successfully deleted question");
// 	} catch (error) {
// 		res.status(500).send(`ERROR: ${error}`);
// 	}
// });

export default questionRouter;
