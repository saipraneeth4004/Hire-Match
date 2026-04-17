const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})

/**
 * @description Standardizes and repairs the AI response to match the Mongoose schema perfectly.
 * This handles common AI "hallucinations" like wrong key names or flat strings.
 */
function repairResult(rawResult) {
    if (typeof rawResult !== 'object' || rawResult === null) return {};

    // 1. Normalize Keys (snake_case -> camelCase) and common aliases
    const keyMap = {
        'technical_questions': 'technicalQuestions',
        'behavioral_questions': 'behavioralQuestions',
        'skill_gaps': 'skillGaps',
        'preparation_plan': 'preparationPlan',
        'roadmap': 'preparationPlan',
        'preparation_roadmap': 'preparationPlan',
        'match_score': 'matchScore',
        'job_title': 'title'
    };

    const result = {};
    Object.keys(rawResult).forEach(key => {
        const normalizedKey = keyMap[key] || key;
        result[normalizedKey] = rawResult[key];
    });

    // 2. Helper to ensure an array of objects
    const ensureArrayOfObjects = (data, fields, defaults) => {
        // If it's a single string, wrap it
        if (typeof data === 'string') {
            data = [data];
        }
        
        // If it's not an array at all, return empty
        if (!Array.isArray(data)) return [];

        return data.map((item, index) => {
            // If item is a string, wrap it into the first field
            if (typeof item === 'string') {
                return { ...defaults, [fields[0]]: item };
            }
            // If item is an object, ensure all fields are present
            if (typeof item === 'object' && item !== null) {
                const obj = {};
                fields.forEach(f => {
                    obj[f] = item[f] || item[f.toLowerCase()] || defaults[f] || "N/A";
                });
                return obj;
            }
            return null;
        }).filter(Boolean);
    };

    // 3. Apply repairs to each section
    result.technicalQuestions = ensureArrayOfObjects(
        result.technicalQuestions, 
        ['question', 'intention', 'answer'], 
        { intention: "Evaluate technical depth", answer: "Consult documentation for specific implementation details." }
    );

    result.behavioralQuestions = ensureArrayOfObjects(
        result.behavioralQuestions, 
        ['question', 'intention', 'answer'], 
        { intention: "Evaluate soft skills", answer: "Use the STAR method (Situation, Task, Action, Result)." }
    );

    result.skillGaps = ensureArrayOfObjects(
        result.skillGaps, 
        ['skill', 'severity'], 
        { severity: "medium" }
    );

    // 4. Special handling for Preparation Plan (Roadmap)
    if (typeof result.preparationPlan === 'string') {
        result.preparationPlan = [{ day: 1, focus: result.preparationPlan, tasks: [] }];
    } else if (Array.isArray(result.preparationPlan)) {
        result.preparationPlan = result.preparationPlan.map((p, i) => {
            if (typeof p === 'string') return { day: i + 1, focus: p, tasks: [] };
            if (typeof p === 'object' && p !== null) {
                return {
                    day: Number(p.day || p.Day || i + 1),
                    focus: p.focus || p.topic || p.Focus || "Key Study Area",
                    tasks: Array.isArray(p.tasks || p.Tasks) ? (p.tasks || p.Tasks) : []
                };
            }
            return null;
        }).filter(Boolean);
    } else {
        result.preparationPlan = [];
    }

    // 5. Ensure matchScore is a number
    result.matchScore = Number(result.matchScore) || 0;
    if (result.matchScore > 100) result.matchScore = 100;

    return result;
}

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    const systemInstruction = `You are an expert technical recruiter. 
    Analyze the candidate for the role and return ONLY a JSON object.
    
    JSON TEMPLATE:
    {
      "matchScore": (number 0-100),
      "technicalQuestions": [
        { "question": "...", "intention": "...", "answer": "..." }
      ],
      "behavioralQuestions": [
        { "question": "...", "intention": "...", "answer": "..." }
      ],
      "skillGaps": [
        { "skill": "...", "severity": "low|medium|high" }
      ],
      "preparationPlan": [
        { "day": 1, "focus": "...", "tasks": ["...", "..."] }
      ],
      "title": "Exact Job Title"
    }

    Rules:
    - Return ONLY the JSON object. 
    - You MUST provide EXACTLY 7 days in the preparationPlan. No more, no less.
    - If the candidate is highly qualified, focus on advanced architecture and system design for the remaining days.
    - No markdown formatting, no conversational filler.
    - Focus on the MERN stack and AI/ML requirements if mentioned.`;

    const resumeHeader = resume ? "RESUME CONTENT:" : "RESUME CONTENT: (No resume provided - focus entirely on self-description)";
    const prompt = `${resumeHeader}\n${resume}\n\nSELF DESCRIPTION:\n${selfDescription}\n\nJOB DESCRIPTION:\n${jobDescription}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                systemInstruction,
                temperature: 0.1,
            }
        });

        let text = response.text;
        
        // Robust JSON extraction
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start === -1 || end === -1) {
            throw new Error("AI failed to provide a valid JSON structure.");
        }
        text = text.substring(start, end + 1);

        let rawResult = JSON.parse(text);
        
        // Repair and standardize the result
        const finalResult = repairResult(rawResult);
        
        return finalResult;

    } catch (error) {
        console.error("AI Generation Error:", error);
        throw error;
    }
}

module.exports = generateInterviewReport;