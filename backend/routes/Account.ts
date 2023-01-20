import { Request, Response, Router } from "express";
import { utmQuestCollections } from "../db/db.service";

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
		utmQuestCollections.Accounts?.insertOne({
			utorId,
			utorName: `${firstName} ${lastName}`,
			bookmarkCourses: [],
		}).then((result) => {
			if (!result) {
				res.status(500).send("Unable to perform first time sign in.");
				return;
			}

			utmQuestCollections.Badges?.insertOne({
				utorId,
				qnsAdded: 0,
				qnsEdited: 0,
				threadResponses: 0,
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
			}).then((badgeResult) => {
				if (!badgeResult) {
					utmQuestCollections.Accounts?.deleteOne({ utorId });
					res.status(500).send(
						"Unable to perform first time sign in."
					);
					return;
				}

				res.status(201).send({
					username: firstName.concat(" ").concat(lastName),
					utorId,
				});
			});
		});
	} else {
		res.status(418).send({
			username: firstName.concat(" ").concat(lastName),
			utorId,
		});
	}
});

accountRouter.get("/getAccount/:utorId", (req: Request, res: Response) => {
	utmQuestCollections.Accounts?.findOne({ utorId: req.params.utorId })
		.then((doc) => {
			if (doc == null) {
				res.statusMessage = "No such account found.";
				res.status(404).end();
			} else {
				res.status(200).send(doc);
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
				const isBookmark = doc.bookmarkCourses.includes(req.params.courseId);
				res.status(200).send(isBookmark);
			}
		})
		.catch((error) => {
			res.status(500).send(error);
		});
});

accountRouter.put("/updateBookmarkCourses", async (req: Request, res: Response) => {
	const { utorid: utorId } = req.headers;

	if (req.body.bookmark) {
		utmQuestCollections.Accounts?.findOneAndUpdate(
			{ utorId },
			{
				$pull: { bookmarkCourses: req.body.courseId },
			},
			{ returnDocument: "after" }
		)
			.then((result) => {
				if (!result) {
					res.status(400).send(`Unable to bookmark course`);
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
					res.status(400).send(`Unable to bookmark course`);
				}
				res.status(200).send(result);
			})
			.catch((error) => {
				res.status(500).send(error);
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
