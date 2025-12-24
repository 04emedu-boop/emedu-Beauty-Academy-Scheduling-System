import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');
const assetsDir = path.join(distDir, 'assets');
const outputFile = path.resolve('docs', 'Frontend.html');

console.log('Building gas-compatible frontend...');

// 1. Read index.html
let html = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');

// 2. Find and inline JS
const jsFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith('.js'));
jsFiles.forEach(file => {
    const content = fs.readFileSync(path.join(assetsDir, file), 'utf-8');
    const scriptTag = /<script.*src=".*assets\/index-.*.js".*><\/script>/;
    html = html.replace(scriptTag, `<script type="module">${content}</script>`);
});

// 3. Fix other assets (like favicon if any, though GAS handles it poorly)
html = html.replace('/favicon.png', 'https://raw.githubusercontent.com/04emedu-boop/emedu-Beauty-Academy-Scheduling-System/main/public/favicon.png');

// 4. Save to docs/Frontend.html
fs.writeFileSync(outputFile, html);

console.log(`Successfully created single-file build: ${outputFile}`);
