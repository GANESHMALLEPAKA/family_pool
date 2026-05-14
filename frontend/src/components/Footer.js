import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            {/* Animated Background */}
            <div className="footer-bg">
                <div className="footer-wave wave-1"></div>
                <div className="footer-wave wave-2"></div>
            </div>

            <div className="footer-container">
                {/* Main Footer Content */}
                <div className="footer-main">
                    {/* Brand */}
                    <div className="footer-brand">
                        <h3 className="footer-logo">
                            <span className="logo-icon">💰</span>
                            Family Pool
                        </h3>
                        <p>India's #1 family wealth management platform. Build generational wealth together with AI-powered insights.</p>

                        {/* Social Links */}
                        <div className="social-links">
                            <a href="#" className="social-link" aria-label="Twitter">
                                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                                </svg>
                            </a>
                            <a href="#" className="social-link" aria-label="LinkedIn">
                                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                                    <circle cx="4" cy="4" r="2" />
                                </svg>
                            </a>
                            <a href="#" className="social-link" aria-label="Instagram">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                                    <rect x="2" y="2" width="20" height="20" rx="5" />
                                    <circle cx="12" cy="12" r="4" />
                                    <circle cx="18" cy="6" r="1" fill="currentColor" />
                                </svg>
                            </a>
                            <a href="#" className="social-link" aria-label="YouTube">
                                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                    <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z" />
                                    <polygon points="9.75,15.02 15.5,11.75 9.75,8.48" fill="#fff" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Links */}
                    <div className="footer-links">
                        <div className="footer-column">
                            <h4>Product</h4>
                            <ul>
                                <li><Link to="/features">Features</Link></li>
                                <li><Link to="/pricing">Pricing</Link></li>
                                <li><Link to="/security">Security</Link></li>
                                <li><Link to="/roadmap">Roadmap</Link></li>
                            </ul>
                        </div>

                        <div className="footer-column">
                            <h4>Company</h4>
                            <ul>
                                <li><Link to="/about">About Us</Link></li>
                                <li><Link to="/careers">Careers</Link></li>
                                <li><Link to="/blog">Blog</Link></li>
                                <li><Link to="/press">Press Kit</Link></li>
                            </ul>
                        </div>

                        <div className="footer-column">
                            <h4>Resources</h4>
                            <ul>
                                <li><Link to="/help">Help Center</Link></li>
                                <li><Link to="/guides">Guides</Link></li>
                                <li><Link to="/api">API Docs</Link></li>
                                <li><Link to="/community">Community</Link></li>
                            </ul>
                        </div>

                        <div className="footer-column">
                            <h4>Legal</h4>
                            <ul>
                                <li><Link to="/privacy">Privacy Policy</Link></li>
                                <li><Link to="/terms">Terms of Service</Link></li>
                                <li><Link to="/cookies">Cookie Policy</Link></li>
                                <li><Link to="/compliance">Compliance</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Newsletter */}
                <div className="footer-newsletter">
                    <div className="newsletter-content">
                        <h4>📬 Stay Updated</h4>
                        <p>Get financial tips and product updates in your inbox.</p>
                    </div>
                    <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                        <input type="email" placeholder="Enter your email" />
                        <button type="submit">Subscribe →</button>
                    </form>
                </div>

                {/* Bottom Bar */}
                <div className="footer-bottom">
                    <div className="footer-copyright">
                        <p>© 2024 Family Pool. Made with ❤️ in India</p>
                    </div>
                    <div className="footer-badges">
                        <span className="badge">🔒 Bank-grade Security</span>
                        <span className="badge">🏆 ISO 27001 Certified</span>
                        <span className="badge">🇮🇳 RBI Compliant</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
