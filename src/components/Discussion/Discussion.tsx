import React, { useState } from "react";
import { BackTop, Divider } from "antd";
import DiscussionType from "../../../backend/types/Discussion";
import GetOPComments from "./fetch/GetOPComments";
import Loading from "../Loading/Loading";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import Editor from "./Editor";
import DisplayComment from "./DisplayComment";


const Discussion = ({ questionId }: { questionId: string }) => {

    const { loading, comments: opComments, error } = GetOPComments(questionId);
    const [comments, setComments] = useState<DiscussionType[]>(opComments);

    const updateComments = (newComment: DiscussionType) => {
        setComments([...comments, newComment]);
    };

    if (loading) return <Loading />;

    if (error !== '') return <ErrorMessage title={error} link='.' message='Refresh' />;

    return (
        <div>
            <Editor questionId={questionId} op updateComments={updateComments} />
            <Divider orientation="left">Replies</Divider>
            {comments.filter(i => i.op).map((item) => (
                <DisplayComment key={item._id} comment={item} />
            ))}
            <BackTop />
        </div>
    );
};

export default Discussion;
