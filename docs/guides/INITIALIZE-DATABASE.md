# Initialize Database with Sample Data

Your Vercel deployment is successful, but the database is empty. Follow these steps to initialize it with sample data:

## Option 1: Using the Browser (Easiest)

1. Open your browser
2. Navigate to: `https://qms-app-omega.vercel.app/api/setup`
3. You should see a JSON response indicating the database was initialized

## Option 2: Using curl (Command Line)

```bash
curl -X POST https://qms-app-omega.vercel.app/api/setup
```

## Option 3: Using PowerShell

```powershell
Invoke-WebRequest -Uri "https://qms-app-omega.vercel.app/api/setup" -Method POST
```

## What This Does

The setup endpoint will:

1. Create all necessary database tables (if they don't exist)
2. Add 3 sample quilts:
   - Premium Down Winter Quilt (2500g, Winter)
   - Cotton Comfort Quilt (1200g, Spring/Autumn)
   - Light Summer Quilt (600g, Summer)

## Verify It Worked

After running the setup, visit:

- https://qms-app-omega.vercel.app/quilts

You should now see the 3 sample quilts instead of "No quilts yet".

## Check Database Status

To check if the database is already initialized:

```bash
curl https://qms-app-omega.vercel.app/api/setup
```

This GET request will show you:

- Connection status
- Number of quilts in the database
- Whether it's initialized

## Troubleshooting

### "Database already has data"

This means the database is already initialized. No action needed.

### "Database connection failed"

Check that the `DATABASE_URL` environment variable is set correctly in Vercel:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify `DATABASE_URL` is set to your Neon database connection string

### Still showing "No quilts yet"

1. Clear your browser cache (or use the clear-cache page: https://qms-app-omega.vercel.app/clear-cache.html)
2. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
3. Check the browser console for any errors

## React Error #418 (Hydration Mismatch)

The hydration error you're seeing is unrelated to the empty database. It's caused by a mismatch between server and client rendering. This will be fixed in a future update, but it doesn't affect functionality once the database has data.

## Next Steps

After initializing the database:

1. You can add more quilts using the "Add Quilt" button
2. Test the usage tracking features
3. Explore the analytics and reports sections
