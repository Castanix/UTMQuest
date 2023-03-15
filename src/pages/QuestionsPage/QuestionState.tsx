import React, { useEffect, useState, useRef, SetStateAction } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "react-query";

interface QuestionListState {
    currentPage: number,
    pageSize: number,
    scrollY: number,
    topicFilters: string[],
    searchFilter: string
};

type FilterType = {
    topic: Set<string>,
    search: string,
};

const pageList = { currPage: 1 };

const GetStateFromSessionStorage = (courseId: string) => {

    const state: { [course: string]: QuestionListState } = JSON.parse(sessionStorage.getItem("questionList") ?? JSON.stringify({}));

    if (courseId in state) {
        const item = state[courseId];

        return { currentPage: item.currentPage, pageSize: item.pageSize, scrollY: item.scrollY, topicFilters: item.topicFilters, searchFilter: item.searchFilter };
    }
    return { currentPage: 1, pageSize: 10, scrollY: 0, topicFilters: [], searchFilter: "" };
};

const useDebouncer = (topicFilters: Set<string>, searchValue: string, accumulatedFilter: FilterType, time = 750) => {
    const [filters, setFilters] = useState<FilterType>({ topic: topicFilters, search: searchValue });

    useEffect(() => {
        const timeout = setTimeout(() => {
            setFilters({ topic: topicFilters, search: searchValue });
        }, time);

        return () => {
            clearTimeout(timeout);
        };
    }, [topicFilters, searchValue, time, setFilters]);

    return { ...filters, isNewFilter: (filters.topic !== accumulatedFilter.topic || filters.search !== accumulatedFilter.search) };
};

/* anti-pattern here should change at some point */
const QuestionState = (courseId: string, setTopicFilters: React.Dispatch<SetStateAction<Set<string>>>, setSearchFilter: React.Dispatch<SetStateAction<string>>) => {
    const navigate = useNavigate();

    const queryClient = useQueryClient();

    const state = GetStateFromSessionStorage(courseId);
    const initTopicFilter: Set<string> = new Set(state.topicFilters);
    const initSearchFilter: string = state.searchFilter;
    const [currTopicFilters, setCurrTopicFilters] = useState<Set<string>>(initTopicFilter);
    const [searchTerm, setSearchTerm] = useState<string>(initSearchFilter ?? "");
    const accFilter = useRef({ topic: initTopicFilter, search: initSearchFilter });

    const debounceValue = useDebouncer(currTopicFilters, searchTerm, accFilter.current);

	useEffect(() => {
        const { topic, search, isNewFilter } = debounceValue;

        setTopicFilters(topic);
        setSearchFilter(search);


        if (isNewFilter) {
            accFilter.current = ({ topic, search });

            navigate(`/courses/${courseId}/1`);
        };

	}, [debounceValue, courseId, navigate, setSearchFilter, setTopicFilters]);

    const sessionStateRef = useRef<QuestionListState>(state);
    const [sessionState, setSessionState] = useState<QuestionListState>(state);

    const onSearchChange = (value: string) => {
        const newState = { ...sessionStateRef.current };

        newState.searchFilter = value;

        newState.currentPage = 1;
        pageList.currPage = 1;

        sessionStorage.setItem("questionList", JSON.stringify({ [courseId]: newState }));

        sessionStateRef.current = newState;

        if (value.length === 0) {
            setSearchTerm("");
        }
        else {
            setSearchTerm(value);
        }
    };

    const filterQuestions = (value: string | string[]) => {
        const map = new Set(value);

        setCurrTopicFilters(map);
    };

    const onPaginationChange = (page: number, pageSize: number) => {

        const newState = { ...sessionStateRef.current };

        newState.currentPage = page;
        pageList.currPage = page;
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

        newState.currentPage = 1;

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
        searchTerm,
        currTopicFilters,
        onSearchChange,
        sessionState,
        sessionStateRef,
        onPaginationChange,
        onTopicFilterChange,
        onScroll
    };
};

export {
    QuestionState,
    pageList,
    GetStateFromSessionStorage
};