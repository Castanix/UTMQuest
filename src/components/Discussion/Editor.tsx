import React, { useState } from "react";
import { Avatar, Button, Checkbox, Comment, Form, message, Space, } from "antd";
import rehypeSanitize from "rehype-sanitize";
import MDEditor from "@uiw/react-md-editor";
import { Link } from "react-router-dom";
import { DiscussionFrontEndType } from "../../../backend/types/Discussion";

import "./Editor.css";

const AddComment = async (discussionId: string, questionId: string, op: boolean, content: string, isAnon: boolean) => {
    // MAKE POST CALL HERE
    const newComment: DiscussionFrontEndType = {
        _id: `id${(new Date()).getTime()}`,
        question: questionId,
        op,
        authId: '123',
        authName: isAnon ? "Anonymous" : "Some User",
        content,
        thread: [],
        date: new Date().toLocaleDateString(),
        deleted: false,
        anon: isAnon,
    };

    const postedComment: DiscussionFrontEndType = await fetch(
        `${process.env.REACT_APP_API_URI}/discussion/${questionId}`,
        {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newComment)}
    ).then((res: Response) => { 
        if (!res.ok) throw Error(res.statusText);
        return res.json();
    }).then((result) => { 
        newComment._id = result.insertedId;
        return newComment;
    });
    
    // when making a reply discussionId is not null and therefore need to populate the comment before with the new comment id 
    // Make a get and put request HERE 
    if (discussionId !== null) {
        const prevDiscussion = await fetch(`${process.env.REACT_APP_API_URI}/discussion/${discussionId}`).then((res: Response)=>{
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

const Editor = ({ discussionId, questionId, op, updateComments }: { discussionId: string | null, questionId: string, op: boolean, updateComments: Function }) => {
    const [content, setContent] = useState<string>("");
    const [isAnon, setAnon] = useState<boolean>(false);
    const [commented, setCommented] = useState<DiscussionFrontEndType>();

    const onSubmit = async () => {
        if (content.trim().length <= 0) {
            message.info("Invalid comment.");
            return;
        }
        const newComment = await AddComment(discussionId as string, questionId, op, content, isAnon);
        updateComments(newComment);
        setCommented(newComment);
        setContent("");
        setAnon(false);
    };

    return (
        <Comment
            avatar={
                <Avatar src="https://joeschmoe.io/api/v1/random" alt="Han Solo" />
            }
            author={<Link to="/">{commented?.authName ?? 'Anonymous'}</Link>}
            content={
                <span>
                    <Form.Item>
                        <MDEditor
                            height={300}
                            value={content}
                            textareaProps={{ placeholder: "Add a comment", maxLength: 4000 }}
                            onChange={(e) => setContent(e ?? "")}
                            highlightEnable={false}
                            data-color-mode="light"
                            previewOptions={{
                                rehypePlugins: [[rehypeSanitize]]
                            }}
                        />
                        <span className="editor-count">{content.length} / 4000</span>
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button onClick={onSubmit} type="primary">
                                Add Comment
                            </Button>
                            <Checkbox onChange={() => setAnon(!isAnon)} checked={isAnon}>
                                Post Anonymously (to other users only)
                            </Checkbox>
                        </Space>
                    </Form.Item>
                </span>
            }
        />
    );
};

export default Editor;