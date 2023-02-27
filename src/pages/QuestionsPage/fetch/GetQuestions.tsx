import { useQuery } from "react-query";

const fetchLatestQuestions = async (courseId: string, page: string) => {
    const response = await fetch(`${process.env.REACT_APP_API_URI}/question/latestQuestions/${courseId}/${page}`);
    if (!response.ok) throw Error(response.statusText);
    return response.json();
};

const GetQuestions = (courseId: string, page: string) => {

    const result = useQuery(['latestQuestions', courseId, page], () => fetchLatestQuestions(courseId, page), { staleTime: 300000 });

    return {
        loading: result.isLoading,
        fetchData: result.data,
        error: result.error,
    };
};

export default GetQuestions;