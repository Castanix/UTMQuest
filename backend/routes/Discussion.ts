import { ObjectID } from "bson";
import { Request, Response, Router } from "express";
import { mongoDBConnection, utmQuestCollections } from "../db/db.service";
import { DiscussionBackEndType } from "../types/Discussion";

const discussionRouter = Router();

/* Remove fields from discussion. Remove utorid by default and userId if anon */
const RemoveFieldsFromDiscussion = (discussion: DiscussionBackEndType) => {
	const { utorId: _, ...returnObj } = discussion;

	if (discussion.anon) {
		const { userId: _ignore, ...rest } = returnObj;

		return rest;
	}

	const { anonId: _ignore, ...rest } = returnObj;

	return rest;
};

// GET .../discussion/:discussionId
discussionRouter.get("/:discussionId", async (req: Request, res: Response) => {
	try {
		const discussion = await utmQuestCollections.Discussions?.findOne({
			_id: new ObjectID(req.params.discussionId),
		});

		if (!discussion) {
			res.status(404).send({ error: "No such discussion found." });
			return;
		}

		res.status(200).send(discussion);
	} catch (error) {
		res.status(500).send(error);
	}
});

// GET .../thread/:questionId - return all discussion where comments are from op and for a specific question
discussionRouter.get(
	"/thread/:qnsLink",
	async (req: Request, res: Response) => {
		try {
			const question = await utmQuestCollections.Questions?.findOne({
				qnsLink: req.params.qnsLink,
				latest: true,
			});

			if (!question) {
				res.status(404).send({ error: "Unable to find question" });
				return;
			}

			const discussion = await utmQuestCollections.Discussions?.find({
				qnsLink: req.params.qnsLink,
				op: true,
			})
				.sort({ date: -1 })
				.toArray();

			res.status(200).send({
				discussion: [
					...(discussion?.map((elem) =>
						RemoveFieldsFromDiscussion(
							elem as DiscussionBackEndType
						)
					) ?? []),
				],
			});
		} catch (error) {
			res.status(500).send(error);
		}
	}
);

// GET .../allThreads/:discussionId - get discussion documents from a given list of ids from a thread
discussionRouter.get(
	"/allThreads/:discussionId",
	async (req: Request, res: Response) => {
		try {
			const ids = Object.values(req.query);
			const discussionLst: DiscussionBackEndType[] = [];

			await Promise.all(
				ids.map(async (item) => {
					const discussion =
						(await utmQuestCollections.Discussions?.findOne({
							_id: new ObjectID(item as string),
						})) as DiscussionBackEndType;
					discussionLst.push(discussion);
				})
			);

			res.status(200).send([
				...discussionLst.map((elem) =>
					RemoveFieldsFromDiscussion(elem)
				),
			]);
		} catch (error) {
			res.status(500).send(error);
		}
	}
);

// POST .../discussion/:qnsId
discussionRouter.post("/", async (req: Request, res: Response) => {
	const { qnsLink, userId, anonId, anon, op, content, thread } = req.body;
	const utorId = req.headers.utorid as string;

	const email: string = req.headers.http_mail as string;
	const name = email.split("@")[0].split(".");
	const firstName = name[0].charAt(0).toUpperCase() + name[0].slice(1);
	const lastName =
		name[name.length - 1].charAt(0).toUpperCase() +
		name[name.length - 1].slice(1);

	const question = await utmQuestCollections.Questions?.findOne({
		qnsLink,
		latest: true,
	});

	const user = await utmQuestCollections.Accounts?.findOne({ userId });

	if (!question || !user) {
		res.status(404).end();
		return;
	}

	const discussion = {
		_id: new ObjectID(),
		qnsLink,
		op,
		utorId,
		userId,
		anonId,
		utorName: anon ? "Anonymous" : `${firstName} ${lastName}`,
		content,
		thread,
		opDate: new Date().toISOString(),
		editDate: null,
		deleted: false,
		anon,
		edited: false,
	};

	// const session = mongoDBConnection.startSession();

	try {
		// session.startTransaction();

		await utmQuestCollections.Discussions?.insertOne(discussion, {
			// session,
		});

		await utmQuestCollections.Questions?.findOneAndUpdate(
			{ qnsLink, latest: true },
			{ $inc: { numDiscussions: 1 } },
			// { session }
		);

		// await session.commitTransaction();

		res.status(201).send({
			insertedId: discussion._id,
			utorName: anon ? "Anonymous" : `${firstName} ${lastName}`,
		});
	} catch (error) {
		// await session.abortTransaction();

		res.status(500).send({ error });
	} finally {
		// await session.endSession();
	}
});

