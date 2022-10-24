import { ObjectId } from "mongodb";

enum qnsTypeEnum {
	mc,
	matching,
	short,
}

enum qnsStatusType {
	approved,
	pending,
}

interface QuestionsType {
	_id: string;
	qnsId: string;
	topic: string;
	course: string;
	qnsName: string;
	qnsStatus: qnsStatusType;
	reviewStatus: string;
	qnsType: qnsTypeEnum;
	desc: string;
	xplan: string;
	choices: string[];
	ans: string;
	authId: string;
	authName: string;
	date: string;
	snapshort: ObjectId | null;
}

export default QuestionsType;
