import { useQuery } from "react-query";

const fetchEditHistory = async (qnsLink: string) => {
    const response = await fetch(`${process.env.REACT_APP_API_URI}/question/editHistory/${qnsLink}`);
    if (!response.ok) throw Error(response.statusText);
    return response.json();
};

const GetEditHistory = (qnsLink: string) => {

    const result = useQuery({ queryKey: 'getEditHistory', queryFn: () => fetchEditHistory(qnsLink) });

    console.log(result);

    return {
        loading: result.isLoading,
        editHistory: result.data,
        error: result.error,
    };
};

export default GetEditHistory;