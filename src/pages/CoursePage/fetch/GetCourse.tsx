import { useEffect, useState } from "react";

const GetCourse = (courseCode: string) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [courseName, setCourseName] = useState<string>("");
    const [error, setError] = useState<string>("");

    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URI}/course/getCourse/${courseCode}`)
            .then((res: Response) => {
                if (!res.ok) throw Error(res.statusText);
                return res.json();
            }).then((result) => {
                setCourseName(result.courseName);
                setLoading(false);
            }).catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, [courseCode]);

    return {
        courseName,
        loading,
        error,
    };
};

export default GetCourse;