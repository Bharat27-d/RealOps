const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
}

// 1. Bundle and Minify CSS
esbuild.build({
    entryPoints: ['css/styles.css'],
    bundle: true,
    minify: true,
    outfile: 'dist/styles.min.css',
}).catch(() => process.exit(1));

// 2. Concatenate and Minify JS (Order matters)
const jsFiles = [
    'js/pages/home.js',
    'js/pages/about.js',
    'js/pages/events.js',
    'js/pages/team.js',
    'js/pages/recruitment.js',
    'js/pages/stats.js',
    'js/pages/contact.js',
    'js/pages/privacy.js',
    'js/pages/guidelines.js',
    'js/pages/legal.js',
    'js/api.js',
    'js/app.js'
];

let combinedJs = '';
for (const file of jsFiles) {
    combinedJs += fs.readFileSync(path.join(__dirname, file), 'utf8') + '\n';
}

fs.writeFileSync(path.join(distDir, 'bundle.temp.js'), combinedJs);

esbuild.build({
    entryPoints: ['dist/bundle.temp.js'],
    minify: true,
    outfile: 'dist/bundle.min.js',
}).then(() => {
    fs.unlinkSync(path.join(distDir, 'bundle.temp.js'));
}).catch(() => process.exit(1));

// 3. Create a production index.html
let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

// Replace CSS link
html = html.replace('<link rel="stylesheet" href="css/styles.css">', '<link rel="stylesheet" href="styles.min.css">');

// Remove all individual JS scripts
const scriptRegex = /<script src="js\/.*?\.js"><\/script>\n/g;
html = html.replace(scriptRegex, '');

// Inject the bundled JS before closing body
html = html.replace('</body>', '  <script src="bundle.min.js?v=" + Date.now()></script>\n</body>');

fs.writeFileSync(path.join(distDir, 'index.html'), html);

// Copy static assets
const copyRecursiveSync = (src, dest) => {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    if (isDirectory) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest);
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

console.log('✅ Build complete! Production files are in the "dist" folder.');
