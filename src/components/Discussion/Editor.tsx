import React, { useContext, useState } from "react";
import { Avatar, Button, Checkbox, Form, message, Space, } from "antd";
import TextArea from "antd/es/input/TextArea";
import { Comment } from '@ant-design/compatible';
import rehypeSanitize from "rehype-sanitize";
import MDEditor from "@uiw/react-md-editor";
// import { Link } from "react-router-dom";
import { DiscussionFrontEndType } from "../../../backend/types/Discussion";

import "./Editor.css";
import { onMobile } from "../EditHistory/EditHistory";
import { ThemeContext } from "../Topbar/Topbar";

const AddComment = async (discussionId: string, questionLink: string, op: boolean, content: string, isAnon: boolean) => {
    // MAKE POST CALL HERE
    const newComment: DiscussionFrontEndType = {
        _id: `id${(new Date()).getTime()}`,
        questionLink,
        op,
        authId: 'To be filled in the backend',
        authName: 'To be filled in the backend',
        content,
        thread: [],
        date: new Date().toISOString(),
        deleted: false,
        anon: isAnon,
        edited: false
    };

    const postedComment: DiscussionFrontEndType = await fetch(
        `${process.env.REACT_APP_API_URI}/discussion`,
        {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newComment)
        }
    ).then((res: Response) => {
        if (!res.ok) throw Error(res.statusText);
        return res.json();
    }).then((result) => {
        newComment._id = result.insertedId;
        newComment.authName = result.authName;
        newComment.authId = result.authId;
        return newComment;
    });

    // when making a reply discussionId is not null and therefore need to populate the comment before with the new comment id 
    // Make a get and put request HERE 
    if (discussionId !== null) {
        const prevDiscussion = await fetch(`${process.env.REACT_APP_API_URI}/discussion/${discussionId}`).then((res: Response) => {
            if (!res.ok) throw Error(res.statusText);
            return res.json();
        });

        const updatePrevDiscussion = {
            ...prevDiscussion,
            thread: [...prevDiscussion.thread, postedComment._id]
        };

        // update call 
        await fetch(`${process.env.REACT_APP_API_URI}/discussion/${discussionId}`, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatePrevDiscussion)
        });
    }

    return postedComment;
};

const EditComment = async (discussionId: string, questionLink: string, op: boolean, content: string, isAnon: boolean, thread: string[]) => {
    const editComment: DiscussionFrontEndType = {
        _id: discussionId,
        questionLink,
        op,
        authId: 'To be filled in the backend',
        authName: 'To be filled in the backend',
        content,
        thread,
        date: new Date().toISOString(),
        deleted: false,
        anon: isAnon,
        edited: true
    };

    const editedComment: DiscussionFrontEndType = await fetch(`${process.env.REACT_APP_API_URI}/discussion/updatePost/${discussionId}`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(editComment)
    }).then((res: Response) => {
        if (!res.ok) throw Error(res.statusText);
        return res.json();
    }).then((result) => result);

    return editedComment;
};

const Editor = ({ discussionId, questionLink, op, oldContent, updateComments, thread }: { discussionId: string | null, questionLink: string, op: boolean, oldContent: string, updateComments: Function, thread: string[] }) => {
    const [content, setContent] = useState<string>(oldContent);
    const [isAnon, setAnon] = useState<boolean>(false);
    // const [commented, setCommented] = useState<DiscussionFrontEndType>();
    const [submitDisabled, setSubmitDisabled] = useState(false);

    const isLightMode = useContext(ThemeContext);

    const onSubmit = async () => {
        if (content.trim().length <= 0) {
            message.info("Invalid comment.");
            return;
        };

        setSubmitDisabled(true);

        if (oldContent === "") {
            const newComment = await AddComment(discussionId as string, questionLink, op, content, isAnon);
            updateComments(newComment, false);
            // setCommented(newComment);
            setContent("");
            setAnon(false);
        } else {
            if (oldContent === content) {
                message.error("No update was made");
                return;
            }
            const editedComment = await EditComment(discussionId as string, questionLink, op, content, isAnon, thread);
            updateComments(editedComment, true);
        };

        setSubmitDisabled(false);
    };

    return (
        <Comment
            avatar={
                <Avatar src="https://joeschmoe.io/api/v1/random" alt="Han Solo" />
            }
            // author={<Link to="/">{commented?.authName ?? 'Anonymous'}</Link>}
            content={
                <span>
                    <Form.Item>
                        {!onMobile() ?
                            <MDEditor
                                height={300}
                                value={content}
                                textareaProps={{ placeholder: "Add a comment", maxLength: 4000 }}
                                onChange={(e) => setContent(e ?? "")}
                                highlightEnable={false}
                                data-color-mode={isLightMode ? "light" : "dark"}
                                previewOptions={{
                                    rehypePlugins: [[rehypeSanitize]]
                                }}
                            />
                            :
                            <TextArea placeholder="Add a comment" onChange={(e) => setContent(e.target.value)} value={content} rows={2} />
                        }
                        <span className="editor-count">{content.length} / 4000</span>
                    </Form.Item>
                    <Form.Item>
                        <Space className="post-toolbar">
                            <Button shape="round" onClick={onSubmit} type="primary" disabled={submitDisabled}>
                                Add Comment
                            </Button>
                            {
                                oldContent === "" ?
                                    <Checkbox onChange={() => setAnon(!isAnon)} checked={isAnon}>
                                        Post Anonymously (to other users only)
                                    </Checkbox> :
                                    ""
                            }

                        </Space>
                    </Form.Item>
                </span>
            }
        />
    );
};

export default Editor;