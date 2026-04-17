const pdf = require('pdf-parse');
const generateInterviewReport = require('../services/ai.service'); 
const InterviewReportModel = require('../models/interviewreport.model');

async function generateInterviewReportController(req, res) { 
    try {
        const { selfDescription, jobDescription } = req.body; 

        if (!jobDescription) {
            return res.status(400).json({
                message: "Job description is required"
            });
        }

        // Ensure at least one profile context is provided
        if (!req.file && (!selfDescription || selfDescription.trim() === "")) {
            return res.status(400).json({
                message: "Please provide either a Resume PDF or a Self Description"
            });
        }

        let resumeContent = "";
        if (req.file) {
            const pdfData = await pdf(req.file.buffer);
            resumeContent = pdfData.text;
        }

        const interviewReportByAi = await generateInterviewReport({
            resume: resumeContent,
            selfDescription: selfDescription || "",
            jobDescription
        });

        const interviewReport = await InterviewReportModel.create({ 
            user: req.user.id, 
            resume: resumeContent, 
            selfDescription,
            jobDescription,
            ...interviewReportByAi
        });

        res.status(201).json({
            message: "Interview report generated successfully",
            interviewReport  
        });

    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            console.error("Mongoose Validation Errors:", messages);
            return res.status(400).json({
                message: "Generated report failed structure validation.",
                errors: messages
            });
        }
        console.error("Error generating interview report:", error);
        res.status(500).json({
            message: "An error occurred while generating the interview report",
            error: error.message
        });
    }
}

async function getInterviewReportByIdController(req, res) {
    try {
        const { interviewId } = req.params;
        const interviewReport = await InterviewReportModel.findById(interviewId);

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found"
            });
        }

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

async function getAllInterviewReportsController(req, res) {
    try {
        const reports = await InterviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 });

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

async function generateResumePdfController(req, res) {
    try {
        // Placeholder implementation for PDF generation
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

module.exports = { 
    generateInterviewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController
} 