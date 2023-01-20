import { useEffect, useMemo, useState } from "react";
import { DiscussionFrontEndType } from "../../../../backend/types/Discussion";

const GetOPComments = (qnsLink: string) => {
    const [loading, setLoading] = useState<boolean>(true);
    const comments: DiscussionFrontEndType[] = useMemo(() => [], []);
    const [utorId, setUtorId] = useState<string>("");
    const [error, setError] = useState<string>("");

    useEffect(() => {
        fetch(
            `${process.env.REACT_APP_API_URI}/discussion/thread/${qnsLink}`
        )
            .then((res: Response) => {
                if (!res.ok) throw Error(res.statusText);
                return res.json();
            })
            .then((result) => {
                comments.push(...result.discussion);
                setUtorId(result.utorId);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, [comments, qnsLink]);

    return {
        loading,
        comments,
        utorId,
        error,
    };
};

export default GetOPComments;