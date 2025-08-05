# Kokoromi Frontend

This is the frontend for the Kokoromi project. It is a modern React app that connects to the backend API for authentication, user management, and anime content.

## Features
- User registration, login, TOTP verification, password reset
- User profile and settings
- Anime browsing, search, and detail pages
- Comments and ratings
- Admin dashboard (for privileged users)
- Responsive, modern UI

## Setup

### 1. Install dependencies
```bash
cd frontend
npm install
```

### 2. Environment Variables
If you need to override the backend API URL, create a `.env` file:
```
VITE_API_URL=http://localhost:6969
```

### 3. Run the development server
```bash
npm run dev
```
The app will be available at `http://localhost:5173` by default.

### 4. Build for production
```bash
npm run build
```

## Folder Structure
- `src/components/` — React UI components
- `src/pages/` — Main page components (Home, Login, Detail, etc.)
- `src/services/` — API service functions
- `src/store/` — State management (Zustand)
- `src/layouts/` — Layout components
- `src/utils/` — Utility functions
- `src/assets/` — Images and static assets

## Connecting to the Backend
- The frontend expects the backend to be running at `http://localhost:6969` by default.
- You can change the API URL in `src/config/config.js` or with the `VITE_API_URL` env variable.

## Contribution
- PRs and issues welcome!
- Please write tests for new features and keep code clean.

---

For more details, see the code and comments in the `src/` directory.
