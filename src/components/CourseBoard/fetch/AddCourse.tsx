<<<<<<< HEAD:src/pages/CourseBoard/fetch/AddCourse.tsx
import { message } from "antd";
import CoursesType from "../../../../backend/types/Courses";

const AddCourse = async (courseId: string, courseName: string, modalData: CoursesType[], rerender: Function, setModalData: Function) => {
    await fetch(`${process.env.REACT_APP_API_URI}/course/addCourse`,
        {
            method: 'PUT',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ courseId })
        }).then((res: Response) => {
            if (!res.ok) {
                throw new Error("Could not add course. Please try again.");
            }
            return res.json();
        }).then(result => {
            rerender(result._id, courseId, courseName);
            setModalData(modalData.filter((item => item.courseId !== courseId)));
            message.success("Course successfully added.");
        }).catch((error) => {
            message.error(error.message);
        });
};

=======
import { message } from "antd";
import CoursesType from "../../../../backend/types/Courses";

const AddCourse = async (courseId: string, courseName: string, courses: CoursesType[], rerender: Function, setCourses: Function) => {
    await fetch(`${process.env.REACT_APP_API_URI}/course/addCourse`,
        {
            method: 'PUT',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ courseId })
        }).then((res: Response) => {
            if (!res.ok) {
                message.error("Could not add course. Please try again.");
                return;
            }
            rerender(courseId, courseName);
            setCourses(courses.filter((item => item.courseId !== courseId)));
            message.success("Course successfully added.");
        }).catch(() => {
            message.error("Could not add course. Please try again.");
        });
};

>>>>>>> 36b5529 (layout: combine courses page and dashboard page into one):src/components/CourseBoard/fetch/AddCourse.tsx
export default AddCourse;