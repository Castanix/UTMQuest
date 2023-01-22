import { useQuery } from "react-query";

const fetchLatestQuestions = async (courseId: string) => {
    const response = await fetch(`${process.env.REACT_APP_API_URI}/question/latestQuestions/${courseId}`);
    if (!response.ok) throw Error(response.statusText);
    return response.json();
};

const GetQuestions = (courseId: string) => {

    const result = useQuery('latestQuestions', () => fetchLatestQuestions(courseId));

    return {
        loading: result.isLoading,
        questions: result?.data,
        error: result.error as Error,
    };
};

export default GetQuestions;