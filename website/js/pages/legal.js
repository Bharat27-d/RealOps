// RealOps — Legal Information Page

const LegalPage = {
  render: () => {
    return `
      <!-- Main Container -->
      <main class="flex-grow relative z-10 pt-[100px] pb-xl px-4 md:px-lg mx-auto w-full flex flex-col" style="padding-top: 100px; padding-bottom: 80px; max-width: 860px; margin: 0 auto;">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 48px;" class="reveal">
          <div style="display: inline-flex; align-items: center; gap: 8px; padding: 4px 14px; background: rgba(255, 107, 53, 0.08); border: 1px solid rgba(255, 107, 53, 0.2); border-radius: 999px; margin-bottom: 16px;">
            <span class="status-beacon" style="width: 6px; height: 6px;"></span>
            <span style="font-family: var(--font-mono); font-size: 11px; font-weight: 600; color: var(--color-primary-light); text-transform: uppercase; letter-spacing: 0.12em;">LEGAL TERMS & DISCLAIMERS</span>
          </div>

          <h1 style="font-size: clamp(32px, 5vw, 48px); font-weight: 800; color: var(--color-text); margin: 0 0 14px; letter-spacing: -0.03em;">
            Legal Information
          </h1>
          
          <p style="font-size: 15px; color: var(--color-text-secondary); max-width: 540px; margin: 0 auto; line-height: 1.6;">
            Terms of service, community disclaimers, and intellectual property statements.
          </p>
        </div>

        <section class="reveal">
          <div class="bento-card" style="padding: 40px; background: rgba(18, 16, 16, 0.8); border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 24px;">
            
            <h2 style="font-size: 20px; font-weight: 700; color: var(--color-primary); margin: 0 0 12px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.06);">1. Terms of Service</h2>
            <p style="font-size: 14px; color: var(--color-text-secondary); line-height: 1.7; margin-bottom: 24px;">
              By accessing the RealOps website, dispatch terminal, and community tools, you agree to comply with these terms of service, community guidelines, and all applicable TruckersMP rules.
            </p>

            <h2 style="font-size: 20px; font-weight: 700; color: var(--color-primary); margin: 0 0 12px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.06);">2. Disclaimer of Affiliation</h2>
            <p style="font-size: 14px; color: var(--color-text-secondary); line-height: 1.7; margin-bottom: 24px;">
              RealOps Team is an independent virtual community operating within the TruckersMP network. We are not officially affiliated with, endorsed by, or sponsored by TruckersMP or SCS Software. All trademarks belong to their respective owners.
            </p>

            <h2 style="font-size: 20px; font-weight: 700; color: var(--color-primary); margin: 0 0 12px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.06);">3. Intellectual Property</h2>
            <p style="font-size: 14px; color: var(--color-text-secondary); line-height: 1.7; margin-bottom: 24px;">
              The RealOps name, logos, website layout, and custom management dashboard code are intellectual property of the RealOps Group. You may not reproduce or redistribute our assets without prior written consent.
            </p>

            <h2 style="font-size: 20px; font-weight: 700; color: var(--color-primary); margin: 0 0 12px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.06);">4. Updates to Terms</h2>
            <p style="font-size: 14px; color: var(--color-text-secondary); line-height: 1.7; margin: 0;">
              RealOps reserves the right to modify these terms at any time. Continued use of our website or services constitutes acceptance of the modified terms.
            </p>

          </div>
        </section>

      </main>
    `;
  }
};
