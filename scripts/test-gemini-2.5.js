
const https = require('https');
const fs = require('fs');
require('dotenv').config();

const LOG_FILE = 'gemini-test-result.txt';
const log = (msg) => fs.appendFileSync(LOG_FILE, msg + '\n');

// Clear log
fs.writeFileSync(LOG_FILE, 'Starting Test...\n');

const API_KEY = process.env.GOOGLE_AI_API_KEY ? process.env.GOOGLE_AI_API_KEY.trim() : null;

if (!API_KEY) {
    log('❌ GOOGLE_AI_API_KEY is not set');
    process.exit(1);
}

log(`Key found (length): ${API_KEY.length}`);

// Test Configuration for Gemini 2.5 Flash
const HOSTNAME = 'generativelanguage.googleapis.com';
const PATH = `/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

log(`Testing URL: https://${HOSTNAME}${PATH.replace(API_KEY, 'HIDDEN')}`);

const data = JSON.stringify({
    contents: [{
        parts: [{
            text: "Ping"
        }]
    }]
});

const options = {
    hostname: HOSTNAME,
    path: PATH,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = https.request(options, (res) => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => {
        log(`Status Code: ${res.statusCode}`);
        if (res.statusCode === 200) {
            log('✅ SUCCESS! Model is reachable.');
            try {
               const parsed = JSON.parse(body);
               log(`Response: ${parsed.candidates?.[0]?.content?.parts?.[0]?.text}`);
            } catch(e) { log('Error parsing success body'); }
        } else {
            log('❌ FAILED.');
            log(`Error Body: ${body}`);
        }
    });
});

req.on('error', e => log(`Network Error: ${e.message}`));
req.write(data);
req.end();
