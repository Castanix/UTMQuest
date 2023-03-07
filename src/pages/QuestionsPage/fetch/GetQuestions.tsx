import { useQuery } from "react-query";

const fetchLatestQuestions = async (courseId: string, page: string, searchFilter: string, topicFilters?: Set<string>, ) => {
    const topics = `${JSON.stringify(topicFilters ? Array.from(topicFilters) : [])}`;
    const search = searchFilter;

    const response = await fetch(`${process.env.REACT_APP_API_URI}/question/latestQuestions/${courseId}/${page}`, {
        headers: { 
            topics,
            search,
        }
    });

    if (!response.ok) throw Error(response.statusText);
    return response.json();
};

const GetQuestions = (courseId: string, page: string, searchFilter: string, topicFilters?: Set<string>, ) => {
    const result = useQuery(['latestQuestions', courseId, page, topicFilters, searchFilter], () => fetchLatestQuestions(courseId, page, searchFilter, topicFilters), { staleTime: 300000 });

    return {
        loadingQuestions: result.isLoading,
        questionsData: result.data,
        errorQuestions: result.error,
        refetch: result.refetch
    };
};

export default GetQuestions;