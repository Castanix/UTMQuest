import { message } from 'antd';
import React from 'react';
import { DiscussionFrontEndType } from "../../../../backend/types/Discussion";

const GetChildComments = (commentIds: string[], setChildComments: React.Dispatch<React.SetStateAction<DiscussionFrontEndType[]>>) => {

    const loadingMessage = message.loading('Loading comments', 0);

    let lstOfIds = '';
    for (let i = 0; i < commentIds.length; i++) {
        lstOfIds = lstOfIds.concat(`id${i}=${commentIds[i]}&`);
    }

    fetch(
        `${process.env.REACT_APP_API_URI}/discussion/allThreads/ids?${lstOfIds.slice(0, -1)}`
    )
        .then((res: Response) => {
            if (!res.ok) throw Error(res.statusText);
            return res.json();
        })
        .then((result) => {
            setChildComments(result);
            setTimeout(loadingMessage, 10);
        })
        .catch((error) => {
            message.error(error);
        });
};

export default GetChildComments;