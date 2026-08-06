// RealOps — Community Guidelines Page

const GuidelinesPage = {
  render: () => {
    return `
      <!-- Main Container -->
      <main class="flex-grow relative z-10 pt-[100px] pb-xl px-4 md:px-lg mx-auto w-full flex flex-col" style="padding-top: 100px; padding-bottom: 80px; max-width: 860px; margin: 0 auto;">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 48px;" class="reveal">
          <div style="display: inline-flex; align-items: center; gap: 8px; padding: 4px 14px; background: rgba(255, 107, 53, 0.08); border: 1px solid rgba(255, 107, 53, 0.2); border-radius: 999px; margin-bottom: 16px;">
            <span class="status-beacon" style="width: 6px; height: 6px;"></span>
            <span style="font-family: var(--font-mono); font-size: 11px; font-weight: 600; color: var(--color-primary-light); text-transform: uppercase; letter-spacing: 0.12em;">COMMUNITY STANDARDS</span>
          </div>

          <h1 style="font-size: clamp(32px, 5vw, 48px); font-weight: 800; color: var(--color-text); margin: 0 0 14px; letter-spacing: -0.03em;">
            Community Guidelines
          </h1>
          
          <p style="font-size: 15px; color: var(--color-text-secondary); max-width: 540px; margin: 0 auto; line-height: 1.6;">
            Conduct rules and operational standards for RealOps Team members, escort pilots, and event participants.
          </p>
        </div>

        <section class="reveal">
          <div class="bento-card" style="padding: 40px; background: rgba(18, 16, 16, 0.8); border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 24px;">
            
            <h2 style="font-size: 20px; font-weight: 700; color: var(--color-primary); margin: 0 0 12px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.06);">1. Respect and Professionalism</h2>
            <p style="font-size: 14px; color: var(--color-text-secondary); line-height: 1.7; margin-bottom: 24px;">
              Treat all convoy participants, pilots, commanders, and event organizers with respect. Toxicity, harassment, and discrimination are strictly prohibited across all RealOps channels and events.
            </p>

            <h2 style="font-size: 20px; font-weight: 700; color: var(--color-primary); margin: 0 0 12px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.06);">2. On-Road Event Conduct</h2>
            <p style="font-size: 14px; color: var(--color-text-secondary); line-height: 1.7; margin-bottom: 24px;">
              When participating in or controlling a convoy, follow all instructions given by lead pilot vehicles and event dispatchers. Reckless driving, intentional ramming, or disrupting simulated accident scenes will result in removal.
            </p>

            <h2 style="font-size: 20px; font-weight: 700; color: var(--color-primary); margin: 0 0 12px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.06);">3. Communication Protocol</h2>
            <p style="font-size: 14px; color: var(--color-text-secondary); line-height: 1.7; margin-bottom: 24px;">
              Maintain clear, concise communication over CB radio channels and Discord voice dispatches during active operations. Keep non-essential chatter to a minimum during active scene responses.
            </p>

            <h2 style="font-size: 20px; font-weight: 700; color: var(--color-primary); margin: 0 0 12px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.06);">4. Enforcement & Compliance</h2>
            <p style="font-size: 14px; color: var(--color-text-secondary); line-height: 1.7; margin: 0;">
              Violations of community guidelines are reviewed by RealOps management. Depending on severity, actions may include formal warnings, temporary event suspensions, or permanent bans.
            </p>

          </div>
        </section>

      </main>
    `;
  }
};
