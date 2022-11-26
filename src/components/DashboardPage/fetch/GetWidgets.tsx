import { useEffect, useState } from "react";
import WidgetType from "../types/Widget";

const GetWidgets = () => {

    const [loading, setLoading] = useState<boolean>(true);
    const [courseData, setCourseData] = useState<[string, string][]>([]);
    const [reviewQnsData, setReviewQnsData] = useState<WidgetType[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const courseArr: [string, string][] = [];

        const fetchData = async () => {
            await fetch(`${process.env.REACT_APP_API_URI}/account/getAccount`)
                .then((res: Response) => {
                    if (!res.ok) throw Error(res.statusText);
                    return res.json();
                }).then((result) => {
                    result.savedCourses.forEach((courseId: string) => {
                        courseArr.push([`/courses/${courseId}`, courseId]);
                    });

                    setCourseData(courseArr);
                    setLoading(false);
                }).catch((err) => {
                    setError(err.message);
                    setLoading(false);
                });
        };

        fetchData();
    }, [setCourseData, setReviewQnsData]);

    return {
        loading,
        courseData,
        reviewQnsData,
        error
    };
};

export default GetWidgets;