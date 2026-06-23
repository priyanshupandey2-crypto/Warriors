# Token Handling - Quick Reference Card

## 🚀 Quick Start

### Check Login Status
```typescript
const { isLogin, user } = useAuth();
```

### Show Session Expiration
```typescript
const { timeUntilExpiry, isExpiringSoon } = useTokenStatus();
```

### Protect a Route
```typescript
<ProtectedRoute requiredRole="admin">
  <AdminDashboard />
</ProtectedRoute>
```

### Auto-Refresh Token
```typescript
useTokenRefresh();
```

### Make Authenticated API Call
```typescript
const data = await apiCall("/api/courses", { method: "GET" });
```

## 📚 Available Hooks

| Hook | Purpose | Key Returns |
|------|---------|-------------|
| `useAuth()` | Main auth context | isLogin, token, login(), logout() |
| `useTokenStatus()` | Real-time token info | isValid, timeUntilExpiry, tokenPayload |
| `useTokenRefresh()` | Auto token refresh | None (just call it) |

## 🛡️ Available Components

| Component | Purpose | Props |
|-----------|---------|-------|
| `<ProtectedRoute>` | Route protection | children, requiredRole? |
| `<AuthDebugPanel>` | Debug panel | (none - just drop in) |

## 🔧 Available Utilities

```typescript
import {
  decodeJWT,                   // Decode JWT token
  isTokenValid,                // Check if valid
  getTokenExpiry,              // Get expiry timestamp
  getTimeUntilExpiryFormatted, // Get "2h 30m 45s"
  isTokenExpiringSoon,         // Check if expiring soon
  getTokenUserInfo,            // Get user data from token
  getTokenMetadata,            // Get complete token info
} from "@/utils/tokenUtils";
```

## ✅ Auth Context API

```typescript
const {
  // State
  user,               // { id, name, email, role }
  token,              // JWT token string
  isLoading,          // Initial load state
  error,              // Last error message
  isLogin,            // User logged in?
  isTokenValid,       // Token still valid?
  tokenExpiry,        // Expiry timestamp (ms)

  // Methods
  login(email, password),           // Returns {success, error?}
  signup(name, email, password),    // Returns {success, error?}
  logout(),                         // Clear auth state
  clearError(),                     // Clear error message
  getTokenPayload(),                // Get JWT payload
  getTokenExpiryTime(),             // Get ISO string
  isTokenExpiringSoon(minutes),     // Check expiry
  refreshTokenIfNeeded(),           // Try refresh token
} = useAuth();
```

## 🎯 Common Patterns

### Pattern 1: Show Login Button
```typescript
const { isLogin, logout } = useAuth();

return isLogin ? (
  <button onClick={logout}>Logout</button>
) : (
  <a href="/login">Login</a>
);
```

### Pattern 2: Display Expiration Warning
```typescript
const { isExpiringSoon, timeUntilExpiry } = useTokenStatus();

return isExpiringSoon ? (
  <div className="alert alert-warning">
    Your session expires in {timeUntilExpiry}
  </div>
) : null;
```

### Pattern 3: Admin-Only Page
```typescript
export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <h1>Admin Dashboard</h1>
    </ProtectedRoute>
  );
}
```

### Pattern 4: Add Token Refresh to Layout
```typescript
export default function RootLayout() {
  useTokenRefresh({ checkInterval: 60000 });
  return <div>{/* children */}</div>;
}
```

### Pattern 5: Debug Token Info
```typescript
const { token } = useAuth();
const metadata = getTokenMetadata(token);

return (
  <p>
    {metadata?.isValid ? '✅' : '❌'}
    {metadata?.percentageUsed.toFixed(0)}% of session used
  </p>
);
```

## 🔒 Security Checklist

- [ ] Token stored in localStorage (or httpOnly cookies in production)
- [ ] isLogin properly checked before rendering protected content
- [ ] isTokenValid confirmed before making API calls
- [ ] Protected routes wrap sensitive pages
- [ ] Token auto-refresh enabled (optional but recommended)
- [ ] Logout clears all auth data
- [ ] 401 responses handled (logout and redirect)
- [ ] CORS allows frontend origin

## ⚙️ Configuration

### Token Refresh Interval
```typescript
useTokenRefresh({
  checkInterval: 60000,    // Check every 60 seconds
  refreshBefore: 5         // Refresh 5 minutes before expiry
});
```

### Token Expiration Warning
```typescript
const { isTokenExpiringSoon } = useTokenStatus();
isTokenExpiringSoon(10);   // Warn 10 minutes before expiry
```

## 🐛 Debugging

### Check Auth State
```typescript
const { isLogin, isTokenValid, tokenExpiry } = useAuth();
console.log({ isLogin, isTokenValid, expires: new Date(tokenExpiry) });
```

### Inspect Token
```typescript
const { token } = useAuth();
console.log(decodeJWT(token));
```

### View Session Progress
```typescript
const metadata = getTokenMetadata(token);
console.log(`${metadata.percentageUsed.toFixed(0)}% used`);
```

### Test Protected Route
```typescript
// Try accessing /admin without admin role
// Should redirect to /unauthorized
```

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| isLogin is false after reload | Token expired or invalid - must re-login |
| Token not sending in API calls | Use apiClient hook or add header manually |
| Protected route redirects even when logged in | Check isTokenValid, may be expired |
| useTokenRefresh not working | Add to layout level, not page level |
| timeUntilExpiry shows wrong time | Check token timestamp is in seconds, not ms |

## 📋 Setup Checklist

- [ ] AuthContext imported in root layout
- [ ] useAuth() hook imported where needed
- [ ] Protected routes wrapped with `<ProtectedRoute>`
- [ ] useTokenRefresh() added to layout
- [ ] apiClient used for authenticated API calls
- [ ] Error handling for 401 responses
- [ ] AuthDebugPanel added for development
- [ ] Tested login → protected route → logout flow

## 🔗 Full Docs

- **TOKEN_HANDLING_GUIDE.md** - 300+ lines comprehensive guide
- **TOKEN_IMPLEMENTATION_SUMMARY.md** - Implementation details
- **AUTH_INTEGRATION_GUIDE.md** - API endpoints and integration

## 💡 Pro Tips

1. **Always check isLogin before showing user menu**
   ```typescript
   {isLogin && <UserMenu user={user} />}
   ```

2. **Wrap protected pages with ProtectedRoute**
   ```typescript
   <ProtectedRoute requiredRole="admin">
     <AdminPanel />
   </ProtectedRoute>
   ```

3. **Add useTokenRefresh to layout to auto-refresh**
   ```typescript
   // In root layout.tsx
   useTokenRefresh();
   ```

4. **Use apiClient for all authenticated requests**
   ```typescript
   // Auto includes Authorization header
   const courses = await apiCall("/api/courses");
   ```

5. **Display session countdown for transparency**
   ```typescript
   <p>Session expires in {timeUntilExpiry}</p>
   ```

6. **Handle 401 responses gracefully**
   ```typescript
   if (error.status === 401) {
     logout();
     router.push("/login");
   }
   ```
