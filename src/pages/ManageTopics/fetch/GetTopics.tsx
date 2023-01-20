import { useEffect, useState } from "react";
import TopicsType from "../../../../backend/types/Topics";

const GetAllTopics = (courseId: string) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [topics, setTopics] = useState<TopicsType[]>([]);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        fetch(
            `${process.env.REACT_APP_API_URI}/topic/getTopics/${courseId}`
        )
            .then((res: Response) => {
                if (!res.ok) throw Error(res.statusText);
                return res.json();
            })
            .then((result) => {
                setTopics(result);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, [courseId]);

    return {
        topics,
        loading,
        error,
    };
};

export default GetAllTopics;