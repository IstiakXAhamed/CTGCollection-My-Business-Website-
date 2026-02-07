const fs = require('fs');
const path = require('path');

const deployDir = path.join(__dirname, 'deploy');
const standaloneDir = path.join(__dirname, '.next', 'standalone');
const staticSource = path.join(__dirname, '.next', 'static');
const staticDest = path.join(deployDir, '.next', 'static');
const publicSource = path.join(__dirname, 'public');
const publicDest = path.join(deployDir, 'public');

// Helper to copy directory recursive
function copyDir(src, dest, exclude = []) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        if (exclude.includes(entry.name)) continue;

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

// 3. Copy Standalone (EXCLUDING node_modules to avoid Windows/Linux binary mismatch)
console.log('📦 Copying Standalone Build (skipping node_modules)...');
copyDir(standaloneDir, deployDir, ['node_modules']);

// 4. Copy Static Assets
console.log('🎨 Copying Static Assets...');
copyDir(staticSource, staticDest);

// 5. Copy Public Assets
if (fs.existsSync(publicSource)) {
    console.log('📂 Copying Public folder...');
    copyDir(publicSource, publicDest);
}

console.log('✅ Deployment Folder Ready: ./deploy');

// 5.5 Copy .env (Crucial for DB connection)
const envSource = path.join(__dirname, '.env');
const envDest = path.join(deployDir, '.env');

if (fs.existsSync(envSource)) {
    console.log('🔑 Copying .env file to deploy folder...');
    fs.copyFileSync(envSource, envDest);
} else {
    console.warn('⚠️  WARNING: .env file not found! Please manually upload it to cPanel.');
}

// 6. Manual Copy Steps REMOVED
// We now rely on `npm install` on the server to get the correct Linux binaries for Prisma and dotenv.
// This prevents the "500 Internal Server Error" caused by uploading Windows binaries.

// 6.6 Copy Prisma Schema (REQUIRED for postinstall generate)

// 6.6 Copy Prisma Schema (REQUIRED for postinstall generate)
const prismaDirSource = path.join(__dirname, 'prisma');
const prismaDirDest = path.join(deployDir, 'prisma');

if (fs.existsSync(prismaDirSource)) {
    console.log('🐘 Copying Prisma Schema folder...');
    copyDir(prismaDirSource, prismaDirDest);
} else {
    console.warn('⚠️  Prisma folder not found!');
}


// 7. INJECT DOTENV into server.js (Use .env file on server)
console.log('💉 Injecting .env support into server.js...');
const serverJsPath = path.join(deployDir, 'server.js');
if (fs.existsSync(serverJsPath)) {
    let serverContent = fs.readFileSync(serverJsPath, 'utf8');
    // Prepend dotenv config
    if (!serverContent.includes('dotenv')) {
        serverContent = "try { require('dotenv').config({ path: __dirname + '/.env' }); } catch (e) { console.log('Env load failed:', e.message); }\n" + serverContent;
        fs.writeFileSync(serverJsPath, serverContent);
        console.log('✅ server.js patched! It will now read .env file on cPanel.');
    }
} else {
    console.warn('⚠️  server.js not found in deploy folder. This might look like a failed build copy.');
}

console.log('👉 Next Step: Run "git push cpanel main" to deploy!');
