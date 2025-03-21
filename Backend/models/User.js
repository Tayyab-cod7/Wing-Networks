const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    referralCode: {
        type: String,
        required: true
    },
    referredBy: {
        type: String,
        default: null
    },
    balance: {
        type: Number,
        default: 0
    },
    activePackage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package',
        default: null
    },
    lastEarnTime: {
        type: Date,
        default: null
    },
    packagePurchaseTime: {
        type: Date,
        default: null
    }
});

module.exports = mongoose.model('User', userSchema); 