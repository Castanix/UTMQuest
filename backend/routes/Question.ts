import { ObjectID } from "bson";
import { Request, Response, Router } from "express";
import { ClientSession, ObjectId } from "mongodb";
import seedrandom from "seedrandom";
import { utmQuestCollections, mongoDBConnection } from "../db/db.service";
import { qnsTypeEnum, QuestionBackEndType } from "../types/Questions";
import redisClient from "../redis/setup";
import { DEFAULT_MAX_VERSION } from "tls";

const questionRouter = Router();

// badgeType: qnsEdited/qnsAdded
const updateBadge = (utorId: string, update: Object, session: ClientSession) =>
	utmQuestCollections.Badges?.findOneAndUpdate({ utorId }, update, {
		session,
	})
		.then((result) => {
			if (!result) {
				throw new Error("Error updating badge progression");
			}

			return result;
		})
		.catch((err: Error) => err);

const updateLatest = (
	question: QuestionBackEndType,
	latest: boolean,
	session: ClientSession
) =>
	utmQuestCollections.Questions?.updateOne(
		question,
		{ $set: { latest } },
		{ session }
	)
		.then((result) => {
			if (!result) {
				throw new Error("Error updating latest flag");
			}

			return result;
		})
		.catch((err: Error) => err);

const topicIncrementor = (
	topicId: ObjectID,
	increment: number,
	session: ClientSession
) =>
	utmQuestCollections.Topics?.findOneAndUpdate(
		{ _id: topicId },
		{ $inc: { numQns: increment } },
		{ session }
	)
		.then((result) => {
			if (!result) {
				throw new Error("Error incrementing topic");
			}

			return result;
		})
		.catch((err: Error) => err);

/* Remove fields from question. Utorid is removed by default as the client side uses userId.
   Additionally, if the question is anon, send back anonId instead of userId */
const RemoveFieldsFromQuestion = (question: QuestionBackEndType) => {
	const { utorId: _, ...returnObj } = question; // remove utorId from return obj

	if (question.anon) {
		const { userId: _ignore, ...rest } = returnObj;

		return rest;
	}

	const { anonId: _ignore, ...rest } = returnObj;

	return rest;
};

