[README.md](https://github.com/user-attachments/files/21596100/README.md)
# Kokoromi Project

Kokoromi is a full-stack web application for anime discovery, user interaction, and community features. It consists of a Node.js/Express backend and a modern React frontend.

## Project Structure

- `backend/` — Node.js/Express API (authentication, users, admin, comments)
- `frontend/` — React app (UI, user flows, anime browsing)
- `hianime-API-main/` — Third party api for fetching anime details~

## Main Features
- User registration, login, TOTP verification, password reset
- JWT-based authentication
- User profile management
- Anime browsing, search, and detail pages
- Comments and ratings
- Admin dashboard
- Rate limiting for security

## Getting Started

### 1. Backend
- See [backend/README.md](backend/README.md) for setup, environment variables, and API details.
- Start the backend:
  ```bash
  cd backend
  npm install
  npm start
  ```

### 2. Frontend
- See [frontend/README.md](frontend/README.md) for setup and development instructions.
- Start the frontend:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```

## Running Tests
- Backend authentication and rate limit tests are in `backend/tests/authentication.test.js`.
- Run all backend tests:
  ```bash
  cd backend
  npm test
  ```

---

For more details, see the `backend/` and `frontend/` directories and their respective READMEs.
