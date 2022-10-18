import { useEffect, useState } from "react";
import WidgetType from "../../../../backend/types/Widget";

const GetWidgets = (utorid: string) => {

    const [loading, setLoading] = useState<boolean>(true);
    const [courseData, setCourseData] = useState<[string, string][]>([]);
    const [reviewQnsData, setReviewQnsData] = useState<WidgetType[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const courseArr: [string, string][] = [];
        // const qnsArr: DataType[] = [];

        const fetchData = async () => {
            await fetch(`${process.env.REACT_APP_API_URI}/getAccount/${utorid}`)
                .then((res: Response) => {
                    if (!res.ok) throw Error(res.statusText);
                    return res.json();
                }).then((result) => {
                    result.savedCourses.forEach((courseId: string) => {
                        courseArr.push([`/courses/${courseId}`, courseId]);
                    });

                    // TODO: create a type for qns
                    // Query questions collection for pending questions added by the user

                    setCourseData(courseArr);
                    // setReviewQnsData(qnsArr);
                    setLoading(false);
                }).catch((err) => {
                    setError(err.message);
                    setLoading(false);
                });
        };

        fetchData();
    }, [setCourseData, setReviewQnsData, utorid]);

    return {
        loading,
        courseData,
        reviewQnsData,
        error
    }
}

export default GetWidgets;