// UPDATE a parent comments discussion thread
discussionRouter.put("/:discussionId", async (req: Request, res: Response) => {
	const isAnon = req.body.anon;
	const utorId = req.headers.utorid as string;

	const email: string = req.headers.http_mail as string;
	const name = email.split("@")[0].split(".");
	const firstName = name[0].charAt(0).toUpperCase() + name[0].slice(1);
	const lastName =
		name[name.length - 1].charAt(0).toUpperCase() +
		name[name.length - 1].slice(1);

	const discussion = {
		op: req.body.op,
		utorId,
		utorName: isAnon ? "Anonymous" : `${firstName} ${lastName}`,
		content: req.body.content,
		thread: req.body.thread,
		deleted: false,
		anon: req.body.anon,
	};

	await utmQuestCollections.Discussions?.findOneAndUpdate(
		{ _id: new ObjectID(req.params.discussionId) },
		{ $set: discussion }
	)
		.then((result) => {
			if (!result) {
				res.status(400).send(result);
				return;
			}

			res.status(200).send({ sucess: "Succesfully updated discussion" });
		})
		.catch((error) => {
			res.status(500).send(error);
		});
});

// PUT .../discussion/updatePost/:discussionId
discussionRouter.put(
	"/updatePost/:discussionId",
	async (req: Request, res: Response) => {
		const { content } = req.body;
		const editDate = new Date().toISOString();

		const originalComment = await utmQuestCollections.Discussions?.findOne({
			_id: new ObjectID(req.params.discussionId),
		});

		const user = await utmQuestCollections.Accounts?.findOne({
			utorId: req.headers.utorid,
		});

		if (!user || !originalComment) {
			res.status(404).end();
			return;
		}

		if (originalComment.userId !== user.userId) {
			res.status(401).send({
				error: "Only allowed to edit your own comments",
			});
			return;
		}

		const discussion = {
			...originalComment,
			content: req.body.content,
			editDate,
			edited: req.body.edited,
		};

		await utmQuestCollections.Discussions?.findOneAndUpdate(
			originalComment,
			{ $set: discussion }
		)
			.then((result) => {
				if (!result) {
					res.status(400).send(result);
					return;
				}

				res.status(200).send({
					...RemoveFieldsFromDiscussion(
						result.value as DiscussionBackEndType
					),
					content,
					editDate,
				});
			})
			.catch((error) => {
				res.status(500).send(error);
			});
	}
);

// DELETE .../discussion/:discussionId
discussionRouter.delete(
	"/:discussionId",
	async (req: Request, res: Response) => {
		const comment = await utmQuestCollections.Discussions?.findOne({
			_id: new ObjectID(req.params.discussionId),
		});

		const user = await utmQuestCollections.Accounts?.findOne({
			utorId: req.headers.utorid,
		});

		if (!user || !comment) {
			res.status(404).end();
			return;
		}

		if (comment.userId !== user.userId) {
			res.status(401).send({
				error: "Only allowed to delete your own comments",
			});
			return;
		}

		// update content and the deleted flag

		try {
			const result =
				await utmQuestCollections.Discussions?.findOneAndUpdate(
					comment,
					{
						$set: {
							content:
								"This message was deleted by the original author or a moderator",
							deleted: true,
						},
					},
					{ returnDocument: "after" }
				);

			if (!result) {
				res.status(400).send({ error: "Unable to delete discussion" });
				return;
			}

			res.status(202).send({
				...RemoveFieldsFromDiscussion(
					result.value as DiscussionBackEndType
				),
			});
		} catch (error) {
			res.status(500).send(error);
		}
	}
);

export default discussionRouter;
