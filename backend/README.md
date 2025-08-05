# Kokoromi Backend

This is the backend API for the Kokoromi project. It provides authentication, user management, admin, and comment APIs for the frontend.

## Features
- User registration, login, TOTP verification, password reset
- JWT-based authentication
- User profile management
- Admin and comment APIs
- Rate limiting for security
- Sequelize ORM (MySQL)

## Setup

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Environment Variables
Create a `.env` file in the backend directory. Example:
```
PORT=6969
JWT_SECRET=your_jwt_secret
DB_HOST=localhost
DB_USER=your_db_user
DB_PASS=your_db_pass
DB_NAME=kokoromi
```

### 3. Start the server
```bash
npm start
```
The server will run at `http://localhost:6969` by default.

## Running Tests

- All tests are in `tests/authentication.test.js`.
- To run tests:
```bash
npm test
```
- To run a specific test file:
```bash
npx jest tests/authentication.test.js --verbose
```

## API Overview

### Authentication Endpoints
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/verify` — Verify user with TOTP
- `POST /api/auth/login` — Login and get JWT
- `POST /api/auth/logout` — Logout (JWT invalidation)
- `POST /api/auth/reset` — Reset password with TOTP

### User Endpoints
- `GET /api/users/me` — Get current user profile
- `DELETE /api/users/me` — Delete current user
- `PUT /api/users/username` — Change username
- `PUT /api/users/password` — Change password

### Admin & Comments
- See respective routes/controllers for details.

## Rate Limiting
- Registration, login, password reset, and verification endpoints are rate-limited (5 requests per 10 minutes).

## Contribution
- PRs and issues welcome!
- Please write tests for new features.

---

For more details, see the code and comments in the `controller/`, `routes/`, and `middleware/` directories.