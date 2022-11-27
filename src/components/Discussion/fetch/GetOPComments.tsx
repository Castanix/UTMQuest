import { useEffect, useMemo, useState } from "react";
import { DiscussionFrontEndType } from "../../../../backend/types/Discussion";

const GetOPComments = (questionLink: string) => {
    const [loading, setLoading] = useState<boolean>(true);
    const comments: DiscussionFrontEndType[] = useMemo(() => [], []);
    const [utorid, setUtorid] = useState<string>("");
    const [error, setError] = useState<string>("");

    useEffect(() => {
        fetch(
            `${process.env.REACT_APP_API_URI}/discussion/thread/${questionLink}`
        )
            .then((res: Response) => {
                if (!res.ok) throw Error(res.statusText);
                return res.json();
            })
            .then((result) => {
                comments.push(...result.discussion);
                setUtorid(result.utorid);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, [comments, questionLink]);

    return {
        loading,
        comments,
        utorid,
        error,
    };
};

export default GetOPComments;