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
discussionRouter.get('/thread/:questionId', async (req: Request, res: Response) => { 
    try { 
        const question = await utmQuestCollections.Questions?.findOne({_id: new ObjectID(req.params.questionId)});

        if (!question) { 
            res.status(404).send(`Error: Unable to find question`); 
            return;
        }

        const discussion = await utmQuestCollections.Discussions?.find({question: new ObjectID(req.params.questionId), op: true}).toArray();

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
discussionRouter.post('/:questionId', async (req: Request, res: Response) => { 
    
    const quesiton = await utmQuestCollections.Questions?.findOne({_id: new ObjectID(req.params.questionId)});
    if (!quesiton) {
        res.status(404).send(`Error: Unable to find question`);
        return;
    };

    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
    const yyyy = today.getFullYear();

    const discussion = {
        question: new ObjectID(req.params.questionId),
        op: req.body.op, 
        authId: req.body.authId,
        authName: req.body.authName,
        content: req.body.content,
        thread: req.body.thread, 
        date: `${mm}/${dd}/${yyyy}`,
        deleted: false,
        anon: req.body.anon
    };     
    
    await utmQuestCollections.Discussions?.insertOne(discussion).then((result)=> { 
        if (!result) {
            res.status(500).send("Unable to add new discussion.");
            return;
        }
        
        res.status(201).send(result);
    }).catch((error) => {
        res.status(500).send(error);
    });;

});


// UPDATE .../discussion/:discussionId
discussionRouter.put('/:discussionId', async (req: Request, res: Response) => { 
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
    const yyyy = today.getFullYear();

    const discussion = {
        op: req.body.op, 
        authId: req.body.authId,
        authName: req.body.authName,
        content: req.body.content,
        thread: req.body.thread, 
        date: `${mm}/${dd}/${yyyy}`,
        deleted: false,
        anon: req.body.anon
    };

    await utmQuestCollections.Discussions?.findOneAndUpdate( { _id: new ObjectID(req.params.discussionId)}, {$set: discussion}).then((result) => { 
        if (!result) { 
            res.status(400).send(result);
			return;
        }

        res.status(200).send('Succesfully updated discussion');

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
