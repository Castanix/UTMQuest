import React, { useContext, useState } from "react";
import { Button, Checkbox, Divider, Space } from "antd";
import Title from "antd/es/typography/Title";
import "./MultipleChoice.css";
import MDEditor from "@uiw/react-md-editor";
import { MultipleChoiceState } from "./MultipleChoiceState";
import { ThemeContext } from "../Topbar/Topbar";
import { QuizDependencyTypes } from "../../pages/QuizPage/QuizPage";


const MultipleChoice = ({ options, answers, explanation, setHasAnswered, quizDependancies = {} }: { options: string[], answers: string[], explanation: string, setHasAnswered: Function, quizDependancies?: QuizDependencyTypes }) => {

    const [revealExplanation, setRevealExplanation] = useState<boolean>(false);
    const [isActive, setIsActive] = useState(false);
    const { setMCResult, newOptionState } = quizDependancies;

    const showExplanation = () => {
        setRevealExplanation(!revealExplanation);
        setIsActive(!isActive);
    };

    const isLightMode = useContext(ThemeContext);

    const {
        showingAnswer,
        optionState,
        onChange,
        showAnswers,
        resetAnswers,
    } = MultipleChoiceState(options, answers as string[], newOptionState);

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
                <Space direction={(window.innerWidth > 375) ? "horizontal" : "vertical"} split={(window.innerWidth > 375) ? <Divider type="horizontal" /> : null}>
                    <Button className="answer-btn" shape="round" onClick={() => {
                        const result = showAnswers();
                        setHasAnswered(true);
                        if(setMCResult) {
                            setMCResult(result);
                        };
                        }}>Check Answers</Button>
                    <Button className="reset-btn" style={setMCResult ? {display: "none"} : {}} shape="round" onClick={resetAnswers}>Reset</Button>
                    <Button className="explanation-btn" style={{
                        backgroundColor: isActive ? '#1890ff' : '',
                        color: isActive ? 'white' : '',
                        display: setMCResult ? "none" : "block"
                    }} shape="round" onClick={showExplanation}>Explanation</Button>
                </Space>
            </div>

            {revealExplanation && <div className="explanation-container">
                <Title level={3} className="explanation-title">
                    Explanation
                </Title>
                <MDEditor.Markdown warpperElement={{ "data-color-mode": isLightMode ? "light" : "dark" }} source={explanation} />
            </div>}
        </div>
    );
};

export default MultipleChoice;