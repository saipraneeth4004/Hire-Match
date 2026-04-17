import { useState, useEffect } from 'react'
import * as interviewApi from '../services/interview.api'

/**
 * @hook useInterview
 * @description Centralized hook to manage interview reports, loading states, and API interactions.
 */
export const useInterview = () => {
    const [reports, setReports] = useState([])
    const [report, setReport] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Clear error state
    const clearError = () => setError(null)

    /**
     * @description Fetches all reports for the current user.
     */
    const getReports = async () => {
        setLoading(true)
        try {
            const data = await interviewApi.getAllInterviewReports()
            setReports(data.reports || [])
            clearError()
        } catch (err) {
            console.error("Error fetching reports:", err)
            setError(err.response?.data?.message || "Failed to fetch reports")
        } finally {
            setLoading(false)
        }
    }

    /**
     * @description Fetches a specific report by ID.
     */
    const getReportById = async (id) => {
        setLoading(true)
        try {
            const data = await interviewApi.getInterviewReportById(id)
            setReport(data.interviewReport)
            clearError()
        } catch (err) {
            console.error("Error fetching report by ID:", err)
            setError(err.response?.data?.message || "Failed to fetch report details")
        } finally {
            setLoading(false)
        }
    }

    /**
     * @description Triggers AI generation of a new interview report.
     */
    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true)
        try {
            const data = await interviewApi.generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            setReport(data.interviewReport)
            // Refresh list if needed (optional)
            clearError()
            return data.interviewReport
        } catch (err) {
            console.error("Error generating report:", err)
            setError(err.response?.data?.message || "Failed to generate interview report")
            throw err
        } finally {
            setLoading(false)
        }
    }

    /**
     * @description Triggers PDF generation for a specific report.
     */
    const getResumePdf = async (reportId) => {
        try {
            const blob = await interviewApi.generateResumePdf({ interviewReportId: reportId })
            const url = window.URL.createObjectURL(new Blob([blob]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `resume-${reportId}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
        } catch (err) {
            console.error("Error downloading PDF:", err)
            setError("Failed to download resume PDF")
        }
    }

    // Load reports on mount
    useEffect(() => {
        getReports()
    }, [])

    return {
        reports,
        report,
        loading,
        error,
        getReports,
        getReportById,
        generateReport,
        getResumePdf,
        clearError
    }
}
