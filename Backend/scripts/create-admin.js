const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('../src/models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
});

// Admin user details
const adminUser = {
    phone: '03151251123',
    password: 'admin123',
    name: 'Admin User',
    balance: 0,
    isAdmin: true,
    referralCode: '000000'
};

// Create admin user
const createAdmin = async () => {
    try {
        // Check if admin already exists
        const existingAdmin = await User.findOne({ phone: adminUser.phone });
        
        if (existingAdmin) {
            console.log('Admin user already exists');
            process.exit(0);
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminUser.password, salt);
        
        // Create user
        const user = await User.create({
            phone: adminUser.phone,
            password: hashedPassword,
            name: adminUser.name,
            balance: adminUser.balance,
            isAdmin: adminUser.isAdmin,
            referralCode: adminUser.referralCode
        });
        
        console.log('Admin user created successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
};

// Run the function
createAdmin(); 