import { Request, Response, Router } from "express";
import { utmQuestCollections } from "./db/db.service";
import accountRouter from "./routes/Account";
import badgeRouter from "./routes/Badges";
import courseRouter from "./routes/Courses";
import discussionRouter from "./routes/Discussion";
import questionRouter from "./routes/Question";
import topicRouter from "./routes/Topic";

const apiRouter = Router();

// Questions
apiRouter.use("/question", questionRouter);

// Discussion
apiRouter.use("/discussion", discussionRouter);

// Courses
apiRouter.use("/course", courseRouter);

// Topics
apiRouter.use("/topic", topicRouter);

// Accounts
apiRouter.use("/account", accountRouter);

// Accounts
apiRouter.use("/badge", badgeRouter);

apiRouter.get("/user", (req) => {
	console.log("calling /user");
	let username;

	if (req.headers.utorid !== undefined) {
		console.log(`shib user ${req.headers.utorid} ${req.headers.http_mail}`);
		console.log(`origin ${req.headers.origin}`);
		username = req.headers.utorid;
		console.log(username);
	} else {
		// handle if shib is not enabled for some reaso
		console.log("Something went wrong");
	}
});

apiRouter.put("/incrementLoginStreak", async (req: Request, res: Response) => {
	const { utorid: utorId } = req.headers;
	const badge = await utmQuestCollections.Badges?.findOne({ utorId });

	if (!badge) {
		res.status(404).send({
			error: "Could not find badge progression for user.",
		});
		return;
	}

	const currDate = new Date();
	const lastLogin = new Date(badge.lastLogin);

	const diffInHours =
		(currDate.getTime() - lastLogin.getTime()) / (1000 * 60 * 60);

	if (diffInHours < 24) {
		res.status(400).send({
			error: `Can't increment when logging in within one day (${diffInHours}).`,
		});
	} else if (diffInHours >= 24 && diffInHours < 48) {
		utmQuestCollections.Badges?.findOneAndUpdate(badge, {
			$inc: { currLoginStreak: 1 },
			$set: {
				longestLoginStreak: Math.max(
					badge.currLoginStreak + 1,
					badge.longestLoginStreak
				),
				lastLogin: currDate.toISOString(),
			},
		})
			.then((result) => {
				if (!result.ok)
					res.status(500).send({
						error: "Could not update login streak.",
					});
				res.status(201).send({ streak: badge.currLoginStreak + 1 });
			})
			.catch((error) => {
				res.status(500).send(error);
			});
	} else {
		utmQuestCollections.Badges?.findOneAndUpdate(badge, {
			$set: {
				currLoginStreak: 1,
				lastLogin: currDate.toISOString(),
			},
		})
			.then((result) => {
				if (!result.ok)
					res.status(500).send({
						error: "Could not reset login streak.",
					});
				res.status(201).send({ streak: 1 });
			})
			.catch((error) => {
				res.status(500).send(error);
			});
	}
});

apiRouter.get("/displayBadges/:userId", async (req: Request, res: Response) => {
	const { userId } = req.params;

	const badge = await utmQuestCollections.Badges?.findOne({ userId });

	if (!badge) {
		res.status(404).send({ error: "Could not find badge for given user." });
		return;
	}

	res.status(200).send({
		displayBadges: badge.displayBadges,
		longestLoginStreak: badge.longestLoginStreak,
	});
});

// Test route
apiRouter.get("/express_backend", (req: Request, res: Response) => {
	res.status(200).send({
		express: "YOUR EXPRESS BACKEND IS CONNECTED TO REACT",
	});
});

export default apiRouter;
