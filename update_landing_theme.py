
import os
import re

file_path = r'c:\yoburaj\security\frontend\src\components\common\LandingPage.jsx'

new_css = """      <style>{`
                .landing-page {
                    background-color: var(--bg-main);
                    color: var(--text-main);
                    overflow-x: hidden;
                    font-family: 'Inter', sans-serif;
                }

                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 1.5rem;
                }

                /* Hero Section */
                .hero {
                    padding: 8rem 1.5rem 6rem;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 4rem;
                    align-items: center;
                    position: relative;
                }

                .release-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: #eff6ff; /* Blue 50 */
                    border: 1px solid #dbeafe; /* Blue 100 */
                    padding: 0.4rem 0.8rem;
                    border-radius: 9999px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: var(--primary-color);
                    margin-bottom: 2rem;
                    letter-spacing: 0.05em;
                }

                .release-badge .dot {
                    width: 6px;
                    height: 6px;
                    background: var(--primary-color);
                    border-radius: 50%;
                    box-shadow: 0 0 8px rgba(37, 99, 235, 0.4);
                }

                .hero h1 {
                    font-size: 4.5rem;
                    line-height: 1.1;
                    font-weight: 800;
                    margin-bottom: 2rem;
                    letter-spacing: -0.02em;
                    color: var(--text-main);
                }

                .hero h1 .highlight {
                    color: var(--primary-color);
                }

                .hero-description {
                    font-size: 1.125rem;
                    line-height: 1.6;
                    color: var(--text-muted);
                    max-width: 480px;
                    margin-bottom: 3rem;
                }

                .hero-actions {
                    display: flex;
                    gap: 1.5rem;
                    margin-bottom: 4rem;
                }

                .btn-large {
                    padding: 1rem 2rem;
                    font-size: 1rem;
                    border-radius: 0.75rem;
                }
                
                .btn-outline {
                    background: transparent;
                    border: 1px solid var(--border-color);
                    color: var(--text-main);
                    font-weight: 600;
                    transition: all 0.2s;
                }
                .btn-outline:hover {
                    border-color: var(--primary-color);
                    color: var(--primary-color);
                    background: #eff6ff;
                }

                .trusted-by {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .avatar-group {
                    display: flex;
                    align-items: center;
                }

                .avatar-group img, .avatar-more {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    border: 2px solid white;
                    margin-left: -12px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }

                .avatar-group img:first-child { margin-left: 0; }

                .avatar-more {
                    background: #f1f5f9;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: var(--text-muted);
                }

                .trusted-by span {
                    font-size: 0.875rem;
                    color: var(--text-muted);
                    font-weight: 500;
                }

                /* Hero Visual Card */
                .hero-visual {
                    display: flex;
                    justify-content: flex-end;
                }

                .overview-card {
                    width: 380px;
                    padding: 2rem;
                    border-radius: 1.5rem;
                    background: white;
                    border: 1px solid var(--border-color);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                }

                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 2.5rem;
                }

                .header-title {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: var(--text-muted);
                    flex: 1;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .dots { display: flex; gap: 6px; }
                .dots span { width: 10px; height: 10px; border-radius: 50%; }
                .dots .red { background: #ef4444; }
                .dots .yellow { background: #f59e0b; }
                .dots .green { background: #10b981; }

                .card-stats {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 2rem;
                    margin-bottom: 2.5rem;
                }

                .card-stats .label {
                    display: block;
                    font-size: 0.7rem;
                    font-weight: 700;
                    color: var(--text-muted);
                    margin-bottom: 0.5rem;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                }

                .card-stats .value {
                    font-size: 2rem;
                    font-weight: 800;
                    color: var(--text-main);
                }

                .text-accent { color: #10b981; }

                .card-progress { margin-bottom: 2rem; }
                .progress-label {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    margin-bottom: 0.75rem;
                    font-weight: 600;
                }

                .progress-bar {
                    height: 8px;
                    background: #f1f5f9;
                    border-radius: 4px;
                    overflow: hidden;
                }

                .progress-bar .fill {
                    height: 100%;
                    background: linear-gradient(to right, var(--primary-color), #60a5fa);
                    box-shadow: 0 0 10px rgba(37, 99, 235, 0.2);
                }

                .card-status {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 1rem;
                    border-radius: 1rem;
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: var(--text-main);
                    background: #f8fafc;
                    border: 1px solid var(--border-color);
                }

                .status-badge {
                    margin-left: auto;
                    font-size: 0.65rem;
                    font-weight: 700;
                    padding: 0.2rem 0.6rem;
                    background: #ecfdf5;
                    color: #059669;
                    border-radius: 4px;
                    border: 1px solid #d1fae5;
                }

                /* Features Section */
                .features {
                    padding: 10rem 1.5rem;
                    text-align: center;
                    background: #f8fafc;
                }

                .section-header h2 {
                    font-size: 3rem;
                    font-weight: 800;
                    margin-bottom: 1.5rem;
                    color: var(--text-main);
                    letter-spacing: -0.02em;
                }

                .section-header p {
                    color: var(--text-muted);
                    font-size: 1.125rem;
                    max-width: 700px;
                    margin: 0 auto 5rem;
                    line-height: 1.6;
                }

                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 2rem;
                }

                .feature-card {
                    padding: 3rem 2rem;
                    border-radius: 1.5rem;
                    text-align: left;
                    background: white;
                    border: 1px solid var(--border-color);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    transition: all 0.3s ease;
                }

                .feature-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                    border-color: #cbd5e1;
                }

                .feature-icon {
                    width: 48px;
                    height: 48px;
                    background: #eff6ff;
                    border-radius: 0.75rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 2rem;
                    color: var(--primary-color);
                }

                .feature-card h3 {
                    font-size: 1.25rem;
                    margin-bottom: 1rem;
                    font-weight: 700;
                    color: var(--text-main);
                }

                .feature-card p {
                    color: var(--text-muted);
                    line-height: 1.6;
                    font-size: 0.95rem;
                }

                /* Footer */
                .landing-footer {
                    background: white;
                    padding-top: 8rem;
                    border-top: 1px solid var(--border-color);
                }

                .footer-grid {
                    display: grid;
                    grid-template-columns: 2fr repeat(3, 1fr) 1.5fr;
                    gap: 4rem;
                    margin-bottom: 6rem;
                }

                .footer-brand-section .logo-text {
                    color: var(--text-main);
                    font-weight: 800;
                    font-size: 1.5rem;
                }

                .logo-icon {
                    background: var(--primary-color);
                    padding: 0.5rem;
                    border-radius: 0.5rem;
                }

                .logo-section {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .footer-brand-section .brand-description {
                    color: var(--text-muted);
                    font-size: 0.95rem;
                    line-height: 1.6;
                    margin: 1.5rem 0 2rem;
                    max-width: 280px;
                }

                .social-links {
                    display: flex;
                    gap: 1.5rem;
                }

                .social-icon {
                    color: var(--text-muted);
                    transition: color 0.3s ease;
                }

                .social-icon:hover { color: var(--primary-color); }

                .footer-links h4, .footer-subscribe h4 {
                    font-size: 0.75rem;
                    font-weight: 700;
                    letter-spacing: 0.1em;
                    margin-bottom: 2rem;
                    color: var(--text-main);
                }

                .footer-links {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .footer-links a {
                    color: var(--text-muted);
                    text-decoration: none;
                    font-size: 0.9rem;
                    transition: color 0.3s ease;
                }

                .footer-links a:hover { color: var(--primary-color); }

                .footer-subscribe p {
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    margin-bottom: 1.5rem;
                }

                .subscribe-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .input-with-icon {
                    position: relative;
                }

                .input-icon {
                    position: absolute;
                    left: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-muted);
                }

                .subscribe-form input {
                    width: 100%;
                    background: #f8fafc;
                    border: 1px solid var(--border-color);
                    padding: 0.75rem 1rem 0.75rem 3rem;
                    border-radius: 0.5rem;
                    color: var(--text-main);
                    outline: none;
                    transition: all 0.2s;
                }
                
                .subscribe-form input:focus {
                    border-color: var(--primary-color);
                    background: white;
                    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
                }

                .footer-bottom {
                    padding: 2.5rem 1.5rem;
                    border-top: 1px solid var(--border-color);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    color: var(--text-muted);
                    font-size: 0.85rem;
                    background: #f8fafc;
                }

                .bottom-links {
                    display: flex;
                    gap: 2rem;
                }

                .bottom-links a {
                    color: var(--text-muted);
                    text-decoration: none;
                    transition: color 0.3s ease;
                }

                .bottom-links a:hover { color: var(--primary-color); }

                /* Animations */
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }

                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                    100% { transform: translateY(0px); }
                }

                @media (max-width: 1024px) {
                    .footer-grid {
                        grid-template-columns: 1fr 1fr;
                        gap: 3rem;
                    }
                    .footer-brand-section { grid-column: span 2; }
                    .footer-subscribe { grid-column: span 2; }
                }

                @media (max-width: 968px) {
                    .hero {
                        grid-template-columns: 1fr;
                        text-align: center;
                        padding-top: 6rem;
                    }
                    .hero-description { margin: 0 auto 3rem; }
                    .hero-actions { justify-content: center; }
                    .hero-visual { display: none; }
                    .features-grid { grid-template-columns: 1fr; }
                    .footer-bottom { flex-direction: column; gap: 1.5rem; text-align: center; }
                    .hero h1 { font-size: 3rem; }
                }
            `}</style>"""

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex to find the style block
    pattern = re.compile(r'<style>\{`.*?`\}</style>', re.DOTALL)
    
    if pattern.search(content):
        new_content = pattern.sub(new_css, content)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Successfully updated LandingPage styles.")
    else:
        print("Style block not found in LandingPage.")

except Exception as e:
    print(f"Error: {e}")
