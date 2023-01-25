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

    const result = useQuery('getWidgets', () => fetchData(userId), { enabled: !!userId, staleTime: Infinity });

    const bookmarkedCourses: [string, string][] = [];

    result.data?.bookmarkCourses.forEach((courseId: string) => {
        bookmarkedCourses.push([`/courses/${courseId}`, courseId]);
    });

    return {
        loading: result.isLoading || result.isIdle,
        bookmarkedCourses,
        error: result.error
    };
};

export default GetWidgets;