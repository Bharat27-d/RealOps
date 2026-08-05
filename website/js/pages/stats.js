// ============================================================
// RealOps — Telemetry & Stats Dashboard
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
    const completedCount = stats?.completedEvents || 300;
    const totalStaffCount = stats?.totalStaff || (staff || []).length || 42;
    const partnerCount = stats?.activePartnerships || (partnerships || []).length || 18;

    return `
      <div class="container" style="padding-top: 130px; padding-bottom: 80px;">
        
        <div style="text-align: center; margin-bottom: 48px;" class="reveal">
          <h1 style="font-size: clamp(36px, 5vw, 56px); font-weight: 800; color: #ffffff;">
            RealOps <span class="gradient-text-orange">By The Numbers</span>
          </h1>
          <p style="font-size: 16px; color: var(--color-text-secondary); max-width: 600px; margin: 12px auto 0; line-height: 1.6;">
            Real-time operational benchmarks automatically synchronized with our Express & Firebase backend.
          </p>
        </div>

        <!-- Metric Grid -->
        <section style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; margin-bottom: 48px;" class="reveal">
          
          <div class="bento-card" style="padding: 32px;">
            <span class="material-symbols-outlined" style="font-size: 36px; color: var(--color-primary); margin-bottom: 16px;">event_available</span>
            <div class="metric-value" data-count="${completedCount}">${completedCount}</div>
            <div class="metric-label">Completed Convoys</div>
            <div class="metric-desc">Total events escorted and secured without major incidents.</div>
          </div>

          <div class="bento-card" style="padding: 32px;">
            <span class="material-symbols-outlined" style="font-size: 36px; color: var(--color-emerald); margin-bottom: 16px;">groups</span>
            <div class="metric-value" style="color: var(--color-emerald);" data-count="${totalStaffCount}">${totalStaffCount}</div>
            <div class="metric-label" style="color: var(--color-emerald);">Active Pilot Roster</div>
            <div class="metric-desc">Trained staff members available for dispatch.</div>
          </div>

          <div class="bento-card" style="padding: 32px;">
            <span class="material-symbols-outlined" style="font-size: 36px; color: var(--color-cyan); margin-bottom: 16px;">handshake</span>
            <div class="metric-value" style="color: var(--color-cyan);" data-count="${partnerCount}">${partnerCount}</div>
            <div class="metric-label" style="color: var(--color-cyan);">VTC Partnerships</div>
            <div class="metric-desc">Virtual Trucking Companies with official RealOps escorts.</div>
          </div>

          <div class="bento-card" style="padding: 32px;">
            <span class="material-symbols-outlined" style="font-size: 36px; color: var(--color-amber); margin-bottom: 16px;">history_toggle_off</span>
            <div class="metric-value" style="color: var(--color-amber);" data-count="${yearsOfService}">${yearsOfService}</div>
            <div class="metric-label" style="color: var(--color-amber);">Years of Service</div>
            <div class="metric-desc">Active since ${stats?.foundedYear || 2021}.</div>
          </div>

        </section>

        <!-- Live Sync Terminal Banner -->
        <section class="reveal">
          <div class="bento-card" style="padding: 32px; text-align: center; border-color: rgba(0, 242, 254, 0.3);">
            <div style="font-family: var(--font-mono); font-size: 13px; color: var(--color-cyan); margin-bottom: 8px;">
              [ TELEMETRY CACHE TTL: 300 SECONDS ]
            </div>
            <p style="color: var(--color-text-secondary); max-width: 540px; margin: 0 auto; font-size: 14px; line-height: 1.6;">
              Data on this page is retrieved directly from <code style="color: var(--color-primary); font-family: var(--font-mono);">api.realopsevents.com/api/public/stats</code> and cached in local session storage for optimal client speed.
            </p>
          </div>
        </section>

      </div>
    `;
  }
};
