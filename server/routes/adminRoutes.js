const express = require('express');
const { PrismaClient } = require('../../node_modules/@prisma/client');
const { createClient } = require('@supabase/supabase-js');
const { authenticateUser, requireAdmin } = require('../middleware/authMiddleware');
require('dotenv').config({ path: '../.env' });

const router = express.Router();
const prisma = new PrismaClient();
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Admin Routes
router.get('/admin/users', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        profile: {
          select: { role: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.post('/admin/cafe-owners', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });
    
    if (authError) {
      return res.status(400).json({ error: authError.message });
    }
    
    // Create user and profile in database
    const user = await prisma.user.create({
      data: {
        email,
        authUserId: authData.user.id,
        profile: {
          create: {
            role: 'CAFE_OWNER'
          }
        }
      },
      include: {
        profile: true
      }
    });
    
    // Create cafe owner record
    const cafeOwner = await prisma.cafeOwner.create({
      data: {
        name,
        email,
        password: 'managed_by_supabase' // Password is managed by Supabase
      }
    });
    
    console.log('POST /api/admin/cafe-owners response:', { user, cafeOwner });
    res.status(201).json({ user, cafeOwner });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create cafe owner' });
  }
});

module.exports = router;
