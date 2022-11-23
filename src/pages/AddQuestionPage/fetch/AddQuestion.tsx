import { message, notification } from "antd";
import { QuestionsType } from "../../../../backend/types/Questions";

type BaseBadge = "addQuestions" | "editQuestions" | "consecutivePosting";

const unlockBadge = (utorid: string, baseBadge: BaseBadge, newBadgeTier: string, oldBadgeTier: string) => {
    const request = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ utorid, baseBadge, newBadgeTier, oldBadgeTier })
    };

    fetch(`${process.env.REACT_APP_API_URI}/badge/unlockTier`, request
    ).then((result) => {
        if (!result.ok) throw new Error(result.statusText);

        // update session storage if needed
        if (sessionStorage.getItem("userBadges") !== null) {
            const userBadges = JSON.parse(sessionStorage.getItem("userBadges") ?? JSON.stringify({}));

            // update display badges if needed
            if (utorid in userBadges) {
                const index = userBadges[utorid].displayBadges.findIndex(
                    (item: string) => oldBadgeTier === item
                );

                const displayBadges = [...userBadges[utorid].displayBadges];

                if (index !== -1) {
                    displayBadges.splice(index, 1, newBadgeTier);
                }

                userBadges[utorid].displayBadges = displayBadges;
                sessionStorage.setItem("userBadges", JSON.stringify(userBadges));
            }
        }

    }).catch((error) => {
        console.log(error);
    });
};

const compareQnsObj = (obj1: QuestionsType, obj2: QuestionsType) => {
    // NOTE: Clone object to avoid mutating original!
    const keys = ['_id', 'anon', 'numDiscussions', 'authName', 'authId', 'date', 'latest'];
    const objClone1 = { ...obj1 };
    const objClone2 = { ...obj2 };

    keys.forEach(key => {
        delete objClone1[key as keyof QuestionsType];
        delete objClone2[key as keyof QuestionsType];
    });

    return JSON.stringify(objClone1) === JSON.stringify(objClone2);
};


const checkBadge = (anon: boolean, result: any, goal: [number, number, number], baseBadge: BaseBadge, utorid: string) => {
    // result.questionStatus will contain questionsAdded or questionsEdited

    /* Tier 1 - a questions */
    /* Tier 2 - b questions */
    /* Tier 3 - c questions */
    const [a, b, c] = goal;
    let isUnlocked = false;

    if (!anon) {
        let total = a;
        if (result.questionStatus >= a && result.questionStatus < b) total = b;
        if (result.questionStatus >= b && result.questionStatus < c) total = c;

        if (result.questionStatus >= a && result.questionStatus < b) {

            if (baseBadge === "addQuestions" && result.unlockedBadges.addQuestions !== "addbadge1") {
                unlockBadge(utorid, baseBadge, "addbadge1", "");
                isUnlocked = true;
            }

            else if (baseBadge === "editQuestions" && result.unlockedBadges.editQuestions !== "editbadge1") {
                unlockBadge(utorid, baseBadge, "editbadge1", "");
                isUnlocked = true;
            }

            if (isUnlocked) {
                notification.success({
                    message: "Unlocked a new badge tier!",
                    description: `${result.edit ? "Edit" : "Add"} ${total - result.questionStatus} more question(s) to unlock the next tier (${result.questionStatus}/${total}).`,
                    placement: "bottom"
                });
            }
        }

        else if (result.questionStatus >= b && result.questionStatus < c) {

            if (baseBadge === "addQuestions" && result.unlockedBadges.addQuestions !== "addbadge2") {
                unlockBadge(utorid, baseBadge, "addbadge2", "addbadge1");
                isUnlocked = true;
            }

            else if (baseBadge === "editQuestions" && result.unlockedBadges.editQuestions !== "editbadge2") {
                unlockBadge(utorid, baseBadge, "editbadge2", "editbadge1");
                isUnlocked = true;
            }

            if (isUnlocked) {
                notification.success({
                    message: "Unlocked a new badge tier!",
                    description: `${result.edit ? "Edit" : "Add"} ${total - result.questionStatus} more question(s) to unlock the next tier (${result.questionStatus}/${total}).`,
                    placement: "bottom"
                });
            }
        }

        else {

            if (baseBadge === "addQuestions" && result.unlockedBadges.addQuestions !== "addbadge3") {
                unlockBadge(utorid, baseBadge, "addbadge3", "addbadge2");
                isUnlocked = true;
            }

            else if (baseBadge === "editQuestions" && result.unlockedBadges.editQuestions !== "editbadge3") {
                unlockBadge(utorid, baseBadge, "editbadge3", "editbadge2");
                isUnlocked = true;
            }

            if (isUnlocked) {
                notification.success({
                    message: "Unlocked the final badge tier!",
                    placement: "bottom"
                });
            }
        }

        if (result.questionStatus !== a && result.questionStatus !== b && result.questionStatus < c) {
            notification.success({
                message: `Getting closer to a new badge tier...`,
                description: `${result.edit ? "Edit" : "Add"} ${total - result.questionStatus} more question(s) (${result.questionStatus}/${total}).`,
                placement: "bottom"
            });
        };
    };
};


const AddQuestion = async (addableQuestion: QuestionsType, setRedirect: Function,
    edit: boolean, latestQuestion: QuestionsType) => {

    if (edit) {
        const recovery = Date.parse(addableQuestion.date) < Date.parse(latestQuestion.date);
        if (!compareQnsObj(addableQuestion, latestQuestion)) {
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
                    body: JSON.stringify({ ...addableQuestion, oldVersion: latestQuestion._id })
                }).then((res: Response) => {
                    if (!res.ok) {
                        throw new Error(res.statusText);
                    };
                    return res.json();
                }).then((result) => {
                    if (recovery) {
                        message.success("Question successfully restored.");
                    } else {
                        message.success("Question successfully edited.");
                    };

                    checkBadge(addableQuestion.anon, result, [3, 7, 15], "editQuestions", addableQuestion.authId);
                    setRedirect(result.link);
                }).catch((error) => {
                    message.error(error.message);
                });
        } else {
            if (recovery) {
                message.error("Changes are too identical to latest version");
            } else {
                message.error("No changes were made");
            };
        }
    } else {
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
                body: JSON.stringify(addableQuestion)
            }).then((res: Response) => {
                if (!res.ok) throw new Error("Could not add question. Please try again.");
                return res.json();
            }).then((result) => {
                message.success("Question successfully added.");
                checkBadge(addableQuestion.anon, result, [5, 15, 30], "addQuestions", addableQuestion.authId);

                if (result.consecutivePosting) {
                    if (result.consecutivePosting >= 7 && result.unlockedBadges.consecutivePosting !== "consecutivebadge") {
                        notification.success({
                            message: "Unlocked badge for 7 day consecutive posting!",
                            placement: "bottom"
                        });
                        unlockBadge(addableQuestion.authId, "consecutivePosting", "consecutivebadge", "");
                    } else {
                        notification.success({
                            message: `Posted ${result.consecutivePosting} consecutive days`,
                            description: `Post consecutively for ${7 - result.consecutivePosting} more days to get a badge.`,
                            placement: "bottom"
                        });
                    }
                }

                setRedirect(result.link);
            })
            .catch((error) => {
                message.error(error.message);
            });
    }

};
export default AddQuestion;