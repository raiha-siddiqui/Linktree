import request from 'supertest'
import app from '../app.js'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import User from '../models/user.js'
import jwt from 'jsonwebtoken'



let mongoServer
let apiPath= '/api/v1/links'
let testUser, authToken, testUser2, authToken2

beforeAll(async()=>{
  mongoServer= await MongoMemoryServer.create()
  let mongoUri= mongoServer.getUri()
  await mongoose.connect(mongoUri)
})

afterAll(async()=>{
    await mongoose.disconnect()
    await mongoServer.stop()
})

beforeEach(async()=>{
    await User.deleteMany()
   testUser = await User.create({
    name: 'TestUser',
    email: 'test@example.com',
    password: "Password123!"
   })
   authToken= jwt.sign({_id: testUser._id}, process.env.JWT_SECRET, {expiresIn: '1d'})
   testUser2= await User.create({
    name: 'TestUser2',
    email: "test2@example.com",
    password: "Password123!"
   })
   authToken2= jwt.sign({_id: testUser2._id}, process.env.JWT_SECRET, {expiresIn: '1d'})
})

describe(`POST ${apiPath}`, ()=>{
    it('should create a link for an authenticated user', async()=>{
        const newLink={
            title: "A demo title",
            url: 'https://johndoe.dev'
        }
        const res= await request(app)
        .post(`${apiPath}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(newLink)
        expect(res.statusCode).toBe(201)
        expect(res.body.title).toBe(newLink.title)
        expect(res.body.url).toBe(newLink.url)
        expect(res.body).toHaveProperty('_id');

    })

    it('should return 400 if the url is invalid', async () => {
    const res = await request(app)
        .post(apiPath)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
            title: 'A demo title',
            url: 'this-is-not-a-valid-url' 
        });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].msg).toContain('A valid URL is required');
});
    it('should fail if the title is missing', async()=>{
        const res= await  request(app)
        .post(`${apiPath}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
            url:'https://johndoe.dev'
        })
        expect(res.statusCode).toBe(400)
        expect(res.body.errors[0].msg).toContain('Title is required');
    })
    it('should fail if not authenticated', async()=>{
        const res= await  request(app)
        .post(`${apiPath}`)
        .send({
           title: 'A demo title ',
           url: 'https://example.dev'
        })
        expect(res.statusCode).toBe(401)
    })
})

describe(`GET ${apiPath}`, ()=>{
    it('should retrieve an array of links for an authenticated user', async()=>{
        const link1= {title: 'Link One', url:'https://link1.com'}
        const link2= {title: 'Link Two', url:'https://link2.com'}
         await request(app)
         .post(`${apiPath}`)
         .set('Authorization', `Bearer ${authToken}`)
         .send(link1)

         await request(app)
         .post(`${apiPath}`)
         .set("Authorization", `Bearer ${authToken}`)
         .send(link2)

        const res= await request(app)
        .get(`${apiPath}`)
        .set("Authorization", `Bearer ${authToken}`)
         expect(res.statusCode).toBe(200)
         expect(res.body[0].title).toBe(link1.title)
         expect(res.body[1].url).toBe(link2.url)

    })
    it('should return an empty array if the user has no link', async()=>{
        const res= await request(app)
        .get(`${apiPath}`)
        .set('Authorization', `Bearer ${authToken}`)

        expect(res.statusCode).toBe(200)
        expect(res.body.length).toBe(0)
    })
    it('should return 400 if not authenticated', async()=>{
        const res= await request(app)
        .get(`${apiPath}`)
        expect(res.statusCode).toBe(401)
    })
})

describe(`PUT ${apiPath}/{linkId}`, () => { 
    it('should successfully update an existing link', async()=>{
         const createRes= await request(app)
         .post(`${apiPath}`)
         .set("Authorization", `Bearer ${authToken}`)
         .send({
            title: "Orignal Link",
            url: 'https://original.com'
         })
         const linkId= createRes.body._id
         const newLink={
             title: "update the orignal one",
            url: 'https://update.com'
         }
         const res= await request(app)
         .put(`${apiPath}/${linkId}`)
         .set("Authorization", `Bearer ${authToken}`)
         .send(newLink)
          expect(res.statusCode).toBe(200)
          expect(res.body.title).toBe(newLink.title)
          expect(res.body.url).toBe(newLink.url)

    })
    it('should fail with invalid data', async()=>{
         const createRes= await request(app)
         .post(`${apiPath}`)
         .set("Authorization", `Bearer ${authToken}`)
         .send({
            title: "Orignal Link",
            url: 'https://original.com'
         })
         const linkId= createRes.body._id
         const newLink={
            title: "update one",
            url: 'not-a-valid-url'
         }
         const res= await request(app)
         .put(`${apiPath}/${linkId}`)
         .set("Authorization", `Bearer ${authToken}`)
         .send(newLink)
         expect(res.statusCode).toBe(400)
         expect(res.body.errors[0].msg).toContain('A valid URL is required');
    })
    it('should fail if the link id is not exist', async()=>{
         const nonExistentId = '60d0fe4f5311236168a109cb'
        const res= await request(app)
        .put(`${apiPath}/${nonExistentId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
           title: "Orignal Link",
            url: 'https://original.com' 
        })
        expect(res.statusCode).toBe(404)
         expect(res.body.message).toContain('Link not found');
    })
    it('should failed if user trying to update another user link', async()=>{
        const createRes= await request(app)
        .post(`${apiPath}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
            title: "Orignal Link",
            url: 'https://original.com'
        })
        const linkId= createRes.body._id
        const newLink={
              title: "update the orignal one",
            url: 'https://update.com'
        }
        const res= await request(app)
        .put(`${apiPath}/${linkId}`)
        .set('Authorization', `Bearer ${authToken2}`)
        .send(newLink)
        expect(res.statusCode).toBe(404)
    })

 })

describe(`DELETE ${apiPath}/{linkId}`, ()=>{
    it('should delete an existing link', async()=>{
        const createRes= await request(app)
        .post(`${apiPath}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
            title: 'A demo title',
            url: 'https://original.com'
        })
        const linkId= createRes.body._id
        const deleteRes= await request(app)
        .delete(`${apiPath}/${linkId}`)
        .set("Authorization", `Bearer ${authToken}`)
         expect(deleteRes.statusCode).toBe(204)

         const verifyRes= await request(app)
         .get(`${apiPath}`)
         .set("Authorization", `Bearer ${authToken}`)
         expect(verifyRes.statusCode).toBe(200)
        expect(verifyRes.body.length).toBe(0)   
    })
    it('should fail if the link id does not exist', async()=>{
        const nonExistentId = '60d0fe4f5311236168a109cb'
        const res= await request(app)
        .delete(`${apiPath}/${nonExistentId}`)
        .set("Authorization", `Bearer ${authToken}`)
         expect(res.statusCode).toBe(404)
          expect(res.body.message).toContain('Link not found');
    })
    it('should fail if trying to delete another user links', async()=>{
        const createRes= await request(app)
        .post(`${apiPath}`)
        .set("Authorization", `Bearer ${authToken}`)
         .send({
            title: 'A demo title',
            url: 'https://original.com'
        })
        const linkId =  createRes.body._id
        const res= await request(app)
        .delete(`${apiPath}/${linkId}`)
        .set("Authorization", `Bearer ${authToken2}`)
        expect(res.statusCode).toBe(404)

    })
})

