import { Request, Response, Router } from 'express';
import { utmQuestCollections } from '../db/db.service';

const accountRouter = Router();

accountRouter.get("/getAccount/:utorid", (req: Request, res: Response) => {
	utmQuestCollections.Accounts?.findOne({ utorid: req.params.utorid })
		.then((doc) => {
			if (doc == null) {
				// set custom statusText to be displayed to user
				res.statusMessage = "No such account found.";
				res.status(404).end();
			} else {
				res.status(200).send(doc);
			}
		})
		.catch((error) => {
			res.status(500).send(`ERROR: ${error}`);
		});
});

accountRouter.get("/checkSaved/:utorid/:courseId", (req: Request, res: Response) => {
	const account = {
		utorid: req.params.utorid
	};

	utmQuestCollections.Accounts?.findOne(account)
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
			res.status(500).send(`ERROR: ${error}`);
		});
});


accountRouter.put('/updateSavedCourse', async (req: Request, res: Response) => {
    const account = {
      utorid: req.body.utorid
    };
  
    if (req.body.favourite) {
        utmQuestCollections.Accounts?.findOneAndUpdate(account, 
            {
              $pull: {"savedCourses": req.body.courseId}
            }, { returnDocument: "after" }
          ).then((result) => {
            if (!result) {
              res.status(400).send(`Unable to favourite course`);
            }
            res.status(200).send(result);
          }).catch((error) => {
            res.status(500).send(error);
          });
    } else {
        utmQuestCollections.Accounts?.findOneAndUpdate(account, 
            {
              $push: {"savedCourses": req.body.courseId},
            }, { returnDocument: "after" }
          ).then((result) => {
            if (!result) {
              res.status(400).send(`Unable to favourite course`);
            }
            res.status(200).send(result);
          }).catch((error) => {
            res.status(500).send(error);
          });
    }
    
  });


accountRouter.put('/updateColour', async (req: Request, res: Response) => {
  const account = {
    utorid: req.body.utorid
  };

  utmQuestCollections.Accounts?.findOneAndUpdate(account, {
      $set: {colour: req.body.colour}
    }).then((result) => {
      if (!result) {
        res.status(400).send(`Unable to update colour`);
      }
      console.log("here");
      res.status(200).send(result);
    }).catch((error) => {
      res.status(500).send(error);
    });
});

export default accountRouter;