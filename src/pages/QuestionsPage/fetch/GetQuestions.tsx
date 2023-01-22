import { useEffect, useState } from "react";
import { QuestionFrontEndType } from "../../../../backend/types/Questions";

const GetQuestions = (courseId: string) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [questions, setQuestions] = useState<QuestionFrontEndType[]>([]);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        fetch(
            `${process.env.REACT_APP_API_URI}/question/latestQuestions/${courseId}`
        )
            .then((res: Response) => {
                if (!res.ok) throw Error(res.statusText);
                return res.json();
            })
            .then((result) => {
                setQuestions(result);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });

    }, [courseId]);

    return {
        loading,
        questions,
        error,
    };
};

export default GetQuestions;