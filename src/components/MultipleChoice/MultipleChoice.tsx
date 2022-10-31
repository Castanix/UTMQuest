import React, { useState } from "react";
import { Button, Checkbox, Divider, Space } from "antd";
import "./MultipleChoice.css";
import MultipleChoiceState from "./MultipleChoiceState";

const MultipleChoice = ({ options, answers, explanation }: { options: string[], answers: string[], explanation: string }) => {

    const [revealExplanation, setRevealExplanation] = useState<boolean>(false); 
    const [isActive, setIsActive] = useState(false);
    
    const showExplanation = () => { 
        setRevealExplanation(!revealExplanation); 
        setIsActive(!isActive); 
    };


    const {
        showingAnswer,
        optionState,
        onChange,
        showAnswers,
        resetAnswers,
    } = MultipleChoiceState(options, answers);

    return (
        <div>
            <div className="mc">
                {options.map((item, index) => {
                    const opt =
                        <span key={item.concat(index.toString())} className={optionState[index].className}>
                            <Space>
                                {optionState[index].icon}
                                {item}
                            </Space>
                        </span>;

                    if (showingAnswer) return opt;

                    return (
                        <Checkbox key={item.concat(index.toString())} onChange={() => onChange(index)}>
                            {opt}
                        </Checkbox>
                    );
                })}
            </div>
            <div className="mc-actions">
                <Space split={<Divider type="vertical" />}>
                    <Button shape="round" onClick={showAnswers}>Check Answers</Button>
                    <Button shape="round" onClick={resetAnswers}>Reset</Button>
                    <Button style={{
                        backgroundColor: isActive ? '#1890ff' : '',
                        color: isActive ? 'white' : ''
                    }} shape="round" onClick={showExplanation}>Explanation</Button>
                </Space>
            </div>

            {revealExplanation && <div className="explanation-container">
                <h3 className="explanation-title">
                    Explanation
                </h3>
                <p> 
                    {explanation}
                </p>
            </div> }
        </div>
    );
};

export default MultipleChoice;