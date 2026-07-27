// ============================================================
// RealOps — About Page
// ============================================================

const AboutPage = {
  async render() {
    const stats = await API.getStats();
    const partners = await API.getPartnerships() || [];
    const yearsOfService = new Date().getFullYear() - (stats?.foundedYear || 2021);

    return `
      <main class="flex-grow relative z-10 pt-[120px] pb-xl px-4 md:px-lg mx-auto w-full flex flex-col gap-xl" style="padding-top: 120px; padding-bottom: 64px; max-width: var(--max-width); margin: 0 auto;">
        
        <div class="page-header" style="text-align: center; margin-bottom: 64px;">
          <div style="font-family: var(--font-mono); font-size: 13px; color: var(--color-primary); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px;">About Us</div>
          <h1 class="glow-text" style="font-size: clamp(40px, 6vw, 64px); font-weight: 600; line-height: 1.1; letter-spacing: -0.04em; color: var(--color-text); text-transform: uppercase; max-width: 900px; margin: 0 auto;">
            About <span style="color: var(--color-primary);">RealOps</span>
          </h1>
          <p style="font-size: 16px; color: var(--color-text-secondary); max-width: 600px; margin: 16px auto 0; line-height: 1.6;">
            One of the leading RealOps teams in the TruckersMP community, dedicated to professional operations and community excellence.
          </p>
        </div>

        <!-- About Overview -->
        <section class="section" style="width: 100%; margin-bottom: 40px;">
          <div class="container" style="max-width: 100%;">
            <div class="bento-card ambient-shadow reveal" style="display: flex; flex-direction: row; flex-wrap: wrap; gap: 40px; padding: 48px;">
              <div class="about-content" style="flex: 1; min-width: 300px;">
                <h2 style="font-size: 32px; font-weight: 600; color: var(--color-text); margin-bottom: 24px; letter-spacing: -0.02em;">Who We Are</h2>
                <p style="font-size: 16px; color: var(--color-text-secondary); line-height: 1.6; margin-bottom: 16px;">
                  RealOps is a premier Real Operations team within the TruckersMP community. Founded with a vision to bring professionalism and organisation to virtual trucking convoys, we have grown into one of the most respected Real Operations teams in the community.
                </p>
                <p style="font-size: 16px; color: var(--color-text-secondary); line-height: 1.6; margin-bottom: 16px;">
                  Our team consists of dedicated individuals who share a passion for virtual trucking and a commitment to ensuring every convoy runs smoothly, safely, and professionally. We work alongside event organisers, partner communities, and TruckersMP staff to deliver exceptional convoy experiences.
                </p>
                <p style="font-size: 16px; color: var(--color-text-secondary); line-height: 1.6;">
                  With <strong style="color: var(--color-primary);">${yearsOfService}+ years</strong> of service, <strong style="color: var(--color-text);">300+</strong> events hosted, and a team of <strong style="color: var(--color-text);">${stats?.totalStaff || 'dedicated'}</strong> members, RealOps continues to set the standard for Real Operations excellence.
                </p>
              </div>
              <div class="about-image-card reveal reveal-delay-2" style="flex: 1; min-width: 300px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.02); border-radius: 12px; padding: 24px;">
                <img src="assets/rops_2.png" alt="RealOps Operations" loading="lazy" style="max-width: 100%; width: 100%; height: auto; border-radius: 12px; filter: drop-shadow(0 0 20px rgba(255, 107, 53, 0.2)); object-fit: cover;">
              </div>
            </div>
          </div>
        </section>

        <!-- Mission & Vision -->
        <section class="section" style="width: 100%; margin-bottom: 40px;">
          <div class="container" style="max-width: 100%;">
            <div style="text-align: center; margin-bottom: 40px;">
              <div style="font-family: var(--font-mono); font-size: 13px; color: var(--color-primary); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px;">🎯 Our Purpose</div>
              <h2 style="font-size: 32px; font-weight: 600; color: var(--color-text); letter-spacing: -0.02em;">Mission & Vision</h2>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px;">
              <div class="bento-card ambient-shadow reveal reveal-delay-1" style="padding: 40px;">
                <h3 style="font-size: 24px; font-weight: 500; color: var(--color-text); margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                  <span class="material-symbols-outlined" style="color: var(--color-primary);">track_changes</span> Our Mission
                </h3>
                <p style="font-size: 16px; color: var(--color-text-secondary); line-height: 1.6;">
                  To provide the highest quality Real Operations services within the TruckersMP community. We are committed to professionalism, safety, and delivering an outstanding experience for every participant in every event we support.
                </p>
              </div>
              <div class="bento-card ambient-shadow reveal reveal-delay-2" style="padding: 40px;">
                <h3 style="font-size: 24px; font-weight: 500; color: var(--color-text); margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                  <span class="material-symbols-outlined" style="color: var(--color-primary);">visibility</span> Our Vision
                </h3>
                <p style="font-size: 16px; color: var(--color-text-secondary); line-height: 1.6;">
                  To be recognised as the gold standard for Real Operations in TruckersMP. We envision a community where every operation is managed with precision, care, and a level of professionalism that inspires others to raise their standards.
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- Our Partners -->
        <section class="section" style="width: 100%; margin-bottom: 40px;">
          <div class="container" style="max-width: 100%;">
            <div style="text-align: center; margin-bottom: 40px;">
              <div style="font-family: var(--font-mono); font-size: 13px; color: var(--color-primary); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px;">🤝 Trusted By</div>
              <h2 style="font-size: 32px; font-weight: 600; color: var(--color-text); letter-spacing: -0.02em;">Our Partners</h2>
              <p style="font-size: 16px; color: var(--color-text-secondary); margin-top: 8px;">Communities and organisations we work closely with.</p>
            </div>

            ${partners && partners.length > 0 ? `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 24px;">
              ${partners.map(partner => `
                <a href="${partner.url || '#'}" target="_blank" rel="noopener" class="bento-card ambient-shadow reveal" style="padding: 32px 24px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-decoration: none; text-align: center; transition: transform 0.3s ease, border-color 0.3s ease;">
                  ${partner.logo ? `
                    <div style="height: 80px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                      <img src="${partner.logo}" alt="${partner.name}" loading="lazy" style="max-width: 140px; max-height: 80px; object-fit: contain;">
                    </div>
                  ` : `
                    <div style="width: 80px; height: 80px; border-radius: 50%; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                      <span class="material-symbols-outlined" style="font-size: 32px; color: var(--color-text-secondary);">handshake</span>
                    </div>
                  `}
                  <h3 style="font-size: 18px; font-weight: 600; color: var(--color-text); margin-bottom: 8px;">${partner.name || 'Partner'}</h3>
                  ${partner.description ? `<p style="font-size: 14px; color: var(--color-text-secondary); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${partner.description}</p>` : ''}
                </a>
              `).join('')}
            </div>
            ` : `
              <div class="empty-state reveal bento-card ambient-shadow" style="padding: 64px; text-align: center;">
                <div class="empty-state-icon" style="font-size: 48px; margin-bottom: 16px;">🤝</div>
                <h3 class="empty-state-title" style="font-size: 24px; color: var(--color-text); margin-bottom: 8px;">No Partners Yet</h3>
                <p class="empty-state-desc" style="color: var(--color-text-secondary);">We are always open to new partnerships. Reach out to us if you're interested!</p>
                <div style="margin-top: 24px;">
                  <a href="/contact" onclick="window.scrollTo(0,0)" class="glass-button-primary" style="display: inline-block; padding: 12px 24px; font-size: 16px; text-decoration: none;">Contact Us</a>
                </div>
              </div>
            `}
          </div>
        </section>

        <!-- Why RealOps -->
        <section class="section" style="width: 100%; margin-bottom: 40px;">
          <div class="container" style="max-width: 100%;">
            <div style="text-align: center; margin-bottom: 40px;">
              <div style="font-family: var(--font-mono); font-size: 13px; color: var(--color-primary); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px;">✨ Why Choose Us</div>
              <h2 style="font-size: 32px; font-weight: 600; color: var(--color-text); letter-spacing: -0.02em;">Why RealOps</h2>
              <p style="font-size: 16px; color: var(--color-text-secondary); margin-top: 8px;">What sets us apart from the rest of the community.</p>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px;">
              <div class="bento-card ambient-shadow reveal reveal-delay-1" style="padding: 32px; display: flex; flex-direction: column; align-items: flex-start;">
                <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(255, 107, 53, 0.1); color: var(--color-primary); display: flex; align-items: center; justify-content: center; margin-bottom: 24px;">
                  <span class="material-symbols-outlined" style="font-size: 24px;">military_tech</span>
                </div>
                <h3 style="font-size: 20px; font-weight: 500; color: var(--color-text); margin-bottom: 12px;">Professional Standards</h3>
                <p style="font-size: 14px; color: var(--color-text-secondary); line-height: 1.6;">We hold ourselves to the highest standards of conduct, communication, and convoy management in every operation.</p>
              </div>
              <div class="bento-card ambient-shadow reveal reveal-delay-2" style="padding: 32px; display: flex; flex-direction: column; align-items: flex-start;">
                <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(255, 107, 53, 0.1); color: var(--color-primary); display: flex; align-items: center; justify-content: center; margin-bottom: 24px;">
                  <span class="material-symbols-outlined" style="font-size: 24px;">checklist</span>
                </div>
                <h3 style="font-size: 20px; font-weight: 500; color: var(--color-text); margin-bottom: 12px;">Organised Operations</h3>
                <p style="font-size: 14px; color: var(--color-text-secondary); line-height: 1.6;">Every event is meticulously planned with scenario packs, staff assignments, and structured procedures ensuring nothing is left to chance.</p>
              </div>
              <div class="bento-card ambient-shadow reveal reveal-delay-3" style="padding: 32px; display: flex; flex-direction: column; align-items: flex-start;">
                <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(255, 107, 53, 0.1); color: var(--color-primary); display: flex; align-items: center; justify-content: center; margin-bottom: 24px;">
                  <span class="material-symbols-outlined" style="font-size: 24px;">handshake</span>
                </div>
                <h3 style="font-size: 20px; font-weight: 500; color: var(--color-text); margin-bottom: 12px;">Community First</h3>
                <p style="font-size: 14px; color: var(--color-text-secondary); line-height: 1.6;">We value our relationships with partner communities and event organisers, working collaboratively to deliver the best possible experience.</p>
              </div>
              <div class="bento-card ambient-shadow reveal reveal-delay-4" style="padding: 32px; display: flex; flex-direction: column; align-items: flex-start;">
                <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(255, 107, 53, 0.1); color: var(--color-primary); display: flex; align-items: center; justify-content: center; margin-bottom: 24px;">
                  <span class="material-symbols-outlined" style="font-size: 24px;">rocket_launch</span>
                </div>
                <h3 style="font-size: 20px; font-weight: 500; color: var(--color-text); margin-bottom: 12px;">Continuous Growth</h3>
                <p style="font-size: 14px; color: var(--color-text-secondary); line-height: 1.6;">We invest in our team through training, feedback, and technology — including a custom-built management dashboard for seamless operations.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- CTA -->
        <section class="section cta-section" id="about-cta" style="width: 100%;">
          <div class="container" style="max-width: 100%;">
            <div class="bento-card ambient-shadow reveal" style="background: rgba(15, 15, 15, 0.8); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; text-align: center; padding: 64px 24px; display: flex; flex-direction: column; align-items: center; position: relative; overflow: hidden;">
              <div class="header-glow-bg" style="position: absolute; inset: 0; pointer-events: none; z-index: 0;"></div>
              <h2 class="cta-title glow-text" style="font-weight: 600; font-size: clamp(32px, 4vw, 48px); line-height: 1.2; letter-spacing: -0.02em; z-index: 10;">Want to Be Part of <span style="color: var(--color-primary);">Our Story</span>?</h2>
              <p class="cta-subtitle" style="font-size: 16px; color: var(--color-text-secondary); max-width: 600px; margin: 16px auto 32px; line-height: 1.6; z-index: 10;">Join our Discord community or apply to become a team member.</p>
              <div class="cta-actions" style="display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; z-index: 10;">
                <a href="https://discord.gg/realops" target="_blank" rel="noopener" class="glass-button-primary" style="padding: 16px 32px; display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 500; text-decoration: none;">
                  <svg viewBox="0 0 24 24" style="width: 20px; height: 20px; fill: currentColor;"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" /></svg>
                  Join Discord
                </a>
                <a href="/recruitment" class="glass-button-secondary" onclick="window.scrollTo(0,0)" style="padding: 16px 32px; display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 500; text-decoration: none;">
                  View Openings
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

