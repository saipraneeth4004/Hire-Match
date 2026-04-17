import React, { useState, useRef, useEffect } from 'react'
import "../style/home.scss"
import { useInterview } from '../hooks/useInterview'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router'

const Home = () => {
    const { loading, generateReport, reports, getReports } = useInterview()
    const { user, handleLogout } = useAuth()
    const [jobDescription, setJobDescription] = useState("")
    const [selfDescription, setSelfDescription] = useState("")
    const [selectedFile, setSelectedFile] = useState(null)
    const resumeInputRef = useRef()
    const navigate = useNavigate()

    useEffect(() => {
        getReports()
    }, [])

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setSelectedFile(file)
        }
    }

    const clearFile = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setSelectedFile(null)
        if (resumeInputRef.current) resumeInputRef.current.value = ""
    }

    const handleGenerateReport = async () => {
        if (!jobDescription) {
            alert("Minimum requirement: Job Description")
            return
        }

        if (!selectedFile && (!selfDescription || selfDescription.trim() === "")) {
            alert("Please provide either a Resume PDF or a Self Description to proceed.")
            return
        }

        const resumeFile = selectedFile || resumeInputRef.current.files[0]
        try {
            const data = await generateReport({ jobDescription, selfDescription, resumeFile })
            if (data && data._id) {
                navigate(`/interview/${data._id}`)
            }
        } catch (err) {
            alert(err.response?.data?.message || "Generation failed. Please check inputs.")
        }
    }

    if (loading) {
        return (
            <main className='loading-screen'>
                <h1>Building Your Winning Strategy...</h1>
            </main>
        )
    }

    return (
        <div className='home-page'>
            <header className='top-nav'>
                <div className='user-badge'>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <span>{user?.username}</span>
                </div>
                <button onClick={handleLogout} className='logout-btn'>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Logout
                </button>
            </header>

            {/* Page Header */}
            <header className='page-header'>
                <h1>Create Your Custom <span className='highlight'>Interview Strategy</span></h1>
                <p>AI-driven analysis of job requirements and your professional profile to give you the competitive edge.</p>
            </header>

            {/* Main Generation Card */}
            <div className='interview-card'>
                <div className='interview-card__body'>
                    {/* Left Panel - Job Context */}
                    <div className='panel panel--left'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                            </span>
                            <h2>Job Description</h2>
                            <span className='badge badge--required'>Required</span>
                        </div>
                        <textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            className='panel__textarea'
                            placeholder="Paste the full job description here to help the AI identify key technical and behavioral requirements..."
                            maxLength={5000}
                        />
                    </div>

                    <div className='panel-divider' />

                    {/* Right Panel - Candidate Profile */}
                    <div className='panel panel--right'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            </span>
                            <h2>Your Profile</h2>
                        </div>

                        <div className='upload-section'>
                            <label className='section-label'>
                                Upload Resume
                                <span className='badge badge--best'>Recommended</span>
                            </label>
                            <label className={`dropzone ${selectedFile ? 'dropzone--filled' : ''}`} htmlFor='resume'>
                                {!selectedFile ? (
                                    <>
                                        <span className='dropzone__icon'>
                                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
                                        </span>
                                        <p className='dropzone__title'>Drag & drop PDF here</p>
                                        <p className='dropzone__subtitle'>Max size: 5MB</p>
                                    </>
                                ) : (
                                    <div className='file-info'>
                                        <span className='file-info__icon'>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#27ae60" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                                        </span>
                                        <div className='file-info__meta'>
                                            <p className='file-name'>{selectedFile.name}</p>
                                            <button onClick={clearFile} className='change-file-btn'>Change File</button>
                                        </div>
                                    </div>
                                )}
                                <input ref={resumeInputRef} onChange={handleFileChange} hidden type='file' id='resume' name='resume' accept='.pdf' />
                            </label>
                        </div>

                        <div className='or-divider'><span>OR SELF DESCRIPTION</span></div>

                        <div className='self-description'>
                            <textarea
                                value={selfDescription}
                                onChange={(e) => setSelfDescription(e.target.value)}
                                className='panel__textarea panel__textarea--short'
                                placeholder="Briefly describe your background, top skills, and career highlights..."
                            />
                        </div>

                        <div className='info-box'>
                            <span className='info-box__icon'>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                            </span>
                            <p>For best results, provide both a Resume and a Job Description.</p>
                        </div>
                    </div>
                </div>

                <div className='interview-card__footer'>
                    <span className='footer-info'>Neural Analysis Model Active</span>
                    <button onClick={handleGenerateReport} className='generate-btn' disabled={loading}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        Generate Interview Strategy
                    </button>
                </div>
            </div>

            {/* History Section */}
            {reports && reports.length > 0 && (
                <section className='recent-reports'>
                    <h2>Recent Strategy Plans</h2>
                    <ul className='reports-list'>
                        {reports.map(report => (
                            <li key={report._id} className='report-item' onClick={() => navigate(`/interview/${report._id}`)}>
                                <h3>{report.title || 'Target Role Analysis'}</h3>
                                <p className='report-meta'>{new Date(report.createdAt).toLocaleDateString()}</p>
                                <span className={`match-score ${report.matchScore >= 80 ? 'score--high' : report.matchScore >= 60 ? 'score--mid' : 'score--low'}`}>
                                    Match Score: {report.matchScore}%
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </div>
    )
}

export default Home