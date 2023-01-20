import { useEffect, useState } from "react";
import { QuestionsType } from "../../../../backend/types/Questions";

const GetEditHistory = (qnsLink: string) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [editHistory, setEditHistory] = useState<QuestionsType[]>([]);
    const [error, setError] = useState<string>("");
    useEffect(() => {
        fetch(
            `${process.env.REACT_APP_API_URI}/question/editHistory/${qnsLink}`
        )
            .then((res: Response) => {
                if (!res.ok) throw Error(res.statusText);
                return res.json();
            }).then((result) => {
                setEditHistory(result);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });

    }, [qnsLink]);

    return {
        loading,
        editHistory,
        error,
    };
};

export default GetEditHistory;