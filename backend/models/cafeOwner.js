const mongoose = require('mongoose');

const cafeOwnerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: 'cafeOwner',
    },
});

module.exports = mongoose.model('CafeOwner', cafeOwnerSchema);
