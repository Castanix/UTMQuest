import type { WithId, Document, ObjectId } from 'mongodb';

export interface DiscussionType extends WithId<Document> {
	_id: ObjectId;
	qnsLink: string;
    op: boolean;
    authId: string; 
    authName: string; 
    content: string;
    date: string; 
    deleted: boolean;
    thread: string[];
	anon: boolean;
	edited: boolean;
};


export interface DiscussionFrontEndType {
	_id: string;
	qnsLink: string;
	op: boolean;
	authId: string;
	authName: string;
	content: string;
	thread: string[];
	date: string;
	deleted: boolean;
	anon: boolean;
	edited: boolean;
}
