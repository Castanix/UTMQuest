import { message, notification } from "antd";
import { QuestionFrontEndType } from "../../../../backend/types/Questions";

type BaseBadge = "addQns" | "editQns" | "consecutivePosting";

const unlockBadge = (userId: string, baseBadge: BaseBadge, newBadgeTier: string, oldBadgeTier: string) => {
    const request = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseBadge, newBadgeTier, oldBadgeTier })
    };

    fetch(`${process.env.REACT_APP_API_URI}/badge/unlockTier`, request
    ).then((result) => {
        if (!result.ok) throw new Error(result.statusText);

        // update session storage if needed
        if (sessionStorage.getItem("userBadges") !== null) {
            const userBadges = JSON.parse(sessionStorage.getItem("userBadges") ?? JSON.stringify({}));

            // update display badges if needed
            if (userId in userBadges) {
                const index = userBadges[userId].displayBadges.findIndex(
                    (item: string) => oldBadgeTier === item
                );

                const displayBadges = [...userBadges[userId].displayBadges];

                if (index !== -1) {
                    displayBadges.splice(index, 1, newBadgeTier);
                }

                userBadges[userId].displayBadges = displayBadges;
                sessionStorage.setItem("userBadges", JSON.stringify(userBadges));
            }
        }

    }).catch((error) => {
        console.log(error);
    });
};


const checkBadge = (anon: boolean, result: any, goal: [number, number, number], baseBadge: BaseBadge, userId: string) => {
    // result.questionStatus will contain questionsAdded or questionsEdited

    /* Tier 1 - a questions */
    /* Tier 2 - b questions */
    /* Tier 3 - c questions */
    const [a, b, c] = goal;
    let isUnlocked = false;

    if (!anon) {
        let total = a;
        if (result.qnsStatus >= a && result.qnsStatus < b) total = b;
        if (result.qnsStatus >= b && result.qnsStatus < c) total = c;

        if (result.qnsStatus >= a && result.qnsStatus < b) {

            if (baseBadge === "addQns" && result.unlockedBadges.addQns !== "addbadge1") {
                unlockBadge(userId, baseBadge, "addbadge1", "");
                isUnlocked = true;
            }

            else if (baseBadge === "editQns" && result.unlockedBadges.editQns !== "editbadge1") {
                unlockBadge(userId, baseBadge, "editbadge1", "");
                isUnlocked = true;
            }

            if (isUnlocked) {
                notification.success({
                    message: "Unlocked a new badge tier!",
                    description: `${result.edit ? "Edit" : "Add"} ${total - result.qnsStatus} more question(s) to unlock the next tier (${result.qnsStatus}/${total}).`,
                    placement: "bottom"
                });
            }
        }

        else if (result.qnsStatus >= b && result.qnsStatus < c) {

            if (baseBadge === "addQns" && result.unlockedBadges.addQns !== "addbadge2") {
                unlockBadge(userId, baseBadge, "addbadge2", "addbadge1");
                isUnlocked = true;
            }

            else if (baseBadge === "editQns" && result.unlockedBadges.editQns !== "editbadge2") {
                unlockBadge(userId, baseBadge, "editbadge2", "editbadge1");
                isUnlocked = true;
            }

            if (isUnlocked) {
                notification.success({
                    message: "Unlocked a new badge tier!",
                    description: `${result.edit ? "Edit" : "Add"} ${total - result.qnsStatus} more question(s) to unlock the next tier (${result.qnsStatus}/${total}).`,
                    placement: "bottom"
                });
            }
        }

        else if (result.qnsStatus >= c) {

            if (baseBadge === "addQns" && result.unlockedBadges.addQns !== "addbadge3") {
                unlockBadge(userId, baseBadge, "addbadge3", "addbadge2");
                isUnlocked = true;
            }

            else if (baseBadge === "editQns" && result.unlockedBadges.editQns !== "editbadge3") {
                unlockBadge(userId, baseBadge, "editbadge3", "editbadge2");
                isUnlocked = true;
            }

            if (isUnlocked) {
                notification.success({
                    message: "Unlocked the final badge tier!",
                    placement: "bottom"
                });
            }
        }

        if (result.qnsStatus !== a && result.qnsStatus !== b && result.qnsStatus < c) {
            notification.success({
                message: `Getting closer to a new badge tier...`,
                description: `${result.edit ? "Edit" : "Add"} ${total - result.qnsStatus} more question(s) (${result.qnsStatus}/${total}).`,
                placement: "bottom"
            });
        };
    };
};


const AddQuestion = async (addableQns: QuestionFrontEndType, setRedirect: Function, setIsSubmit: Function) => {
    fetch(`${process.env.REACT_APP_API_URI}/question/addQuestion`,
        {
            method: 'POST',
            redirect: "follow",
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(addableQns)
        }).then((res: Response) => {
            if (!res.ok) throw new Error("Could not add question. Please try again.");
            return res.json();
        }).then((result) => {
            message.success("Question successfully added.");
            checkBadge(addableQns.anon, result, [5, 15, 30], "addQns", addableQns.userId);

                if (result.consecutivePosting) {
                    if (result.consecutivePosting >= 7 && result.unlockedBadges.consecutivePosting !== "consecutivebadge") {
                        notification.success({
                            message: "Unlocked badge for 7 day consecutive posting!",
                            placement: "bottom"
                        });
                        unlockBadge(addableQns.userId, "consecutivePosting", "consecutivebadge", "");

                } else if (result.consecutivePosting < 7) {
                    notification.success({
                        message: `Posted ${result.consecutivePosting} consecutive days`,
                        description: `Post consecutively for ${7 - result.consecutivePosting} more days to get a badge.`,
                        placement: "bottom"
                    });
                }
            }

            setRedirect(result.qnsLink);
            setIsSubmit(false);
        })
        .catch((error) => {
            message.error(error.message);
        });
    
    setIsSubmit(false);

};

const EditQuestion = async (editedQns: QuestionFrontEndType, setIsSubmit: Function, setRedirect: Function) => {
    fetch(`${process.env.REACT_APP_API_URI}/question/editQuestion`,
        {
            method: 'POST',
            redirect: "follow",
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(editedQns)
        }).then((res: Response) => {
            if (!res.ok) {
                throw new Error(res.statusText);
            };
            return res.json();
        }).then((result) => {
            checkBadge(editedQns.anon, result, [3, 7, 15], "editQns", editedQns.userId);
            setIsSubmit(false);
            setRedirect(result.qnsLink);
        }).catch((error) => {
            message.error(error.message);
        });
};

const RestoreQuestion = async (restorableQns: QuestionFrontEndType, setIsSubmit: Function, setRedirect: Function) => {
    fetch(`${process.env.REACT_APP_API_URI}/question/restoreQuestion`,
        {
            method: 'PUT',
            redirect: "follow",
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(restorableQns)
        }).then((res: Response) => {
            if (!res.ok) {
                throw new Error(res.statusText);
            };
            return res.json();
        }).then((result) => {
            setIsSubmit(false);
            setRedirect(result.qnsLink);
        }).catch((error) => {
            message.error(error.message);
        });
};

export {
    AddQuestion,
    EditQuestion,
    RestoreQuestion
};