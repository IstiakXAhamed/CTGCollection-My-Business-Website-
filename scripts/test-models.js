
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env' });

async function listModels() {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    console.error("No API key found in .env");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  console.log("Checking available models...");
  
  try {
      // There isn't a direct "listModels" in the simple usage, but we can try to instantiate models and run a basic prompt.
      // Actually, the API supports list models via REST, but the SDK hiding it?
      // Let's just try to generate content with the suspect models.
      
      const modelsToTest = ["gemini-2.5-flash", "gemini-2.0-flash-exp", "gemini-1.5-flash", "gemini-1.5-pro"];
      
      for (const modelName of modelsToTest) {
          console.log(`\nTesting model: ${modelName}`);
          try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            const response = await result.response;
            console.log(`✅ ${modelName} is WORKING. Response: ${response.text()}`);
          } catch (error) {
            console.log(`❌ ${modelName} FAILED. Error: ${error.message}`);
          }
      }
      
  } catch (error) {
    console.error("Global error:", error);
  }
}

listModels();
