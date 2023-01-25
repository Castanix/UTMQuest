import React from "react";
import './CourseBoard.css';
import GetAllCourses from "./fetch/GetAllCourses";
import CourseBoardTable from "./CourseBoardTable";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import Loading from "../Loading/Loading";

const CourseBoard = () => {
    const { courses, loading, error } = GetAllCourses();

    if (loading) return <Loading />;

    if (error instanceof Error) return <ErrorMessage title={error.message} link='.' message='Refresh' />;

    return (
        <div className="card-content-courseboard">
            <CourseBoardTable coursesList={courses} />
        </div>
    );
};

export default CourseBoard;