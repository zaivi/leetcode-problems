# Clear Old Data

## Issue
If you were testing before, localStorage might have old progress data with link-based keys (e.g., `"https://leetcode.com/problems/two-sum"`) instead of ID-based keys (e.g., `"1"`, `"2"`).

This causes the error: `invalid input syntax for type bigint: "NaN"`

## Solution

### Option 1: Clear localStorage (Recommended for Testing)

Open your browser console (F12) and run:

```javascript
localStorage.removeItem('leettrack_progress_v1');
location.reload();
```

### Option 2: Clear All App Data

In your browser:
1. Open DevTools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Expand **Local Storage**
4. Click on your site URL
5. Find `leettrack_progress_v1` and delete it
6. Refresh the page

### Option 3: Use Incognito/Private Window

Open your app in an incognito/private window to test with fresh data.

## What Was Fixed

The code now filters out non-numeric IDs before trying to save to Supabase:

```typescript
const updates = Object.entries(progress)
  .filter(([id]) => {
    const numId = parseInt(id);
    return !isNaN(numId) && numId > 0;  // ✅ Only numeric IDs
  })
  .map(([id, userProgress]) => 
    supabase
      .from('personal_problems')
      .update({ status, remarks })
      .eq('id', parseInt(id))
  );
```

This prevents the `NaN` error when there's old data in localStorage.

## How It Works Now

1. **New Data**: Problems added from Explorer get numeric IDs (1, 2, 3...)
2. **Old Data**: Link-based keys in localStorage are ignored when syncing to Supabase
3. **Clean State**: Once you clear localStorage, only numeric IDs will be used

## After Clearing Data

1. Sign in
2. Go to Explorer
3. Add some problems using the **+** button
4. Go to My Problems
5. Update status and remarks
6. Everything should save correctly! ✅

The error should be gone! 🎉

