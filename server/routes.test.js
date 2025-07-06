const request = require('supertest');
const initializeApp = require('./index');
const { PrismaClient } = require('../node_modules/@prisma/client');
const { createClient } = require('@supabase/supabase-js');

// Mock Supabase for testing
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn((token) => {
        if (token === 'valid-user-token') {
          return { data: { user: { id: 'user-id', email: 'user@example.com' } }, error: null };
        } else if (token === 'valid-admin-token') {
          return { data: { user: { id: 'admin-id', email: 'admin@example.com' } }, error: null };
        }
        return { data: { user: null }, error: { message: 'Invalid token' } };
      }),
      admin: {
        createUser: jest.fn(() => ({
          data: { user: { id: 'new-user-id' } },
          error: null,
        })),
      },
    },
  })),
}));

// Mock Prisma for testing
jest.mock('../node_modules/@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    $disconnect: jest.fn(),
    user: {
      findUnique: jest.fn(({ where }) => {
        if (where.authUserId === 'user-id') {
          return Promise.resolve({ id: 'user-db-id', authUserId: 'user-id', email: 'user@example.com', profile: { role: 'USER' } });
        } else if (where.authUserId === 'admin-id') {
          return Promise.resolve({ id: 'admin-db-id', authUserId: 'admin-id', email: 'admin@example.com', profile: { role: 'ADMIN' } });
        }
        return Promise.resolve(null);
      }),
      create: jest.fn((data) => Promise.resolve({ ...data, id: 'new-user-db-id' })),
      findMany: jest.fn(() => Promise.resolve([
        { id: 'user-db-id-1', authUserId: 'user-id-1', email: 'user1@example.com', profile: { role: 'USER' } },
        { id: 'user-db-id-2', authUserId: 'user-id-2', email: 'user2@example.com', profile: { role: 'ADMIN' } },
      ])),
    },
    profile: {
      create: jest.fn((data) => Promise.resolve({ ...data, id: 'new-profile-id' })),
    },
    gameType: {
      findMany: jest.fn(() => Promise.resolve([
        { id: 'game-type-1', name: 'Trivia', _count: { cards: 10, questions: 20, scores: 5 } },
        { id: 'game-type-2', name: 'Truth or Dare', _count: { cards: 15, questions: 0, scores: 8 } },
      ])),
    },
    card: {
      findMany: jest.fn(() => Promise.resolve([
        { id: 'card-1', content: 'Card 1', used: false, gameTypeId: 'game-type-1', gameType: { name: 'Trivia' } },
      ])),
      create: jest.fn(({ data, include }) => Promise.resolve({
        ...data,
        id: 'new-card-id',
        gameType: include && include.gameType ? { name: 'Trivia' } : undefined
      })),
      update: jest.fn((data) => Promise.resolve({
        id: data.where.id,
        used: data.data.used,
        gameType: { name: 'Trivia' }
      })),
    },
    certificate: {
      findMany: jest.fn(() => Promise.resolve([
        { id: 'cert-1', playerName: 'Player 1', gameType: { name: 'Trivia' } },
      ])),
      create: jest.fn(({ data, include }) => Promise.resolve({
        ...data,
        id: 'new-cert-id',
        gameType: include && include.gameType ? { name: 'Trivia' } : undefined,
        timestamp: new Date().toISOString(),
      })),
    },
    score: {
      create: jest.fn(({ data, include }) => Promise.resolve({
        ...data,
        id: 'new-score-id',
        gameType: include && include.gameType ? { name: 'Trivia' } : undefined,
        timestamp: new Date().toISOString(),
      })),
    },
    question: {
      findMany: jest.fn(() => Promise.resolve([
        { id: 'q1', question: 'Q1', gameTypeId: 'game-type-1' },
      ])),
    },
    cafeOwner: {
      create: jest.fn(({ data }) => Promise.resolve({
        ...data,
        id: 'new-cafe-owner-id'
      })),
    },
  })),
}));

const prisma = new PrismaClient();
const supabase = createClient('mock-url', 'mock-key');
const app = initializeApp(prisma, supabase);

