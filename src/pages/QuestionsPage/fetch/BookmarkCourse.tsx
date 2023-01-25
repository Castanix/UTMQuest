import { message } from "antd";
import { useQuery, useQueryClient } from "react-query";

const fetchCheckBookmark = async (courseId: string) => {
    const response = await fetch(`${process.env.REACT_APP_API_URI}/account/checkBookmark/${courseId}`);
    if (!response.ok) throw Error(response.statusText);
    return response.json();
};

const fetchGetCourse = async (courseId: string) => {
    const response = await fetch(`${process.env.REACT_APP_API_URI}/course/getCourse/${courseId}`);
    if (!response.ok) throw Error(response.statusText);
    return response.json();
};


export const CheckBookmark = (courseId: string, setIsBookmarked: Function) => {

    const bookmarkResult = useQuery(["checkBookmark", courseId], () => fetchCheckBookmark(courseId), {
        staleTime: Infinity,
        onSuccess: (data) => setIsBookmarked(data)
    });
    const courseResult = useQuery(["course", courseId], () => fetchGetCourse(courseId), { staleTime: Infinity });

    return {
        loadingBookmarked: bookmarkResult.isLoading,
        errorBookmarked: bookmarkResult.error,
        loadingCourse: courseResult.isLoading,
        errorCourse: courseResult.error,
        courseName: courseResult.data?.courseName
    };
};

export const BookmarkCourse = (courseId: string, bookmarked: boolean, setBookmarked: Function) => {
    const queryClient = useQueryClient();
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
            body: JSON.stringify({ courseId, bookmarked })
        }).then((res: Response) => {
            if (!res.ok) throw new Error("Could not add course. Please try again.");
            setBookmarked(!bookmarked);
            queryClient.invalidateQueries(["checkBookmark", courseId]);
            if (!bookmarked) {
                message.success("Course bookmarked.");
            } else {
                message.success("Course removed from bookmarks.");
            }
        }).catch((error) => {
            message.error(error);
        });
};