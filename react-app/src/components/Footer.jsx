import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-links">
                    <a href="/privacy-policy">Privacy Policy</a>
                    <a href="/terms-of-service">Terms of Service</a>
                    <a href="/about-us">About Us</a>
                </div>
                <div className="footer-contact">
                    <p>Email: <a href="mailto:support@innoproject.com">support@innoproject.com</a></p>
                    <p>Phone: +43 123 456 789</p>
                </div>
                <div className="footer-copy">
                    <p>&copy; 2024 IDERHA Team 23</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;