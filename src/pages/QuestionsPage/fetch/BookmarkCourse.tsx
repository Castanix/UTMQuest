import { message } from "antd";
import { useEffect, useState } from "react";


export const CheckBookmark = (courseId: string, setIsBookmarked: Function) => {
    const [loadingBookmarked, setLoadingBookmarked] = useState<boolean>(true);
    const [errorBookmarked, setErrorBookmarked] = useState<string>("");
    const [loadingCourse, setLoadingCourse] = useState<boolean>(true);
    const [errorCourse, setErrorCourse] = useState<string>("");
    const [courseName, setCourseName] = useState<string>("");

    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URI}/account/checkBookmark/${courseId}`)
            .then((res: Response) => {
                if (!res.ok) throw Error(res.statusText);
                return res.json();
            }).then((result) => {
                setIsBookmarked(result);
                setLoadingBookmarked(false);
            }).catch((err) => {
                setErrorBookmarked(err.message);
                setLoadingBookmarked(false);
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
    }, [courseId, setIsBookmarked]);

    return {
        loadingBookmarked,
        errorBookmarked,
        loadingCourse,
        errorCourse,
        courseName
    };
};

export const BookmarkCourse = (courseId: string, bookmarked: boolean, setBookmarked: Function) => {
    fetch(`${process.env.REACT_APP_API_URI}/account/updateBookmarkCourses`,
        {
            method: 'PUT',
            redirect: "follow",
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({courseId, bookmarked})
        }).then((res: Response) => {
            if (!res.ok) throw new Error("Could not add course. Please try again.");
            setBookmarked(!bookmarked);
            if(!bookmarked) {
                message.success("Course bookmarked.");
            } else {
                message.success("Course removed from bookmarks.");
            }
        }).catch((error) => {
            message.error(error);
        });
};