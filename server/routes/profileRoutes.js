const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateUser } = require('../middleware/authMiddleware');

module.exports = (prisma) => {
  const router = express.Router();

// Profile endpoint
router.get('/profile', authenticateUser, async (req, res) => {
  try {
    // First, find or create user in our database
    let user = await prisma.user.findUnique({
      where: { authUserId: req.user.id },
      include: { profile: true }
    });

    if (!user) {
      // Create user and profile if they don't exist
      user = await prisma.user.create({
        data: {
          email: req.user.email,
          authUserId: req.user.id,
          profile: {
            create: {
              role: 'USER'
            }
          }
        },
        include: { profile: true }
      });
    } else if (!user.profile) {
      // Create profile if user exists but profile doesn't
      await prisma.profile.create({
        data: {
          userId: user.id,
          role: 'USER'
        }
      });
      
      // Refetch user with profile
      user = await prisma.user.findUnique({
        where: { authUserId: req.user.id },
        include: { profile: true }
      });
    }

    res.json(user.profile);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

module.exports = router;
