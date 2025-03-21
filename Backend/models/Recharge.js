const mongoose = require('mongoose');

const rechargeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    channel: {
        type: String,
        required: true,
        enum: ['jazzcash', 'easypaisa']
    },
    senderNumber: {
        type: String,
        required: true
    },
    receipt: {
        type: String,  // This will store the path to the uploaded receipt image
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Recharge', rechargeSchema); 