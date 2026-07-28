// ============================================================
// RealOps — Team Page
// ============================================================

const TeamPage = {
  async render() {
    const staff = await API.getStaff();

    // Extract unique departments for filter
    const departments = ['All', ...new Set((staff || []).flatMap(s => s.departments || [s.department]).filter(Boolean))];

    const managementTeam = [];
    const teamMembers = [];
    
    (staff || []).forEach(member => {
        const position = (member.position || '').toLowerCase();
        const isManagement = position === 'project manager';
        if (isManagement) {
            managementTeam.push(member);
        } else {
            teamMembers.push(member);
        }
    });

    const renderMemberCard = (member, i) => {
      const memberDepts = member.departments || [member.department || 'General'];
      return `
      <div class="bento-card ambient-shadow reveal reveal-delay-${(i % 6) + 1}" data-departments="${App.escapeHtml(memberDepts.join(','))}" style="padding: 24px; display: flex; flex-direction: column; align-items: center; text-align: center;">
        ${member.avatar
          ? `<img class="staff-avatar" src="${App.escapeHtml(member.avatar)}" alt="${App.escapeHtml(member.name)}" loading="lazy" style="width: 80px; height: 80px; border-radius: 50%; border: 2px solid var(--color-border); margin-bottom: 16px;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
             <div class="staff-avatar-placeholder" style="display:none; width: 80px; height: 80px; border-radius: 50%; border: 2px solid var(--color-border); margin-bottom: 16px; align-items: center; justify-content: center; font-size: 24px;">${(member.name || '?').charAt(0).toUpperCase()}</div>`
          : `<div class="staff-avatar-placeholder" style="width: 80px; height: 80px; border-radius: 50%; border: 2px solid var(--color-border); margin-bottom: 16px; display: flex; align-items: center; justify-content: center; font-size: 24px;">${(member.name || '?').charAt(0).toUpperCase()}</div>`
        }
        <h3 class="staff-name" style="font-size: 20px; font-weight: 500; color: var(--color-text); margin-bottom: 4px;">${App.escapeHtml(member.name)}</h3>
        <p class="staff-position" style="font-size: 14px; color: var(--color-text-secondary); margin-bottom: 12px;">${App.escapeHtml(member.position || 'Team Member')}</p>
        <span class="staff-department" style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--color-primary); background: rgba(255, 107, 53, 0.1); padding: 4px 8px; border-radius: 4px; margin-bottom: 16px;">${App.escapeHtml(memberDepts.join(', '))}</span>

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
    };

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
    const cards = document.querySelectorAll('.bento-card[data-departments]');

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
          const cardDepts = (card.dataset.departments || '').split(',');
          if (filter === 'all' || cardDepts.includes(filter)) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }
};
