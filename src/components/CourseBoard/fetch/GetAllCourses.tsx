import { useQuery } from 'react-query';

const fetchCourses = async () => {
    const response = await fetch(`${process.env.REACT_APP_API_URI}/course/getAllCourses`);
    if (!response.ok) throw Error("Could not complete request.");
    return response.json();
};

const GetAllCourses = () => {

    const result = useQuery("getAllCourses", () => fetchCourses());

    return {
        courses: result.data,
        loading: result.isLoading,
        error: result.error,
    };
};

export default GetAllCourses;