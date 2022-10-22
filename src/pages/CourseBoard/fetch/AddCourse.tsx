import { message } from "antd"
import CoursesType from "../../../../backend/types/Courses";

const AddCourse = async (courseId: string, courseName: string, courses: CoursesType[], rerender: Function, setCourses: Function) => {
    console.log(courseId)
    await fetch(`${process.env.REACT_APP_API_URI}/course/addCourse`,
    {
        method: 'PUT',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({courseId})
    }).then((res: Response) => {
        if (!res.ok) {
            message.error("Could not add course. Please try again.")
            return;
        }
        console.log(courseId);
        rerender(courseId, courseName);
        setCourses(courses.filter((item => item.courseId !== courseId)));
        message.success("Course successfully added.");
    }).catch(() => {
        message.error("Could not add course. Please try again.")
    })
}

export default AddCourse