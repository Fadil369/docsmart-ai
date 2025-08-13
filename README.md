# DocSmart AI - Intelligent Document Processing Platform

## Overview

DocSmart AI is a modern, AI-powered document processing platform that enables users to upload, analyze, translate, compress, and collaborate on documents with advanced machine learning capabilities.

## Features

### Core Features
- 📄 **Document Upload & Processing** - Support for PDF, DOC, DOCX, TXT, RTF files
- 🤖 **AI-Powered Analysis** - Advanced document insights and summaries
- 🌐 **Document Translation** - Multi-language translation capabilities
- 🗜️ **Smart Compression** - Reduce file sizes while maintaining quality
- 👥 **Real-time Collaboration** - Work together on documents with live editing
- 📊 **Analytics Dashboard** - Track document processing metrics
- 💳 **Payment Integration** - Stripe and PayPal support for premium features

### Security & Authentication
- 🔐 **Secure Authentication** - Login, signup, email verification
- 👤 **User Profiles** - Customizable user settings and preferences
- 🛡️ **Role-based Access** - User and admin role management
- 🔑 **Password Recovery** - Secure password reset functionality
- ✅ **Email Verification** - Verify user accounts via email

### Technical Features
- ⚡ **Modern Stack** - React 19, TypeScript, Vite, Tailwind CSS
- 📱 **Responsive Design** - Mobile-first responsive interface
- 🎨 **Dark/Light Theme** - Toggle between themes
- ♿ **Accessibility** - WCAG compliant with keyboard navigation
- 🚀 **Performance Optimized** - Code splitting and lazy loading
- 📈 **Monitoring** - Error tracking and analytics integration

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Fadil369/docsmart-ai.git
   cd docsmart-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

### Demo Login
For testing purposes, use these credentials:
- **Email**: `demo@docsmart.ai`
- **Password**: `demo123`

## Environment Configuration

Copy `.env.example` to `.env` and configure the following:

### Required Settings
```env
VITE_APP_NAME="DocSmart AI"
VITE_APP_ENV="development"
VITE_APP_URL="http://localhost:5173"
```

### API Configuration
```env
VITE_API_BASE_URL="https://api.docsmart-ai.com"
VITE_API_TIMEOUT="30000"
```

### Authentication
```env
VITE_AUTH_ENABLED="true"
VITE_JWT_SECRET="your-jwt-secret-key-here"
```

### Payment Integration (Optional)
```env
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_key"
VITE_PAYPAL_CLIENT_ID="your-paypal-client-id"
```

### AI Services (Optional)
```env
VITE_AI_SERVICE_ENABLED="true"
VITE_OPENAI_API_KEY="your-openai-api-key"
```

See `.env.example` for complete configuration options.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run test suite

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint -- --fix

# Run tests
npm run test

# Build project
npm run build
```

## Testing

### Running Tests
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Coverage
- Authentication system
- Core document processing
- User interface components
- API integration points

## Deployment

### Cloudflare Pages (Recommended)

1. **Connect Repository**
   - Go to Cloudflare Pages dashboard
   - Connect your GitHub repository

2. **Configure Build Settings**
   ```
   Build command: npm run build
   Build output directory: dist
   Root directory: /
   ```

3. **Set Environment Variables**
   Configure production environment variables in Cloudflare Pages dashboard

4. **Deploy**
   Push to main branch for automatic deployment

See [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md) for detailed deployment instructions.

### Other Platforms

The application can also be deployed to:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

## Architecture

### Tech Stack
- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, Radix UI
- **State Management**: React Context, React Query
- **Authentication**: JWT-based with localStorage
- **Payments**: Stripe, PayPal
- **Testing**: Vitest, React Testing Library
- **Build**: Vite with TypeScript

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── payment/        # Payment components
│   └── ui/             # Base UI components
├── contexts/           # React context providers
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── styles/             # Global styles
├── types/              # TypeScript type definitions
└── __tests__/          # Test files
```

## Contributing

### Development Workflow

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Make changes and add tests
4. Run quality checks (`npm run lint && npm run test`)
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push branch (`git push origin feature/amazing-feature`)
7. Open Pull Request

### Code Standards
- Follow TypeScript strict mode
- Use ESLint and Prettier for formatting
- Write tests for new features
- Follow conventional commit messages
- Maintain accessibility standards

## Security

### Security Measures
- Input validation and sanitization
- HTTPS-only in production
- Secure JWT token handling
- Environment variable protection
- CORS configuration
- Rate limiting

### Reporting Issues
Report security vulnerabilities to: security@docsmart-ai.com

## Performance

### Optimization Features
- Code splitting and lazy loading
- Image optimization
- Bundle size monitoring
- CDN asset delivery
- Gzip compression

### Lighthouse Targets
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 90

## Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

### Getting Help
- 📖 [Documentation](./docs/)
- 🐛 [Issue Tracker](https://github.com/Fadil369/docsmart-ai/issues)
- 💬 [Discussions](https://github.com/Fadil369/docsmart-ai/discussions)
- 📧 Email: support@docsmart-ai.com

### Community
- Follow [@docsmart_ai](https://twitter.com/docsmart_ai) on Twitter
- Join our [Discord community](https://discord.gg/docsmart)

---

**Built with ❤️ by the DocSmart AI Team**
## 🚀 Deployment

This project is configured for deployment on **Cloudflare Pages** with automatic GitHub integration.

### Quick Deploy to Cloudflare Pages

1. **Fork this repository** or use it as a template
2. **Connect to Cloudflare Pages**:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → Pages
   - Click "Create a project" → "Connect to Git"
   - Select your repository

3. **Configure build settings**:
   ```
   Project name: docsmart-ai
   Production branch: main
   Build command: npm run build
   Build output directory: dist
   ```

4. **Set environment variables** in Cloudflare Pages:
   ```
   NODE_ENV=production
   VITE_APP_ENV=production
   ```

5. **Deploy!** - Your app will be live at `https://docsmart-ai.pages.dev`

### Local Development with Cloudflare

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Deploy to Cloudflare Pages (requires auth)
npm run deploy:cloudflare
```

### GitHub Actions Deployment

The repository includes automated deployment via GitHub Actions. To enable:

1. **Add GitHub Secrets**:
   - `CLOUDFLARE_API_TOKEN` - Your Cloudflare API token
   - `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID

2. **Push to main branch** - Deployment happens automatically!

For detailed setup instructions, see [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md).

### Migration from GitHub Pages

If you're migrating from GitHub Pages:
- The old GitHub Pages workflow has been removed
- DNS records need to be updated to point to Cloudflare Pages
- All functionality is preserved with better performance and features

