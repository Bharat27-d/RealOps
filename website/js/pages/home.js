// ============================================================
// RealOps — Home Page (Real Operations Focus)
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
      <!-- Main Command Hub Container -->
      <main class="flex-grow relative z-10 pt-[100px] pb-xl px-4 md:px-lg mx-auto w-full flex flex-col" style="padding-top: 100px; padding-bottom: 80px; max-width: var(--max-width); margin: 0 auto;">
        
        <!-- ═══════════════════════════════════════════ -->
        <!-- Hero Section — RealOps Operations Hub -->
        <!-- ═══════════════════════════════════════════ -->
        <section class="hero-hub-grid reveal">
          
          <!-- Left Column: RealOps Team & Operations Focus -->
          <div style="display: flex; flex-direction: column; align-items: flex-start; text-align: left; gap: 20px;">

            <h1 style="font-size: clamp(38px, 5.5vw, 62px); font-weight: 800; line-height: 1.05; letter-spacing: -0.04em; color: var(--color-text); margin: 0;">
              RealOps Team <br/>
              <span style="color: var(--color-primary); background: linear-gradient(135deg, #ff6b3d 0%, #ff9d7f 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                Real Operations
              </span><br/>
              on the Road
            </h1>
            
            <p style="font-size: 17px; color: var(--color-text-secondary); max-width: 550px; margin: 8px 0 16px; line-height: 1.65; font-weight: 400;">
              Delivering realistic on-road operations across TruckersMP — including simulated accidents, emergency police escorts, lane closures, and dynamic convoy control.
            </p>
            
            <div style="display: flex; flex-wrap: wrap; gap: 14px; align-items: center;">
              <a href="https://discord.gg/realops" target="_blank" rel="noopener" class="glass-button-primary" style="padding: 14px 28px; display: inline-flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 600; text-decoration: none;">
                <svg viewBox="0 0 24 24" style="width: 18px; height: 18px; fill: currentColor;"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" /></svg>
                Join RealOps Discord
              </a>
              <a href="/events" class="glass-button-secondary" onclick="window.scrollTo(0,0)" style="padding: 14px 24px; display: inline-flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 500; text-decoration: none;">
                View Operations Schedule <span class="material-symbols-outlined" style="font-size: 18px;">arrow_forward</span>
              </a>
            </div>

            <!-- Quick Metrics Row -->
            <div style="display: flex; gap: 24px; margin-top: 24px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.06); width: 100%;">
              <div>
                <div style="font-size: 22px; font-weight: 700; color: var(--color-text);">300+</div>
                <div style="font-size: 12px; color: var(--color-text-muted); font-family: var(--font-mono); text-transform: uppercase;">Operations Run</div>
              </div>
              <div style="width: 1px; background: rgba(255,255,255,0.08);"></div>
              <div>
                <div style="font-size: 22px; font-weight: 700; color: #22c55e;">99.9%</div>
                <div style="font-size: 12px; color: var(--color-text-muted); font-family: var(--font-mono); text-transform: uppercase;">Scene Control</div>
              </div>
              <div style="width: 1px; background: rgba(255,255,255,0.08);"></div>
              <div>
                <div style="font-size: 22px; font-weight: 700; color: var(--color-primary-light);">${yearsOfService} Yrs</div>
                <div style="font-size: 12px; color: var(--color-text-muted); font-family: var(--font-mono); text-transform: uppercase;">Operational</div>
              </div>
            </div>

          </div>

          <!-- Right Column: Road Operations Information Terminal -->
          <div class="telemetry-card reveal reveal-delay-2">
            
            <div class="telemetry-header">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span class="material-symbols-outlined" style="color: var(--color-primary); font-size: 22px;">warning</span>
                <span style="font-family: var(--font-mono); font-size: 13px; font-weight: 600; color: var(--color-text); letter-spacing: 0.05em;">ROAD INCIDENT DISPATCH</span>
              </div>
            </div>

            <!-- Incident nodes -->
            <div class="telemetry-node">
              <span class="material-symbols-outlined" style="color: #ef4444; font-size: 20px;">car_crash</span>
              <div style="flex: 1;">
                <div style="font-size: 13px; font-weight: 600; color: var(--color-text);">Simulated Accident Zone</div>
                <div style="font-size: 11px; color: var(--color-text-muted); font-family: var(--font-mono);">A1 Highway Lane 1 & 2 Blocked</div>
              </div>
            </div>

            <div class="telemetry-node">
              <span class="material-symbols-outlined" style="color: #3b82f6; font-size: 20px;">local_police</span>
              <div style="flex: 1;">
                <div style="font-size: 13px; font-weight: 600; color: var(--color-text);">Police & Emergency Response</div>
                <div style="font-size: 11px; color: var(--color-text-muted); font-family: var(--font-mono);">Emergency Chases & Traffic Control</div>
              </div>
            </div>

            <div class="telemetry-node">
              <span class="material-symbols-outlined" style="color: #f59e0b; font-size: 20px;">minor_crash</span>
              <div style="flex: 1;">
                <div style="font-size: 13px; font-weight: 600; color: var(--color-text);">Escort Units & Pilot Fleet</div>
                <div style="font-size: 11px; color: var(--color-text-muted); font-family: var(--font-mono);">${stats?.totalStaff || 24} Emergency Pilots</div>
              </div>
            </div>

            <div style="margin-top: 16px; padding: 14px; background: rgba(255, 107, 53, 0.05); border: 1px solid rgba(255, 107, 53, 0.15); border-radius: 12px; display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="material-symbols-outlined" style="color: var(--color-primary); font-size: 18px;">event</span>
                <span style="font-size: 12px; font-weight: 500; color: var(--color-text-secondary);">Next RealOps Event</span>
              </div>
              <a href="/events" onclick="window.scrollTo(0,0)" style="font-family: var(--font-mono); font-size: 11px; font-weight: 600; color: var(--color-primary-light); text-decoration: none;">
                VIEW OPERATIONS →
              </a>
            </div>

          </div>

        </section>

        <!-- ═══════════════════════════════════════════ -->
        <!-- Marquee Ticker Strip — Real Operations -->
        <!-- ═══════════════════════════════════════════ -->
        <div class="ticker-wrap reveal">
          <div class="ticker-move">
            <div class="ticker-item"><span class="ticker-dot"></span> REALOPS TEAM</div>
            <div class="ticker-item"><span class="ticker-dot"></span> SIMULATED ROAD ACCIDENTS</div>
            <div class="ticker-item"><span class="ticker-dot"></span> POLICE CHASES & EMERGENCY RESPONSE</div>
            <div class="ticker-item"><span class="ticker-dot"></span> DYNAMIC HIGHWAY DETOURS</div>
            <div class="ticker-item"><span class="ticker-dot"></span> HAZARD CLEARANCE ESCORTS</div>
            <div class="ticker-item"><span class="ticker-dot"></span> LIVE DISCORD VOICE DISPATCH</div>
            <!-- Duplicate for continuous scroll loop -->
            <div class="ticker-item"><span class="ticker-dot"></span> REALOPS TEAM</div>
            <div class="ticker-item"><span class="ticker-dot"></span> SIMULATED ROAD ACCIDENTS</div>
            <div class="ticker-item"><span class="ticker-dot"></span> POLICE CHASES & EMERGENCY RESPONSE</div>
            <div class="ticker-item"><span class="ticker-dot"></span> DYNAMIC HIGHWAY DETOURS</div>
            <div class="ticker-item"><span class="ticker-dot"></span> HAZARD CLEARANCE ESCORTS</div>
            <div class="ticker-item"><span class="ticker-dot"></span> LIVE DISCORD VOICE DISPATCH</div>
          </div>
        </div>

        <!-- ═══════════════════════════════════════════ -->
        <!-- What RealOps Does Section -->
        <!-- ═══════════════════════════════════════════ -->
        <section style="margin-bottom: 80px;">
          
          <div style="text-align: center; margin-bottom: 48px;" class="reveal">
            <div style="font-family: var(--font-mono); font-size: 12px; font-weight: 600; color: var(--color-primary); letter-spacing: 0.16em; text-transform: uppercase; margin-bottom: 12px;">
              ON-ROAD OPERATIONS
            </div>
            <h2 style="font-size: clamp(28px, 4vw, 42px); font-weight: 700; color: var(--color-text); margin: 0;">
              What RealOps Performs
            </h2>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px;" class="reveal">
            
            <!-- Operation 1: Simulated Accidents -->
            <div class="capability-card">
              <div class="capability-icon-box">
                <span class="material-symbols-outlined" style="font-size: 28px;">car_crash</span>
              </div>
              <div>
                <h3 style="font-size: 20px; font-weight: 600; color: var(--color-text); margin-bottom: 10px;">Simulated Accidents & Hazards</h3>
                <p style="font-size: 14px; color: var(--color-text-secondary); line-height: 1.6;">
                  Staging realistic accident scenes, lane closures, and broken-down truck hazards to create immersive challenges for convoys.
                </p>
              </div>
            </div>

            <!-- Operation 2: Police & Emergency Escorts -->
            <div class="capability-card">
              <div class="capability-icon-box">
                <span class="material-symbols-outlined" style="font-size: 28px;">local_police</span>
              </div>
              <div>
                <h3 style="font-size: 20px; font-weight: 600; color: var(--color-text); margin-bottom: 10px;">Police Chases & Emergency Escorts</h3>
                <p style="font-size: 14px; color: var(--color-text-secondary); line-height: 1.6;">
                  High-speed emergency vehicle responses, tactical rolling roadblocks, and active police escorts for convoy safety.
                </p>
              </div>
            </div>

            <!-- Operation 3: Junction Locks & Traffic Control -->
            <div class="capability-card">
              <div class="capability-icon-box">
                <span class="material-symbols-outlined" style="font-size: 28px;">traffic</span>
              </div>
              <div>
                <h3 style="font-size: 20px; font-weight: 600; color: var(--color-text); margin-bottom: 10px;">Traffic Control & Intersection Locks</h3>
                <p style="font-size: 14px; color: var(--color-text-secondary); line-height: 1.6;">
                  Locking down busy junctions, roundabouts, and motorway ramps to allow massive truck convoys to pass without disruption.
                </p>
              </div>
            </div>

          </div>

        </section>

        <!-- ═══════════════════════════════════════════ -->
        <!-- Upcoming Events Showcase -->
        <!-- ═══════════════════════════════════════════ -->
        <section style="margin-bottom: 80px;" id="home-events">
          
          <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 36px; flex-wrap: wrap; gap: 16px;" class="reveal">
            <div>
              <div style="font-family: var(--font-mono); font-size: 12px; font-weight: 600; color: var(--color-primary); letter-spacing: 0.16em; text-transform: uppercase; margin-bottom: 8px;">
                OPERATIONAL SCHEDULE
              </div>
              <h2 style="font-size: clamp(26px, 3.5vw, 38px); font-weight: 700; color: var(--color-text); margin: 0;">
                Upcoming RealOps Events
              </h2>
            </div>
            <a href="/events" onclick="window.scrollTo(0,0)" class="glass-button-secondary" style="padding: 10px 20px; font-size: 14px; font-weight: 500; text-decoration: none;">
              Full Event Schedule →
            </a>
          </div>

          ${upcomingEvents.length > 0 ? `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px;" class="reveal">
              ${upcomingEvents.map((event, i) => `
                <div class="modern-event-card reveal-delay-${i + 1}">
                  <div class="modern-event-img-wrap">
                    ${event.image
                      ? `<img src="${App.escapeHtml(event.image)}" alt="${App.escapeHtml(event.title)}" loading="lazy">`
                      : `<div style="width:100%;height:100%;background:linear-gradient(135deg, #1f1b1a, #2a2220);display:flex;align-items:center;justify-content:center;font-size:42px;">🚛</div>`
                    }
                    <div style="position: absolute; top: 12px; right: 12px;">
                      <span style="background: rgba(10, 10, 10, 0.75); backdrop-filter: blur(10px); color: #22c55e; font-family: var(--font-mono); font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 999px; border: 1px solid rgba(34, 197, 94, 0.3);">
                        ${App.escapeHtml(event.status || 'Scheduled')}
                      </span>
                    </div>
                  </div>
                  
                  <div style="padding: 20px; display: flex; flex-direction: column; flex: 1; justify-content: space-between;">
                    <div>
                      <h3 style="font-size: 18px; font-weight: 600; color: var(--color-text); margin-bottom: 12px; line-height: 1.3;">
                        ${App.escapeHtml(event.title)}
                      </h3>
                      
                      <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
                        ${event.date ? `
                          <div style="display: flex; align-items: center; gap: 8px; color: var(--color-text-secondary); font-size: 13px; font-family: var(--font-mono);">
                            <span class="material-symbols-outlined" style="font-size: 16px; color: var(--color-primary);">calendar_month</span>
                            ${App.formatDate(event.date)}
                          </div>
                        ` : ''}
                        ${event.server ? `
                          <div style="display: flex; align-items: center; gap: 8px; color: var(--color-text-secondary); font-size: 13px; font-family: var(--font-mono);">
                            <span class="material-symbols-outlined" style="font-size: 16px; color: #3b82f6;">dns</span>
                            ${App.escapeHtml(event.server)}
                          </div>
                        ` : ''}
                      </div>
                    </div>

                    <div style="padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;">
                      <span style="font-size: 12px; color: var(--color-text-muted); font-family: var(--font-mono);">
                        ${event.time ? `${App.escapeHtml(event.time)} UTC` : 'TBA'}
                      </span>
                      <a href="/events" onclick="window.scrollTo(0,0)" style="font-size: 13px; font-weight: 600; color: var(--color-primary-light); text-decoration: none;">
                        Details →
                      </a>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="empty-state reveal">
              <div class="empty-state-icon">📅</div>
              <h3 class="empty-state-title">No Upcoming Events Scheduled</h3>
              <p class="empty-state-desc">Check back soon or request RealOps on Discord.</p>
            </div>
          `}

        </section>

        <!-- ═══════════════════════════════════════════ -->
        <!-- RealOps Team Roster Showcase -->
        <!-- ═══════════════════════════════════════════ -->
        <section style="margin-bottom: 80px;" id="home-team">
          
          <div style="text-align: center; margin-bottom: 44px;" class="reveal">
            <div style="font-family: var(--font-mono); font-size: 12px; font-weight: 600; color: var(--color-primary); letter-spacing: 0.16em; text-transform: uppercase; margin-bottom: 10px;">
              REALOPS TEAM ROSTER
            </div>
            <h2 style="font-size: clamp(26px, 3.5vw, 38px); font-weight: 700; color: var(--color-text); margin: 0;">
              Meet the Operational Crew
            </h2>
          </div>

          ${teamPreview.length > 0 ? `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px;" class="reveal">
              ${teamPreview.map((member, i) => `
                <div class="bento-card reveal-delay-${i + 1}" style="padding: 20px; display: flex; align-items: center; gap: 16px;">
                  ${member.avatar
                    ? `<img src="${App.escapeHtml(member.avatar)}" alt="${App.escapeHtml(member.name)}" loading="lazy" style="width: 56px; height: 56px; border-radius: 14px; object-fit: cover; border: 1px solid rgba(255,255,255,0.1);">`
                    : `<div style="width: 56px; height: 56px; border-radius: 14px; background: rgba(255, 107, 53, 0.15); border: 1px solid rgba(255, 107, 53, 0.2); display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; color: var(--color-primary);">${(member.name || '?').charAt(0).toUpperCase()}</div>`
                  }
                  <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 16px; font-weight: 600; color: var(--color-text); margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                      ${App.escapeHtml(member.name)}
                    </div>
                    <div style="font-size: 12px; color: var(--color-text-secondary); margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                      ${App.escapeHtml(member.position || 'Operations Pilot')}
                    </div>
                    <span style="font-family: var(--font-mono); font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-primary); background: rgba(255, 107, 53, 0.1); padding: 2px 6px; border-radius: 4px;">
                      ${App.escapeHtml(member.department)}
                    </span>
                  </div>
                </div>
              `).join('')}
            </div>
            <div style="text-align: center; margin-top: 32px;" class="reveal">
              <a href="/team" onclick="window.scrollTo(0,0)" class="glass-button-secondary" style="padding: 12px 24px; font-size: 14px; font-weight: 500; text-decoration: none;">
                View Full RealOps Roster →
              </a>
            </div>
          ` : `
            <div class="empty-state reveal">
              <div class="empty-state-icon">👥</div>
              <h3 class="empty-state-title">Team Roster Available Soon</h3>
            </div>
          `}

        </section>

        <!-- ═══════════════════════════════════════════ -->
        <!-- High-Impact Call-To-Action (CTA) -->
        <!-- ═══════════════════════════════════════════ -->
        <section class="reveal" id="home-cta">
          <div style="background: linear-gradient(135deg, rgba(20, 18, 18, 0.9) 0%, rgba(14, 13, 13, 0.95) 100%); border: 1px solid rgba(255, 107, 53, 0.2); border-radius: 28px; padding: 56px 28px; text-align: center; position: relative; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(255, 107, 53, 0.08);">
            
            <div style="position: absolute; top: -50%; left: 50%; transform: translateX(-50%); width: 800px; height: 400px; background: radial-gradient(circle, rgba(255, 107, 53, 0.1) 0%, transparent 70%); pointer-events: none;"></div>

            <div style="display: inline-flex; align-items: center; gap: 8px; padding: 4px 14px; background: rgba(255, 107, 53, 0.1); border-radius: 999px; margin-bottom: 20px;">
              <span class="status-beacon" style="width: 6px; height: 6px;"></span>
              <span style="font-family: var(--font-mono); font-size: 11px; font-weight: 600; color: var(--color-primary-light); text-transform: uppercase; letter-spacing: 0.12em;">JOIN THE REALOPS TEAM</span>
            </div>

            <h2 style="font-size: clamp(30px, 4.5vw, 48px); font-weight: 800; color: var(--color-text); margin: 0 0 16px; line-height: 1.15;">
              Ready for Real Operations on the Road?
            </h2>
            
            <p style="font-size: 16px; color: var(--color-text-secondary); max-width: 580px; margin: 0 auto 32px; line-height: 1.6;">
              Whether you want to request RealOps for your event or apply to join our crew of pilots and emergency responders.
            </p>

            <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
              <a href="https://discord.gg/realops" target="_blank" rel="noopener" class="glass-button-primary" style="padding: 14px 32px; font-size: 15px; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 8px;">
                Join RealOps Discord
                <span class="material-symbols-outlined" style="font-size: 18px;">arrow_forward</span>
              </a>
              <a href="/recruitment" onclick="window.scrollTo(0,0)" class="glass-button-secondary" style="padding: 14px 28px; font-size: 15px; font-weight: 500; text-decoration: none;">
                Apply to Join RealOps Team
              </a>
            </div>

          </div>
        </section>

      </main>
    `;
  }
};
