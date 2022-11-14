import * as mongoDB from 'mongodb';
import request from 'supertest';
import app from '../server';
import configValues from '../config';

describe('Test for Topics route api', () => { 
    let deleteTopicId: string; 
    const client: mongoDB.MongoClient = new mongoDB.MongoClient(configValues.MONGO_URI);
    beforeEach(async ()=> { 
        await client.connect();
    });

    afterEach(async () => { 
        await client.close(); 
    });

    describe('GET /', () => { 

        it('get topic base off topicid', async () => { 
            const topicId = "6370240ea8a5f2daeb1fdb2f";

            const response = await request(app).get(`/topic/getTopic/${topicId}`);
            expect(response.statusCode).toBe(200);
            expect(response.body).not.toBeNull();
        });

        it('get topic - unable to find topic base topicid', async () => { 
            const topicId = "6370240ea8a5f2daeb1fdb2e";

            const response = await request(app).get(`/topic/getTopic/${topicId}`);
            expect(response.statusCode).toBe(404);
        });
        
        it('get all topics based off courseId', async () => { 
            const courseId = "CSC108";

            const response = await request(app).get(`/topic/getTopics/${courseId}`);
            expect(response.statusCode).toBe(200);
            expect(response.body.length).not.toEqual(0); 
        });

        it('get all topics with an invalid courseId', async () => { 
            const courseId = "AGAG131";

            const response = await request(app).get(`/topic/getTopics/${courseId}`);
            expect(response.statusCode).toBe(404);
        });
    });

    describe('POST /', () => { 
        it('add an new topic', async () => { 
            const body = { 
                courseId: "ANT101",
                topicName: "Arrays"
            };

            // grab the coruse beforehand and check numTopics
            const prevCourse = await request(app).get(`/course/getCourse/${body.courseId}`);
            expect(prevCourse.body.numTopics).toEqual(0);
            expect(prevCourse.statusCode).toBe(200); 

            // post topic 
            const response = await request(app).post('/topic/addTopic').send(body);
            expect(response.statusCode).toBe(201); 
            expect(response.body.insertedId).not.toBeNull();
            
            // grab course afterwards and check numTopics 
            const currCourse = await request(app).get(`/course/getCourse/${body.courseId}`);
            expect(currCourse.body.numTopics).toEqual(1);
            expect(currCourse.statusCode).toBe(200);

            deleteTopicId = response.body.insertedId;

            // need to set numTopic to 0 before run in Courses for the specific course - courseId
        });

        it('add in an invalid course', async () => { 
            const body = { 
                courseId: "doesnotexist",
                topicName: "Arrays"
            };

            const response = await request(app).post('/topic/addTopic').send(body);
            expect(response.statusCode).toBe(404);
            expect(response.text).toEqual("The given course doesn't exist.");
        });

        it('add in an invalid topic', async () => { 
            const body = { 
                courseId: "ANT101",
                topicName: ""
            };

            const response = await request(app).post('/topic/addTopic').send(body);
            expect(response.statusCode).toBe(400);
            expect(response.text).toEqual("Cannot add with given topic name");
        });

    });

    describe('PUT /', () => { 
        it('update topic', async () => { 
            const body = { 
                _id: "637185e02a1e6f76a26ae069",
                courseId: "ANT101",
                newTopic: "newTopicName"
            };

            const response = await request(app).put('/topic/putTopic').send(body);
            expect(response.statusCode).toBe(200);
            expect(response.body.acknowledged).toEqual(true);
        });

        it('update topic with invalid id', async () => { 
            const body = { 
                _id: "151616161",
                courseId: "ANT101",
                newTopic: "newTopicName"
            };

            const response = await request(app).put('/topic/putTopic').send(body);
            expect(response.statusCode).toBe(400);
            expect(response.text).toEqual("Invalid ObjectId : _id");
        });

        it('update topic with non-existant topic', async () => { 
            const body = { 
                _id: "63701a4d8b7f6ada67bb97f7",
                courseId: "ANT101",
                newTopic: "newTopicName"
            };

            const response = await request(app).put('/topic/putTopic').send(body);
            expect(response.statusCode).toBe(404);
            expect(response.text).toEqual("No such topic found.");
        });
    });

    describe('DELETE /', () => { 
        it('delete topic with invalid id', async () => { 
            const body = { 
                _id: "151616161",
                courseId: "ANT101",
                newTopic: "newTopicName"
            };

            const response = await request(app).put('/topic/putTopic').send(body);
            expect(response.statusCode).toBe(400);
            expect(response.text).toEqual("Invalid ObjectId : _id");
        });

        it('delete topic with non-existant topic', async () => { 
            const body = { 
                _id: "63701a4d8b7f6ada67bb97f7",
                courseId: "ANT101",
                newTopic: "newTopicName"
            };

            const response = await request(app).put('/topic/putTopic').send(body);
            expect(response.statusCode).toBe(404);
            expect(response.text).toEqual("No such topic found.");
        });

        it('delete topic', async () =>{
            const body = { 
                _id: deleteTopicId,
                courseId: "ANT101",
                newTopic: "newTopicName"
            };

            // grab the coruse beforehand and check numTopics
            const prevCourse = await request(app).get(`/course/getCourse/${body.courseId}`);
            expect(prevCourse.body.numTopics).toEqual(1);
            expect(prevCourse.statusCode).toBe(200); 

            const response = await request(app).delete('/topic/deleteTopic').send(body);
            expect(response.statusCode).toBe(200);

             // grab course afterwards and check numTopics 
            const currCourse = await request(app).get(`/course/getCourse/${body.courseId}`);
            expect(currCourse.body.numTopics).toEqual(0);
            expect(currCourse.statusCode).toBe(200); 

            // need to update the id with the latest one added in the topic databse for ANT101
        });
    });

});