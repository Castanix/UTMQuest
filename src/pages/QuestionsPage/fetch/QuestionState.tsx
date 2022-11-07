import { useState } from "react";
import { QuestionsType } from "../../../../backend/types/Questions";

const QuestionState = (questions: QuestionsType[]) => {
    const [originalData] = useState<QuestionsType[]>(questions);
    const [data, setData] = useState<QuestionsType[]>(questions);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [topicFilters, setTopicFilters] = useState<Set<string>>(new Set());

    const onSearchChange = (value: string) => {
        if (value.length === 0) {
            setData(originalData.filter(item => topicFilters.size === 0 || topicFilters.has(item.topicName.toLocaleLowerCase())));
            setSearchTerm("");
        }
        else {
            setData(originalData.filter(item => item.qnsName.toLowerCase().includes(value.toLowerCase()) && (topicFilters.size === 0 || topicFilters.has(item.topicName.toLocaleLowerCase()))));
            setSearchTerm(value.toLocaleLowerCase());
        }
    };

    const onSelectChange = (value: string | string[]) => {
        const map = new Set(value);

        if (map.size === 0) setData(originalData.filter(item => item.qnsName.toLocaleLowerCase().includes(searchTerm)));
        else setData(originalData.filter(item => map.has(item.topicName.toLowerCase()) && item.qnsName.toLowerCase().includes(searchTerm)));

        setTopicFilters(map);
    };

    return {
        data,
        searchTerm,
        topicFilters,
        onSearchChange,
        onSelectChange,
    };
};

export default QuestionState;