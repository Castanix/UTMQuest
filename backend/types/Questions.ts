/* eslint-disable no-shadow, no-unused-vars */
import { ObjectId } from "mongodb";

enum qnsTypeEnum {
	mc = "mc",
	matching = "matching",
	short = "short",
}

enum qnsStatusType {
	approved = "approved",
	pending = "pending",
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
