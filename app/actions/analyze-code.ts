
'use server';

import { model } from '@/lib/gemini';
import { SYSTEM_PROMPT } from '@/lib/prompts';

interface AnalysisResult {
    security_issues: any[];
    cost_issues: any[];
    estimated_monthly_waste_usd: number;
    fixer_prompts: string[];
    raw?: string;
    error?: string;
}

export async function analyzeCode(fileContent: string): Promise<AnalysisResult> {

    // Safety check for API Key
    if (!process.env.GEMINI_API_KEY) {
        return {
            security_issues: [],
            cost_issues: [],
            estimated_monthly_waste_usd: 0,
            fixer_prompts: [],
            error: "Missing GEMINI_API_KEY in environment variables."
        };
    }

    try {
        console.log('Sending to Gemini...');
        const result = await model.generateContent([
            SYSTEM_PROMPT,
            `Here is the codebase:\n\n${fileContent}`
        ]);

        const response = result.response;
        let text = response.text();

        console.log("Gemini Raw Response:", text.substring(0, 100) + "...");

        // Cleanup: Remove markdown code blocks if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        // Attempt Parse
        try {
            const data = JSON.parse(text);
            return data;
        } catch (jsonError) {
            console.error("JSON Parse Error:", jsonError);
            console.log("Failed Text:", text);
            return {
                security_issues: [],
                cost_issues: [],
                estimated_monthly_waste_usd: 0,
                fixer_prompts: [],
                error: "Failed to parse AI response. Try again."
            };
        }

    } catch (error: any) {
        console.error("AI Analysis Failed:", error);
        return {
            security_issues: [],
            cost_issues: [],
            estimated_monthly_waste_usd: 0,
            fixer_prompts: [],
            error: `Analysis failed: ${error.message || 'Unknown error'}`
        };
    }
}
