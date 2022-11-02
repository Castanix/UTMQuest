interface DiscussionType {
	_id: string;
	questionId: string;
	op: boolean;
	authId: string;
	authName: string;
	content: string;
	thread: string[];
	date: string;
	deleted: boolean;
	isAnon: boolean;
}

export default DiscussionType;
