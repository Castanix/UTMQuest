import React, { useEffect, useState, useRef, SetStateAction } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "react-query";
import { QuestionFrontEndType } from "../../../backend/types/Questions";


interface QuestionListState {
    currentPage: number,
    pageSize: number,
    scrollY: number,
    topicFilters: string[],
    searchFilter: string
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

const useDebouncer = (topicFilters: Set<string>, searchValue: string, time = 750) => {
    const [topic, setTopic] = useState<Set<string>>(topicFilters);
    const [search, setSearch] = useState<string>(searchValue);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setTopic(topicFilters);
            setSearch(searchValue);
        }, time);

        return () => {
            clearTimeout(timeout);
        };
    }, [topicFilters, searchValue, time]);

    return {
        topic,
        search
    };
};

/* anti-pattern here should change at some point */
const QuestionState = (questions: QuestionFrontEndType[], courseId: string, setTopicFilters: React.Dispatch<SetStateAction<Set<string>>>, setSearchFilter: React.Dispatch<SetStateAction<string>>) => {
    const navigate = useNavigate();

    const queryClient = useQueryClient();

    const state = GetStateFromSessionStorage(courseId);
    const initTopicFilter: Set<string> = new Set(state.topicFilters);
    const initSearchFilter: string = state.searchFilter;
    const [currTopicFilters, setCurrTopicFilters] = useState<Set<string>>(initTopicFilter);
    const [searchTerm, setSearchTerm] = useState<string>(initSearchFilter ?? "");

    const [originalData, setOriginalData] = useState<QuestionFrontEndType[]>([]);

    const [data, setData] = useState<QuestionFrontEndType[]>([]);

    const debounceValue = useDebouncer(currTopicFilters, searchTerm);

	useEffect(() => {
        setTopicFilters(debounceValue.topic);
        setSearchFilter(debounceValue.search);

        // if (initTopicFilter !== debounceValue.topic || initSearchFilter !== debounceValue.search) {
        //     navigate(`/courses/${courseId}/1`);
        // }

	}, [debounceValue]);

    useEffect(() => {
        setOriginalData(questions);
        const filteredData = initTopicFilter.size !== 0 ? questions.filter(item => currTopicFilters?.has(item.topicName)) : questions;
        
        setData(filteredData);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [questions]);

    const sessionStateRef = useRef<QuestionListState>(state);
    const [sessionState, setSessionState] = useState<QuestionListState>(state);

    const onSearchChange = (value: string) => {
        const newState = { ...sessionStateRef.current };

        newState.searchFilter = value;

        sessionStorage.setItem("questionList", JSON.stringify({ [courseId]: newState }));

        sessionStateRef.current = newState;

        if (value.length === 0) {
            setData(originalData.filter(item => currTopicFilters?.size === 0 || currTopicFilters?.has(item.topicName)));
            setSearchTerm("");
        }
        else {
            setData(originalData.filter(item => item.qnsName.toLowerCase().includes(value.toLowerCase()) && (currTopicFilters?.size === 0 || currTopicFilters?.has(item.topicName))));
            setSearchTerm(value);
        }
    };

    const filterQuestions = (value: string | string[]) => {
        const map = new Set(value);

        if (map.size === 0) setData(originalData.filter(item => item.qnsName.toLocaleLowerCase().includes(searchTerm)));
        else setData(originalData.filter(item => map.has(item.topicName) && item.qnsName.toLowerCase().includes(searchTerm)));

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