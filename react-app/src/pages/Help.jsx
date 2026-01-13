import React, { useState } from 'react';
import '../css/Help.css';

const Help = () => {
    const [expandedFAQ, setExpandedFAQ] = useState(null);

    const toggleFAQ = (index) => {
        setExpandedFAQ(expandedFAQ === index ? null : index);
    };

    const faqs = [
        {
            question: "What is eHealth Insights?",
            answer: "eHealth Insights is a federated health analytics platform that enables secure analysis of patient data across multiple hospitals while preserving data privacy and sovereignty. It uses the OMOP Common Data Model to standardize healthcare data."
        },
        {
            question: "How do I log in to the system?",
            answer: "Navigate to the Sign In page, enter your registered email address and password. If you don't have an account, contact your system administrator."
        },
        {
            question: "What are the different user roles?",
            answer: "There are three main roles: (1) Admin - full system access and user management, (2) Hospital - can upload data and create researcher accounts for their hospital, (3) Researcher - can query and analyze data from assigned hospitals."
        },
        {
            question: "How do I upload patient data?",
            answer: "Hospital users can navigate to the 'Upload Data' page. Select the data type (persons, conditions, drugs, visits, or observations), choose your CSV file following the OMOP CDM format, and click upload. The system will validate and import the data into your hospital's database."
        },
        {
            question: "How can I query the data?",
            answer: "On the Analytics page, select the hospitals you want to query, enter your SQL query following OMOP CDM standards, and click 'Run Query'. The results will be displayed in a table format and can be exported to CSV or JSON."
        },
        {
            question: "What is the OMOP Common Data Model?",
            answer: "OMOP CDM is a standardized data model for healthcare data that ensures consistency across different data sources. It includes standardized tables for persons, conditions, drug exposures, visits, observations, and vocabularies."
        },
        {
            question: "How do I manage users?",
            answer: "Admin and hospital users can access the 'Manage Users' page to view, create, edit, or delete user accounts. Hospital users can only manage researcher accounts they created."
        },
        {
            question: "Is my data secure?",
            answer: "Yes, eHealth Insights uses federated database architecture where each hospital's data remains in its own database. Data is never centralized. All communications are encrypted, and access is controlled through role-based permissions."
        },
        {
            question: "How do I generate an API key?",
            answer: "On the API page, enter a description for your API key and click 'Generate API Key'. Save the key securely as it won't be shown again. API keys can be used for programmatic access to the system."
        },
        {
            question: "What file formats are supported for data upload?",
            answer: "CSV (Comma-Separated Values) files are supported. The files must follow the OMOP CDM schema with proper column headers and data types."
        },
        {
            question: "How do I export query results?",
            answer: "After running a query, click the 'Export as CSV' or 'Export as JSON' button below the results table. The file will be downloaded to your default downloads folder."
        },
        {
            question: "What should I do if I forgot my password?",
            answer: "Contact your system administrator to reset your password. For security reasons, password reset must be done by an administrator."
        },
        {
            question: "Can I query data from multiple hospitals at once?",
            answer: "Yes, researcher users can select multiple hospitals from the checkbox list on the Analytics page. The query will be executed across all selected databases."
        },
        {
            question: "What browsers are supported?",
            answer: "eHealth Insights works best on modern browsers including Chrome, Firefox, Safari, and Edge. We recommend keeping your browser updated to the latest version."
        },
        {
            question: "How do I report a bug or request a feature?",
            answer: "Contact your system administrator or the development team with details about the issue or feature request."
        }
    ];

    return (
        <div className="help-page">
            <h1>Help & Support</h1>
            <div className="content">
                <section>
                    <h2>Getting Started</h2>
                    <p>
                        Welcome to eHealth Insights! This guide will help you navigate the platform and make the most of its features.
                        Whether you're a hospital administrator uploading data, a researcher analyzing patient information, or a system
                        administrator managing users, you'll find the information you need here.
                    </p>
                </section>

                <section>
                    <h2>Quick Navigation</h2>
                    <ul>
                        <li><strong>Home:</strong> Overview of the platform and recent updates</li>
                        <li><strong>Analytics:</strong> Query and analyze patient data across hospitals</li>
                        <li><strong>Upload Data:</strong> Import patient data in OMOP CDM format (Hospital users only)</li>
                        <li><strong>Manage Users:</strong> Create and manage user accounts (Admin and Hospital users)</li>
                        <li><strong>API:</strong> Generate API keys for programmatic access</li>
                        <li><strong>About Us:</strong> Learn about the project and team</li>
                    </ul>
                </section>

                <section>
                    <h2>Frequently Asked Questions</h2>
                    <div className="faq-container">
                        {faqs.map((faq, index) => (
                            <div key={index} className="faq-item">
                                <div
                                    onClick={() => toggleFAQ(index)}
                                    className="faq-question"
                                >
                                    <span className="faq-question-text">{faq.question}</span>
                                    <span className="faq-toggle">{expandedFAQ === index ? '−' : '+'}</span>
                                </div>
                                {expandedFAQ === index && (
                                    <div className="faq-answer">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <h2>Need More Help?</h2>
                    <p>
                        If you couldn't find the answer to your question in this help documentation, please contact your
                        system administrator or the eHealth Insights support team for assistance.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default Help;