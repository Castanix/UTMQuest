import React, { useState } from "react";
import { Button, Input } from 'antd';
import Title from 'antd/lib/typography/Title';
import Paragraph from 'antd/lib/typography/Paragraph';
import './ShortAnswer.css';
import MDEditor from '@uiw/react-md-editor';

const { TextArea } = Input;

const ShortAnswer = ({ answer }: { answer: string }) => {
    const [text, setText] = useState<string>("");
    const [isSubmit, setIsSubmit] = useState<boolean>(false);

    const handleTextChange = (event: any) => {
        setText(event.target.value);
    };

    const submitAnswer = () => {
        setIsSubmit(true);
    };

    return (
        <div>
            {!isSubmit ?
                <div>
                    <TextArea showCount disabled={isSubmit} rows={5} placeholder="Type your answer here" onChange={handleTextChange} value={text} />
                    <div className="submitButton-container">
                        <Button shape="round" onClick={submitAnswer}>Submit</Button>
                    </div>
                </div>
                :
                <Paragraph>{text}</Paragraph>
            }
            {isSubmit &&
                <div>
                    <br />
                    <br />
                    <Title level={3} className='solution-title'>Solution</Title>
                    <MDEditor.Markdown warpperElement={{ "data-color-mode": "light" }} source={answer} />
                </div>}
        </div>
    );
};

export default ShortAnswer;