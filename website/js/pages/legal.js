// RealOps — Legal Page

const LegalPage = {
  render: () => {
    return `
      <div class="page-transition">
        <!-- Header -->
        <header class="hero" style="min-height: 40vh; display: flex; align-items: center; justify-content: center; text-align: center; background: linear-gradient(to bottom, rgba(5,5,5,0.8), var(--color-bg)), url('assets/hero-bg.jpg') center/cover; padding-top: 80px;">
          <div class="container">
            <h1 class="hero-title" style="font-size: 48px; margin-bottom: 16px;">Legal <span style="color: var(--color-primary);">Information</span></h1>
            <p class="hero-subtitle" style="font-size: 18px; color: var(--color-text-secondary); max-width: 600px; margin: 0 auto;">
              Terms of service and legal disclaimers.
            </p>
          </div>
        </header>

        <!-- Content -->
        <section class="section" style="padding-top: 40px; padding-bottom: 80px;">
          <div class="container" style="max-width: 800px; margin: 0 auto;">
            <div class="glass-panel" style="padding: 40px; text-align: left;">
              
              <h2 style="font-size: 24px; color: var(--color-primary); margin-bottom: 16px; border-bottom: 1px solid var(--color-border); padding-bottom: 8px;">1. Terms of Service</h2>
              <p style="font-size: 16px; color: var(--color-text-secondary); line-height: 1.7; margin-bottom: 24px;">
                By accessing the RealOps website, dashboard, and services, you agree to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
              </p>

              <h2 style="font-size: 24px; color: var(--color-primary); margin-bottom: 16px; border-bottom: 1px solid var(--color-border); padding-bottom: 8px;">2. Disclaimer of Liability</h2>
              <p style="font-size: 16px; color: var(--color-text-secondary); line-height: 1.7; margin-bottom: 24px;">
                RealOps is an independent virtual community operating within the TruckersMP network. We are not officially affiliated with, endorsed by, or sponsored by TruckersMP, SCS Software, or any of their partners. All services provided by RealOps are "as is" without warranty of any kind.
              </p>

              <h2 style="font-size: 24px; color: var(--color-primary); margin-bottom: 16px; border-bottom: 1px solid var(--color-border); padding-bottom: 8px;">3. Intellectual Property</h2>
              <p style="font-size: 16px; color: var(--color-text-secondary); line-height: 1.7; margin-bottom: 24px;">
                The RealOps name, logos, branding, website design, and custom dashboard software are the intellectual property of the RealOps Group. You may not use, reproduce, or distribute our intellectual property without explicit written permission.
              </p>

              <h2 style="font-size: 24px; color: var(--color-primary); margin-bottom: 16px; border-bottom: 1px solid var(--color-border); padding-bottom: 8px;">4. Modifications to Terms</h2>
              <p style="font-size: 16px; color: var(--color-text-secondary); line-height: 1.7; margin-bottom: 0;">
                RealOps reserves the right to revise these terms of service at any time without notice. By using this website and our services, you are agreeing to be bound by the then current version of these terms of service.
              </p>
              
            </div>
          </div>
        </section>
      </div>
    `;
  }
};
