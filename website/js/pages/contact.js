// ============================================================
// RealOps — Direct Dispatch & Contact Portal
// ============================================================

const ContactPage = {
  async render() {
    return `
      <div class="container" style="padding-top: 130px; padding-bottom: 80px;">
        
        <div style="text-align: center; margin-bottom: 48px;" class="reveal">
          <h1 style="font-size: clamp(36px, 5vw, 56px); font-weight: 800; color: #ffffff;">
            Get In <span class="gradient-text-orange">Touch</span>
          </h1>
          <p style="font-size: 16px; color: var(--color-text-secondary); max-width: 600px; margin: 12px auto 0; line-height: 1.6;">
            Have questions about convoy booking, VTC partnerships, or escort schedules? Send us a direct dispatch inquiry.
          </p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(12, 1fr); gap: 32px;" class="reveal">
          
          <!-- Contact Form (Span 7) -->
          <div class="bento-card" style="grid-column: span 12; padding: 40px;" id="contact-form-col">
            <style>
              @media(min-width: 900px) {
                #contact-form-col { grid-column: span 7 !important; }
                #contact-info-col { grid-column: span 5 !important; }
              }
            </style>
            <h2 style="font-size: 24px; font-weight: 700; color: #ffffff; margin-bottom: 24px;">Send Dispatch Message</h2>
            
            <form id="contact-form" onsubmit="ContactPage.handleSubmit(event)">
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 16px;">
                <div>
                  <label style="font-family: var(--font-mono); font-size: 11px; color: var(--color-text-secondary); display: block; margin-bottom: 6px;">YOUR NAME</label>
                  <input type="text" name="name" required placeholder="Driver / VTC Rep Name" style="width: 100%; padding: 12px 16px; border-radius: var(--radius-md); background: rgba(0,0,0,0.4); border: 1px solid var(--color-border); color: #fff; font-size: 14px; outline: none;">
                </div>
                <div>
                  <label style="font-family: var(--font-mono); font-size: 11px; color: var(--color-text-secondary); display: block; margin-bottom: 6px;">DISCORD TAG</label>
                  <input type="text" name="discord" required placeholder="username or ID" style="width: 100%; padding: 12px 16px; border-radius: var(--radius-md); background: rgba(0,0,0,0.4); border: 1px solid var(--color-border); color: #fff; font-size: 14px; outline: none;">
                </div>
              </div>

              <div style="margin-bottom: 16px;">
                <label style="font-family: var(--font-mono); font-size: 11px; color: var(--color-text-secondary); display: block; margin-bottom: 6px;">SUBJECT</label>
                <select name="subject" required style="width: 100%; padding: 12px 16px; border-radius: var(--radius-md); background: rgba(10,15,29,0.9); border: 1px solid var(--color-border); color: #fff; font-size: 14px; outline: none;">
                  <option value="general">General Enquiry</option>
                  <option value="partnership">VTC Partnership Request</option>
                  <option value="event">Real Operation Request</option>
                  <option value="recruitment">Pilot Recruitment Inquiry</option>
                </select>
              </div>

              <div style="margin-bottom: 24px;">
                <label style="font-family: var(--font-mono); font-size: 11px; color: var(--color-text-secondary); display: block; margin-bottom: 6px;">MESSAGE DETAILS</label>
                <textarea name="message" required rows="5" placeholder="Describe your request, event date, server, or questions..." style="width: 100%; padding: 12px 16px; border-radius: var(--radius-md); background: rgba(0,0,0,0.4); border: 1px solid var(--color-border); color: #fff; font-size: 14px; outline: none; resize: vertical;"></textarea>
              </div>

              <button type="submit" class="btn btn-primary" id="contact-submit" style="width: 100%; padding: 14px;">
                <span>Submit Inquiry</span>
                <span class="material-symbols-outlined" style="font-size: 16px;">send</span>
              </button>
            </form>
          </div>

          <!-- Quick Support Channels (Span 5) -->
          <div style="grid-column: span 12; display: flex; flex-direction: column; gap: 24px;" id="contact-info-col">
            <div class="bento-card" style="padding: 32px;">
              <h3 style="font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 12px;">Instant Discord Ticket</h3>
              <p style="font-size: 14px; color: var(--color-text-secondary); line-height: 1.6; margin-bottom: 20px;">
                For urgent event support or instant response, our automated Discord ticket system is active 24/7.
              </p>
              <a href="https://discord.gg/realops" target="_blank" rel="noopener" class="btn btn-cyan" style="width: 100%;">
                <span>Join Discord & Open Ticket</span>
                <span class="material-symbols-outlined" style="font-size: 16px;">north_east</span>
              </a>
            </div>

            <div class="bento-card" style="padding: 32px;">
              <h3 style="font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 12px;">Management Dashboard</h3>
              <p style="font-size: 14px; color: var(--color-text-secondary); line-height: 1.6; margin-bottom: 20px;">
                Registered staff members and event planners can log directly into our admin command dashboard.
              </p>
              <a href="${API.getDashboardUrl()}" target="_blank" rel="noopener" class="btn btn-secondary" style="width: 100%;">
                <span>Command Center Dashboard</span>
              </a>
            </div>
          </div>

        </div>

      </div>
    `;
  },

  async handleSubmit(e) {
    e.preventDefault();
    const form = document.getElementById('contact-form');
    const submitBtn = document.getElementById('contact-submit');
    const formData = new FormData(form);

    const data = {
      name: formData.get('name'),
      discord: formData.get('discord'),
      subject: formData.get('subject'),
      message: formData.get('message')
    };

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>Sending...</span>`;

    try {
      await API.submitContact(data);
      App.showToast("Message sent successfully! We'll get back to you soon.", 'success');
      form.reset();
    } catch {
      App.showToast('Failed to send message. Please try again later or use Discord.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>Submit Inquiry</span> <span class="material-symbols-outlined" style="font-size:16px;">send</span>`;
    }
  }
};
