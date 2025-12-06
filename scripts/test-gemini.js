const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

const MODELS_TO_TEST = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-exp',
    'gemini-1.5-flash',
    'gemini-1.5-flash-001',
    'gemini-1.5-flash-002',
    'gemini-1.5-pro',
    'gemini-1.5-pro-001',
    'gemini-pro',
];

async function testModels() {
    console.log('API Key found:', process.env.GEMINI_API_KEY ? 'Yes (starts with ' + process.env.GEMINI_API_KEY.substring(0, 8) + '...)' : 'NO!');

    if (!process.env.GEMINI_API_KEY) {
        console.error('GEMINI_API_KEY is not set in .env.local');
        return;
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    for (const modelName of MODELS_TO_TEST) {
        console.log(`\nTesting model: ${modelName}`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('Say "Hello" in one word.');
            console.log(`  ✓ SUCCESS: ${result.response.text().substring(0, 50)}`);
        } catch (error) {
            console.log(`  ✗ FAILED: ${error.message}`);
        }
    }
}

testModels();
