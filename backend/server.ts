import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import connectDB from "./db/db.service";
import apiRouter from "./api";
import redisClient from "./redis/setup";
// import fetchCourses from "./fetchUTMCourses";

const app = express();
app.use(cors());

const port = process.env.PORT || 5001;
const env = process.env.NODE_ENV || "dev";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join("/var/www/html", "quest")));
const num = Math.floor(Math.random() * 3);

// ensure all requests are authorized
app.use((req, res, next) => {
	// should be hard to spoof the utorid
	if (req.headers.utorid !== undefined) {
		next();
	} else if (env === "dev") {
		const dummy = ["dummy22", "dummy23", "dummy24"];
		req.headers.utorid = dummy[num];
		req.headers.http_mail = `${dummy[num]}.test@test.com`;
		next();
	} else {
		// handle if shib is not enabled for some reaso
		res.status(401).send({ status: "Unauthorized" });
	}
});

app.use("/api", apiRouter);

app.get("/*", (req, res) => {
	res.sendFile(path.join("/var/www/html", "quest", "index.html"));
});

// Connect to mongoDB and listen on app
connectDB()
	.then(async () => {
		app.listen(port, () => console.log(`Listening on port ${port}`));
		redisClient.on('error', err => console.log('Redis Client Error', err));
		await redisClient.connect();

		// fetchCourses();
	})
	.catch(async (error: Error) => {
		console.error(`Error could not connect to db: ${error}`);
		await redisClient.disconnect();
	});

export default app;
