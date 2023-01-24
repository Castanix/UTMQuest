import { useQuery } from "react-query";

const fetchLatestQuestions = async (courseId: string) => {
    const response = await fetch(`${process.env.REACT_APP_API_URI}/question/latestQuestions/${courseId}`);
    if (!response.ok) throw Error(response.statusText);
    return response.json();
};

const GetQuestions = (courseId: string) => {

    const result = useQuery(['latestQuestions', courseId], () => fetchLatestQuestions(courseId), { staleTime: 30000 });

    return {
        loading: result.isLoading,
        questions: result?.data,
        error: result.error,
    };
};

export default GetQuestions;