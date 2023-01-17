import { ObjectID } from "bson";
import { Request, Response, Router } from "express";
import { ObjectId } from "mongodb";
import seedrandom from "seedrandom";
import { utmQuestCollections } from "../db/db.service";
import { qnsTypeEnum } from "../types/Questions";

const questionRouter = Router();

const updateBadge = async (utorid: string) => {
	const failed = {
		code: 500,
		message: `Update 'questionsEdited' field for badges collection failed. Reverting all changes.`,
		questionStatus: null,
	};

	return utmQuestCollections.Badges?.findOne({ utorid })
		.then((findRes) => {
			if (!findRes) {
				return {
					code: 404,
					message: `Could not find badge progression for ${utorid}`,
					questionStatus: null,
				};
			}

			return utmQuestCollections.Badges?.updateOne(findRes, {
				$inc: { questionsEdited: 1 },
			})
				.then((updateRes) => {
					if (!updateRes) {
						return failed;
					}
					return {
						code: 200,
						message: `success`,
						questionStatus: findRes.questionsEdited + 1,
					};
				})
				.catch(() => failed);
		})
		.catch(() => failed);
};

const updateLatest = (question: any, set: boolean) => {
	const result = utmQuestCollections.Questions?.updateOne(question, {
		$set: { latest: set },
	});

	return !!result;
};

const topicIncrementor = (topicId: ObjectID, increment: boolean) => {
	const result = utmQuestCollections.Topics?.findOneAndUpdate(
		{ _id: topicId },
		{ $inc: { numQuestions: increment ? 1 : -1 } }
	);

	return !!result;
};

// /courses/:courseId/question/:id
questionRouter.get(
	"/allUserPostedQuestions/:utorid",
	async (req: Request, res: Response) => {
		try {
			let questions;

			// visiting your own profile = fetch all contributions
			// visting somebody else's profile = fetch only public contributions
			if (req.params.utorid === req.headers.utorid) {
				questions = await utmQuestCollections.Questions?.find({
					authId: req.params.utorid,
				}).toArray();
			} else {
				questions = await utmQuestCollections.Questions?.find({
					authId: req.params.utorid,
					anon: false,
				}).toArray();
			}

			if (!questions) {
				res.status(404).send("No question found.");
				return;
			}
			res.status(200).send(questions);
		} catch (error) {
			res.status(500).send(error);
		}
	}
);

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
			const hasRated = req.headers.utorid as string in question.rating;

			res.status(200).send({question, hasRated});
		} catch (error) {
			res.status(500).send(error);
		}
	}
);

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

questionRouter.get(
	"/generateQuiz/:courseId",
	async (req: Request, res: Response) => {
		try {
			const generated = await utmQuestCollections.Questions?.aggregate([
				{ $match: { 
					courseId: req.params.courseId,
					latest: true,
					qnsType: qnsTypeEnum.mc
				}},
				{ $sample: { size: 10 } }
			]).toArray();

			res.status(200).send(generated);
			return;
		} catch (error) {
			res.status(500).send(error);
		}
	}
);

