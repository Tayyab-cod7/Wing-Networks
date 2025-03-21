const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    accountNumber: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    finalAmount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['jazzcash', 'easypaisa'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    requestDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Withdrawal', withdrawalSchema); 