import React from 'react';
import '../css/AboutUs.css';

const AboutUs = () => {
    return (
        <div className="aboutus-main">
            <h1>About Us</h1>
            <div className="content">
                <h2>Project Overview</h2>
                <h3>Innovation Lab 1, Wintersemester 2024/25</h3>
                <p>eHealth Insights is developing a prototype for an eHealth Data Space, providing a secure and user-friendly platform. Our goal is to revolutionize the processing, analysis, and access to health data by enabling transparent and efficient data flow between healthcare stakeholders while maintaining security and data protection.</p>

                <h2>Our Team</h2>
                <ul>
                    <li data-details="if22b202">Erdem Mehdi</li>
                    <li data-details="if22b130">Zehinovic Aldin</li>
                    <li data-details="if23b040">Dervisefendic Armin</li>
                </ul>
                <h3>Supervised by: Lukas Rohatsch</h3>

                <h2>Technologies</h2>
                <ul>
                    <li data-details="RESTful API, Security, Spring Security">Backend: Java with Spring Boot</li>
                    <li data-details="Component-Based Architecture, SPA">Frontend: React.js and Vite</li>
                    <li data-details="Relational Database, Data Persistence">Database: PostgreSQL</li>
                    <li data-details="Version Control System, Collaboration">Version Control: Git</li>
                    <li data-details="API Documentation Tool, Testing">API Documentation: Swagger</li>
                </ul>
            </div>
        </div>
    );
};

export default AboutUs;