questionRouter.get(
	"/latestQuestions/:courseId",
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

			const { utorid } = req.headers;

			const startingDate = new Date(2000, 1, 1); // starting date for seed
			const currentDate = new Date();

			let diff = currentDate.getTime() - startingDate.getTime();
			const diffInDays = Math.ceil(diff / (1000 * 3600 * 24)).toString();

			const randomGen = seedrandom(diffInDays + utorid);
			const randomNum = randomGen();
			const showNewQuestions = randomNum <= 1;

			const newArr = allQuestions?.filter((question) => {
				const now = new Date();
				diff =
					(now.getTime() - new Date(question.date).getTime()) /
					(60 * 60 * 1000);

				if (diff > 24 || utorid === question.authId) {
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
	const topicId = new ObjectID(req.body.topicId);
	const isAnon = req.body.anon;
	const utorid = req.headers.utorid as string;

	const email: string = req.headers.http_mail as string;
	const name = email.split("@")[0].split(".");
	const firstName = name[0].charAt(0).toUpperCase() + name[0].slice(1);
	const lastName =
		name[name.length - 1].charAt(0).toUpperCase() +
		name[name.length - 1].slice(1);

	const question = {
		_id: mongoId,
		link,
		topicId,
		topicName: req.body.topicName,
		courseId: req.body.courseId,
		qnsName: req.body.qnsName,
		qnsType: req.body.qnsType,
		desc: req.body.desc,
		xplan: req.body.xplan,
		choices: req.body.choices,
		ans: req.body.ans,
		authId: utorid,
		authName: isAnon ? "Anonymous" : `${firstName} ${lastName}`,
		date: new Date().toISOString(),
		numDiscussions: req.body.numDiscussions,
		anon: req.body.anon,
		latest: true,
		rating: req.body.rating,
		views: req.body.views,
	};

	const badge = await utmQuestCollections.Badges?.findOne({ utorid });

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
			const isIncremented = topicIncrementor(topicId, true);
			if (!isIncremented) {
				res.status(500).send(
					`Unable to increment numQuestions for ${req.body.topicName}`
				);
				utmQuestCollections.Questions?.deleteOne(question);
				return;
			}

			// Update badge progression
			if (!question.anon) {
				const now = new Date();

				if (badge.firstPostToday === "") {
					utmQuestCollections.Badges?.updateOne(badge, {
						$set: {
							firstPostToday: now.toISOString(),
							consecutivePosting: 1,
						},
						$inc: { questionsAdded: 1 },
					}).then((updateResult) => {
						if (!updateResult) {
							res.status(500).send(
								"Unable to update badge progression."
							);
							topicIncrementor(topicId, false);
							utmQuestCollections.Questions?.deleteOne(question);
						} else {
							res.status(201).send({
								link,
								questionStatus: badge.questionsAdded + 1,
								consecutivePosting: 1,
								unlockedBadges: badge.unlockedBadges,
								edit: false,
							});
						}
					});
				} else {
					const currTime = now.getTime() / (60 * 60 * 1000);
					const lastPostTime =
						Date.parse(badge.firstPostToday) / (60 * 60 * 1000);
					const timeDiff = currTime - lastPostTime;

					if (
						timeDiff < 48 &&
						timeDiff > 24 &&
						badge.consecutivePosting < 7
					) {
						utmQuestCollections.Badges?.updateOne(badge, {
							$set: { firstPostToday: now.toISOString() },
							$inc: { consecutivePosting: 1, questionsAdded: 1 },
						}).then((updateResult) => {
							if (!updateResult) {
								res.status(500).send(
									"Unable to update badge progression."
								);
								topicIncrementor(topicId, false);
								utmQuestCollections.Questions?.deleteOne(
									question
								);
							} else {
								res.status(201).send({
									link,
									questionStatus: badge.questionsAdded + 1,
									consecutivePosting:
										badge.consecutivePosting + 1,
									unlockedBadges: badge.unlockedBadges,
									edit: false,
								});
							}
						});
					} else if (timeDiff > 48 && badge.consecutivePosting < 7) {
						utmQuestCollections.Badges?.updateOne(badge, {
							$set: {
								firstPostToday: now.toISOString(),
								consecutivePosting: 1,
							},
							$inc: { questionsAdded: 1 },
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
									unlockedBadges: badge.unlockedBadges,
									edit: false,
								});
							}
						});
					} else {
						utmQuestCollections.Badges?.updateOne(badge, {
							$inc: { questionsAdded: 1 },
						}).then((incrementResult) => {
							if (!incrementResult) {
								res.status(500).send(
									"Unable to increment questionsAdded for badge progression."
								);
								topicIncrementor(topicId, false);
								utmQuestCollections.Questions?.deleteOne(
									question
								);
							} else {
								res.status(201).send({
									link,
									questionStatus: badge.questionsAdded + 1,
									consecutivePosting:
										badge.consecutivePosting,
									unlockedBadges: badge.unlockedBadges,
									edit: false,
								});
							}
						});
					}
				}
			} else {
				res.status(201).send({ link });
			}
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

		const { link, restore, anon } = req.body;
		const utorid = req.headers.utorid as string;

		const badge = await utmQuestCollections.Badges?.findOne({
			utorid,
		});

		if (!badge) {
			res.status(404).send("Could not find badge progression for user.");
			return;
		}

		const email: string = req.headers.http_mail as string;
		const name = email.split("@")[0].split(".");
		const firstName = name[0].charAt(0).toUpperCase() + name[0].slice(1);
		const lastName =
			name[name.length - 1].charAt(0).toUpperCase() +
			name[name.length - 1].slice(1);
		
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
			authId: utorid,
			authName: anon ? "Anonymous" : `${firstName} ${lastName}`,
			date: new Date().toISOString(),
			numDiscussions: req.body.numDiscussions,
			anon: req.body.anon,
			latest: true,
			rating: restore ? req.body.rating : {},
			views: restore ? req.body.views : 0,
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
				if (!latestStatus) {
					utmQuestCollections.Questions?.deleteOne(question);
					res.status(500).send(
						`Update 'latest' flag for previous question failed. Reverting any changes.`
					);
					return;
				}

				// Attempts to update badge progression for specified utorid, reverts all changes if failed
				if (!req.body.anon) {
					updateBadge(utorid).then((updateRes) => {
						if (!updateRes) {
							updateLatest(oldVersion, true);
							utmQuestCollections.Questions?.deleteOne(question);
							res.status(500).send(
								"Unable to update badges. Reverting all changes."
							);
							return;
						}
						const { code, message, questionStatus } = updateRes;

						if (code === 200) {
							res.status(201).send({
								link,
								questionStatus,
								unlockedBadges: badge.unlockedBadges,
								edit: true,
							});
						} else {
							res.status(code).send(message);
						}
					});
				} else {
					res.status(201).send({ link });
				}
			})
			.catch((error) => {
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

questionRouter.put("/rating",
	async (req: Request, res: Response) => {
		try {
			const question = await utmQuestCollections.Questions?.findOne({
				link: req.body.link,
				latest: true,
			});
			if (!question) {
				res.status(404).send("No question found.");
				return;
			}
			const user = req.headers.utorid;
			if(!user) {
				res.status(404).send("User unauthorized.");
				return;
			}
			const { rate } = req.body;
			const newRating = {...question.rating, [user as string]: rate};

			utmQuestCollections.Questions?.updateOne(question, {
				$set: { rating: newRating }
			}).then(updateRes => {
				if(!updateRes) {
					res.status(500).send("Unable to update rating");
					return;
				};
				res.status(200).send(updateRes);
			});
		} catch (error) {
			res.status(500).send(error);
		}
	}
);

questionRouter.put(
	"/incrementView/:link",
	async (req: Request, res: Response) => {
		utmQuestCollections.Questions?.findOneAndUpdate(
			{ link: req.params.link, latest: true },
			{ $inc: { views: 1 } }
		)
			.then((result) => {
				if (result.value == null)
					res.status(404).send({
						error: "Unable to increment view count",
					});
			})
			.then((response) => {
				res.status(200).send(response);
			})
			.catch((error) => {
				res.status(500).send({ error: error.message });
			});
	}
);

/** ****** Currently not being used ******* */
// questionRouter.get("/getRating/:link",
// 	async (req: Request, res: Response) => {
// 		try {
// 			const question = await utmQuestCollections.Questions?.findOne({
// 				link: req.params.link,
// 				latest: true,
// 			});

// 			if (!question) {
// 				res.status(404).send("No question found.");
// 				return;
// 			};

// 			const { rating } = question;
// 			const likes = Object.values(rating).reduce((a, b) => (a as number) + (b as number)) as number;
// 			const dislikes = Object.keys(rating).length - likes;

// 			res.status(200).send({ likes, dislikes });
// 		} catch (error) {
// 			res.status(500).send(error);
// 		}
// 	}
// );


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
