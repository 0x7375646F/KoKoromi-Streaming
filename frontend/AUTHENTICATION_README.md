# Authentication Features

This document describes the authentication features that have been added to the Kokoromi frontend application.

## Features Added

### 1. Login/Register Modal
- **Location**: `src/components/AuthModal.jsx`
- **Functionality**: 
  - Toggle between login and registration forms
  - Username and password input fields
  - Password visibility toggle
  - Form validation
  - Loading states during API calls

### 2. QR Code Generation for 2FA
- **Dependency**: `qrcode` package
- **Functionality**:
  - Generates QR codes for authenticator apps (Google Authenticator, Authy, etc.)
  - Uses the TOTP secret received from the backend
  - Displays QR code after successful registration

### 3. Authentication Store
- **Location**: `src/store/authStore.js`
- **Technology**: Zustand state management
- **Functionality**:
  - Manages user authentication state
  - Stores user data and JWT token
  - Provides login/logout functions
  - Updates user information

### 4. Authentication Service
- **Location**: `src/services/authService.js`
- **Functionality**:
  - Centralized API calls for authentication
  - Login endpoint
  - Registration endpoint
  - Logout endpoint

### 5. Header Integration
- **Location**: `src/components/Header.jsx`
- **Changes**:
  - Added login button (user icon)
  - Shows username when authenticated
  - Logout functionality with confirmation toast
  - Conditional rendering based on auth state

## API Endpoints Used

### Registration
- **Endpoint**: `POST /auth/register`
- **Request Body**: `{ username, password }`
- **Response**: `{ success: true, totp_secret: "string" }`

### Login
- **Endpoint**: `POST /auth/login`
- **Request Body**: `{ username, password }`
- **Response**: `{ success: true, user: {...}, token: "string" }`

### Logout
- **Endpoint**: `POST /auth/logout`
- **Headers**: `Authorization: Bearer <token>`

## User Flow

### Registration Flow
1. User clicks login button in header
2. Modal opens with login form
3. User clicks "Don't have an account? Register"
4. User fills in username and password
5. On successful registration, QR code is displayed
6. User scans QR code with authenticator app
7. User clicks "Done" to close modal

### Login Flow
1. User clicks login button in header
2. Modal opens with login form
3. User enters username and password
4. On successful login, modal closes and user is authenticated
5. Header shows username and logout option

### Logout Flow
1. User clicks user icon in header
2. User is logged out immediately
3. Success toast is displayed
4. Header shows login button again

## Styling

The authentication components use the existing design system:
- **Colors**: Primary (#ffdd95), Background (#242428), Card (#2f2f33)
- **Typography**: Nunito font family
- **Components**: Consistent with existing UI components
- **Responsive**: Works on mobile and desktop

## Dependencies Added

- `qrcode`: For generating QR codes for 2FA setup

## Files Modified

1. `src/components/Header.jsx` - Added login button and auth state
2. `tailwind.config.js` - Added backGround color
3. `package.json` - Added qrcode dependency

## Files Created

1. `src/components/AuthModal.jsx` - Main authentication modal
2. `src/store/authStore.js` - Authentication state management
3. `src/services/authService.js` - Authentication API service

## Security Features

- Password hashing (handled by backend)
- JWT token authentication
- 2FA with TOTP (Time-based One-Time Password)
- Secure QR code generation for authenticator apps
- Form validation and error handling
- Network error handling with user-friendly messages 