import React, { useState } from "react";
import { BackTop, Divider } from "antd";
import { DiscussionFrontEndType } from "../../../backend/types/Discussion";
import GetOPComments from "./fetch/GetOPComments";
import Loading from "../Loading/Loading";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import Editor from "./Editor";
import DisplayComment from "./DisplayComment";


const Discussion = ({ questionLink }: { questionLink: string }) => {
    
    const { loading, comments: opComments, error } = GetOPComments(questionLink);
    const [comments, setComments] = useState<DiscussionFrontEndType[]>(opComments);

    const updateComments = (newComment: DiscussionFrontEndType) => {
        setComments([...comments, newComment]);
    };

    if (loading) return <Loading />;

    if (error !== '') return <ErrorMessage title={error} link='.' message='Refresh' />;

    return (
        <div>
            <Editor discussionId={null} questionLink={questionLink} op updateComments={updateComments} />
            <Divider orientation="left">Replies</Divider>
            {comments.filter(i => i.op).map((item) => (
                <DisplayComment key={item._id} comment={item} />
            ))}
            <BackTop />
        </div>
    );
};

export default Discussion;
