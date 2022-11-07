import { useEffect, useState } from "react";
import { QuestionsType } from "../../../../backend/types/Questions";

const GetQuestions = (courseCode: string) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [questions, setQuestions] = useState<QuestionsType[]>([]);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        fetch(
            `${process.env.REACT_APP_API_URI}/question/latestQuestions/${courseCode}/dummy23`
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

    }, [courseCode]);

    return {
        loading,
        questions,
        error,
    };
};

export default GetQuestions;