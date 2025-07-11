const request = require('supertest');
const app = require('./index');
const pool = require('./db');

jest.mock('./db', () => ({
  query: jest.fn(),
}));

const mockAuth = (role) => (req, res, next) => {
  req.user = { id: 'test-user', role };
  next();
};

jest.mock('./middleware/authMiddleware', () => ({
  authenticateUser: jest.fn((req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    if (token === 'valid-user-token') {
      req.user = { id: 'user-id', role: 'USER' };
      return next();
    }
    if (token === 'valid-admin-token') {
      req.user = { id: 'admin-id', role: 'ADMIN' };
      return next();
    }
    return res.status(401).json({ error: 'Invalid token' });
  }),
  requireAdmin: jest.fn((req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
      return next();
    }
    return res.status(403).json({ error: 'Admin access required' });
  }),
}));



  describe('API Routes', () => {
  describe('GET /health', () => {
    it('should return 200 OK', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('status', 'OK');
    });
  });

  describe('GET /api/gametypes', () => {
    it('should return a list of game types', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: 'game-type-1', name: 'Trivia' }] });
      const res = await request(app).get('/api/gametypes');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('name');
    });
  });

  describe('GET /api/profile', () => {
    it('should return 401 if no token is provided', async () => {
      const res = await request(app).get('/api/profile/profile');
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error', 'No token provided');
    });

    it('should return 200 and user profile if valid token is provided', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: 'user-db-id', userId: 'user-id', role: 'USER' }] });
      const res = await request(app)
        .get('/api/profile/profile')
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
      pool.query.mockResolvedValueOnce({ rows: [{ id: 'card-1', content: 'Card 1', used: false, game_type_id: 'game-type-1', game_type_name: 'Trivia' }] });
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
      pool.query.mockResolvedValueOnce({ rows: [{ ...newCard, id: 'new-card-id' }] });
      pool.query.mockResolvedValueOnce({ rows: [{ name: 'Trivia' }] });
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
      pool.query.mockResolvedValueOnce({ rows: [{ id: 'card-1', used: true }] });
      pool.query.mockResolvedValueOnce({ rows: [{ name: 'Trivia' }] });
      const res = await request(app)
        .patch('/api/cards/card-1/use')
        .set('Authorization', 'Bearer valid-user-token');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('used', true);
    });
  });

  describe('POST /api/certificates', () => {
    it('should return 401 if no token is provided', async () => {
      const res = await request(app).post('/api/certificates/').send({});
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
      pool.query.mockResolvedValueOnce({ rows: [{ ...newCertificate, id: 'new-cert-id', game_type_id: 'game-type-1' }] });
      pool.query.mockResolvedValueOnce({ rows: [{ name: 'Trivia' }] });
      const res = await request(app)
        .post('/api/certificates/')
        .set('Authorization', 'Bearer valid-user-token')
        .send(newCertificate);
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('playerName', 'Test Player');
    });
  });

  describe('POST /api/scores', () => {
    it('should return 401 if no token is provided', async () => {
      const res = await request(app).post('/api/scores/').send({});
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
      pool.query.mockResolvedValueOnce({ rows: [{ ...newScore, id: 'new-score-id', game_type_id: 'game-type-1' }] });
      pool.query.mockResolvedValueOnce({ rows: [{ name: 'Trivia' }] });
      const res = await request(app)
        .post('/api/scores/')
        .set('Authorization', 'Bearer valid-user-token')
        .send(newScore);
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('score', 100);
    });
  });

  describe('GET /api/questions/:gameTypeId', () => {
    it('should return a list of questions for a given game type', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: 'q1', question: 'Q1', game_type_id: 'game-type-1' }] });
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
      pool.query.mockResolvedValueOnce({ rows: [{ id: 'user-1', email: 'user1@example.com', role: 'USER' }] });
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
      pool.query.mockResolvedValueOnce({ rows: [{ id: 'new-user-id', email: 'cafe@example.com' }] }); // Mock for users table insert
      pool.query.mockResolvedValueOnce({ rows: [{ user_id: 'new-user-id', role: 'CAFE_OWNER' }] }); // Mock for profiles table insert
      pool.query.mockResolvedValueOnce({ rows: [{ id: 'new-cafe-owner-id', name: 'Test Cafe', email: 'cafe@example.com' }] }); // Mock for cafe_owners table insert
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
      pool.query.mockResolvedValueOnce({ rows: [{ id: 'cert-1', playerName: 'Player 1', game_type_name: 'Trivia' }] });
      const res = await request(app)
        .get('/api/winners')
        .set('Authorization', 'Bearer valid-user-token');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
    });
  });
});