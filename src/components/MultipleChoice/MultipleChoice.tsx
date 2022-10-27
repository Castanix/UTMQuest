import React from "react";
import { Button, Checkbox, Divider, Space } from "antd";

import "./MultipleChoice.css";
import MultipleChoiceState from "./MultipleChoiceState";

const MultipleChoice = ({ options, answers }: { options: string[], answers: string[] }) => {

    const {
        showingAnswer,
        optionState,
        onChange,
        showAnswers,
        resetAnswers
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
                </Space>
            </div>
        </div>
    );
};

export default MultipleChoice;