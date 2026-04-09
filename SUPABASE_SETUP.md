# Supabase Authentication - Quick Start

## ✅ Setup Complete!

Your application is now connected to Supabase authentication.

## Credentials Configured

- **Supabase URL**: `https://your-project-id.supabase.co`
- **Project**: Configured in `.env`

## What Works Now

### 1. Email/Password Authentication
- ✅ Sign up with email/password
- ✅ Login with email/password
- ✅ Email verification (check Supabase settings)
- ✅ Automatic session management
- ✅ Protected routes

### 2. Google OAuth (Ready to Enable)
- Google sign-in button is ready
- Configure in Supabase Dashboard → Authentication → Providers
- Add Google OAuth credentials
- Users can sign in with one click

### 3. Session Management
- Sessions persist across page refreshes
- Automatic token refresh
- Logout clears session completely

## Test It Out

1. **Start the dev server**:
   ```bash
   pnpm dev
   ```

2. **Visit**: `http://localhost:8080/signup`

3. **Create an account** with your email

4. **Check your email** for the confirmation link (if enabled)

5. **Login** at: `http://localhost:8080/login`

6. **Visit protected page**: `http://localhost:8080/learning-hub`

## Important Notes

### Email Confirmation

By default, Supabase requires email confirmation. New users must:
1. Sign up
2. Click confirmation link in email
3. Then they can log in

To disable for development:
- Supabase Dashboard → Authentication → Settings
- Toggle off "Enable email confirmations"

### Google OAuth Setup

To enable Google sign-in:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```
4. Copy Client ID and Secret
5. Paste in Supabase Dashboard → Authentication → Providers → Google
6. In Supabase, add app redirect URLs:
   - Local: `http://localhost:8080/auth/callback`
   - Production: `https://your-domain.com/auth/callback`

## Code Examples

### Check if user is logged in

```tsx
import { useAuth } from "@/lib/auth";

function MyComponent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please log in</div>;
  
  return <div>Hello, {user.email}!</div>;
}
```

### Protect a route

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

### Logout

```tsx
const { logout } = useAuth();

<button onClick={logout}>Logout</button>
```

## Database Integration (Next Step)

To store user profiles and data:

1. Go to Supabase Dashboard → Table Editor
2. Create tables for your app (profiles, courses, progress, etc.)
3. Enable Row Level Security (RLS)
4. Create policies to protect user data

Example:
```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can only see their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
```

## Support

- **Supabase Docs**: https://supabase.com/docs/guides/auth
- **React Integration**: https://supabase.com/docs/guides/auth/auth-helpers/auth-ui
- **Auth UI Components**: https://supabase.com/docs/guides/auth/auth-helpers/auth-ui-react

---

Everything is configured and ready to use! 🎉
