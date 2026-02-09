const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Manually parse .env to be sure
const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim().replace(/^"(.*)"$/, '$1');
    }
});

async function testCloudinary() {
  console.log('Testing Cloudinary Credentials (Manual Parse)...');
  const cloudName = env.CLOUDINARY_CLOUD_NAME;
  const apiKey = env.CLOUDINARY_API_KEY;
  const apiSecret = env.CLOUDINARY_API_SECRET;

  console.log('Cloud Name:', cloudName);
  console.log('API Key:', apiKey);
  // console.log('API Secret:', apiSecret); // Hidden for security

  if (!cloudName || !apiKey || !apiSecret) {
      console.error('Missing credentials in .env!');
      return;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  try {
    console.log('Pinging Cloudinary...');
    const result = await cloudinary.api.ping();
    console.log('✅ Ping success:', result);
    
    console.log('Attempting signed upload...');
    const upload = await cloudinary.uploader.upload('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', {
        folder: 'ctg-collection/debug_test'
    });
    console.log('✅ Upload successful:', upload.secure_url);
  } catch (error) {
    console.error('❌ Cloudinary Test Failed!');
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.http_code);
    console.error('Full Error Object:', JSON.stringify(error, null, 2));
  }
}

testCloudinary();
