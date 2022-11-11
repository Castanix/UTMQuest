import { message, notification } from "antd";
import { QuestionsType } from "../../../../backend/types/Questions";

const compareQnsObj = (obj1: QuestionsType, obj2: QuestionsType) => {
    // NOTE: Clone object to avoid mutating original!
    const keys = ['_id', 'anon', 'numDiscussions', 'authName', 'authId', 'date', 'latest'];
    const objClone1 = { ...obj1 };
    const objClone2 = { ...obj2 };
    // objClone = JSON.parse(JSON.stringify(objClone));

    keys.forEach(key => {
        delete objClone1[key as keyof QuestionsType];
        delete objClone2[key as keyof QuestionsType];
    });

    return JSON.stringify(objClone1) === JSON.stringify(objClone2);
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
                        throw new Error("Could not add question. Possibly not the latest version being edited");
                    };
                    return res.json();
                }).then((result) => {
                    if (recovery) {
                        message.success("Question successfully restored.");
                    } else {
                        message.success("Question successfully edited.");
                    };
                    setRedirect(result.link);
                })
                .catch((error) => {
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
                /* Added questions badge: */
                /* Tier 1 - 5 questions */
                /* Tier 2 - 15 questions */
                /* Tier 3 - 30 questions */
                if (!addableQuestion.anon && result.questionsAdded <= 30) {
                    let total = 5;
                    if (result.questionsAdded >= 5 && result.questionsAdded < 15) total = 15;
                    if (result.questionsAdded >= 15 && result.questionsAdded < 30) total = 30;

                    if (result.questionsAdded === 5 || result.questionsAdded === 15) {
                        notification.success({
                            message: "Unlocked a new badge tier!",
                            description: `Add ${total - result.questionsAdded} more question(s) to unlock the next tier (${result.questionsAdded}/${total}).`,
                            placement: "bottom"
                        });
                    } else if (result.questionsAdded === 30) {
                        notification.success({
                            message: "Unlocked the final badge tier!",
                            placement: "bottom"
                        });
                    } else if (result.questionsAdded !== 30) {
                        notification.success({
                            message: `Getting closer to a new badge tier...`,
                            description: `Add ${total - result.questionsAdded} more question(s) (${result.questionsAdded}/${total}).`,
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