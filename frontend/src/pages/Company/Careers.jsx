import React from 'react';
import { Briefcase, MapPin, Clock, ArrowRight } from 'lucide-react';
import './Company.css';

const Careers = () => {
    const jobs = [
        { title: "Senior Software Engineer (AI/ML)", dept: "Engineering", location: "Remote / New York", type: "Full-time" },
        { title: "Product Manager", dept: "Product", location: "London, UK", type: "Full-time" },
        { title: "UX/UI Designer", dept: "Design", location: "Remote", type: "Full-time" },
        { title: "HR Business Partner", dept: "People & Culture", location: "Singapore", type: "Full-time" },
        { title: "Customer Success Lead", dept: "Operations", location: "San Francisco", type: "Full-time" },
    ];

    return (
        <div className="company-page animate-fade-in">
            <section className="company-hero">
                <div className="container">
                    <h1 className="hero-title">Build the <span className="highlight">Future</span> of HR</h1>
                    <p className="hero-subtitle">
                        Join a team of world-class engineers, designers, and innovators solving the toughest challenges in
                        Workforce management.
                    </p>
                </div>
            </section>

            <section className="container section">
                <h2 className="section-title">Whay Join Us?</h2>
                <div className="culture-grid">
                    <div className="culture-item glass">
                        <h3>Remote-First Culture</h3>
                        <p>Work from anywhere in the world. We value output and creativity over office attendance.</p>
                    </div>
                    <div className="culture-item glass">
                        <h3>Continuous Learning</h3>
                        <p>Annual budget for courses, conferences, and books to help you stay at the top of your game.</p>
                    </div>
                    <div className="culture-item glass">
                        <h3>Global Impact</h3>
                        <p>Your work will be used by millions of employees across thousands of companies worldwide.</p>
                    </div>
                </div>
            </section>

            <section className="bg-light section">
                <div className="container">
                    <header className="jobs-header">
                        <h2 className="section-title">Open Positions</h2>
                        <div className="jobs-filter">
                            <span>5 positions available</span>
                        </div>
                    </header>

                    <div className="jobs-list">
                        {jobs.map((job, idx) => (
                            <div key={idx} className="job-card glass">
                                <div className="job-info">
                                    <h3>{job.title}</h3>
                                    <div className="job-meta">
                                        <span><Briefcase size={14} /> {job.dept}</span>
                                        <span><MapPin size={14} /> {job.location}</span>
                                        <span><Clock size={14} /> {job.type}</span>
                                    </div>
                                </div>
                                <button className="btn btn-outline btn-sm">
                                    Apply Now <ArrowRight size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Careers;
