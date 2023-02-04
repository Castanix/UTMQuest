import connectDB, {
	mongoDBConnection,
	utmQuestCollections,
} from "../db/db.service";
import mockedAccounts from "./mock/mockAccounts";
import mockedBadges from "./mock/mockBadges";
import mockedCourses, { mockCourses } from "./mock/mockCourses";
import mockedTopics, { mockTopics } from "./mock/mockTopics";
import mockedQuestions, { mockQuestions } from "./mock/mockQuestions";
import mockedDiscussions, { mockDiscussions } from "./mock/mockDiscussions";
import initDB from "../db/initDB";
import { argv } from "process";

const initMock = async (numCourses: number = 3, topicsPerCourse: number = 3, qnsPerTopic: number = 3) => {
	// init db
	await initDB();

	await connectDB();

	// setup mock
	mockCourses(numCourses, topicsPerCourse);

	mockTopics(numCourses, topicsPerCourse, qnsPerTopic);
	mockQuestions(qnsPerTopic);
	mockDiscussions();

	// populate db
	await Promise.all([
		utmQuestCollections.Accounts?.insertMany(mockedAccounts),
		utmQuestCollections.Badges?.insertMany(mockedBadges),
		utmQuestCollections.Courses?.insertMany(mockedCourses),
		utmQuestCollections.Topics?.insertMany(mockedTopics),
		utmQuestCollections.Questions?.insertMany(mockedQuestions),
		utmQuestCollections.Discussions?.insertMany(mockedDiscussions)
	]).then((values) => {
		values.every(value => value?.acknowledged) ? 
		console.log("Successfully mocked data") :
		console.log("Unsuccessfully mocked data");
	}).catch(err => {
		console.log(err);
	});

	mongoDBConnection.close();
};

initMock(
	argv[2] ? Number(argv[2]) : undefined,
	argv[3] ? Number(argv[3]) : undefined,
	argv[4] ? Number(argv[4]) : undefined,
);
