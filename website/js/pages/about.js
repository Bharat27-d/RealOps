// ============================================================
// RealOps — About & Evolution Page
// ============================================================

const AboutPage = {
  async render() {
    const stats = await API.getStats();
    const partners = await API.getPartnerships() || [];
    const yearsOfService = new Date().getFullYear() - (stats?.foundedYear || 2021);

    return `
      <div class="container" style="padding-top: 130px; padding-bottom: 80px;">
        
        <div style="text-align: center; margin-bottom: 48px;" class="reveal">
          <h1 style="font-size: clamp(36px, 5vw, 56px); font-weight: 800; color: #ffffff;">
            Pioneering <span class="gradient-text-orange">Convoy Safety</span>
          </h1>
          <p style="font-size: 16px; color: var(--color-text-secondary); max-width: 620px; margin: 12px auto 0; line-height: 1.6;">
            Founded to raise Real Operation standards across the TruckersMP community through structured operations and custom bot telemetry.
          </p>
        </div>

        <!-- Story Overview Card -->
        <section class="reveal" style="margin-bottom: 64px;">
          <div class="bento-card" style="padding: 48px; display: grid; grid-template-columns: repeat(12, 1fr); gap: 40px; align-items: center;">
            <div style="grid-column: span 12;" id="about-text-col">
              <style>
                @media(min-width: 900px) {
                  #about-text-col { grid-column: span 7 !important; }
                  #about-img-col { grid-column: span 5 !important; }
                }
              </style>
              <h2 style="font-size: 30px; font-weight: 700; color: #ffffff; margin-bottom: 16px;">
                Engineered for Convoy Operations
              </h2>
              <p style="font-size: 15px; color: var(--color-text-secondary); line-height: 1.7; margin-bottom: 16px;">
                RealOps began in ${stats?.foundedYear || 2021} with a clear objective: replace disorganized convoy escorts with structured, radio-controlled, and automated pilot teams.
              </p>
              <p style="font-size: 15px; color: var(--color-text-secondary); line-height: 1.7; margin-bottom: 24px;">
                Over <strong style="color: var(--color-primary);">${yearsOfService}+ years</strong>, we have built a custom tech ecosystem—combining a Discord bot, automated ticket dispatching, an express backend dashboard, and a live web telemetry suite.
              </p>
              
              <div style="display: flex; gap: 24px; font-family: var(--font-mono); font-size: 13px;">
                <div><span style="font-size: 24px; font-weight: bold; color: var(--color-primary); display: block;">300+</span> Convoys Controlled</div>
                <div><span style="font-size: 24px; font-weight: bold; color: var(--color-cyan); display: block;">99.9%</span> Success Rate</div>
              </div>
            </div>

            <div style="grid-column: span 12; text-align: center;" id="about-img-col">
              <div style="border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--color-border); background: rgba(0,0,0,0.3); padding: 12px;">
                <img src="assets/rops_2.png" alt="RealOps Escort Vehicle" style="width: 100%; height: auto; border-radius: var(--radius-md); filter: drop-shadow(0 10px 30px rgba(255,94,26,0.2));">
              </div>
            </div>
          </div>
        </section>

        <!-- 4 Pillars Grid -->
        <section style="margin-bottom: 64px;">
          <div style="text-align: center; margin-bottom: 32px;" class="reveal">
            <h2 style="font-size: 32px; font-weight: 700; color: #ffffff;">Four Pillars of Excellence</h2>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px;" class="reveal">
            <div class="bento-card" style="padding: 32px;">
              <span class="material-symbols-outlined" style="font-size: 36px; color: var(--color-primary); margin-bottom: 16px;">shield</span>
              <h3 style="font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 8px;">1. Absolute Safety</h3>
              <p style="font-size: 14px; color: var(--color-text-secondary); line-height: 1.6;">Rigorous junction blocking protocols and speed pace control to protect every participant on server roads.</p>
            </div>

            <div class="bento-card" style="padding: 32px;">
              <span class="material-symbols-outlined" style="font-size: 36px; color: var(--color-cyan); margin-bottom: 16px;">radio</span>
              <h3 style="font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 8px;">2. Clear Radio Comms</h3>
              <p style="font-size: 14px; color: var(--color-text-secondary); line-height: 1.6;">Structured voice channel discipline using standard aviation/logistics callouts for zero confusion.</p>
            </div>

            <div class="bento-card" style="padding: 32px;">
              <span class="material-symbols-outlined" style="font-size: 36px; color: var(--color-amber); margin-bottom: 16px;">developer_board</span>
              <h3 style="font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 8px;">3. Custom Tech Suite</h3>
              <p style="font-size: 14px; color: var(--color-text-secondary); line-height: 1.6;">Custom Discord bot v14, Firebase Firestore database, and React dashboard for live ticket & event management.</p>
            </div>

            <div class="bento-card" style="padding: 32px;">
              <span class="material-symbols-outlined" style="font-size: 36px; color: var(--color-emerald); margin-bottom: 16px;">handshake</span>
              <h3 style="font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 8px;">4. VTC Community Trust</h3>
              <p style="font-size: 14px; color: var(--color-text-secondary); line-height: 1.6;">Collaborating with dozens of Virtual Trucking Companies to provide seamless escort partnerships.</p>
            </div>
          </div>
        </section>

      </div>
    `;
  }
};
