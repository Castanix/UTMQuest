import React, { useState } from "react";
import { FloatButton, Divider, List } from "antd";
import { DiscussionFrontEndType } from "../../../backend/types/Discussion";
import GetOPComments from "./fetch/GetOPComments";
import Loading from "../Loading/Loading";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import Editor from "./Editor";
import DisplayComment from "./DisplayComment";


const Discussion = ({ questionLink, questionDate }: { questionLink: string, questionDate: string }) => {

    const { loading, comments: opComments, utorid, error } = GetOPComments(questionLink);
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
                    <DisplayComment key={item._id} comment={item} questionDate={questionDate} utorid={utorid} />
                )}
            />
            <Divider orientation="left">Post a Comment</Divider>
            <Editor discussionId={null} questionLink={questionLink} op oldContent="" updateComments={updateComments} thread={[]} />
            <FloatButton.BackTop />
        </div>
    );
};

export default Discussion;
