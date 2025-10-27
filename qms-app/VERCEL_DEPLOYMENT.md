# Vercel Deployment Guide for QMS App

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Database**: Set up a PostgreSQL database (recommended: Vercel Postgres)

## Database Setup Options

### Option 1: Vercel Postgres (Recommended)
1. Go to your Vercel dashboard
2. Create a new project or go to existing project
3. Go to Storage tab
4. Create a new Postgres database
5. Copy the connection string

### Option 2: External Database Providers
- **Supabase**: Free tier with PostgreSQL
- **PlanetScale**: MySQL-compatible serverless database
- **Railway**: PostgreSQL with generous free tier
- **Neon**: Serverless PostgreSQL

## Deployment Steps

### 1. Push to GitHub
```bash
# From your project root
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Connect to Vercel
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Select the `qms-app` folder as the root directory

### 3. Configure Environment Variables
In Vercel dashboard, add these environment variables:

**Required:**
- `DATABASE_URL`: Your PostgreSQL connection string
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`

**Optional:**
- `NEXTAUTH_URL`: Will be auto-set by Vercel
- `REDIS_URL`: If using Redis caching

### 4. Deploy
1. Click "Deploy" in Vercel
2. Wait for build to complete
3. Your app will be available at `https://your-app-name.vercel.app`

## Build Configuration

The project is configured with:
- **Build Command**: `next build`
- **Install Command**: `npm install`
- **Output Directory**: `.next`
- **Root Directory**: `qms-app` (if deploying from monorepo)

## Database Migration

After first deployment:
1. Initialize your database schema through Neon console or API
2. Or use the setup API endpoint:
```bash
# Initialize database schema
curl -X POST https://your-app.vercel.app/api/setup

# Test database connection
curl https://your-app.vercel.app/api/db-test
```

## Troubleshooting

### Common Issues:

1. **Build Fails - Database Connection**
   - Ensure `DATABASE_URL` is set in environment variables
   - Check that Neon PostgreSQL connection string is valid

2. **Database Connection Issues**
   - Verify `DATABASE_URL` format: `postgresql://user:password@host:port/database`
   - Ensure database allows connections from Vercel IPs

3. **File Upload Issues**
   - Vercel has file size limits for serverless functions
   - Consider using external storage (AWS S3, Cloudinary) for images

4. **Function Timeout**
   - Vercel free tier has 10s timeout
   - Pro tier has 60s timeout
   - Optimize database queries and API calls

### Performance Optimization:

1. **Database Connection Pooling**
   - Neon Serverless Driver provides built-in connection pooling
   - Optimized for serverless environments with automatic scaling

2. **Static Generation**
   - Use `getStaticProps` where possible
   - Pre-generate static pages for better performance

3. **Image Optimization**
   - Use Next.js Image component
   - Consider external image CDN

## Monitoring

1. **Vercel Analytics**: Built-in performance monitoring
2. **Error Tracking**: Consider Sentry integration
3. **Database Monitoring**: Use your database provider's monitoring tools

## Custom Domain (Optional)

1. Go to Vercel project settings
2. Add your custom domain
3. Configure DNS records as instructed
4. Update `NEXTAUTH_URL` if using authentication

## Environment-Specific Notes

### Development
- Use local SQLite database
- Run `npm run dev` for local development

### Production (Vercel)
- Uses PostgreSQL database
- Automatic deployments on git push
- Environment variables managed in Vercel dashboard

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **Database Access**: Use connection pooling and proper credentials
3. **API Routes**: Implement proper authentication and validation
4. **CORS**: Configure appropriately for your domain

## Backup Strategy

1. **Database Backups**: Use your database provider's backup features
2. **Code Backups**: GitHub serves as code backup
3. **Environment Variables**: Document all required variables

## Scaling Considerations

1. **Database**: Monitor connection limits and query performance
2. **Functions**: Monitor execution time and memory usage
3. **Storage**: Plan for file storage needs (images, uploads)
4. **CDN**: Leverage Vercel's global CDN for static assets