import { Request, Response, Router } from "express";
import { utmQuestCollections } from "../db/db.service";

const badgeRouter = Router();

badgeRouter.get("/userBadges/:utorid", (req: Request, res: Response) => {
	const { utorid } = req.params;

	utmQuestCollections.Badges?.findOne({ utorid })
		.then((badges) => {
			if (!badges) {
				res.status(404).send(
					`Cannot find badges document for ${utorid}`
				);
				return;
			}

			res.status(200).send({
				unlockedBadges: badges.unlockedBadges,
				displayBadges: badges.displayBadges,
				longestLoginStreak: badges.longestLoginStreak,
			});
		})
		.catch((error) => {
			res.status(500).send(error);
		});
});

badgeRouter.put("/updateBadges", async (req: Request, res: Response) => {
	const { utorid } = req.body;
	const badges = await utmQuestCollections.Badges?.findOne({ utorid });

	if (!badges) {
		res.status(404).send(`Cannot find badges document for ${utorid}`);
		return;
	}

	utmQuestCollections.Badges?.updateOne(badges, {
		$set: { displayBadges: req.body.displayBadges },
	})
		.then((result) => {
			if (!result) {
				res.status(400).send(`Could not update display badges`);
				return;
			}

			res.status(200).send(result);
		})
		.catch((err) => {
			res.status(500).send(err);
		});
});

badgeRouter.put("/unlockTier", async (req: Request, res: Response) => {
	const { utorid } = req.body;
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
		addQuestions,
		editQuestions,
		consecutivePosting,
	}

	if (!(baseBadge in BaseBadges)) {
		res.status(400).send("Invalid base badge specified.");
		return;
	}

	if (!(newBadgeTier in BadgeTiers) || !(oldBadgeTier in BadgeTiers)) {
		res.status(400).send("Invalid badge tier specified.");
		return;
	}

	const badges = await utmQuestCollections.Badges?.findOne({ utorid });

	if (!badges) {
		res.status(404).send(`Cannot find badges document for ${utorid}`);
		return;
	}

	const newUnlockedBadges: { [baseName: string]: string } = {};
	Object.assign(newUnlockedBadges, badges.unlockedBadges);
	newUnlockedBadges[baseBadge] = newBadgeTier;

	// update display badges if needed
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
			displayBadges: displayBadges,
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
