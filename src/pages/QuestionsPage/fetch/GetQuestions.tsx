import { useEffect, useState } from "react";
import { QuestionsType } from "../../../../backend/types/Questions";

const GetQuestions = (courseCode: string, getApproved: boolean) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [questions, setQuestions] = useState<QuestionsType[]>([]);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        fetch(
            `${process.env.REACT_APP_API_URI}/question/${courseCode}/${getApproved ? 'approved' : 'pending'}`
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

    }, [courseCode, getApproved]);

    return {
        loading,
        questions,
        error,
    };
};

export default GetQuestions;