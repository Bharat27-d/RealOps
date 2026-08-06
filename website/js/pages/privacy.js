// RealOps — Privacy Policy Page

const PrivacyPage = {
  render: () => {
    return `
      <!-- Main Container -->
      <main class="flex-grow relative z-10 pt-[100px] pb-xl px-4 md:px-lg mx-auto w-full flex flex-col" style="padding-top: 100px; padding-bottom: 80px; max-width: 860px; margin: 0 auto;">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 48px;" class="reveal">
          <div style="display: inline-flex; align-items: center; gap: 8px; padding: 4px 14px; background: rgba(255, 107, 53, 0.08); border: 1px solid rgba(255, 107, 53, 0.2); border-radius: 999px; margin-bottom: 16px;">
            <span class="status-beacon" style="width: 6px; height: 6px;"></span>
            <span style="font-family: var(--font-mono); font-size: 11px; font-weight: 600; color: var(--color-primary-light); text-transform: uppercase; letter-spacing: 0.12em;">LEGAL & PRIVACY</span>
          </div>

          <h1 style="font-size: clamp(32px, 5vw, 48px); font-weight: 800; color: var(--color-text); margin: 0 0 14px; letter-spacing: -0.03em;">
            Privacy Policy
          </h1>
          
          <p style="font-size: 15px; color: var(--color-text-secondary); max-width: 540px; margin: 0 auto; line-height: 1.6;">
            How data is collected, processed, and protected across RealOps website and operations dashboard.
          </p>
        </div>

        <section class="reveal">
          <div class="bento-card" style="padding: 40px; background: rgba(18, 16, 16, 0.8); border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 24px;">
            
            <h2 style="font-size: 20px; font-weight: 700; color: var(--color-primary); margin: 0 0 12px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.06);">1. Information We Collect</h2>
            <p style="font-size: 14px; color: var(--color-text-secondary); line-height: 1.7; margin-bottom: 24px;">
              When you interact with the RealOps website or dashboard, we may collect minimal data such as your Discord ID, username, and connection metadata required for authentication and dispatch services to function. For partners and event organizers, we process event links and server details.
            </p>

            <h2 style="font-size: 20px; font-weight: 700; color: var(--color-primary); margin: 0 0 12px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.06);">2. How We Use Information</h2>
            <p style="font-size: 14px; color: var(--color-text-secondary); line-height: 1.7; margin-bottom: 24px;">
              Collected information is strictly used to provide and enhance RealOps on-road operations, manage event rosters, authenticate staff on the dispatch dashboard, and compile operational statistics. We do not sell or lease personal data to third parties.
            </p>

            <h2 style="font-size: 20px; font-weight: 700; color: var(--color-primary); margin: 0 0 12px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.06);">3. Data Security & Retention</h2>
            <p style="font-size: 14px; color: var(--color-text-secondary); line-height: 1.7; margin-bottom: 24px;">
              We enforce appropriate technical security measures to prevent unauthorized access. Information is retained only as long as necessary to fulfill operational requirements.
            </p>

            <h2 style="font-size: 20px; font-weight: 700; color: var(--color-primary); margin: 0 0 12px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.06);">4. Third-Party Integrations</h2>
            <p style="font-size: 14px; color: var(--color-text-secondary); line-height: 1.7; margin-bottom: 24px;">
              RealOps interfaces with external services including Discord and TruckersMP. We encourage you to review their respective terms and privacy documentation.
            </p>

            <h2 style="font-size: 20px; font-weight: 700; color: var(--color-primary); margin: 0 0 12px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.06);">5. Contact</h2>
            <p style="font-size: 14px; color: var(--color-text-secondary); line-height: 1.7; margin: 0;">
              If you have any questions regarding this Privacy Policy, please contact our management team via our Discord server or the contact page.
            </p>

          </div>
        </section>

      </main>
    `;
  }
};
