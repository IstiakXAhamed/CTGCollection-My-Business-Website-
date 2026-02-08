
const fs = require('fs');
const path = require('path');

const files = [
  'scripts/list-available-models.js',
  'scripts/test-models.js',
  'scripts/test-user-claims.js',
  'scripts/verify-models-simple.js',
  'scripts/test-gemini-2.5.js',
  'scripts/test-gemini-integration.js',
  'scripts/test-gemini-parsing.ts',
  'scripts/test-versions.js'
];

files.forEach(file => {
  const fullPath = path.resolve(process.cwd(), file);
  try {
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`Deleted: ${file}`);
    } else {
      console.log(`Already gone: ${file}`);
    }
  } catch (err) {
    console.error(`Error deleting ${file}: ${err.message}`);
  }
});
