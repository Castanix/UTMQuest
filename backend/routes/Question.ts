import { ObjectID } from "bson";
import { Request, Response, Router } from "express";
import { ObjectId } from "mongodb";
import { utmQuestCollections } from "../db/db.service";

const questionRouter = Router();

questionRouter.get("/:questionId", async (req: Request, res: Response) => {
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

questionRouter.get(
	"/allDiscussions/:questionId",
	async (req: Request, res: Response) => {
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
	}
);

questionRouter.get(
	"/:courseId/:status",
	async (req: Request, res: Response) => {
		try {
			if (req.params.status === "approved") {
				const approvedQuestions =
					await utmQuestCollections.Questions?.find({
						courseId: req.params.courseId,
						qnsStatus: req.params.status,
					}).toArray();
				res.status(200).send(approvedQuestions);
				return;
			}

			if (req.params.status === "pending") {
				const pendingQuestions =
					await utmQuestCollections.Questions?.find({
						courseId: req.params.courseId,
						qnsStatus: req.params.status,
					}).toArray();
				res.status(200).send(pendingQuestions);
				return;
			}

			res.status(400).send("Invalid status id");
		} catch (error) {
			res.status(500).send(error);
		}
	}
);

questionRouter.get(
	"/reviewStatus/:questionId",
	async (req: Request, res: Response) => {
		try {
			const question = await utmQuestCollections.Questions?.findOne({
				_id: new ObjectID(req.params.questionId),
			});
			if (!question) {
				res.status(404).send(`Error: Unable to find question`);
				return;
			}
			res.json(question.reviewStatus);
		} catch (error) {
			res.status(500).send(`ERROR: ${error}`);
		}
	}
);

questionRouter.put(
	"/reviewStatus/:questionId",
	async (req: Request, res: Response) => {
		try {
			const question = await utmQuestCollections.Questions?.findOne({
				_id: new ObjectID(req.params.questionId),
			});
			if (!question) {
				res.status(404).json(`Error: Unable to find question`);
				return;
			}
			await utmQuestCollections.Questions?.updateOne(
				{ _id: new ObjectID(req.params.questionId) },
				{ $set: { qnsStatus: "approved" } }
			);
			res.status(204).send("Successfully updated to approved");
		} catch (error) {
			res.status(500).send(`ERROR: ${error}`);
		}
	}
);

questionRouter.post("/addQuestion", async (req: Request, res: Response) => {
	// post a new question
	const today = new Date();
	const dd = String(today.getDate()).padStart(2, "0");
	const mm = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
	const yyyy = today.getFullYear();

	const question = {
		topicId: new ObjectID(req.body.topicId),
		topicName: req.body.topicName,
		courseId: req.body.courseId,
		qnsName: req.body.qnsName,
		qnsStatus: req.body.qnsStatus,
		reviewStatus: req.body.reviewStatus,
		qnsType: req.body.qnsType,
		desc: req.body.desc,
		xplan: req.body.xplan,
		choices: req.body.choices,
		ans: req.body.ans,
		authId: req.body.authId,
		authName: req.body.authName,
		date: `${mm}/${dd}/${yyyy}`,
		numDiscussions: req.body.numDiscussions,
		anon: req.body.anon,
		snapshot: null,
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
				{ $inc: { numPending: 1 } }
			).then((incrementResult) => {
				if (!incrementResult) {
					res.status(500).send(
						`Unable to increment numPending for ${req.body.topicName}`
					);
					return;
				}
				res.status(201).send(result);
			});
		})
		.catch((error) => {
			res.status(500).send(error);
		});
});

questionRouter.put("/:questionId", async (req: Request, res: Response) => {
	try {
		const findQuestion = await utmQuestCollections.Questions?.findOne({
			_id: new ObjectID(req.params.questionId),
		});
		if (!findQuestion) {
			res.status(404).send("No such question found.");
			return;
		}

		const today = new Date();
		const dd = String(today.getDate()).padStart(2, "0");
		const mm = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
		const yyyy = today.getFullYear();
		const question = {
			qnsName: req.body.qsnName,
			qnsStatus: req.body.qnsStatus,
			reviewStatus: req.body.reviewStatus,
			qnsType: req.body.qnsType,
			desc: req.body.desc,
			xplan: req.body.xplan,
			choices: req.body.choices,
			ans: req.body.ans,
			authId: req.body.authId,
			authName: req.body.authName,
			date: `${mm}/${dd}/${yyyy}`,
			snapshot: new ObjectID(), // -> need to update this
		};

		await utmQuestCollections.Questions?.updateOne(
			{ _id: new ObjectID(req.params.questionId) },
			{ $set: question }
		)
			.then((result) => {
				if (!result) {
					res.status(400).send(result);
					return;
				}
				res.status(200).send("Succesfully updated question");
			})
			.catch((error) => {
				console.log(error);
			});
	} catch (error) {
		res.status(500).send(`ERROR: ${error}`);
	}
});

questionRouter.delete("/:questionId", async (req: Request, res: Response) => {
	try {
		const question = await utmQuestCollections.Questions?.findOne({
			_id: new ObjectID(req.params.questionId),
		});
		if (!question) {
			res.status(404).send("Question does not exist");
			return;
		}

		await utmQuestCollections.Questions?.deleteOne({
			_id: new ObjectID(req.params.questionId),
		});
		res.status(202).send("Successfully deleted question");
	} catch (error) {
		res.status(500).send(`ERROR: ${error}`);
	}
});

questionRouter.get(
	"/similar/:topicId/:term",
	async (req: Request, res: Response) => {
		const topicId = req.params.topicId;
		const term = req.params.term;

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
	}
);

export default questionRouter;
