const fs = require('fs');
const path = require('path');

const deployDir = path.join(__dirname, 'deploy');
const standaloneDir = path.join(__dirname, '.next', 'standalone');
const staticSource = path.join(__dirname, '.next', 'static');
const staticDest = path.join(deployDir, '.next', 'static');
const publicSource = path.join(__dirname, 'public');
const publicDest = path.join(deployDir, 'public');

// Helper to copy directory recursive
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
if (!fs.existsSync(standaloneDir)) {
    console.error('❌ Error: .next/standalone folder not found!');
    console.error('👉 Please run "npm run build" first.');
    process.exit(1);
}

// 3. Copy Standalone
console.log('📦 Copying Standalone Build...');
copyDir(standaloneDir, deployDir);

// 4. Copy Static Assets
console.log('🎨 Copying Static Assets...');
copyDir(staticSource, staticDest);

// 5. Copy Public Assets
if (fs.existsSync(publicSource)) {
    console.log('📂 Copying Public folder...');
    copyDir(publicSource, publicDest);
}

console.log('✅ Deployment Folder Ready: ./deploy');
console.log('👉 Next Step: Zip the "deploy" folder and upload to cPanel!');
