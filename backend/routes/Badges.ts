import { Request, Response, Router } from "express";
import { utmQuestCollections } from "../db/db.service";

const badgeRouter = Router();

badgeRouter.get('/userBadges/:utorId', (req: Request, res: Response) => {
    const { utorId } = req.params;

    utmQuestCollections.Badges?.findOne({utorId})
        .then(badges => {
            if(!badges) {
                res.status(404).send(`Cannot find badges document for ${utorId}`);
                return;
            };
        
            res.status(200).send({
                unlockedBadges: badges.unlockedBadges, 
                displayBadges: badges.displayBadges,
                longestLoginStreak: badges.longestLoginStreak
            });
        }).catch(error => {
            res.status(500).send(error);
        });
});

badgeRouter.put('/updateBadges', async (req: Request, res: Response) => {
    const { utorid: utorId } = req.headers;
    const badges = await utmQuestCollections.Badges?.findOne({ utorId });

    if(!badges) {
        res.status(404).send(`Cannot find badges document for ${ utorId }`);
        return;
    };

    utmQuestCollections.Badges?.updateOne(badges, {
        $set: {displayBadges: req.body.displayBadges}
    }).then(result => {
        if(!result) {
            res.status(400).send(`Could not update display badges`);
            return;
        }
        
        res.status(200).send({ utorId });
    }).catch(err => {
        res.status(500).send(err);
    });
});

badgeRouter.put("/unlockTier", async (req: Request, res: Response) => {
	const { utorid: utorId } = req.headers;
	const { baseBadge } = req.body;
	const { newBadgeTier } = req.body;
	const { oldBadgeTier } = req.body;

	enum BadgeTiers {
		"",
		consecutivebadge,
		addbadge1,
		addbadge2,
		addbadge3,
		editbadge1,
		editbadge2,
		editbadge3,
	}

	enum BaseBadges {
		addQns,
		editQns,
		consecutivePosting,
	}

	// base badge must be one of the unlockable badges
	if (!(baseBadge in BaseBadges)) {
		res.status(400).send("Invalid base badge specified.");
		return;
	}

	// newBadgeTier and oldBadgeTier must be an existing badge tier
	// (empty string represents the locked badge)
	if (!(newBadgeTier in BadgeTiers) || !(oldBadgeTier in BadgeTiers)) {
		res.status(400).send("Invalid badge tier specified.");
		return;
	}

	const badges = await utmQuestCollections.Badges?.findOne({ utorId });

	if (!badges) {
		res.status(404).send(`Cannot find badges document for ${utorId}`);
		return;
	}

	// update badge tier given the baseBadge
	const newUnlockedBadges: { [baseName: string]: string } = {};
	Object.assign(newUnlockedBadges, badges.unlockedBadges);
	newUnlockedBadges[baseBadge] = newBadgeTier;

	// update display badges if needed
	// by finding the oldTier and replacing it with the new tier
	const index = badges.displayBadges.findIndex(
		(item: string) => oldBadgeTier === item
	);

	const displayBadges = [...badges.displayBadges];

	if (index !== -1) {
		displayBadges.splice(index, 1, newBadgeTier);
	}

	utmQuestCollections.Badges?.updateOne(badges, {
		$set: {
			unlockedBadges: newUnlockedBadges,
			displayBadges,
		},
	})
		.then((result) => {
			if (!result) {
				res.status(400).send(`Could not update unlocked badges`);
				return;
			}
			
			res.status(201).send(result);
		})
		.catch((err) => {
			res.status(500).send(err);
		});
});

export default badgeRouter;