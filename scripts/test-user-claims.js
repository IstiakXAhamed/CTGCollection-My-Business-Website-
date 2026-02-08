
const https = require('https');
const fs = require('fs');
const path = require('path');

// Manually load .env
const envPath = path.resolve(process.cwd(), '.env');
const envVars = {};
if (fs.existsSync(envPath)) {
  const data = fs.readFileSync(envPath, 'utf8');
  data.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        envVars[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
    }
  });
}

const API_KEY = envVars.GOOGLE_AI_API_KEY || process.env.GOOGLE_AI_API_KEY;

if (!API_KEY) {
    console.error('❌ GOOGLE_AI_API_KEY is not set');
    process.exit(1);
}

// User claims these work, so let's test them explicitly alongside known ones
const models = [
    'gemini-2.5-flash', 
    'gemini-3-pro', 
    'gemini-1.5-flash', 
    'gemini-1.5-pro'
];

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
                    // Try to parse error message for more detail
                    try {
                        const err = JSON.parse(body);
                        console.log(`   Reason: ${err.error?.message || body.substring(0, 100)}`);
                    } catch (e) {
                        console.log(`   Reason: ${body.substring(0, 100)}...`);
                    }
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
    console.log(`Testing models with API Key ending in ...${API_KEY.slice(-4)}`);
    for (const model of models) {
        await testModel(model);
    }
}

run();
