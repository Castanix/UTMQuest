import { ObjectId } from "mongodb";
import { QuestionBackEndType } from "../../types/Questions";
import { DiscussionBackEndType } from "../../types/Discussion";
import mockedAccounts from "./mockAccounts";
import mockedQuestions from "./mockQuestions";

const mockedDiscussions: DiscussionBackEndType[] = [];

export const mockDiscussions = async () => {
	mockedQuestions.forEach((question: QuestionBackEndType, index: number) => {
		const someId = new ObjectId();
		const randAccount =
			mockedAccounts[Math.floor(Math.random() * 3)];
		
		const isAnon = Math.random() < 0.25;

		mockedDiscussions.push({
			_id: someId,
			utorId: randAccount.utorId,
			qnsLink: question.qnsLink,
			op: true,
			userId: randAccount.userId,
			anonId: randAccount.anonId,
			utorName: randAccount.utorName,
			content: `Hello ${index}`,
			thread: [],
			opDate: new Date().toISOString(),
			editDate: null,
			deleted: false,
			anon: isAnon,
			edited: false,
		});
	});
};

export default mockedDiscussions;
