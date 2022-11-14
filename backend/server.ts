import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import connectDB, { utmQuestCollections } from "./db/db.service";
import courseRouter from "./routes/Courses";
import topicRouter from "./routes/Topic";
import questionRouter from "./routes/Question";
import discussionRouter from "./routes/Discussion";
import accountRouter from "./routes/Account";

const app = express();
app.use(cors());

const port = process.env.PORT || 5001;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Questions
app.use("/question", questionRouter);

// Discussion
app.use("/discussion", discussionRouter);

// Courses
app.use("/course", courseRouter);

// Topics
app.use("/topic", topicRouter);

// Accounts
app.use("/account", accountRouter);

// Test route
app.get("/express_backend", (req: Request, res: Response) => {
	res.send({ express: "YOUR EXPRESS BACKEND IS CONNECTED TO REACT" });
});

app.put("/incrementLoginStreak", async (req: Request, res: Response) => {
	const { utorid } = req.body;
	const badge = await utmQuestCollections.Badges?.findOne({ utorid });

	if (!badge) {
		res.status(404).send("Could not find badge progression for user.");
		return;
	}

	const currDate = new Date();
	const lastLogin = new Date(badge.lastLogin);

	const diffInHours =
		(currDate.getTime() - lastLogin.getTime()) / (1000 * 60 * 60);

	if (diffInHours < 24) {
		res.status(400).send(
			`Can't increment when logging in within one day (${diffInHours}).`
		);
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
					res.status(500).send("Could not update login streak.");
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
					res.status(500).send("Could not reset login streak.");
				res.status(201).send({ streak: 1 });
			})
			.catch((error) => {
				res.status(500).send(error);
			});
	}
});

// Connect to mongoDB and listen on app
connectDB()
	.then(async () => {
		app.listen(port, () => console.log(`Listening on port ${port}`));
	})
	.catch((error: Error) => {
		console.error(`Error could not connect to db: ${error}`);
	});

export default app;
