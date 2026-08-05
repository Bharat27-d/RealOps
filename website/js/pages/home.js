// ============================================================
// RealOps — Home Page
// ============================================================

const HomePage = {
  async render() {
    const [stats, events, staff, partnerships] = await Promise.all([
      API.getStats(),
      API.getEvents(),
      API.getStaff(),
      API.getPartnerships()
    ]);

    const upcomingEvents = (events || []).slice(0, 3);
    const teamPreview = (staff || []).filter(s => s.status === 'active').slice(0, 6);
    const yearsOfService = new Date().getFullYear() - (stats?.foundedYear || 2021);

    return `
      <!-- Main Canvas for Obsidian Prime -->
      <main class="flex-grow relative z-10 pt-[120px] pb-xl px-4 md:px-lg mx-auto w-full flex flex-col gap-xl" style="padding-top: 120px; padding-bottom: 64px; max-width: var(--max-width); margin: 0 auto;">
        
        <!-- Hero Section -->
        <section class="header-glow-bg" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; min-height: 614px; gap: 24px; margin-top: 40px;">
          <div style="display: inline-flex; align-items: center; gap: 8px; padding: 4px 16px; border-radius: 9999px; border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(15, 15, 15, 0.5); backdrop-filter: blur(12px); margin-bottom: 16px;">
            <div class="status-beacon"></div>
            <span style="font-family: var(--font-mono); font-size: 13px; color: var(--color-primary); letter-spacing: 0.1em; text-transform: uppercase;">Premier Real Operation Team</span>
          </div>
          
          <h1 class="glow-text" style="font-size: clamp(40px, 6vw, 64px); font-weight: 600; line-height: 1.1; letter-spacing: -0.04em; color: var(--color-text); max-width: 900px; margin: 0 auto;">
            Welcome to <br/><span style="color: var(--color-primary); text-transform: uppercase;">RealOps</span>
          </h1>
          
          <p style="font-size: 16px; color: var(--color-text-secondary); max-width: 600px; margin: 16px auto 0; line-height: 1.6;">
            The premier Real Operation team in the TruckersMP community, ensuring your events run smoothly, safely, and professionally.
          </p>
          
          <div style="display: flex; flex-wrap: wrap; gap: 16px; margin-top: 40px; justify-content: center;">
            <a href="https://discord.gg/realops" target="_blank" rel="noopener" class="glass-button-primary" style="padding: 16px 40px; display: flex; align-items: center; gap: 8px; font-size: 20px; font-weight: 500; text-decoration: none;">
              Join our Discord
              <svg viewBox="0 0 24 24" style="width: 20px; height: 20px; fill: currentColor;"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" /></svg>
            </a>
            <a href="/events" class="glass-button-secondary" onclick="window.scrollTo(0,0)" style="padding: 16px 40px; display: flex; align-items: center; gap: 8px; font-size: 20px; font-weight: 500; text-decoration: none;">
              View our Events
            </a>
          </div>
        </section>

        <!-- Asymmetrical Bento Grid Metrics -->
        <section style="width: 100%; margin-top: 64px; margin-bottom: 64px;">
          <style>
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(12, 1fr);
              gap: 24px;
            }
            .stat-card-modern {
              position: relative;
              overflow: hidden;
              border-radius: 28px;
              padding: 40px;
              background: rgba(18, 18, 18, 0.7);
              border: 1px solid rgba(255, 255, 255, 0.03);
              backdrop-filter: blur(24px);
              -webkit-backdrop-filter: blur(24px);
              transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(255,255,255,0.05);
            }
            .stat-card-modern:hover {
              transform: translateY(-8px) scale(1.01);
              border-color: rgba(255, 107, 53, 0.2);
              box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4), 0 0 40px rgba(255, 107, 53, 0.1), inset 0 0 0 1px rgba(255, 107, 53, 0.2);
            }
            .stat-card-modern::before {
              content: '';
              position: absolute;
              top: 0; left: 0; right: 0; bottom: 0;
              background: radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 107, 53, 0.06), transparent 40%);
              opacity: 0;
              transition: opacity 0.5s ease;
              pointer-events: none;
            }
            .stat-card-modern:hover::before {
              opacity: 1;
            }
            
            .stat-card-primary {
              grid-column: span 12;
            }
            .stat-card-half {
              grid-column: span 12;
            }
            
            @media(min-width: 900px) {
              .stat-card-primary {
                grid-column: span 8;
              }
              .stat-card-half {
                grid-column: span 4;
              }
            }
            
            .stat-icon-wrapper {
              width: 56px;
              height: 56px;
              border-radius: 16px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 32px;
              transition: transform 0.4s ease;
            }
            .stat-card-modern:hover .stat-icon-wrapper {
              transform: scale(1.1) rotate(-5deg);
            }
            .stat-value {
              font-size: clamp(48px, 6vw, 76px);
              font-weight: 700;
              color: #fff;
              line-height: 1;
              letter-spacing: -0.04em;
              margin-bottom: 12px;
            }
            .stat-label {
              font-size: 20px;
              font-weight: 600;
              color: var(--color-primary);
              margin-bottom: 12px;
            }
            .stat-desc {
              font-size: 15px;
              color: var(--color-text-secondary);
              line-height: 1.6;
            }
          </style>

          <div class="stats-grid">
            
            <!-- Metric 1: Events Hosted -->
            <div class="stat-card-modern stat-card-primary reveal reveal-delay-1">
              <div>
                <div class="stat-icon-wrapper" style="background: rgba(255, 107, 53, 0.15);">
                  <span class="material-symbols-outlined" style="color: var(--color-primary); font-size: 28px;">event_available</span>
                </div>
                <div class="stat-value">300+</div>
                <div class="stat-label">Events Hosted</div>
                <div class="stat-desc" style="max-width: 85%;">Successfully managed and controlled events across the network, delivering flawless operations.</div>
              </div>
            </div>

            <!-- Metric 2: Reliability -->
            <div class="stat-card-modern stat-card-half reveal reveal-delay-2">
              <div>
                <div class="stat-icon-wrapper" style="background: rgba(34, 197, 94, 0.15);">
                  <span class="material-symbols-outlined" style="color: #22c55e; font-size: 28px;">verified_user</span>
                </div>
                <div class="stat-value" style="color: #22c55e;">99.9<span style="font-size: 32px; opacity: 0.8;">%</span></div>
                <div class="stat-label" style="color: #22c55e;">Success Rate</div>
                <div class="stat-desc">Mission-critical stability and professional execution for every event.</div>
              </div>
            </div>

            <!-- Metric 3: Community -->
            <div class="stat-card-modern stat-card-half reveal reveal-delay-3">
              <div>
                <div class="stat-icon-wrapper" style="background: rgba(59, 130, 246, 0.15);">
                  <span class="material-symbols-outlined" style="color: #3b82f6; font-size: 28px;">public</span>
                </div>
                <div class="stat-value">${yearsOfService} <span style="font-size: 32px; opacity: 0.8; color: #fff;">Years</span></div>
                <div class="stat-label" style="color: #3b82f6;">Of Operations</div>
                <div class="stat-desc">Dedicated service and commitment to the TruckersMP community.</div>
              </div>
            </div>

            <!-- Metric 4: Our Team -->
            <div class="stat-card-modern stat-card-primary reveal reveal-delay-4">
              <div style="display: flex; flex-direction: column; height: 100%; justify-content: space-between;">
                <div>
                  <div class="stat-icon-wrapper" style="background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(10px);">
                    <span class="material-symbols-outlined" style="color: #fff; font-size: 28px;">groups</span>
                  </div>
                  <div class="stat-value">${stats?.totalStaff || 0}</div>
                  <div class="stat-label" style="color: #fff;">Active Members</div>
                  <div class="stat-desc" style="color: rgba(255,255,255,0.8); max-width: 75%;">Highly trained individuals who ensure every convoy runs flawlessly and smoothly.</div>
                </div>
                
                <div style="margin-top: 40px;">
                  <a href="/team" class="glass-button-primary" onclick="window.scrollTo(0,0)" style="display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; font-weight: 600; font-size: 16px;">
                    Meet The Team <span class="material-symbols-outlined" style="font-size: 20px;">arrow_forward</span>
                  </a>
                </div>
              </div>
            </div>

          </div>
        </section>

      <!-- Upcoming Events Preview -->
      <section class="section" id="home-events">
        <div class="container">
          <div class="section-header reveal text-center">
            <div class="section-label" style="font-family: var(--font-mono); font-size: 10px; color: var(--color-primary); background: transparent; border: none; letter-spacing: 2px;">UPCOMING EVENTS</div>
            <h2 class="section-title" style="font-weight: 700;">What's Coming Up</h2>
          </div>

          ${upcomingEvents.length > 0 ? `
            <div class="grid grid-3 reveal">
              ${upcomingEvents.map((event, i) => `
                <div class="bento-card ambient-shadow reveal reveal-delay-${i + 1}" style="padding: 24px;">
                  ${event.image
        ? `<img class="event-card-banner" src="${App.escapeHtml(event.image)}" alt="${App.escapeHtml(event.title)}" loading="lazy" style="border-radius: 8px; margin-bottom: 16px;">`
        : `<div class="event-card-banner-placeholder" style="border-radius: 8px; margin-bottom: 16px;">🚛</div>`
      }
                  <div class="event-card-body" style="padding: 0;">
                    <h3 class="event-card-title" style="font-size: 20px; font-weight: 500; margin-bottom: 12px;">${App.escapeHtml(event.title)}</h3>
                    <div class="event-card-meta" style="margin-bottom: 16px;">
                      ${event.date ? `
                        <div class="event-card-meta-item" style="color: var(--color-text-secondary); font-family: var(--font-mono); font-size: 13px;">
                          <span class="material-symbols-outlined" style="font-size: 16px;">calendar_today</span>
                          ${App.formatDate(event.date)}
                        </div>
                      ` : ''}
                      ${event.time ? `
                        <div class="event-card-meta-item" style="color: var(--color-text-secondary); font-family: var(--font-mono); font-size: 13px;">
                          <span class="material-symbols-outlined" style="font-size: 16px;">schedule</span>
                          ${App.escapeHtml(event.time)} UTC
                        </div>
                      ` : ''}
                      ${event.server ? `
                        <div class="event-card-meta-item" style="color: var(--color-text-secondary); font-family: var(--font-mono); font-size: 13px;">
                          <span class="material-symbols-outlined" style="font-size: 16px;">dns</span>
                          ${App.escapeHtml(event.server)}
                        </div>
                      ` : ''}
                    </div>
                    <div class="event-card-footer">
                      <span class="badge badge-success" style="background: rgba(34,197,94,0.1); color: #22C55E; font-family: var(--font-mono);">${App.escapeHtml(event.status || 'Scheduled')}</span>
                      ${event.attendance ? `<span class="event-card-meta-item" style="font-family: var(--font-mono); color: var(--color-text-secondary);">👤 ${event.attendance}</span>` : ''}
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
            <div class="text-center reveal" style="margin-top: var(--space-8);">
              <a href="/events" class="glass-button-secondary" onclick="window.scrollTo(0,0)" style="display: inline-block; padding: 12px 24px; font-size: 16px; font-weight: 500;">View All Events →</a>
            </div>
          ` : `
            <div class="empty-state reveal">
              <div class="empty-state-icon">📅</div>
              <h3 class="empty-state-title">No Upcoming Events</h3>
              <p class="empty-state-desc">Check back soon for new convoy events!</p>
            </div>
          `}
        </div>
      </section>

      <!-- Team Preview -->
      <section class="section" id="home-team">
        <div class="container">
          <div class="section-header reveal text-center">
            <div class="section-label" style="font-family: var(--font-mono); font-size: 20px; color: var(--color-primary); background: transparent; border: none; letter-spacing: 2px;">OUR TEAM</div>
            <h2 class="section-title" style="font-weight: 700;">Meet the People Behind <span style="color: var(--color-primary);">REALOPS</span></h2>
            <p class="section-subtitle">Our dedicated staff members who make every convoy run smoothly.</p>
          </div>

          ${teamPreview.length > 0 ? `
            <div class="grid grid-3 reveal">
              ${teamPreview.map((member, i) => `
                <div class="bento-card ambient-shadow reveal reveal-delay-${i + 1}" style="padding: 24px; display: flex; flex-direction: column; align-items: center; text-align: center;">
                  ${member.avatar
          ? `<img class="staff-avatar" src="${App.escapeHtml(member.avatar)}" alt="${App.escapeHtml(member.name)}" loading="lazy" style="width: 80px; height: 80px; border-radius: 50%; border: 2px solid var(--color-border); margin-bottom: 16px;">`
          : `<div class="staff-avatar-placeholder" style="width: 80px; height: 80px; border-radius: 50%; border: 2px solid var(--color-border); margin-bottom: 16px; display: flex; align-items: center; justify-content: center; font-size: 24px;">${(member.name || '?').charAt(0).toUpperCase()}</div>`
        }
                  <h3 class="staff-name" style="font-size: 20px; font-weight: 500; color: var(--color-text); margin-bottom: 4px;">${App.escapeHtml(member.name)}</h3>
                  <p class="staff-position" style="font-size: 14px; color: var(--color-text-secondary); margin-bottom: 12px;">${App.escapeHtml(member.position || 'Team Member')}</p>
                  <span class="staff-department" style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--color-primary); background: rgba(255, 107, 53, 0.1); padding: 4px 8px; border-radius: 4px;">${App.escapeHtml(member.department)}</span>
                </div>
              `).join('')}
            </div>
            <div class="text-center reveal" style="margin-top: var(--space-8);">
              <a href="/team" class="glass-button-secondary" onclick="window.scrollTo(0,0)" style="display: inline-block; padding: 12px 24px; font-size: 16px; font-weight: 500;">View Full Team →</a>
            </div>
          ` : `
            <div class="empty-state reveal">
              <div class="empty-state-icon">👥</div>
              <h3 class="empty-state-title">Team Loading</h3>
            </div>
          `}
        </div>
      </section>

      <!-- CTA Section -->
      <section class="section cta-section" id="home-cta">
        <div class="container">
          <div class="bento-card ambient-shadow reveal" style="background: rgba(15, 15, 15, 0.8); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; text-align: center; padding: 64px 24px; display: flex; flex-direction: column; align-items: center; position: relative; overflow: hidden;">
            <div class="header-glow-bg" style="position: absolute; inset: 0; pointer-events: none; z-index: 0;"></div>
            <h2 class="cta-title glow-text" style="font-weight: 600; font-size: clamp(32px, 4vw, 48px); line-height: 1.2; letter-spacing: -0.02em; z-index: 10;">Ready to <span style="color: var(--color-primary);">JOIN US</span>?</h2>
            <p class="cta-subtitle" style="font-size: 16px; color: var(--color-text-secondary); max-width: 600px; margin: 16px auto 32px; line-height: 1.6; z-index: 10;">Whether you're a driver looking for professional convoys or want to join our team, we'd love to have you.</p>
            <div class="cta-actions" style="display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; z-index: 10;">
              <a href="https://discord.gg/realops" target="_blank" rel="noopener" class="glass-button-primary" style="padding: 16px 32px; display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 500; text-decoration: none;">
                <svg viewBox="0 0 24 24" style="width: 20px; height: 20px; fill: currentColor;"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" /></svg>
                Join Our Discord
              </a>
              <a href="/recruitment" class="glass-button-secondary" onclick="window.scrollTo(0,0)" style="padding: 16px 32px; display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 500; text-decoration: none;">
                View Open Positions
                <span class="material-symbols-outlined" style="font-size: 20px;">arrow_forward</span>
              </a>
            </div>
          </div>
        </div>
      </section>
      
      </main>
    `;
  }
};
