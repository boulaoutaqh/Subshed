export default function PrivacyPage() {
  return (
    <div
      style={{
        maxWidth: 800,
        margin: "0 auto",
        padding: "2rem 1.5rem",
        lineHeight: 1.7,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
        Privacy Policy — Subshed
      </h1>
      <p style={{ color: "#666", marginBottom: "2rem" }}>
        Last updated: June 9, 2026
      </p>

      <p style={{ marginBottom: "2rem" }}>
        Subshed (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates
        subshedapp.com. This page explains how we collect, use, and protect your
        information.
      </p>

      <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
        1. Information We Collect
      </h2>
      <p style={{ marginBottom: "1.5rem" }}>
        We access your Gmail inbox metadata to identify recurring subscription
        charges. We do not store the content of your emails. We only collect
        your name, email address, and subscription data detected from your inbox.
      </p>

      <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
        2. How We Use Your Information
      </h2>
      <p style={{ marginBottom: "1.5rem" }}>
        We use your Gmail data solely to detect subscription-related emails and
        display them in your dashboard. We do not sell or share your data with
        third parties. Gmail data is never used for advertising or to train AI
        models.
      </p>

      <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
        3. Data Storage
      </h2>
      <p style={{ marginBottom: "1.5rem" }}>
        Detected subscriptions are stored securely in our database hosted on
        Supabase with encryption at rest. You can delete your data at any time
        by contacting us at support@subshedapp.com.
      </p>

      <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
        4. Data Security
      </h2>
      <p style={{ marginBottom: "1.5rem" }}>
        We implement industry-standard security measures to protect your data,
        including HTTPS encryption for all data in transit, encrypted database
        storage, and OAuth 2.0 for secure authentication. We do not store your
        Gmail access tokens beyond the active session. Access to user data is
        strictly limited to essential operations only.
      </p>

      <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
        5. Data Retention
      </h2>
      <p style={{ marginBottom: "1.5rem" }}>
        We retain your subscription data for as long as your account is active.
        If you request account deletion, all your personal data will be
        permanently removed within 30 days.
      </p>

      <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
        6. Your Rights
      </h2>
      <p style={{ marginBottom: "1.5rem" }}>
        You have the right to access, correct, or delete your personal data at
        any time. You can also revoke Subshed access to your Gmail account at
        any time via your Google Account permissions page at
        myaccount.google.com/permissions.
      </p>

      <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
        7. Third-Party Services
      </h2>
      <p style={{ marginBottom: "1.5rem" }}>
        We use the following third-party services: Google OAuth 2.0 for
        authentication, Supabase for database storage, and Lemon Squeezy for
        payment processing. Each service has its own privacy policy and data
        protection practices.
      </p>

      <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
        8. Google API
      </h2>
      <p style={{ marginBottom: "1.5rem" }}>
        Our use of Google API data is limited to reading email metadata to
        identify subscriptions. We comply with the Google API Services User Data
        Policy, including the Limited Use requirements. We do not transfer Google
        user data to third parties except as necessary to provide our service.
      </p>

      <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
        9. Contact
      </h2>
      <p style={{ marginBottom: "1.5rem" }}>
        For any questions or data requests, contact us at
        support@subshedapp.com
      </p>
    </div>
  );
}