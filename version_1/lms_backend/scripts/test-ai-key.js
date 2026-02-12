/**
 * Quick script to test if ANTHROPIC_API_KEY is loaded and valid
 * Run: node scripts/test-ai-key.js
 */

require('dotenv').config();
const { createAIService } = require('../src/services/ai');

async function testAIKey() {
  console.log('Testing Anthropic API Key...\n');
  
  // Check if key is loaded
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('❌ ANTHROPIC_API_KEY is not set in .env file');
    process.exit(1);
  }
  
  console.log(`✅ API Key found: ${apiKey.substring(0, 20)}...${apiKey.substring(apiKey.length - 10)}`);
  console.log(`   Model: ${process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022'}`);
  console.log(`   Max Tokens: ${process.env.ANTHROPIC_MAX_TOKENS || 2048}\n`);
  
  // Try to create AI service
  try {
    const ai = createAIService();
    console.log('✅ AI Service created successfully\n');
    
    // Test with a simple message
    console.log('Testing AI chat with simple message...');
    const response = await ai.chat('Hello, can you respond?', { type: 'chatbot' });
    console.log('✅ AI Response received:');
    console.log(`   "${response.substring(0, 100)}${response.length > 100 ? '...' : ''}"\n`);
    console.log('✅ API Key is working correctly!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error testing AI service:');
    console.error(`   Code: ${err.code || 'N/A'}`);
    console.error(`   Message: ${err.message}`);
    if (err.status) {
      console.error(`   Status: ${err.status}`);
    }
    if (err.response) {
      console.error(`   Response: ${JSON.stringify(err.response, null, 2)}`);
    }
    process.exit(1);
  }
}

testAIKey();
