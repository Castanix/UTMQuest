import { useQuery } from "react-query";
import TopicsType from "../../../../backend/types/Topics";

const fetchTopics = async (courseId: string) => {
    const response = await fetch(`${process.env.REACT_APP_API_URI}/topic/getTopics/${courseId}`);
    if (!response.ok) throw Error("Could not process request.");
    return response.json();
};

const GetAllTopics = (courseId: string) => {

    const result = useQuery(["fetchTopics", courseId], () => fetchTopics(courseId), { staleTime: 30000 });

    return {
        loading: result.isLoading,
        topics: result.data as TopicsType[],
        error: result.error
    };
};

export default GetAllTopics;