require('dotenv').config();
const generateInterviewReport = require('../src/services/ai.service');

async function test() {
    try {
        const result = await generateInterviewReport({
            resume: "Frontend Developer with React, Node.js",
            selfDescription: "I am a student with lead experience in tech clubs.",
            jobDescription: "Full Stack Developer (MERN + AI)"
        });
        console.log('AI Result:', JSON.stringify(result, null, 2));
        
        // Check if nested fields are arrays
        const fields = ['technicalQuestions', 'behavioralQuestions', 'skillGaps', 'preparationPlan'];
        fields.forEach(field => {
            if (Array.isArray(result[field])) {
                console.log(`✅ ${field} is an array`);
                if (result[field].length > 0 && typeof result[field][0] === 'object') {
                    console.log(`   ✅ First element is an object`);
                } else {
                    console.error(`   ❌ First element is NOT an object! (${typeof result[field][0]})`);
                }
            } else {
                console.error(`❌ ${field} is NOT an array!`);
            }
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

test();
