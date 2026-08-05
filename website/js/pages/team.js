// ============================================================
// RealOps — Command Roster & Team Page
// ============================================================

const TeamPage = {
  async render() {
    const staff = await API.getStaff();

    const getDepartment = (roleName) => {
      const r = (roleName || '').toLowerCase();
      if (['founder', 'co-founder', 'project manager', 'snr event manager', 'partner manager', 'event manager', 'snr support manager'].some(k => r.includes(k))) return 'Management';
      if (['developer', 'dev'].some(k => r.includes(k))) return 'Development';
      if (['media', 'social'].some(k => r.includes(k))) return 'Media';
      if (['hr', 'human resources'].some(k => r.includes(k))) return 'Human Resources';
      if (['support', 'helpdesk'].some(k => r.includes(k))) return 'Support';
      if (['event', 'supervisor', 'planner'].some(k => r.includes(k))) return 'Events';
      return 'Real Operation';
    };

    const members = (staff || []).map(m => {
      const primaryRole = m.roles && m.roles.length > 0
        ? (typeof m.roles[0] === 'string' ? m.roles[0] : m.roles[0].name)
        : (m.position || 'Team Member');
      return {
        ...m,
        primaryRole,
        department: getDepartment(primaryRole)
      };
    });

    const departments = ['All', 'Management', 'Real Operation', 'Events', 'Development', 'Media'];

    return `
      <div class="container" style="padding-top: 130px; padding-bottom: 80px;">
        
        <div style="text-align: center; margin-bottom: 48px;" class="reveal">
          <h1 style="font-size: clamp(36px, 5vw, 56px); font-weight: 800; color: #ffffff;">
            Meet The <span class="gradient-text-orange">RealOps Crew</span>
          </h1>
          <p style="font-size: 16px; color: var(--color-text-secondary); max-width: 600px; margin: 12px auto 0; line-height: 1.6;">
            The trained convoy pilots, event supervisors, and developers powering our platform operations.
          </p>
        </div>

        <!-- Filter Tabs -->
        <div class="filter-tabs reveal" id="team-filters">
          ${departments.map((dept, idx) => `
            <button class="filter-tab ${idx === 0 ? 'active' : ''}" data-filter="${dept === 'All' ? 'all' : dept}">${App.escapeHtml(dept)}</button>
          `).join('')}
        </div>

        <!-- Team Grid -->
        <section style="width: 100%;">
          ${members.length > 0 ? `
            <div class="team-grid reveal" id="team-grid">
              ${members.map((member) => `
                <div class="team-card" data-department="${App.escapeHtml(member.department)}">
                  <div class="team-avatar-wrapper">
                    ${member.avatar ? `
                      <img src="${App.escapeHtml(member.avatar)}" alt="${App.escapeHtml(member.name)}" class="team-avatar">
                    ` : `
                      <div class="team-avatar" style="background: rgba(255, 94, 26, 0.15); display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: bold; color: var(--color-primary);">
                        ${(member.name || '?').charAt(0).toUpperCase()}
                      </div>
                    `}
                    <div class="team-status-dot online"></div>
                  </div>

                  <h3 class="team-name">${App.escapeHtml(member.name)}</h3>
                  <div class="team-role">${App.escapeHtml(member.primaryRole)}</div>

                  <div style="margin-top: 16px;">
                    <span style="font-family: var(--font-mono); font-size: 11px; padding: 4px 10px; border-radius: var(--radius-full); background: rgba(0, 242, 254, 0.08); border: 1px solid rgba(0, 242, 254, 0.2); color: var(--color-cyan);">
                      ${App.escapeHtml(member.department)}
                    </span>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="bento-card reveal" style="text-align: center; padding: 64px 24px;">
              <span class="material-symbols-outlined" style="font-size: 56px; color: var(--color-primary); margin-bottom: 16px;">groups</span>
              <h3 style="font-size: 24px; color: #ffffff;">Staff Roster Loading</h3>
              <p style="color: var(--color-text-secondary); margin-top: 8px;">Check back shortly or visit our Discord server.</p>
            </div>
          `}
        </section>

      </div>
    `;
  },

  initFilters() {
    const filterBtns = document.querySelectorAll('#team-filters .filter-tab');
    const cards = document.querySelectorAll('#team-grid .team-card');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;
        cards.forEach(card => {
          if (filter === 'all' || card.dataset.department === filter) {
            card.style.display = 'block';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }
};
