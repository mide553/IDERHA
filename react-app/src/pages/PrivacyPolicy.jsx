import React from 'react';
import '../css/PrivacyPolicy.css';

const PrivacyPolicy = () => {
    return (
        <div className="privacy-page">
            <h1>Privacy Policy</h1>
            <div className="content">
                <p><em>Last Updated: January 13, 2026</em></p>
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                <p>
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </p>

                <section >
                    <h2>2. Information We Collect</h2>
                    <h3>2.1 User Account Information</h3>
                    <p>When you create or use an account, we collect:</p>
                    <ul>
                        <li>Email address</li>
                        <li>First and last name</li>
                        <li>User role (admin, hospital, researcher)</li>
                        <li>Assigned hospital database (for hospital and researcher users)</li>
                        <li>Password (encrypted using industry-standard BCrypt hashing)</li>
                    </ul>

                    <h3>2.2 Healthcare Data</h3>
                    <p>Hospital users may upload healthcare data in OMOP Common Data Model format, including:</p>
                    <ul>
                        <li>Patient demographic information</li>
                        <li>Medical conditions and diagnoses</li>
                        <li>Drug exposures and prescriptions</li>
                        <li>Healthcare visits and procedures</li>
                        <li>Clinical observations and measurements</li>
                    </ul>
                    <p>
                        <strong>Important:</strong> All patient data should be de-identified or anonymized according to applicable
                        regulations before upload. The Platform does not verify de-identification; this is the responsibility
                        of the uploading institution.
                    </p>

                    <h3>2.3 Usage Information</h3>
                    <p>We automatically collect:</p>
                    <ul>
                        <li>Login times and session information</li>
                        <li>Queries executed and data accessed</li>
                        <li>API usage and requests</li>
                        <li>System interactions and feature usage</li>
                    </ul>
                </section>

                <section >
                    <h2>3. How We Use Your Information</h2>
                    <p>We use collected information for the following purposes:</p>
                    <ul>
                        <li><strong>Service Delivery:</strong> To provide analytics and data management functionality</li>
                        <li><strong>Authentication:</strong> To verify user identity and control access</li>
                        <li><strong>Data Processing:</strong> To execute queries and generate analytical insights</li>
                        <li><strong>Security:</strong> To detect and prevent unauthorized access or misuse</li>
                        <li><strong>Improvement:</strong> To enhance Platform features and performance</li>
                        <li><strong>Compliance:</strong> To meet legal and regulatory requirements</li>
                        <li><strong>Support:</strong> To respond to user inquiries and technical issues</li>
                    </ul>
                </section>

                <section >
                    <h2>4. Federated Architecture and Data Sovereignty</h2>
                    <p>
                        eHealth Insights uses a <strong>federated database architecture</strong>, which means:
                    </p>
                    <ul>
                        <li>Each hospital's data remains in its own dedicated database</li>
                        <li>Patient data is never centralized or aggregated into a single database</li>
                        <li>Hospitals maintain sovereignty and control over their data</li>
                        <li>Queries are executed separately on each database and results are combined</li>
                        <li>Data remains within the hospital's infrastructure unless explicitly shared</li>
                    </ul>
                    <p>
                        This architecture ensures that healthcare institutions retain ownership and control of their patient
                        data while still enabling cross-institutional analytics.
                    </p>
                </section>

                <section >
                    <h2>5. Data Access and Sharing</h2>
                    <h3>5.1 Who Can Access Data</h3>
                    <p>Access to healthcare data is strictly controlled:</p>
                    <ul>
                        <li><strong>Hospital Users:</strong> Can upload and manage data only for their assigned hospital</li>
                        <li><strong>Researcher Users:</strong> Can query data only from hospitals they are authorized to access</li>
                        <li><strong>Admin Users:</strong> Have system administration privileges but follow the same data access rules</li>
                    </ul>

                    <h3>5.2 Data Sharing</h3>
                    <p>We do not sell, rent, or share healthcare data with third parties except:</p>
                    <ul>
                        <li>When required by law or legal process</li>
                        <li>With authorized researchers as per institutional agreements</li>
                        <li>To prevent fraud or security threats</li>
                        <li>With your explicit consent</li>
                    </ul>
                </section>

                <section >
                    <h2>6. Data Security</h2>
                    <p>We implement comprehensive security measures to protect your data:</p>
                    <ul>
                        <li><strong>Encryption:</strong> All data transmissions use HTTPS/TLS encryption</li>
                        <li><strong>Password Security:</strong> Passwords are hashed using BCrypt with salt</li>
                        <li><strong>Access Control:</strong> Role-based permissions and session management</li>
                        <li><strong>Database Isolation:</strong> Separate databases for each hospital</li>
                        <li><strong>API Security:</strong> API key authentication for programmatic access</li>
                        <li><strong>Audit Logging:</strong> Tracking of data access and modifications</li>
                        <li><strong>Regular Updates:</strong> Security patches and system maintenance</li>
                    </ul>
                    <p>
                        While we implement industry-standard security measures, no system is 100% secure. Users should
                        also follow security best practices and report any suspected security issues immediately.
                    </p>
                </section>

                <section >
                    <h2>7. Data Retention</h2>
                    <p>We retain data according to the following policies:</p>
                    <ul>
                        <li><strong>Healthcare Data:</strong> Retained until explicitly deleted by authorized hospital users</li>
                        <li><strong>User Accounts:</strong> Retained while account is active; deleted upon account termination</li>
                        <li><strong>Audit Logs:</strong> Retained for regulatory compliance periods (typically 6-7 years)</li>
                        <li><strong>API Keys:</strong> Retained until revoked by user or administrator</li>
                    </ul>
                    <p>
                        Healthcare institutions may have their own retention policies that supersede these guidelines.
                    </p>
                </section>

                <section >
                    <h2>8. Your Rights</h2>
                    <p>Depending on your jurisdiction, you may have the following rights:</p>
                    <ul>
                        <li><strong>Access:</strong> Request information about what data we hold about you</li>
                        <li><strong>Correction:</strong> Request correction of inaccurate data</li>
                        <li><strong>Deletion:</strong> Request deletion of your data (subject to legal requirements)</li>
                        <li><strong>Export:</strong> Receive a copy of your data in a portable format</li>
                        <li><strong>Restriction:</strong> Request limitation on how we process your data</li>
                        <li><strong>Objection:</strong> Object to certain types of data processing</li>
                    </ul>
                    <p>
                        To exercise these rights, contact your system administrator or our privacy team.
                    </p>
                </section>

                <section >
                    <h2>9. Cookies and Tracking</h2>
                    <p>
                        The Platform uses session cookies to maintain user authentication and session state. These cookies
                        are essential for Platform operation and are deleted when you log out or close your browser.
                        We do not use tracking cookies or third-party analytics services.
                    </p>
                </section>

                <section >
                    <h2>10. International Data Transfers</h2>
                    <p>
                        Healthcare data remains within the jurisdiction of the hosting institution. User account information
                        may be processed in different locations depending on server infrastructure. We ensure appropriate
                        safeguards are in place for any cross-border data transfers in compliance with applicable laws.
                    </p>
                </section>

                <section >
                    <h2>11. Children's Privacy</h2>
                    <p>
                        The Platform is not intended for use by individuals under 18 years of age. We do not knowingly
                        collect personal information from children. If you believe we have inadvertently collected such
                        information, please contact us immediately.
                    </p>
                </section>

                <section >
                    <h2>12. Changes to Privacy Policy</h2>
                    <p>
                        We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements.
                        Material changes will be communicated through the Platform or via email. Continued use after changes
                        constitutes acceptance of the updated policy.
                    </p>
                </section>

                <section >
                    <h2>13. Data Breach Notification</h2>
                    <p>
                        In the event of a data breach that may compromise your personal or healthcare information, we will:
                    </p>
                    <ul>
                        <li>Investigate and contain the breach promptly</li>
                        <li>Notify affected users within required timeframes</li>
                        <li>Report to relevant regulatory authorities as required by law</li>
                        <li>Take steps to prevent future occurrences</li>
                    </ul>
                </section>

                <p>
                    Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium,
                    totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                </p>
                <p>
                    Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores
                    eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.
                </p>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
