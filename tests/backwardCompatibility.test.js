const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const mongoose = require('mongoose');

describe('Backward Compatibility - Pickup Members to Warehouse Managers', () => {
  let adminToken;
  let adminUser;
  let warehouseManager;

  beforeAll(async () => {
    // Create admin user for authentication
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@closetrush.com',
      mobile: '1234567890',
      password: 'admin123',
      address: '123 Admin Street',
      userType: 'admin'
    });

    // Login to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@closetrush.com',
        password: 'admin123'
      });
    
    adminToken = loginResponse.body.token;

    // Create a warehouse manager for testing
    warehouseManager = await User.create({
      name: 'Test Warehouse Manager',
      email: 'warehouse@closetrush.com',
      mobile: '9876543210',
      password: 'password123',
      address: '456 Warehouse Street',
      userType: 'warehouse_manager',
      warehouseManagerStatus: 'pending'
    });
  });

  afterAll(async () => {
    // Clean up
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe('GET /api/pickup-members', () => {
    it('should proxy to /api/warehouse-managers and return warehouse managers', async () => {
      const response = await request(app)
        .get('/api/pickup-members')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('members');
      expect(Array.isArray(response.body.members)).toBe(true);
      
      // Should include our test warehouse manager
      const foundManager = response.body.members.find(
        m => m.email === 'warehouse@closetrush.com'
      );
      expect(foundManager).toBeDefined();
      expect(foundManager.userType).toBe('warehouse_manager');
    });

    it('should support status filter via query parameter', async () => {
      const response = await request(app)
        .get('/api/pickup-members?status=pending')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('members');
      
      // All returned members should have pending status
      response.body.members.forEach(member => {
        expect(member.warehouseManagerStatus).toBe('pending');
      });
    });
  });

  describe('PATCH /api/pickup-members/:id/approve', () => {
    it('should proxy to /api/warehouse-managers/:id/approve', async () => {
      const response = await request(app)
        .patch(`/api/pickup-members/${warehouseManager._id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body.member.warehouseManagerStatus).toBe('approved');
    });
  });

  describe('PATCH /api/pickup-members/:id/reject', () => {
    it('should proxy to /api/warehouse-managers/:id/reject', async () => {
      // Create another warehouse manager to reject
      const anotherManager = await User.create({
        name: 'Another Warehouse Manager',
        email: 'warehouse2@closetrush.com',
        mobile: '9876543211',
        password: 'password123',
        address: '789 Warehouse Street',
        userType: 'warehouse_manager',
        warehouseManagerStatus: 'pending'
      });

      const response = await request(app)
        .patch(`/api/pickup-members/${anotherManager._id}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Test rejection reason' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body.member.warehouseManagerStatus).toBe('rejected');
      expect(response.body.member.warehouseManagerRejectionReason).toBe('Test rejection reason');
    });
  });
});
