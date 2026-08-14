// ============================================================
// RealOps — Team Page (Roster Overhaul & Alignment Fix)
// ============================================================

const TeamPage = {
  async render() {
    const rawStaff = await API.getStaff();

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
    
    // Deduplicate staff members by ID/name
    const processedMembers = new Map();
    (rawStaff || []).forEach(member => {
      const idKey = member.id || member.name;
      if (!processedMembers.has(idKey)) {
        const roles = member.roles && member.roles.length > 0 ? member.roles : [member.position || 'Escort Pilot'];
        const primaryRole = typeof roles[0] === 'string' ? roles[0] : (roles[0]?.name || String(roles[0]));
        const dept = member.department || getDepartmentForRole(primaryRole);
        allDepartments.add(dept);
        
        processedMembers.set(idKey, {
          ...member,
          primaryPosition: member.position || primaryRole,
          department: dept,
          rolesList: roles.map(r => typeof r === 'string' ? r : (r.name || String(r)))
        });
      }
    });

    processedMembers.forEach(entry => {
      if (['management', 'development', 'human resources'].includes(entry.department.toLowerCase())) {
        managementTeam.push(entry);
      } else {
        teamMembers.push(entry);
      }
    });

    const departments = ['All', ...allDepartments];

    const renderMemberCard = (member, i) => `
      <div class="bento-card reveal reveal-delay-${(i % 6) + 1}" data-department="${App.escapeHtml(member.department || 'Convoy Operations')}" style="padding: 24px 20px; display: flex; flex-direction: column; align-items: center; text-align: center; background: rgba(18, 16, 16, 0.75); border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 20px; min-height: 250px; justify-content: space-between;">
        <div style="display: flex; flex-direction: column; align-items: center; width: 100%;">
          ${member.avatar
            ? `<img class="staff-avatar" src="${App.escapeHtml(member.avatar)}" alt="${App.escapeHtml(member.name)}" loading="lazy" style="width: 72px; height: 72px; border-radius: 18px; object-fit: cover; border: 1px solid rgba(255,255,255,0.12); margin-bottom: 14px; box-shadow: 0 4px 16px rgba(0,0,0,0.4);" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
               <div class="staff-avatar-placeholder" style="display:none; width: 72px; height: 72px; border-radius: 18px; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,107,53,0.1); margin-bottom: 14px; align-items: center; justify-content: center; font-size: 24px; font-weight: 700; color: var(--color-primary);">${(member.name || '?').charAt(0).toUpperCase()}</div>`
            : `<div class="staff-avatar-placeholder" style="width: 72px; height: 72px; border-radius: 18px; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,107,53,0.1); margin-bottom: 14px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700; color: var(--color-primary);">${(member.name || '?').charAt(0).toUpperCase()}</div>`
          }
          
          <h3 class="member-name" style="font-size: 18px; font-weight: 700; margin: 0 0 4px;">${App.escapeHtml(member.name)}</h3>
          
          <div style="margin-bottom: 12px;">
            <span class="member-dept" style="padding: 4px 10px; border-radius: 6px; border: 1px solid rgba(255, 107, 53, 0.25);">
              ${App.escapeHtml(member.department)}
            </span>
          </div>
        </div>

        ${member.rolesList && member.rolesList.length > 0 ? `
          <div style="display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; align-items: center; width: 100%; margin-top: auto; padding-top: 10px;">
            ${member.rolesList.slice(0, 4).map(role => `
              <span style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 3px 10px; border-radius: 999px; font-size: 11px; font-family: var(--font-mono); color: var(--color-text-secondary); white-space: nowrap;">${App.escapeHtml(role)}</span>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;

    return `
      <!-- Main Container -->
      <main class="page-container">
        
        <!-- Header -->
        <div class="section-header reveal">
          <div class="status-pill">
            <span class="status-beacon" style="width: 6px; height: 6px;"></span>
            <span class="section-label-sm">OPERATIONS ROSTER</span>
          </div>

          <h1 class="page-title">
            RealOps Team Roster
          </h1>
          
          <p class="section-desc">
            The dedicated commanders, escort pilots, traffic controllers, and event staff behind RealOps on-road operations.
          </p>
        </div>

        <section style="width: 100%;">
          ${rawStaff && rawStaff.length > 0 ? `
            ${departments.length > 2 ? `
              <div id="team-filters" class="reveal" style="display: flex; justify-content: center; flex-wrap: wrap; gap: 8px; margin-bottom: 40px; padding: 12px; background: rgba(18,16,16,0.6); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px;">
                ${departments.map(dept => `
                  <button class="filter-btn ${dept === 'All' ? 'active' : ''}" data-filter="${dept === 'All' ? 'all' : dept}">${App.escapeHtml(dept)}</button>
                `).join('')}
              </div>
            ` : ''}

            ${managementTeam.length > 0 ? `
              <div class="section-label reveal" style="text-align: left; margin-bottom: 20px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.06);">
                Command & Management
              </div>
              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; margin-bottom: 56px;" id="management-grid" class="reveal">
                ${managementTeam.map((member, i) => renderMemberCard(member, i)).join('')}
              </div>
            ` : ''}

            ${teamMembers.length > 0 ? `
              <div class="section-label reveal" style="text-align: left; margin-bottom: 20px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.06); color: var(--color-primary-light);">
                Operations & Escort Crew
              </div>
              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px;" id="team-grid" class="reveal">
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
          b.classList.remove('active');
        });
        btn.classList.add('active');

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
