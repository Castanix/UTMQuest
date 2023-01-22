import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../Topbar/Topbar";

const GetWidgets = () => {

    const [loading, setLoading] = useState<boolean>(true);
    const [courseData, setCourseData] = useState<[string, string][]>([]);
    const [error, setError] = useState('');

    const { userId } = useContext(UserContext);

    useEffect(() => {
        const courseArr: [string, string][] = [];

        const fetchData = async () => {
            if (userId === "") return;

            await fetch(`${process.env.REACT_APP_API_URI}/account/getAccount/${userId}`)
                .then((res: Response) => {
                    if (!res.ok) throw Error(res.statusText);
                    return res.json();
                }).then((result) => {
                    result.bookmarkCourses.forEach((courseId: string) => {
                        courseArr.push([`/courses/${courseId}`, courseId]);
                    });

                    setCourseData(courseArr);
                    setLoading(false);
                    setError("");
                }).catch((err) => {
                    setError(err.message);
                    setLoading(false);
                });
        };
        fetchData();
    }, [userId]);

    return {
        loading,
        courseData,
        error
    };
};

export default GetWidgets;