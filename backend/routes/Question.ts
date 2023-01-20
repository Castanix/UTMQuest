import { ObjectID } from "bson";
import { Request, Response, Router } from "express";
import { ObjectId } from "mongodb";
import seedrandom from "seedrandom";
import { utmQuestCollections } from "../db/db.service";
import { qnsTypeEnum, QuestionsType } from "../types/Questions";

const questionRouter = Router();

const updateBadge = async (utorId: string) => {
	const failed = {
		code: 500,
		message: `Update 'qnsEdited' field for badges collection failed. Reverting all changes.`,
		qnsStatus: null,
	};

	return utmQuestCollections.Badges?.findOne({ utorId })
		.then((findRes) => {
			if (!findRes) {
				return {
					code: 404,
					message: `Could not find badge progression for ${utorId}`,
					qnsStatus: null,
				};
			}

			return utmQuestCollections.Badges?.updateOne(findRes, {
				$inc: { qnsEdited: 1 },
			})
				.then((updateRes) => {
					if (!updateRes) {
						return failed;
					}
					return {
						code: 200,
						message: `success`,
						qnsStatus: findRes.qnsEdited + 1,
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
		{ $inc: { numQns: increment ? 1 : -1 } }
	);

	return !!result;
};

// /courses/:courseId/question/:id
questionRouter.get(
	"/allUserPostedQuestions/:utorId",
	async (req: Request, res: Response) => {
		try {
			let questions;

			// visiting your own profile = fetch all contributions
			// visting somebody else's profile = fetch only public contributions
			if (req.params.utorId === req.headers.utorid) {
				questions = await utmQuestCollections.Questions?.find({
					utorId: req.params.utorId,
				}).toArray();
			} else {
				questions = await utmQuestCollections.Questions?.find({
					utorId: req.params.utorId,
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
	"/oneQuestion/:qnsLink",
	async (req: Request, res: Response) => {
		try {
			const question = await utmQuestCollections.Questions?.findOne({
				qnsLink: req.params.qnsLink,
				latest: true,
			});
			if (!question) {
				res.status(404).send("No question found.");
				return;
			}
			const hasRated = (req.headers.utorid as string) in question.rating;

			res.status(200).send({ question, hasRated });
		} catch (error) {
			res.status(500).send(error);
		}
	}
);

questionRouter.get(
	"/allDiscussions/:qnsLink",
	async (req: Request, res: Response) => {
		try {
			const discussions = await utmQuestCollections.Discussions?.findOne({
				qnsLink: req.params.qnsLink,
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

type ScoredQuestion = {
	score: number;
	question: QuestionsType;
};

/* Compute the "helpful" score for each question. 
Score should be prioritized as follows:
	1. Questions with high dislikes should have low (or negative) scores
	2. Questions with high likes should have high scores
	3. Questions should get some bonus based on view count so that questions with repeated views gain higher scores
*/
const ComputeQuestionScore = (question: QuestionsType) => {
	// score metrics
	const { likes, dislikes } = question;
	const totalViews = question.views;
	const uniqueViews = Object.keys(question.viewers).length;

	/* A basic way to compute score */
	// const repeatedViews = totalViews - uniqueViews;
	// return (
	// 	likes * 0.35 +
	// 	uniqueViews * 0.25 +
	// 	repeatedViews * 0.05 -
	// 	dislikes * 0.5
	// );

	let isNan = false;
	if (uniqueViews === 0) isNan = true;

	const engagementScore = !isNan ? (likes - dislikes) / uniqueViews : 0;

	const uniqueViewBonus = uniqueViews * 0.25;
	const repeatedViewBonus = (totalViews - uniqueViews) * 0.15;

	return engagementScore + uniqueViewBonus + repeatedViewBonus;
};

const SortArrayByScore = (q1: ScoredQuestion, q2: ScoredQuestion) => {
	if (q1.score < q2.score) return 1;

	if (q1.score > q2.score) return -1;

	return 0;
};

questionRouter.get(
	"/generateQuiz/:courseId",
	async (req: Request, res: Response) => {
		try {
			const generated = await utmQuestCollections.Questions?.aggregate([
				{
					$match: {
						courseId: req.params.courseId,
						latest: true,
						qnsType: qnsTypeEnum.mc,
					},
				},
				{ $sample: { size: 10 } },
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

			const { utorid: utorId } = req.headers;

			const startingDate = new Date(2000, 1, 1); // starting date for seed
			const currentDate = new Date();

			let diff = currentDate.getTime() - startingDate.getTime();
			const diffInDays = Math.ceil(diff / (1000 * 3600 * 24)).toString();

			// these questions are sorted by score
			const newQuestions: ScoredQuestion[] = [];
			const scoredQuestions: ScoredQuestion[] = [];

			allQuestions?.forEach((question: any) => {
				const randomGen = seedrandom(
					diffInDays + utorId + question._id
				);
				const randomNum = randomGen();
				const showNewQuestions = randomNum <= 1; // chance of people seeing new questions

				const now = new Date();
				diff =
					(now.getTime() - new Date(question.date).getTime()) /
					(60 * 60 * 1000);

				const score = ComputeQuestionScore(question);
				if (diff > 24 || utorId === question.utorId) {
					scoredQuestions.push({ score, question });
				} else if (showNewQuestions) {
					newQuestions.push({ score, question });
				}
			});

			newQuestions.sort(SortArrayByScore);
			scoredQuestions.sort(SortArrayByScore);
			res.status(200).send([
				...newQuestions.map((elem) => elem.question),
				...scoredQuestions.map((elem) => elem.question),
			]);
			return;
		} catch (error) {
			res.status(500).send(error);
		}
	}
);

questionRouter.post("/addQuestion", async (req: Request, res: Response) => {
	// post a new question
	const mongoId = new ObjectID();
	const qnsLink = mongoId.toHexString();
	const topicId = new ObjectID(req.body.topicId);
	const isAnon = req.body.anon;
	const utorId = req.headers.utorid as string;

	const email: string = req.headers.http_mail as string;
	const name = email.split("@")[0].split(".");
	const firstName = name[0].charAt(0).toUpperCase() + name[0].slice(1);
	const lastName =
		name[name.length - 1].charAt(0).toUpperCase() +
		name[name.length - 1].slice(1);

	const question = {
		_id: mongoId,
		qnsLink,
		topicId,
		topicName: req.body.topicName,
		courseId: req.body.courseId,
		qnsName: req.body.qnsName,
		qnsType: req.body.qnsType,
		description: req.body.description,
		explanation: req.body.explanation,
		choices: req.body.choices,
		answers: req.body.answers,
		utorId,
		utorName: isAnon ? "Anonymous" : `${firstName} ${lastName}`,
		date: new Date().toISOString(),
		numDiscussions: req.body.numDiscussions,
		anon: req.body.anon,
		latest: true,
		rating: req.body.rating,
		likes: req.body.likes,
		dislikes: req.body.dislikes,
		views: req.body.views,
		viewers: req.body.viewers,
	};

	const badge = await utmQuestCollections.Badges?.findOne({ utorId });

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
						$inc: { qnsAdded: 1 },
					}).then((updateResult) => {
						if (!updateResult) {
							res.status(500).send(
								"Unable to update badge progression."
							);
							topicIncrementor(topicId, false);
							utmQuestCollections.Questions?.deleteOne(question);
						} else {
							res.status(201).send({
								qnsLink,
								qnsStatus: badge.qnsAdded + 1,
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
							$inc: { consecutivePosting: 1, qnsAdded: 1 },
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
									qnsLink,
									qnsStatus: badge.qnsAdded + 1,
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
							$inc: { qnsAdded: 1 },
						}).then((updateResult) => {
							if (!updateResult) {
								res.status(500).send(
									"Unable to update badge progression."
								);
							} else {
								res.status(201).send({
									qnsLink,
									qnsStatus: badge.qnsAdded + 1,
									consecutivePosting: 1,
									unlockedBadges: badge.unlockedBadges,
									edit: false,
								});
							}
						});
					} else {
						utmQuestCollections.Badges?.updateOne(badge, {
							$inc: { qnsAdded: 1 },
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
									qnsLink,
									qnsStatus: badge.qnsAdded + 1,
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
				res.status(201).send({ qnsLink });
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

		const { qnsLink, restore, anon } = req.body;
		const utorId = req.headers.utorid as string;

		const badge = await utmQuestCollections.Badges?.findOne({
			utorId,
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
			qnsLink,
			topicId: new ObjectID(req.body.topicId),
			topicName: req.body.topicName,
			courseId: req.body.courseId,
			qnsName: req.body.qnsName,
			qnsType: req.body.qnsType,
			description: req.body.description,
			explanation: req.body.explanation,
			choices: req.body.choices,
			answers: req.body.answers,
			utorId,
			utorName: anon ? "Anonymous" : `${firstName} ${lastName}`,
			date: new Date().toISOString(),
			numDiscussions: req.body.numDiscussions,
			anon: req.body.anon,
			latest: true,
			rating: restore ? req.body.rating : {},
			likes: restore ? req.body.likes : 0,
			dislikes: restore ? req.body.dislikes : 0,
			views: restore ? req.body.views : 0,
			viewers: restore ? req.body.viewers : 0,
		};

		if (restore) {
			const restoreVersion = utmQuestCollections.Questions?.findOne({
				_id: req.body._id,
			});
			if (!restoreVersion) {
				res.status(404).send("No restorable version found.");
				return;
			}

			utmQuestCollections.Questions?.updateOne(restoreVersion, {
				$set: { latest: true },
			})
				.then((result) => {
					if (!result) {
						res.status(500).send("Unable update restored version.");
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
						updateBadge(utorId).then((updateRes) => {
							if (!updateRes) {
								updateLatest(oldVersion, true);
								utmQuestCollections.Questions?.deleteOne(
									question
								);
								res.status(500).send(
									"Unable to update badges. Reverting all changes."
								);
								return;
							}
							const { code, message, qnsStatus } = updateRes;

							if (code === 200) {
								res.status(201).send({
									qnsLink,
									qnsStatus,
									unlockedBadges: badge.unlockedBadges,
									edit: true,
								});
							} else {
								res.status(code).send(message);
							}
						});
					} else {
						res.status(201).send({ qnsLink });
					}
				})
				.catch((error) => {
					res.status(500).send(error);
				});
		}

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
					updateBadge(utorId).then((updateRes) => {
						if (!updateRes) {
							updateLatest(oldVersion, true);
							utmQuestCollections.Questions?.deleteOne(question);
							res.status(500).send(
								"Unable to update badges. Reverting all changes."
							);
							return;
						}
						const { code, message, qnsStatus } = updateRes;

						if (code === 200) {
							res.status(201).send({
								qnsLink,
								qnsStatus,
								unlockedBadges: badge.unlockedBadges,
								edit: true,
							});
						} else {
							res.status(code).send(message);
						}
					});
				} else {
					res.status(201).send({ qnsLink });
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
	"/similar/:topicId/:originalQnsId/:term",
	async (req: Request, res: Response) => {
		const { topicId } = req.params;
		const { originalQnsId } = req.params;
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
									path: "qnsLink",
									query: originalQnsId,
								},
							},
						],
						should: [
							{
								text: {
									query: term,
									path: ["qnsName", "description"],
									fuzzy: {
										maxEdits: 2,
									},
								},
							},
						],
					},
					highlight: {
						path: ["qnsName", "description"],
					},
				},
			},
			{
				$limit: 10,
			},
			{
				$project: {
					_id: 1,
					qnsLink: 1,
					qnsName: 1,
					description: 1,
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
	"/editHistory/:qnsLink",
	async (req: Request, res: Response) => {
		utmQuestCollections.Questions?.find({ qnsLink: req.params.qnsLink })
			.sort({ date: -1 })
			.toArray()
			.then((response) => res.status(200).send(response))
			.catch((error) => res.status(500).send(error));
	}
);

const UpdateRatingsCounter = (
	question: QuestionsType,
	utorId: string,
	updatedRating: number // 1 means liked, 0 means disliked
) => {
	if (utorId in question.rating) {
		const currentRating = question.rating[utorId];

		if (currentRating === 1 && updatedRating === 0)
			return {
				likes: -1,
				dislikes: 1,
			};

		if (currentRating === 0 && updatedRating === 1)
			return {
				likes: 1,
				dislikes: -1,
			};

		// don't update anything as rating didn't change
		return { likes: 0, dislikes: 0 };
	}

	// first time rating
	const field = updatedRating === 1 ? "likes" : "dislikes";

	return {
		[field]: 1,
	};
};

questionRouter.put("/rating", async (req: Request, res: Response) => {
	try {
		const question: any = await utmQuestCollections.Questions?.findOne({
			qnsLink: req.body.qnsLink,
			latest: true,
		});
		if (!question) {
			res.status(404).send("No question found.");
			return;
		}
		const user = req.headers.utorid as string;
		if (!user) {
			res.status(401).send("User unauthorized.");
			return;
		}

		const { rate } = req.body;
		const newRating = { ...question.rating, [user]: rate };

		const newUpdate = UpdateRatingsCounter(
			question as QuestionsType,
			user,
			rate
		);

		utmQuestCollections.Questions?.updateOne(question, {
			$set: { rating: newRating },
			$inc: newUpdate,
		}).then((updateRes) => {
			if (!updateRes) {
				res.status(500).send("Unable to update rating");
				return;
			}
			res.status(200).send(updateRes);
		});
	} catch (error) {
		res.status(500).send(error);
	}
});

questionRouter.put(
	"/incrementView/:qnsLink",
	async (req: Request, res: Response) => {
		const question = await utmQuestCollections.Questions?.findOne({
			qnsLink: req.params.qnsLink,
			latest: true,
		});

		if (!question) {
			res.status(404).send({ error: "Could not find question." });
			return;
		}

		const utorId = req.headers.utorid as string;
		const uniqueViewers = question.viewers;
		if (!(utorId in uniqueViewers)) uniqueViewers[utorId] = 1;

		utmQuestCollections.Questions?.findOneAndUpdate(
			{ qnsLink: req.params.qnsLink, latest: true },
			{ $inc: { views: 1 }, $set: { viewers: uniqueViewers } }
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
