// ============================================================
// RealOps — Recruitment & Career Operations
// ============================================================

const RecruitmentPage = {
  async render() {
    const positions = await API.getRecruitment();

    return `
      <div class="container" style="padding-top: 130px; padding-bottom: 80px;">
        
        <div style="text-align: center; margin-bottom: 48px;" class="reveal">
          <h1 style="font-size: clamp(36px, 5vw, 56px); font-weight: 800; color: #ffffff;">
            Join The <span class="gradient-text-orange">RealOps Fleet</span>
          </h1>
          <p style="font-size: 16px; color: var(--color-text-secondary); max-width: 600px; margin: 12px auto 0; line-height: 1.6;">
            Become an essential part of the TruckersMP Real Operation network. Explore active team openings below.
          </p>
        </div>

        <!-- Open Positions Grid -->
        <section style="margin-bottom: 64px;" class="reveal">
          ${positions && positions.length > 0 ? `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 28px;">
              ${positions.map((pos) => `
                <div class="bento-card" style="padding: 32px; display: flex; flex-direction: column; justify-content: space-between;">
                  <div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
                      <h3 style="font-size: 22px; font-weight: 700; color: #ffffff;">${App.escapeHtml(pos.title)}</h3>
                      <span class="event-status-badge upcoming">OPEN</span>
                    </div>

                    ${pos.description ? `
                      <p style="font-size: 14px; color: var(--color-text-secondary); line-height: 1.6; margin-bottom: 20px;">
                        ${App.escapeHtml(pos.description)}
                      </p>
                    ` : ''}

                    ${pos.requirements ? `
                      <div style="background: rgba(0, 0, 0, 0.3); padding: 16px; border-radius: var(--radius-md); margin-bottom: 24px; font-size: 13px; color: var(--color-text-secondary);">
                        <div style="font-family: var(--font-mono); color: var(--color-cyan); margin-bottom: 8px; font-size: 11px; text-transform: uppercase;">
                          [ MANDATORY QUALIFICATIONS ]
                        </div>
                        <ul style="padding-left: 18px; margin: 0; line-height: 1.6;">
                          ${pos.requirements.split('\n').filter(r => r.trim()).map(req => `
                            <li>${App.escapeHtml(req.trim().replace(/^[-•*]\s*/, ''))}</li>
                          `).join('')}
                        </ul>
                      </div>
                    ` : ''}
                  </div>

                  <a href="https://discord.gg/realops" target="_blank" rel="noopener" class="btn btn-primary" style="width: 100%; padding: 14px;">
                    <span>Apply via Discord Ticket</span>
                    <span class="material-symbols-outlined" style="font-size: 16px;">north_east</span>
                  </a>
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="bento-card" style="padding: 64px; text-align: center;">
              <span class="material-symbols-outlined" style="font-size: 56px; color: var(--color-primary); margin-bottom: 16px;">verified</span>
              <h3 style="font-size: 24px; color: #ffffff;">Pilot Roster Full</h3>
              <p style="color: var(--color-text-secondary); max-width: 480px; margin: 12px auto 24px;">
                We are not actively accepting applications today. Join our Discord community to receive instant notifications when recruitment opens!
              </p>
              <a href="https://discord.gg/realops" target="_blank" rel="noopener" class="btn btn-primary">
                Join Discord Announcements
              </a>
            </div>
          `}
        </section>

      </div>
    `;
  }
};
