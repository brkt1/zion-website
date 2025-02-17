const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);


// Route for user login
router.post('/login-user', async (req, res) => {
    const { email, password } = req.body;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return res.status(401).json({ error: error.message });
        }

        // Get user role from your database or custom claims
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', data.user.id)
            .single();

        if (userError) {
            return res.status(500).json({ error: 'Failed to fetch user role' });
        }

        return res.status(200).json({
            message: 'Login successful',
            role: userData.role
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Route for admin to add a new cafe owner

router.post('/add-cafe-owner', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new cafe owner
        const newCafeOwner = new CafeOwner({
            name,
            email,
            password: hashedPassword,
        });

        // Save the cafe owner to the database
        await newCafeOwner.save();
        res.status(201).json({ message: 'Cafe owner added successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error adding cafe owner', error });
    }
});

module.exports = router;
