import { message } from 'antd';
import React from 'react';
import DiscussionType from "../../../../backend/types/Discussion";

const GetChildComments = (commentIds: string[], setChildComments: React.Dispatch<React.SetStateAction<DiscussionType[]>>) => {

    const loadingMessage = message.loading('Loading comments', 0);

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
                    _id: '123421',
                    questionId: '1',
                    op: false,
                    authId: 'abcd',
                    authName: 'Bob User',
                    content: 'Child comment',
                    thread: [],
                    date: '10/10/2020',
                    deleted: false,
                    isAnon: false,
                },
                {
                    _id: '12345123',
                    questionId: '1',
                    op: false,
                    authId: '123',
                    authName: 'User Apple',
                    content: 'Another child comment haha',
                    thread: ["1"],
                    date: '10/10/2020',
                    deleted: false,
                    isAnon: false,
                },
                {
                    _id: '12346',
                    questionId: '1',
                    op: false,
                    authId: '45654',
                    authName: 'Anonymous',
                    content: 'haha',
                    thread: [],
                    date: '10/10/2020',
                    deleted: false,
                    isAnon: true,
                },
            ];
            setChildComments(mockData);
            setTimeout(loadingMessage, 1000);
        })
        .catch((error) => {
            message.error(error);
        });
};

export default GetChildComments;