import React, { useState } from "react";
import { Comment, Popconfirm } from "antd";
import { QuestionOutlined } from "@ant-design/icons";
import MDEditor from "@uiw/react-md-editor";
import { Link } from "react-router-dom";
import { DiscussionFrontEndType } from "../../../backend/types/Discussion";
import GetChildComments from "./fetch/GetChildComments";
import Editor from "./Editor";

import "./Discussion.css";

const DisplayComment = ({ comment }: { comment: DiscussionFrontEndType }) => {
    const [displayComment, setDisplayComment] = useState<DiscussionFrontEndType>(comment);
    const [childComments, setChildComments] = useState<DiscussionFrontEndType[]>([]);
    const [isDisplayed, setDisplay] = useState(!(displayComment.thread.length > 0));
    const [showReply, setShowReply] = useState(false);
    const actions = [];

    /* callback after a new comment is successfully added to update the parent comment */
    const updateComments = (newComment: DiscussionFrontEndType) => {
        setChildComments([...childComments, newComment]);
        setDisplayComment({
            ...displayComment,
            thread: [...displayComment.thread, newComment._id]
        });
        setShowReply(false);
    };

    /* executes when you delete a comment */
    const onDeleteClick = () => {
        // MAKE DELETE CALL
        fetch(`${process.env.REACT_APP_API_URI}/discussion/${comment._id}`, { 
            method: 'DELETE'
        }).then((res: Response) => { 
            if (!res.ok) throw Error(res.statusText);
            return res.json();
        }).then((result) => { 
            setDisplayComment({
                ...displayComment,
                content: result.value.content,
                deleted: result.value.deleted
            });  
        });
    };

    /* executes when you expand or collapse replies */
    const onRepliesClick = () => {
        if (!isDisplayed) GetChildComments(displayComment.thread, setChildComments);
        if (isDisplayed) setChildComments([]);
        setDisplay(!isDisplayed);
    };


    if (displayComment.thread.length > 0 || childComments.length > 0) {
        actions.push(
            <span onClick={onRepliesClick} role="presentation">
                {isDisplayed ? "View less replies" : "View more replies"}
            </span>
        );
    }
    actions.push([
        <span
            onClick={() => setShowReply(!showReply)}
            key="comment-nested-reply-to"
            role="presentation"
        >
            {
            // eslint-disable-next-line no-nested-ternary
            !displayComment.deleted 
                ? !showReply 
                    ? "Reply to" 
                    : "Close"
                : ""
            }
        </span>,
        <span
            key="comment-nested-delete"
        >
            {!displayComment.deleted ?
                <Popconfirm title="Sure to delete?" onConfirm={onDeleteClick}>
                    Delete
                </Popconfirm>
                : ""
            }
        </span>
    ]);

    const name = displayComment.authName.split(" ");
    const firstInitial = name[0][0];
    const lastInitial = name[name.length - 1][0];

    return (
        <Comment
            actions={actions}
            author={<span><Link to="/">{displayComment.authName}</Link> on {new Date(displayComment.date).toDateString()}</span>}
            avatar={
                <div className='comment-img'>
                    {displayComment.anon ?
                        <QuestionOutlined />
                        :
                        <p>{firstInitial.concat(lastInitial)}</p>
                    }
                </div>}
            content={displayComment.deleted ? <i>{displayComment.content}</i> : <MDEditor.Markdown warpperElement={{ "data-color-mode": "light" }} source={displayComment.content} />}
        >
            {childComments.map((item) => (<DisplayComment key={item._id} comment={item} />)
            )}
            {showReply ? <Editor discussionId={displayComment._id} questionId={displayComment.question} op={false} updateComments={updateComments} /> : null}
        </Comment>
    );
};

export default DisplayComment;