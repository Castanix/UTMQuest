import { useQuery } from "react-query";

const fetchGetTopics = async (courseId: string) => {
    const response = await fetch(`${process.env.REACT_APP_API_URI}/topic/getTopics/${courseId}`);
    if (!response.ok) throw Error(response.statusText);
    return response.json();
};

const GetAllTopics = (courseId: string) => {

    const result = useQuery(["getTopics", courseId], () => fetchGetTopics(courseId), { staleTime: 300000 });

    return {
        topics: result?.data,
        loadingTopics: result.isLoading,
        errorTopics: result.error,
    };
};

export default GetAllTopics;