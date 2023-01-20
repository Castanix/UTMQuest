import * as mongoDB from 'mongodb';
import request from 'supertest';
import app from '../server';
import configValues from '../config';
import { QuestionsType } from '../types/Questions';

describe('Test for Question route api', () => { 
    const client: mongoDB.MongoClient = new mongoDB.MongoClient(configValues.MONGO_URI);
    beforeEach(async ()=> { 
        await client.connect();
    });

    afterEach(async () => { 
        await client.close(); 
    });

    describe('GET /', () => { 
        
        it('get one question with qnsLink', async () => { 
            const qnsLink = "637025d7a8a5f2daeb1fdb30"; 

            const response = await request(app).get(`/question/oneQuestion/${qnsLink}`);
            
            expect(response.statusCode).toBe(200);
            expect(response.body).not.toBeNull();
            expect(response.body.latest).toEqual(true);
            expect(response.body.qnsLink).toEqual(qnsLink);
        });

        it('get one question with invalid qnsLink', async () => { 
            const qnsLink = "637025d7a8a5f2daeb1fdb31"; 

            const response = await request(app).get(`/question/oneQuestion/${qnsLink}`);
            
            expect(response.statusCode).toBe(404);
            expect(response.text).toEqual("No question found.");
        });

        it('get all latest question base off courseId', async () => {
            const data = { 
                courseId: "CSC108",
                utorId: "dummy22"
            };

            const response = await request(app).get(`/question/latestQuestions/${data.courseId}/${data.utorId}`);
            expect(response.statusCode).toBe(200);
            const result: QuestionsType[] = response.body;
            if (result.length > 0) { 
                result.forEach((question: QuestionsType) => {
                    expect(question.courseId).toEqual(data.courseId);
                    expect(question.authId).toEqual(data.utorId);
                });
            }
        });

        it('get similar topics base off term', async () => { 
            const data = {
                topicId: "6370240ea8a5f2daeb1fdb2f",
                originalQnsId: "63702712b0a5cad939297a8e",
                term: "how"
            };

            const response = await request(app).get(`/question/similar/${data.topicId}/${data.originalQnsId}/${data.term}`);
            expect(response.statusCode).toBe(200);
        });

        it('get edit history for a question', async () => { 
            const qnsLink = "637025d7a8a5f2daeb1fdb30";

            const response = await request(app).get(`/question/editHistory/${qnsLink}`);
            expect(response.statusCode).toBe(200);
            if (response.body.length > 0){ 
                response.body.forEach((question: QuestionsType) => {
                    expect(question.qnsLink).toEqual(qnsLink);
                });
            }
        });

    });

    describe('POST /', () => { 
        it('add a question', async () => {
            const data = { 
                topicId: "63703e138f29f20175f9390c",
                topicName: "testTopic",
                courseId: "ANT102",
                qnsName: "testQuestionName",
                qnsType: "mc",
                description: "this is a test", 
                explanation: "an example explanation",
                choices: ["A", "B", "C"],
                answers: "A",
                authId: "dummy22",
                authName: "John Doe",
                numDiscussions: 0,
                anon: false
            };

            // get original topic
            const topicResponse = await request(app).get(`/topic/getTopic/${data.topicId}`);
            const prevTopicNumQns = topicResponse.body.numQuestions;

            const response = await request(app).post('/question/addQuestion').send(data);
            expect(response.statusCode).toBe(201);
            expect(response.body.qnsLink).not.toBeNull();

            const newTopicResponse = await request(app).get(`/topic/getTopic/${data.topicId}`);
            expect(newTopicResponse.body.numQuestions).toEqual(prevTopicNumQns + 1);
        });

        it('edit a question', async () => { 
            const data = { 
                oldVersion: "63703ab7417cca4e0158ee3f",
                qnsLink: "63703ab7417cca4e0158ee3f",
                topicId: "6370240ea8a5f2daeb1fdb2f",
                topicName: "testTopic",
                courseId: "ANT102",
                qnsName: "newQnsName",
                qnsType: "short",
                description: "this is a test", 
                explanation: "an example explanation",
                choices: ["A", "B", "C"],
                answers: "A",
                authId: "dummy22",
                authName: "New Name",
                numDiscussions: 0,
                anon: false
            };

            const response = await request(app).post('/question/editQuestion').send(data);
            expect(response.statusCode).toBe(201);
            expect(response.body.qnsLink).toEqual(data.qnsLink);
            // need to set latest to false after for the real database
        });

        it('edit a question with non-existing question', async () => { 
            const data = { 
                oldVersion: "63707239db962d58fa9f6f82",
                qnsLink: "63707239db962d58fa9f6f8e",
                topicId: "63703e138f29f20175f9390c",
                topicName: "testTopic",
                courseId: "ANT102",
                qnsName: "newQnsName",
                qnsType: "short",
                description: "this is a test", 
                explanation: "an example explanation",
                choices: ["A", "B", "C"],
                answers: "A",
                authId: "dummy22",
                authName: "New Name",
                numDiscussions: 0,
                anon: false
            };

            const response = await request(app).post('/question/editQuestion').send(data);
            expect(response.statusCode).toBe(404);
        });
    });
});


