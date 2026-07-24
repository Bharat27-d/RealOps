// ============================================================
// RealOps — Contact Page
// ============================================================

const ContactPage = {
  async render() {
    return `
      <main class="flex-grow relative z-10 pt-[120px] pb-xl px-4 md:px-lg mx-auto w-full flex flex-col gap-xl" style="padding-top: 120px; padding-bottom: 64px; max-width: var(--max-width); margin: 0 auto;">
        
        <div class="page-header" style="text-align: center; margin-bottom: 64px;">
          <div style="font-family: var(--font-mono); font-size: 13px; color: var(--color-primary); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px;">📬 Contact</div>
          <h1 class="glow-text" style="font-size: clamp(40px, 6vw, 64px); font-weight: 600; line-height: 1.1; letter-spacing: -0.04em; color: var(--color-text); text-transform: uppercase; max-width: 900px; margin: 0 auto;">
            Get in <span style="color: var(--color-primary);">Touch</span>
          </h1>
          <p style="font-size: 16px; color: var(--color-text-secondary); max-width: 600px; margin: 16px auto 0; line-height: 1.6;">
            Have a question, partnership enquiry, or need support? We'd love to hear from you.
          </p>
        </div>

        <section class="section" style="width: 100%; margin-bottom: 40px;">
          <div class="container" style="max-width: 100%;">
            <div class="contact-grid" style="display: grid; grid-template-columns: 1fr; gap: 40px;">
              
              <!-- Contact Form -->
              <div class="bento-card ambient-shadow reveal" style="padding: 40px;">
                <h2 style="font-size: 24px; font-weight: 600; color: var(--color-text); margin-bottom: 32px; letter-spacing: -0.02em;">Send us a Message</h2>
                <form id="contact-form" onsubmit="ContactPage.handleSubmit(event)">
                  <div class="grid grid-2" style="gap: 24px; margin-bottom: 24px;">
                    <div class="form-group" style="display: flex; flex-direction: column; gap: 8px;">
                      <label class="form-label" for="contact-name" style="font-size: 14px; font-weight: 500; color: var(--color-text-secondary); font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.05em;">Your Name</label>
                      <input class="form-input" type="text" id="contact-name" name="name" placeholder="Enter your name" required style="width: 100%; background: rgba(15,15,15,0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 16px; color: var(--color-text); font-size: 16px; outline: none; transition: border-color 0.2s;">
                    </div>
                    <div class="form-group" style="display: flex; flex-direction: column; gap: 8px;">
                      <label class="form-label" for="contact-email" style="font-size: 14px; font-weight: 500; color: var(--color-text-secondary); font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.05em;">Email Address (Optional)</label>
                      <input class="form-input" type="email" id="contact-email" name="email" placeholder="your@email.com" style="width: 100%; background: rgba(15,15,15,0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 16px; color: var(--color-text); font-size: 16px; outline: none; transition: border-color 0.2s;">
                    </div>
                  </div>
                  <div class="form-group" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px;">
                    <label class="form-label" for="contact-discord" style="font-size: 14px; font-weight: 500; color: var(--color-text-secondary); font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.05em;">Discord Username / ID</label>
                    <input class="form-input" type="text" id="contact-discord" name="discord" placeholder="e.g. username#1234 or 123456789" required style="width: 100%; background: rgba(15,15,15,0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 16px; color: var(--color-text); font-size: 16px; outline: none; transition: border-color 0.2s;">
                  </div>
                  <div class="form-group" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px;">
                    <label class="form-label" for="contact-subject" style="font-size: 14px; font-weight: 500; color: var(--color-text-secondary); font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.05em;">Subject</label>
                    <select class="form-input form-select" id="contact-subject" name="subject" required style="width: 100%; background: rgba(15,15,15,0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 16px; color: var(--color-text); font-size: 16px; outline: none; appearance: none; transition: border-color 0.2s;">
                      <option value="" disabled selected>Select a subject</option>
                      <option value="general">General Enquiry</option>
                      <option value="partnership">Partnership Request</option>
                      <option value="event">Event Enquiry</option>
                      <option value="recruitment">Recruitment Question</option>
                      <option value="support">Support</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div class="form-group" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 32px;">
                    <label class="form-label" for="contact-message" style="font-size: 14px; font-weight: 500; color: var(--color-text-secondary); font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.05em;">Message</label>
                    <textarea class="form-input form-textarea" id="contact-message" name="message" placeholder="Tell us what's on your mind..." required style="width: 100%; background: rgba(15,15,15,0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 16px; color: var(--color-text); font-size: 16px; outline: none; min-height: 150px; resize: vertical; transition: border-color 0.2s;"></textarea>
                  </div>
                  <button type="submit" class="glass-button-primary" id="contact-submit" style="width:100%; display: flex; justify-content: center; align-items: center; gap: 8px; padding: 16px; font-size: 18px; font-weight: 500; border: none; cursor: pointer;">
                    <span class="material-symbols-outlined" style="font-size: 20px;">send</span>
                    Send Message
                  </button>
                </form>
              </div>

            </div>
          </div>
        </section>

        <!-- Alternative Contact Channels -->
        <section class="section" style="width: 100%;">
          <div class="container" style="max-width: 100%;">
            <div style="text-align: center; margin-bottom: 40px;">
              <div style="font-family: var(--font-mono); font-size: 13px; color: var(--color-primary); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px;">📡 Alternative Channels</div>
              <h2 style="font-size: 32px; font-weight: 600; color: var(--color-text); letter-spacing: -0.02em;">Other Ways to Connect</h2>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px;">
              <div class="bento-card ambient-shadow reveal reveal-delay-1" style="padding: 32px; display: flex; flex-direction: column; align-items: flex-start;">
                <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(255, 107, 53, 0.1); color: var(--color-primary); display: flex; align-items: center; justify-content: center; margin-bottom: 24px;">
                  <svg viewBox="0 0 24 24" style="width: 24px; height: 24px; fill: currentColor;"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" /></svg>
                </div>
                <h3 style="font-size: 20px; font-weight: 500; color: var(--color-text); margin-bottom: 12px;">Discord</h3>
                <p style="font-size: 14px; color: var(--color-text-secondary); line-height: 1.6; flex-grow: 1;">The fastest way to reach us. Join our Discord server and open a ticket for direct support.</p>
                <a href="https://discord.gg/realops" target="_blank" rel="noopener" class="glass-button-secondary" style="margin-top: 24px; padding: 8px 16px; font-size: 14px; text-decoration: none;">Join Discord</a>
              </div>

              <div class="bento-card ambient-shadow reveal reveal-delay-2" style="padding: 32px; display: flex; flex-direction: column; align-items: flex-start;">
                <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(255, 107, 53, 0.1); color: var(--color-primary); display: flex; align-items: center; justify-content: center; margin-bottom: 24px;">
                  <span class="material-symbols-outlined" style="font-size: 24px;">dashboard</span>
                </div>
                <h3 style="font-size: 20px; font-weight: 500; color: var(--color-text); margin-bottom: 12px;">Dashboard</h3>
                <p style="font-size: 14px; color: var(--color-text-secondary); line-height: 1.6; flex-grow: 1;">Staff members can access the management dashboard for operations, events, and team management.</p>
                <a href="${API.getDashboardUrl()}" target="_blank" rel="noopener" class="glass-button-secondary" style="margin-top: 24px; padding: 8px 16px; font-size: 14px; text-decoration: none;">Open Dashboard</a>
              </div>

              <div class="bento-card ambient-shadow reveal reveal-delay-3" style="padding: 32px; display: flex; flex-direction: column; align-items: flex-start;">
                <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(255, 107, 53, 0.1); color: var(--color-primary); display: flex; align-items: center; justify-content: center; margin-bottom: 24px;">
                  <span class="material-symbols-outlined" style="font-size: 24px;">handshake</span>
                </div>
                <h3 style="font-size: 20px; font-weight: 500; color: var(--color-text); margin-bottom: 12px;">Partnerships</h3>
                <p style="font-size: 14px; color: var(--color-text-secondary); line-height: 1.6; flex-grow: 1;">Interested in partnering with RealOps? We're always open to collaborating with other communities.</p>
              </div>

              <div class="bento-card ambient-shadow reveal reveal-delay-4" style="padding: 32px; display: flex; flex-direction: column; align-items: flex-start;">
                <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(255, 107, 53, 0.1); color: var(--color-primary); display: flex; align-items: center; justify-content: center; margin-bottom: 24px;">
                  <span class="material-symbols-outlined" style="font-size: 24px;">assignment_ind</span>
                </div>
                <h3 style="font-size: 20px; font-weight: 500; color: var(--color-text); margin-bottom: 12px;">Join the Team</h3>
                <p style="font-size: 14px; color: var(--color-text-secondary); line-height: 1.6; flex-grow: 1;">Want to become a RealOps team member? Check our recruitment page for open positions.</p>
                <a href="#/recruitment" class="glass-button-secondary" style="margin-top: 24px; padding: 8px 16px; font-size: 14px; text-decoration: none;" onclick="window.scrollTo(0,0)">View Openings</a>
              </div>
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

    // Disable button during submission
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <div class="spinner" style="width:20px;height:20px;border-width:2px;"></div>
      Sending...
    `;

    try {
      await API.submitContact(data);
      // Show success toast
      App.showToast("Message sent successfully! We'll get back to you soon.", 'success');
      form.reset();
    } catch (error) {
      App.showToast('Failed to send message. Please try again later.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <span class="material-symbols-outlined" style="font-size: 20px;">send</span>
        Send Message
      `;
    }
  }
};
