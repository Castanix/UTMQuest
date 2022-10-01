import { Request, Response } from "express";
import { Router } from "express";
import { collections } from "../server";

const courseRouter = Router();

courseRouter.get('/allCourses', async (req: Request, res: Response) => { 
    try { 
        let courseLst = await collections.Courses?.find().toArray();
        res.json(courseLst);
    } catch (error) { 
        res.status(500).send("ERROR: " + error);
    }
})

courseRouter.get('/getCourse/:courseId', (req: Request, res: Response) => {
    collections.Courses?.findOne({courseId: req.params.courseId}).then((doc: any) => {

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
})

courseRouter.post('/', async (req: Request, res: Response) => {
    const course = {
      courseId: req.body.courseId,
      courseName: req.body.courseName,
      topics: req.body.courseTopics
    }  

    const item = await collections.Courses?.findOne(course); 
    if (item){ 
      res.status(409).send({ "error": "data already exists"}); 
      return;
    }
    
    collections.Courses?.insertOne(course).then((result) => { 
    if (!result){ 
      res.status(400).send("Unable to post the course");
    }
      res.status(201).send(`course ${course.courseId} has been added succesfully`); 
    }).catch((error) => { 
      res.status(500).send("ERROR: " + error)
    })
})

export { courseRouter };