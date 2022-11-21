import { ObjectID } from "bson";
import { Request, Response, Router } from 'express';
import { utmQuestCollections } from '../db/db.service';
import { DiscussionType } from '../types/Discussion';

const discussionRouter = Router();

// GET .../discussion/:discussionId
discussionRouter.get('/:discussionId', async (req: Request, res: Response) => { 
    try { 
        const discussion = await utmQuestCollections.Discussions?.findOne({_id: new ObjectID(req.params.discussionId)});

        if (!discussion) { 
            res.status(404).send("No such discussion found.");
            return;
        }

        res.status(200).send(discussion);
    } catch (error) { 
        res.status(500).send(error);
    }
});


// GET .../thread/:questionId - return all discussion where comments are from op and for a specific question
discussionRouter.get('/thread/:questionLink', async (req: Request, res: Response) => { 
    try { 
        const question = await utmQuestCollections.Questions?.findOne({
            link: req.params.questionLink,
            latest: true
        });

        if (!question) { 
            res.status(404).send(`Error: Unable to find question`); 
            return;
        }

        const discussion = await utmQuestCollections.Discussions?.find({
            questionLink: req.params.questionLink, 
            op: true
        }).toArray();

        res.status(200).send(discussion);
    } catch (error) { 
        res.status(500).send(error);
    }
});


// GET .../allThreads/:discussionId - get discussion documents from a given list of ids from a thread 
discussionRouter.get('/allThreads/:id', async (req: Request, res: Response) => { 
    try {
        const ids = Object.values(req.query);
        const discussionLst: DiscussionType[] = []; 

        await Promise.all(ids.map(async (item) => { 
            const discussion = await utmQuestCollections.Discussions?.findOne({_id: new ObjectID(item as string)}) as DiscussionType;
            discussionLst.push(discussion);
        }));
    
        res.status(200).send(discussionLst);

    } catch (error) { 
        console.log(error);
        res.status(500).send(error);
    }
});


// POST .../discussion/:qnsId
discussionRouter.post('/', async (req: Request, res: Response) => { 
    
    const link = req.body.questionLink;

    const quesiton = await utmQuestCollections.Questions?.findOne({
        link,
        latest: true
    });
    if (!quesiton) {
        res.status(404).send(`Error: Unable to find question`);
        return;
    };

    const discussion = {
        questionLink: link,
        op: req.body.op, 
        authId: req.body.authId,
        authName: req.body.authName,
        content: req.body.content,
        thread: req.body.thread, 
        date: new Date().toISOString(),
        deleted: false,
        anon: req.body.anon,
        edited: false,
    };     
    
    await utmQuestCollections.Discussions?.insertOne(discussion).then((result)=> { 
        if (!result) {
            res.status(500).send("Unable to add new discussion.");
            return;
        }

        // INCREMENT COUNTER
        utmQuestCollections.Questions?.findOneAndUpdate(
            { link, 
              latest: true },
            { $inc: { numDiscussions: 1 } }
        ).then((incrementResult) => {
            if (!incrementResult) {
                res.status(500).send(
                    `Unable to increment numDiscussions for ${req.params.questionId}`
                );
                utmQuestCollections.Discussions?.deleteOne(discussion);
                return;
            };
            res.status(201).send(result);
        });

    }).catch((error) => {
        res.status(500).send(error);
    });

});


// UPDATE .../discussion/:discussionId
discussionRouter.put('/:discussionId', async (req: Request, res: Response) => { 

    const discussion = {
        op: req.body.op, 
        authId: req.body.authId,
        authName: req.body.authName,
        content: req.body.content,
        thread: req.body.thread, 
        deleted: false,
        anon: req.body.anon
    };

    await utmQuestCollections.Discussions?.findOneAndUpdate( { _id: new ObjectID(req.params.discussionId)}, {$set: discussion})
        .then((result) => { 
            if (!result) { 
                res.status(400).send(result);
                return;
            }

            res.status(200).send('Succesfully updated discussion');

        }).catch((error) => { 
            res.status(500).send(error);
        });
}); 

// PUT .../discussion/updatePost/:discussionId
discussionRouter.put('/updatePost/:discussionId', async (req: Request, res: Response) => { 
    const {content} = req.body;
    const date = new Date().toISOString();

    const discussion = {
        questionLink: req.body.questionLink,
        op: req.body.op, 
        authId: req.body.authId,
        authName: req.body.authName,
        content,
        thread: req.body.thread, 
        date,
        deleted: false,
        anon: req.body.anon,
        edited: true
    };

    await utmQuestCollections.Discussions?.findOneAndUpdate(
        { _id: new ObjectID(req.params.discussionId) }, 
        { $set: discussion }
        ).then((result) => { 
            if (!result) { 
                res.status(400).send(result);
                return;
            }

            res.status(200).send({...result.value, content, date});

        }).catch((error) => { 
            res.status(500).send(error);
        });
}); 

// DELETE .../discussion/:discussionId
discussionRouter.delete('/:discussionId', async (req: Request, res: Response) => { 
    // update content and the deleted flag 
    try { 
        const result = await utmQuestCollections.Discussions?.findOneAndUpdate({_id: new ObjectID(req.params.discussionId)}, 
        {$set: {content: "This message was deleted by the original author or a moderator", deleted: true}}, {returnDocument: 'after'});

        if (!result) { 
            res.status(400).send(`Unable to delete discussion`);
            return;
        };

        res.status(202).send(result);
    } catch (error) { 
        res.status(500).send(error);
    }
});


export default discussionRouter;
