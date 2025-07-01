import React from 'react';
import '../css/terms.css';


function Terms() {
  return (
    <div className="container content term-container my-5">
      <h2 className="mb-4">Terms and Regulations</h2>
      <div className="bg-light p-4 rounded">
        <h4>1. Introduction</h4>
        <p>
          Welcome to the "Know Your Neighbourhood" website for ABC Condo. By accessing or using this site, you agree to abide by these terms and regulations.
          Please read them carefully before participating in our community.
        </p>
        <h4>2. Community Guidelines</h4>
        <ul>
          <li>Respect all members, their privacy, and their opinions.</li>
          <li>Do not post offensive, discriminatory, or illegal content.</li>
          <li>Do not share members' personal information without consent.</li>
          <li>Use the platform to foster a welcoming and helpful environment.</li>
        </ul>
        <h4>3. Account Responsibilities</h4>
        <ul>
          <li>Keep your login credentials confidential and secure.</li>
          <li>You are responsible for all activities that occur under your account.</li>
          <li>Promptly report any unauthorized use or suspected breach of security.</li>
        </ul>
        <h4>4. Content Policy</h4>
        <ul>
          <li>All posts, comments, and recommendations must be relevant to the ABC Condo community.</li>
          <li>The management team reserves the right to remove content that violates these terms or is deemed inappropriate.</li>
        </ul>
        <h4>5. Privacy</h4>
        <p>
          Your personal information is collected and used in accordance with our Privacy Policy. We do not share your information with third parties except as required by law.
        </p>
        <h4>6. Disclaimer</h4>
        <p>
          The information shared on this platform is for community purposes only. ABC Condo is not responsible for the accuracy of user-generated content.
        </p>
        <h4>7. Amendments</h4>
        <p>
          These terms and regulations may be updated at any time. Continued use of the platform constitutes acceptance of the latest version.
        </p>
        <h4>8. Contact</h4>
        <p>
          For questions or concerns about these terms, please contact us at <a href="mailto:support@abccondo.com">support@abccondo.com</a>.
        </p>
        <p className="mt-4"><strong>Last updated:</strong> June 30, 2025</p>
      </div>
    </div>
  );
}

export default Terms;