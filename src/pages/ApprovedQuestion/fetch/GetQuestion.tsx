import { useQuery } from "react-query";

const fetchData = async (qnsLink: string) => {
    const response = await fetch(`${process.env.REACT_APP_API_URI}/question/oneQuestion/${qnsLink}`);
    if (!response.ok) throw Error(response.statusText);
    return response.json();
};

const GetQuestion = (qnsLink: string) => {
    const result = useQuery(["question", qnsLink], () => fetchData(qnsLink));

    return {
        loading: result.isLoading,
        question: result.data?.question,
        hasRated: result.data?.hasRated,
        error: result.error
    };
};

export default GetQuestion;