// ============================================================
// RealOps — Events Page (Redesign)
// ============================================================

const EventsPage = {
  async render() {
    const events = await API.getEvents() || [];

    const upcoming = events.filter(e => (e.status || '').toLowerCase() !== 'completed' && (e.status || '').toLowerCase() !== 'cancelled');
    const featuredEvent = upcoming.length > 0 ? upcoming[0] : null;

    return `
      <!-- Main Container -->
      <main class="flex-grow relative z-10 pt-[100px] pb-xl px-4 md:px-lg mx-auto w-full flex flex-col" style="padding-top: 100px; padding-bottom: 80px; max-width: var(--max-width); margin: 0 auto;">
        
        <!-- ═══════════════════════════════════════════ -->
        <!-- Page Header -->
        <!-- ═══════════════════════════════════════════ -->
        <div style="text-align: center; margin-bottom: 48px;" class="reveal">
          <div style="display: inline-flex; align-items: center; gap: 8px; padding: 4px 14px; background: rgba(255, 107, 53, 0.08); border: 1px solid rgba(255, 107, 53, 0.2); border-radius: 999px; margin-bottom: 16px;">
            <span class="status-beacon" style="width: 6px; height: 6px;"></span>
            <span style="font-family: var(--font-mono); font-size: 11px; font-weight: 600; color: var(--color-primary-light); text-transform: uppercase; letter-spacing: 0.12em;">OPERATIONS CALENDAR</span>
          </div>

          <h1 style="font-size: clamp(32px, 5vw, 54px); font-weight: 800; color: var(--color-text); margin: 0 0 14px; letter-spacing: -0.03em;">
            RealOps Event Schedule
          </h1>
          
          <p style="font-size: 16px; color: var(--color-text-secondary); max-width: 580px; margin: 0 auto; line-height: 1.6;">
            Official TruckersMP convoys, real-road operation events, simulated accidents, and escorted community drives.
          </p>
        </div>

        <!-- ═══════════════════════════════════════════ -->
        <!-- Featured Event Spotlight (If Available) -->
        <!-- ═══════════════════════════════════════════ -->
        ${featuredEvent ? `
          <section style="margin-bottom: 56px;" class="reveal">
            <div style="background: rgba(18, 16, 16, 0.85); border: 1px solid rgba(255, 107, 53, 0.25); border-radius: 24px; overflow: hidden; display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); box-shadow: 0 20px 50px rgba(0,0,0,0.5), 0 0 30px rgba(255,107,53,0.06);">
              
              <div style="position: relative; min-height: 260px;">
                ${featuredEvent.image
                  ? `<img src="${App.escapeHtml(featuredEvent.image)}" alt="${App.escapeHtml(featuredEvent.title)}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover;">`
                  : `<div style="width: 100%; height: 100%; min-height: 260px; background: linear-gradient(135deg, #241d1a, #171312); display: flex; align-items: center; justify-content: center; font-size: 56px;">🚛</div>`
                }
                <div style="position: absolute; top: 16px; left: 16px;">
                  <span style="background: rgba(255, 107, 53, 0.9); color: #fff; font-family: var(--font-mono); font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.08em;">
                    FEATURED EVENT
                  </span>
                </div>
              </div>

              <div style="padding: 32px; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                  <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 12px;">
                    <span style="color: #22c55e; font-family: var(--font-mono); font-size: 12px; font-weight: 600; background: rgba(34,197,94,0.1); padding: 2px 10px; border-radius: 999px; border: 1px solid rgba(34,197,94,0.2);">
                      ● ${App.escapeHtml(featuredEvent.status || 'Scheduled')}
                    </span>
                    ${featuredEvent.server ? `
                      <span style="color: #3b82f6; font-family: var(--font-mono); font-size: 12px; font-weight: 600; background: rgba(59,130,246,0.1); padding: 2px 10px; border-radius: 999px;">
                        ${App.escapeHtml(featuredEvent.server)}
                      </span>
                    ` : ''}
                  </div>

                  <h2 style="font-size: 24px; font-weight: 700; color: var(--color-text); margin: 0 0 16px; line-height: 1.3;">
                    ${App.escapeHtml(featuredEvent.title)}
                  </h2>

                  <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px;">
                    ${featuredEvent.date ? `
                      <div style="display: flex; align-items: center; gap: 10px; color: var(--color-text-secondary); font-size: 14px; font-family: var(--font-mono);">
                        <span class="material-symbols-outlined" style="font-size: 18px; color: var(--color-primary);">calendar_month</span>
                        ${App.formatDate(featuredEvent.date)} ${featuredEvent.time ? `• ${App.escapeHtml(featuredEvent.time)} UTC` : ''}
                      </div>
                    ` : ''}
                    ${featuredEvent.departure ? `
                      <div style="display: flex; align-items: center; gap: 10px; color: var(--color-text-secondary); font-size: 14px; font-family: var(--font-mono);">
                        <span class="material-symbols-outlined" style="font-size: 18px; color: var(--color-primary-light);">alt_route</span>
                        ${App.escapeHtml(featuredEvent.departure)} ${featuredEvent.arrival ? `➔ ${App.escapeHtml(featuredEvent.arrival)}` : ''}
                      </div>
                    ` : ''}
                  </div>
                </div>

                <div style="display: flex; gap: 14px; align-items: center; flex-wrap: wrap;">
                  ${featuredEvent.eventLink ? `
                    <a href="${App.escapeHtml(featuredEvent.eventLink)}" target="_blank" rel="noopener" class="glass-button-primary" style="padding: 12px 24px; font-size: 14px; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
                      View TruckersMP Event <span class="material-symbols-outlined" style="font-size: 16px;">open_in_new</span>
                    </a>
                  ` : ''}
                  <a href="https://discord.gg/realops" target="_blank" rel="noopener" class="glass-button-secondary" style="padding: 12px 20px; font-size: 14px; font-weight: 500; text-decoration: none;">
                    Join Ops Discord
                  </a>
                </div>

              </div>

            </div>
          </section>
        ` : ''}

        <!-- ═══════════════════════════════════════════ -->
        <!-- Filter & Search Controls Bar -->
        <!-- ═══════════════════════════════════════════ -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; flex-wrap: wrap; gap: 16px; padding: 16px; background: rgba(18, 16, 16, 0.6); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 16px;" class="reveal">
          
          <!-- Status Filters -->
          <div style="display: flex; gap: 8px; flex-wrap: wrap;" id="event-filters">
            <button class="filter-btn active" data-filter="all" style="padding: 8px 16px; font-size: 13px; font-weight: 600; font-family: var(--font-mono); border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); background: transparent; color: var(--color-text-secondary); cursor: pointer; transition: all 0.2s ease;">
              All Events
            </button>
            <button class="filter-btn" data-filter="scheduled" style="padding: 8px 16px; font-size: 13px; font-weight: 600; font-family: var(--font-mono); border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); background: transparent; color: var(--color-text-secondary); cursor: pointer; transition: all 0.2s ease;">
              Scheduled
            </button>
            <button class="filter-btn" data-filter="completed" style="padding: 8px 16px; font-size: 13px; font-weight: 600; font-family: var(--font-mono); border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); background: transparent; color: var(--color-text-secondary); cursor: pointer; transition: all 0.2s ease;">
              Completed
            </button>
          </div>

          <!-- Real-Time Search Box -->
          <div style="position: relative; min-width: 260px; flex: 1; max-width: 360px;">
            <span class="material-symbols-outlined" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--color-text-muted); font-size: 18px;">search</span>
            <input type="text" id="event-search-input" placeholder="Search events, routes, servers..." style="width: 100%; padding: 8px 14px 8px 38px; background: rgba(10, 9, 9, 0.8); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; color: var(--color-text); font-size: 13px; outline: none; transition: border-color 0.2s ease;">
          </div>

        </div>

        <!-- ═══════════════════════════════════════════ -->
        <!-- All Events Grid -->
        <!-- ═══════════════════════════════════════════ -->
        <section style="margin-bottom: 80px;">
          ${events.length > 0 ? `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px;" id="events-grid" class="reveal">
              ${events.map((event, i) => `
                <div class="modern-event-card event-card reveal-delay-${(i % 6) + 1}" data-status="${(event.status || 'scheduled').toLowerCase()}" data-search="${App.escapeHtml(`${event.title} ${event.server || ''} ${event.departure || ''} ${event.arrival || ''}`).toLowerCase()}">
                  
                  <div class="modern-event-img-wrap">
                    ${event.image
                      ? `<img src="${App.escapeHtml(event.image)}" alt="${App.escapeHtml(event.title)}" loading="lazy" data-fallback="${App.escapeHtml(event.map || '')}" onerror="if(this.getAttribute('data-fallback') && this.src !== this.getAttribute('data-fallback')) { this.src = this.getAttribute('data-fallback'); }">`
                      : `<div style="width:100%;height:100%;background:linear-gradient(135deg, #1f1b1a, #2a2220);display:flex;align-items:center;justify-content:center;font-size:42px;">🚛</div>`
                    }
                    <div style="position: absolute; top: 12px; right: 12px;">
                      <span class="badge ${EventsPage.getStatusBadgeClass(event.status)}" style="background: rgba(10, 10, 10, 0.8); backdrop-filter: blur(10px); font-family: var(--font-mono); font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 999px; border: 1px solid rgba(255, 255, 255, 0.1);">
                        ● ${App.escapeHtml(event.status || 'Scheduled')}
                      </span>
                    </div>
                  </div>
                  
                  <div style="padding: 24px; display: flex; flex-direction: column; flex: 1; justify-content: space-between;">
                    <div>
                      <h3 style="font-size: 19px; font-weight: 600; color: var(--color-text); margin-bottom: 14px; line-height: 1.3;">
                        ${App.escapeHtml(event.title)}
                      </h3>
                      
                      <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
                        ${event.date ? `
                          <div style="display: flex; align-items: center; gap: 8px; color: var(--color-text-secondary); font-size: 13px; font-family: var(--font-mono);">
                            <span class="material-symbols-outlined" style="font-size: 16px; color: var(--color-primary);">calendar_month</span>
                            ${App.formatDate(event.date)} ${event.time ? `• ${App.escapeHtml(event.time)} UTC` : ''}
                          </div>
                        ` : ''}
                        ${event.server ? `
                          <div style="display: flex; align-items: center; gap: 8px; color: var(--color-text-secondary); font-size: 13px; font-family: var(--font-mono);">
                            <span class="material-symbols-outlined" style="font-size: 16px; color: #3b82f6;">dns</span>
                            ${App.escapeHtml(event.server)}
                          </div>
                        ` : ''}
                        ${event.departure ? `
                          <div style="display: flex; align-items: center; gap: 8px; color: var(--color-text-secondary); font-size: 13px; font-family: var(--font-mono);">
                            <span class="material-symbols-outlined" style="font-size: 16px; color: var(--color-primary-light);">route</span>
                            ${App.escapeHtml(event.departure)} ${event.arrival ? `➔ ${App.escapeHtml(event.arrival)}` : ''}
                          </div>
                        ` : ''}
                      </div>
                    </div>

                    <div style="padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: center;">
                      ${event.attendance ? `<span style="font-family: var(--font-mono); font-size: 12px; color: var(--color-text-muted);">👤 ${event.attendance} Attending</span>` : `<span style="font-family: var(--font-mono); font-size: 12px; color: var(--color-text-muted);">RealOps Event</span>`}
                      ${event.eventLink ? `
                        <a href="${App.escapeHtml(event.eventLink)}" target="_blank" rel="noopener" style="font-size: 13px; font-weight: 600; color: var(--color-primary-light); text-decoration: none; display: flex; align-items: center; gap: 4px;">
                          View Event <span class="material-symbols-outlined" style="font-size: 14px;">open_in_new</span>
                        </a>
                      ` : ''}
                    </div>

                  </div>
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="empty-state reveal bento-card" style="padding: 64px; text-align: center; background: rgba(18,16,16,0.6);">
              <div class="empty-state-icon" style="font-size: 48px; margin-bottom: 16px;">📅</div>
              <h3 class="empty-state-title" style="font-size: 22px; color: var(--color-text); margin-bottom: 8px;">No Scheduled Events</h3>
              <p class="empty-state-desc" style="color: var(--color-text-secondary); max-width: 480px; margin: 0 auto 24px;">There are no upcoming events listed right now. Request RealOps Team for your convoy on Discord!</p>
              <div>
                <a href="https://discord.gg/realops" target="_blank" rel="noopener" class="glass-button-primary" style="display: inline-block; padding: 12px 24px; font-size: 15px; text-decoration: none;">Join Discord</a>
              </div>
            </div>
          `}
        </section>

        <!-- ═══════════════════════════════════════════ -->
        <!-- Request RealOps Team CTA -->
        <!-- ═══════════════════════════════════════════ -->
        <section class="reveal">
          <div style="background: rgba(16, 14, 14, 0.9); border: 1px solid rgba(255, 107, 53, 0.2); border-radius: 24px; padding: 48px 24px; text-align: center;">
            <h3 style="font-size: 26px; font-weight: 700; color: var(--color-text); margin: 0 0 12px;">
              Organizing a TruckersMP Convoy?
            </h3>
            <p style="font-size: 15px; color: var(--color-text-secondary); max-width: 540px; margin: 0 auto 24px; line-height: 1.6;">
              Book RealOps Team for lead/tail escorts, junction locks, traffic control, and simulated road incidents.
            </p>
            <a href="https://discord.gg/realops" target="_blank" rel="noopener" class="glass-button-primary" style="padding: 12px 28px; font-size: 15px; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 8px;">
              Book RealOps Team <span class="material-symbols-outlined" style="font-size: 18px;">arrow_forward</span>
            </a>
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
    const searchInput = document.getElementById('event-search-input');
    const cards = document.querySelectorAll('#events-grid .event-card');

    let currentFilter = 'all';

    const filterCards = () => {
      const query = (searchInput?.value || '').toLowerCase().trim();

      cards.forEach(card => {
        const matchesStatus = currentFilter === 'all' || card.dataset.status === currentFilter;
        const matchesSearch = !query || (card.dataset.search || '').includes(query);

        if (matchesStatus && matchesSearch) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    };

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => {
          b.style.background = 'transparent';
          b.style.color = 'var(--color-text-secondary)';
          b.style.borderColor = 'rgba(255,255,255,0.08)';
        });

        btn.style.background = 'var(--color-primary)';
        btn.style.color = '#fff';
        btn.style.borderColor = 'var(--color-primary)';

        currentFilter = btn.dataset.filter;
        filterCards();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', filterCards);
    }
  }
};
