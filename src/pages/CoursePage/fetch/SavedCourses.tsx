import { message } from "antd";
import { useEffect, useState } from "react";


export const CheckSaved = (courseId: string, setTest: Function) => {
    const [loading2, setLoading] = useState<boolean>(true);
    const [error2, setError] = useState<string>("");

    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URI}/account/checkSaved/dummy22/${courseId}`)
            .then((res: Response) => {
                if (!res.ok) throw Error(res.statusText);
                return res.json();
            }).then((result) => {
                setTest(result);
                setLoading(false);
            }).catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, [courseId, setTest]);

    return {
        loading2,
        error2
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
            body: JSON.stringify({utorid: "dummy22", courseId, favourite})
        }).then((res: Response) => {
            if (!res.ok) throw new Error("Could not add course. Please try again.");
            setFavourite(!favourite);
            if(!favourite) {
                message.success("Course saved.");
            } else {
                message.success("Course unsaved.");
            }
        }).catch((error) => {
            message.error(error);
        });
};