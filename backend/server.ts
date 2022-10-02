import express, { Request, Response } from "express";
import { connectDB } from "./db/db.service";
import { UTMQuestCollections } from "./types/utmQuestCollection";

const app = express();
const port = process.env.PORT || 5001;

let collections: UTMQuestCollections = {}

app.get('/express_backend', (req: Request, res: Response) => {
  res.send({ express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT' });
});

// Courses routes
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

// // Questions routes
// app.get('/getQuestion/:qnsId', (req: Request, res: Response) => {

//   collections.Questions?.findOne({qnsId: req.params.qnsId}).then((doc) => {

//     if (doc == null) {
//       // set custom statusText to be displayed to user
//       res.statusMessage = "No such question found."
//       res.status(404).end();
//     }

//     else { 
//       res.status(200).send(doc);
//     }

//   }).catch((error) => {
//     res.status(500).send("ERROR: " + error);
//   })
// });


// Connect to mongoDB and listen on app
connectDB().then(async (collection) => {
  collections = collection;
  app.listen(port, () => console.log(`Listening on port ${port}`));  


}).catch((error: Error) => {
  console.error(`Error could not connect to db: ${error}`);
})