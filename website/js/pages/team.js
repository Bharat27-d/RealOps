// ============================================================
// RealOps — Team Page
// ============================================================

const TeamPage = {
  async render() {
    const staff = await API.getStaff();

    // Map role names to departments
    const getDepartmentForRole = (roleName) => {
      const r = (roleName || '').toLowerCase();
      if (['founder', 'co-founder','project manager', 'snr event manager', 'partner manager', 'event manager', 'snr support manager'].includes(r)) return 'Management';
      if(['developer'].includes(r)) return 'Development';
      if (['media manager', 'social media manager'].includes(r)) return 'Media';
      if (['hr department'].includes(r)) return 'Human Resources';
      if (['support staff'].includes(r)) return 'Support';
      if (['event supervisor', 'planner', 'junior planner'].includes(r)) return 'Events';
      if (['media team'].includes(r)) return 'Media';
      return 'General';
    };
    const managementRoles = ['founder', 'co-founder', 'project manager', 'snr event manager', 'partner manager', 'event manager', 'snr support manager'];
    const developmentRoles = ['developer'];
    const mediaRoles = ['media manager', 'social media manager', 'media team'];
    const hrRoles = ['hr department'];
    const supportRoles = ['support staff'];
    const eventsRoles = ['event supervisor', 'planner', 'junior planner'];
    const managementTeam = [];
    const teamMembers = [];
    const allDepartments = new Set();
    
    (staff || []).forEach(member => {
        const roles = member.roles && member.roles.length > 0 ? member.roles : [member.position || 'Team Member'];
        roles.forEach(role => {
            const roleName = typeof role === 'string' ? role : (role.name || String(role));
            const dept = getDepartmentForRole(roleName);
            allDepartments.add(dept);
            const entry = { ...member, position: roleName, department: dept };
            if (managementRoles.includes(roleName.toLowerCase())) {
                managementTeam.push(entry);
            } else if (developmentRoles.includes(roleName.toLowerCase())) {
                managementTeam.push(entry);
            } else if (mediaRoles.includes(roleName.toLowerCase())) {
                managementTeam.push(entry);
            } else if (hrRoles.includes(roleName.toLowerCase())) {
                managementTeam.push(entry);
            } else if (supportRoles.includes(roleName.toLowerCase())) {
                managementTeam.push(entry);
            } else if (eventsRoles.includes(roleName.toLowerCase())) {
                managementTeam.push(entry);
            } else {
                teamMembers.push(entry);
            }
        });
    });

    const departments = ['All', ...allDepartments];

    const renderMemberCard = (member, i) => `
      <div class="bento-card ambient-shadow reveal reveal-delay-${(i % 6) + 1}" data-department="${App.escapeHtml(member.department || 'General')}" style="padding: 24px; display: flex; flex-direction: column; align-items: center; text-align: center;">
        ${member.avatar
          ? `<img class="staff-avatar" src="${App.escapeHtml(member.avatar)}" alt="${App.escapeHtml(member.name)}" loading="lazy" style="width: 80px; height: 80px; border-radius: 50%; border: 2px solid var(--color-border); margin-bottom: 16px;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
             <div class="staff-avatar-placeholder" style="display:none; width: 80px; height: 80px; border-radius: 50%; border: 2px solid var(--color-border); margin-bottom: 16px; align-items: center; justify-content: center; font-size: 24px;">${(member.name || '?').charAt(0).toUpperCase()}</div>`
          : `<div class="staff-avatar-placeholder" style="width: 80px; height: 80px; border-radius: 50%; border: 2px solid var(--color-border); margin-bottom: 16px; display: flex; align-items: center; justify-content: center; font-size: 24px;">${(member.name || '?').charAt(0).toUpperCase()}</div>`
        }
        <h3 class="staff-name" style="font-size: 20px; font-weight: 500; color: var(--color-text); margin-bottom: 4px;">${App.escapeHtml(member.name)}</h3>
        <p class="staff-position" style="font-size: 14px; color: var(--color-text-secondary); margin-bottom: 12px;">${App.escapeHtml(member.position || 'Team Member')}</p>
        <span class="staff-department" style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--color-primary); background: rgba(255, 107, 53, 0.1); padding: 4px 8px; border-radius: 4px; margin-bottom: 16px;">${App.escapeHtml(member.department)}</span>

        ${member.roles && member.roles.length > 0 ? `
          <div class="staff-roles" style="display: flex; flex-wrap: wrap; gap: 4px; justify-content: center; margin-bottom: 16px;">
            ${member.roles.slice(0, 3).map(role => `
              <span class="staff-role-badge" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 12px; font-size: 11px; color: var(--color-text-secondary);">${App.escapeHtml(typeof role === 'string' ? role : role.name || role)}</span>
            `).join('')}
            ${member.roles.length > 3 ? `<span class="staff-role-badge" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 12px; font-size: 11px; color: var(--color-text-secondary);">+${member.roles.length - 3}</span>` : ''}
          </div>
        ` : ''}

      </div>
    `;

    return `
      <!-- Main Canvas for Obsidian Prime -->
      <main class="flex-grow relative z-10 pt-[120px] pb-xl px-4 md:px-lg mx-auto w-full flex flex-col gap-xl" style="padding-top: 120px; padding-bottom: 64px; max-width: var(--max-width); margin: 0 auto;">
        
        <div class="page-header" style="text-align: center; margin-bottom: 64px;">
          <div style="font-family: var(--font-mono); font-size: 13px; color: var(--color-primary); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px;">👥 Our Team</div>
          <h1 class="glow-text" style="font-size: clamp(40px, 6vw, 64px); font-weight: 600; line-height: 1.1; letter-spacing: -0.04em; color: var(--color-text); text-transform: uppercase; max-width: 900px; margin: 0 auto;">
            The <span style="color: var(--color-primary);">RealOps</span> Team
          </h1>
          <p style="font-size: 16px; color: var(--color-text-secondary); max-width: 600px; margin: 16px auto 0; line-height: 1.6;">
            Meet the dedicated staff members who make every convoy run smoothly.
          </p>
        </div>

        <section class="section" style="width: 100%;">
          <div class="container" style="max-width: 100%;">
            ${staff && staff.length > 0 ? `
              ${departments.length > 2 ? `
                <div class="filter-bar reveal" id="team-filters" style="display: flex; justify-content: center; flex-wrap: wrap; gap: 8px; margin-bottom: 40px;">
                  ${departments.map(dept => `
                    <button class="filter-btn glass-button-secondary ${dept === 'All' ? 'active' : ''}" data-filter="${dept === 'All' ? 'all' : dept}" style="padding: 8px 16px; font-size: 14px;">${App.escapeHtml(dept)}</button>
                  `).join('')}
                </div>
              ` : ''}

              ${managementTeam.length > 0 ? `
                <div class="section-label" style="font-family: var(--font-mono); font-size: 13px; color: var(--color-text-secondary); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px;">Management Team</div>
                <div class="grid grid-4" id="management-grid" style="margin-bottom: 64px;">
                  ${managementTeam.map((member, i) => renderMemberCard(member, i)).join('')}
                </div>
              ` : ''}

              ${teamMembers.length > 0 ? `
                <div class="section-label" style="font-family: var(--font-mono); font-size: 13px; color: var(--color-text-secondary); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px;">Team Members</div>
                <div class="grid grid-4" id="team-grid">
                  ${teamMembers.map((member, i) => renderMemberCard(member, i)).join('')}
                </div>
              ` : ''}

            ` : `
              <div class="empty-state reveal bento-card ambient-shadow" style="padding: 64px; text-align: center;">
                <div class="empty-state-icon" style="font-size: 48px; margin-bottom: 16px;">👥</div>
                <h3 class="empty-state-title" style="font-size: 24px; color: var(--color-text); margin-bottom: 8px;">No Staff Found</h3>
                <p class="empty-state-desc" style="color: var(--color-text-secondary);">We couldn't load the team members at this time.</p>
              </div>
            `}
          </div>
        </section>
      </main>
    `;
  },

  formatStatus(status) {
    switch ((status || '').toLowerCase()) {
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      case 'leave': return 'On Leave';
      default: return 'Active';
    }
  },

  initFilters() {
    const filterBtns = document.querySelectorAll('#team-filters .filter-btn');
    const cards = document.querySelectorAll('.bento-card[data-department]');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => {
          b.classList.remove('active');
          b.style.background = 'transparent';
          b.style.color = 'var(--color-text)';
        });
        btn.classList.add('active');
        btn.style.background = 'rgba(255, 255, 255, 0.05)';
        btn.style.color = 'var(--color-primary)';

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
