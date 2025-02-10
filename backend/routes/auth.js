const express = require('express');
const { supabase } = require('../src/supabaseClient');
const router = express.Router();

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
