// ============================================================
// RealOps — Contact Page (Redesign)
// ============================================================

const ContactPage = {
  async render() {
    return `
      <!-- Main Container -->
      <main class="flex-grow relative z-10 pt-[100px] pb-xl px-4 md:px-lg mx-auto w-full flex flex-col" style="padding-top: 100px; padding-bottom: 80px; max-width: var(--max-width); margin: 0 auto;">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 48px;" class="reveal">
          <div style="display: inline-flex; align-items: center; gap: 8px; padding: 4px 14px; background: rgba(255, 107, 53, 0.08); border: 1px solid rgba(255, 107, 53, 0.2); border-radius: 999px; margin-bottom: 16px;">
            <span class="status-beacon" style="width: 6px; height: 6px;"></span>
            <span style="font-family: var(--font-mono); font-size: 11px; font-weight: 600; color: var(--color-primary-light); text-transform: uppercase; letter-spacing: 0.12em;">DISPATCH & INQUIRIES</span>
          </div>

          <h1 style="font-size: clamp(32px, 5vw, 54px); font-weight: 800; color: var(--color-text); margin: 0 0 14px; letter-spacing: -0.03em;">
            Contact RealOps Team
          </h1>
          
          <p style="font-size: 16px; color: var(--color-text-secondary); max-width: 580px; margin: 0 auto; line-height: 1.6;">
            Book convoy escort teams, request partnership discussions, or contact RealOps dispatch.
          </p>
        </div>

        <section style="margin-bottom: 48px;" class="reveal">
          <div style="display: grid; grid-template-columns: 1fr; gap: 32px;">
            
            <!-- Contact Form Card -->
            <div class="bento-card" style="padding: 36px; background: rgba(18, 16, 16, 0.8); border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 24px;">
              <h2 style="font-size: 24px; font-weight: 700; color: var(--color-text); margin: 0 0 24px;">Send Dispatch Message</h2>
              
              <form id="contact-form" onsubmit="ContactPage.handleSubmit(event)">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 20px;">
                  <div style="display: flex; flex-direction: column; gap: 6px;">
                    <label style="font-size: 12px; font-weight: 600; color: var(--color-text-muted); font-family: var(--font-mono); text-transform: uppercase;">Your Name</label>
                    <input type="text" id="contact-name" name="name" placeholder="Driver / Organizer Name" required style="width: 100%; background: rgba(10, 9, 9, 0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px 16px; color: var(--color-text); font-size: 14px; outline: none;">
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 6px;">
                    <label style="font-size: 12px; font-weight: 600; color: var(--color-text-muted); font-family: var(--font-mono); text-transform: uppercase;">Email Address (Optional)</label>
                    <input type="email" id="contact-email" name="email" placeholder="email@domain.com" style="width: 100%; background: rgba(10, 9, 9, 0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px 16px; color: var(--color-text); font-size: 14px; outline: none;">
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 20px;">
                  <div style="display: flex; flex-direction: column; gap: 6px;">
                    <label style="font-size: 12px; font-weight: 600; color: var(--color-text-muted); font-family: var(--font-mono); text-transform: uppercase;">Discord Tag / ID</label>
                    <input type="text" id="contact-discord" name="discord" placeholder="username#0000" required style="width: 100%; background: rgba(10, 9, 9, 0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px 16px; color: var(--color-text); font-size: 14px; outline: none;">
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 6px;">
                    <label style="font-size: 12px; font-weight: 600; color: var(--color-text-muted); font-family: var(--font-mono); text-transform: uppercase;">Inquiry Type</label>
                    <select id="contact-subject" name="subject" required style="width: 100%; background: rgba(10, 9, 9, 0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px 16px; color: var(--color-text); font-size: 14px; outline: none;">
                      <option value="" disabled selected>Select an inquiry</option>
                      <option value="event">Request Convoy Escorts / Road Operations</option>
                      <option value="partnership">Partnership Request</option>
                      <option value="recruitment">Recruitment Question</option>
                      <option value="general">General Support</option>
                    </select>
                  </div>
                </div>

                <div style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 24px;">
                  <label style="font-size: 12px; font-weight: 600; color: var(--color-text-muted); font-family: var(--font-mono); text-transform: uppercase;">Message Details</label>
                  <textarea id="contact-message" name="message" placeholder="Provide event date, server, convoy details or your inquiry..." required style="width: 100%; background: rgba(10, 9, 9, 0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 14px 16px; color: var(--color-text); font-size: 14px; outline: none; min-height: 130px; resize: vertical;"></textarea>
                </div>

                <button type="submit" class="glass-button-primary" id="contact-submit" style="width: 100%; display: flex; justify-content: center; align-items: center; gap: 8px; padding: 14px; font-size: 15px; font-weight: 600; border: none; cursor: pointer;">
                  <span class="material-symbols-outlined" style="font-size: 18px;">send</span>
                  Submit Dispatch Message
                </button>
              </form>

            </div>

          </div>
        </section>

        <!-- Direct Channels -->
        <section class="reveal">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="font-family: var(--font-mono); font-size: 12px; font-weight: 600; color: var(--color-primary); letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 8px;">DIRECT CHANNELS</div>
            <h2 style="font-size: 26px; font-weight: 700; color: var(--color-text); margin: 0;">Connect with RealOps Crew</h2>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px;">
            
            <div class="bento-card" style="padding: 28px; background: rgba(18, 16, 16, 0.7); border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 20px; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(255, 107, 53, 0.1); color: var(--color-primary); display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                  <svg viewBox="0 0 24 24" style="width: 22px; height: 22px; fill: currentColor;"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" /></svg>
                </div>
                <h3 style="font-size: 18px; font-weight: 600; color: var(--color-text); margin: 0 0 8px;">Discord Dispatch</h3>
                <p style="font-size: 13px; color: var(--color-text-secondary); line-height: 1.6; margin: 0 0 16px;">
                  Open a ticket in Discord for instant response regarding convoy control or pilot applications.
                </p>
              </div>
              <a href="https://discord.gg/realops" target="_blank" rel="noopener" class="glass-button-secondary" style="padding: 10px 18px; font-size: 13px; font-weight: 500; text-decoration: none; text-align: center;">
                Open Discord
              </a>
            </div>

            <div class="bento-card" style="padding: 28px; background: rgba(18, 16, 16, 0.7); border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 20px; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(255, 107, 53, 0.1); color: var(--color-primary); display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                  <span class="material-symbols-outlined" style="font-size: 22px;">terminal</span>
                </div>
                <h3 style="font-size: 18px; font-weight: 600; color: var(--color-text); margin: 0 0 8px;">Operations Dashboard</h3>
                <p style="font-size: 13px; color: var(--color-text-secondary); line-height: 1.6; margin: 0 0 16px;">
                  RealOps staff access for managing live convoy dispatches, events, and staff roster.
                </p>
              </div>
              <a href="${API.getDashboardUrl()}" target="_blank" rel="noopener" class="glass-button-secondary" style="padding: 10px 18px; font-size: 13px; font-weight: 500; text-decoration: none; text-align: center;">
                Open Dashboard
              </a>
            </div>

          </div>
        </section>

      </main>
    `;
  },

  async handleSubmit(e) {
    e.preventDefault();
    const form = document.getElementById('contact-form');
    const submitBtn = document.getElementById('contact-submit');
    const formData = new FormData(form);

    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      discord: formData.get('discord'),
      subject: formData.get('subject'),
      message: formData.get('message')
    };

    submitBtn.disabled = true;
    submitBtn.innerHTML = `Sending...`;

    try {
      await API.submitContact(data);
      App.showToast("Message sent to RealOps Dispatch!", 'success');
      form.reset();
    } catch (error) {
      App.showToast('Failed to send message. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <span class="material-symbols-outlined" style="font-size: 18px;">send</span>
        Submit Dispatch Message
      `;
    }
  }
};
