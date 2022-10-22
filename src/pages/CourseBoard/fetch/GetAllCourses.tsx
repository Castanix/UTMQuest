import { useState, useEffect } from 'react';
import CoursesType from '../../../../backend/types/Courses';


const GetAllCourses = (added: boolean) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [courses, setCourses] = useState<CoursesType[]>([]);

    useEffect(() => {
        const toFetch = added ? "getAllAddedCourses" : "getNonAddedCourses";

        const fetchCourses = async () => {
            await fetch(
                `${process.env.REACT_APP_API_URI}/course/${toFetch}`
            )
            .then((res: Response) => {
                if (!res.ok) throw Error(res.statusText);
                return res.json();
            })
            .then((result) => {
                setCourses(result);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
        }
        fetchCourses();
    }, [setCourses, setLoading, setError, added]);

    return {
        courses,
        loading,
        error,
        setCourses
    };
};

export default GetAllCourses;