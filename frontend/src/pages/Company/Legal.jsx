import React from 'react';
import './Company.css';

export const Terms = () => (
    <LegalPage
        title="Terms of Service"
        lastUpdated="March 06, 2026"
        content={`
      <h3>1. Agreement to Terms</h3>
      <p>By accessing or using VisionHR, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
      
      <h3>2. Use License</h3>
      <p>Permission is granted to temporarily access the VisionHR platform for personal, non-commercial transitory viewing only.</p>
      
      <h3>3. Enterprise Obligations</h3>
      <p>Organizations using VisionHR are responsible for maintaining the confidentiality of their account and password and for restricting access to their computers.</p>
      
      <h3>4. Data Integrity</h3>
      <p>The system provides biometric identity verification. Organizations must ensure they have legal consent from employees before enabling facial recognition features.</p>

      <h3>5. Limitations</h3>
      <p>In no event shall VisionHR or its suppliers be liable for any damages arising out of the use or inability to use the materials on VisionHR's website.</p>
    `}
    />
);

export const Privacy = () => (
    <LegalPage
        title="Privacy Policy"
        lastUpdated="March 06, 2026"
        content={`
      <h3>1. Data Collection</h3>
      <p>We collect information you provide directly to us, such as when you create an account, update your profile, or use our biometric verification features.</p>
      
      <h3>2. Biometric Data</h3>
      <p>Facial embeddings are stored securely and used solely for identity verification within your organization. We do not sell or share biometric data with third parties.</p>
      
      <h3>3. Information Security</h3>
      <p>We implement a variety of security measures to maintain the safety of your personal information when you enter, submit, or access your personal information.</p>
      
      <h3>4. GDPR Compliance</h3>
      <p>VisionHR is fully GDPR compliant, providing users the right to access, correct, or delete their personal and biometric records at any time.</p>
    `}
    />
);

const LegalPage = ({ title, lastUpdated, content }) => (
    <div className="company-page animate-fade-in">
        <section className="legal-hero">
            <div className="container">
                <h1 className="hero-title">{title}</h1>
                <p className="hero-subtitle">Last Updated: {lastUpdated}</p>
            </div>
        </section>

        <section className="container section">
            <div className="legal-content glass" dangerouslySetInnerHTML={{ __html: content }} />
        </section>
    </div>
);
