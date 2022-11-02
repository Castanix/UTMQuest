import { useEffect, useState } from "react";

const GetCourse = (courseCode: string) => {
    const [loadingCourses, setLoadingCourses] = useState<boolean>(true);
    const [courseName, setCourseName] = useState<string>("");
    const [errorCourses, setErrorCourses] = useState<string>("");

    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URI}/course/getCourse/${courseCode}`)
            .then((res: Response) => {
                if (!res.ok) throw Error(res.statusText);
                return res.json();
            }).then((result) => {
                setCourseName(result.courseName);
                setLoadingCourses(false);
            }).catch((err) => {
                setErrorCourses(err.message);
                setLoadingCourses(false);
            });
    }, [courseCode]);

    return {
        courseName,
        loadingCourses,
        errorCourses,
    };
};

export default GetCourse;
