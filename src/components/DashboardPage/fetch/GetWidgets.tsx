import { useContext } from "react";
import { useQuery } from "react-query";
import { UserContext } from "../../Topbar/Topbar";

const fetchAccount = async (utorid: string) => {
    const response = await fetch(`${process.env.REACT_APP_API_URI}/account/getAccount/${utorid}`);
    if (!response.ok) throw Error("No such account found.");
    return response.json();
};

const GetWidgets = () => {

    const { utorid } = useContext(UserContext);

    const result = useQuery("savedCourses", () => fetchAccount(utorid), { enabled: utorid.length > 0 });

    const courseArr: [string, string][] = [];

    result.data?.savedCourses.forEach((courseId: string) => {
        courseArr.push([`/courses/${courseId}`, courseId]);
    });

    return {
        loading: result.isLoading || result.isIdle,
        error: result.error,
        courseArr,
    };
};

export default GetWidgets;