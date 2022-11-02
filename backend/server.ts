import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import connectDB from "./db/db.service";
import courseRouter from "./routes/Courses";
import topicRouter from "./routes/Topic";
import questionRouter from "./routes/Question";
import accountRouter from "./routes/Account";

const app = express();
app.use(cors());

const port = process.env.PORT || 5001;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Questions 
app.use("/question", questionRouter);

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


// Connect to mongoDB and listen on app
connectDB()
	.then(async () => {
		app.listen(port, () => console.log(`Listening on port ${port}`));
	})
	.catch((error: Error) => {
		console.error(`Error could not connect to db: ${error}`);
	});

export default {};
