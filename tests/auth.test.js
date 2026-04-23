const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Session = require('../models/Session');
const mongoose = require('mongoose');

describe('Authentication API', () => {
  
  beforeAll(async () => {
    // Connect to test database
    // In production, use a separate test database
  });

  afterAll(async () => {
    // Clean up and close connection
    await User.deleteMany({});
    await Session.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        mobile: '9876543210',
        password: 'password123',
        address: '123 Test Street',
        userType: 'individual'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should fail with duplicate email', async () => {
      const userData = {
        name: 'Test User 2',
        email: 'test@example.com', // Same email
        mobile: '9876543211',
        password: 'password123',
        address: '123 Test Street'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
    });

    it('should fail with missing required fields', async () => {
      const userData = {
        name: 'Test User',
        email: 'test2@example.com'
        // Missing mobile, password, address
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.error.code).toBe('BAD_REQUEST');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.message).toBe('Login successful');
    });

    it('should fail with invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should lock account after 5 failed attempts', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      // Make 5 failed login attempts
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/auth/login')
          .send(loginData);
      }

      // 6th attempt should return account locked error
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(423);

      expect(response.body.error.code).toBe('ACCOUNT_LOCKED');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully with valid token', async () => {
      // First login to get token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      const token = loginResponse.body.token;

      // Then logout
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.message).toBe('Logged out successfully');
    });

    it('should fail without token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401);

      expect(response.body.error.code).toBe('TOKEN_MISSING');
    });
  });
});
