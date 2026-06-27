# Authentication Integration Guide

## Overview
This document outlines the complete login/signup integration between the AuraLearn frontend (Next.js) and backend (FastAPI).

## Architecture

### Frontend (Next.js)
- **Auth Context**: `src/context/AuthContext.tsx` - Manages user state and authentication
- **Login Page**: `src/app/login/page.tsx` - User login interface
- **Signup Page**: `src/app/signup/page.tsx` - User registration interface
- **API Client**: `src/utils/apiClient.ts` - Utility for authenticated API calls
- **Environment**: `.env.local` - Configuration for API base URL

### Backend (FastAPI)
- **Auth Routers**: `app/routers/auth/` - Login, signup, and token verification endpoints
- **Auth Middleware**: `app/middleware/auth_middleware.py` - JWT validation for protected routes
- **JWT Handler**: `app/utils/jwt_handler.py` - Token creation and validation
- **Password Utils**: `app/utils/password.py` - Secure password hashing
- **Config**: `app/config.py` - Application settings including CORS and JWT

## API Endpoints

### Public Endpoints (No Authentication Required)

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}

Response (200):
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "learner"
  },
  "message": "Login successful"
}
```

#### Signup
```
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "SecurePassword123!"
}

Response (200):
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "learner"
  },
  "message": "User created successfully"
}
```

#### Verify Token
```
POST /api/auth/verify-token
Authorization: Bearer <token>

Response (200):
{
  "valid": true,
  "user": {...}
}
```

### Protected Endpoints
All other endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Authentication Flow

### Login Flow
1. User enters email and password on login page
2. Frontend calls `POST /api/auth/login` with credentials
3. Backend verifies email and password
4. Backend returns JWT token and user data
5. Frontend stores token in localStorage as `auralearn_token`
6. Frontend stores user data in localStorage as `auralearn_user`
7. User is redirected to `/dashboard`

### Signup Flow
1. User enters name, email, and password on signup page
2. Frontend calls `POST /api/auth/signup` with details
3. Backend validates input and checks for duplicate email
4. Backend creates user with `role: "learner"` (default)
5. Backend returns JWT token and user data
6. Frontend stores token and user data
7. User is automatically logged in and redirected to `/`

### Protected API Call Flow
1. Frontend component needs to call a protected endpoint
2. Use `apiCall()` utility from `src/utils/apiClient.ts`
3. Utility automatically adds token from localStorage to Authorization header
4. If token is invalid/expired, backend returns 401
5. Frontend should redirect to login page on 401 response

## Configuration

### Frontend Setup

1. **Environment Variables** (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

For production, update to your deployed backend URL:
```
NEXT_PUBLIC_API_URL=https://api.auralearn.com
```

2. **Auth Context** provides:
- `user` - Current user object or null
- `token` - JWT token or null
- `isLoading` - Loading state on app startup
- `error` - Last authentication error message
- `login(email, password)` - Login function
- `signup(name, email, password)` - Signup function
- `logout()` - Clear auth state

### Backend Setup

1. **Environment Variables** (`.env`)
```
APP_ENV=development
HOST=127.0.0.1
PORT=8000
DATABASE_URL=postgresql://user:password@localhost/auralearn_db
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRATION_HOURS=24
CORS_ORIGINS=http://localhost:3000,http://localhost:8000
```

For production:
```
APP_ENV=production
JWT_SECRET=generate-a-secure-random-key
CORS_ORIGINS=https://auralearn.com,https://www.auralearn.com
```

2. **Password Requirements**
- Minimum 6 characters
- Must contain at least 2 of: uppercase, lowercase, digit, special character

3. **Email Validation**
- Standard email format validation
- Maximum 100 characters
- Converted to lowercase for consistency

## Token Management

### JWT Token Structure
```json
{
  "sub": "1",                    // User ID
  "email": "user@example.com",
  "role": "learner",
  "iat": 1234567890,            // Issued at
  "exp": 1234654290             // Expiration (24 hours)
}
```

### Token Storage
- **Location**: Browser localStorage
- **Keys**: 
  - `auralearn_token` - Full token (with "Bearer " prefix)
  - `auralearn_user` - JSON stringified user object
- **Expiration**: 24 hours (configured in backend)

### Token Expiration Handling
⚠️ **Current Limitation**: Frontend doesn't automatically refresh or verify token expiration
- Token expires after 24 hours
- After expiration, API calls will return 401
- Frontend should redirect to login on 401 response

**Recommended Implementation** (Future Enhancement):
```typescript
// Check token expiration before API calls
function isTokenExpired(token: string): boolean {
  const payload = JSON.parse(atob(token.split('.')[1]));
  return Date.now() >= payload.exp * 1000;
}

