import express, { Request, Response } from "express";
import * as mongoDB from "mongodb";
import { connectDB } from "./db/db.service"

const app = express();
const port = process.env.PORT || 5001;

let collections: { 
  Accounts?: mongoDB.Collection,
  Courses?: mongoDB.Collection,
  Topics?: mongoDB.Collection,
  Questions?: mongoDB.Collection,
  Discussions?: mongoDB.Collection,
} = {}

app.get('/express_backend', (req: Request, res: Response) => {
  res.send({ express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT' });
});


app.get('/getCourse/:courseId', (req: Request, res: Response) => {

  collections.Courses?.findOne({courseId: req.params.courseId}).then((doc) => {

    if (doc == null) {
      // set custom statusText to be displayed to user
      res.statusMessage = "No such course found."
      res.status(404).end();
    }

    else { 
      res.status(200).send(doc);
    }

  }).catch((error) => {
    res.status(500).send("ERROR: " + error);
  })
});



connectDB().then(async (collection) => {
  collections = collection;
  app.listen(port, () => console.log(`Listening on port ${port}`));  


}).catch((error: Error) => {
  console.error(`Error could not connect to db: ${error}`);
})