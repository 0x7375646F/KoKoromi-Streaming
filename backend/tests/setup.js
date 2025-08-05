// Test setup file
require('dotenv').config();

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.PORT = '6969'; // Set the correct port

// Global test timeout
jest.setTimeout(30000);

// Suppress console.log during tests unless there's an error
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  console.log = jest.fn();
  console.error = originalConsoleError; // Keep error logging
});

afterAll(() => {
  console.log = originalConsoleLog;
});

// Global test utilities
global.generateTestUser = () => ({
  username: `testuser_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  password: 'SecurePass123!'
});

global.generateTestOTP = (secret) => {
  const speakeasy = require('speakeasy');
  return speakeasy.totp({
    secret: secret,
    encoding: 'base32'
  });
};

// Global BASE_URL
global.BASE_URL = `http://localhost:${process.env.PORT || 6969}`;

// Helper function for making requests with error handling
global.makeRequest = async (requestFn) => {
  try {
    return await requestFn().timeout(10000);
  } catch (error) {
    console.error('Request failed:', error.message);
    throw error;
  }
}; 