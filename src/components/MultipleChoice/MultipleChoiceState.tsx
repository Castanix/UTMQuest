import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import React, { useState } from "react";

export interface OptionType {
    className: string;
    checked: boolean;
    isCorrect: boolean;
    value: string;
    icon: any;
}

const initMC = (options: string[], correctAnswers: Set<string>) => {
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

const MultipleChoiceState = (options: string[], answers: string[], nextOptionState?: OptionType[]) => {
    const correctAnswers = new Set<string>(answers);
    const [showingAnswer, setShowingAnswer] = useState<boolean>(false);
    const [optionState, setOptionState] = useState<OptionType[]>(nextOptionState ?? initMC(options, correctAnswers));

    const onChange = (index: number) => {
        const newOptionState = [...optionState];

        const item = newOptionState[index];
        newOptionState[index].checked = !item.checked;
        setOptionState(newOptionState);
    };

    const showAnswers = () => {
        const newOptionState = [...optionState];
        let result = true;

        newOptionState.forEach(item => {
            if (item.isCorrect) {
                if(!item.checked && result) result=false;
                item.className = "green";                   /* eslint-disable-line no-param-reassign */
                item.icon = <CheckCircleOutlined />;        /* eslint-disable-line no-param-reassign */
            }
            else if (item.checked) {
                if(result) result=false;
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
        
        return result;
    };

    const resetAnswers = () => {
        setShowingAnswer(false);
        setOptionState(initMC(options, correctAnswers));
    };

    return {
        showingAnswer,
        optionState,
        onChange,
        showAnswers,
        resetAnswers
    };
};

export {
    MultipleChoiceState,
    initMC
};