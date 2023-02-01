import type { ObjectId } from "mongodb";

interface BaseDiscussionType {
	qnsLink: string;
	op: boolean;
	userId: string;
	anonId: string;
	utorName: string;
	content: string;
	thread: string[];
	opDate: string;
	editDate: string | null;
	deleted: boolean;
	anon: boolean;
	edited: boolean;
}

export interface DiscussionBackEndType extends BaseDiscussionType {
	_id: ObjectId;
	utorId: string;
}

export interface DiscussionFrontEndType extends BaseDiscussionType {
	_id: string;
}
