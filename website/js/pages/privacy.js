// RealOps — Privacy Policy Page

const PrivacyPage = {
  render: () => {
    return `
      <div class="page-transition">
        <!-- Header -->
        <header class="hero" style="min-height: 40vh; display: flex; align-items: center; justify-content: center; text-align: center; background: linear-gradient(to bottom, rgba(5,5,5,0.8), var(--color-bg)), url('assets/hero-bg.jpg') center/cover; padding-top: 80px;">
          <div class="container">
            <h1 class="hero-title" style="font-size: 48px; margin-bottom: 16px;">Privacy <span style="color: var(--color-primary);">Policy</span></h1>
            <p class="hero-subtitle" style="font-size: 18px; color: var(--color-text-secondary); max-width: 600px; margin: 0 auto;">
              How we collect, use, and protect your data at RealOps.
            </p>
          </div>
        </header>

        <!-- Content -->
        <section class="section" style="padding-top: 40px; padding-bottom: 80px;">
          <div class="container" style="max-width: 800px; margin: 0 auto;">
            <div class="glass-panel" style="padding: 40px; text-align: left;">
              
              <h2 style="font-size: 24px; color: var(--color-primary); margin-bottom: 16px; border-bottom: 1px solid var(--color-border); padding-bottom: 8px;">1. Information We Collect</h2>
              <p style="font-size: 16px; color: var(--color-text-secondary); line-height: 1.7; margin-bottom: 24px;">
                When you interact with the RealOps website or dashboard, we may collect information such as your Discord ID, username, and necessary connection metadata required for our services to function. For partners and event organizers, we also collect server details and event links.
              </p>

              <h2 style="font-size: 24px; color: var(--color-primary); margin-bottom: 16px; border-bottom: 1px solid var(--color-border); padding-bottom: 8px;">2. How We Use Information</h2>
              <p style="font-size: 16px; color: var(--color-text-secondary); line-height: 1.7; margin-bottom: 24px;">
                The data we collect is strictly used to provide and improve the RealOps Convoy Control services. This includes managing events, authenticating staff members on the dashboard, and tracking internal statistics. We do not sell or rent your personal data to third parties.
              </p>

              <h2 style="font-size: 24px; color: var(--color-primary); margin-bottom: 16px; border-bottom: 1px solid var(--color-border); padding-bottom: 8px;">3. Data Security & Retention</h2>
              <p style="font-size: 16px; color: var(--color-text-secondary); line-height: 1.7; margin-bottom: 24px;">
                We implement robust security measures to safeguard your information against unauthorized access. Data is retained only for as long as necessary to fulfill the purposes for which it was collected or to comply with legal obligations.
              </p>

              <h2 style="font-size: 24px; color: var(--color-primary); margin-bottom: 16px; border-bottom: 1px solid var(--color-border); padding-bottom: 8px;">4. Third-Party Services</h2>
              <p style="font-size: 16px; color: var(--color-text-secondary); line-height: 1.7; margin-bottom: 24px;">
                RealOps integrates with third-party platforms such as Discord and TruckersMP. We are not responsible for the privacy practices of these external services. We encourage you to review their respective privacy policies.
              </p>

              <h2 style="font-size: 24px; color: var(--color-primary); margin-bottom: 16px; border-bottom: 1px solid var(--color-border); padding-bottom: 8px;">5. Contact Us</h2>
              <p style="font-size: 16px; color: var(--color-text-secondary); line-height: 1.7; margin-bottom: 0;">
                If you have any questions regarding this Privacy Policy, please reach out to our management team via our Discord server or through the contact page.
              </p>
              
            </div>
          </div>
        </section>
      </div>
    `;
  }
};
