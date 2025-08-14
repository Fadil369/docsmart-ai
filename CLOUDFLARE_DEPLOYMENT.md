# Cloudflare Pages Deployment Guide

This project is configured for deployment on Cloudflare Pages with GitHub integration.

## Quick Setup

### 1. Cloudflare Pages Setup

1. **Login to Cloudflare Dashboard**
   - Visit [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Navigate to **Pages** in the sidebar

2. **Connect to GitHub**
   - Click **"Create a project"**
   - Select **"Connect to Git"**
   - Authorize Cloudflare to access your GitHub account
   - Select the `Fadil369/docsmart-ai` repository

3. **Configure Build Settings**
   ```
   Project name: docsmart-ai
   Production branch: main
   Build command: npm run build
   Build output directory: dist
   Root directory: /
   ```

4. **Environment Variables**
   Add these environment variables in Cloudflare Pages settings:
   ```
   NODE_ENV=production
   VITE_APP_ENV=production
   ```

### 2. GitHub Secrets Setup

For the GitHub Actions workflow, add these secrets to your repository:

1. **Go to Repository Settings**
   - Navigate to `Settings` > `Secrets and variables` > `Actions`

2. **Add Required Secrets**
   ```
   CLOUDFLARE_API_TOKEN: Your Cloudflare API token
   CLOUDFLARE_ACCOUNT_ID: Your Cloudflare account ID
   ```

#### Getting Cloudflare Credentials

1. **API Token**
   - Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
   - Click **"Create Token"**
   - Use **"Cloudflare Pages:Edit"** template
   - Scope: Include all accounts and zones
   - Copy the generated token

2. **Account ID**
   - Found in the right sidebar of your Cloudflare dashboard
   - Copy the Account ID value

### 3. Custom Domain (Optional)

1. **Add Custom Domain in Cloudflare Pages**
   - Go to your Pages project settings
   - Navigate to **"Custom domains"**
   - Click **"Set up a custom domain"**
   - Enter your domain (e.g., `docs.yourdomain.com`)

2. **DNS Configuration**
   - Add a CNAME record pointing to your Pages URL
   - Or use Cloudflare's automatic DNS setup if your domain is on Cloudflare

## Build Configuration

### Build Settings
- **Framework**: React with Vite
- **Node.js version**: 18 or later
- **Build command**: `npm run build`
- **Build output**: `dist/`
- **Install command**: `npm ci`

### Environment Variables

#### Production Environment Variables
```
NODE_ENV=production
VITE_APP_ENV=production
```

Add any additional environment variables your app needs:
```
VITE_API_URL=https://api.yourapp.com
VITE_STRIPE_PUBLIC_KEY=pk_live_...
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
```

## Features

### Automatic Deployments
- **Production**: Deploys automatically on push to `main` branch
- **Preview**: Creates preview deployments for pull requests
- **Manual**: Can be triggered manually via GitHub Actions

### Performance Optimizations
- **Asset Caching**: Static assets cached for 1 year
- **Security Headers**: Built-in security headers
- **SPA Routing**: Proper client-side routing support
- **Build Optimization**: Code splitting and minification

### Headers Configuration
The deployment includes these security headers:
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## Development Workflow

### Local Development
```bash
npm install
npm run dev
```

### Build and Preview
```bash
npm run build
npm run preview
```

### Manual Deployment
```bash
# Install Wrangler CLI (if not already installed)
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy manually
wrangler pages deploy dist --project-name docsmart-ai
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version (should be 18+)
   - Verify all dependencies are listed in package.json
   - Check for TypeScript errors

2. **Environment Variables**
   - Ensure all required variables are set in Cloudflare Pages
   - Prefix client-side variables with `VITE_`

3. **Routing Issues**
   - Verify `_redirects` file is in `public/` directory
   - Check SPA routing configuration

4. **GitHub Actions Failures**
   - Verify CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID secrets
   - Check API token permissions

### Getting Help

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## Migration from GitHub Pages

If migrating from GitHub Pages:

1. **Remove GitHub Pages Configuration**
   - Delete `.github/workflows/publish-assets.yml` (if exists)
   - Remove `.nojekyll` file (if exists)
   - Disable GitHub Pages in repository settings

2. **Update DNS**
   - Point your custom domain to Cloudflare Pages instead of GitHub Pages
   - Update CNAME records as needed

3. **Test Deployment**
   - Push changes to trigger first Cloudflare deployment
   - Verify all functionality works correctly

## Benefits of Cloudflare Pages

- **Global CDN**: Faster loading times worldwide
- **Advanced Analytics**: Detailed performance metrics
- **Security**: Built-in DDoS protection and security features
- **Serverless Functions**: Add backend functionality if needed
- **Custom Headers**: Better control over security and caching
- **Preview Deployments**: Test changes before going live
