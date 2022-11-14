import { ObjectID } from "bson";
import { Request, Response, Router } from "express";
import { ObjectId } from "mongodb";
import seedrandom from "seedrandom";
import { utmQuestCollections } from "../db/db.service";

const questionRouter = Router();

const updateBadge = async (utorid: string) => {
	const failed = {code: 500, message: `Update 'questionsEdited' field for badges collection failed. Reverting all changes.`, questionStatus: null};

	return utmQuestCollections.Badges?.findOne({ utorid })
		.then(findRes => {
			if(!findRes){
				return {code: 404, message: `Could not find badge progression for ${utorid}`, questionStatus: null};
			};

			return utmQuestCollections.Badges?.updateOne(
				findRes,
				{ $inc: {questionsEdited: 1} }
			).then(updateRes => {
				if(!updateRes) {
					return failed;
				};
				return {code: 200, message: `success`, questionStatus: findRes.questionsEdited + 1};
			}).catch(() => failed);

		}).catch(() => failed);
};

const updateLatest = (question: any, set: boolean) => {
	const result = utmQuestCollections.Questions?.updateOne(
		question,
		{ $set: {latest: set} }
	);

	return !!result;
};

// /courses/:courseId/question/:id
questionRouter.get('/allPostedQuestions/:utorid', async (req: Request, res: Response) => {
    try {
        const questions = await utmQuestCollections.Questions?.find({ authId: req.params.utorid }).toArray();
        if (!questions) { 
            res.status(404).send("No question found.");
            return;
        }
        res.status(200).send(questions);
    } catch (error) {
        res.status(500).send(error);
    }
});

// "/:questionId"
questionRouter.get(
	"/oneQuestion/:link",
	async (req: Request, res: Response) => {
		try {
			const question = await utmQuestCollections.Questions?.findOne({
				link: req.params.link,
				latest: true,
			});
			if (!question) {
				res.status(404).send("No question found.");
				return;
			}
			res.status(200).send(question);
		} catch (error) {
			res.status(500).send(error);
		}
	}
);

<<<<<<< HEAD
// /:courseId/:qnsStatus
=======
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
			res.status(500).send(error);
		}
	}
);


>>>>>>> Design profile layout
questionRouter.get(
	"/latestQuestions/:courseId/:utorid",
	async (req: Request, res: Response) => {
		try {
			const allQuestions = await utmQuestCollections.Questions?.find({
				courseId: req.params.courseId,
				latest: true,
			})
				.sort({ date: -1 })
				.toArray();

			/* Create a seed using the number of days between today     */
			/* and the startingDate. This will allow different people   */
			/* to view new questions daily.					  			*/

			const author = req.params.utorid;

			const startingDate = new Date(2000, 1, 1); // starting date for seed
			const currentDate = new Date();

			let diff = currentDate.getTime() - startingDate.getTime();
			const diffInDays = Math.ceil(diff / (1000 * 3600 * 24)).toString();

			const randomGen = seedrandom(diffInDays + author);
			const randomNum = randomGen();
			const showNewQuestions = randomNum <= 0.25;

			const newArr = allQuestions?.filter((question) => {
				const now = new Date();
				diff =
					(now.getTime() - new Date(question.date).getTime()) /
					(60 * 60 * 1000);

				if (diff > 24 || author === question.authId) {
					return true;
				}
				if (showNewQuestions) {
					return true;
				}
				return false;
			});

			res.status(200).send(newArr);
			return;
		} catch (error) {
			res.status(500).send(error);
		}
	}
);

