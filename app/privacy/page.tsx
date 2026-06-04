export default function PrivacyPage() {
  return (
    <main
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
        Last updated: June 3, 2026
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
        charges. We do not store the content of your emails.
      </p>

      <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
        2. How We Use Your Information
      </h2>
      <p style={{ marginBottom: "1.5rem" }}>
        We use your Gmail data solely to detect subscription-related emails and
        display them in your dashboard. We do not sell or share your data with
        third parties.
      </p>

      <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
        3. Data Storage
      </h2>
      <p style={{ marginBottom: "1.5rem" }}>
        Detected subscriptions are stored securely in our database. You can
        delete your data at any time by contacting us.
      </p>

      <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
        4. Google API
      </h2>
      <p style={{ marginBottom: "1.5rem" }}>
        Our use of Google API data is limited to reading email metadata to
        identify subscriptions. We comply with Google API Services User Data
        Policy, including the Limited Use requirements.
      </p>

      <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>5. Contact</h2>
      <p style={{ marginBottom: "1.5rem" }}>
        For any questions, contact us at support@subshedapp.com
      </p>
    </main>
  );
}
