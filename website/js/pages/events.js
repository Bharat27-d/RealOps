// ============================================================
// RealOps — Events Page
// ============================================================

const EventsPage = {
  async render() {
    const events = await API.getEvents();

    return `
      <!-- Main Canvas for Obsidian Prime -->
      <main class="flex-grow relative z-10 pt-[120px] pb-xl px-4 md:px-lg mx-auto w-full flex flex-col gap-xl" style="padding-top: 120px; padding-bottom: 64px; max-width: var(--max-width); margin: 0 auto;">
        
        <div class="page-header" style="text-align: center; margin-bottom: 64px;">
          <div style="font-family: var(--font-mono); font-size: 13px; color: var(--color-primary); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px;">📅 Events</div>
          <h1 class="glow-text" style="font-size: clamp(40px, 6vw, 64px); font-weight: 600; line-height: 1.1; letter-spacing: -0.04em; color: var(--color-text); text-transform: uppercase; max-width: 900px; margin: 0 auto;">
            Upcoming <span style="color: var(--color-primary);">Events</span>
          </h1>
          <p style="font-size: 16px; color: var(--color-text-secondary); max-width: 600px; margin: 16px auto 0; line-height: 1.6;">
            All upcoming convoys and events managed through our operations dashboard. Data is synced in real time.
          </p>
        </div>

        <section class="section" style="width: 100%;">
          <div class="container" style="max-width: 100%;">
            ${events && events.length > 0 ? `
              <div class="grid grid-3" id="events-grid">
                ${events.map((event, i) => `
                  <div class="bento-card ambient-shadow event-card reveal reveal-delay-${(i % 6) + 1}" data-status="${(event.status || 'scheduled').toLowerCase()}" style="padding: 24px; display: flex; flex-direction: column;">
                    ${event.image
                      ? `<img class="event-card-banner" src="${App.escapeHtml(event.image)}" alt="${App.escapeHtml(event.title)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" style="border-radius: 8px; margin-bottom: 16px;">
                         <div class="event-card-banner-placeholder" style="display:none; border-radius: 8px; margin-bottom: 16px;">🚛</div>`
                      : `<div class="event-card-banner-placeholder" style="border-radius: 8px; margin-bottom: 16px;">🚛</div>`
                    }
                    <div class="event-card-body" style="padding: 0; flex: 1; display: flex; flex-direction: column;">
                      <h3 class="event-card-title" style="font-size: 20px; font-weight: 500; margin-bottom: 16px;">${App.escapeHtml(event.title)}</h3>

                      <div class="event-card-meta" style="margin-bottom: 12px; display: flex; flex-direction: column; gap: 8px;">
                        ${event.date ? `
                          <div class="event-card-meta-item" style="color: var(--color-text-secondary); font-family: var(--font-mono); font-size: 13px;">
                            <span class="material-symbols-outlined" style="font-size: 16px;">calendar_today</span>
                            ${App.formatDate(event.date)}
                          </div>
                        ` : ''}
                        ${event.time ? `
                          <div class="event-card-meta-item" style="color: var(--color-text-secondary); font-family: var(--font-mono); font-size: 13px;">
                            <span class="material-symbols-outlined" style="font-size: 16px;">schedule</span>
                            ${App.escapeHtml(event.time)} UTC
                          </div>
                        ` : ''}
                      </div>

                      <div class="event-card-meta" style="margin-bottom: 24px; display: flex; flex-direction: column; gap: 8px;">
                        ${event.server ? `
                          <div class="event-card-meta-item" style="color: var(--color-text-secondary); font-family: var(--font-mono); font-size: 13px;">
                            <span class="material-symbols-outlined" style="font-size: 16px;">dns</span>
                            ${App.escapeHtml(event.server)}
                          </div>
                        ` : ''}
                        ${event.departure ? `
                          <div class="event-card-meta-item" style="color: var(--color-text-secondary); font-family: var(--font-mono); font-size: 13px;">
                            <span class="material-symbols-outlined" style="font-size: 16px;">route</span>
                            ${App.escapeHtml(event.departure)}${event.arrival ? ` → ${App.escapeHtml(event.arrival)}` : ''}
                          </div>
                        ` : ''}
                      </div>

                      <div class="event-card-footer" style="margin-top: auto; display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.05);">
                        <span class="badge ${EventsPage.getStatusBadgeClass(event.status)}" style="font-family: var(--font-mono);">${App.escapeHtml(event.status || 'Scheduled')}</span>
                        <div style="display:flex;align-items:center;gap:var(--space-3);">
                          ${event.attendance ? `<span class="event-card-meta-item" style="font-family: var(--font-mono); color: var(--color-text-secondary);">👤 ${event.attendance}</span>` : ''}
                          ${event.eventLink ? `<a href="${App.escapeHtml(event.eventLink)}" target="_blank" rel="noopener" class="btn btn-sm btn-ghost" style="color: var(--color-primary);">View ↗</a>` : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : `
              <div class="empty-state reveal bento-card ambient-shadow" style="padding: 64px; text-align: center;">
                <div class="empty-state-icon" style="font-size: 48px; margin-bottom: 16px;">📅</div>
                <h3 class="empty-state-title" style="font-size: 24px; color: var(--color-text); margin-bottom: 8px;">No Upcoming Events</h3>
                <p class="empty-state-desc" style="color: var(--color-text-secondary);">There are no events currently scheduled. Check back soon or join our Discord for the latest updates!</p>
                <div style="margin-top: 24px;">
                  <a href="https://discord.gg/realops" target="_blank" rel="noopener" class="glass-button-primary" style="display: inline-block; padding: 12px 24px; font-size: 16px; text-decoration: none;">Join Discord</a>
                </div>
              </div>
            `}
          </div>
        </section>
      </main>
    `;
  },

  getStatusBadgeClass(status) {
    switch ((status || '').toLowerCase()) {
      case 'scheduled': return 'badge-info';
      case 'sent': case 'announced': return 'badge-success';
      case 'completed': return 'badge-primary';
      case 'cancelled': return 'badge-warning';
      default: return 'badge-info';
    }
  },

  initFilters() {
    const filterBtns = document.querySelectorAll('#event-filters .filter-btn');
    const cards = document.querySelectorAll('#events-grid .event-card');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;
        cards.forEach(card => {
          if (filter === 'all' || card.dataset.status === filter) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }
};
