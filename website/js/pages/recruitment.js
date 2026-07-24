// ============================================================
// RealOps — Recruitment Page
// ============================================================

const RecruitmentPage = {
  async render() {
    const positions = await API.getRecruitment();

    return `
      <main class="flex-grow relative z-10 pt-[120px] pb-xl px-4 md:px-lg mx-auto w-full flex flex-col gap-xl" style="padding-top: 120px; padding-bottom: 64px; max-width: var(--max-width); margin: 0 auto;">
        
        <div class="page-header" style="text-align: center; margin-bottom: 64px;">
          <div style="font-family: var(--font-mono); font-size: 13px; color: var(--color-primary); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px;">📋 Recruitment</div>
          <h1 class="glow-text" style="font-size: clamp(40px, 6vw, 64px); font-weight: 600; line-height: 1.1; letter-spacing: -0.04em; color: var(--color-text); text-transform: uppercase; max-width: 900px; margin: 0 auto;">
            Join <span style="color: var(--color-primary);">Our Team</span>
          </h1>
          <p style="font-size: 16px; color: var(--color-text-secondary); max-width: 600px; margin: 16px auto 0; line-height: 1.6;">
            We're always looking for passionate individuals to join the RealOps team. Browse our open positions below.
          </p>
        </div>

        <section class="section" style="width: 100%; margin-bottom: 40px;">
          <div class="container" style="max-width: 100%;">
            ${positions && positions.length > 0 ? `
              <div class="grid grid-2" id="recruitment-grid" style="gap: 24px;">
                ${positions.map((position, i) => `
                  <div class="bento-card ambient-shadow reveal reveal-delay-${(i % 4) + 1}" style="padding: 32px; display: flex; flex-direction: column;">
                    <div class="recruitment-card-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
                      <div>
                        <h3 class="recruitment-card-title" style="font-size: 24px; font-weight: 500; color: var(--color-text); margin-bottom: 8px;">${App.escapeHtml(position.title)}</h3>
                      </div>
                      <span class="badge badge-success" style="background: rgba(34,197,94,0.1); color: #22C55E; font-family: var(--font-mono);">OPEN</span>
                    </div>

                    ${position.description ? `
                      <p class="recruitment-card-desc" style="font-size: 14px; color: var(--color-text-secondary); line-height: 1.6; margin-bottom: 24px;">${App.escapeHtml(position.description)}</p>
                    ` : ''}

                    ${position.roles && position.roles.length > 0 ? `
                      <div class="recruitment-roles" style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px;">
                        ${position.roles.map(role => `
                          <span class="recruitment-role-tag" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 4px 12px; border-radius: 9999px; font-size: 12px; color: var(--color-text-secondary); font-family: var(--font-mono);">${App.escapeHtml(role.name || role)}</span>
                        `).join('')}
                      </div>
                    ` : ''}

                    ${position.requirements ? `
                      <div class="recruitment-requirements" style="margin-bottom: 24px; flex-grow: 1;">
                        <h4 style="font-size: 14px; font-weight: 500; color: var(--color-text); margin-bottom: 12px; font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.05em;">Requirements</h4>
                        <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px;">
                          ${position.requirements.split('\n').filter(r => r.trim()).map(req => `
                            <li style="font-size: 14px; color: var(--color-text-secondary); display: flex; align-items: flex-start; gap: 8px;">
                              <span style="color: var(--color-primary); margin-top: 2px;">•</span>
                              <span>${App.escapeHtml(req.trim().replace(/^[-•*]\s*/, ''))}</span>
                            </li>
                          `).join('')}
                        </ul>
                      </div>
                    ` : ''}

                    <a href="https://discord.gg/realops" target="_blank" rel="noopener" class="glass-button-primary" style="width:100%; display: flex; justify-content: center; align-items: center; gap: 8px; padding: 12px; font-size: 16px; font-weight: 500; text-decoration: none;">
                      <svg viewBox="0 0 24 24" style="width: 20px; height: 20px; fill: currentColor;"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" /></svg>
                      Apply via Discord
                    </a>
                  </div>
                `).join('')}
              </div>
            ` : `
              <div class="empty-state reveal bento-card ambient-shadow" style="padding: 64px; text-align: center;">
                <div class="empty-state-icon" style="font-size: 48px; margin-bottom: 16px;">📋</div>
                <h3 class="empty-state-title" style="font-size: 24px; color: var(--color-text); margin-bottom: 8px;">No Open Positions</h3>
                <p class="empty-state-desc" style="color: var(--color-text-secondary);">All positions are currently filled. Join our Discord to stay updated when new openings become available!</p>
                <div style="margin-top: 24px;">
                  <a href="https://discord.gg/realops" target="_blank" rel="noopener" class="glass-button-primary" style="display: inline-block; padding: 12px 24px; font-size: 16px; text-decoration: none;">Join Discord</a>
                </div>
              </div>
            `}
          </div>
        </section>

        <!-- General Info -->
        <section class="section" style="width: 100%;">
          <div class="container" style="max-width: 100%;">
            <div style="text-align: center; margin-bottom: 40px;">
              <div style="font-family: var(--font-mono); font-size: 13px; color: var(--color-primary); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px;">💡 How It Works</div>
              <h2 style="font-size: 32px; font-weight: 600; color: var(--color-text); letter-spacing: -0.02em;">Joining RealOps</h2>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px;">
              <div class="bento-card ambient-shadow reveal reveal-delay-1" style="padding: 32px; display: flex; flex-direction: column; align-items: flex-start;">
                <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(255, 107, 53, 0.1); color: var(--color-primary); display: flex; align-items: center; justify-content: center; margin-bottom: 24px; font-family: var(--font-mono); font-size: 20px; font-weight: 600;">
                  01
                </div>
                <h3 style="font-size: 20px; font-weight: 500; color: var(--color-text); margin-bottom: 12px;">Browse Openings</h3>
                <p style="font-size: 14px; color: var(--color-text-secondary); line-height: 1.6;">Check out our available positions above. Each listing includes the role details and requirements.</p>
              </div>
              <div class="bento-card ambient-shadow reveal reveal-delay-2" style="padding: 32px; display: flex; flex-direction: column; align-items: flex-start;">
                <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(255, 107, 53, 0.1); color: var(--color-primary); display: flex; align-items: center; justify-content: center; margin-bottom: 24px; font-family: var(--font-mono); font-size: 20px; font-weight: 600;">
                  02
                </div>
                <h3 style="font-size: 20px; font-weight: 500; color: var(--color-text); margin-bottom: 12px;">Apply via Discord</h3>
                <p style="font-size: 14px; color: var(--color-text-secondary); line-height: 1.6;">Join our Discord server and open a ticket in the join-the-team channel to submit your application.</p>
              </div>
              <div class="bento-card ambient-shadow reveal reveal-delay-3" style="padding: 32px; display: flex; flex-direction: column; align-items: flex-start;">
                <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(255, 107, 53, 0.1); color: var(--color-primary); display: flex; align-items: center; justify-content: center; margin-bottom: 24px; font-family: var(--font-mono); font-size: 20px; font-weight: 600;">
                  03
                </div>
                <h3 style="font-size: 20px; font-weight: 500; color: var(--color-text); margin-bottom: 12px;">Get Started</h3>
                <p style="font-size: 14px; color: var(--color-text-secondary); line-height: 1.6;">If your application is successful, you'll receive onboarding and training to get you started with the team.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    `;
  }
};
