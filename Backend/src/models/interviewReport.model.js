const mongoose = require('mongoose'); 



/**
 * job description schema :String
 * resume text : String
 * self description : String
 * 
 * mathscore: Number
 * 
 * Technical questions:[{
 *                       question: String,
 *                      intension: String,
 *                     answer: String,      
 *              }] 
 * Behavioral questions:[{
 *                       question: String,
 *                      intension: String,
 *                     answer: String,      
 *              }] 
 * 
 * 
 * Skill gaps:[{
 *                      skill: "",
 *                      severity: {
 *                       type: String,
 *                      enum: ['Low', 'Medium', 'High']
 *                     }
 * 
 *              }]
 * 
 * 
 * Presentation plan :[{
 *                      day: Number,
 *                      focus: String,
 *                      tasks: [String]
 *                     }]
 *  
 */ 

const technicalQuestionSchema = new mongoose.Schema({
    question: { type: String, required: [true, 'Technical question is required'] },
    intension: { type: String, required: [true, 'Intension is required'] },
    answer: { type: String, required: [true, 'Answer is required'] }
},{
    _id: false
}); 

const behavioralQuestionSchema = new mongoose.Schema({
    question: { type: String, required: [true, 'Behavioral question is required'] },
    intension: { type: String, required: [true, 'Intension is required'] },
    answer: { type: String, required: [true, 'Answer is required'] }
},{
    _id: false
}); 
const skillGapSchema = new mongoose.Schema({
    skill: { type: String, required: [true, 'Skill is required'] },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high'],
        required: [true, 'Severity is required']
    }
},{
    _id: false
});   

const presentationPlanSchema = new mongoose.Schema({
    day: { type: Number, required: [true, 'Day is required'] },
    focus: { type: String, required: [true, 'Focus is required'] },

    tasks: [{ type: String, required: [true, 'task is required'] }]
},{
    _id: false
}); 


const interviewReportSchema = new mongoose.Schema({ 
    jobDescription: { type: String, required: [true, 'Job description is required'] },
    resume: { type: String },
    selfDescription: { type: String },
    mathScore: { type: Number,min:0, max:100 },

    technicalQuestions: [technicalQuestionSchema],
    behavioralQuestions: [behavioralQuestionSchema],
    skillGaps: [skillGapSchema],
    presentationPlan: [presentationPlanSchema]
}, {
    timestamps: true    
}); 

const InterviewReportModel = mongoose.model('InterviewReport', interviewReportSchema); 

module.exports = InterviewReportModel; 