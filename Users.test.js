import request from 'supertest';
import express from 'express';
import router from './Routers/Users.js';
import UsersModels from './Models/UsersModels.js';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();

const corsOptions = cors({
  origin: true,
  credentials: true
})
app.options('*', cors(corsOptions));
app.use(cors(corsOptions))
app.use(cookieParser());
app.use(express.json());
app.use(router);
const agent = request.agent(app);

describe('User Endpoints', () => {
  const _id = new mongoose.Types.ObjectId();

  beforeAll(async () => {
    // Create a user and get the token
    const user = {
      fullName: 'John Doe',
      email: 'johndoe@example.com',
      password: 'password123',
      _id,
      tokens: []
    };

    await UsersModels.create(user);
    const response = await agent
      .post('/api/users/login')
      .send({ email: user.email, password: user.password });
  });

  afterAll(async () => {
    // Clean up the database
    await UsersModels.deleteMany();
  });

  describe('POST /api/users/new', () => {
    it('should create a new user', async () => {
      const newUser = {
        fullName: 'Jane Smith',
        email: 'janesmith@example.com',
        password: 'password456',
        _id: new mongoose.Types.ObjectId(),
        tokens: []
      };

      const response = await request(app)
        .post('/api/users/new')
        .send(newUser);

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('result', 'User Created Successfully!');
      expect(response.body).toHaveProperty('token');
    });
  });

  describe('POST /api/users/login', () => {
    it('should log in a user and return a token', async () => {
      const userCredentials = {
        email: 'johndoe@example.com',
        password: 'password123',
      };

      const response = await agent
        .post('/api/users/login')
        .send(userCredentials);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('result', 'Login Successful!');
    });
  });

  describe('PATCH /api/users/update', () => {
    it('should update the user information', async () => {
      const updatedUser = {
        fullName: 'John Doe',
        email: 'johndoe@example.com',
      };

      const response = await agent
        .patch('/api/users/update')
        
        .send(updatedUser);

      expect(response.statusCode).toBe(200);
      expect(response.body).toBe('User Info is updated successfully!');
    });
  });

  describe('DELETE /api/users/delete', () => {
    it('should delete the user', async () => {
      const response = await agent
        .delete('/api/users/delete')

      expect(response.statusCode).toBe(200);
      expect(response.body).toBe('Your account is deleted successfully!');
    });
  });

  describe('GET /api/users/data/', () => {
    it('should get the user information', async () => {
      const response = await agent
        .get('/api/users/data/')

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('fullName', 'John Doe');
      expect(response.body).toHaveProperty('email', 'johndoe@example.com');
      expect(response.body).not.toHaveProperty('_id');
      expect(response.body).not.toHaveProperty('tokens');
      expect(response.body).not.toHaveProperty('password');
    });
  });

  describe('GET /api/users/logout', () => {
    it('should log out the user', async () => {
      const response = await agent
        .get('/api/users/logout')

      expect(response.statusCode).toBe(200);
      expect(response.body).toBe('You are logged out successfully!');
    });
  });
});