// Redirect to login if expired
if (isTokenExpired(token)) {
  logout();
  router.push('/login');
}
```

## Security Considerations

### Password Security
- ✅ Passwords hashed with bcrypt
- ✅ Salt generated automatically
- ✅ Passwords never stored in plain text

### JWT Security
- ✅ HS256 algorithm with strong secret
- ✅ Token expiration (24 hours)
- ✅ Sent via Authorization header (not in URL)
- ⚠️ Stored in localStorage (XSS vulnerable)

**Security Note**: For higher security, consider:
1. Using httpOnly cookies instead of localStorage
2. Implementing refresh tokens for token rotation
3. Adding CSRF protection

### CORS Configuration
**Frontend Origins Allowed**:
- `http://localhost:3000` - Local development
- `http://127.0.0.1:3000` - Local development alt
- `http://localhost:8000` - Local backend
- `http://127.0.0.1:8000` - Local backend alt

For production, update `CORS_ORIGINS` in backend `.env` to:
```
CORS_ORIGINS=https://auralearn.com
```

## Making API Calls from Frontend

### Using the API Client Utility

```typescript
import { apiCall } from '@/utils/apiClient';

// GET request
const courses = await apiCall('/api/courses');

// POST request
const result = await apiCall('/api/courses/enroll', {
  method: 'POST',
  body: JSON.stringify({ course_id: 1 })
});

// PUT request
const updated = await apiCall('/api/user/profile', {
  method: 'PUT',
  body: JSON.stringify({ name: 'New Name' })
});

// DELETE request
await apiCall('/api/courses/1', {
  method: 'DELETE'
});
```

The `apiCall()` utility automatically:
- Adds `Content-Type: application/json` header
- Adds `Authorization: Bearer <token>` header
- Parses JSON response
- Throws error on non-2xx status codes

### Direct Fetch (Not Recommended)

If you need to use fetch directly, include the token:
```typescript
const token = localStorage.getItem('auralearn_token');
const response = await fetch(`${API_BASE}/api/courses`, {
  headers: {
    'Authorization': token || '',
    'Content-Type': 'application/json'
  }
});
```

## Error Handling

### Authentication Errors

**Invalid Credentials**
```json
{
  "detail": "Invalid email or password"
}
```

**Account Already Exists**
```json
{
  "detail": "Email already registered"
}
```

**Invalid Token**
```json
{
  "detail": "Invalid or expired token"
}
```

**Missing Token**
```json
{
  "detail": "Not authenticated"
}
```

### Frontend Error Display
- Login/Signup pages display errors in a red error box
- Errors are stored in auth context `error` property
- Each auth operation returns `{ success: boolean, error?: string }`

## Testing

### Manual Testing Checklist

1. **Signup Flow**
   - [ ] Fill signup form with valid data
   - [ ] Verify email validation works
   - [ ] Verify password strength validation (6+ chars, 2 of 4 types)
   - [ ] Verify terms checkbox is required
   - [ ] Verify account is created and user is logged in
   - [ ] Test duplicate email rejection

2. **Login Flow**
   - [ ] Login with valid credentials
   - [ ] Verify error on invalid email
   - [ ] Verify error on invalid password
   - [ ] Verify token is stored in localStorage
   - [ ] Verify redirect to dashboard

