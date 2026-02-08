
const https = require('https');
const fs = require('fs');
require('dotenv').config();

const LOG_FILE = 'version-test.log';
const log = (msg) => fs.appendFileSync(LOG_FILE, msg + '\n');
fs.writeFileSync(LOG_FILE, 'Starting Version Test...\n');

const API_KEY = process.env.GOOGLE_AI_API_KEY ? process.env.GOOGLE_AI_API_KEY.trim() : null;
if (!API_KEY) { log('No Key'); process.exit(1); }

function testEndpoint(version) {
    const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/${version}/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    };

    const req = https.request(options, (res) => {
        let body = '';
        res.on('data', c => body += c);
        res.on('end', () => {
            log(`[${version}] Status: ${res.statusCode}`);
            if (res.statusCode !== 200) {
                try {
                    const err = JSON.parse(body);
                    log(`[${version}] Error: ${err.error?.message || body}`);
                } catch (e) { log(`[${version}] Raw: ${body}`); }
            } else {
                log(`[${version}] Success!`);
            }
        });
    });

    const data = JSON.stringify({ contents: [{ parts: [{ text: "Hi" }] }] });
    req.write(data);
    req.end();
}

log('Testing Gemini 2.5 on v1 and v1beta...');
testEndpoint('v1');
testEndpoint('v1beta');
