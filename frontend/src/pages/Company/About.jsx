import React from 'react';
import { Shield, Target, Users, Globe, Zap, Award } from 'lucide-react';
import './Company.css';

const About = () => {
    return (
        <div className="company-page animate-fade-in">
            <section className="company-hero">
                <div className="container">
                    <h1 className="hero-title">Redefining <span className="highlight">Workforce</span> Intelligence</h1>
                    <p className="hero-subtitle">
                        VisionHR is at the forefront of the HR tech revolution, combining advanced AI with human-centric design
                        To empower organizations and their people.
                    </p>
                </div>
            </section>

            <section className="container section">
                <div className="about-grid">
                    <div className="about-content">
                        <h2 className="section-title">Our Story</h2>
                        <p className="section-text">
                            Founded with the vision of making HR management seamless and data-driven, VisionHR has grown from
                            a small startup to a leading provider of enterprise HR solutions. We believe that the heart of every
                            great company is its people, and our mission is to provide the tools that help those people thrive.
                        </p>
                        <div className="stats-row">
                            <div className="stat-item">
                                <span className="stat-value">500+</span>
                                <span className="stat-label">Clients Globally</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">1M+</span>
                                <span className="stat-label">Active Users</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">99.9%</span>
                                <span className="stat-label">System Uptime</span>
                            </div>
                        </div>
                    </div>
                    <div className="about-visual">
                        <div className="visual-card glass animate-float">
                            <div className="card-header-icon"><Award size={32} color="var(--primary-color)" /></div>
                            <h3>Industry Leader</h3>
                            <p>Recognized for excellence in AI-driven HR management and data security for three consecutive years.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-light section">
                <div className="container">
                    <h2 className="section-title text-center">Our Core Values</h2>
                    <div className="values-grid">
                        <ValueCard
                            icon={<Shield size={24} />}
                            title="Integrity & Security"
                            description="We handle sensitive data with the highest standards of ethics and military-grade encryption."
                        />
                        <ValueCard
                            icon={<Target size={24} />}
                            title="Mission Focused"
                            description="Every feature we build is designed to help organizations achieve their strategic architectural goals."
                        />
                        <ValueCard
                            icon={<Users size={24} />}
                            title="Human Centric"
                            description="Technology should empower people, not replace them. User experience is at our core."
                        />
                        <ValueCard
                            icon={<Globe size={24} />}
                            title="Global Scale"
                            description="Designed to support global workforces with localized compliance and cultural awareness."
                        />
                        <ValueCard
                            icon={<Zap size={24} />}
                            title="Innovation"
                            description="We continuously push the boundaries of what's possible in workforce analytics and automation."
                        />
                        <ValueCard
                            icon={<Award size={24} />}
                            title="Excellence"
                            description="We strive for perfection in every line of code and every customer interaction."
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

const ValueCard = ({ icon, title, description }) => (
    <div className="value-card glass">
        <div className="value-icon">{icon}</div>
        <h3>{title}</h3>
        <p>{description}</p>
    </div>
);

export default About;
