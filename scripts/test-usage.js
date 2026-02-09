const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: (process.env.CLOUDINARY_CLOUD_NAME || '').trim(),
  api_key: (process.env.CLOUDINARY_API_KEY || '').trim(),
  api_secret: (process.env.CLOUDINARY_API_SECRET || '').trim(),
});

async function test() {
  console.log('Testing Cloudinary Account Info...');
  try {
    const result = await cloudinary.api.usage();
    console.log('✅ Connection Success! Account Usage Data:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Connection Failed!');
    console.error('Message:', error.message);
    console.error('Code:', error.http_code);
  }
}

test();
