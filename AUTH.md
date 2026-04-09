# Authentication System - Supabase

This application uses **Supabase Authentication** for user management and authentication.

## Features

- ✅ **Email/Password Authentication** - Secure signup and login
- ✅ **Google OAuth** - One-click sign-in with Google
- ✅ **Email Verification** - Automatic email confirmation for new accounts
- ✅ **Session Management** - Automatic token refresh and persistence
- ✅ **Protected Routes** - Client-side route protection
- ✅ **Auth Context** - React context for global auth state
- ✅ **Type-Safe** - Full TypeScript support with Supabase types

## Setup

### 1. Supabase Configuration

Your Supabase credentials are already configured in `.env`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Enable Authentication Providers

In your Supabase dashboard:

1. Go to **Authentication** → **Providers**
2. **Email** is enabled by default
3. To enable **Google OAuth**:
   - Toggle on Google provider
   - Add your Google OAuth credentials
   - Add authorized redirect URL in Google: `https://your-project-id.supabase.co/auth/v1/callback`
   - Add app redirect URL in Supabase:
     - Local: `http://localhost:8080/auth/callback`
     - Production: `https://your-domain.com/auth/callback`

### 3. Configure Email Templates (Optional)

Customize your confirmation emails in:
**Authentication** → **Email Templates**

## Client-Side Usage

### Using the Auth Hook

```tsx
import { useAuth } from "@/lib/auth";

function MyComponent() {
  const { user, session, isAuthenticated, login, signup, logout, isLoading, signInWithGoogle } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Welcome, {user.email}!</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <button onClick={() => login("email@example.com", "password")}>Login</button>
          <button onClick={signInWithGoogle}>Sign in with Google</button>
        </>
      )}
    </div>
  );
}
```

### Protected Routes

```tsx
import { ProtectedRoute } from "@/components/ProtectedRoute";

<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

### User Navigation Component

```tsx
import { UserNav } from "@/components/UserNav";

// In your header/navbar:
<UserNav />
```

## Authentication Flow

### Sign Up (Email/Password)

```typescript
const { signup } = useAuth();

const result = await signup("user@example.com", "securepassword");

if (result.success) {
  // User created, check email for confirmation link
} else {
  console.error(result.error);
}
```

**Note:** By default, Supabase requires email confirmation. Users must click the link in their email before they can log in.

### Login (Email/Password)

```typescript
const { login } = useAuth();

const result = await login("user@example.com", "securepassword");

if (result.success) {
  // User logged in successfully
} else {
  console.error(result.error);
}
```

### Google OAuth

```typescript
const { signInWithGoogle } = useAuth();

await signInWithGoogle();
// Redirects to Google for authentication
// After success, returns to /auth/callback and then navigates to /learning-hub
```

### Logout

```typescript
const { logout } = useAuth();

await logout();
// User logged out, session cleared
```

## File Structure

```
client/
├── lib/
│   ├── supabase.ts           # Supabase client initialization
│   └── auth.tsx              # Auth context and hook
├── components/
│   ├── ProtectedRoute.tsx    # Route protection wrapper
│   └── UserNav.tsx           # User navigation dropdown
└── pages/
    ├── Login.tsx             # Login page
    ├── SignUp.tsx            # Signup page
    └── Dashboard.tsx         # Example protected page
```

## Supabase User Object

The `user` object from `useAuth()` contains:

```typescript
{
  id: string;                // UUID
  email: string;             // User's email
  created_at: string;        // ISO timestamp
  app_metadata: object;      // App-specific metadata
  user_metadata: object;     // User-specific metadata
  // ... other Supabase user fields
}
```

## Email Confirmation Settings

By default, Supabase requires email confirmation. To disable (for development only):

1. Go to **Authentication** → **Settings**
2. Under **Email Auth**, toggle off "Enable email confirmations"

⚠️ **Not recommended for production**

## Session Management

Supabase automatically:
- Stores session in localStorage
- Refreshes tokens before expiry
- Handles token expiration
- Provides real-time auth state updates

## Database Integration

To access user data in your database:

```sql
-- Example: Create a profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);
```

## Security Notes

- ✅ Passwords are hashed by Supabase
- ✅ JWT tokens are signed and verified
- ✅ Tokens auto-refresh before expiration
- ✅ Email verification prevents fake accounts
- ✅ Row Level Security (RLS) protects database
- ✅ HTTPS enforced in production

## Testing Authentication

### Create a Test User

1. Sign up at: `http://localhost:8080/signup`
2. Check your email for confirmation link (or disable email confirmation in dev)
3. Log in at: `http://localhost:8080/login`

### Test Google OAuth

1. Configure Google OAuth in Supabase dashboard
2. Click "Continue with Google" button
3. Follow Google sign-in flow

## Troubleshooting

### "Invalid login credentials"
- User hasn't confirmed their email
- Wrong email/password
- User doesn't exist

### Google OAuth not working
- Check Google OAuth credentials in Supabase
- Verify redirect URL is correct
- Ensure provider is enabled

### Session not persisting
- Check browser localStorage
- Verify Supabase URL and anon key are correct
- Check browser console for errors

## Migration from Custom JWT

The previous custom JWT authentication has been replaced with Supabase. The old server-side routes (`/api/auth/*`) are no longer needed and can be removed.

## What's Next?

- [ ] Add password reset functionality
- [ ] Add profile management
- [ ] Add additional OAuth providers (GitHub, Facebook, etc.)
- [ ] Add 2FA/MFA support
- [ ] Create user profiles table in Supabase
- [ ] Add Row Level Security policies
- [ ] Implement user roles and permissions
