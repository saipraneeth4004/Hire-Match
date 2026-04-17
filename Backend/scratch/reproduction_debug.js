// Optimized Repair Logic from ai.service.js
function repairResult(rawResult) {
    if (typeof rawResult !== 'object' || rawResult === null) return {};

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

    const ensureArrayOfObjects = (data, fields, defaults) => {
        if (typeof data === 'string') data = [data];
        if (!Array.isArray(data)) return [];
        return data.map((item, index) => {
            if (typeof item === 'string') return { ...defaults, [fields[0]]: item };
            if (typeof item === 'object' && item !== null) {
                const obj = {};
                fields.forEach(f => obj[f] = item[f] || item[f.toLowerCase()] || defaults[f] || "N/A");
                return obj;
            }
            return null;
        }).filter(Boolean);
    };

    result.technicalQuestions = ensureArrayOfObjects(result.technicalQuestions, ['question', 'intention', 'answer'], { intention: "Evaluate depth", answer: "N/A" });
    result.behavioralQuestions = ensureArrayOfObjects(result.behavioralQuestions, ['question', 'intention', 'answer'], { intention: "Evaluate behavior", answer: "N/A" });
    result.skillGaps = ensureArrayOfObjects(result.skillGaps, ['skill', 'severity'], { severity: "medium" });

    if (typeof result.preparationPlan === 'string') {
        result.preparationPlan = [{ day: 1, focus: result.preparationPlan, tasks: [] }];
    } else if (Array.isArray(result.preparationPlan)) {
        result.preparationPlan = result.preparationPlan.map((p, i) => {
            if (typeof p === 'string') return { day: i + 1, focus: p, tasks: [] };
            if (typeof p === 'object' && p !== null) return {
                day: Number(p.day || i + 1),
                focus: p.focus || p.topic || "Key Area",
                tasks: Array.isArray(p.tasks) ? p.tasks : []
            };
            return null;
        }).filter(Boolean);
    } else {
        result.preparationPlan = [];
    }

    result.matchScore = Number(result.matchScore) || 0;
    return result;
}

// Complex malformed case matching user's error report
const malformedInput = {
    "technical_questions": "Explain the concept of 'Reconciliation' and 'Virtual DOM' in React.js. How do they optimize the rendering process?",
    "behavioralQuestions": "As a Project Lead at ZEROONE CODECLUB, describe a time you had to resolve a conflict within your team during the IPL Dashboard development.",
    "skill_gaps": "Professional Enterprise Experience (The candidate is a student; lacks full-time industry exposure)",
    "roadmap": "Day 1: Advanced React & State Management. Focus on Redux Toolkit, React Query, and performance optimization techniques like code-splitting."
};

console.log("--- Malformed Input (Snake case keys + flat strings) ---");
const repaired = repairResult(malformedInput);
console.log(JSON.stringify(repaired, null, 2));

// Check if technicalQuestions is now an array of objects
if (Array.isArray(repaired.technicalQuestions) && typeof repaired.technicalQuestions[0] === 'object') {
    console.log("\n✅ SUCCESS: Flat string is wrapped into object array.");
} else {
    console.log("\n❌ FAILED: Repair logic did not handle flat string correctly.");
}
