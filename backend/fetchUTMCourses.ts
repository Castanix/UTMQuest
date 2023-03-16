import axios from "axios";
import connectDB, { utmQuestCollections } from "./db/db.service";

const dataBody = {
	courseCodeAndTitleProps: {
		courseCode: "",
		courseTitle: "",
		courseSectionCode: "",
	},
	courseLevels: [],
	creditWeights: [],
	dayPreferences: [],
	deliveryModes: [],
	departmentProps: [],
	direction: "asc",
	divisions: ["ERIN"],
	instructor: "",
	page: 1,
	pageSize: 2000,
	requirementProps: [],
	sessions: ["20229", "20231", "20229-20231"],
	timePreferences: [],
};

const fetchCourses = async () => {
	await connectDB();
	await axios({
		method: "post",
		url: "https://api.easi.utoronto.ca/ttb/getPageableCourses",
		data: dataBody,
	}).then((result) => {
		Object.values(result.data.payload.pageableCourse.courses).forEach(
			(item: any) => {
				const course = {
					courseId: item.code.substring(0, item.code.length - 2),
					courseName: item.name,
					numTopics: 0,
					added: false,
				};
				utmQuestCollections.Courses?.insertOne(course)
					.then((res) => {
						if (!res) {
							console.log(
								`INSERTION FOR COURSE ${course} HAS FAILED!`
							);
						}
						console.log("SUCCESSFULLY INSERTED COURSES");
					})
					.catch((err) => {
						console.error(err);
					});
			}
		);
	});

	console.log("Added all courses");
};

fetchCourses();

export default fetchCourses;
