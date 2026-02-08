
const fs = require('fs');
const path = require('path');
const https = require('https');

// Manually load .env since we might not have dotenv cli
function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const data = fs.readFileSync(envPath, 'utf8');
      data.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim().replace(/^["']|["']$/g, '');
          process.env[key] = value;
        }
      });
      console.log("✅ Loaded .env file");
    } else {
      console.log("⚠️ No .env file found");
    }
  } catch (e) {
    console.error("Error loading .env:", e);
  }
}

loadEnv();

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
const apiKey = process.env.GOOGLE_AI_API_KEY;

if (!apiKey) {
  console.error('❌ GOOGLE_AI_API_KEY is missing!');
  process.exit(1);
}

console.log('🔑 API Key found (length):', apiKey.length);

const data = JSON.stringify({
  contents: [{ parts: [{ text: "Hello, are you working?" }] }]
});

const url = `${GEMINI_API_URL}?key=${apiKey}`;

console.log('🚀 Sending request to Gemini...', url.replace(apiKey, 'HIDDEN'));

const req = https.request(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  console.log(`📡 Status Code: ${res.statusCode}`);
  let responseBody = '';

  res.on('data', (chunk) => {
    responseBody += chunk;
  });

  res.on('end', () => {
    try {
        const json = JSON.parse(responseBody);
        if (json.error) {
            console.error("❌ API Error:", JSON.stringify(json.error, null, 2));
        } else if (json.candidates && json.candidates[0].content) {
            console.log("✅ Success! Response:", json.candidates[0].content.parts[0].text);
        } else {
            console.log("⚠️ Unexpected Response structure:", responseBody);
        }
    } catch (e) {
        console.error("❌ Failed to parse response:", responseBody);
    }
  });
});

req.on('error', (error) => {
  console.error("❌ Network Error:", error);
});

req.write(data);
req.end();
