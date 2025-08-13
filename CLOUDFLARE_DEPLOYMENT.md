# Cloudflare Pages Deployment Configuration

This project is configured for deployment on Cloudflare Pages.

## Deployment Settings

### Build Configuration
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/`
- **Node.js version**: `18` or later

### Environment Variables

The following environment variables should be configured in Cloudflare Pages:

#### Production Environment Variables
```
NODE_ENV=production
VITE_APP_ENV=production
VITE_APP_URL=https://your-domain.pages.dev
VITE_API_BASE_URL=https://api.docsmart-ai.com
VITE_AUTH_ENABLED=true
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_stripe_key
VITE_PAYPAL_CLIENT_ID=your_production_paypal_client_id
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_ANALYTICS_ENABLED=true
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
VITE_SENTRY_DSN=your_production_sentry_dsn
```

#### Preview Environment Variables
```
NODE_ENV=development
VITE_APP_ENV=preview
VITE_APP_URL=https://preview.your-domain.pages.dev
VITE_API_BASE_URL=https://api-staging.docsmart-ai.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_test_stripe_key
VITE_PAYPAL_CLIENT_ID=your_sandbox_paypal_client_id
```

## Custom Domain Setup

1. Go to Cloudflare Pages dashboard
2. Select your project
3. Navigate to "Custom domains"
4. Add your domain (e.g., `docsmart-ai.com`)
5. Configure DNS records as instructed

## Build Optimization

The project includes several optimizations for Cloudflare Pages:

- Static asset optimization
- Gzip compression
- Code splitting (recommended for bundle size > 500KB)
- CDN-friendly caching headers

## Deployment Process

### Automatic Deployment
- Pushes to `main` branch trigger production deployment
- Pull requests trigger preview deployments

### Manual Deployment
1. Build locally: `npm run build`
2. Upload `dist` folder to Cloudflare Pages
3. Configure environment variables
4. Deploy

## Performance Monitoring

Monitor your deployment with:
- Cloudflare Analytics
- Web Vitals metrics
- Lighthouse scores
- Error tracking via Sentry

## Security Considerations

- Environment variables are properly scoped
- API keys are never exposed to client-side code
- Content Security Policy (CSP) headers recommended
- HTTPS-only cookies for authentication

## Rollback Strategy

1. **Immediate Rollback**: Use Cloudflare Pages dashboard to rollback to previous deployment
2. **Code Rollback**: Revert git commit and push to main branch
3. **Canary Deployment**: Use branch-based previews for testing before production

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify environment variables are set
   - Review build logs in Cloudflare Pages dashboard

2. **Runtime Errors**
   - Check browser console for client-side errors
   - Verify API endpoints are accessible
   - Confirm environment variables are correct

3. **Performance Issues**
   - Monitor Core Web Vitals
   - Check bundle size and implement code splitting
   - Verify CDN caching is working

### Support Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Project Repository Issues](https://github.com/Fadil369/docsmart-ai/issues)

## Maintenance

### Regular Tasks
- Update dependencies monthly
- Monitor security vulnerabilities
- Review performance metrics
- Test deployment process

### Automated Monitoring
- Set up Cloudflare alerts for downtime
- Configure Sentry for error monitoring
- Monitor Core Web Vitals degradation