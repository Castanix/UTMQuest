/* eslint-disable no-shadow, no-unused-vars */
import { ObjectId } from "mongodb";

export enum qnsTypeEnum {
	mc = "mc",
	matching = "matching",
	short = "short",
}

export enum qnsStatusType {
	approved = "approved",
	pending = "pending",
}

interface QuestionsType {
	_id: string;
	qnsId: string;
	topicId: string;
	topicName: string;
	course: string;
	qnsName: string;
	qnsStatus: qnsStatusType;
	reviewStatus: number;
	qnsType: qnsTypeEnum;
	desc: string;
	xplan: string;
	choices: string[];
	ans: string;
	authId: string;
	authName: string;
	date: string;
	numDiscussions: number;
	snapshort: ObjectId | null;
}

export default QuestionsType;
