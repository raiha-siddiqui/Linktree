import request from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '../models/user.js';

let mongoServer;
const apiPath = '/api/v1/auth';


beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});


afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});


describe(`POST ${apiPath}/register`, () => {
  it('should register a new user successfully with valid credentials', async () => {
    const res = await request(app)
      .post(`${apiPath}/register`)
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('name', 'Test User');
    expect(res.body.email).toBe('test@example.com');
  });

  it('should fail to register a user with an existing email', async () => {
    await User.create({ email: 'test@example.com', name: 'Test User', password: 'Password123!' });

    const res = await request(app)
      .post(`${apiPath}/register`)
      .send({
        name: 'Another User',
        email: 'test@example.com',
        password: 'Password456!',
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('User already exist');
  });

  it('should fail if the password is not provided', async () => {
    const res = await request(app)
      .post(`${apiPath}/register`)
      .send({
        name: 'Test User',
        email: 'test@example.com',
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Please provide all fields');
  });

  it('should fail if the email is invalid', async () => {
    const res = await request(app)
      .post(`${apiPath}/register`)
      .send({
        name: 'Test User',
        email: 'testexample.com', 
        password: 'Password123!',
      });
    expect(res.statusCode).toBe(400);
     expect(res.body.message).toContain('email Address');
  });

  it('should fail if the password is less than 8 characters', async () => {
    const res = await request(app)
      .post(`${apiPath}/register`)
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: '123',
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('Password must be 8 characters long');
  });

  it('should fail if the password is not strong enough', async () => {
    const res = await request(app)
      .post(`${apiPath}/register`)
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password', 
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('Password must strong');
  });
  it('should handle a database-level duplicate email error', async()=>{
    await User.create({
        name: 'First User',
        email: "duplicatEmail@example.com",
        password:"Password123!"
    })
    const duplicateUser= new User({
        name: 'Second User',
        email: "duplicatEmail@example.com",
        password:"Password456!"
    })
    await expect(duplicateUser.save()).rejects.toThrow()
  })
});

describe(`POST ${apiPath}/login`, () => {
  beforeEach(async () => {
    await request(app).post(`${apiPath}/register`).send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123!',
    });
  });

  it('should login a registered user with correct credentials', async () => {
    const res = await request(app)
      .post(`${apiPath}/login`)
      .send({
        email: 'test@example.com',
        password: 'Password123!',
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.email).toBe('test@example.com');
  });

  it('should fail to login with correct email but incorrect password', async () => {
    const res = await request(app)
      .post(`${apiPath}/login`)
      .send({
        email: 'test@example.com',
        password: 'WrongPassword123!', 
      });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  it('should fail to login if the user does not exist', async () => {
    const res = await request(app)
      .post(`${apiPath}/login`)
      .send({
        email: 'nonexistent@example.com', 
        password: 'Password123!',
      });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  it('should fail to login if the password is not provided', async () => {
    const res = await request(app)
      .post(`${apiPath}/login`)
      .send({
        email: 'test@example.com',
      });
    expect(res.statusCode).toBe(400);
    
    expect(res.body.message).toBe('Please provide email and password');
  });

  it('should fail to login if the email is not provided', async () => {
    const res = await request(app)
      .post(`${apiPath}/login`)
      .send({
        password: 'Password123!',
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Please provide email and password');
  });
});
describe('User model pre-save hook', ()=>{
    it('should not re-hash the password if its is not modified', async()=>{
        const user= await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password:'Password123!'
        })
        const savedUser=await User.findOne({email: 'test@example.com'}).select('+password')
        const originalHashedPassword= savedUser.password
        const userToUpdate= await User.findOne({
            email: 'test@example.com'
        })
        userToUpdate.name= 'New Updated Name'
        await userToUpdate.save()

        const updatedUser= await User.findOne({email: 'test@example.com'}).select('+password')
        expect(updatedUser.password).toBe(originalHashedPassword)
    })

})