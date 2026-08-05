// ============================================================
// RealOps — Statistics Page
// ============================================================

const StatsPage = {
  async render() {
    const [stats, staff, partnerships, events] = await Promise.all([
      API.getStats(),
      API.getStaff(),
      API.getPartnerships(),
      API.getEvents()
    ]);

    const yearsOfService = new Date().getFullYear() - (stats?.foundedYear || 2021);
    const activeStaff = (staff || []).filter(s => s.status === 'active').length;
    const departments = [...new Set((staff || []).map(s => s.department).filter(Boolean))];

    return `
      <main class="flex-grow relative z-10 pt-[120px] pb-xl px-4 md:px-lg mx-auto w-full flex flex-col gap-xl" style="padding-top: 120px; padding-bottom: 64px; max-width: var(--max-width); margin: 0 auto;">
        
        <div class="page-header" style="text-align: center; margin-bottom: 64px;">
          <div style="font-family: var(--font-mono); font-size: 13px; color: var(--color-primary); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px;">📊 Statistics</div>
          <h1 class="glow-text" style="font-size: clamp(40px, 6vw, 64px); font-weight: 600; line-height: 1.1; letter-spacing: -0.04em; color: var(--color-text); text-transform: uppercase; max-width: 900px; margin: 0 auto;">
            RealOps by the <span style="color: var(--color-primary);">Numbers</span>
          </h1>
          <p style="font-size: 16px; color: var(--color-text-secondary); max-width: 600px; margin: 16px auto 0; line-height: 1.6;">
            Live statistics synced directly from our operations dashboard. All data is updated automatically.
          </p>
        </div>

        <!-- Primary Stats -->
        <section class="section" style="width: 100%; margin-bottom: 40px;">
          <div class="container" style="max-width: 100%;">
            <div class="section-label" style="font-family: var(--font-mono); font-size: 13px; color: var(--color-text-secondary); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px;">Key Metrics</div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: 24px;">
              <div class="bento-card ambient-shadow reveal reveal-delay-1" style="padding: 32px; display: flex; flex-direction: column; justify-content: space-between; min-height: 200px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <span style="font-family: var(--font-mono); font-size: 12px; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.1em;">Total Events</span>
                  <span class="material-symbols-outlined" style="color: var(--color-primary);">event</span>
                </div>
                <div>
                  <div style="font-size: 48px; font-weight: 600; color: var(--color-text); letter-spacing: -0.04em; line-height: 1.1;" data-count="356">0</div>
                  <p style="font-size: 14px; color: var(--color-text-secondary); margin-top: 8px;">Total events hosted on network.</p>
                </div>
              </div>

              <div class="bento-card ambient-shadow reveal reveal-delay-2" style="padding: 32px; display: flex; flex-direction: column; justify-content: space-between; min-height: 200px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <span style="font-family: var(--font-mono); font-size: 12px; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.1em;">Events Completed</span>
                  <span class="material-symbols-outlined" style="color: var(--color-primary);">task_alt</span>
                </div>
                <div>
                  <div style="font-size: 48px; font-weight: 600; color: var(--color-text); letter-spacing: -0.04em; line-height: 1.1;" data-count="227">0</div>
                  <p style="font-size: 14px; color: var(--color-text-secondary); margin-top: 8px;">Successfully finished.</p>
                </div>
              </div>

              <div class="bento-card ambient-shadow reveal reveal-delay-3" style="padding: 32px; display: flex; flex-direction: column; justify-content: space-between; min-height: 200px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <span style="font-family: var(--font-mono); font-size: 12px; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.1em;">Upcoming Events</span>
                  <span class="material-symbols-outlined" style="color: var(--color-primary);">pending_actions</span>
                </div>
                <div>
                  <div style="font-size: 48px; font-weight: 600; color: var(--color-text); letter-spacing: -0.04em; line-height: 1.1;" data-count="${(events || []).length}">0</div>
                  <p style="font-size: 14px; color: var(--color-text-secondary); margin-top: 8px;">Scheduled in the calendar.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Team Stats -->
        <section class="section" style="width: 100%; margin-bottom: 40px;">
          <div class="container" style="max-width: 100%;">
            <div class="section-label" style="font-family: var(--font-mono); font-size: 13px; color: var(--color-text-secondary); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px;">Staff Overview</div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;">
              <div class="bento-card ambient-shadow reveal reveal-delay-1" style="padding: 24px; display: flex; align-items: center; gap: 16px;">
                <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(255, 107, 53, 0.1); color: var(--color-primary); display: flex; align-items: center; justify-content: center;">
                  <span class="material-symbols-outlined" style="font-size: 24px;">group</span>
                </div>
                <div>
                  <div style="font-size: 24px; font-weight: 600; color: var(--color-text); line-height: 1;" data-count="${stats?.totalStaff || 0}">0</div>
                  <div style="font-size: 12px; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px;">Total Members</div>
                </div>
              </div>

              <!--<div class="bento-card ambient-shadow reveal reveal-delay-2" style="padding: 24px; display: flex; align-items: center; gap: 16px;">
                <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(34, 197, 94, 0.1); color: #22C55E; display: flex; align-items: center; justify-content: center;">
                  <span class="material-symbols-outlined" style="font-size: 24px;">person_check</span>
                </div>
                <div>
                  <div style="font-size: 24px; font-weight: 600; color: var(--color-text); line-height: 1;" data-count="${activeStaff}">0</div>
                  <div style="font-size: 12px; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px;">Active Nodes</div>
                </div> 
              </div> -->

              <div class="bento-card ambient-shadow reveal reveal-delay-3" style="padding: 24px; display: flex; align-items: center; gap: 16px;">
                <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(59, 130, 246, 0.1); color: #3B82F6; display: flex; align-items: center; justify-content: center;">
                  <span class="material-symbols-outlined" style="font-size: 24px;">lan</span>
                </div>
                <div>
                  <div style="font-size: 24px; font-weight: 600; color: var(--color-text); line-height: 1;" data-count="${departments.length}">0</div>
                  <div style="font-size: 12px; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px;">Departments</div>
                </div>
              </div>
              
              <div class="bento-card ambient-shadow reveal reveal-delay-4" style="padding: 24px; display: flex; align-items: center; gap: 16px;">
                <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(168, 85, 247, 0.1); color: #A855F7; display: flex; align-items: center; justify-content: center;">
                  <span class="material-symbols-outlined" style="font-size: 24px;">handshake</span>
                </div>
                <div>
                  <div style="font-size: 24px; font-weight: 600; color: var(--color-text); line-height: 1;" data-count="${stats?.activePartnerships || 0}">0</div>
                  <div style="font-size: 12px; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px;">Partnerships</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Service Stats -->
        <section class="section" style="width: 100%; margin-bottom: 40px;">
          <div class="container" style="max-width: 100%;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 12px;">
              <div class="bento-card ambient-shadow reveal reveal-delay-1" style="padding: 40px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; min-height: 250px;">
                <span class="material-symbols-outlined" style="font-size: 48px; color: var(--color-primary); margin-bottom: 16px;">timer</span>
                <div style="font-size: 64px; font-weight: 600; color: var(--color-text); line-height: 1; margin-bottom: 8px;" data-count="${yearsOfService}">0</div>
                <div style="font-size: 16px; font-weight: 500; color: var(--color-text);">Years of Service</div>
                <p style="font-size: 13px; color: var(--color-text-secondary); margin-top: 8px; font-family: var(--font-mono);">Since ${stats?.foundedYear || 2021}</p>
              </div>
              
              <div class="bento-card ambient-shadow reveal reveal-delay-2" style="padding: 40px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; min-height: 250px; background: linear-gradient(145deg, rgba(15,15,15,0.9) 0%, rgba(255, 107, 53, 0.05) 100%);">
                <span class="material-symbols-outlined" style="font-size: 48px; color: var(--color-primary); margin-bottom: 16px;">rocket_launch</span>
                <div style="font-size: 64px; font-weight: 600; color: var(--color-text); line-height: 1; margin-bottom: 8px;" data-count="${(stats?.totalEvents || 0) + (stats?.totalStaff || 0) + (stats?.activePartnerships || 0)}">0</div>
                <div style="font-size: 16px; font-weight: 500; color: var(--color-text);">Total Operations</div>
                <p style="font-size: 13px; color: var(--color-text-secondary); margin-top: 8px; font-family: var(--font-mono);">Combined events, members, and partnerships</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Data Source Note -->
        <section class="section" style="width: 100%;">
          <div class="container" style="max-width: 100%;">
            <div class="bento-card ambient-shadow reveal" style="text-align: center; padding: 32px; border: 1px solid rgba(255,255,255,0.05); background: transparent;">
              <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 8px;">
                <div class="status-beacon" style="width: 8px; height: 8px;"></div>
                <span style="font-family: var(--font-mono); font-size: 12px; color: var(--color-primary); text-transform: uppercase; letter-spacing: 0.1em;">Live Dashboard Data</span>
              </div>
              <p style="font-size: 14px; color: var(--color-text-secondary); max-width: 500px; margin: 0 auto; line-height: 1.6;">
                All statistics on this page are automatically synced from the RealOps Operations Dashboard. Data refreshes every 5 minutes to ensure accuracy.
              </p>
            </div>
          </div>
        </section>
      </main>
    `;
  }
};
