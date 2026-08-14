// ============================================================
// RealOps — Home Page (Real Operations Focus)
// ============================================================

const HomePage = {
  async render() {
    const results = await Promise.allSettled([
      API.getStats(),
      API.getEvents(),
      API.getStaff(),
      API.getPartnerships()
    ]);

    const stats = results[0].status === 'fulfilled' ? results[0].value : null;
    const events = results[1].status === 'fulfilled' ? results[1].value : [];
    const staff = results[2].status === 'fulfilled' ? results[2].value : [];
    const partnerships = results[3].status === 'fulfilled' ? results[3].value : [];

    const upcomingEvents = (events || []).slice(0, 3);
    const teamPreview = (staff || []).filter(s => s.status === 'active').slice(0, 6);
    const yearsOfService = new Date().getFullYear() - (stats?.foundedYear || 2021);

    // Generate Event JSON-LD structured data for SEO
    const eventJsonLd = upcomingEvents.length > 0
      ? upcomingEvents.map(event => ({
          '@context': 'https://schema.org',
          '@type': 'Event',
          name: event.title || 'RealOps Event',
          startDate: event.date ? `${event.date}${event.time ? 'T' + event.time + ':00Z' : ''}` : undefined,
          description: `TruckersMP convoy event${event.departure ? ' from ' + event.departure : ''}${event.arrival ? ' to ' + event.arrival : ''}`,
          eventStatus: 'https://schema.org/EventScheduled',
          eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
          location: {
            '@type': 'VirtualLocation',
            url: event.eventLink || 'https://discord.gg/realops'
          },
          organizer: {
            '@type': 'Organization',
            name: 'RealOps',
            url: 'https://realopsevents.com'
          },
          image: event.image || 'https://realopsevents.com/assets/logo.png'
        }))
      : [];

    return `
      <!-- Event JSON-LD Structured Data -->
      ${eventJsonLd.length > 0 ? eventJsonLd.map(schema =>
        `<script type="application/ld+json">${JSON.stringify(schema)}</script>`
      ).join('\n      ') : ''}

      <!-- Main Command Hub Container -->
      <main class="page-container">
        
        <!-- ═══════════════════════════════════════════ -->
        <!-- Hero Section — RealOps Operations Hub -->
        <!-- ═══════════════════════════════════════════ -->
        <section class="hero-hub-grid reveal">
          
          <!-- Left Column: RealOps Team & Operations Focus -->
          <div class="hero-left">

            <h1 class="hero-title">
              RealOps Team <br/>
              <span class="hero-gradient-text">
                Real Operations
              </span><br/>
              on the Road
            </h1>
            
            <p class="hero-subtitle">
              Delivering realistic on-road operations across TruckersMP — including simulated accidents, emergency police escorts, lane closures, and dynamic convoy control.
            </p>
            
            <div class="btn-row">
              <a href="https://discord.gg/realops" target="_blank" rel="noopener" class="glass-button-primary" style="padding: 14px 28px; display: inline-flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 600; text-decoration: none;">
                <svg viewBox="0 0 24 24" style="width: 18px; height: 18px; fill: currentColor;"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" /></svg>
                Join RealOps Discord
              </a>
              <a href="/events" class="glass-button-secondary" onclick="window.scrollTo(0,0)" style="padding: 14px 24px; display: inline-flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 500; text-decoration: none;">
                View Operations Schedule <span class="material-symbols-outlined" style="font-size: 18px;">arrow_forward</span>
              </a>
            </div>

            <!-- Quick Metrics Row -->
            <div class="metrics-row">
              <div>
                <div class="metric-value">300+</div>
                <div class="metric-label">Operations Run</div>
              </div>
              <div class="metric-divider"></div>
              <div>
                <div class="metric-value" style="color: #22c55e;">99.9%</div>
                <div class="metric-label">Scene Control</div>
              </div>
              <div class="metric-divider"></div>
              <div>
                <div class="metric-value" style="color: var(--color-primary-light);">${yearsOfService} Yrs</div>
                <div class="metric-label">Operational</div>
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
              <a href="/events" onclick="window.scrollTo(0,0)" class="mono-link">
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
        <section class="section">
          
          <div class="section-header reveal">
            <div class="section-label">ON-ROAD OPERATIONS</div>
            <h2 class="section-title">What RealOps Performs</h2>
          </div>

          <div class="grid-3 reveal">
            
            <!-- Operation 1: Simulated Accidents -->
            <div class="capability-card">
              <div class="capability-icon-box">
                <span class="material-symbols-outlined" style="font-size: 28px;">car_crash</span>
              </div>
              <div>
                <h3 class="card-title">Simulated Accidents & Hazards</h3>
                <p class="card-body">
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
                <h3 class="card-title">Police Chases & Emergency Escorts</h3>
                <p class="card-body">
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
                <h3 class="card-title">Traffic Control & Intersection Locks</h3>
                <p class="card-body">
                  Locking down busy junctions, roundabouts, and motorway ramps to allow massive truck convoys to pass without disruption.
                </p>
              </div>
            </div>

          </div>

        </section>

        <!-- ═══════════════════════════════════════════ -->
        <!-- Upcoming Events Showcase -->
        <!-- ═══════════════════════════════════════════ -->
        <section class="section" id="home-events">
          
          <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 36px; flex-wrap: wrap; gap: 16px;" class="reveal">
            <div>
              <div class="section-label" style="margin-bottom: 8px;">OPERATIONAL SCHEDULE</div>
              <h2 class="section-title-sm">Upcoming RealOps Events</h2>
            </div>
            <a href="/events" onclick="window.scrollTo(0,0)" class="glass-button-secondary" style="padding: 10px 20px; font-size: 14px; font-weight: 500; text-decoration: none;">
              Full Event Schedule →
            </a>
          </div>

          ${upcomingEvents.length > 0 ? `
            <div class="grid-cards reveal">
              ${upcomingEvents.map((event, i) => `
                <div class="modern-event-card reveal-delay-${i + 1}">
                  <div class="modern-event-img-wrap">
                    ${event.image
        ? `<img src="${App.escapeHtml(event.image)}" alt="${App.escapeHtml(event.title)}" loading="lazy">`
        : `<div class="event-placeholder">🚛</div>`
      }
                    <div style="position: absolute; top: 12px; right: 12px;">
                      <span class="event-status-badge">
                        ${App.escapeHtml(event.status || 'Scheduled')}
                      </span>
                    </div>
                  </div>
                  
                  <div class="event-card-body">
                    <div>
                      <h3 class="card-title-sm">
                        ${App.escapeHtml(event.title)}
                      </h3>
                      
                      <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
                        ${event.date ? `
                          <div class="meta-row">
                            <span class="material-symbols-outlined" style="font-size: 16px; color: var(--color-primary);">calendar_month</span>
                            ${App.formatDate(event.date)}
                          </div>
                        ` : ''}
                        ${event.server ? `
                          <div class="meta-row">
                            <span class="material-symbols-outlined" style="font-size: 16px; color: #3b82f6;">dns</span>
                            ${App.escapeHtml(event.server)}
                          </div>
                        ` : ''}
                      </div>
                    </div>

                    <div class="event-card-footer">
                      <span class="metric-label">
                        ${event.time ? `${App.escapeHtml(event.time)} UTC` : 'TBA'}
                      </span>
                      <a href="/events" onclick="window.scrollTo(0,0)" class="mono-link" style="font-size: 13px;">
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
        <section class="section" id="home-team">
          
          <div class="section-header reveal">
            <div class="section-label" style="margin-bottom: 10px;">REALOPS TEAM ROSTER</div>
            <h2 class="section-title-sm">Meet the Operational Crew</h2>
          </div>

          ${teamPreview.length > 0 ? `
            <div class="grid-team reveal">
              ${teamPreview.map((member, i) => `
                <div class="bento-card member-card reveal-delay-${i + 1}">
                  ${member.avatar
          ? `<img src="${App.escapeHtml(member.avatar)}" alt="${App.escapeHtml(member.name)}" loading="lazy" class="member-avatar">`
          : `<div class="member-avatar-placeholder">${(member.name || '?').charAt(0).toUpperCase()}</div>`
        }
                  <div class="member-info">
                    <div class="member-name">${App.escapeHtml(member.name)}</div>
                    <div class="member-role">${App.escapeHtml(member.position || 'Operations Pilot')}</div>
                    <span class="member-dept">${App.escapeHtml(member.department)}</span>
                  </div>
                </div>
              `).join('')}
            </div>
            <div class="text-center reveal" style="margin-top: 32px;">
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
          <div class="cta-banner">
            
            <div class="cta-glow"></div>

            <div class="status-pill" style="background: rgba(255, 107, 53, 0.1); border: none;">
              <span class="status-beacon" style="width: 6px; height: 6px;"></span>
              <span class="section-label-sm">JOIN THE REALOPS TEAM</span>
            </div>

            <h2 class="cta-title">
              Ready for Real Operations on the Road?
            </h2>
            
            <p class="cta-desc">
              Whether you want to request RealOps for your event or apply to join our crew of pilots and emergency responders.
            </p>

            <div class="cta-actions">
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
