const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Withdrawal = require('../models/Withdrawal');
const User = require('../models/User');

// User Routes

// Create a new withdrawal request
router.post('/withdrawals', auth, async (req, res) => {
    try {
        const { accountNumber, amount, finalAmount, paymentMethod } = req.body;
        
        // Get user from auth middleware
        const userId = req.user.id;

        // Check user's balance
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.balance < amount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // Create new withdrawal request
        const withdrawal = new Withdrawal({
            userId,
            accountNumber,
            amount,
            finalAmount,
            paymentMethod,
            status: 'pending',
            requestDate: new Date()
        });

        await withdrawal.save();

        // Update user's balance
        user.balance -= amount;
        await user.save();

        res.json({
            success: true,
            message: 'Withdrawal request submitted successfully',
            withdrawal
        });
    } catch (error) {
        console.error('Error creating withdrawal request:', error);
        res.status(500).json({ message: 'Failed to submit withdrawal request' });
    }
});

// Get user's withdrawal requests
router.get('/withdrawals/user', auth, async (req, res) => {
    try {
        const withdrawals = await Withdrawal.find({ userId: req.user.id })
            .sort({ requestDate: -1 });

        res.json({ withdrawals });
    } catch (error) {
        console.error('Error fetching withdrawal requests:', error);
        res.status(500).json({ message: 'Failed to fetch withdrawal requests' });
    }
});

// Admin Routes

// Get all withdrawal requests
router.get('/admin/withdrawals', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { status } = req.query;
        const query = status && status !== 'all' ? { status } : {};

        const withdrawals = await Withdrawal.find(query)
            .populate('userId', 'phone')
            .sort({ requestDate: -1 });

        res.json({ withdrawals });
    } catch (error) {
        console.error('Error fetching withdrawal requests:', error);
        res.status(500).json({ message: 'Failed to fetch withdrawal requests' });
    }
});

// Get single withdrawal request
router.get('/admin/withdrawals/:id', auth, async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const withdrawal = await Withdrawal.findById(req.params.id)
            .populate('userId', 'phone');

        if (!withdrawal) {
            return res.status(404).json({ message: 'Withdrawal request not found' });
        }

        res.json({ withdrawal });
    } catch (error) {
        console.error('Error fetching withdrawal request:', error);
        res.status(500).json({ message: 'Failed to fetch withdrawal request' });
    }
});

// Approve withdrawal request
router.put('/admin/withdrawals/:id/approve', auth, async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const withdrawal = await Withdrawal.findById(req.params.id);
        if (!withdrawal) {
            return res.status(404).json({ message: 'Withdrawal request not found' });
        }

        withdrawal.status = 'approved';
        await withdrawal.save();

        res.json({ withdrawal });
    } catch (error) {
        console.error('Error approving withdrawal request:', error);
        res.status(500).json({ message: 'Failed to approve withdrawal request' });
    }
});

// Reject withdrawal request
router.put('/admin/withdrawals/:id/reject', auth, async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const withdrawal = await Withdrawal.findById(req.params.id);
        if (!withdrawal) {
            return res.status(404).json({ message: 'Withdrawal request not found' });
        }

        // Refund the amount to user's balance
        const user = await User.findById(withdrawal.userId);
        if (user) {
            user.balance += withdrawal.amount;
            await user.save();
        }

        withdrawal.status = 'rejected';
        await withdrawal.save();

        res.json({ withdrawal });
    } catch (error) {
        console.error('Error rejecting withdrawal request:', error);
        res.status(500).json({ message: 'Failed to reject withdrawal request' });
    }
});

// Delete withdrawal request
router.delete('/admin/withdrawals/:id', auth, async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const withdrawal = await Withdrawal.findById(req.params.id);
        if (!withdrawal) {
            return res.status(404).json({ message: 'Withdrawal request not found' });
        }

        await withdrawal.remove();
        res.json({ message: 'Withdrawal request deleted successfully' });
    } catch (error) {
        console.error('Error deleting withdrawal request:', error);
        res.status(500).json({ message: 'Failed to delete withdrawal request' });
    }
});

module.exports = router; 