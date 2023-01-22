import React, { useContext, useState } from "react";
import { Popconfirm, Tag, Typography } from "antd";
import { Comment } from '@ant-design/compatible';
import { QuestionOutlined } from "@ant-design/icons";
import MDEditor from "@uiw/react-md-editor";
import { Link } from "react-router-dom";
import { DiscussionFrontEndType } from "../../../backend/types/Discussion";
import GetChildComments from "./fetch/GetChildComments";
import Editor from "./Editor";
import GetRelativeTime from "../../RelativeTime";

import "./Discussion.css";
import { ThemeContext, UserContext } from "../Topbar/Topbar";
import { GetUserInitials } from "../../pages/QuestionsPage/QuestionsList";

const GetUsername = (comment: DiscussionFrontEndType) => {
    const { anon, userId, utorName } = comment;

    if (anon) {
        return <Typography.Text>{utorName}</Typography.Text>;
    }

    return <Link to={`/profile/${userId}`}>{utorName}</Link>;
};

const DoesUserHavePermission = (comment: DiscussionFrontEndType, userId: string, anonId: string) => {

    if (comment.anon) return comment.anonId === anonId;

    return comment.userId === userId;
};

const DisplayComment = ({ comment, qnsDate }: { comment: DiscussionFrontEndType, qnsDate: string }) => {
    const [displayComment, setDisplayComment] = useState<DiscussionFrontEndType>(comment);
    const [childComments, setChildComments] = useState<DiscussionFrontEndType[]>([]);
    const [isDisplayed, setDisplay] = useState(!(displayComment.thread.length > 0));
    const [isEdited, setIsEdited] = useState(comment.edited);
    const [showReply, setShowReply] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const actions = [];

    const isLightMode = useContext(ThemeContext);
    const { userId, anonId } = useContext(UserContext);

    /* callback after a new comment is successfully added to update the parent comment */
    const updateComments = (newComment: DiscussionFrontEndType, edited: boolean) => {
        if (edited) {
            setDisplayComment(
                // ...displayComment,
                // content: newComment.content,
                // date: newComment.date,
                // edited: newComment.edited
                newComment
            );
            setIsEdited(true);
            setShowEdit(false);
        } else {
            setChildComments([...childComments, newComment]);
            setDisplayComment({
                ...displayComment,
                thread: [...displayComment.thread, newComment._id]
            });
            setShowReply(false);
        }
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
                content: result.content,
                deleted: result.deleted
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
        // Need to check if 'user' is author when we get user auth
        DoesUserHavePermission(displayComment, userId, anonId) ?
            <span
                onClick={() => {
                    setShowReply(false);
                    setShowEdit(!showEdit);
                }}
                key="comment-nested-edit"
                role="presentation">
                {
                    // eslint-disable-next-line no-nested-ternary
                    !displayComment.deleted
                        ? showEdit
                            ? "Close"
                            : "Edit"
                        : ""
                }
            </span> : null,
        <span
            onClick={() => {
                setShowEdit(false);
                setShowReply(!showReply);
            }}
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
        DoesUserHavePermission(displayComment, userId, anonId) ?
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
            : null
    ]);

    return (
        <Comment
            actions={actions}
            author={GetUsername(displayComment)}
            datetime={
                <div className="date-tags">
                    {GetRelativeTime(new Date(displayComment.date).getTime())}
                    {isEdited ? <Tag>Edited</Tag> : ""}
                    {Date.parse(displayComment.date) < Date.parse(qnsDate)
                        ? <Tag>Possibly Outdated</Tag>
                        : ""}
                </div>
            }
            avatar={
                < div className='comment-img' >
                    {
                        displayComment.anon ?
                            <QuestionOutlined />
                            :
                            <p>{GetUserInitials(displayComment.utorName)}</p>
                    }
                </div >}
            content={
                displayComment.deleted ?
                    <i>{displayComment.content}</i> :
                    <MDEditor.Markdown warpperElement={{ "data-color-mode": isLightMode ? "light" : "dark" }} source={displayComment.content} />
            }
        >
            {
                childComments.map((item) => (
                    <DisplayComment key={item._id} comment={item} qnsDate={qnsDate} />
                ))
            }

            {
                showReply ?
                    <Editor discussionId={displayComment._id} qnsLink={displayComment.qnsLink} op={false} oldContent="" updateComments={updateComments} thread={[]} anon={false} /> :
                    null
            }

            {
                showEdit ?
                    <Editor discussionId={displayComment._id} qnsLink={displayComment.qnsLink} op={displayComment.op} oldContent={displayComment.content} updateComments={updateComments} thread={displayComment.thread} anon={displayComment.anon} /> :
                    null
            }
        </Comment >
    );
};

export default DisplayComment;