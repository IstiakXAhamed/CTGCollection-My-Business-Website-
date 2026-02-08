
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

const API_KEY = envVars.GOOGLE_AI_API_KEY;

if (!API_KEY) {
    console.error('❌ GOOGLE_AI_API_KEY is not set');
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

process.stdout.write(`Fetching models with API Key... `);

https.get(url, (res) => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => {
        if (res.statusCode === 200) {
            console.log("✅ SUCCESS");
            try {
                const data = JSON.parse(body);
                const modelNames = data.models.map(m => m.name.split('/').pop());
                console.log("\nAvailable Models:");
                modelNames.forEach(name => console.log(`- ${name}`));
                
                if (modelNames.includes('gemini-2.5-flash')) {
                    console.log("\nFound gemini-2.5-flash!");
                } else {
                    console.log("\ngemini-2.5-flash NOT found in list.");
                }
            } catch (e) {
                console.log("Error parsing JSON:", e.message);
            }
        } else {
            console.log(`❌ FAILED (${res.statusCode})`);
            console.log("Body:", body);
        }
    });
}).on('error', (e) => {
    console.log("❌ Network Error:", e.message);
});
