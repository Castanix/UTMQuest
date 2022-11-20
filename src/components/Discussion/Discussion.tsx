import React, { useState } from "react";
import { FloatButton, Divider, List } from "antd";
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
            <List
                header="All Comments"
                itemLayout="horizontal"
                dataSource={comments}
                renderItem={item => (
                    <DisplayComment key={item._id} comment={item} />
                )}
            />
            <Divider orientation="left">Your reply</Divider>
            <Editor discussionId={null} questionLink={questionLink} op updateComments={updateComments} />
            <FloatButton.BackTop />
        </div>
    );
};

export default Discussion;
