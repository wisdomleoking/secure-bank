# SecureBank Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com))
- Node.js installed locally

## Important Note About Database

⚠️ **CRITICAL**: This application currently uses SQLite, which is **NOT suitable** for Vercel's serverless environment. Vercel's serverless functions are ephemeral and cannot maintain a persistent SQLite database file.

### Recommended Database Solutions for Production:

1. **Supabase** (PostgreSQL) - Free tier available, excellent for Vercel
2. **PlanetScale** (MySQL) - Serverless MySQL, works great with Vercel
3. **MongoDB Atlas** - Free tier available
4. **Neon** (PostgreSQL) - Serverless PostgreSQL
5. **Railway** - Supports multiple databases

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/wisdomleoking/Banking.git
cd Banking
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Initialize database:
```bash
npm run init-db
```

5. Start development server:
```bash
npm run dev
```

## Vercel Deployment Steps

### Step 1: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in/up
2. Click "Add New..." → "Project"
3. Import your GitHub repository: `wisdomleoking/Banking`
4. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave as is)
   - **Build Command**: `npm install`
   - **Output Directory**: `./`
   - **Install Command**: `npm install`
5. Click "Deploy"

### Step 2: Configure Environment Variables

After the initial deployment, you'll need to add environment variables:

1. Go to your project dashboard in Vercel
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

```
NODE_ENV=production
JWT_SECRET=your_very_secure_random_secret_key_here
FRONTEND_URL=https://your-app-name.vercel.app
```

4. For the database, you'll need to add variables based on your chosen database service. For example, with Supabase:
```
DATABASE_URL=postgresql://user:password@host:port/database
```

### Step 3: Update Database Configuration

You'll need to modify `config/database.js` to use an external database instead of SQLite. Here's a basic example for PostgreSQL:

```javascript
// Using pg (PostgreSQL) instead of sqlite3
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = {
  initializeDatabase: async () => {
    // Your initialization logic here
  },
  query: (text, params) => pool.query(text, params)
};
```

### Step 4: Update Dependencies

If switching from SQLite to PostgreSQL, update your package.json:

```bash
npm uninstall sqlite3
npm install pg
```

### Step 5: Redeploy

After making configuration changes:
1. Commit and push changes to GitHub
2. Vercel will automatically redeploy
3. Or trigger a manual redeploy from the Vercel dashboard

## Alternative Deployment Options

### Using Vercel Postgres (Easiest)

1. In your Vercel project, go to **Storage** → **Create Database**
2. Choose **Postgres** → **Create**
3. Vercel will provide a connection string
4. Add `POSTGRES_URL` to your environment variables
5. Update your database configuration to use this connection string

### Using Render.com

Render.com offers a simple deployment with persistent file system (SQLite could work):

1. Push code to GitHub
2. Connect Render to your GitHub repo
3. Create a **Web Service**
4. Configure build and start commands
5. Add environment variables
6. Deploy

### Using Railway

Railway provides a complete environment with database:

1. Sign up at [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Add a PostgreSQL database from the marketplace
5. Railway will automatically set up the connection
6. Deploy

## Post-Deployment Checklist

- [ ] Database is properly configured and connected
- [ ] All environment variables are set
- [ ] JWT_SECRET is changed from default
- [ ] CORS is configured for your production domain
- [ ] SSL/HTTPS is enabled (automatic on Vercel)
- [ ] Database migrations run successfully
- [ ] Test user registration and login
- [ ] Test API endpoints
- [ ] Verify file uploads work (if using external storage)
- [ ] Check email functionality (if configured)

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check if database allows connections from Vercel's IPs
- Ensure SSL configuration is correct

### Build Failures
- Check Vercel build logs
- Verify all dependencies are in package.json
- Ensure Node.js version is compatible

### Runtime Errors
- Check Vercel function logs
- Verify environment variables are set
- Ensure database initialization runs correctly

## Security Considerations

1. Never commit `.env` file to Git
2. Use strong, random secrets for JWT
3. Enable rate limiting (already configured)
4. Use HTTPS (automatic on Vercel)
5. Validate and sanitize all inputs
6. Implement proper error handling without exposing sensitive data
7. Use helmet.js (already configured)
8. Keep dependencies updated

## Scaling Considerations

As your application grows, consider:
- CDN for static assets (Vercel provides this automatically)
- Database connection pooling
- Caching strategies (Redis)
- Load balancing
- Monitoring and logging (Sentry, LogRocket)
- API rate limiting per user

## Support

For issues or questions:
- Check Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
- GitHub Issues: [github.com/wisdomleoking/Banking/issues](https://github.com/wisdomleoking/Banking/issues)
