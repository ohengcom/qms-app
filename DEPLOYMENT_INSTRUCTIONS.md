# QMS Deployment Instructions

## ⚠️ IMPORTANT: Vercel Root Directory Configuration

This is a monorepo project. The main Next.js application is located in the `qms-app/` directory.

### Vercel Deployment Setup

**CRITICAL**: You MUST set the Root Directory in Vercel to `qms-app`

#### Steps:
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **General**
3. Find the **"Root Directory"** section
4. Set it to: `qms-app`
5. Click **Save**

#### Alternative Method:
If the UI setting doesn't work, you can also:
1. Delete this project from Vercel
2. Re-import it from GitHub
3. During import, set "Root Directory" to `qms-app`

### Why This Is Required

The project structure is:
```
qms/
├── qms-app/          # ← Main Next.js application (SET AS ROOT)
│   ├── package.json
│   ├── next.config.js
│   ├── src/
│   └── vercel.json
├── backend/          # Legacy prototypes
├── frontend/         # Legacy prototypes
└── README.md         # Project overview
```

Without setting the root directory to `qms-app`, Vercel will:
- ❌ Look for package.json in the wrong location
- ❌ Try to build from the wrong directory
- ❌ Fail to find the routes manifest

With the correct root directory setting:
- ✅ Finds package.json in qms-app/
- ✅ Builds the Next.js application correctly
- ✅ Deploys successfully

### Environment Variables

Make sure to set these in your Vercel dashboard:
- `DATABASE_URL` - Your Neon PostgreSQL connection string
- Any other environment variables from `qms-app/.env.example`

### Troubleshooting

If you see errors like:
- "Could not read package.json"
- "routes-manifest.json couldn't be found"
- "ENOENT: no such file or directory"

This means the Root Directory is not set correctly. Follow the steps above to fix it.