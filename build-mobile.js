const fs = require('fs');
const path = require('path');

const srcFiles = ['index.html', 'style.css', 'script.js'];
const destDir = path.join(__dirname, 'www');

// Ensure www exists
if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir);
    console.log('Created www directory');
}

// Copy files
srcFiles.forEach(file => {
    const src = path.join(__dirname, file);
    const dest = path.join(destDir, file);

    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log(`Copied ${file} to www/`);
    } else {
        console.error(`Warning: Source file ${file} not found!`);
    }
});

console.log('Build complete. Ready for Capacitor sync.');
