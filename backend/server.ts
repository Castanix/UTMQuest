import express, { Request, Response } from "express";
import { connectDB } from "./db/db.service";
import { UTMQuestCollections } from "./types/utmQuestCollection";
import { courseRouter } from "./routes/Courses";
import bodyParser from "body-parser";

const app = express();
const port = process.env.PORT || 5001;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true})); 

let collections: UTMQuestCollections = {};

// Courses 
app.use('/course', courseRouter);



app.get('/express_backend', (req: Request, res: Response) => {
  res.send({ express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT' });
});


// Accounts routes
app.get('/getAccount/:utorid', (req: Request, res: Response) => {

  collections.Accounts?.findOne({utorid: req.params.utorid}).then((doc) => {

    if (doc == null) {
      // set custom statusText to be displayed to user
      res.statusMessage = "No such account found."
      res.status(404).end();
    }

    else { 
      res.status(200).send(doc);
    }

  }).catch((error) => {
    res.status(500).send("ERROR: " + error);
  })
});

// Connect to mongoDB and listen on app
connectDB().then(async (collection) => {
  collections = collection;
  app.listen(port, () => console.log(`Listening on port ${port}`));  


}).catch((error: Error) => {
  console.error(`Error could not connect to db: ${error}`);
})

export { collections }; 