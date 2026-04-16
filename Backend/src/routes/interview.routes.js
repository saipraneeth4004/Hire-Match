
const express=require("express"); 
const authMiddleware=require("../middleware/auth.middleware"); 
const interviewController=require("../controllers/interview.controller");
const upload=require("../middleware/file.middleware");

const interviewRouter=express.Router();  

/**
 * @route POST /api/interview/
 * @desc Generate interview report for a candidate based on their resume, self-description and job description 
 * 
 * @access Private (Requires authentication)
 */

interviewRouter.post("/", authMiddleware.authUser, upload.single('resume'), interviewController.generateInterviewReportController); 



module.exports=interviewRouter;