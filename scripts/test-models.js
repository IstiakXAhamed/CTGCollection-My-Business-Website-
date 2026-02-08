const FALLBACK_MODELS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
  { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite' },
  { id: 'gemini-3-flash', name: 'Gemini 3 Flash' },
  { id: 'gemma-3-27b-it', name: 'Gemma 3 27B' },
  { id: 'gemma-3-12b-it', name: 'Gemma 3 12B' },
  { id: 'gemma-3-4b-it', name: 'Gemma 3 4B' },
  { id: 'gemma-3-1b-it', name: 'Gemma 3 1B' },
  { id: 'gemma-3-2b-it', name: 'Gemma 3 2B' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
];

async function testModels() {
  const apiKey = process.env.GOOGLE_AI_API_KEY; // Ensure this is set or replace manually for test
  if (!apiKey) {
    console.error('API Key not found in env');
    return;
  }

  console.log('🧪 Testing AI Model Availability...');

  for (const model of FALLBACK_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model.id}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Hello" }] }],
          generationConfig: { maxOutputTokens: 10 }
        })
      });

      if (response.ok) {
        console.log(`✅ [${model.name}] -> AVAILABLE (200 OK)`);
      } else {
        console.log(`❌ [${model.name}] -> FAILED (${response.status} ${response.statusText})`);
      }
    } catch (e) {
      console.log(`⚠️ [${model.name}] -> ERROR (${e.message})`);
    }
  }
}

// Mocking fetch for node environment if needed, but assuming simple node
// Actually, fetch is global in Node 18+.
testModels();
