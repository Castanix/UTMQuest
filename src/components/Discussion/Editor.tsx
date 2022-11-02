import React, { useState } from "react";
import { Avatar, Button, Checkbox, Comment, Form, message, Space, } from "antd";
import rehypeSanitize from "rehype-sanitize";
import MDEditor from "@uiw/react-md-editor";
import { Link } from "react-router-dom";
import DiscussionType from "../../../backend/types/Discussion";

import "./Editor.css";

const AddComment = (questionId: string, op: boolean, content: string, isAnon: boolean) => {
    // MAKE POST CALL HERE
    const newComment: DiscussionType = {
        _id: `id${(new Date()).getTime()}`,
        questionId,
        op,
        authId: '123',
        authName: isAnon ? "Anonymous" : "Some User",
        content,
        thread: [],
        date: new Date().toLocaleDateString(),
        deleted: false,
        isAnon,
    };

    return newComment;
};

const Editor = ({ questionId, op, updateComments }: { questionId: string, op: boolean, updateComments: Function }) => {
    const [content, setContent] = useState<string>("");
    const [isAnon, setAnon] = useState<boolean>(false);

    const onSubmit = () => {
        if (content.trim().length <= 0) {
            message.info("Invalid comment.");
            return;
        }
        const newComment = AddComment(questionId, op, content, isAnon);
        updateComments(newComment);
        setContent("");
        setAnon(false);
    };

    return (
        <Comment
            avatar={
                <Avatar src="https://joeschmoe.io/api/v1/random" alt="Han Solo" />
            }
            author={<Link to="/">Han Solo</Link>}
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