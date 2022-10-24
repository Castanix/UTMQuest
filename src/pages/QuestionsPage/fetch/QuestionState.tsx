import { useState } from "react";
import QuestionsType from "../../../../backend/types/Questions";

const QuestionState = (questions: QuestionsType[]) => {
    const [originalData] = useState<QuestionsType[]>(questions);
    const [data, setData] = useState<QuestionsType[]>(questions);

    const onSearchChange = (value: string) => setData(originalData.filter(item => item.qnsName.toLowerCase().includes(value.toLowerCase())));

    const onSelectChange = (value: string | string[]) => {
        const map = new Set(value);

        if (map.size === 0) setData(originalData);
        else setData(originalData.filter(item => map.has(item.topicName.toLowerCase())));
    };

    return {
        data,
        onSearchChange,
        onSelectChange,
    };
};

export default QuestionState;