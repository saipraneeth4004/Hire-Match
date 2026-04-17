import React, { useState, useEffect } from 'react'
import '../style/interview.scss'
import { useInterview } from '../hooks/useInterview'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate, useParams } from 'react-router'

// ── Shared Config ────────────────────────────────────────────────────────────
const NAV_ITEMS = [
    { id: 'technical', label: 'Technical Prep', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>) },
    { id: 'behavioral', label: 'Behavioral Prep', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>) },
    { id: 'roadmap', label: '7-Day Roadmap', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>) },
]

// ── Sub-components ────────────────────────────────────────────────────────────

const QuestionCard = ({ item, index }) => {
    const [open, setOpen] = useState(false)
    return (
        <div className={`q-card ${open ? 'q-card--open' : ''}`}>
            <div className='q-card__header' onClick={() => setOpen(!open)}>
                <span className='q-card__index'>{String(index + 1).padStart(2, '0')}</span>
                <p className='q-card__question'>{item.question}</p>
                <span className={`q-card__chevron ${open ? 'q-card__chevron--open' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </span>
            </div>
            {open && (
                <div className='q-card__body'>
                    <div className='q-card__section'>
                        <h4>Interviewer's Intention</h4>
                        <p>{item.intention}</p>
                    </div>
                    <div className='q-card__section'>
                        <h4>How to Answer</h4>
                        <p>{item.answer}</p>
                    </div>
                </div>
            )}
        </div>
    )
}

const RoadmapDay = ({ day }) => {
    // Basic icon detection based on focus keywords
    const getIcon = (focus) => {
        const f = focus.toLowerCase();
        if (f.includes('react') || f.includes('frontend') || f.includes('ui')) 
            return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
        if (f.includes('node') || f.includes('backend') || f.includes('api') || f.includes('database')) 
            return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>;
        if (f.includes('behavioral') || f.includes('soft skill') || f.includes('interview')) 
            return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 6.1H3"/><path d="M21 12.1H3"/><path d="M15.1 18H3"/></svg>;
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
    };

    return (
        <div className='roadmap-day'>
            <div className='roadmap-day__header'>
                <div className='roadmap-day__icon-box'>
                    {getIcon(day.focus)}
                </div>
                <div className='roadmap-day__title-group'>
                    <span className='roadmap-day__badge'>Day {day.day}</span>
                    <h3 className='roadmap-day__focus'>{day.focus}</h3>
                </div>
            </div>
            <ul className='roadmap-day__tasks'>
                {day.tasks.map((task, i) => (
                    <li key={i}>
                        <span className='task-check'>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </span>
                        {task}
                    </li>
                ))}
            </ul>
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────

const Interview = () => {
    const [activeNav, setActiveNav] = useState('technical')
    const { report, getReportById, loading, getResumePdf } = useInterview()
    const { handleLogout } = useAuth()
    const { interviewId } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        }
    }, [interviewId])

    if (loading || !report) {
        return (
            <main className='loading-screen'>
                <h1>Generating Strategic Insights...</h1>
            </main>
        )
    }

    const scoreClass = report.matchScore >= 80 ? 'score--high' : report.matchScore >= 60 ? 'score--mid' : 'score--low'

    return (
        <div className='interview-page'>
            <div className='interview-layout'>

                {/* Left Sidebar - Navigation */}
                <nav className='interview-nav'>
                    <div className='nav-top'>
                        <button 
                            className='nav-home-btn'
                            onClick={() => navigate('/')}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                            Back to Home
                        </button>

                        <div className='nav-divider' />

                        <p className='interview-nav__label'>Insights</p>
                        {NAV_ITEMS.map(item => (
                            <button
                                key={item.id}
                                className={`interview-nav__item ${activeNav === item.id ? 'interview-nav__item--active' : ''}`}
                                onClick={() => setActiveNav(item.id)}
                            >
                                <span className='interview-nav__icon'>{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
                    </div>
                    
                    <button 
                        className='primary-button'
                        onClick={() => getResumePdf(interviewId)}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Export Resume
                    </button>

                    <div className='sidebar-footer'>
                        <button onClick={handleLogout} className='logout-btn'>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                            Logout
                        </button>
                    </div>
                </nav>

                <div className='interview-divider' />

                {/* Main Content Area */}
                <main className='interview-content'>
                    {activeNav === 'technical' && (
                        <section>
                            <div className='content-header'>
                                <h2>Technical Deep-Dive</h2>
                                <span className='content-header__count'>{report.technicalQuestions?.length || 0} Questions</span>
                            </div>
                            <div className='q-list'>
                                {report.technicalQuestions?.map((q, i) => (
                                    <QuestionCard key={i} item={q} index={i} />
                                ))}
                            </div>
                        </section>
                    )}

                    {activeNav === 'behavioral' && (
                        <section>
                            <div className='content-header'>
                                <h2>Behavioral Dynamics</h2>
                                <span className='content-header__count'>{report.behavioralQuestions?.length || 0} Scenarios</span>
                            </div>
                            <div className='q-list'>
                                {report.behavioralQuestions?.map((q, i) => (
                                    <QuestionCard key={i} item={q} index={i} />
                                ))}
                            </div>
                        </section>
                    )}

                    {activeNav === 'roadmap' && (
                        <section>
                            <div className='content-header'>
                                <h2>Preparation Roadmap</h2>
                                <span className='content-header__count'>7-Day Strategy</span>
                            </div>
                            <div className='roadmap-list'>
                                {report.preparationPlan?.sort((a,b) => a.day - b.day).map((day, i) => (
                                    <RoadmapDay key={i} day={day} />
                                ))}
                            </div>
                        </section>
                    )}
                </main>

                <div className='interview-divider' />

                {/* Right Sidebar - Analytics */}
                <aside className='interview-sidebar'>
                    <div className='sidebar-section'>
                        <span className='sidebar-label'>Alignment Score</span>
                        <div className={`match-score`}>
                            <div className={`match-score__ring ${scoreClass}`}>
                                <span className='match-score__value'>{report.matchScore}</span>
                                <span className='match-score__pct'>%</span>
                            </div>
                            <p className='match-score__desc'>Candidate Compatibility</p>
                        </div>
                    </div>

                    <div className='sidebar-section'>
                        <span className='sidebar-label'>Growth Opportunities</span>
                        <div className='skill-gaps__list'>
                            {report.skillGaps?.map((gap, i) => (
                                <div key={i} className={`skill-tag skill-tag--${gap.severity?.toLowerCase()}`}>
                                    {gap.skill}
                                </div>
                            ))}
                            {(!report.skillGaps || report.skillGaps.length === 0) && (
                                <p className='text-muted small'>No significant gaps detected.</p>
                            )}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    )
}

export default Interview