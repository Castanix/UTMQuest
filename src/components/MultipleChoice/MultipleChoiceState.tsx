import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import React, { useState } from "react";

interface OptionType {
    className: string;
    checked: boolean;
    isCorrect: boolean;
    value: string;
    icon: any;
}

const init = (options: string[], correctAnswers: Set<string>) => {
    const newOptionState = options.map(item => {
        const newOption: OptionType = {
            className: "",
            checked: false,
            isCorrect: correctAnswers.has(item),
            value: item,
            icon: null,
        };
        return newOption;
    });

    return newOptionState;
};

const MultipleChoiceState = (options: string[], answers: string[]) => {
    const correctAnswers = new Set<string>(answers);
    const [showingAnswer, setShowingAnswer] = useState<boolean>(false);
    const [optionState, setOptionState] = useState<OptionType[]>(init(options, correctAnswers));

    const onChange = (index: number) => {
        const newOptionState = [...optionState];

        const item = newOptionState[index];
        newOptionState[index].checked = !item.checked;
        setOptionState(newOptionState);
    };

    const showAnswers = () => {
        const newOptionState = [...optionState];

        newOptionState.forEach(item => {
            if (item.isCorrect) {
                item.className = "green";                   /* eslint-disable-line no-param-reassign */
                item.icon = <CheckCircleOutlined />;        /* eslint-disable-line no-param-reassign */
            }
            else if (item.checked) {
                item.className = "red";                     /* eslint-disable-line no-param-reassign */
                item.icon = <CloseCircleOutlined />;        /* eslint-disable-line no-param-reassign */
            }
            else {
                item.className = "";                        /* eslint-disable-line no-param-reassign */
                item.icon = null;                           /* eslint-disable-line no-param-reassign */
            }
        });

        setOptionState(newOptionState);
        setShowingAnswer(true);
    };

    const resetAnswers = () => {
        setShowingAnswer(false);
        setOptionState(init(options, correctAnswers));
    };

    return {
        showingAnswer,
        optionState,
        onChange,
        showAnswers,
        resetAnswers
    };
};

export default MultipleChoiceState;