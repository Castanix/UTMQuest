/* eslint-disable */
import { useEffect, useState } from "react";
import { QuestionsType } from "../../../../backend/types/Questions";
import qnsTypeEnum from "../../../pages/AddQuestionPage/types/QnsTypeEnum";

const GetEditHistory = (link: string) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [editHistory, setEditHistory] = useState<QuestionsType[]>([]);
    const [error, setError] = useState<string>("");
    useEffect(() => {
        fetch(
            `${process.env.REACT_APP_API_URI}/question/editHistory/${link}`
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

    }, [link]);

    return {
        loading,
        editHistory,
        error,
    };
};

export default GetEditHistory;