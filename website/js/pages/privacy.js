// ============================================================
// RealOps — Privacy Policy Page
// ============================================================

const PrivacyPage = {
  render: () => {
    return `
      <div class="container" style="padding-top: 130px; padding-bottom: 80px;">
        
        <div style="text-align: center; margin-bottom: 48px;" class="reveal">
          <h1 style="font-size: clamp(36px, 5vw, 56px); font-weight: 800; color: #ffffff;">
            Privacy <span class="gradient-text-orange">Policy</span>
          </h1>
          <p style="font-size: 16px; color: var(--color-text-secondary); max-width: 600px; margin: 12px auto 0; line-height: 1.6;">
            How we protect, store, and process user data across our website, discord bot, and dashboard.
          </p>
        </div>

        <div class="bento-card reveal" style="max-width: 840px; margin: 0 auto; padding: 48px;">
          <h2 style="font-size: 22px; color: var(--color-primary); margin-bottom: 12px;">1. Information We Collect</h2>
          <p style="font-size: 15px; color: var(--color-text-secondary); line-height: 1.7; margin-bottom: 32px;">
            When you interact with RealOps services, we collect minimal operational data including Discord IDs, usernames, ticket interaction logs, and event participation links.
          </p>

          <h2 style="font-size: 22px; color: var(--color-primary); margin-bottom: 12px;">2. How We Use Data</h2>
          <p style="font-size: 15px; color: var(--color-text-secondary); line-height: 1.7; margin-bottom: 32px;">
            Data is strictly utilized for automated ticket dispatching, staff authentication, and community telemetry. We never sell or share data with external third parties.
          </p>

          <h2 style="font-size: 22px; color: var(--color-primary); margin-bottom: 12px;">3. Security & Storage</h2>
          <p style="font-size: 15px; color: var(--color-text-secondary); line-height: 1.7; margin-bottom: 32px;">
            All information is encrypted and securely stored using Firebase Firestore database rules with HTTPS SSL transit protection.
          </p>

          <h2 style="font-size: 22px; color: var(--color-primary); margin-bottom: 12px;">4. Contact & Inquiries</h2>
          <p style="font-size: 15px; color: var(--color-text-secondary); line-height: 1.7;">
            For privacy inquiries or data removal requests, submit a support ticket on our official Discord server.
          </p>
        </div>

      </div>
    `;
  }
};
