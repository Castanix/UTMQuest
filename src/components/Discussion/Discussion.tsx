import React, { useContext, useState } from "react";
import { FloatButton, Divider, List, Empty } from "antd";
import { DropboxOutlined } from "@ant-design/icons";
import { MathJax } from "better-react-mathjax";
import { DiscussionFrontEndType } from "../../../backend/types/Discussion";
import GetOPComments from "./fetch/GetOPComments";
import Loading from "../Loading/Loading";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import Editor from "./Editor";
import DisplayComment from "./DisplayComment";
import { ThemeContext } from "../Topbar/Topbar";


const Discussion = ({ qnsLink, qnsDate }: { qnsLink: string, qnsDate: string }) => {

    const { loading, comments: opComments, error } = GetOPComments(qnsLink);
    const [comments, setComments] = useState<DiscussionFrontEndType[]>(opComments);
    const isLightMode = useContext(ThemeContext);


    const updateComments = (newComment: DiscussionFrontEndType) => {
        setComments([...comments, newComment]);
    };

    if (loading) return <Loading />;

    if (error instanceof Error) return <ErrorMessage title={error.message} link='.' message='Refresh' />;

    return (
        <div>
            <List
                header="All Comments"
                itemLayout="horizontal"
                locale={{
                    emptyText: (
                        <Empty
                            image={
                                <DropboxOutlined style={{ fontSize: "5rem" }} />
                            }
                            description={
                                <span
                                    style={{
                                        color: isLightMode ? "black" : "white",
                                    }}
                                >
                                    Nobody has commented yet.
                                </span>
                            }
                        />
                    ),
                }}
                dataSource={comments}
                renderItem={item => (
                    <MathJax>
                        <DisplayComment key={item._id} comment={item} qnsDate={qnsDate} />
                    </MathJax>
                )}
            />
            <Divider orientation="left">Post a Comment</Divider>
            <Editor discussionId={null} qnsLink={qnsLink} op oldContent="" updateComments={updateComments} thread={[]} anon={false} />
            <FloatButton.BackTop />
        </div>
    );
};

export default Discussion;
