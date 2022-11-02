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


// export const CheckSaved = (courseId: string) => {
//     const [loading2, setLoading] = useState<boolean>(true);
//     const [isSaved, setIsSaved] = useState<boolean>(false);
//     const [error2, setError] = useState<string>("");

//     useEffect(() => {
//         fetch(`${process.env.REACT_APP_API_URI}/account/checkSaved/dummy22/${courseId}`)
//             .then((res: Response) => {
//                 if (!res.ok) throw Error(res.statusText);
//                 return res.json();
//             }).then((result) => {
//                 console.log("---");
//                 console.log(result);
//                 console.log("---");
//                 setIsSaved(result);
//                 setLoading(false);
//             }).catch((err) => {
//                 setError(err.message);
//                 setLoading(false);
//             });
//     }, [courseId]);

//     console.log("-!!");
//     console.log(isSaved);
//     console.log("-!!");
//     return {
//         loading2,
//         isSaved,
//         error2
//     };
// };

export default GetCourse;