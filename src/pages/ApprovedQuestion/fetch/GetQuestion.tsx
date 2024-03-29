import { useEffect, useState } from "react";
import { QuestionsType } from "../../../../backend/types/Questions";

const GetQuestion = (link: string) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [question, setQuestion] = useState<QuestionsType>();
    const [error, setError] = useState<string>("");

    useEffect(() => {
        fetch(
            `${process.env.REACT_APP_API_URI}/question/oneQuestion/${link}`
        )
            .then((res: Response) => {
                if (!res.ok) throw Error(res.statusText);
                return res.json();
            })
            .then((result) => {
                setQuestion(result);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });

    }, [link]);

    return {
        loading,
        question,
        error,
    };
};

export default GetQuestion;