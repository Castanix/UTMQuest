import { Request, Response, Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { utmQuestCollections, mongoDBConnection } from "../db/db.service";

const accountRouter = Router();

accountRouter.put("/setup", async (req: Request, res: Response) => {
	const { utorid: utorId } = req.headers;
	const email: string = req.headers.http_mail as string;
	const name = email.split("@")[0].split(".");
	const firstName = name[0].charAt(0).toUpperCase() + name[0].slice(1);
	const lastName =
		name[name.length - 1].charAt(0).toUpperCase() +
		name[name.length - 1].slice(1);

	const user = await utmQuestCollections.Accounts?.findOne({ utorId });

	if (!user) {
		const session = mongoDBConnection.startSession();

		// generate unique userId
		const userId = uuidv4();
		const anonId = uuidv4();

		try {
			session.startTransaction();

			await utmQuestCollections.Accounts?.insertOne(
				{
					utorId,
					userId,
					anonId,
					utorName: `${firstName} ${lastName}`,
					bookmarkCourses: [],
					theme: "light",
				},
				{ session }
			);

			await utmQuestCollections.Badges?.insertOne(
				{
					utorId,
					userId,
					qnsAdded: 0,
					qnsEdited: 0,
					currLoginStreak: 1,
					longestLoginStreak: 1,
					lastLogin: new Date().toISOString(),
					firstPostToday: "",
					consecutivePosting: 0,
					displayBadges: [],
					unlockedBadges: {
						addQns: null,
						editQns: null,
						consecutivePosting: null,
						dailyLogin: "dailybadge",
						threadReplies: null,
					},
				},
				{ session }
			);

			await session.commitTransaction();

			res.status(201).send({
				username: firstName.concat(" ").concat(lastName),
				userId,
				anonId,
				theme: "light",
			});
		} catch (error) {
			await session.abortTransaction();

			res.status(500).send({ error });
		} finally {
			await session.endSession();
		}
	} else {
		res.status(418).send({
			username: firstName.concat(" ").concat(lastName),
			userId: user.userId,
			anonId: user.anonId,
			theme: user.theme,
		});
	}
});

accountRouter.get("/getAccount/:userId", (req: Request, res: Response) => {
	utmQuestCollections.Accounts?.findOne({ userId: req.params.userId })
		.then((doc) => {
			if (doc == null) {
				res.statusMessage = "No such account found.";
				res.status(404).end();
			} else {
				const { utorId: _, anonId: _ignore, ...returnDoc } = doc; // exclude utorId from all responses
				res.status(200).send(returnDoc);
			}
		})
		.catch((error) => {
			res.status(500).send(error);
		});
});

accountRouter.get("/checkBookmark/:courseId", (req: Request, res: Response) => {
	utmQuestCollections.Accounts?.findOne({ utorId: req.headers.utorid })
		.then((doc) => {
			if (doc == null) {
				// set custom statusText to be displayed to user
				res.statusMessage = "No such account found.";
				res.status(404).end();
			} else {
				const isBookmark = doc.bookmarkCourses.includes(
					req.params.courseId
				);
				res.status(200).send(isBookmark);
			}
		})
		.catch((error) => {
			res.status(500).send(error);
		});
});

accountRouter.put(
	"/updateBookmarkCourses",
	async (req: Request, res: Response) => {
		const { utorid: utorId } = req.headers;

		if (req.body.bookmarked) {
			utmQuestCollections.Accounts?.findOneAndUpdate(
				{ utorId },
				{
					$pull: { bookmarkCourses: req.body.courseId },
				},
				{ returnDocument: "after" }
			)
				.then((result) => {
					if (!result) {
						res.status(400).send({
							error: "Unable to bookmark course",
						});
					}
					res.status(200).send(result);
				})
				.catch((error) => {
					res.status(500).send(error);
				});
		} else {
			utmQuestCollections.Accounts?.findOneAndUpdate(
				{ utorId },
				{
					$push: { bookmarkCourses: req.body.courseId },
				},
				{ returnDocument: "after" }
			)
				.then((result) => {
					if (!result) {
						res.status(400).send({
							error: "Unable to bookmark course",
						});
					}
					res.status(200).send(result);
				})
				.catch((error) => {
					res.status(500).send(error);
				});
		}
	}
);

accountRouter.patch("/updateTheme", async (req: Request) => {
	const { utorid: utorId } = req.headers;
	const account = await utmQuestCollections.Accounts?.findOne({ utorId });

	if (account) {
		await utmQuestCollections.Accounts?.updateOne(account, {
			$set: { theme: account.theme === "light" ? "dark" : "light" },
		});
	}
});

/* Currently unused with the removal of the colour field */
// accountRouter.put('/updateColour', async (req: Request, res: Response) => {
//   const account = {
//     utorid: req.body.utorid
//   };

//   utmQuestCollections.Accounts?.findOneAndUpdate(account, {
//       $set: {colour: req.body.colour}
//     }).then((result) => {
//       if (!result) {
//         res.status(400).send(`Unable to update colour`);
//       }
//       console.log("here");
//       res.status(200).send(result);
//     }).catch((error) => {
//       res.status(500).send(error);
//     });
// });

export default accountRouter;
