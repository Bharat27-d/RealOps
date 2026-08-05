// RealOps — Community Guidelines Page

const GuidelinesPage = {
  render: () => {
    return `
      <div class="page-transition">
        <!-- Header -->
        <header class="hero" style="min-height: 40vh; display: flex; align-items: center; justify-content: center; text-align: center; background: linear-gradient(to bottom, rgba(5,5,5,0.8), var(--color-bg)), url('assets/hero-bg.jpg') center/cover; padding-top: 80px;">
          <div class="container">
            <h1 class="hero-title" style="font-size: 48px; margin-bottom: 16px;">Community <span style="color: var(--color-primary);">Guidelines</span></h1>
            <p class="hero-subtitle" style="font-size: 18px; color: var(--color-text-secondary); max-width: 600px; margin: 0 auto;">
              The rules and expectations for members of the RealOps community.
            </p>
          </div>
        </header>

        <!-- Content -->
        <section class="section" style="padding-top: 40px; padding-bottom: 80px;">
          <div class="container" style="max-width: 800px; margin: 0 auto;">
            <div class="glass-panel" style="padding: 40px; text-align: left;">
              
              <h2 style="font-size: 24px; color: var(--color-primary); margin-bottom: 16px; border-bottom: 1px solid var(--color-border); padding-bottom: 8px;">1. Respect and Professionalism</h2>
              <p style="font-size: 16px; color: var(--color-text-secondary); line-height: 1.7; margin-bottom: 24px;">
                Treat all members of the community, staff, and external event participants with respect. Harassment, hate speech, toxicity, and discrimination of any kind are strictly prohibited and will result in immediate removal from our services.
              </p>

              <h2 style="font-size: 24px; color: var(--color-primary); margin-bottom: 16px; border-bottom: 1px solid var(--color-border); padding-bottom: 8px;">2. Event Conduct</h2>
              <p style="font-size: 16px; color: var(--color-text-secondary); line-height: 1.7; margin-bottom: 24px;">
                When participating in or controlling a convoy, you must follow the directions of the designated event managers. Trolling, reckless driving, or any behavior that intentionally disrupts an event violates our core principles.
              </p>

              <h2 style="font-size: 24px; color: var(--color-primary); margin-bottom: 16px; border-bottom: 1px solid var(--color-border); padding-bottom: 8px;">3. Discord Server Rules</h2>
              <ul style="font-size: 16px; color: var(--color-text-secondary); line-height: 1.7; margin-bottom: 24px; padding-left: 20px;">
                <li style="margin-bottom: 8px;">No spamming or self-promotion outside of designated channels.</li>
                <li style="margin-bottom: 8px;">Keep conversations in the appropriate channels.</li>
                <li style="margin-bottom: 8px;">Listen to and comply with instructions given by RealOps Staff.</li>
                <li style="margin-bottom: 8px;">NSFW (Not Safe For Work) content is strictly forbidden.</li>
              </ul>

              <h2 style="font-size: 24px; color: var(--color-primary); margin-bottom: 16px; border-bottom: 1px solid var(--color-border); padding-bottom: 8px;">4. Consequence of Violations</h2>
              <p style="font-size: 16px; color: var(--color-text-secondary); line-height: 1.7; margin-bottom: 0;">
                Failure to adhere to these guidelines may result in a warning, a temporary suspension, or a permanent ban from the RealOps community and services. Our management team reserves the right to evaluate incidents on a case-by-case basis.
              </p>
              
            </div>
          </div>
        </section>
      </div>
    `;
  }
};
