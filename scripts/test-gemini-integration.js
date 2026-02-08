
const https = require('https');
require('dotenv').config();

const API_KEY = process.env.GOOGLE_AI_API_KEY ? process.env.GOOGLE_AI_API_KEY.trim() : null;

if (!API_KEY) {
    console.error('❌ GOOGLE_AI_API_KEY is not set in .env file');
    process.exit(1);
}

console.log(`🔑 Key found: ${API_KEY.substring(0, 5)}...${API_KEY.substring(API_KEY.length - 5)}`);

const data = JSON.stringify({
    contents: [{
        parts: [{
            text: "Hello, are you working? Reply with 'Yes, I am Gemini!'"
        }]
    }]
});

const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('📡 Sending request to Google Gemini API...');

const req = https.request(options, (res) => {
    console.log(`📥 Status Code: ${res.statusCode}`);
    
    let responseBody = '';

    res.on('data', (chunk) => {
        responseBody += chunk;
    });

    res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
                const parsed = JSON.parse(responseBody);
                const reply = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                console.log('✅ Success! AI Reply:', reply);
            } catch (e) {
                console.error('❌ Failed to parse response:', responseBody);
            }
        } else {
            console.error('❌ API Error:', responseBody);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Network Error:', error);
});

req.write(data);
req.end();
