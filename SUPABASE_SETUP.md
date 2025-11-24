# Supabase Setup Guide

This guide will help you set up Supabase for your LeetTrack Pro application.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project"
3. Fill in your project details:
   - Project name: `leettrack-pro` (or any name you prefer)
   - Database password: (generate a strong password)
   - Region: Choose the closest region to your users
4. Click "Create new project"

## 2. Get Your API Keys

1. Once your project is created, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 3. Configure Environment Variables

1. Create a `.env` file in the root of your project (copy from `.env.example`):

```bash
cp .env.example .env
```

2. Edit `.env` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 4. Create Database Tables

Run the following SQL in your Supabase SQL Editor (**SQL Editor** in the left sidebar):

```sql
-- Create user_progress table
CREATE TABLE user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  problem_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Todo', 'Solving', 'Solved', 'Revise')),
  remark TEXT DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, problem_id)
);

-- Create index for faster queries
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_problem_id ON user_progress(problem_id);

-- Enable Row Level Security (RLS)
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Users can only read their own progress
CREATE POLICY "Users can view their own progress"
  ON user_progress
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "Users can insert their own progress"
  ON user_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update their own progress"
  ON user_progress
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own progress
CREATE POLICY "Users can delete their own progress"
  ON user_progress
  FOR DELETE
  USING (auth.uid() = user_id);
```

## 5. Configure Authentication

1. Go to **Authentication** > **Providers** in your Supabase dashboard
2. Email authentication is already enabled by default
3. **Disable email confirmations for easier setup**:
   - Go to **Authentication** > **Settings**
   - Scroll to **Email Auth**
   - Disable "Enable email confirmations"
   - Click "Save"

**Note**: You'll need to manually create user accounts in Supabase for users to sign in.

## 6. Create a Test User

Since sign-up is disabled, you need to manually create a user in Supabase:

1. Go to **Authentication** > **Users** in your Supabase dashboard
2. Click "Add user" → "Create new user"
3. Enter an email and password (e.g., test@example.com / password123)
4. Disable "Send user a confirmation email"
5. Click "Create user"

## 7. Test Your Setup

1. Start your development server:

```bash
npm run dev
```

2. Click "Sign In" in the top right corner
3. Sign in with the credentials you created (test@example.com / password123)
4. Start tracking problems!

## Features Enabled

✅ **Authentication**
- Email/Password sign in (accounts created manually in Supabase)
- Guest mode (uses localStorage only)
- Automatic session management

✅ **Backend Storage**
- User progress synced to Supabase
- Automatic sync when logging in
- Fallback to localStorage when offline
- Row-level security for data protection

✅ **User Experience**
- Seamless authentication flow
- Progress preserved across devices
- Local storage backup
- Real-time session updates

## Troubleshooting

### Issue: "Invalid API key" error
**Solution**: Make sure your `.env` file has the correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Restart your dev server after changing `.env`.

### Issue: Can't sign in
**Solution**: 
1. Make sure you've manually created a user in Supabase (Authentication > Users)
2. Check that email confirmations are disabled in **Authentication** > **Settings**
3. Verify your credentials are correct

### Issue: Progress not syncing
**Solution**: 
1. Check browser console for errors
2. Verify the `user_progress` table exists in Supabase
3. Ensure RLS policies are set up correctly

### Issue: "Failed to load progress from Supabase"
**Solution**: 
1. Check if the user is authenticated
2. Verify RLS policies allow the user to read their data
3. Check the browser console for specific error messages

## Adding More Users

To add more users for your team:

1. Go to **Authentication** > **Users**
2. Click "Add user" → "Create new user"
3. Enter their email and password
4. Disable "Send user a confirmation email"
5. Click "Create user"
6. Share the credentials with them securely

## Next Steps

- Add more users in Authentication > Users
- Set up database backups
- Configure custom domain
- Add more tables for additional features
- Enable user sign-up if needed (requires email service configuration)

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

