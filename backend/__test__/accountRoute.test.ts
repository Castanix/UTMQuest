import * as mongoDB from 'mongodb';
import request from 'supertest';
import app from '../server';
import configValues from '../config';

describe('Test for Account route api', () => { 
    const client: mongoDB.MongoClient = new mongoDB.MongoClient(configValues.MONGO_URI);
    beforeEach(async ()=> { 
        await client.connect();
    });

    afterEach(async () => { 
        await client.close(); 
    });

    describe('GET /', () => { 
        it('get an account base off utorid', async ()=>{
            const utorId = "dummy22";

            const response = await request(app).get(`/account/getAccount/${utorId}`);
            expect(((JSON.parse(response.text)).utorId).toString()).toEqual(utorId);
            expect(response.statusCode).toBe(200);
        });

        it('get an account that does not exist', async () => { 
            const utorId = 'doesnotExists'; 

            const response = await request(app).get(`/account/getAccount/${utorId}`);
            expect(response.statusCode).toBe(404);
            expect(response.notFound).toEqual(true); 
        });

        it('check saved courses for a specific account', async () => { 
            const utorId = "dummy22";
            const courseId = "ANT102";

            const response = await request(app).get(`/account/checkSaved/${utorId}/${courseId}`);
            expect(response.statusCode).toBe(200); 
            expect(JSON.parse(response.text)).toEqual(true); 
        });

        it('checked saved courses for an non-existent account', async () => { 
            const utorId = "doesnotexist";
            const courseId = "CSC148";

            const response = await request(app).get(`/account/checkSaved/${utorId}/${courseId}`);
            expect(response.statusCode).toBe(404); 
            expect(response.notFound).toEqual(true); 
        });

        it('check unsaved courses for a specific account', async () => { 
            const utorId = "dummy22";
            const courseId = "BIO326";

            const response = await request(app).get(`/account/checkSaved/${utorId}/${courseId}`);
            expect(response.statusCode).toBe(200); 
            expect(JSON.parse(response.text)).toEqual(false); 
        });
    });

    describe('PUT /', () => { 
        it('update saved course - adding favourite course', async () => { 
            const body = {
                utorId: "dummy22",
                courseId: "ANT201"
            };

            const response = await request(app).put('/account/updateBookmarkCourses').send(body);
            expect(response.statusCode).toBe(200);
            expect(response.body.value.savedCourses.pop()).toEqual(body.courseId);
        });

        it('update saved course - removing favourite course', async () => { 
            const body = {
                utorId: "dummy22",
                courseId: "ANT201",
                bookmarkCourses: true
            };

            const response = await request(app).put('/account/updateBookmarkCourses').send(body);
            expect(response.statusCode).toBe(200);
            expect(response.body.value.bookmarkCourses.pop()).not.toEqual(body.courseId);
        });
    });
});