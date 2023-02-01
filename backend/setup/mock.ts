import connectDB, {
	mongoDBConnection,
	utmQuestCollections,
} from "../db/db.service";
import mockedAccounts from "./mock/mockAccounts";
import mockedBadges from "./mock/mockBadges";
import mockedCourses from "./mock/mockCourses";
import mockedTopics, { mockTopics } from "./mock/mockTopics";
import mockedQuestions, { mockQuestions } from "./mock/mockQuestions";
import mockedDiscussions, { mockDiscussions } from "./mock/mockDiscussions";
import initDB from "../db/initDB";

const init = async () => {
	// init db
	await initDB();

	await connectDB();

	// setup mock
	mockTopics();
	mockQuestions();
	mockDiscussions();

	// populate db

	await utmQuestCollections.Accounts?.insertMany(mockedAccounts);

	await utmQuestCollections.Badges?.insertMany(mockedBadges);

	await utmQuestCollections.Courses?.insertMany(mockedCourses);

	await utmQuestCollections.Topics?.insertMany(mockedTopics);

	await utmQuestCollections.Questions?.insertMany(mockedQuestions);

	await utmQuestCollections.Discussions?.insertMany(mockedDiscussions);

	mongoDBConnection.close();
};

init();
