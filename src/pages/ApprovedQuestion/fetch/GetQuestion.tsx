import { useEffect, useState } from "react";
import { QuestionFrontEndType } from "../../../../backend/types/Questions";

const GetQuestion = (qnsLink: string) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [question, setQuestion] = useState<QuestionFrontEndType>();
    const [hasRated, setHasRated] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        fetch(
            `${process.env.REACT_APP_API_URI}/question/oneQuestion/${qnsLink}`
        )
            .then((res: Response) => {
                if (!res.ok) throw Error(res.statusText);
                return res.json();
            })
            .then((result) => {
                setHasRated(result.hasRated);
                setQuestion(result.question);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });

    }, [qnsLink]);

    return {
        loading,
        question,
        hasRated,
        error,
    };
};

export default GetQuestion;