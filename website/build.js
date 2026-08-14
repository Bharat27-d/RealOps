const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

const ROUTES_META = require('./js/routes-meta.js');

async function runBuild() {
  try {
    // 1. Bundle and Minify CSS
    await esbuild.build({
      entryPoints: ['css/styles.css'],
      bundle: true,
      minify: true,
      outfile: 'dist/styles.min.css',
    });
    fs.copyFileSync(path.join(distDir, 'styles.min.css'), path.join(__dirname, 'styles.min.css'));

    // 2. Concatenate and Minify JS (Order matters)
    const jsFiles = [
      'js/routes-meta.js',
      'js/api.js',
      'js/pages/home.js',
      'js/pages/about.js',
      'js/pages/events.js',
      'js/pages/team.js',
      'js/pages/recruitment.js',
      'js/pages/contact.js',
      'js/pages/privacy.js',
      'js/pages/guidelines.js',
      'js/pages/legal.js',
      'js/music-player.js',
      'js/app.js'
    ];

    let combinedJs = '';
    for (const file of jsFiles) {
      const fullPath = path.join(__dirname, file);
      if (fs.existsSync(fullPath)) {
        combinedJs += fs.readFileSync(fullPath, 'utf8') + '\n';
      }
    }

    const tempBundlePath = path.join(distDir, 'bundle.temp.js');
    fs.writeFileSync(tempBundlePath, combinedJs);

    // Use content hash for proper CDN cache busting
    const crypto = require('crypto');
    const jsHash = crypto.createHash('md5').update(combinedJs).digest('hex').slice(0, 8);
    const bundleFileName = `bundle.${jsHash}.min.js`;

    await esbuild.build({
      entryPoints: [tempBundlePath],
      minify: true,
      outfile: `dist/${bundleFileName}`,
    });
    // Also copy as bundle.min.js for backwards compatibility
    fs.copyFileSync(path.join(distDir, bundleFileName), path.join(distDir, 'bundle.min.js'));
    fs.copyFileSync(path.join(distDir, 'bundle.min.js'), path.join(__dirname, 'bundle.min.js'));

    if (fs.existsSync(tempBundlePath)) {
      fs.unlinkSync(tempBundlePath);
    }

    // 3. Create production HTML template
    let baseHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

    // Replace CSS link
    baseHtml = baseHtml.replace('<link rel="stylesheet" href="css/styles.css">', '<link rel="stylesheet" href="/styles.min.css">');

    // Remove individual JS script tags (with or without defer)
    const scriptRegex = /<script src="js\/.*?\.js"(\s+defer)?><\/script>\n?/g;
    baseHtml = baseHtml.replace(scriptRegex, '');

    // Inject content-hashed bundled JS before </body>
    baseHtml = baseHtml.replace('</body>', `  <script src="/${bundleFileName}"></script>\n</body>`);

    // Write root index.html to dist/
    fs.writeFileSync(path.join(distDir, 'index.html'), baseHtml);

    // 4. Generate route-specific HTML files for social crawlers & direct requests
    function generateRouteHtml(template, meta) {
      let routeHtml = template;

      // Replace Title
      routeHtml = routeHtml.replace(/<title>.*?<\/title>/i, `<title>${meta.title}</title>`);

      // Replace Description
      routeHtml = routeHtml.replace(/<meta\s+name="description"[\s\S]*?>/i, `<meta name="description"\n    content="${meta.description}">`);

      // Replace Canonical Link
      routeHtml = routeHtml.replace(/<link\s+rel="canonical"\s+href="[^"]*">/i, `<link rel="canonical" href="${meta.canonical}">`);

      // Replace OG URL
      routeHtml = routeHtml.replace(/<meta\s+property="og:url"\s+content="[^"]*">/i, `<meta property="og:url" content="${meta.canonical}">`);

      // Replace OG Title
      routeHtml = routeHtml.replace(/<meta\s+property="og:title"\s+content="[^"]*">/i, `<meta property="og:title" content="${meta.ogTitle}">`);

      // Replace OG Description
      routeHtml = routeHtml.replace(/<meta\s+property="og:description"[\s\S]*?>/i, `<meta property="og:description"\n    content="${meta.ogDescription}">`);

      // Replace Twitter URL
      routeHtml = routeHtml.replace(/<meta\s+name="twitter:url"\s+content="[^"]*">/i, `<meta name="twitter:url" content="${meta.canonical}">`);

      // Replace Twitter Title
      routeHtml = routeHtml.replace(/<meta\s+name="twitter:title"\s+content="[^"]*">/i, `<meta name="twitter:title" content="${meta.ogTitle}">`);

      // Replace Twitter Description
      routeHtml = routeHtml.replace(/<meta\s+name="twitter:description"[\s\S]*?>/i, `<meta name="twitter:description" content="${meta.ogDescription}">`);

      return routeHtml;
    }

    for (const [routePath, meta] of Object.entries(ROUTES_META)) {
      if (routePath === '/') continue; // Root is already index.html
      const dirName = routePath.replace(/^\//, '');
      const routeHtml = generateRouteHtml(baseHtml, meta);

      // 1. Write to dist/<route>/index.html
      const routeDir = path.join(distDir, dirName);
      if (!fs.existsSync(routeDir)) {
        fs.mkdirSync(routeDir, { recursive: true });
      }
      fs.writeFileSync(path.join(routeDir, 'index.html'), routeHtml);

      // 2. Also write to website/<route>/index.html in case server root points to website/
      const rootRouteDir = path.join(__dirname, dirName);
      if (!fs.existsSync(rootRouteDir)) {
        fs.mkdirSync(rootRouteDir, { recursive: true });
      }
      fs.writeFileSync(path.join(rootRouteDir, 'index.html'), routeHtml);
    }

    // 5. Generate Dynamic Sitemap with current date
    const today = new Date().toISOString().split('T')[0];
    const sitemapConfigs = {
      '/': { freq: 'weekly', priority: '1.0' },
      '/events': { freq: 'daily', priority: '0.9' },
      '/about': { freq: 'monthly', priority: '0.8' },
      '/recruitment': { freq: 'weekly', priority: '0.8' },
      '/team': { freq: 'weekly', priority: '0.7' },
      '/contact': { freq: 'monthly', priority: '0.6' },
      '/privacy': { freq: 'yearly', priority: '0.3' },
      '/guidelines': { freq: 'yearly', priority: '0.3' },
      '/legal': { freq: 'yearly', priority: '0.3' }
    };

    let sitemapXml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    for (const [route, meta] of Object.entries(ROUTES_META)) {
      const config = sitemapConfigs[route] || { freq: 'monthly', priority: '0.5' };
      sitemapXml += `  <url>\n    <loc>${meta.canonical}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${config.freq}</changefreq>\n    <priority>${config.priority}</priority>\n  </url>\n`;
    }
    sitemapXml += '</urlset>\n';

    fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemapXml);
    fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml);

    // 6. Copy static assets
    const copyRecursiveSync = (src, dest) => {
      if (!fs.existsSync(src)) return;
      const stat = fs.statSync(src);
      if (stat.isDirectory()) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        fs.readdirSync(src).forEach((childItemName) => {
          copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
        });
      } else {
        fs.copyFileSync(src, dest);
      }
    };

    copyRecursiveSync(path.join(__dirname, 'assets'), path.join(distDir, 'assets'));
    if (fs.existsSync(path.join(__dirname, 'sw.js'))) {
      fs.copyFileSync(path.join(__dirname, 'sw.js'), path.join(distDir, 'sw.js'));
    }
    if (fs.existsSync(path.join(__dirname, 'manifest.json'))) {
      fs.copyFileSync(path.join(__dirname, 'manifest.json'), path.join(distDir, 'manifest.json'));
    }
    if (fs.existsSync(path.join(__dirname, 'robots.txt'))) {
      fs.copyFileSync(path.join(__dirname, 'robots.txt'), path.join(distDir, 'robots.txt'));
    }

    console.log('✅ Build complete! Production files and route-specific SEO pages generated in "dist".');
  } catch (err) {
    console.error('❌ Build failed:', err);
    process.exit(1);
  }
}

runBuild();
