// Script to list available Gemini models
// Run with: node scripts/list-models.js

const API_KEY = process.env.GEMINI_API_KEY || 'YOUR_API_KEY_HERE';

async function listModels() {
    console.log('Fetching available models...\n');
    console.log('API Key:', API_KEY ? API_KEY.substring(0, 10) + '...' : 'NOT SET');

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
        );

        if (!response.ok) {
            const error = await response.text();
            console.error('Error:', response.status, error);
            return;
        }

        const data = await response.json();

        console.log('\n=== AVAILABLE MODELS ===\n');

        if (data.models) {
            data.models.forEach(model => {
                const supportsGenerate = model.supportedGenerationMethods?.includes('generateContent');
                console.log(`Model: ${model.name}`);
                console.log(`  Display: ${model.displayName}`);
                console.log(`  Supports generateContent: ${supportsGenerate ? 'YES ✓' : 'NO'}`);
                console.log('');
            });

            console.log('\n=== MODELS THAT SUPPORT generateContent ===\n');
            data.models
                .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
                .forEach(m => console.log(`  - ${m.name.replace('models/', '')}`));
        }
    } catch (err) {
        console.error('Failed:', err.message);
    }
}

listModels();
