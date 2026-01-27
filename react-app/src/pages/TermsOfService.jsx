import React from 'react';
import '../css/TermsOfService.css';

const TermsOfService = () => {
    return (
        <div className="terms-page">
            <h1>Terms of Service</h1>
            <div className="content">
                <p><em>Last Updated: January 13, 2026</em></p>
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                <p>
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </p>

                <section >
                    <h2>2. Description of Service</h2>
                    <p>
                        eHealth Insights is a federated health analytics platform that enables authorized users to:
                    </p>
                    <ul>
                        <li>Upload and manage healthcare data following the OMOP Common Data Model</li>
                        <li>Query and analyze patient data across multiple healthcare institutions</li>
                        <li>Generate insights from federated health databases while maintaining data sovereignty</li>
                        <li>Manage user accounts and access permissions</li>
                        <li>Access data through web interface and API</li>
                    </ul>
                </section>

                <section >
                    <h2>3. User Accounts and Responsibilities</h2>
                    <h3>3.1 Account Security</h3>
                    <p>
                        You are responsible for maintaining the confidentiality of your account credentials. You must:
                    </p>
                    <ul>
                        <li>Use a strong, unique password</li>
                        <li>Not share your credentials with any third party</li>
                        <li>Notify administrators immediately of any unauthorized access</li>
                        <li>Log out from shared or public computers</li>
                    </ul>

                    <h3>3.2 User Roles and Permissions</h3>
                    <p>
                        Access to features is determined by your assigned role:
                    </p>
                    <ul>
                        <li><strong>Admin:</strong> Full system access, user management, and configuration</li>
                        <li><strong>Hospital:</strong> Data upload for assigned hospital and researcher account management</li>
                        <li><strong>Researcher:</strong> Query and analysis capabilities for assigned hospitals</li>
                    </ul>
                </section>

                <section >
                    <h2>4. Data Usage and Compliance</h2>
                    <h3>4.1 Data Accuracy</h3>
                    <p>
                        Users uploading data must ensure that:
                    </p>
                    <ul>
                        <li>Data is accurate, complete, and follows OMOP CDM standards</li>
                        <li>All necessary consents and approvals have been obtained</li>
                        <li>Data complies with applicable healthcare regulations (HIPAA, GDPR, etc.)</li>
                        <li>Patient identifiers are properly de-identified or anonymized where required</li>
                    </ul>

                    <h3>4.2 Acceptable Use</h3>
                    <p>You agree to use the Platform only for legitimate healthcare research and analytics purposes. You must NOT:</p>
                    <ul>
                        <li>Attempt to re-identify anonymized patient data</li>
                        <li>Share data with unauthorized parties</li>
                        <li>Use data for commercial purposes without proper authorization</li>
                        <li>Upload malicious code or attempt to compromise system security</li>
                        <li>Access data beyond your authorized scope</li>
                        <li>Interfere with the Platform's operation or other users' access</li>
                    </ul>
                </section>

                <section >
                    <h2>5. Intellectual Property</h2>
                    <p>
                        The Platform's software, design, and documentation are protected by intellectual property laws.
                        Users retain ownership of their uploaded data, but grant the Platform necessary rights to store,
                        process, and display the data as required for service operation.
                    </p>
                </section>

                <section >
                    <h2>6. Privacy and Data Protection</h2>
                    <p>
                        Your use of the Platform is also governed by our Privacy Policy. We are committed to protecting
                        healthcare data and complying with all applicable privacy regulations. Each hospital's data remains
                        in its own database, ensuring data sovereignty.
                    </p>
                </section>

                <section >
                    <h2>7. Service Availability</h2>
                    <p>
                        While we strive to maintain continuous service availability, we do not guarantee uninterrupted access.
                        The Platform may be temporarily unavailable due to:
                    </p>
                    <ul>
                        <li>Scheduled maintenance</li>
                        <li>Emergency repairs</li>
                        <li>Technical difficulties</li>
                        <li>Circumstances beyond our control</li>
                    </ul>
                </section>

                <section >
                    <h2>8. Limitation of Liability</h2>
                    <p>
                        The Platform is provided "as is" without warranties of any kind. To the fullest extent permitted by law,
                        we disclaim all liability for:
                    </p>
                    <ul>
                        <li>Data loss or corruption</li>
                        <li>Service interruptions</li>
                        <li>Unauthorized access to data</li>
                        <li>Decisions made based on Platform analytics</li>
                        <li>Indirect, incidental, or consequential damages</li>
                    </ul>
                    <p>
                        Users should maintain independent backups of critical data and verify analytical results before making
                        important decisions.
                    </p>
                </section>

                <section >
                    <h2>9. Termination</h2>
                    <p>
                        We reserve the right to suspend or terminate user accounts that:
                    </p>
                    <ul>
                        <li>Violate these Terms of Service</li>
                        <li>Engage in unauthorized or illegal activities</li>
                        <li>Compromise system security or other users' access</li>
                        <li>Remain inactive for extended periods</li>
                    </ul>
                    <p>
                        Users may request account termination by contacting their administrator.
                    </p>
                </section>

                <section >
                    <h2>10. Changes to Terms</h2>
                    <p>
                        We may update these Terms of Service periodically. Continued use of the Platform after changes
                        constitutes acceptance of the updated terms. We will notify users of material changes through
                        the Platform or via email.
                    </p>
                </section>

                <section >
                    <h2>11. Governing Law</h2>
                    <p>
                        These Terms of Service are governed by applicable healthcare regulations and the laws of the
                        jurisdiction in which the Platform operates. Any disputes will be resolved in accordance with
                        these laws.
                    </p>
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

export default TermsOfService;