describe('API Routes', () => {
  afterAll(async () => {
    // Disconnect Prisma after all tests are done
    await prisma.$disconnect();
  });

  describe('GET /health', () => {
    it('should return 200 OK', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('status', 'OK');
    });
  });

  describe('GET /api/game-types', () => {
    it('should return a list of game types', async () => {
      const res = await request(app).get('/api/game-types');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('name');
    });
  });

  describe('GET /api/profile', () => {
    it('should return 401 if no token is provided', async () => {
      const res = await request(app).get('/api/profile');
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error', 'No token provided');
    });

    it('should return 200 and user profile if valid token is provided', async () => {
      const res = await request(app)
        .get('/api/profile')
        .set('Authorization', 'Bearer valid-user-token');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('role', 'USER');
    });
  });

  describe('GET /api/cards', () => {
    it('should return 401 if no token is provided', async () => {
      const res = await request(app).get('/api/cards');
      expect(res.statusCode).toEqual(401);
    });

    it('should return a list of cards if valid token is provided', async () => {
      const res = await request(app)
        .get('/api/cards')
        .set('Authorization', 'Bearer valid-user-token');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/cards', () => {
    it('should return 401 if no token is provided', async () => {
      const res = await request(app).post('/api/cards').send({});
      expect(res.statusCode).toEqual(401);
    });

    it('should return 403 if user is not admin', async () => {
      const res = await request(app)
        .post('/api/cards')
        .set('Authorization', 'Bearer valid-user-token')
        .send({});
      expect(res.statusCode).toEqual(403);
    });

    it('should create a new card if admin token is provided', async () => {
      const newCard = {
        content: 'New Card',
        duration: 60,
        gameTypeId: 'game-type-1',
        cardNumber: '001',
      };
      const res = await request(app)
        .post('/api/cards')
        .set('Authorization', 'Bearer valid-admin-token')
        .send(newCard);
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('content', 'New Card');
    });
  });

  describe('PATCH /api/cards/:id/use', () => {
    it('should return 401 if no token is provided', async () => {
      const res = await request(app).patch('/api/cards/some-id/use');
      expect(res.statusCode).toEqual(401);
    });

    it('should mark a card as used if valid token is provided', async () => {
      const res = await request(app)
        .patch('/api/cards/card-1/use')
        .set('Authorization', 'Bearer valid-user-token');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('used', true);
    });
  });

  describe('POST /api/certificates', () => {
    it('should return 401 if no token is provided', async () => {
      const res = await request(app).post('/api/certificates').send({});
      expect(res.statusCode).toEqual(401);
    });

    it('should create a new certificate if valid token is provided', async () => {
      const newCertificate = {
        playerName: 'Test Player',
        playerId: 'test-player-id',
        score: 100,
        gameTypeId: 'game-type-1',
        sessionId: 'session-id',
      };
      const res = await request(app)
        .post('/api/certificates')
        .set('Authorization', 'Bearer valid-user-token')
        .send(newCertificate);
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('playerName', 'Test Player');
    });
  });

  describe('POST /api/scores', () => {
    it('should return 401 if no token is provided', async () => {
      const res = await request(app).post('/api/scores').send({});
      expect(res.statusCode).toEqual(401);
    });

    it('should create a new score if valid token is provided', async () => {
      const newScore = {
        playerName: 'Test Player',
        playerId: 'test-player-id',
        score: 100,
        stage: 1,
        sessionId: 'session-id',
        streak: 5,
        gameTypeId: 'game-type-1',
      };
      const res = await request(app)
        .post('/api/scores')
        .set('Authorization', 'Bearer valid-user-token')
        .send(newScore);
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('score', 100);
    });
  });

  describe('GET /api/questions/:gameTypeId', () => {
    it('should return a list of questions for a given game type', async () => {
      const res = await request(app).get('/api/questions/game-type-1');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('question');
    });
  });

  describe('GET /api/admin/users', () => {
    it('should return 401 if no token is provided', async () => {
      const res = await request(app).get('/api/admin/users');
      expect(res.statusCode).toEqual(401);
    });

    it('should return 403 if user is not admin', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', 'Bearer valid-user-token');
      expect(res.statusCode).toEqual(403);
    });

    it('should return a list of users if admin token is provided', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', 'Bearer valid-admin-token');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/admin/cafe-owners', () => {
    it('should return 401 if no token is provided', async () => {
      const res = await request(app).post('/api/admin/cafe-owners').send({});
      expect(res.statusCode).toEqual(401);
    });

    it('should return 403 if user is not admin', async () => {
      const res = await request(app)
        .post('/api/admin/cafe-owners')
        .set('Authorization', 'Bearer valid-user-token')
        .send({});
      expect(res.statusCode).toEqual(403);
    });

    it('should create a new cafe owner if admin token is provided', async () => {
      const newCafeOwner = {
        name: 'Test Cafe',
        email: 'cafe@example.com',
        password: 'password123',
      };
      const res = await request(app)
        .post('/api/admin/cafe-owners')
        .set('Authorization', 'Bearer valid-admin-token')
        .send(newCafeOwner);
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('cafeOwner');
      expect(res.body.cafeOwner).toHaveProperty('email', 'cafe@example.com');
    });
  });

  describe('GET /api/winners', () => {
    it('should return 401 if no token is provided', async () => {
      const res = await request(app).get('/api/winners');
      expect(res.statusCode).toEqual(401);
    });

    it('should return a list of winners if valid token is provided', async () => {
      const res = await request(app)
        .get('/api/winners')
        .set('Authorization', 'Bearer valid-user-token');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
    });
  });
});