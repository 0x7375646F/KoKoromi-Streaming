# Authentication Test Suite

This directory contains comprehensive tests for the authentication system of the backend API.

## Test Structure

### Files

- **`auth.test.js`** - Main authentication tests covering registration, verification, login, logout, and password reset
- **`middleware.test.js`** - Tests specifically for the authentication middleware
- **`validation.test.js`** - Tests for input validation rules
- **`setup.js`** - Test setup and configuration

### Test Categories

#### Authentication Tests (`auth.test.js`)
- **User Registration**: Tests for user creation with and without images
- **User Verification**: TOTP verification process
- **User Login**: Login functionality and error handling
- **User Logout**: Logout functionality and token invalidation
- **Password Reset**: Password reset with OTP verification
- **Rate Limiting**: Tests for rate limiting on various endpoints
- **Protected Routes**: Tests for routes requiring authentication

#### Middleware Tests (`middleware.test.js`)
- **Token Validation**: JWT token parsing and validation
- **User Validation**: User existence and status checks
- **Token Version Management**: Token invalidation after logout/password reset
- **Error Handling**: Graceful error handling

#### Validation Tests (`validation.test.js`)
- **Username Validation**: Format, length, and character restrictions
- **Password Validation**: Strength requirements and format validation
- **OTP Validation**: 6-digit numeric validation
- **Login Validation**: Input validation for login attempts

## Running Tests

### Prerequisites

1. Install dependencies:
```bash
npm install
```

2. Make sure the backend server is running:
```bash
npm start
```

3. Ensure your database is properly configured and accessible

### Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npx jest tests/auth.test.js

# Run tests matching a pattern
npx jest --testNamePattern="registration"
```

### Test Configuration

The tests are configured in `jest.config.js` with the following settings:

- **Test Environment**: Node.js
- **Test Timeout**: 30 seconds
- **Coverage**: Generates coverage reports for controllers, middleware, and validators
- **Setup**: Uses `tests/setup.js` for global configuration

## Test Data

### Test Users

Tests create unique users with timestamps to avoid conflicts:
- Format: `testuser_${Date.now()}`
- Password: `SecurePass123!` (meets all requirements)

### Test Tokens

- Valid tokens are obtained through the login process
- Invalid tokens are manually created for testing
- Expired tokens are created with short expiration times

## Coverage

The test suite aims to cover:

- ✅ All authentication endpoints
- ✅ Input validation rules
- ✅ Error handling scenarios
- ✅ Rate limiting functionality
- ✅ Token management
- ✅ User status checks (verified, banned, etc.)

## Environment Variables

Tests use the following environment variables:
- `PORT`: Server port (default: 1337)
- `JWT_SECRET`: JWT signing secret
- `NODE_ENV`: Set to 'test' during testing

## Notes

1. **Database Cleanup**: Tests create temporary users that may remain in the database
2. **Rate Limiting**: Some tests may trigger rate limiting - they're designed to handle this
3. **TOTP**: Tests use the `speakeasy` library to generate valid OTP codes
4. **Async Operations**: All tests use async/await for proper handling of promises

## Troubleshooting

### Common Issues

1. **Server not running**: Make sure the backend server is started before running tests
2. **Database connection**: Ensure your database is accessible and properly configured
3. **Port conflicts**: If port 1337 is in use, change the PORT environment variable
4. **Rate limiting**: Some tests may fail if rate limits are too strict - adjust as needed

### Debug Mode

To run tests with more verbose output:
```bash
npx jest --verbose
```

To run a single test:
```bash
npx jest --testNamePattern="should register a new user successfully"
``` 