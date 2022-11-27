import { Request, Response, Router } from "express";
import { utmQuestCollections } from "../db/db.service";

const accountRouter = Router();

accountRouter.put("/setup", async (req: Request, res: Response) => {
	const { utorid } = req.headers;
	const email: string = req.headers.http_mail as string;
	const name = email.split("@")[0].split(".");
	const firstName = name[0].charAt(0).toUpperCase() + name[0].slice(1);
	const lastName =
		name[name.length - 1].charAt(0).toUpperCase() +
		name[name.length - 1].slice(1);

	const user = await utmQuestCollections.Accounts?.findOne({ utorid });

	if (!user) {
		utmQuestCollections.Accounts?.insertOne({
			utorid,
			utorName: `${firstName} ${lastName}`,
			savedCourses: [],
		}).then((result) => {
			if (!result) {
				res.status(500).send("Unable to perform first time sign in.");
				return;
			}

			utmQuestCollections.Badges?.insertOne({
				utorid,
				questionsAdded: 0,
				questionsEdited: 0,
				threadResponses: 0,
				currLoginStreak: 1,
				longestLoginStreak: 1,
				lastLogin: new Date().toISOString(),
				firstPostToday: "",
				consecutivePosting: 0,
				displayBadges: [],
				unlockedBadges: {
					addQuestions: null,
					editQuestions: null,
					consecutivePosting: null,
					dailyLogin: "dailybadge",
					threadReplies: null,
				},
			}).then((badgeResult) => {
				if (!badgeResult) {
					utmQuestCollections.Accounts?.deleteOne({ utorid });
					res.status(500).send(
						"Unable to perform first time sign in."
					);
					return;
				}

				res.status(201).send({
					username: firstName.concat(" ").concat(lastName),
					utorid,
				});
			});
		});
	} else {
		res.status(418).send({
			username: firstName.concat(" ").concat(lastName),
			utorid,
		});
	}
});

accountRouter.get("/getAccount/:utorid", (req: Request, res: Response) => {
	utmQuestCollections.Accounts?.findOne({ utorid: req.params.utorid })
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

accountRouter.get("/checkSaved/:courseId", (req: Request, res: Response) => {
	utmQuestCollections.Accounts?.findOne({ utorid: req.headers.utorid })
		.then((doc) => {
			if (doc == null) {
				// set custom statusText to be displayed to user
				res.statusMessage = "No such account found.";
				res.status(404).end();
			} else {
				const isSaved = doc.savedCourses.includes(req.params.courseId);
				res.status(200).send(isSaved);
			}
		})
		.catch((error) => {
			res.status(500).send(error);
		});
});

accountRouter.put("/updateSavedCourse", async (req: Request, res: Response) => {
	const { utorid } = req.headers;

	if (req.body.favourite) {
		utmQuestCollections.Accounts?.findOneAndUpdate(
			{ utorid },
			{
				$pull: { savedCourses: req.body.courseId },
			},
			{ returnDocument: "after" }
		)
			.then((result) => {
				if (!result) {
					res.status(400).send(`Unable to favourite course`);
				}
				res.status(200).send(result);
			})
			.catch((error) => {
				res.status(500).send(error);
			});
	} else {
		utmQuestCollections.Accounts?.findOneAndUpdate(
			{ utorid },
			{
				$push: { savedCourses: req.body.courseId },
			},
			{ returnDocument: "after" }
		)
			.then((result) => {
				if (!result) {
					res.status(400).send(`Unable to favourite course`);
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
