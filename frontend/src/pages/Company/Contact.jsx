import React from 'react';
import { Mail, Phone, MapPin, MessageSquare, Send } from 'lucide-react';
import './Company.css';

const Contact = () => {
    return (
        <div className="company-page animate-fade-in">
            <section className="company-hero">
                <div className="container">
                    <h1 className="hero-title">Get in <span className="highlight">Touch</span></h1>
                    <p className="hero-subtitle">
                        Have questions about VisionHR? Our team is here to help you optimize your workforce management.
                    </p>
                </div>
            </section>

            <section className="container section">
                <div className="contact-layout">
                    <div className="contact-info-panel">
                        <h2 className="section-title">Contact Information</h2>
                        <p className="contact-desc">Reach out to our specialized departments for tailored support.</p>

                        <div className="contact-methods">
                            <div className="contact-method glass">
                                <div className="method-icon"><MessageSquare size={20} /></div>
                                <div>
                                    <h4>General Inquiries</h4>
                                    <p>hello@visionhr.io</p>
                                </div>
                            </div>
                            <div className="contact-method glass">
                                <div className="method-icon"><Phone size={20} /></div>
                                <div>
                                    <h4>Sales Support</h4>
                                    <p>+1 (555) 123-4567</p>
                                </div>
                            </div>
                            <div className="contact-method glass">
                                <div className="method-icon"><MapPin size={20} /></div>
                                <div>
                                    <h4>Global Headquarters</h4>
                                    <p>123 Innovation Drive, Tech City, NY 10001</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="contact-form-panel glass">
                        <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input type="text" placeholder="John Doe" />
                                </div>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input type="email" placeholder="john@company.com" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Industry / Company</label>
                                <input type="text" placeholder="VisionHR Global Corp" />
                            </div>
                            <div className="form-group">
                                <label>Message</label>
                                <textarea rows={5} placeholder="How can we help you thrive?"></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary w-full">
                                Send Message <Send size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Contact;
