import { Request, Response, Router } from 'express';
import { utmQuestCollections } from '../db/db.service';

const courseRouter = Router();

courseRouter.get('/getAllCourses', async (req: Request, res: Response) => {
  try {
    const courseLst = await utmQuestCollections.Courses?.find().toArray();
    res.json(courseLst);
  } catch (error) {
    res.status(500).send(error);
  }
});

courseRouter.get('/getCourse/:courseId', (req: Request, res: Response) => {
  utmQuestCollections.Courses?.findOne({ courseId: req.params.courseId }).then((doc: any) => {
    if (doc == null) {
      // set custom statusText to be displayed to user
      res.statusMessage = 'No such course found.';
      res.status(404).end();
    } else {
      res.status(200).send(doc);
    }
  }).catch((error) => {
    res.status(500).send(error);
  });
});

courseRouter.post('/', async (req: Request, res: Response) => {
  const course = {
    courseId: req.body.courseId,
    courseName: req.body.courseName,
    topics: req.body.courseTopics,
  };

  const item = await utmQuestCollections.Courses?.findOne(course);
  if (item) {
    res.status(409).send({ error: 'data already exists' });
    return;
  }

  utmQuestCollections.Courses?.insertOne(course).then((result) => {
    if (!result) {
      res.status(400).send('Unable to post the course');
    }
    res.status(201).send(`course ${course.courseId} has been added successfully`);
  }).catch((error) => {
    res.status(500).send(error);
  });
});


courseRouter.put('/addCourse', async (req: Request, res: Response) => {
  const course = {
    courseId: req.body.courseId
  };

  utmQuestCollections.Courses?.findOneAndUpdate(course, 
    { 
      $set: { added: true } 
    }
  ).then((result) => {
    if (!result) {
      res.status(400).send('Unable to update the course');
    }
    res.status(200).send(`course ${course.courseId} has been updated successfully`);
  }).catch((error) => {
    res.status(500).send(error);
  })
});


courseRouter.put('/incrementTopic', async (req: Request, res: Response) => {
  const course = {
    courseId: req.body.courseId
  };

  utmQuestCollections.Courses?.findOneAndUpdate(course, 
    { 
      $int: { numTopics: 1 } 
    }
  ).then((result) => {
    if (!result) {
      res.status(400).send(`Unable to increment numTopics for ${course.courseId}`);
    }
    res.status(200).send(`course ${course.courseId} has been updated successfully`)
  }).catch((error) => {
    res.status(500).send(error);
  })
});

courseRouter.put('/decrementTopic', async (req: Request, res: Response) => {
  const course = {
    courseId: req.body.courseId
  };

  utmQuestCollections.Courses?.findOneAndUpdate(course, 
    { 
      $cond: {
        if: {
          numTopics: { $gt: 0 }
        },
        then: {$int: { numTopics: -1 }},
        else: {$set: { numTopics: 0 }}
      }
    }
  ).then((result) => {
    if (!result) {
      res.status(400).send(`Unable to decrement numTopics for ${course.courseId}`);
    }
    res.status(200).send(`course ${course.courseId} has been updated successfully`)
  }).catch((error) => {
    res.status(500).send(error);
  })
});

export default courseRouter;