questionRouter.post("/addQuestion", async (req: Request, res: Response) => {
	// post a new question
	const mongoId = new ObjectID();
	const link = mongoId.toHexString();

	const question = {
		_id: mongoId,
		link,
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
		latest: true,
	};

	const badge = await utmQuestCollections.Badges?.findOne({
		utorid: question.authId,
	});

	if (!badge) {
		res.status(404).send("Could not find badge progression for user.");
		return;
	}

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
					
				}
			});

			// Update badge progression
			if (!question.anon) {
				const now = new Date();
				
				if(badge.firstPostToday === "") {
					utmQuestCollections.Badges?.updateOne(badge, {
						$set: { firstPostToday: now.toISOString(),
								consecutivePosting: 1 },
						$inc: { questionsAdded: 1 }
					}).then((updateResult) => {
						if (!updateResult) {
							res.status(500).send(
								"Unable to update badge progression."
							);
						} else {
							res.status(201).send({
								link,
								questionStatus: badge.questionsAdded + 1,
								consecutivePosting: 1,
								edit: false
							});
						}
					});
				} else {
					const currTime = now.getTime() / (60 * 60 * 1000);
					const lastPostTime = Date.parse(badge.firstPostToday) / (60 * 60 * 1000);
					const timeDiff = currTime - lastPostTime;

					if(timeDiff < 48 && timeDiff > 24 && badge.consecutivePosting < 7) {
						utmQuestCollections.Badges?.updateOne(badge, {
							$set: { firstPostToday: now.toISOString() },
							$inc: { consecutivePosting: 1,
									questionsAdded: 1 }
						}).then((updateResult) => {
							if (!updateResult) {
								res.status(500).send(
									"Unable to update badge progression."
								);
							} else {
								res.status(201).send({
									link,
									questionStatus: badge.questionsAdded + 1,
									consecutivePosting: badge.consecutivePosting + 1,
									edit: false
								});
							}
						});
					} else if (timeDiff > 48 && badge.consecutivePosting < 7) {
						utmQuestCollections.Badges?.updateOne(badge, {
							$set: { firstPostToday: now.toISOString(),
									consecutivePosting: 1 },
							$inc: { questionsAdded: 1 }
						}).then((updateResult) => {
							if (!updateResult) {
								res.status(500).send(
									"Unable to update badge progression."
								);
							} else {
								res.status(201).send({
									link,
									questionStatus: badge.questionsAdded + 1,
									consecutivePosting: 1,
									edit: false
								});
							}
						});
					} else {
						utmQuestCollections.Badges?.updateOne(badge, {
							$inc: { questionsAdded: 1 }
						}).then((incrementResult) => {
							if (!incrementResult) {
								res.status(500).send(
									"Unable to increment questionsAdded for badge progression."
								);
							} else {
								res.status(201).send({
									link,
									questionStatus: badge.questionsAdded + 1,
									edit: false
								});
							}
						});
					}
				}
			} else {
				res.status(201).send({ link });
			};


		})
		.catch((error) => {
			res.status(500).send(error);
		});
});

questionRouter.post("/editQuestion", async (req: Request, res: Response) => {
	try {
		const oldVersion = await utmQuestCollections.Questions?.findOne({
			_id: new ObjectID(req.body.oldVersion),
			latest: true,
		});
		if (!oldVersion) {
			res.status(404).send("No such latest question found.");
			return;
		}

		const { link } = req.body;

		const question = {
			link,
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
			latest: true,
		};

		// Add edited questions doc into db
		utmQuestCollections.Questions?.insertOne(question)
			.then((result) => {
				if (!result) {
					res.status(500).send("Unable to add new question.");
					return;
				}

				// Attempts to update latest from old questions doc, reverts any changes if failed
				const latestStatus = updateLatest(oldVersion, false);
				if(!latestStatus) {
					utmQuestCollections.Questions?.deleteOne(question);
					res.status(500).send(`Update 'latest' flag for previous question failed. Reverting any changes.`);
					return;
				};

				// Attempts to update badge progression for specified utorid, reverts all changes if failed
				if(!req.body.anon) {
					updateBadge(req.body.authId).then(updateRes => {
						if(!updateRes) {
							updateLatest(oldVersion, true);
							utmQuestCollections.Questions?.deleteOne(question);
							res.status(500).send("Unable to update badges. Reverting all changes.");
							return;
						}
						const {code, message, questionStatus} = updateRes;

						if(code === 200) {
							res.status(201).send({ link, questionStatus, edit: true });
						} else {
							res.status(code).send(message);
						};
						
					});
				} else {
					res.status(201).send({ link });
				}
			}).catch((error) => {
				res.status(500).send(error);
			});
	} catch (error) {
		res.status(500).send(`ERROR: ${error}`);
	}
});

questionRouter.get(
	"/similar/:topicId/:originalQuestionId/:term",
	async (req: Request, res: Response) => {
		const { topicId } = req.params;
		const { originalQuestionId } = req.params;
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
							{
								equals: {
									path: "latest",
									value: true,
								},
							},
						],
						mustNot: [
							{
								text: {
									path: "link",
									query: originalQuestionId,
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
					link: 1,
					qnsName: 1,
					desc: 1,
					score: { $meta: "searchScore" },
					highlights: { $meta: "searchHighlights" },
				},
			},
			{
				$match: {
					score: { $gt: 1.0 },
					highlights: { $exists: true, $ne: [] },
				},
			},
		]).toArray();

		res.status(200).send(result);
	}
);

questionRouter.get(
	"/editHistory/:link",
	async (req: Request, res: Response) => {
		utmQuestCollections.Questions?.find({ link: req.params.link })
			.sort({ date: -1 })
			.toArray()
			.then((response) => res.status(200).send(response))
			.catch((error) => res.status(500).send(error));
	}
);



/** ****** Currently not being used ******* */
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
