import { useState } from "react";
import DiscussionType from "../../../../backend/types/Discussion";

const GetOPComments = (questionId: string) => {
    const [loading, setLoading] = useState<boolean>(true);
    const comments: DiscussionType[] = [];
    const [error, setError] = useState<string>("");

    fetch(
        `${process.env.REACT_APP_API_URI}/express_backend`
    )
        .then((res: Response) => {
            if (!res.ok) throw Error(res.statusText);
            return res.json();
        })
        .then(() => {
            // setComments(result);
            // MOCK DATA
            const mockData: DiscussionType[] = [
                {
                    _id: questionId,
                    questionId: '1',
                    op: true,
                    authId: 'abcd',
                    authName: 'Bob User',
                    content: 'Test comment',
                    thread: ["c1", "c2"],
                    date: '10/10/2020',
                    deleted: false,
                    isAnon: false,
                },
                {
                    _id: '12345',
                    questionId: '1',
                    op: true,
                    authId: '123',
                    authName: 'User Banana',
                    content: 'haha',
                    thread: [],
                    date: '10/10/2020',
                    deleted: false,
                    isAnon: false,
                },
                {
                    _id: '12346',
                    questionId: '1',
                    op: true,
                    authId: '45654',
                    authName: 'Anonymous',
                    content: 'haha',
                    thread: [],
                    date: '10/10/2020',
                    deleted: false,
                    isAnon: true,
                },
            ];
            comments.push(...mockData);
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