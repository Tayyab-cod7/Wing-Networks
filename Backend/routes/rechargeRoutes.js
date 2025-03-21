const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { adminAuth } = require('../middleware/adminAuth');
const {
    submitRechargeRequest,
    getAllRechargeRequests,
    updateRechargeStatus
} = require('../controllers/rechargeController');

// User routes
router.post('/request', auth, submitRechargeRequest);

// Admin routes
router.get('/admin/requests', adminAuth, getAllRechargeRequests);
router.post('/admin/:requestId/:status', adminAuth, updateRechargeStatus);

module.exports = router; 