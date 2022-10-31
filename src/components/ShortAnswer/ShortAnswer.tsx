import React, { useState } from "react";
import { Button, Input } from 'antd';
import './ShortAnswer.css'; 

const { TextArea } = Input;

const ShortAnswer = ({explanation}: {explanation: string}) => {
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
            <TextArea showCount disabled={isSubmit} rows={5} placeholder="Type your answer here" onChange={handleTextChange} value={text}/>
            <div className="submitButton-container">
                <Button shape="round" onClick={submitAnswer}>Submit</Button>
            </div>
            {isSubmit &&  
            <div className="text-container"> 
                <h2>Your Answer</h2>
                <p>{text}</p>
                <h2>This is the Solution</h2>
                <p>{explanation}</p>
            </div>}
        </div>
    );
};

export default ShortAnswer;