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
        
        it('get one question with link', async () => { 
            const link = "637025d7a8a5f2daeb1fdb30"; 

            const response = await request(app).get(`/question/oneQuestion/${link}`);
            
            expect(response.statusCode).toBe(200);
            expect(response.body).not.toBeNull();
            expect(response.body.latest).toEqual(true);
            expect(response.body.link).toEqual(link);
        });

        it('get one question with invalid link', async () => { 
            const link = "637025d7a8a5f2daeb1fdb31"; 

            const response = await request(app).get(`/question/oneQuestion/${link}`);
            
            expect(response.statusCode).toBe(404);
            expect(response.text).toEqual("No question found.");
        });

        it('get all latest question base off courseId', async () => {
            const data = { 
                courseId: "CSC108",
                utorid: "dummy22"
            };

            const response = await request(app).get(`/question/latestQuestions/${data.courseId}/${data.utorid}`);
            expect(response.statusCode).toBe(200);
            const result: QuestionsType[] = response.body;
            if (result.length > 0) { 
                result.forEach((question: QuestionsType) => {
                    expect(question.courseId).toEqual(data.courseId);
                    expect(question.authId).toEqual(data.utorid);
                });
            }
        });

        it('get similar topics base off term', async () => { 
            const data = {
                topicId: "6370240ea8a5f2daeb1fdb2f",
                originalQuestionId: "63702712b0a5cad939297a8e",
                term: "how"
            };

            const response = await request(app).get(`/question/similar/${data.topicId}/${data.originalQuestionId}/${data.term}`);
            expect(response.statusCode).toBe(200);
        });

        it('get edit history for a question', async () => { 
            const link = "637025d7a8a5f2daeb1fdb30";

            const response = await request(app).get(`/question/editHistory/${link}`);
            expect(response.statusCode).toBe(200);
            if (response.body.length > 0){ 
                response.body.forEach((question: QuestionsType) => {
                    expect(question.link).toEqual(link);
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
                desc: "this is a test", 
                xplan: "an example explanation",
                choices: ["A", "B", "C"],
                ans: "A",
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
            expect(response.body.link).not.toBeNull();

            const newTopicResponse = await request(app).get(`/topic/getTopic/${data.topicId}`);
            expect(newTopicResponse.body.numQuestions).toEqual(prevTopicNumQns + 1);
        });

        it('edit a question', async () => { 
            const data = { 
                oldVersion: "63703ab7417cca4e0158ee3f",
                link: "63703ab7417cca4e0158ee3f",
                topicId: "6370240ea8a5f2daeb1fdb2f",
                topicName: "testTopic",
                courseId: "ANT102",
                qnsName: "newQnsName",
                qnsType: "short",
                desc: "this is a test", 
                xplan: "an example explanation",
                choices: ["A", "B", "C"],
                ans: "A",
                authId: "dummy22",
                authName: "New Name",
                numDiscussions: 0,
                anon: false
            };

            const response = await request(app).post('/question/editQuestion').send(data);
            expect(response.statusCode).toBe(201);
            expect(response.body.link).toEqual(data.link);
            // need to set latest to false after for the real database
        });

        it('edit a question with non-existing question', async () => { 
            const data = { 
                oldVersion: "63707239db962d58fa9f6f82",
                link: "63707239db962d58fa9f6f8e",
                topicId: "63703e138f29f20175f9390c",
                topicName: "testTopic",
                courseId: "ANT102",
                qnsName: "newQnsName",
                qnsType: "short",
                desc: "this is a test", 
                xplan: "an example explanation",
                choices: ["A", "B", "C"],
                ans: "A",
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


