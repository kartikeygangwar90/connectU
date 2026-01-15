import React from "react";
import { useNavigate } from "react-router-dom";

function Policy() {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  const pageStyle = {
    minHeight: "100vh",
    background: "#f3f4f6",
    padding: "3rem 1.5rem",
  };

  const titleStyle = {
    fontSize: "2.5rem",
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: "2rem",
  };

  const contentStyle = {
    maxWidth: "800px",
    margin: "0 auto",
    background: "#ffffff",
    borderRadius: "1.5rem",
    padding: "2rem",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
  };

  const sectionStyle = {
    marginBottom: "2rem",
  };

  const headingStyle = {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "0.75rem",
  };

  const paragraphStyle = {
    color: "#4b5563",
    lineHeight: "1.8",
    marginBottom: "0.5rem",
    fontSize: "1rem",
  };

  const listStyle = {
    paddingLeft: "1.5rem",
    color: "#4b5563",
  };

  const listItemStyle = {
    color: "#4b5563",
    lineHeight: "1.8",
    marginBottom: "0.5rem",
  };

  const buttonStyle = {
    display: "block",
    maxWidth: "200px",
    margin: "2rem auto 0",
    padding: "0.75rem 1.5rem",
    border: "none",
    borderRadius: "0.75rem",
    background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
    color: "#ffffff",
    fontWeight: "600",
    cursor: "pointer",
    textAlign: "center",
    fontSize: "1rem",
  };

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>Terms & Conditions</h1>
      <div style={contentStyle}>
        <div style={sectionStyle}>
          <h2 style={headingStyle}>1. Acceptance of Terms</h2>
          <p style={paragraphStyle}>
            By accessing and using ConnectU, you accept and agree to be bound by
            the terms and provisions of this agreement. This platform is
            exclusively designed for students of NIT Patna to facilitate team
            formation for college events and competitions.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>2. User Registration</h2>
          <p style={paragraphStyle}>To use ConnectU, you must:</p>
          <ul style={listStyle}>
            <li style={listItemStyle}>Be a currently enrolled student at NIT Patna</li>
            <li style={listItemStyle}>Provide accurate and complete registration information</li>
            <li style={listItemStyle}>Use your official college email address for verification</li>
            <li style={listItemStyle}>Maintain the security of your account credentials</li>
            <li style={listItemStyle}>Be at least 18 years of age or have parental consent</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>3. User Conduct</h2>
          <p style={paragraphStyle}>When using ConnectU, you agree to:</p>
          <ul style={listStyle}>
            <li style={listItemStyle}>Provide truthful information about your skills and experience</li>
            <li style={listItemStyle}>Treat other users with respect and professionalism</li>
            <li style={listItemStyle}>Not engage in harassment, discrimination, or bullying</li>
            <li style={listItemStyle}>Not share inappropriate or offensive content</li>
            <li style={listItemStyle}>Not misuse the platform for purposes other than team formation</li>
            <li style={listItemStyle}>Respond to team requests in a timely manner</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>4. Team Formation</h2>
          <p style={paragraphStyle}>
            ConnectU facilitates connections between students for team formation.
            We do not guarantee:
          </p>
          <ul style={listStyle}>
            <li style={listItemStyle}>That you will find suitable teammates</li>
            <li style={listItemStyle}>The success of any team or project</li>
            <li style={listItemStyle}>The accuracy of information provided by other users</li>
            <li style={listItemStyle}>That all users will respond to your requests</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>5. Privacy & Data Protection</h2>
          <p style={paragraphStyle}>
            We respect your privacy and are committed to protecting your personal
            data. By using ConnectU:
          </p>
          <ul style={listStyle}>
            <li style={listItemStyle}>Your profile information will be visible to other registered users</li>
            <li style={listItemStyle}>Your contact details will only be shared with approved team members</li>
            <li style={listItemStyle}>We will not sell or share your data with third parties</li>
            <li style={listItemStyle}>You can request deletion of your account at any time</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>6. Intellectual Property</h2>
          <p style={paragraphStyle}>
            All content, features, and functionality of ConnectU are owned by the
            platform administrators and are protected by copyright laws. Users
            retain ownership of their profile content but grant ConnectU a license
            to display it on the platform.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>7. Disclaimer of Warranties</h2>
          <p style={paragraphStyle}>
            ConnectU is provided "as is" without any warranties, express or
            implied. We do not warrant that the service will be uninterrupted,
            secure, or error-free. Use of the platform is at your own risk.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>8. Limitation of Liability</h2>
          <p style={paragraphStyle}>
            ConnectU and its administrators shall not be liable for any indirect,
            incidental, special, or consequential damages arising from your use of
            the platform, including but not limited to loss of data, team
            conflicts, or missed opportunities.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>9. Modifications to Terms</h2>
          <p style={paragraphStyle}>
            We reserve the right to modify these terms at any time. Users will be
            notified of significant changes. Continued use of the platform after
            modifications constitutes acceptance of the updated terms.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>10. Contact Information</h2>
          <p style={paragraphStyle}>
            For questions or concerns about these terms, please contact the
            ConnectU team through the official college channels or email us at
            connectu@nitp.ac.in.
          </p>
        </div>

        <button style={buttonStyle} onClick={goBack}>
          ← Go Back
        </button>
      </div>
    </div>
  );
}

export default Policy;
