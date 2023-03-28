import React, { useContext, useState } from "react";
import { Button, Checkbox, Form, message, Space, } from "antd";
import { Comment } from '@ant-design/compatible';
import { Editor as MDEditor } from '@tinymce/tinymce-react';
// import { Link } from "react-router-dom";
import { DiscussionFrontEndType } from "../../../backend/types/Discussion";
import "./Editor.css";
import { ThemeContext, UserContext } from "../Topbar/Topbar";
import { GetUserInitials } from "../../pages/QuestionsPage/QuestionsList";

const AddComment = async (discussionId: string, qnsLink: string, op: boolean, content: string, isAnon: boolean, userId: string, anonId: string) => {
    // MAKE POST CALL HERE
    const newComment: DiscussionFrontEndType = {
        _id: `id${(new Date()).getTime()}`,
        qnsLink,
        op,
        utorName: 'To be filled in the backend',
        userId,
        anonId,
        content,
        thread: [],
        opDate: new Date().toISOString(),
        editDate: null,
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
        newComment.utorName = result.utorName;
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

const EditComment = async (discussionId: string, qnsLink: string, op: boolean, content: string, isAnon: boolean, thread: string[], userId: string, anonId: string) => {
    const editComment: DiscussionFrontEndType = {
        _id: discussionId,
        qnsLink,
        op,
        utorName: 'To be filled in the backend',
        userId,
        anonId,
        content,
        thread,
        opDate: "N/A",
        editDate: new Date().toISOString(),
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

const Editor = ({ discussionId, qnsLink, op, oldContent, updateComments, thread, anon }: { discussionId: string | null, qnsLink: string, op: boolean, oldContent: string, updateComments: Function, thread: string[], anon: boolean }) => {
    const [content, setContent] = useState<string>(oldContent);
    const [isAnon, setAnon] = useState<boolean>(anon);
    // const [commented, setCommented] = useState<DiscussionFrontEndType>();
    const [submitDisabled, setSubmitDisabled] = useState(false);

    const isLightMode = useContext(ThemeContext);
    const { username, userId, anonId } = useContext(UserContext);

    const onSubmit = async () => {
        if (content.trim().length <= 0) {
            message.info("Invalid comment.");
            return;
        };

        setSubmitDisabled(true);

        if (oldContent === "") {
            const newComment = await AddComment(discussionId as string, qnsLink, op, content, isAnon, userId, anonId);
            updateComments(newComment, false);
            // setCommented(newComment);
            setContent("");
            setAnon(false);
        } else {
            if (oldContent === content) {
                message.error("No update was made");
                setSubmitDisabled(false);
                return;
            }
            const editedComment = await EditComment(discussionId as string, qnsLink, op, content, isAnon, thread, userId, anonId);
            updateComments(editedComment, true);
        };

        setSubmitDisabled(false);
    };

    return (
        <Comment
            avatar={
                <div className="comment-img">
                    <p>{GetUserInitials(username)}</p>
                </div>
            }
            // author={<Link to="/">{commented?.utorName ?? 'Anonymous'}</Link>}
            content={
                <span>
                    <Form.Item>
                        <MDEditor
                            key={isLightMode.toString()}
                            apiKey="qagffr3pkuv17a8on1afax661irst1hbr4e6tbv888sz91jc"
                            value={content}
                            init={{
                                plugins:
                                    'print preview paste importcss searchreplace autolink directionality code visualblocks visualchars fullscreen image link media codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists wordcount imagetools textpattern noneditable help charmap emoticons',
                                menubar: 'file edit view insermt format tools table help',
                                content_css: isLightMode ? 'default' : 'dark',
                                skin: isLightMode ? 'oxide' : 'oxide-dark',
                                toolbar_mode: 'sliding',
                                height: 500,
                                toolbar:
                                    '| mybutton additem delete | undo redo | bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons | fullscreen  preview  print | insertfile image media link anchor codesample | ltr rtl',

                            }}
                            onEditorChange={(e) => setContent(e ?? "")}
                        />
                    </Form.Item>
                    <Form.Item>
                        <Space className="post-toolbar">
                            {
                                oldContent === "" ?
                                    <Checkbox onChange={() => setAnon(!isAnon)} checked={isAnon}>
                                        Post Anonymously (to other users only)
                                    </Checkbox> :
                                    ""
                            }
                            <Button shape="round" onClick={onSubmit} type="primary" disabled={submitDisabled}>
                                Add Comment
                            </Button>
                        </Space>
                    </Form.Item>
                </span>
            }
        />
    );
};

export default Editor;