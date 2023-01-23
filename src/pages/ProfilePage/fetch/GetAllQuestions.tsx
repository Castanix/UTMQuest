import { useQuery } from "react-query";

const fetchAllUserPostedQuestions = async (utorId: string) => {
    const response = await fetch(`${process.env.REACT_APP_API_URI}/question/allUserPostedQuestions/${utorId}`);
    if (!response.ok) throw Error(response.statusText);
    return response.json();
};

const GetAllQuestions = (userId: string) => {

    const result = useQuery("userPostedQuestions", () => fetchAllUserPostedQuestions(userId));

    return {
        loadingQuestions: result.isLoading,
        errorQuestions: result.error,
        data: result?.data
    };
};

export default GetAllQuestions;