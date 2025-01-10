import React from 'react';
import { Link } from 'react-router-dom';
import '../css/Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-links">
                    <Link to="/privacy-policy">Privacy Policy</Link>
                    <Link to="/terms-of-service">Terms of Service</Link>
                    <Link to="/about-us">About Us</Link>
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