import { ObjectId } from "mongodb";

interface BaseCoursesType {
	courseId: string;
	courseName: string;
	numTopics: number;
	added: boolean;
}

export interface CoursesFrontEndType extends BaseCoursesType {
	_id: string;

}

export interface CoursesBackEndType extends BaseCoursesType {
	_id: ObjectId;
	numQns: number;
}
