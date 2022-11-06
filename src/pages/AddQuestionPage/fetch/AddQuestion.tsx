import { message } from "antd";
import { QuestionsType } from "../../../../backend/types/Questions";

const AddQuestion = async (questionObj: QuestionsType, setRedirect: Function) => {
    
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
            body: JSON.stringify(questionObj)
        }).then((res: Response) => {
            if (!res.ok) throw new Error("Could not add course. Please try again.");
            return res.json();
        }).then((result) => {
            message.success("Course successfully added.");
            setRedirect(result.link);
        })
        .catch((error) => {
            message.error(error);
        });
};
export default AddQuestion;