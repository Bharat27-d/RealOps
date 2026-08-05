// ============================================================
// RealOps — Events Operations Board
// ============================================================

const EventsPage = {
  async render() {
    const events = await API.getEvents();

    return `
      <div class="container" style="padding-top: 130px; padding-bottom: 80px;">
        
        <div style="text-align: center; margin-bottom: 48px;" class="reveal">
          <h1 style="font-size: clamp(36px, 5vw, 56px); font-weight: 800; color: #ffffff;">
            Convoy <span class="gradient-text-orange">Operations Board</span>
          </h1>
          <p style="font-size: 16px; color: var(--color-text-secondary); max-width: 600px; margin: 12px auto 0; line-height: 1.6;">
            Real-time event schedule for upcoming community convoys, VTC escorts, and public operations.
          </p>
        </div>

        <!-- Filter Tabs -->
        <div class="filter-tabs reveal" id="event-filters">
          <button class="filter-tab active" data-filter="all">All Convoys</button>
          <button class="filter-tab" data-filter="scheduled">Upcoming</button>
          <button class="filter-tab" data-filter="completed">Completed</button>
        </div>

        <!-- Event Cards Grid -->
        <section style="width: 100%;">
          ${events && events.length > 0 ? `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 28px;" id="events-grid">
              ${events.map((event, i) => `
                <div class="event-card reveal" data-status="${(event.status || 'scheduled').toLowerCase()}">
                  
                  <div class="event-card-header">
                    <span class="event-tag">${App.escapeHtml(event.server || 'TruckersMP Sim')}</span>
                    <span class="event-status-badge ${EventsPage.getBadgeStyle(event.status)}">
                      ${App.escapeHtml((event.status || 'Scheduled').toUpperCase())}
                    </span>
                  </div>

                  ${event.image ? `
                    <div style="height: 160px; width: 100%; border-radius: var(--radius-md); overflow: hidden; margin-bottom: 16px;">
                      <img src="${App.escapeHtml(event.image)}" alt="${App.escapeHtml(event.title)}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                  ` : ''}

                  <h3 class="event-title">${App.escapeHtml(event.title)}</h3>

                  <div class="event-meta-grid">
                    <div class="event-meta-item">
                      <span class="material-symbols-outlined" style="color: var(--color-primary); font-size: 16px;">calendar_month</span>
                      <span>${App.formatDate(event.date)}</span>
                    </div>
                    <div class="event-meta-item">
                      <span class="material-symbols-outlined" style="color: var(--color-cyan); font-size: 16px;">schedule</span>
                      <span>${App.escapeHtml(event.time || '18:00')} UTC</span>
                    </div>
                    ${event.departure ? `
                      <div class="event-meta-item" style="grid-column: span 2;">
                        <span class="material-symbols-outlined" style="color: var(--color-amber); font-size: 16px;">route</span>
                        <span>${App.escapeHtml(event.departure)}${event.arrival ? ` ➔ ${App.escapeHtml(event.arrival)}` : ''}</span>
                      </div>
                    ` : ''}
                  </div>

                  <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 20px; pt: 16px; border-top: 1px solid var(--color-border);">
                    <div style="font-family: var(--font-mono); font-size: 12px; color: var(--color-text-muted);">
                      Attendance: <span style="color: #ffffff; font-weight: bold;">${event.attendance || 'Open'}</span>
                    </div>
                    ${event.eventLink ? `
                      <a href="${App.escapeHtml(event.eventLink)}" target="_blank" rel="noopener" class="btn btn-primary" style="padding: 8px 16px; font-size: 13px;">
                        <span>TMP Event Page</span>
                        <span class="material-symbols-outlined" style="font-size: 14px;">north_east</span>
                      </a>
                    ` : `
                      <a href="https://discord.gg/realops" target="_blank" rel="noopener" class="btn btn-secondary" style="padding: 8px 16px; font-size: 13px;">
                        <span>Discord Booking</span>
                      </a>
                    `}
                  </div>
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="bento-card reveal" style="text-align: center; padding: 64px 24px;">
              <span class="material-symbols-outlined" style="font-size: 56px; color: var(--color-primary); margin-bottom: 16px;">event_busy</span>
              <h3 style="font-size: 24px; color: #ffffff;">No Active Convoys Scheduled</h3>
              <p style="color: var(--color-text-secondary); max-width: 480px; margin: 12px auto 24px;">
                Our dispatch queue is currently open. Request Real Operation or pilot escorts for your VTC event on our Discord server.
              </p>
              <a href="https://discord.gg/realops" target="_blank" rel="noopener" class="btn btn-primary" style="padding: 14px 28px;">
                Open Discord Request Ticket
              </a>
            </div>
          `}
        </section>

      </div>
    `;
  },

  getBadgeStyle(status) {
    switch ((status || '').toLowerCase()) {
      case 'completed': return 'completed';
      case 'scheduled': default: return 'upcoming';
    }
  },

  initFilters() {
    const filterBtns = document.querySelectorAll('#event-filters .filter-tab');
    const cards = document.querySelectorAll('#events-grid .event-card');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;
        cards.forEach(card => {
          if (filter === 'all' || card.dataset.status === filter) {
            card.style.display = 'block';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }
};
