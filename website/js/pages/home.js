// ============================================================
// RealOps — Home Page (Tactical Convoy Operations Overhaul)
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
    const teamPreview = (staff || []).filter(s => s.status === 'active' || !s.status).slice(0, 6);
    const yearsOfService = new Date().getFullYear() - (stats?.foundedYear || 2021);

    return `
      <div class="container" style="padding-top: 130px; padding-bottom: 80px;">
        
        <!-- ═══════════════════════════════════════════ -->
        <!-- Clean Centered High-Impact Hero Section -->
        <!-- ═══════════════════════════════════════════ -->
        <section class="hero-section" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; min-height: 480px; margin-bottom: 70px; margin-top: 20px;">


          <h1 class="hero-title" style="max-width: 920px; margin: 0 auto 24px; font-size: clamp(42px, 6vw, 76px); font-weight: 800; color: #ffffff;">
            Tactical Precision For <br/>
            <span style="color: #ff5e1a;">TruckersMP Convoys</span>
          </h1>

          <p style="font-size: 18px; color: #94a3b8; line-height: 1.7; max-width: 680px; margin: 0 auto 36px;">
            RealOps delivers high-precision pilot escort security, automated route clearance, and professional Real Operation for Virtual Trucking Companies and massive community events.
          </p>

          <div style="display: flex; flex-wrap: wrap; gap: 16px; justify-content: center; margin-bottom: 48px;">
            <a href="https://discord.gg/realops" target="_blank" rel="noopener" class="btn btn-primary" style="padding: 16px 36px; font-size: 16px;">
              <svg viewBox="0 0 24 24" style="width: 20px; height: 20px; fill: currentColor;"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" /></svg>
              <span>Request Real Operation</span>
            </a>
            <a href="/events" class="btn btn-secondary" onclick="window.scrollTo(0,0)" style="padding: 16px 36px; font-size: 16px;">
              <span>Explore Operations</span>
              <span class="material-symbols-outlined">east</span>
            </a>
          </div>

          <!-- Hero Telemetry Feature Highlights Pill Dock -->
          <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 16px; font-family: var(--font-mono); font-size: 13px; color: #94a3b8;">
            <div style="padding: 10px 20px; border-radius: var(--radius-full); background: rgba(17, 22, 34, 0.8); border: 1px solid rgba(255, 255, 255, 0.08);">
              <span class="material-symbols-outlined" style="font-size: 16px; color: #ff5e1a; vertical-align: middle; margin-right: 6px;">verified</span>
              <strong style="color: #ffffff;">300+</strong> Convoys Managed
            </div>
            <div style="padding: 10px 20px; border-radius: var(--radius-full); background: rgba(17, 22, 34, 0.8); border: 1px solid rgba(255, 255, 255, 0.08);">
              <span class="material-symbols-outlined" style="font-size: 16px; color: #10b981; vertical-align: middle; margin-right: 6px;">shield</span>
              <strong style="color: #ffffff;">99.9%</strong> Reliability Rate
            </div>
            <div style="padding: 10px 20px; border-radius: var(--radius-full); background: rgba(17, 22, 34, 0.8); border: 1px solid rgba(255, 255, 255, 0.08);">
              <span class="material-symbols-outlined" style="font-size: 16px; color: #00f2fe; vertical-align: middle; margin-right: 6px;">dns</span>
              <strong style="color: #ffffff;">ETS2 & ATS</strong> Simulation Support
            </div>
          </div>

        </section>

        <!-- ═══════════════════════════════════════════ -->
        <!-- Tactical Bento Matrix Metrics Section -->
        <!-- ═══════════════════════════════════════════ -->
        <section style="margin-bottom: 90px; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 64px;">
          <div style="text-align: center; margin-bottom: 48px;" class="reveal">
            <h2 style="font-size: 38px; font-weight: 800; color: #ffffff; letter-spacing: -0.03em;">Built for High-Stakes Convoys</h2>
            <p style="color: #94a3b8; font-size: 16px; max-width: 540px; margin: 10px auto 0;">Real-time benchmarks powering seamless convoy security and route clearance.</p>
          </div>

          <div class="bento-grid">
            
            <!-- Metric 1: Events Hosted (Span 8) -->
            <div class="bento-card reveal" style="grid-column: span 12; min-height: 260px;" id="bento-1">
              <style>
                @media(min-width: 900px) {
                  #bento-1 { grid-column: span 8 !important; }
                  #bento-2 { grid-column: span 4 !important; }
                  #bento-3 { grid-column: span 4 !important; }
                  #bento-4 { grid-column: span 8 !important; }
                }
              </style>
              <div>
                <div style="width: 48px; height: 48px; border-radius: var(--radius-md); background: rgba(255, 94, 26, 0.12); border: 1px solid rgba(255, 94, 26, 0.25); display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                  <span class="material-symbols-outlined" style="color: #ff5e1a; font-size: 26px;">event_available</span>
                </div>
                <div style="font-family: var(--font-display); font-size: clamp(48px, 5vw, 64px); font-weight: 800; color: #ffffff; line-height: 1; letter-spacing: -0.03em;" data-count="${stats?.completedEvents || 300}">300+</div>
                <div style="font-size: 16px; font-weight: 700; color: #ffffff; margin-top: 12px;">Events Successfully Executed</div>
                <div style="font-size: 14px; color: #94a3b8; line-height: 1.6; margin-top: 6px;">Formed routes, cleared junctions, and guided thousands of virtual truckers across Euro Truck Simulator 2 & American Truck Simulator.</div>
              </div>
            </div>

            <!-- Metric 2: Reliability (Span 4) -->
            <div class="bento-card reveal" style="grid-column: span 12; min-height: 260px;" id="bento-2">
              <div>
                <div style="width: 48px; height: 48px; border-radius: var(--radius-md); background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.25); display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                  <span class="material-symbols-outlined" style="color: #10b981; font-size: 26px;">verified_user</span>
                </div>
                <div style="font-family: var(--font-display); font-size: clamp(48px, 5vw, 64px); font-weight: 800; color: #10b981; line-height: 1; letter-spacing: -0.03em;">99.9<span style="font-size: 28px; opacity: 0.8;">%</span></div>
                <div style="font-size: 16px; font-weight: 700; color: #ffffff; margin-top: 12px;">Escort Security Benchmark</div>
                <div style="font-size: 14px; color: #94a3b8; line-height: 1.6; margin-top: 6px;">Unmatched route discipline, rapid hazard response, and continuous radio dispatch.</div>
              </div>
            </div>

            <!-- Metric 3: Years of Operations (Span 4) -->
            <div class="bento-card reveal" style="grid-column: span 12; min-height: 260px;" id="bento-3">
              <div>
                <div style="width: 48px; height: 48px; border-radius: var(--radius-md); background: rgba(0, 242, 254, 0.12); border: 1px solid rgba(0, 242, 254, 0.25); display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                  <span class="material-symbols-outlined" style="color: #00f2fe; font-size: 26px;">history_toggle_off</span>
                </div>
                <div style="font-family: var(--font-display); font-size: clamp(48px, 5vw, 64px); font-weight: 800; color: #00f2fe; line-height: 1; letter-spacing: -0.03em;">${yearsOfService} <span style="font-size: 28px; opacity: 0.8; color: #ffffff;">Years</span></div>
                <div style="font-size: 16px; font-weight: 700; color: #ffffff; margin-top: 12px;">Dedicated Community Service</div>
                <div style="font-size: 14px; color: #94a3b8; line-height: 1.6; margin-top: 6px;">Pioneering standard operating procedures for convoy pilots since 2021.</div>
              </div>
            </div>

            <!-- Metric 4: Pilot Roster & Command (Span 8) -->
            <div class="bento-card reveal" style="grid-column: span 12; min-height: 260px;" id="bento-4">
              <div style="display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
                <div>
                  <div style="width: 48px; height: 48px; border-radius: var(--radius-md); background: rgba(255, 184, 0, 0.12); border: 1px solid rgba(255, 184, 0, 0.25); display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                    <span class="material-symbols-outlined" style="color: #ffb800; font-size: 26px;">badge</span>
                  </div>
                  <div style="font-family: var(--font-display); font-size: clamp(48px, 5vw, 64px); font-weight: 800; color: #ffb800; line-height: 1; letter-spacing: -0.03em;" data-count="${stats?.totalStaff || 42}">${stats?.totalStaff || 42}</div>
                  <div style="font-size: 16px; font-weight: 700; color: #ffffff; margin-top: 12px;">Trained Real Operation Pilots</div>
                  <div style="font-size: 14px; color: #94a3b8; line-height: 1.6; margin-top: 6px;">Our crew undergoes rigorous radio etiquette, junction block, and speed pace testing.</div>
                </div>

                <div style="margin-top: 24px;">
                  <a href="/team" class="btn btn-secondary" onclick="window.scrollTo(0,0)">
                    <span>Explore Pilot Roster</span>
                    <span class="material-symbols-outlined">arrow_forward</span>
                  </a>
                </div>
              </div>
            </div>

          </div>
        </section>

        <!-- ═══════════════════════════════════════════ -->
        <!-- Upcoming Event Operations Board Teaser -->
        <!-- ═══════════════════════════════════════════ -->
        <section style="margin-bottom: 90px; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 64px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 36px; flex-wrap: wrap; gap: 16px;" class="reveal">
            <div>
              <h2 style="font-size: 32px; font-weight: 800; color: #ffffff; letter-spacing: -0.03em;">Upcoming Convoy Operations</h2>
            </div>
            <a href="/events" class="btn btn-secondary" onclick="window.scrollTo(0,0)">
              <span>Full Event Calendar</span>
              <span class="material-symbols-outlined">event</span>
            </a>
          </div>

          ${upcomingEvents.length > 0 ? `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px;" class="reveal">
              ${upcomingEvents.map((event) => `
                <div class="event-card">
                  <div class="event-card-header">
                    <span class="event-tag">${App.escapeHtml(event.server || 'TruckersMP')}</span>
                    <span class="event-status-badge upcoming">
                      ${App.escapeHtml(event.status || 'CONFIRMED')}
                    </span>
                  </div>

                  <h3 class="event-title">${App.escapeHtml(event.title)}</h3>

                  <div class="event-meta-grid">
                    <div class="event-meta-item">
                      <span class="material-symbols-outlined" style="font-size: 16px; color: var(--color-primary);">calendar_month</span>
                      <span>${App.formatDate(event.date)}</span>
                    </div>
                    <div class="event-meta-item">
                      <span class="material-symbols-outlined" style="font-size: 16px; color: var(--color-cyan);">schedule</span>
                      <span>${App.escapeHtml(event.time || '18:00')} UTC</span>
                    </div>
                  </div>

                  <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 16px; pt: 16px; border-top: 1px solid var(--color-border);">
                    <span style="font-size: 13px; color: var(--color-text-secondary); font-family: var(--font-mono);">
                      Slots: <strong style="color:#fff;">${App.escapeHtml(event.slots || 'Public')}</strong>
                    </span>
                    <a href="/events" class="btn btn-cyan" style="padding: 6px 14px; font-size: 12px;" onclick="window.scrollTo(0,0)">
                      View Details
                    </a>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="bento-card reveal" style="text-align: center; padding: 48px;">
              <span class="material-symbols-outlined" style="font-size: 48px; color: var(--color-primary); margin-bottom: 16px;">calendar_today</span>
              <h3 style="font-size: 20px; color: #ffffff;">No Active Public Convoys Scheduled</h3>
              <p style="color: var(--color-text-secondary); margin-top: 8px;">Check back soon or request a convoy booking in our Discord.</p>
            </div>
          `}
        </section>

        <!-- ═══════════════════════════════════════════ -->
        <!-- CTA Command Dispatch Launcher -->
        <!-- ═══════════════════════════════════════════ -->
        <section class="reveal" style="border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 64px;">
          <div class="bento-card" style="background: rgba(17, 22, 34, 0.95); border-color: rgba(255, 94, 26, 0.3); text-align: center; padding: 64px 32px;">
            <h2 style="font-size: clamp(28px, 4vw, 44px); font-weight: 800; color: #ffffff; margin-bottom: 16px; letter-spacing: -0.03em;">
              Need Convoy Escorts for Your Next Event?
            </h2>

            <p style="font-size: 16px; color: var(--color-text-secondary); max-width: 640px; margin: 0 auto 32px; line-height: 1.6;">
              Partner with RealOps to secure high-quality pilot escort cars, automated discord updates, and zero-delay convoy management.
            </p>

            <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
              <a href="https://discord.gg/realops" target="_blank" rel="noopener" class="btn btn-primary" style="padding: 16px 36px; font-size: 16px;">
                <svg viewBox="0 0 24 24" style="width: 20px; height: 20px; fill: currentColor;"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" /></svg>
                <span>Book Real Operation</span>
              </a>
              <a href="/recruitment" class="btn btn-secondary" onclick="window.scrollTo(0,0)" style="padding: 16px 36px; font-size: 16px;">
                <span>Join As Pilot Escort</span>
              </a>
            </div>
          </div>
        </section>

      </div>
    `;
  }
};
