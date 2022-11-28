import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import connectDB from "./db/db.service";
import apiRouter from "./api";

const app = express();
app.use(cors());

const port = process.env.PORT || 5001;
const env = process.env.NODE_ENV || "dev";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join("/var/www/html", "quest")));

// ensure all requests are authorized
app.use((req, res, next) => {
	if (env === "dev") {
		req.headers.utorid = "dummy22";
		req.headers.http_mail = "dummy.test@test.com";
		next();
		return;
	}

	// should be hard to spoof the utorid
	if (req.headers.utorid !== undefined) {
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
	})
	.catch((error: Error) => {
		console.error(`Error could not connect to db: ${error}`);
	});

export default app;
