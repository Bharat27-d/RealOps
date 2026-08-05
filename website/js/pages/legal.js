// ============================================================
// RealOps — Legal & Terms of Service Page
// ============================================================

const LegalPage = {
  render: () => {
    return `
      <div class="container" style="padding-top: 130px; padding-bottom: 80px;">
        
        <div style="text-align: center; margin-bottom: 48px;" class="reveal">
          <h1 style="font-size: clamp(36px, 5vw, 56px); font-weight: 800; color: #ffffff;">
            Terms of <span class="gradient-text-orange">Service</span>
          </h1>
          <p style="font-size: 16px; color: var(--color-text-secondary); max-width: 600px; margin: 12px auto 0; line-height: 1.6;">
            Legal disclaimers, intellectual property, and community service terms.
          </p>
        </div>

        <div class="bento-card reveal" style="max-width: 840px; margin: 0 auto; padding: 48px;">
          <h2 style="font-size: 22px; color: var(--color-primary); margin-bottom: 12px;">1. Terms Acceptance</h2>
          <p style="font-size: 15px; color: var(--color-text-secondary); line-height: 1.7; margin-bottom: 32px;">
            By utilizing the RealOps website, dashboard, or Discord bot services, you agree to comply with our operational terms and TruckersMP community regulations.
          </p>

          <h2 style="font-size: 22px; color: var(--color-primary); margin-bottom: 12px;">2. Community Disclaimer</h2>
          <p style="font-size: 15px; color: var(--color-text-secondary); line-height: 1.7; margin-bottom: 32px;">
            RealOps is an independent virtual convoy management team operating within TruckersMP. We are not officially affiliated with SCS Software or TruckersMP staff unless specified.
          </p>

          <h2 style="font-size: 22px; color: var(--color-primary); margin-bottom: 12px;">3. Intellectual Property</h2>
          <p style="font-size: 15px; color: var(--color-text-secondary); line-height: 1.7; margin-bottom: 32px;">
            The RealOps brand name, logos, custom bot codebase, and web assets are owned by the RealOps Group. Unauthorized duplication or redistribution is restricted.
          </p>

          <h2 style="font-size: 22px; color: var(--color-primary); margin-bottom: 12px;">4. Amendments</h2>
          <p style="font-size: 15px; color: var(--color-text-secondary); line-height: 1.7;">
            RealOps reserves the right to modify these terms at any time. Continued use of our platform constitutes agreement to the updated terms.
          </p>
        </div>

      </div>
    `;
  }
};
