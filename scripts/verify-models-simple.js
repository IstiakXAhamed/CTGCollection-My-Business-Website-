
const https = require('https');
const fs = require('fs');
const path = require('path');

// Manually load .env
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const data = fs.readFileSync(envPath, 'utf8');
  data.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
    }
  });
}

const API_KEY = process.env.GOOGLE_AI_API_KEY;

if (!API_KEY) {
    console.error('❌ GOOGLE_AI_API_KEY is not set');
    process.exit(1);
}

const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash-exp'];

async function testModel(modelName) {
    return new Promise((resolve) => {
        const data = JSON.stringify({
            contents: [{ parts: [{ text: "Hello" }] }]
        });

        const options = {
            hostname: 'generativelanguage.googleapis.com',
            path: `/v1beta/models/${modelName}:generateContent?key=${API_KEY}`,
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
                if (res.statusCode === 200) {
                    console.log(`✅ ${modelName}: SUCCESS`);
                    resolve(true);
                } else {
                    console.log(`❌ ${modelName}: FAILED (${res.statusCode})`);
                    // console.log(body);
                    resolve(false);
                }
            });
        });

        req.on('error', (e) => {
            console.log(`❌ ${modelName}: ERROR (${e.message})`);
            resolve(false);
        });

        req.write(data);
        req.end();
    });
}

async function run() {
    console.log("Testing models...");
    for (const model of models) {
        await testModel(model);
    }
}

run();
