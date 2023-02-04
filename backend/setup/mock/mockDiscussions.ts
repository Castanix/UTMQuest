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
			mockedAccounts[Math.floor(Math.random() * (3 - 1) + 1)];

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
			anon: false,
			edited: false,
		});
	});
};

export default mockedDiscussions;
