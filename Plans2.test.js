import request from 'supertest';
import express from 'express';
import PlansModel from './Models/PlansModels.js';
import router from './Routers/Plans.js';

const app = express();
app.use(express.json());
app.use(router);

describe('Plans API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/plans/new', () => {
    it('should create a new plan', async () => {
      const planData = {
        name: 'Basic Plan',
        description: 'Basic subscription plan',
        price: 9.99,
        duration: 30,
      };

      PlansModel.prototype.save = jest.fn().mockResolvedValue(planData);

      const response = await request(app)
        .post('/api/plans/new')
        .send(planData);

      expect(response.status).toBe(201);
    });

    it('should return 400 if there is an error', async () => {
      const errorMessage = 'Invalid plan data';

      PlansModel.prototype.save = jest.fn().mockRejectedValue(new Error(errorMessage));

      const response = await request(app)
        .post('/api/plans/new')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: errorMessage });
    });
  });

  describe('DELETE /api/plans/:id', () => {
    it('should delete a plan', async () => {
      const planId = '1234567890';

      PlansModel.findByIdAndDelete = jest.fn().mockResolvedValue({});

      const response = await request(app).delete(`/api/plans/${planId}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Plan deleted successfully' });
    });

    it('should return 404 if plan is not found', async () => {
      const planId = '1234567890';

      PlansModel.findByIdAndDelete = jest.fn().mockResolvedValue(null);

      const response = await request(app).delete(`/api/plans/${planId}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Plan not found' });
    });

    it('should return 500 if there is an error', async () => {
      const planId = '1234567890';
      const errorMessage = 'Internal server error';

      PlansModel.findByIdAndDelete = jest.fn().mockRejectedValue(new Error(errorMessage));

      const response = await request(app).delete(`/api/plans/${planId}`);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: errorMessage });
    });
  });

  describe('PUT /api/plans/:id', () => {
    it('should update a plan', async () => {
      const planId = '1234567890';
      const updatedPlanData = {
        name: 'Updated Plan',
        description: 'Updated subscription plan',
        price: 19.99,
        duration: 60,
      };

      PlansModel.findById = jest.fn().mockResolvedValue({
        save: jest.fn().mockResolvedValue(updatedPlanData),
      });

      const response = await request(app)
        .put(`/api/plans/${planId}`)
        .send(updatedPlanData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Plan updated successfully' });
    });

    it('should return 404 if plan is not found', async () => {
      const planId = '1234567890';
      const updatedPlanData = {
        name: 'Updated Plan',
        description: 'Updated subscription plan',
        price: 19.99,
        duration: 60,
      };

      PlansModel.findById = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .put(`/api/plans/${planId}`)
        .send(updatedPlanData);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Plan not found' });
    });

    it('should return 400 if there is an error', async () => {
      const planId = '1234567890';
      const updatedPlanData = {
        name: 'Updated Plan',
        description: 'Updated subscription plan',
        price: 19.99,
        duration: 60,
      };
      const errorMessage = 'Invalid updates!';

      PlansModel.findById = jest.fn().mockResolvedValue({
        save: jest.fn().mockRejectedValue(new Error(errorMessage)),
      });

      const response = await request(app)
        .put(`/api/plans/${planId}`)
        .send(updatedPlanData);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: errorMessage });
    });
  });

  describe('GET /api/plans/all', () => {
    it('should get all plans', async () => {
      const plansData = [
        {
          name: 'Basic Plan',
          description: 'Basic subscription plan',
          price: 9.99,
          duration: 30,
        },
        {
          name: 'Premium Plan',
          description: 'Premium subscription plan',
          price: 19.99,
          duration: 60,
        },
      ];

      PlansModel.find = jest.fn().mockResolvedValue(plansData);

      const response = await request(app).get('/api/plans/all');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(plansData);
    });

    it('should return 500 if there is an error', async () => {
      const errorMessage = 'Internal server error';

      PlansModel.find = jest.fn().mockRejectedValue(new Error(errorMessage));

      const response = await request(app).get('/api/plans/all');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: errorMessage });
    });
  });

  describe('GET /api/plans/:id', () => {
    it('should get a plan by ID', async () => {
      const planId = '1234567890';
      const planData = {
        name: 'Basic Plan',
        description: 'Basic subscription plan',
        price: 9.99,
        duration: 30,
      };

      PlansModel.findById = jest.fn().mockResolvedValue(planData);

      const response = await request(app).get(`/api/plans/${planId}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(planData);
    });

    it('should return 404 if plan is not found', async () => {
      const planId = '1234567890';

      PlansModel.findById = jest.fn().mockResolvedValue(null);

      const response = await request(app).get(`/api/plans/${planId}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Plan not found' });
    });

    it('should return 500 if there is an error', async () => {
      const planId = '1234567890';
      const errorMessage = 'Internal server error';

      PlansModel.findById = jest.fn().mockRejectedValue(new Error(errorMessage));

      const response = await request(app).get(`/api/plans/${planId}`);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: errorMessage });
    });
  });
});