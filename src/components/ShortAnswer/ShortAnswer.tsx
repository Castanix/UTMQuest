import React, { useContext, useState } from "react";
import { Button, Input } from 'antd';
import './ShortAnswer.css';
import parse from "html-react-parser";
import Title from "antd/es/typography/Title";
import Paragraph from "antd/es/typography/Paragraph";
import { onMobile } from "../EditHistory/EditHistory";
import { ThemeContext } from "../Topbar/Topbar";


const { TextArea } = Input;

const ShortAnswer = ({ answer, setHasAnswered }: { answer: string, setHasAnswered: Function }) => {
    const [text, setText] = useState<string>("");
    const [isSubmit, setIsSubmit] = useState<boolean>(false);

    const isLightMode = useContext(ThemeContext);

    const handleTextChange = (event: any) => {
        setText(event.target.value);
    };

    const submitAnswer = () => {
        setIsSubmit(true);
        setHasAnswered(true);
    };

    return (
        <div>
            {!isSubmit ?
                <div>
                    <TextArea style={{ fontSize: "1rem" }} showCount disabled={isSubmit} rows={!onMobile() ? 5 : 2} placeholder="Type your answer here" onChange={handleTextChange} value={text} maxLength={4000} />
                    <div className="submitButton-container">
                        <Button shape="round" onClick={submitAnswer}>Submit</Button>
                    </div>
                </div>
                :
                <Paragraph style={{ fontSize: "1rem" }}>{text}</Paragraph>
            }
            {isSubmit &&
                <div>
                    <br />
                    <br />
                    <Title level={3} className='solution-title'>Solution</Title>
                    <div className={`tiny-${isLightMode ? "light" : "dark"}`}>
                        {parse(answer)}
                    </div>
                    {/* <MDEditor.Markdown warpperElement={{ "data-color-mode": isLightMode ? "light" : "dark" }} source={answer} /> */}
                </div>}
        </div>
    );
};

export default ShortAnswer;