import { useQuery } from "react-query";
import { QuestionsType } from "../../../../backend/types/Questions";

const fetchQuestions = async (courseId: string) => {
    const response = await fetch(`${process.env.REACT_APP_API_URI}/question/latestQuestions/${courseId}`);
    if (!response.ok) throw Error("Could not process request.");
    return response.json();
};

const GetQuestions = (courseId: string) => {

    const result = useQuery(["fetchQuestions", courseId], () => fetchQuestions(courseId), { staleTime: 30000 });

    return {
        loading: result.isLoading,
        questions: result.data as QuestionsType[],
        error: result.error
    };
};

export default GetQuestions;