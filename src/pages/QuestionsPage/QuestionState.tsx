import { useState } from "react";
import { QuestionsType } from "../../../backend/types/Questions";

interface QuestionListState {
    currentPage: number,
    pageSize: number,
    scrollY: number,
    topicFilters: string[]
};

const GetStateFromSessionStorage = (courseCode: string) => {

    const state: { [course: string]: QuestionListState } = JSON.parse(sessionStorage.getItem("questionList") ?? JSON.stringify({}));

    if (courseCode in state) {
        const item = state[courseCode];

        return { currentPage: item.currentPage, pageSize: item.pageSize, scrollY: item.scrollY, topicFilters: item.topicFilters };
    }
    return { currentPage: 1, pageSize: 10, scrollY: 0, topicFilters: [] };
};

const QuestionState = (questions: QuestionsType[], courseCode: string) => {

    const state = GetStateFromSessionStorage(courseCode);
    const initFilter: string[] = state.topicFilters;

    const [originalData] = useState<QuestionsType[]>(questions);
    const [topicFilters, setTopicFilters] = useState<Set<string>>(new Set(initFilter));
    const filteredData = topicFilters.size !== 0 ? originalData.filter(item => topicFilters.has(item.topicName.toLowerCase())) : questions;

    const [data, setData] = useState<QuestionsType[]>(filteredData);
    const [searchTerm, setSearchTerm] = useState<string>("");

    const [sessionState, setSessionState] = useState<QuestionListState>(state);

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

    const filterQuestions = (value: string | string[]) => {
        const map = new Set(value);

        if (map.size === 0) setData(originalData.filter(item => item.qnsName.toLocaleLowerCase().includes(searchTerm)));
        else setData(originalData.filter(item => map.has(item.topicName.toLowerCase()) && item.qnsName.toLowerCase().includes(searchTerm)));

        setTopicFilters(map);
    };

    const onPaginationChange = (page: number, pageSize: number) => {

        const newState = { ...sessionState };

        newState.currentPage = page;
        newState.pageSize = pageSize;

        sessionStorage.setItem("questionList", JSON.stringify({ [courseCode]: newState }));

        setSessionState(newState);
    };

    const onTopicFilterChange = (value: string[]) => {

        const newState = { ...sessionState };
        newState.topicFilters = value;

        sessionStorage.setItem("questionList", JSON.stringify({ [courseCode]: newState }));
        filterQuestions(value);
    };

    const onScroll = () => {
        const newState = { ...sessionState };
        newState.scrollY = window.scrollY;

        sessionStorage.setItem("questionList", JSON.stringify({ [courseCode]: newState }));
        setSessionState(newState);
    };

    return {
        data,
        searchTerm,
        topicFilters,
        onSearchChange,
        sessionState,
        onPaginationChange,
        onTopicFilterChange,
        onScroll
    };
};

export default QuestionState;