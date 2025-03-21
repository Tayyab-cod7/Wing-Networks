// API Configuration
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_URL = isLocalhost 
    ? 'http://localhost:5000'
    : 'http://69.62.119.91:5000';

// Handle signup form submission
document.getElementById('signupForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    try {
        const phone = document.getElementById('signupPhone').value;
        const password = document.getElementById('signupPassword').value;
        const referredBy = document.getElementById('referralCode').value;

        const registrationData = {
            phone,
            password,
            referredBy  // Changed from referralCode to referredBy
        };

        console.log('Sending registration data:', registrationData);
        console.log('Using API URL:', API_URL);  // Add this line for debugging

        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registrationData)
        });

        const data = await response.json();

        if (data.success) {
            showSuccess('Registration successful! Please login.');
            // Clear the form
            this.reset();
            // Switch to login form
            showLoginForm();
        } else {
            showError(data.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showError('Error during registration. Please try again.');
    }
}); 