// API Configuration
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_URL = isLocalhost 
    ? 'http://localhost:5000'
    : 'http://69.62.119.91:5000';

window.API_URL = API_URL; 