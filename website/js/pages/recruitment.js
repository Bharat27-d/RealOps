// ============================================================
// RealOps — Recruitment Page (Redesign)
// ============================================================

const RecruitmentPage = {
  async render() {
    const positions = await API.getRecruitment();

    return `
      <!-- Main Container -->
      <main class="flex-grow relative z-10 pt-[100px] pb-xl px-4 md:px-lg mx-auto w-full flex flex-col" style="padding-top: 100px; padding-bottom: 80px; max-width: var(--max-width); margin: 0 auto;">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 48px;" class="reveal">
          <div style="display: inline-flex; align-items: center; gap: 8px; padding: 4px 14px; background: rgba(255, 107, 53, 0.08); border: 1px solid rgba(255, 107, 53, 0.2); border-radius: 999px; margin-bottom: 16px;">
            <span class="status-beacon" style="width: 6px; height: 6px;"></span>
            <span style="font-family: var(--font-mono); font-size: 11px; font-weight: 600; color: var(--color-primary-light); text-transform: uppercase; letter-spacing: 0.12em;">RECRUITMENT HUB</span>
          </div>

          <h1 style="font-size: clamp(32px, 5vw, 54px); font-weight: 800; color: var(--color-text); margin: 0 0 14px; letter-spacing: -0.03em;">
            Join RealOps Team
          </h1>
          
          <p style="font-size: 16px; color: var(--color-text-secondary); max-width: 580px; margin: 0 auto; line-height: 1.6;">
            Apply to become an Escort Pilot, Emergency Responder, or Operations Commander in TruckersMP.
          </p>
        </div>

        <!-- Open Roles Grid -->
        <section style="margin-bottom: 56px;" class="reveal">
          ${positions && positions.length > 0 ? `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px;">
              ${positions.map((position, i) => `
                <div class="bento-card reveal-delay-${(i % 4) + 1}" style="padding: 28px; background: rgba(18, 16, 16, 0.75); border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 20px; display: flex; flex-direction: column; justify-content: space-between;">
                  <div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px;">
                      <h3 style="font-size: 20px; font-weight: 600; color: var(--color-text); margin: 0;">${App.escapeHtml(position.title)}</h3>
                      <span style="background: rgba(34,197,94,0.1); color: #22c55e; font-family: var(--font-mono); font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 999px; border: 1px solid rgba(34,197,94,0.2);">OPEN</span>
                    </div>

                    ${position.description ? `
                      <p style="font-size: 14px; color: var(--color-text-secondary); line-height: 1.6; margin-bottom: 20px;">${App.escapeHtml(position.description)}</p>
                    ` : ''}

                    ${position.requirements ? `
                      <div style="margin-bottom: 24px;">
                        <div style="font-size: 12px; font-weight: 600; color: var(--color-primary-light); font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px;">Role Requirements</div>
                        <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px;">
                          ${position.requirements.split('\n').filter(r => r.trim()).map(req => `
                            <li style="font-size: 13px; color: var(--color-text-secondary); display: flex; align-items: flex-start; gap: 8px;">
                              <span style="color: var(--color-primary); margin-top: 2px;">•</span>
                              <span>${App.escapeHtml(req.trim().replace(/^[-•*]\s*/, ''))}</span>
                            </li>
                          `).join('')}
                        </ul>
                      </div>
                    ` : ''}
                  </div>

                  <a href="https://discord.gg/realops" target="_blank" rel="noopener" class="glass-button-primary" style="width: 100%; display: flex; justify-content: center; align-items: center; gap: 8px; padding: 12px; font-size: 14px; font-weight: 600; text-decoration: none;">
                    Apply via Discord <span class="material-symbols-outlined" style="font-size: 16px;">open_in_new</span>
                  </a>
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="bento-card" style="padding: 56px; text-align: center; background: rgba(18,16,16,0.6); border: 1px solid rgba(255,255,255,0.06); border-radius: 20px;">
              <div style="font-size: 44px; margin-bottom: 16px;">📋</div>
              <h3 style="font-size: 22px; color: var(--color-text); margin-bottom: 8px;">No Public Openings Listed</h3>
              <p style="color: var(--color-text-secondary); max-width: 480px; margin: 0 auto 24px; font-size: 14px;">Positions are updated regularly. Open an application ticket on our Discord server to express interest!</p>
              <div>
                <a href="https://discord.gg/realops" target="_blank" rel="noopener" class="glass-button-primary" style="display: inline-block; padding: 12px 24px; font-size: 14px; font-weight: 600; text-decoration: none;">Join Discord</a>
              </div>
            </div>
          `}
        </section>

        <!-- Recruitment Steps -->
        <section class="reveal">
          <div style="text-align: center; margin-bottom: 36px;">
            <div style="font-family: var(--font-mono); font-size: 12px; font-weight: 600; color: var(--color-primary); letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 8px;">APPLICATION PROCESS</div>
            <h2 style="font-size: 28px; font-weight: 700; color: var(--color-text); margin: 0;">How to Join</h2>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px;">
            
            <div class="bento-card" style="padding: 28px; background: rgba(18, 16, 16, 0.7); border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 20px;">
              <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(255, 107, 53, 0.1); color: var(--color-primary); font-family: var(--font-mono); font-size: 18px; font-weight: 700; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                01
              </div>
              <h3 style="font-size: 18px; font-weight: 600; color: var(--color-text); margin: 0 0 8px;">Apply for Staff</h3>
              <p style="font-size: 13px; color: var(--color-text-secondary); line-height: 1.6; margin: 0;">
                Submit your application ticket on our Discord server to apply for an open staff position.
              </p>
            </div>

            <div class="bento-card" style="padding: 28px; background: rgba(18, 16, 16, 0.7); border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 20px;">
              <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(255, 107, 53, 0.1); color: var(--color-primary); font-family: var(--font-mono); font-size: 18px; font-weight: 700; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                02
              </div>
              <h3 style="font-size: 18px; font-weight: 600; color: var(--color-text); margin: 0 0 8px;">Application Review</h3>
              <p style="font-size: 13px; color: var(--color-text-secondary); line-height: 1.6; margin: 0;">
                Your application will be reviewed based on your experience, and a practical driving test will be conducted if required.
              </p>
            </div>

            <div class="bento-card" style="padding: 28px; background: rgba(18, 16, 16, 0.7); border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 20px;">
              <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(255, 107, 53, 0.1); color: var(--color-primary); font-family: var(--font-mono); font-size: 18px; font-weight: 700; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                03
              </div>
              <h3 style="font-size: 18px; font-weight: 600; color: var(--color-text); margin: 0 0 8px;">Crew Onboarding</h3>
              <p style="font-size: 13px; color: var(--color-text-secondary); line-height: 1.6; margin: 0;">
                Receive RealOps staff roles, access radio channels, and begin participating in live operations.
              </p>
            </div>

          </div>
        </section>

      </main>
    `;
  }
};
