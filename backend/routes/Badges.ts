import { Request, Response, Router } from "express";
import { utmQuestCollections } from "../db/db.service";

const badgeRouter = Router();

badgeRouter.get('/userBadges/:utorid', (req: Request, res: Response) => {
    const {utorid} = req.params;

    utmQuestCollections.Badges?.findOne({utorid})
        .then(badges => {
            if(!badges) {
                res.status(404).send(`Cannot find badges document for ${utorid}`);
                return;
            };
        
            res.status(200).send({unlockedBadges: badges.unlockedBadges, displayBadges: badges.displayBadges});
        }).catch(error => {
            res.status(500).send(error);
        });
});

badgeRouter.put('/updateBadges', async (req: Request, res: Response) => {
    const {utorid} = req.body;
    const badges = await utmQuestCollections.Badges?.findOne({utorid});

    if(!badges) {
        res.status(404).send(`Cannot find badges document for ${utorid}`);
        return;
    };

    utmQuestCollections.Badges?.updateOne(badges, {
        $set: {displayBadges: req.body.displayBadges}
    }).then(result => {
        if(!result) {
            res.status(400).send(`Could not update display badges`);
            return;
        }
        
        res.status(200).send(result);
    }).catch(err => {
        res.status(500).send(err);
    });
});

export default badgeRouter;