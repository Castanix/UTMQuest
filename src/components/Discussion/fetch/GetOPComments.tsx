import { useState } from "react";
import { DiscussionFrontEndType } from "../../../../backend/types/Discussion";

const GetOPComments = (questionLink: string) => {
    const [loading, setLoading] = useState<boolean>(true);
    const comments: DiscussionFrontEndType[] = [];
    const [error, setError] = useState<string>("");

    fetch(
        `${process.env.REACT_APP_API_URI}/discussion/thread/${questionLink}`
    )
        .then((res: Response) => {
            if (!res.ok) throw Error(res.statusText);
            return res.json();
        })
        .then((result) => {
            comments.push(...result);
            setLoading(false);
        })
        .catch((err) => {
            setError(err.message);
            setLoading(false);
        });

    return {
        loading,
        comments,
        error,
    };
};

export default GetOPComments;