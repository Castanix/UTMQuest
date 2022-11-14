import * as mongoDB from 'mongodb';
import request from 'supertest';
import app from '../server';
import configValues from '../config';

describe('Test for Course route api', () => { 
    const client: mongoDB.MongoClient = new mongoDB.MongoClient(configValues.MONGO_URI);
    beforeEach(async ()=> { 
        await client.connect();
    });

    afterEach(async () => { 
        await client.close(); 
    });

    describe('GET /', () => { 
        it('get all courses', async ()=>{
            const response = await request(app).get('/course/getAllCourses');
            // find a way to get the body from the request 
            expect(response.statusCode).toEqual(200);
        });
    });

    describe('POST /', () => { 
        it('adding a course', async () => { 
            const course = {
                courseId: "TEST123",
                courseName: "Testing adding course"
            };

            // should add clean up to remove it afterwards 

            const response = await request(app).post('/course').send(course);
            expect(response.statusCode).toEqual(201);
            expect(response.text).toEqual(`course ${course.courseId} has been added successfully`); 
            // need to delete course after {"courseId": "TEST123"}
        });

        it('add an already existing course', async () => { 
            const course = {
                courseId: "ANT101",
                courseName: "Introduction to Biological Anthropology and Archaeology"
            };
    
            const response = await request(app).post('/course').send(course);
            expect(response.statusCode).toBe(409);
            expect((JSON.parse(response.text).error).toString()).toEqual("data already exists");
        });
    });

    describe('PUT /', () => { 
        it('add course - a course added should be true', async () => { 
            const course = { courseId: "ANT101" };

            const response = await request(app).put('/course/addCourse').send(course);
            expect(response.statusCode).toBe(200);
            expect(response.text).toEqual(`course ${course.courseId} has been updated successfully`);
        });
    });

});