3. **Session Persistence**
   - [ ] Login and refresh page
   - [ ] Verify user stays logged in
   - [ ] Close and reopen browser
   - [ ] Verify session persists

4. **Logout Flow**
   - [ ] Click logout
   - [ ] Verify localStorage is cleared
   - [ ] Verify redirect to login page
   - [ ] Verify cannot access protected pages

5. **Protected API Calls**
   - [ ] Test API calls with valid token
   - [ ] Test API calls without token (should fail)
   - [ ] Verify Authorization header is included

### Testing With cURL

```bash
# Signup
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123!"
  }'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'

# Verify Token
curl -X POST http://localhost:8000/api/auth/verify-token \
  -H "Authorization: Bearer <token>"
```

## Troubleshooting

### Login/Signup Returns 404
**Issue**: `POST /api/v1/auth/login` not found
**Cause**: Frontend still using old `/api/v1/auth/` path
**Solution**: Verify frontend calls `/api/auth/login` (no v1)

### CORS Error in Browser
**Issue**: "Access to XMLHttpRequest... blocked by CORS policy"
**Cause**: Frontend origin not in backend CORS_ORIGINS
**Solution**: Add frontend URL to CORS_ORIGINS in backend `.env`

### Token Not Sending in Requests
**Issue**: API returns 401 Unauthorized for protected endpoints
**Cause**: Authorization header not being sent
**Solution**: Use `apiCall()` utility or manually add token to headers

### User Role Mismatch
**Issue**: Frontend expecting "user" or "admin", backend returning "learner"
**Cause**: Frontend was using old role values
**Solution**: Update frontend to accept all role strings from backend

### 401 After 24 Hours
**Issue**: Getting 401 errors after extended use
**Cause**: JWT token expired (24 hour default)
**Solution**: Implement token refresh or redirect to login on 401

## Deployment

### Frontend Deployment
1. Update `.env.local` with production API URL
2. Build: `npm run build`
3. Deploy to Vercel, Netlify, or your hosting provider

### Backend Deployment
1. Update `.env` with production settings
2. Set `APP_ENV=production`
3. Use strong, random `JWT_SECRET`
4. Update `CORS_ORIGINS` to production frontend URL
5. Use production PostgreSQL database
6. Enable HTTPS for all requests
7. Consider using environment-specific secrets management

## Future Enhancements

1. **Refresh Token System**
   - Implement refresh token rotation
   - Extend session without re-login
   - Better security for long-running sessions

2. **Email Verification**
   - Send verification email on signup
   - Require email confirmation before activation
   - Resend verification email option

3. **Password Reset**
   - Forgot password flow
   - Email-based reset link
   - Password reset token validation

4. **Multi-Factor Authentication**
   - 2FA setup during account creation
   - Optional 2FA for enhanced security
   - SMS or authenticator app support

5. **Rate Limiting**
   - Limit login attempts to prevent brute force
   - Rate limit signup to prevent spam
   - Progressive backoff on failed attempts

6. **Session Management**
   - Logout all devices
   - View active sessions
   - Device-specific session tracking

7. **OAuth/Social Login**
   - Google OAuth integration
   - GitHub OAuth integration
   - Alternative login methods

## Files Changed

### New Files
- `frontend/src/utils/apiClient.ts` - API client utility
- `frontend/.env.local` - Frontend environment config
- `Warriors/AUTH_INTEGRATION_GUIDE.md` - This guide

### Modified Files
- `frontend/src/context/AuthContext.tsx` - Fixed endpoints, removed mock fallback, improved error handling
- `frontend/src/app/login/page.tsx` - Added error display
- `frontend/src/app/signup/page.tsx` - Added error display
- `backend/app/main.py` - Fixed CORS configuration
- `backend/app/config.py` - Added CORS_ORIGINS setting

## Support

For issues or questions about authentication integration:
1. Check this guide's troubleshooting section
2. Review error messages in browser console and terminal
3. Check backend logs for detailed error information
4. Verify environment variables are set correctly
5. Test API endpoints directly with cURL or Postman
