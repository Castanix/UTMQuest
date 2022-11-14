import * as mongoDB from 'mongodb';
import request from 'supertest';
import app from '../server';
import configValues from '../config';

describe('Test for Discussion route api', () => { 
    const client: mongoDB.MongoClient = new mongoDB.MongoClient(configValues.MONGO_URI);
    beforeEach(async ()=> { 
        await client.connect();
    });

    afterEach(async () => { 
        await client.close(); 
    });

    describe('GET /', () => { 
        it('get a specific discussion base off id', async () => { 
            const discussionId = "63702960a8a5f2daeb1fdb31";

            const response = await request(app).get(`/discussion/${discussionId}`);
            expect(response.statusCode).toBe(200);
            expect(response.body).not.toBeNull();
            expect(response.body._id.toString()).toEqual(discussionId);
        });

        it('get an invalid discussion', async () => { 
            const discussionId = "63657a22e1d9ab44685aa544";

            const response = await request(app).get(`/discussion/${discussionId}`);
            expect(response.statusCode).toBe(404);
        });

        it('get all original discussion posts base off questionId', async () => { 
            // do I need to populate the data with my own values and then test it?
            // create question then check to see - or do I need to have a mongodb memory
            const questionId = "63704ec78f29f20175f93924"; 

            const response = await request(app).get(`/discussion/thread/${questionId}`);
            expect(response.statusCode).toBe(200);
            expect(response.body.length).toEqual(3);
        });

        it('get all original discussion posts base off invalid questionId', async () => { 
            const questionId = "6364845d0c0097f9fb228e59"; 

            const response = await request(app).get(`/discussion/thread/${questionId}`);
            expect(response.statusCode).toBe(404);
        });


        it('get all discussions base off list of discussionIds', async () =>{ 
            const ids = "id1=63702960a8a5f2daeb1fdb31&id2=63702963a8a5f2daeb1fdb32";

            const response = await request(app).get(`/discussion/allThreads/id?${ids}`);
            expect(response.statusCode).toBe(200);
            expect(response.body.length).toEqual(2); 
            expect(response.body[0]._id.toString()).toEqual("63702960a8a5f2daeb1fdb31");
            expect(response.body[1]._id.toString()).toEqual("63702963a8a5f2daeb1fdb32");
        });

    });

    describe('POST /', () => { 
        it('post an new discussion for a specific question', async () => { 
            // maybe do a check and see if the question numDiscussion got incremented 
            // also check to see if the discussion with that id got inserted 
            const discussion = {
                question: '63703e9d8f29f20175f9390d',
                op: false, 
                authId: "dummy1",
                authName: "JohnDoe",
                content: "Hello there", 
                thread: [], 
                anon: false
            };

            const response = await request(app).post(`/discussion/${discussion.question}`).send(discussion);
            expect(response.statusCode).toBe(201);
            expect(response.body.insertedId).not.toBeNull();
        });

        it('post an new discussion for an invalid question', async () => { 
            // maybe do a check and see if the question numDiscussion got incremented 
            // also check to see if the discussion with that id got inserted 
            const discussion = {
                question: '63687856a6311ba71ec75911',
                op: false, 
                authId: "dummy1",
                authName: "JohnDoe",
                content: "Hello there", 
                thread: [], 
                anon: false
            };

            const response = await request(app).post(`/discussion/${discussion.question}`).send(discussion);
            expect(response.statusCode).toBe(404);
        });
    });

    describe('PUT /', () => { 
        it('update a specific discussion', async () => { 
            const discussionId = "63657a22e1d9ab44685aa5aa";
            const discussion = {
                op: false, 
                authId: "dummy1",
                authName: "JohnDoe",
                content: "Hello there", 
                thread: [], 
                anon: true
            };

            const response = await request(app).put(`/discussion/${discussionId}`).send(discussion);
            expect(response.statusCode).toBe(200);
            expect(response.text).toEqual('Succesfully updated discussion');
        });
    });

    describe('DELETE /', () => { 

        it('delete a discussion base off id', async () => { 
            const discussionId = "6371859218134340ad737155";
        
            const response = await request(app).delete(`/discussion/${discussionId}`); 
            expect(response.statusCode).toBe(202);
            expect(response.body.value.content).toEqual('This message was deleted by the original author or a moderator');
            expect(response.body.value._id).toEqual(discussionId);
        });
    });

});