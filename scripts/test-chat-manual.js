
const { generateChatResponse } = require('../lib/gemini-ai');
require('dotenv').config();

async function testChat() {
  console.log("Testing AI Chat...");
  try {
    const response = await generateChatResponse("Hello, I need help finding a saree.", { previousMessages: [] });
    console.log("Response:", response);
  } catch (error) {
    console.error("Test Error:", error);
  }
}

testChat();
