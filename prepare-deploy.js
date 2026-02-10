const fs = require('fs');
const path = require('path');

const deployDir = path.join(__dirname, 'deploy');
const nextDir = path.join(__dirname, '.next');
const publicDir = path.join(__dirname, 'public');
const prismaDir = path.join(__dirname, 'prisma');

// Helper to copy directory recursively
function copyDir(src, dest) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

console.log('🚀 Starting Pre-Deployment Setup...');

// 1. Clean deploy dir
if (fs.existsSync(deployDir)) {
    console.log('🗑️  Cleaning existing deploy folder...');
    fs.rmSync(deployDir, { recursive: true, force: true });
}
fs.mkdirSync(deployDir);

// 2. Check if build exists
if (!fs.existsSync(nextDir)) {
    console.error('❌ Error: .next folder not found!');
    console.error('👉 Please run "npm run build" first.');
    process.exit(1);
}

// 3. Copy .next build
console.log('📦 Copying .next build folder...');
copyDir(nextDir, path.join(deployDir, '.next'));

// 4. Copy public assets
if (fs.existsSync(publicDir)) {
    console.log('📂 Copying public folder...');
    copyDir(publicDir, path.join(deployDir, 'public'));
}

// 5. Copy prisma schema
if (fs.existsSync(prismaDir)) {
    console.log('🐘 Copying Prisma folder...');
    copyDir(prismaDir, path.join(deployDir, 'prisma'));
}

// 6. Copy essential files
console.log('📄 Copying configuration files...');
const essentialFiles = ['package.json', '.env', 'next.config.js'];
essentialFiles.forEach(file => {
    const src = path.join(__dirname, file);
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, path.join(deployDir, file));
        console.log(`✅ Copied: ${file}`);
    }
});

console.log('\n✅ Deployment folder ready: ./deploy');

