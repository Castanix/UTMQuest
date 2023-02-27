import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "react-query";
import { QuestionFrontEndType } from "../../../backend/types/Questions";




interface QuestionListState {
    currentPage: number,
    pageSize: number,
    scrollY: number,
    topicFilters: string[]
};

const GetStateFromSessionStorage = (courseId: string) => {

    const state: { [course: string]: QuestionListState } = JSON.parse(sessionStorage.getItem("questionList") ?? JSON.stringify({}));

    if (courseId in state) {
        const item = state[courseId];

        return { currentPage: item.currentPage, pageSize: item.pageSize, scrollY: item.scrollY, topicFilters: item.topicFilters };
    }
    return { currentPage: 1, pageSize: 10, scrollY: 0, topicFilters: [] };
};

/* anti-pattern here should change at some point */
const QuestionState = (questions: QuestionFrontEndType[], courseId: string) => {
    const navigate = useNavigate();

    const queryClient = useQueryClient();

    const state = GetStateFromSessionStorage(courseId);
    const initFilter: Set<string> = new Set(state.topicFilters);
    const [topicFilters, setTopicFilters] = useState<Set<string>>(initFilter);

    const [originalData, setOriginalData] = useState<QuestionFrontEndType[]>([]);

    const [data, setData] = useState<QuestionFrontEndType[]>([]);

    useEffect(() => {
        setOriginalData(questions);
        const filteredData = initFilter.size !== 0 ? questions.filter(item => topicFilters.has(item.topicName.toLowerCase())) : questions;
        setData(filteredData);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [questions]);

    const [searchTerm, setSearchTerm] = useState<string>("");

    const sessionStateRef = useRef<QuestionListState>(state);
    const [sessionState, setSessionState] = useState<QuestionListState>(state);

    const onSearchChange = (value: string) => {
        if (value.length === 0) {
            setData(originalData.filter(item => topicFilters.size === 0 || topicFilters.has(item.topicName.toLocaleLowerCase())));
            setSearchTerm("");
        }
        else {
            setData(originalData.filter(item => item.qnsName.toLowerCase().includes(value.toLowerCase()) && (topicFilters.size === 0 || topicFilters.has(item.topicName.toLocaleLowerCase()))));
            setSearchTerm(value);
        }
    };

    const filterQuestions = (value: string | string[]) => {
        const map = new Set(value);

        if (map.size === 0) setData(originalData.filter(item => item.qnsName.toLocaleLowerCase().includes(searchTerm)));
        else setData(originalData.filter(item => map.has(item.topicName.toLowerCase()) && item.qnsName.toLowerCase().includes(searchTerm)));

        setTopicFilters(map);
    };

    const onPaginationChange = (page: number, pageSize: number) => {

        const newState = { ...sessionStateRef.current };

        newState.currentPage = page;
        newState.pageSize = pageSize;

        sessionStorage.setItem("questionList", JSON.stringify({ [courseId]: newState }));

        sessionStateRef.current = newState;
        queryClient.invalidateQueries(['latestQuestions', courseId, page]);
        navigate(`/courses/${courseId}/${page}`);

        setSessionState(newState);
    };

    const onTopicFilterChange = (value: string[]) => {

        const newState = { ...sessionStateRef.current };
        newState.topicFilters = value;

        sessionStorage.setItem("questionList", JSON.stringify({ [courseId]: newState }));
        filterQuestions(value);
        sessionStateRef.current = newState;
        setSessionState(newState);

    };

    const onScroll = () => {
        const newState = { ...sessionStateRef.current };
        newState.scrollY = window.scrollY;

        sessionStorage.setItem("questionList", JSON.stringify({ [courseId]: newState }));
        sessionStateRef.current = newState;
        setSessionState(newState);
    };

    return {
        data,
        searchTerm,
        topicFilters,
        onSearchChange,
        sessionState,
        sessionStateRef,
        onPaginationChange,
        onTopicFilterChange,
        onScroll
    };
};

export default QuestionState;