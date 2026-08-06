// ============================================================
// RealOps — Team Page (Roster Overhaul)
// ============================================================

const TeamPage = {
  async render() {
    const staff = await API.getStaff();

    const getDepartmentForRole = (roleName) => {
      const r = (roleName || '').toLowerCase();
      if (['founder', 'co-founder','project manager', 'snr event manager', 'partner manager', 'event manager', 'snr support manager'].includes(r)) return 'Management';
      if (['developer'].includes(r)) return 'Development';
      if (['media manager', 'social media manager', 'media team'].includes(r)) return 'Media';
      if (['hr department'].includes(r)) return 'Human Resources';
      if (['support staff'].includes(r)) return 'Support';
      if (['event supervisor', 'planner', 'junior planner'].includes(r)) return 'Events';
      return 'Convoy Operations';
    };

    const managementTeam = [];
    const teamMembers = [];
    const allDepartments = new Set();
    
    (staff || []).forEach(member => {
      const roles = member.roles && member.roles.length > 0 ? member.roles : [member.position || 'Escort Pilot'];
      roles.forEach(role => {
        const roleName = typeof role === 'string' ? role : (role.name || String(role));
        const dept = getDepartmentForRole(roleName);
        allDepartments.add(dept);
        const entry = { ...member, position: roleName, department: dept };
        if (['management', 'development', 'human resources'].includes(dept.toLowerCase())) {
          managementTeam.push(entry);
        } else {
          teamMembers.push(entry);
        }
      });
    });

    const departments = ['All', ...allDepartments];

    const renderMemberCard = (member, i) => `
      <div class="bento-card reveal reveal-delay-${(i % 6) + 1}" data-department="${App.escapeHtml(member.department || 'Convoy Operations')}" style="padding: 20px; display: flex; flex-direction: column; align-items: center; text-align: center; background: rgba(18, 16, 16, 0.7); border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 18px;">
        ${member.avatar
          ? `<img class="staff-avatar" src="${App.escapeHtml(member.avatar)}" alt="${App.escapeHtml(member.name)}" loading="lazy" style="width: 72px; height: 72px; border-radius: 16px; object-fit: cover; border: 1px solid rgba(255,255,255,0.1); margin-bottom: 14px;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
             <div class="staff-avatar-placeholder" style="display:none; width: 72px; height: 72px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,107,53,0.1); margin-bottom: 14px; align-items: center; justify-content: center; font-size: 24px; font-weight: 700; color: var(--color-primary);">${(member.name || '?').charAt(0).toUpperCase()}</div>`
          : `<div class="staff-avatar-placeholder" style="width: 72px; height: 72px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,107,53,0.1); margin-bottom: 14px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700; color: var(--color-primary);">${(member.name || '?').charAt(0).toUpperCase()}</div>`
        }
        <h3 style="font-size: 18px; font-weight: 600; color: var(--color-text); margin-bottom: 4px;">${App.escapeHtml(member.name)}</h3>
        <p style="font-size: 13px; color: var(--color-text-secondary); margin-bottom: 10px;">${App.escapeHtml(member.position || 'Escort Pilot')}</p>
        
        <span style="font-family: var(--font-mono); font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-primary); background: rgba(255, 107, 53, 0.1); padding: 3px 8px; border-radius: 4px; margin-bottom: 12px;">
          ${App.escapeHtml(member.department)}
        </span>

        ${member.roles && member.roles.length > 0 ? `
          <div style="display: flex; flex-wrap: wrap; gap: 4px; justify-content: center; margin-top: auto;">
            ${member.roles.slice(0, 3).map(role => `
              <span style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); padding: 2px 8px; border-radius: 10px; font-size: 10px; font-family: var(--font-mono); color: var(--color-text-muted);">${App.escapeHtml(typeof role === 'string' ? role : role.name || role)}</span>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;

    return `
      <!-- Main Container -->
      <main class="flex-grow relative z-10 pt-[100px] pb-xl px-4 md:px-lg mx-auto w-full flex flex-col" style="padding-top: 100px; padding-bottom: 80px; max-width: var(--max-width); margin: 0 auto;">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 48px;" class="reveal">
          <div style="display: inline-flex; align-items: center; gap: 8px; padding: 4px 14px; background: rgba(255, 107, 53, 0.08); border: 1px solid rgba(255, 107, 53, 0.2); border-radius: 999px; margin-bottom: 16px;">
            <span class="status-beacon" style="width: 6px; height: 6px;"></span>
            <span style="font-family: var(--font-mono); font-size: 11px; font-weight: 600; color: var(--color-primary-light); text-transform: uppercase; letter-spacing: 0.12em;">OPERATIONS ROSTER</span>
          </div>

          <h1 style="font-size: clamp(32px, 5vw, 54px); font-weight: 800; color: var(--color-text); margin: 0 0 14px; letter-spacing: -0.03em;">
            RealOps Team Roster
          </h1>
          
          <p style="font-size: 16px; color: var(--color-text-secondary); max-width: 580px; margin: 0 auto; line-height: 1.6;">
            The dedicated commanders, escort pilots, traffic controllers, and event staff behind RealOps on-road operations.
          </p>
        </div>

        <section style="width: 100%;">
          ${staff && staff.length > 0 ? `
            ${departments.length > 2 ? `
              <div id="team-filters" class="reveal" style="display: flex; justify-content: center; flex-wrap: wrap; gap: 8px; margin-bottom: 40px; padding: 12px; background: rgba(18,16,16,0.6); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px;">
                ${departments.map(dept => `
                  <button class="filter-btn ${dept === 'All' ? 'active' : ''}" data-filter="${dept === 'All' ? 'all' : dept}" style="padding: 8px 16px; font-size: 13px; font-weight: 600; font-family: var(--font-mono); border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); background: ${dept === 'All' ? 'var(--color-primary)' : 'transparent'}; color: ${dept === 'All' ? '#fff' : 'var(--color-text-secondary)'}; cursor: pointer; transition: all 0.2s ease;">${App.escapeHtml(dept)}</button>
                `).join('')}
              </div>
            ` : ''}

            ${managementTeam.length > 0 ? `
              <div style="font-family: var(--font-mono); font-size: 12px; font-weight: 600; color: var(--color-primary); letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 20px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.06);" class="reveal">
                Command & Management
              </div>
              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px; margin-bottom: 56px;" id="management-grid" class="reveal">
                ${managementTeam.map((member, i) => renderMemberCard(member, i)).join('')}
              </div>
            ` : ''}

            ${teamMembers.length > 0 ? `
              <div style="font-family: var(--font-mono); font-size: 12px; font-weight: 600; color: var(--color-primary-light); letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 20px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.06);" class="reveal">
                Operations & Escort Crew
              </div>
              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px;" id="team-grid" class="reveal">
                ${teamMembers.map((member, i) => renderMemberCard(member, i)).join('')}
              </div>
            ` : ''}

          ` : `
            <div class="empty-state reveal bento-card" style="padding: 64px; text-align: center; background: rgba(18,16,16,0.6);">
              <div class="empty-state-icon" style="font-size: 48px; margin-bottom: 16px;">👥</div>
              <h3 class="empty-state-title" style="font-size: 22px; color: var(--color-text); margin-bottom: 8px;">Roster Loading</h3>
              <p class="empty-state-desc" style="color: var(--color-text-secondary);">Connecting to RealOps staff dispatch...</p>
            </div>
          `}
        </section>
      </main>
    `;
  },

  initFilters() {
    const filterBtns = document.querySelectorAll('#team-filters .filter-btn');
    const cards = document.querySelectorAll('.bento-card[data-department]');

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

        const filter = btn.dataset.filter;
        cards.forEach(card => {
          if (filter === 'all' || card.dataset.department === filter) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }
};
