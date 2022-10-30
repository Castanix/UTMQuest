/* eslint-disable */

import { message } from "antd";
import QuestionsType from "../../../../backend/types/Questions";

const AddQuestion = async (questionObj: QuestionsType) => {

    await fetch(`${process.env.REACT_APP_API_URI}/question/addQuestion`,
    {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(questionObj)
    }).then((res: Response) => {
        if (!res.ok) {
            message.error("Could not add course. Please try again.");
            return;
        }
        message.success("Course successfully added.");
    }).catch(() => {
        message.error("Could not add course. Please try again.");
    });
};

export default AddQuestion;