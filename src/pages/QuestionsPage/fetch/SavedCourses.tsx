import { message } from "antd";
import { useEffect, useState } from "react";


export const CheckSaved = (courseId: string, setIsSaved: Function) => {
    const [loadingSaved, setLoadingSaved] = useState<boolean>(true);
    const [errorSaved, setErrorSaved] = useState<string>("");
    const [loadingCourse, setLoadingCourse] = useState<boolean>(true);
    const [errorCourse, setErrorCourse] = useState<string>("");
    const [courseName, setCourseName] = useState<string>("");

    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URI}/account/checkSaved/${courseId}`)
            .then((res: Response) => {
                if (!res.ok) throw Error(res.statusText);
                return res.json();
            }).then((result) => {
                setIsSaved(result);
                setLoadingSaved(false);
            }).catch((err) => {
                setErrorSaved(err.message);
                setLoadingSaved(false);
            });

        fetch(`${process.env.REACT_APP_API_URI}/course/getCourse/${courseId}`)
            .then((res: Response) => {
                if (!res.ok) throw Error(res.statusText);
                return res.json();
            }).then((result) => {
                setCourseName(result.courseName);
                setLoadingCourse(false);
            }).catch((err) => {
                setErrorCourse(err.message);
                setLoadingCourse(false);
            });
    }, [courseId, setIsSaved]);

    return {
        loadingSaved,
        errorSaved,
        loadingCourse,
        errorCourse,
        courseName
    };
};

export const SaveCourse = (courseId: string, favourite: boolean, setFavourite: Function) => {
    fetch(`${process.env.REACT_APP_API_URI}/account/updateSavedCourse`,
        {
            method: 'PUT',
            redirect: "follow",
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({courseId, favourite})
        }).then((res: Response) => {
            if (!res.ok) throw new Error("Could not add course. Please try again.");
            setFavourite(!favourite);
            if(!favourite) {
                message.success("Course bookmarked.");
            } else {
                message.success("Course removed from bookmarks.");
            }
        }).catch((error) => {
            message.error(error);
        });
};