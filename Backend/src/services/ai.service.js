const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")


const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})


const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The behavioral question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum([ "low", "medium", "high" ]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
})

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {

const prompt = `You are an expert technical recruiter. Analyze the candidate's profile against the job description and generate a comprehensive interview report in the EXACT JSON structure specified.

Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}

STRICT OUTPUT RULES:
- matchScore: a single number between 0-100
- technicalQuestions: array of objects, each with THREE fields:
    * question: the actual interview question as a string
    * intention: why the interviewer is asking this question
    * answer: how the candidate should answer, what points to cover
- behavioralQuestions: array of objects, each with THREE fields:
    * question: the actual behavioral question as a string
    * intention: why the interviewer is asking this question
    * answer: how the candidate should answer using STAR method
- skillGaps: array of objects, each with TWO fields:
    * skill: name of the missing skill
    * severity: MUST be exactly one of "low", "medium", or "high"
- preparationPlan: array of objects, each with THREE fields:
    * day: day number starting from 1
    * focus: the main topic to focus on that day
    * tasks: array of strings, each being a specific actionable task
- title: the exact job title from the job description

DO NOT flatten question and intention into a single string.
DO NOT combine skill and severity into a single string.
DO NOT combine day and tasks into a single string.
Each object field must be a separate key-value pair.`; 
    
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseJsonSchema: zodToJsonSchema(interviewReportSchema),
        }
    })

 
    return   JSON.parse(response.text)
}

module.exports = generateInterviewReport;