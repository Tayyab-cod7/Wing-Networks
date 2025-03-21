const Recharge = require('../models/Recharge');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/receipts/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
}).single('receipt');

// Submit recharge request
exports.submitRechargeRequest = async (req, res) => {
    upload(req, res, async function (err) {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }

        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Please upload a receipt'
                });
            }

            const { amount, channel, senderNumber } = req.body;

            // Validate required fields
            if (!amount || !channel || !senderNumber) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields'
                });
            }

            // Create new recharge request
            const recharge = new Recharge({
                userId: req.user._id,
                amount: parseFloat(amount),
                channel,
                senderNumber,
                receipt: req.file.path,
                status: 'PENDING'
            });

            await recharge.save();

            res.status(200).json({
                success: true,
                message: 'Recharge request submitted successfully'
            });
        } catch (error) {
            console.error('Error in submitRechargeRequest:', error);
            res.status(500).json({
                success: false,
                message: 'Error submitting recharge request'
            });
        }
    });
};

// Get all recharge requests (admin only)
exports.getAllRechargeRequests = async (req, res) => {
    try {
        const requests = await Recharge.find()
            .populate('userId', 'phone')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            requests
        });
    } catch (error) {
        console.error('Error in getAllRechargeRequests:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching recharge requests'
        });
    }
};

// Update recharge request status (admin only)
exports.updateRechargeStatus = async (req, res) => {
    try {
        const { requestId, status } = req.params;

        const recharge = await Recharge.findById(requestId);
        if (!recharge) {
            return res.status(404).json({
                success: false,
                message: 'Recharge request not found'
            });
        }

        if (status === 'APPROVED') {
            // Update user's balance
            const user = await User.findById(recharge.userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            user.balance = (user.balance || 0) + recharge.amount;
            await user.save();
        }

        recharge.status = status;
        await recharge.save();

        res.status(200).json({
            success: true,
            message: `Recharge request ${status.toLowerCase()} successfully`
        });
    } catch (error) {
        console.error('Error in updateRechargeStatus:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating recharge status'
        });
    }
}; 