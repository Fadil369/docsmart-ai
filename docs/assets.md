# Static Assets Hosting

This repository uses GitHub Pages to host static assets like images, documents, and downloadable files. Assets are automatically deployed with versioning support for reliable, immutable references.

## 🏗️ Directory Structure

```
public/assets/
├── images/          # Image files (PNG, JPG, SVG, etc.)
├── docs/            # Documentation files (PDF, DOC, etc.)
└── downloads/       # Downloadable files (ZIP, executables, etc.)
```

## 📦 Adding Assets

### 1. Add Files to Repository

Place your assets in the appropriate subdirectory under `public/assets/`:

```bash
# Example: Add a logo image
cp logo.png public/assets/images/

# Example: Add a user guide
cp user-guide.pdf public/assets/docs/

# Example: Add a downloadable tool
cp my-tool.zip public/assets/downloads/
```

### 2. Commit and Push

Assets are automatically deployed when you push to the main branch or create a tagged release:

```bash
git add public/assets/
git commit -m "Add new assets"
git push origin main
```

## 🔗 Referencing Assets

### Latest Version URLs

For development and references that should always point to the newest version:

```
https://{username}.github.io/{repository}/assets/latest/images/logo.png
https://{username}.github.io/{repository}/assets/latest/docs/user-guide.pdf
https://{username}.github.io/{repository}/assets/latest/downloads/my-tool.zip
```

**For this repository:**
```
https://fadil369.github.io/docsmart-ai/assets/latest/images/logo.png
https://fadil369.github.io/docsmart-ai/assets/latest/docs/user-guide.pdf
https://fadil369.github.io/docsmart-ai/assets/latest/downloads/my-tool.zip
```

### Versioned URLs (Recommended for Production)

For immutable references tied to specific releases:

```
https://fadil369.github.io/docsmart-ai/assets/v1.0.0/images/logo.png
https://fadil369.github.io/docsmart-ai/assets/v1.2.3/docs/api-guide.pdf
https://fadil369.github.io/docsmart-ai/assets/v2.0.0/downloads/installer.exe
```

## 🏷️ Versioning Strategy

### Automatic Versioning

- **Main Branch Pushes**: Assets are deployed to `/assets/latest/`
- **Tagged Releases**: Assets are deployed to both `/assets/latest/` and `/assets/{version}/`

### Creating Versioned Releases

1. **Tag a release** following semantic versioning:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **Assets become available** at version-specific URLs:
   ```
   /assets/v1.0.0/images/
   /assets/v1.0.0/docs/
   /assets/v1.0.0/downloads/
   ```

### Best Practices

- **Use versioned URLs in production code** for stability
- **Use latest URLs for development** and documentation
- **Tag releases** when you want to freeze asset versions
- **Follow semantic versioning** (v1.0.0, v1.1.0, v2.0.0)

## 🌐 Custom Domain Support

To use a custom domain for assets:

1. **Set repository variable** `ASSETS_CUSTOM_DOMAIN` in GitHub repository settings
2. **Configure DNS** to point your domain to GitHub Pages
3. **Assets will be available** at your custom domain

## ⚡ Caching and Performance

### Cache Strategy

- **Versioned URLs**: Immutable and cache-friendly
- **Latest URLs**: Cache with shorter TTL for frequent updates
- **No custom headers**: GitHub Pages limitations, rely on URL versioning

### Optimization Tips

- **Use versioned URLs** in production for maximum caching efficiency
- **Optimize file sizes** before adding to repository
- **Use appropriate file formats** (WebP for images, compressed PDFs)

## 🔄 Deployment Workflow

### Automatic Deployment

The deployment workflow (`.github/workflows/publish-assets.yml`) triggers on:

- **Push to main branch** → Updates `/assets/latest/`
- **Tagged releases** → Creates `/assets/{version}/` + updates `/assets/latest/`
- **Manual dispatch** → Can be triggered manually from GitHub Actions

### Workflow Features

- ✅ Versioned asset deployment
- ✅ Custom domain support via repository variables
- ✅ Automatic index page generation
- ✅ Jekyll disabled (`.nojekyll`)
- ✅ Proper GitHub Pages permissions

## 📁 File Organization Examples

### Images
```
public/assets/images/
├── logos/
│   ├── logo.svg
│   ├── logo-dark.svg
│   └── favicon.ico
├── screenshots/
│   ├── dashboard.png
│   └── mobile-view.png
└── icons/
    ├── feature-1.svg
    └── feature-2.svg
```

### Documentation
```
public/assets/docs/
├── user-guides/
│   ├── getting-started.pdf
│   └── advanced-features.pdf
├── api/
│   ├── api-reference.pdf
│   └── changelog.md
└── legal/
    ├── privacy-policy.pdf
    └── terms-of-service.pdf
```

### Downloads
```
public/assets/downloads/
├── desktop-app/
│   ├── windows-installer.exe
│   ├── macos-installer.dmg
│   └── linux-installer.deb
├── templates/
│   ├── project-template.zip
│   └── config-examples.tar.gz
└── tools/
    ├── cli-tool.zip
    └── migration-script.sh
```

## 🚀 Getting Started

1. **Add your first asset**:
   ```bash
   # Create a sample image
   mkdir -p public/assets/images
   # Add your logo.png to public/assets/images/
   ```

2. **Commit and push**:
   ```bash
   git add public/assets/
   git commit -m "Add company logo"
   git push origin main
   ```

3. **Access your asset**:
   ```
   https://fadil369.github.io/docsmart-ai/assets/latest/images/logo.png
   ```

4. **Create a versioned release**:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

5. **Access versioned asset**:
   ```
   https://fadil369.github.io/docsmart-ai/assets/v1.0.0/images/logo.png
   ```

## 🔧 Technical Implementation

### Key Components

- **GitHub Actions Workflow**: `.github/workflows/publish-assets.yml`
- **Asset Directory**: `public/assets/`
- **Jekyll Disabled**: `.nojekyll` file
- **Documentation**: `docs/assets.md` (this file)

### Deployment Process

1. Workflow triggers on push/tag
2. Assets copied to appropriate version directories
3. Index page generated with available versions
4. Artifact uploaded to GitHub Pages
5. Site deployed and available immediately

### Troubleshooting

- **Assets not appearing**: Check GitHub Actions workflow logs
- **Custom domain issues**: Verify DNS configuration and repository variable
- **Version not created**: Ensure tags follow `v*` pattern (e.g., `v1.0.0`)
- **File not accessible**: Check file permissions and path structure

---

For questions or issues, please open an issue in the [GitHub repository](https://github.com/Fadil369/docsmart-ai).