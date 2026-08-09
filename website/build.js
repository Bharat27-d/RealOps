const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

async function runBuild() {
    try {
        // 1. Bundle and Minify CSS
        await esbuild.build({
            entryPoints: ['css/styles.css'],
            bundle: true,
            minify: true,
            outfile: 'dist/styles.min.css',
        });

        // 2. Concatenate and Minify JS (Order matters)
        const jsFiles = [
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
            'js/api.js',
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

        await esbuild.build({
            entryPoints: [tempBundlePath],
            minify: true,
            outfile: 'dist/bundle.min.js',
        });

        if (fs.existsSync(tempBundlePath)) {
            fs.unlinkSync(tempBundlePath);
        }

        // 3. Create production HTML template
        let baseHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

        // Replace CSS link
        baseHtml = baseHtml.replace('<link rel="stylesheet" href="css/styles.css">', '<link rel="stylesheet" href="/styles.min.css">');

        // Remove individual JS script tags
        const scriptRegex = /<script src="js\/.*?\.js"><\/script>\n?/g;
        baseHtml = baseHtml.replace(scriptRegex, '');

        // Inject bundled JS before </body>
        const timestamp = Date.now();
        baseHtml = baseHtml.replace('</body>', `  <script src="/bundle.min.js?v=${timestamp}"></script>\n</body>`);

        // Write root index.html
        fs.writeFileSync(path.join(distDir, 'index.html'), baseHtml);

        // 4. Generate route-specific HTML files for social crawlers & direct requests
        const routesMetadata = {
          '/about': {
            title: 'About — RealOps',
            description: 'Learn about RealOps, our mission, history, core values, and dedicated team providing professional convoy control in TruckersMP.',
            ogTitle: 'About — RealOps',
            ogDescription: 'Learn about RealOps, our mission, history, and dedicated convoy control team in TruckersMP.',
            canonical: 'https://realops.cc/about'
          },
          '/events': {
            title: 'Events — RealOps',
            description: 'Discover upcoming and past TruckersMP convoy control operations, community events, and joint convoys managed by RealOps.',
            ogTitle: 'Events & Operations — RealOps',
            ogDescription: 'Discover upcoming and past TruckersMP convoy control operations and community events managed by RealOps.',
            canonical: 'https://realops.cc/events'
          },
          '/team': {
            title: 'Team — RealOps',
            description: 'Meet the RealOps leadership, dispatchers, convoy controllers, media team, and staff members delivering top-tier operations.',
            ogTitle: 'Our Team — RealOps',
            ogDescription: 'Meet the RealOps leadership, dispatchers, convoy controllers, and staff members delivering top-tier operations.',
            canonical: 'https://realops.cc/team'
          },
          '/recruitment': {
            title: 'Recruitment — RealOps',
            description: 'Join the RealOps team. Apply to become a Convoy Controller, Event Manager, Media Team member, or Staff in TruckersMP.',
            ogTitle: 'Join the Team — RealOps Recruitment',
            ogDescription: 'Join RealOps! Apply to become a Convoy Controller, Event Manager, or Media Team member in TruckersMP.',
            canonical: 'https://realops.cc/recruitment'
          },
          '/contact': {
            title: 'Contact — RealOps',
            description: 'Get in touch with RealOps for convoy control bookings, event partnerships, feedback, or general inquiries.',
            ogTitle: 'Contact Us — RealOps',
            ogDescription: 'Get in touch with RealOps for convoy control bookings, event partnerships, or inquiries.',
            canonical: 'https://realops.cc/contact'
          },
          '/privacy': {
            title: 'Privacy Policy — RealOps',
            description: 'Read the RealOps Privacy Policy to understand how we collect, use, and protect your information.',
            ogTitle: 'Privacy Policy — RealOps',
            ogDescription: 'Read the RealOps Privacy Policy to understand how we protect your personal data.',
            canonical: 'https://realops.cc/privacy'
          },
          '/guidelines': {
            title: 'Community Guidelines — RealOps',
            description: 'Review the RealOps Community Guidelines and code of conduct for our events, Discord server, and operations.',
            ogTitle: 'Community Guidelines — RealOps',
            ogDescription: 'Review the RealOps Community Guidelines and code of conduct for our operations.',
            canonical: 'https://realops.cc/guidelines'
          },
          '/legal': {
            title: 'Legal — RealOps',
            description: 'RealOps legal notices, terms of service, and TruckersMP community disclaimers.',
            ogTitle: 'Legal & Terms — RealOps',
            ogDescription: 'RealOps legal notices, terms of service, and TruckersMP community disclaimers.',
            canonical: 'https://realops.cc/legal'
          }
        };

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

        for (const [routePath, meta] of Object.entries(routesMetadata)) {
          const dirName = routePath.replace(/^\//, '');
          const routeDir = path.join(distDir, dirName);
          if (!fs.existsSync(routeDir)) {
            fs.mkdirSync(routeDir, { recursive: true });
          }
          const routeHtml = generateRouteHtml(baseHtml, meta);
          fs.writeFileSync(path.join(routeDir, 'index.html'), routeHtml);
        }

        // 5. Copy static assets
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
        if (fs.existsSync(path.join(__dirname, 'sitemap.xml'))) {
            fs.copyFileSync(path.join(__dirname, 'sitemap.xml'), path.join(distDir, 'sitemap.xml'));
        }

        console.log('✅ Build complete! Production files and route-specific SEO pages generated in "dist".');
    } catch (err) {
        console.error('❌ Build failed:', err);
        process.exit(1);
    }
}

runBuild();
