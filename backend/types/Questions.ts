/* eslint-disable no-shadow, no-unused-vars */
import { ObjectId } from "mongodb";

export enum qnsStatusType {
	approved = "approved",
	pending = "pending",
};

export enum qnsTypeEnum {
	mc = "mc",
	short = "short"
};

export interface QuestionsType {
	_id: string;
	topicId: string;
	topicName: string;
	courseId: string;
	qnsName: string;
	qnsStatus?: qnsStatusType;
	reviewStatus: number;
	qnsType?: qnsTypeEnum;
	desc: string;
	xplan: string;
	choices: string[];
	ans: string[] | string;
	authId: string;
	authName: string;
	date: string;
	numDiscussions: number;
	anon: boolean;
	snapshot: ObjectId | null;
};

