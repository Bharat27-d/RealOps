// ============================================================
// RealOps — About Page (Redesign)
// ============================================================

const AboutPage = {
  async render() {
    const stats = await API.getStats();
    const partners = await API.getPartnerships() || [];
    const yearsOfService = new Date().getFullYear() - (stats?.foundedYear || 2021);

    return `
      <!-- Main Container -->
      <main class="flex-grow relative z-10 pt-[100px] pb-xl px-4 md:px-lg mx-auto w-full flex flex-col" style="padding-top: 100px; padding-bottom: 80px; max-width: var(--max-width); margin: 0 auto;">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 48px;" class="reveal">
          <div style="display: inline-flex; align-items: center; gap: 8px; padding: 4px 14px; background: rgba(255, 107, 53, 0.08); border: 1px solid rgba(255, 107, 53, 0.2); border-radius: 999px; margin-bottom: 16px;">
            <span class="status-beacon" style="width: 6px; height: 6px;"></span>
            <span style="font-family: var(--font-mono); font-size: 11px; font-weight: 600; color: var(--color-primary-light); text-transform: uppercase; letter-spacing: 0.12em;">ABOUT REALOPS TEAM</span>
          </div>

          <h1 style="font-size: clamp(32px, 5vw, 54px); font-weight: 800; color: var(--color-text); margin: 0 0 14px; letter-spacing: -0.03em;">
            On-Road Operations Division
          </h1>
          
          <p style="font-size: 16px; color: var(--color-text-secondary); max-width: 580px; margin: 0 auto; line-height: 1.6;">
            Dedicated to real operations on the road — simulated accidents, police chases, emergency escorts, and convoy control across TruckersMP.
          </p>
        </div>

        <!-- Overview Card -->
        <section style="margin-bottom: 56px;" class="reveal">
          <div class="bento-card" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 40px; padding: 40px; background: rgba(18, 16, 16, 0.8); border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 24px;">
            <div>
              <h2 style="font-size: 28px; font-weight: 700; color: var(--color-text); margin: 0 0 20px;">Who We Are</h2>
              <p style="font-size: 15px; color: var(--color-text-secondary); line-height: 1.65; margin-bottom: 16px;">
                RealOps Team is a premier operations division in TruckersMP. We specialize in staging dynamic, realistic road scenarios — from multi-vehicle simulated accidents and emergency police escorts to high-capacity convoy locks.
              </p>
              <p style="font-size: 15px; color: var(--color-text-secondary); line-height: 1.65; margin-bottom: 16px;">
                Our crew consists of trained commanders, escort pilots, and emergency responders who work together to make every virtual trucking event feel authentic, safe, and exhilarating.
              </p>
              <p style="font-size: 15px; color: var(--color-text-secondary); line-height: 1.65;">
                With <strong style="color: var(--color-primary);">${yearsOfService}+ years</strong> of operation, <strong style="color: var(--color-text);">300+</strong> events executed, and <strong style="color: var(--color-text);">${stats?.totalStaff || 24}</strong> dedicated crew members, RealOps Team sets the standard for virtual road operations.
              </p>
            </div>
            
            <div style="display: flex; align-items: center; justify-content: center; background: rgba(10, 9, 9, 0.8); border-radius: 16px; padding: 24px; border: 1px solid rgba(255,255,255,0.05);">
              <img src="assets/rops_2.png" alt="RealOps Operations" loading="lazy" style="max-width: 100%; border-radius: 12px; filter: drop-shadow(0 10px 30px rgba(255, 107, 53, 0.2)); object-fit: cover;">
            </div>
          </div>
        </section>

        <!-- Core Operational Pillars -->
        <section style="margin-bottom: 56px;" class="reveal">
          <div style="text-align: center; margin-bottom: 36px;">
            <div style="font-family: var(--font-mono); font-size: 12px; font-weight: 600; color: var(--color-primary); letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 8px;">OPERATIONAL PILLARS</div>
            <h2 style="font-size: 28px; font-weight: 700; color: var(--color-text); margin: 0;">What We Perform</h2>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
            
            <div class="bento-card" style="padding: 28px; background: rgba(18, 16, 16, 0.7); border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 20px;">
              <div style="width: 56px; height: 56px; border-radius: 14px; background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: 0 4px 16px rgba(239, 68, 68, 0.15);">
                <span class="material-symbols-outlined" style="font-size: 28px;">car_crash</span>
              </div>
              <h3 style="font-size: 19px; font-weight: 600; color: var(--color-text); margin: 0 0 10px;">Simulated Accidents</h3>
              <p style="font-size: 14px; color: var(--color-text-secondary); line-height: 1.6; margin: 0;">
                Staging realistic crash scenes, highway lane closures, and detour routes to challenge convoy drivers.
              </p>
            </div>

            <div class="bento-card" style="padding: 28px; background: rgba(18, 16, 16, 0.7); border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 20px;">
              <div style="width: 56px; height: 56px; border-radius: 14px; background: rgba(59, 130, 246, 0.12); border: 1px solid rgba(59, 130, 246, 0.3); color: #60a5fa; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: 0 4px 16px rgba(59, 130, 246, 0.15);">
                <span class="material-symbols-outlined" style="font-size: 28px;">local_police</span>
              </div>
              <h3 style="font-size: 19px; font-weight: 600; color: var(--color-text); margin: 0 0 10px;">Police & Emergency Escorts</h3>
              <p style="font-size: 14px; color: var(--color-text-secondary); line-height: 1.6; margin: 0;">
                High-speed emergency vehicle responses, rolling roadblocks, and active escort protection.
              </p>
            </div>

            <div class="bento-card" style="padding: 28px; background: rgba(18, 16, 16, 0.7); border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 20px;">
              <div style="width: 56px; height: 56px; border-radius: 14px; background: rgba(255, 107, 53, 0.12); border: 1px solid rgba(255, 107, 53, 0.3); color: #ff8c66; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: 0 4px 16px rgba(255, 107, 53, 0.15);">
                <span class="material-symbols-outlined" style="font-size: 28px;">traffic</span>
              </div>
              <h3 style="font-size: 19px; font-weight: 600; color: var(--color-text); margin: 0 0 10px;">Junction Locks & Traffic Control</h3>
              <p style="font-size: 14px; color: var(--color-text-secondary); line-height: 1.6; margin: 0;">
                Locking down busy junctions, roundabouts, and motorway ramps for smooth truck convoys.
              </p>
            </div>

          </div>
        </section>

        <!-- Partners Section -->
        ${partners && partners.length > 0 ? `
          <section style="margin-bottom: 56px;" class="reveal">
            <div style="text-align: center; margin-bottom: 36px;">
              <div style="font-family: var(--font-mono); font-size: 12px; font-weight: 600; color: var(--color-primary); letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 8px;">PARTNERSHIPS</div>
              <h2 style="font-size: 28px; font-weight: 700; color: var(--color-text); margin: 0;">Trusted Partners</h2>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px;">
              ${partners.map(partner => `
                <a href="${partner.url || '#'}" target="_blank" rel="noopener" class="bento-card" style="padding: 24px; display: flex; flex-direction: column; align-items: center; text-decoration: none; text-align: center; background: rgba(18, 16, 16, 0.6); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 16px;">
                  ${partner.logo ? `
                    <div style="height: 64px; display: flex; align-items: center; justify-content: center; margin-bottom: 14px;">
                      <img src="${partner.logo}" alt="${partner.name}" loading="lazy" style="max-width: 120px; max-height: 64px; object-fit: contain;">
                    </div>
                  ` : `
                    <div style="width: 56px; height: 56px; border-radius: 50%; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; margin-bottom: 14px;">
                      <span class="material-symbols-outlined" style="font-size: 28px; color: var(--color-text-secondary);">handshake</span>
                    </div>
                  `}
                  <h3 style="font-size: 16px; font-weight: 600; color: var(--color-text); margin-bottom: 4px;">${partner.name || 'Partner'}</h3>
                  ${partner.description ? `<p style="font-size: 12px; color: var(--color-text-muted); line-height: 1.4; margin: 0;">${partner.description}</p>` : ''}
                </a>
              `).join('')}
            </div>
          </section>
        ` : ''}

        <!-- CTA Banner -->
        <section class="reveal">
          <div style="background: rgba(16, 14, 14, 0.9); border: 1px solid rgba(255, 107, 53, 0.2); border-radius: 24px; padding: 48px 24px; text-align: center;">
            <h3 style="font-size: 26px; font-weight: 700; color: var(--color-text); margin: 0 0 12px;">
              Ready to Work with RealOps Team?
            </h3>
            <p style="font-size: 15px; color: var(--color-text-secondary); max-width: 540px; margin: 0 auto 24px; line-height: 1.6;">
              Join our Discord server or apply to join our crew of escort pilots and emergency responders.
            </p>
            <div style="display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;">
              <a href="https://discord.gg/realops" target="_blank" rel="noopener" class="glass-button-primary" style="padding: 12px 28px; font-size: 15px; font-weight: 600; text-decoration: none;">
                Join Discord
              </a>
              <a href="/recruitment" onclick="window.scrollTo(0,0)" class="glass-button-secondary" style="padding: 12px 24px; font-size: 15px; font-weight: 500; text-decoration: none;">
                View Open Roles
              </a>
            </div>
          </div>
        </section>

      </main>
    `;
  }
};