// /courses/:courseId/question/:id
questionRouter.get(
	"/allUserPostedQuestions/:userId",
	async (req: Request, res: Response) => {
		try {
			let questions;

			const { userId } = req.params;

			const user = await utmQuestCollections.Accounts?.findOne({
				utorId: req.headers.utorid,
			});

			if (!user) {
				res.status(404).send({ error: "Could not find user" });
				return;
			}

			// visiting your own profile = fetch all contributions
			// visting somebody else's profile = fetch only public contributions
			if (userId === user.userId) {
				questions = await utmQuestCollections.Questions?.find({
					userId,
				}).toArray();
			} else {
				questions = await utmQuestCollections.Questions?.find({
					userId,
					anon: false,
				}).toArray();
			}

			if (!questions) {
				res.status(404).send({ error: "No question found." });
				return;
			}
			res.status(200).send([
				...questions.map((elem) =>
					RemoveFieldsFromQuestion(elem as QuestionBackEndType)
				),
			]);
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
			const utorId = req.headers.utorid as string;
			const user = await utmQuestCollections.Accounts?.findOne({
				utorId,
			});

			const document = await utmQuestCollections.Questions?.findOne({
				qnsLink: req.params.qnsLink,
				latest: true,
			});
			if (!document || !user) {
				res.status(404).end();
				return;
			}

			const hasRated = user.userId in document.rating;
			const question = RemoveFieldsFromQuestion(
				document as QuestionBackEndType
			);

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
				res.status(404).send({ error: "Cannot find discussion" });
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
	question: QuestionBackEndType;
};

/* Compute the "helpful" score for each question. 
Score should be prioritized as follows:
	1. Questions with high dislikes should have low (or negative) scores
	2. Questions with high likes should have high scores
	3. Questions should get some bonus based on view count so that questions with repeated views gain higher scores
*/
const ComputeQuestionScore = (question: QuestionBackEndType) => {
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
	"/generateQuiz/:courseId/:topicsGen/:numQnsGen",
	async (req: Request, res: Response) => {
		const { courseId, topicsGen, numQnsGen } = req.params;

		const topicsGenArr = JSON.parse(topicsGen);

		const baseMatch = {
			courseId,
			latest: true,
			qnsType: qnsTypeEnum.mc,
			$expr: {
				$gte: [
					{
						$divide: [
							{ $sum: ["$likes", 1] },
							{ $sum: [{ $sum: ["$likes", "$dislikes"] }, 1] },
						],
					},
					0.5,
				],
			},
		};

		const match = {
			$match:
				topicsGenArr.length === 0
					? baseMatch
					: {
							...baseMatch,
							topicName: { $in: topicsGenArr },
					  },
		};

		try {
			const generated = await utmQuestCollections.Questions?.aggregate([
				match,
				{ $sample: { size: Number(numQnsGen) } },
			]).toArray();

			if (!generated) res.status(200).send([]);
			else
				res.status(200).send([
					...generated.map((elem) =>
						RemoveFieldsFromQuestion(elem as QuestionBackEndType)
					),
				]);
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
			const redisData = await redisClient.get(`questions${req.params.courseId}`)
				.catch((error) => {
					if (error) console.error(error);
				});
			
			/* Create a seed using the number of days between today     */
			/* and the startingDate. This will allow different people   */
			/* to view new questions daily.					  			*/

			const { utorid: utorId } = req.headers;

			const startingDate = new Date(2000, 1, 1); // starting date for seed
			const currentDate = new Date();

			let diff = currentDate.getTime() - startingDate.getTime();
			const diffInDays = Math.ceil(diff / (1000 * 3600 * 24)).toString();

			if (redisData != null) {

				// Need to pull questions that are new
				const allNewQuestions = await utmQuestCollections.Questions?.find({
					courseId: req.params.courseId,
					latest: true,
					date: { $gte: new Date(Date.now() - 246060*1000).toISOString() }
				})
					.sort({ date: -1 })
					.toArray();

				const newQuestions: ScoredQuestion[] = [];
				
				allNewQuestions?.forEach((question: any) => {
					const randomGen = seedrandom(
						diffInDays + utorId + question._id
					);

					const randomNum = randomGen();
					const showNewQuestions = randomNum <= 1; // chance of people seeing new questions

					if (showNewQuestions) {
						const score = ComputeQuestionScore(question);
						newQuestions.push({ score, question });
					}
				});

				res.status(200).send([
					...newQuestions.map((elem) => RemoveFieldsFromQuestion(elem.question)),
					...redisData
				]);
			} else {
				const allQuestions = await utmQuestCollections.Questions?.find({
					courseId: req.params.courseId,
					latest: true,
				})
					.sort({ date: -1 })
					.toArray();
	
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

				const newQuestionsR = newQuestions.map((elem) => RemoveFieldsFromQuestion(elem.question));
				const scoredQuestionsR = scoredQuestions.map((elem) => RemoveFieldsFromQuestion(elem.question));
				

				redisClient.set(`questions${req.params.courseId}`, JSON.stringify(scoredQuestionsR));
				// const todayEnd = new Date().setHours(23, 59, 59, 999);
				// redisClient.expireAt(`questions${req.params.courseId}`, todayEnd/1000);
				redisClient.expire(`questions${req.params.courseId}`, 86400);

				res.status(200).send([
					...newQuestionsR,
					...scoredQuestionsR
				]);
				return;
			}
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
		userId: req.body.userId,
		anonId: req.body.anonId,
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
		res.status(404).send({
			error: "Could not find badge progression for user.",
		});
		return;
	}

	const session = mongoDBConnection.startSession();

	try {
		session.startTransaction();

		await utmQuestCollections.Questions?.insertOne(question, { session });

		// Increment counter
		await topicIncrementor(topicId, 1, session);

		// Update badge progression
		if (!question.anon) {
			const now = new Date();

			if (badge.firstPostToday === "") {
				await updateBadge(
					utorId,
					{
						$set: {
							firstPostToday: now.toISOString(),
							consecutivePosting: 1,
						},
						$inc: { qnsAdded: 1 },
					},
					session
				);

				await session.commitTransaction();

				res.status(201).send({
					qnsLink,
					qnsStatus: badge.qnsAdded + 1,
					consecutivePosting: 1,
					unlockedBadges: badge.unlockedBadges,
					edit: false,
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
					await updateBadge(
						utorId,
						{
							$set: { firstPostToday: now.toISOString() },
							$inc: { consecutivePosting: 1, qnsAdded: 1 },
						},
						session
					);

					await session.commitTransaction();

					res.status(201).send({
						qnsLink,
						qnsStatus: badge.qnsAdded + 1,
						consecutivePosting: badge.consecutivePosting + 1,
						unlockedBadges: badge.unlockedBadges,
						edit: false,
					});
				} else if (timeDiff > 48 && badge.consecutivePosting < 7) {
					await updateBadge(
						utorId,
						{
							$set: {
								firstPostToday: now.toISOString(),
								consecutivePosting: 1,
							},
							$inc: { qnsAdded: 1 },
						},
						session
					);

					await session.commitTransaction();

					res.status(201).send({
						qnsLink,
						qnsStatus: badge.qnsAdded + 1,
						consecutivePosting: 1,
						unlockedBadges: badge.unlockedBadges,
						edit: false,
					});
				} else {
					await updateBadge(
						utorId,
						{ $inc: { qnsAdded: 1 } },
						session
					);

					await session.commitTransaction();

					res.status(201).send({
						qnsLink,
						qnsStatus: badge.qnsAdded + 1,
						consecutivePosting: badge.consecutivePosting,
						unlockedBadges: badge.unlockedBadges,
						edit: false,
					});
				}
			}
		} else {
			await session.commitTransaction();
			res.status(201).send({ qnsLink });
		}
	} catch (err) {
		await session.abortTransaction();

		res.status(500).send({ err });
	} finally {
		await session.endSession();
	}
});

questionRouter.post("/editQuestion", async (req: Request, res: Response) => {
	const { qnsLink, anon, topicId: newTopicId, oldTopicId } = req.body;

	const currVersion = await utmQuestCollections.Questions?.findOne({
		qnsLink,
		latest: true,
	});

	if (!currVersion) {
		res.status(404).send({ error: "No such latest question found." });
		return;
	}

	const utorId = req.headers.utorid as string;

	const badge = await utmQuestCollections.Badges?.findOne({
		utorId,
	});

	if (!badge) {
		res.status(404).send({
			error: "Could not find badge progression for user.",
		});
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
		userId: req.body.userId,
		anonId: req.body.anonId,
		utorName: anon ? "Anonymous" : `${firstName} ${lastName}`,
		date: new Date().toISOString(),
		numDiscussions: req.body.numDiscussions,
		anon: req.body.anon,
		latest: true,
		rating: {},
		likes: 0,
		dislikes: 0,
		views: 0,
		viewers: {},
	};

	const session = mongoDBConnection.startSession();

	try {
		session.startTransaction();

		// Add edited questions doc into db
		await utmQuestCollections.Questions?.insertOne(question, { session });

		await updateLatest(currVersion as QuestionBackEndType, false, session);

		if (oldTopicId !== newTopicId) {
			await utmQuestCollections.Topics?.findOneAndUpdate(
				{
					_id: new ObjectID(newTopicId),
					deleted: true,
				},
				{ $set: { deleted: false } },
				{ session }
			)
				.then(async () => {
					await topicIncrementor(
						new ObjectID(oldTopicId),
						-1,
						session
					);
					await topicIncrementor(
						new ObjectID(newTopicId),
						1,
						session
					);
				})
				.catch((err) => {
					throw new Error(err);
				});
		}

		// Attempts to update badge progression for specified utorid, reverts all changes if failed
		if (!req.body.anon) {
			await updateBadge(utorId, { $inc: { qnsEdited: 1 } }, session);

			await session.commitTransaction();

			res.status(201).send({
				qnsStatus: badge.qnsEdited + 1,
				unlockedBadges: badge.unlockedBadges,
				edit: true,
			});
		} else {
			await session.commitTransaction();
			res.status(201).send({ qnsLink });
		}
	} catch (err) {
		await session.abortTransaction();

		res.status(500).send({ err });
	} finally {
		await session.endSession();
	}
});

questionRouter.put("/restoreQuestion", async (req: Request, res: Response) => {
	const { restorableQnsId, restorableDate, latestTopicId } = req.body;

	utmQuestCollections.Questions?.findOne({
		_id: new ObjectID(restorableQnsId),
	}).then(async (restoredVersion) => {
		if (!restoredVersion) {
			res.status(404).send({ error: "No restored version found" });
			return;
		}

		const { qnsLink, topicId } = restoredVersion;

		const session = mongoDBConnection.startSession();

		try {
			session.startTransaction();

			if (latestTopicId !== topicId) {
				await utmQuestCollections.Topics?.findOneAndUpdate(
					{
						_id: new ObjectID(topicId),
						deleted: true,
					},
					{ $set: { deleted: false } },
					{ session }
				)
					.then(async () => {
						await topicIncrementor(
							new ObjectID(latestTopicId),
							-1,
							session
						);
						await topicIncrementor(
							new ObjectID(topicId),
							1,
							session
						);
					})
					.catch((err) => {
						throw new Error(err);
					});
			}

			await updateLatest(
				restoredVersion as QuestionBackEndType,
				true,
				session
			);

			await utmQuestCollections.Questions?.deleteMany(
				{
					$expr: {
						$gt: [
							{ $toDate: "$date" },
							new Date(restoredVersion.date),
						],
					},
					qnsLink,
				},
				{ session }
			);

			utmQuestCollections.Discussions?.find({
				qnsLink,
				op: true,
				$expr: {
					$gt: [{ $toDate: "$opDate" }, new Date(restorableDate)],
				},
			})
				.toArray()
				.then((documents) => {
					documents.forEach(async (doc) => {
						await utmQuestCollections.Discussions?.deleteMany(
							{
								_id: {
									$in: doc.thread.map(
										(id: string) => new ObjectID(id)
									),
								},
							},
							{ session }
						);

						await utmQuestCollections.Discussions?.deleteOne(doc, {
							session,
						});
					});
				})
				.catch((err) => {
					throw new Error(err);
				});

			await session.commitTransaction();

			res.status(200).send({ qnsLink });
		} catch (err) {
			await session.abortTransaction();

			res.status(500).send(err);
		} finally {
			await session.endSession();
		}
	});
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
			.then((response) =>
				res
					.status(200)
					.send([
						...response.map((elem) =>
							RemoveFieldsFromQuestion(
								elem as QuestionBackEndType
							)
						),
					])
			)
			.catch((error) => res.status(500).send(error));
	}
);

const UpdateRatingsCounter = (
	question: QuestionBackEndType,
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
			res.status(404).send({ error: "No question found." });
			return;
		}
		const user = await utmQuestCollections.Accounts?.findOne({
			utorId: req.headers.utorid,
		});
		if (!user) {
			res.status(401).send({ error: "User unauthorized." });
			return;
		}

		const { rate } = req.body;
		const newRating = { ...question.rating, [user.userId]: rate };

		const newUpdate = UpdateRatingsCounter(
			question as QuestionBackEndType,
			user.userId,
			rate
		);

		utmQuestCollections.Questions?.updateOne(question, {
			$set: { rating: newRating },
			$inc: newUpdate,
		}).then((updateRes) => {
			if (!updateRes) {
				res.status(500).send({ error: "Unable to update rating" });
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

		const user = await utmQuestCollections.Accounts?.findOne({ utorId });

		if (!user) {
			res.status(404).end();
			return;
		}

		const uniqueViewers = question.viewers;
		if (!(user.userId in uniqueViewers)) uniqueViewers[user.userId] = 1;

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
