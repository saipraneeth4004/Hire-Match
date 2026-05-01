const pdf = require('pdf-parse'); // Library to extract text from PDF
const generateInterviewReport = require('../services/ai.service'); // AI service to generate report
const InterviewReportModel = require('../models/interviewreport.model'); // Mongoose model

// Controller to generate interview report using AI
async function generateInterviewReportController(req, res) { 
    try {
        const { selfDescription, jobDescription } = req.body; 

        // Validate: Job description is mandatory
        if (!jobDescription) {
            return res.status(400).json({
                message: "Job description is required"
            });
        }

        // Validate: Either resume file OR self description must be provided
        if (!req.file && (!selfDescription || selfDescription.trim() === "")) {
            return res.status(400).json({
                message: "Please provide either a Resume PDF or a Self Description"
            });
        }

        let resumeContent = "";

        // If resume file is uploaded, extract text from PDF
        if (req.file) {
            const pdfData = await pdf(req.file.buffer);
            resumeContent = pdfData.text;
        }

        // Call AI service to generate interview report
        const interviewReportByAi = await generateInterviewReport({
            resume: resumeContent,
            selfDescription: selfDescription || "",
            jobDescription
        });

        // Save generated report into MongoDB
        const interviewReport = await InterviewReportModel.create({ 
            user: req.user.id, // Authenticated user ID
            resume: resumeContent,
            selfDescription,
            jobDescription,
            ...interviewReportByAi // Spread AI-generated fields
        });

        // Send success response
        res.status(201).json({
            message: "Interview report generated successfully",
            interviewReport  
        });

    } catch (error) {

        // Handle Mongoose validation errors separately
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            console.error("Mongoose Validation Errors:", messages);
            return res.status(400).json({
                message: "Generated report failed structure validation.",
                errors: messages
            });
        }

        // General error handling
        console.error("Error generating interview report:", error);
        res.status(500).json({
            message: "An error occurred while generating the interview report",
            error: error.message
        });
    }
}

// Controller to fetch a single interview report by ID
async function getInterviewReportByIdController(req, res) {
    try {
        const { interviewId } = req.params;

        // Fetch report from DB
        const interviewReport = await InterviewReportModel.findById(interviewId);

        // If report not found
        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found"
            });
        }

        // Send success response
        res.status(200).json({
            message: "Interview report fetched successfully",
            interviewReport
        });

    } catch (error) {
        console.error("Error fetching interview report:", error);
        res.status(500).json({
            message: "An error occurred while fetching the interview report",
            error: error.message
        });
    }
}

// Controller to fetch all reports for a specific user
async function getAllInterviewReportsController(req, res) {
    try {
        // Fetch all reports for logged-in user, sorted by latest first
        const reports = await InterviewReportModel
            .find({ user: req.user.id })
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Interview reports fetched successfully",
            reports
        });

    } catch (error) {
        console.error("Error fetching all interview reports:", error);
        res.status(500).json({
            message: "An error occurred while fetching the interview reports",
            error: error.message
        });
    }
}

// Controller to generate resume PDF (currently placeholder)
async function generateResumePdfController(req, res) {
    try {
        // NOTE: This is a placeholder for future implementation
        res.status(200).json({
            message: "Resume PDF generation triggered (Placeholder)",
            note: "In a production environment, this would return a PDF stream."
        });
    } catch (error) {
        console.error("Error generating resume PDF:", error);
        res.status(500).json({
            message: "An error occurred while generating the resume PDF",
            error: error.message
        });
    }
}

// Export all controllers
module.exports = { 
    generateInterviewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController
};
