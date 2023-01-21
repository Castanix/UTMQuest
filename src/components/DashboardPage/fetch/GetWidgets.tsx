import { useContext } from "react";
import { useQuery } from "react-query";
import { UserContext } from "../../Topbar/Topbar";

const fetchData = async (utorId: string) => {
    const response = await fetch(`${process.env.REACT_APP_API_URI}/account/getAccount/${utorId}`);
    if (!response.ok) throw Error(response.statusText);
    return response.json();
};

const GetWidgets = () => {
    const { userId } = useContext(UserContext);

    const result = useQuery('getWidgets', () => fetchData(userId), { enabled: !!userId });

    return {
        loading: result.isLoading,
        courseData: result.data,
        error: result.error
    };
};

export default GetWidgets;