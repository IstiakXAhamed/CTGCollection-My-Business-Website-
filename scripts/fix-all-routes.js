const fs = require('fs');
const path = require('path');

function findRouteFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      findRouteFiles(fullPath, files);
    } else if (item === 'route.ts') {
      files.push(fullPath);
    }
  }
  return files;
}

function fixRouteFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Skip if already has dynamic export
  if (content.includes("export const dynamic")) {
    console.log(`Skipped (already has): ${filePath}`);
    return false;
  }
  
  // Find last import line
  const lines = content.split('\n');
  let lastImportIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ')) {
      lastImportIndex = i;
    }
  }
  
  if (lastImportIndex >= 0) {
    // Insert after last import
    lines.splice(lastImportIndex + 1, 0, '', "export const dynamic = 'force-dynamic'");
    fs.writeFileSync(filePath, lines.join('\n'));
    console.log(`Fixed: ${filePath}`);
    return true;
  }
  
  return false;
}

// Main
const apiDir = path.join(__dirname, '..', 'app', 'api');
const routeFiles = findRouteFiles(apiDir);

console.log(`Found ${routeFiles.length} route files\n`);

let fixed = 0;
let skipped = 0;

for (const file of routeFiles) {
  if (fixRouteFile(file)) {
    fixed++;
  } else {
    skipped++;
  }
}

console.log(`\n✅ Done!`);
console.log(`Fixed: ${fixed} files`);
console.log(`Skipped: ${skipped} files (already had dynamic export)`);
