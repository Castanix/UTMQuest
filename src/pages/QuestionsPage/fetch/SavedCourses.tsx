import { message } from "antd";
import { useEffect, useState } from "react";


export const CheckSaved = (courseId: string, setTest: Function) => {
    const [loadingSaved, setLoadingSaved] = useState<boolean>(true);
    const [errorSaved, setErrorSaved] = useState<string>("");

    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URI}/account/checkSaved/${courseId}`)
            .then((res: Response) => {
                if (!res.ok) throw Error(res.statusText);
                return res.json();
            }).then((result) => {
                setTest(result);
                setLoadingSaved(false);
            }).catch((err) => {
                setErrorSaved(err.message);
                setLoadingSaved(false);
            });
    }, [courseId, setTest]);

    return {
        loadingSaved,
        errorSaved
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