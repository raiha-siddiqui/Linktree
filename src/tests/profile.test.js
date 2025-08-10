import request from 'supertest'
import app from '../app.js'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import User from '../models/user.js'
import jwt from 'jsonwebtoken'


let mongoServer
let apiPath= '/api/v1/profile'
let testUser,  authToken, testUser2, authToken2


beforeAll(async()=>{
    mongoServer= await MongoMemoryServer.create()
    const mongoUri= mongoServer.getUri()
    await mongoose.connect(mongoUri)
})

afterAll(async()=>{
    await mongoose.disconnect()
    await mongoServer.stop()
})

beforeEach(async()=>{
    await User.deleteMany({})
 //create a test user directly in the db
    testUser= await User.create({
   name:"Test User",
   email: "test@example.com",
   password: "Password123!",
   username: 'test-user',
   bio: 'a test user bio',
   imageUrl: "https://example.com/new_image.jpg"
})
// genertate JWT for that user
authToken = jwt.sign({_id: testUser._id}, process.env.JWT_SECRET, {expiresIn: "1d"}) 

testUser2= await User.create({
    name: "User Two",
    email: 'user2@example.com',
    password:'Password123!'
})
authToken2 = jwt.sign({_id: testUser2._id}, process.env.JWT_SECRET, {expiresIn: "1d"}) 

})


describe(`GET ${apiPath}/me` , () => { 
    it('should get a logged-in user profile information', async()=>{
        const res= await request(app)
        .get(`${apiPath}/me`)
        .set('Authorization', `Bearer ${authToken}`)
        expect(res.statusCode).toBe(200)
        expect(res.body.email).toBe(testUser.email)
        expect(res.body._id).toBe(testUser._id.toString())
        expect(res.body.password).toBeUndefined()
    })
    it('should return 401 if no token is provided', async()=>{
        const res= await request(app)
        .get(`${apiPath}/me`)
        expect(res.statusCode).toBe(401)
        expect(res.body.message).toContain('Not authorized no token provided')
    })
     it('should return 401 if the token is invalid or malformed', async()=>{
        const res= await request(app)
        .get(`${apiPath}/me`)
        .set('Authorization', `Bearer 12356837849hdhydgdf`)
        expect(res.statusCode).toBe(401)
        expect(res.body.message).toContain('Not Authorized, token failed')
    })
    it(' should return 401 if the token is valid but the user has been deleted', async()=>{
        //Here, we have a valid authToken for a user that we are about to delete
        await User.findByIdAndDelete(testUser._id)
        const res= await request(app)
        .get(`${apiPath}/me`)
        .set('Authorization', `Bearer ${authToken}`)
        expect(res.statusCode).toBe(401)
        expect(res.body.message).toContain('User not found')
    })
 })

 describe(`PUT ${apiPath}`, ()=>{
    it('should return 401 if no token is provided', async()=>{
        const res= await request(app)
        .put(`${apiPath}`)
        expect(res.statusCode).toBe(401)
        expect(res.body.message).toBe('Not authorized no token provided')
    })
    it('should return 401 if token is invalid', async()=>{
        const res= await request(app)
        .put(`${apiPath}`)
        .set('Authorization', `Bearer 12356837849hdhydgdf`)
        expect(res.statusCode).toBe(401)
        expect(res.body.message).toContain('Not Authorized, token failed')
    })
    it('should update the user profile for an authenticated user', async()=>{
        const updateData={
            username: "new_username",
            bio:'This is my new bio',
            imageUrl: 'https://valid.url/image.png'
        }
        const res=await request(app)
        .put(`${apiPath}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        expect(res.statusCode).toBe(200)
        expect(res.body.username).toBe(updateData.username)
        expect(res.body.bio).toBe(updateData.bio)
    })
    it('should succeed with 200 ok when the request body is empty', async()=>{
        const res= await request(app)
        .put(`${apiPath}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        expect(res.statusCode).toBe(200)
        expect(res.body.username).toBe(testUser.username)
        expect(res.body.bio).toBe(testUser.bio)
    })
    it('should update the field to null if null is provided', async()=>{
        const res= await request(app)
        .put(`${apiPath}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({bio: null})
        expect( res.statusCode).toBe(200)
        expect(res.body.bio).toBe('')
    })
    it('should return 400 if the image url is invalid url', async()=>{
        const res= await request(app)
        .put(`${apiPath}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({imageUrl: 'not-a-valid-url'})
        expect(res.statusCode).toBe(400)
        expect(res.body.error[0].msg).toContain('A valid image URL is required');
    })
   it('should return 400 if the bio is too long', async()=>{
        const res= await request(app)
        .put(`${apiPath}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({bio: 'a'.repeat(251)})
        expect(res.statusCode).toBe(400)
    })
    it('should succeed when updating only a single field', async()=>{
        const res= await request(app)
        .put(`${apiPath}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({bio: 'this is my bio'})
        expect(res.statusCode).toBe(200)
        expect(res.body.bio).toBe('this is my bio')
        expect(res.body.username).toBe(testUser.username)

    })
    it('should return 401 if user is not authenticated', async()=>{
        const res= await request(app)
        .put(`${apiPath}`)
        .send({
            username: 'some_username'
        })
        expect(res.statusCode).toBe(401)
    })
      it('should return 400 if username is too short', async()=>{
        const res= await request(app)
        .put(`${apiPath}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({username: 'a'})
        expect(res.statusCode).toBe(400)
        expect(res.body.error[0].msg).toContain('Username must be at least 4 characters')
    })
     it('should return 400 if username is already taken by another user', async()=>{

        const res= await request(app)
        .put(`${apiPath}`)
        .set('Authorization', `Bearer ${authToken2}`)
        .send({username: 'test-user'})

        expect(res.statusCode).toBe(400)
        expect(res.body.message).toBe('This username is already taken')
    })
    it('should succes if the user re-submits their own username', async()=>{

        const res= await request(app)
        .put(`${apiPath}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ username: testUser.username })
        expect(res.statusCode).toBe(200)
    })

 })