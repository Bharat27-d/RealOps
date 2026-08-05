// ============================================================
// RealOps — Community Guidelines Page
// ============================================================

const GuidelinesPage = {
  render: () => {
    return `
      <div class="container" style="padding-top: 130px; padding-bottom: 80px;">
        
        <div style="text-align: center; margin-bottom: 48px;" class="reveal">
          <h1 style="font-size: clamp(36px, 5vw, 56px); font-weight: 800; color: #ffffff;">
            Community <span class="gradient-text-orange">Guidelines</span>
          </h1>
          <p style="font-size: 16px; color: var(--color-text-secondary); max-width: 600px; margin: 12px auto 0; line-height: 1.6;">
            Professional standards required for all participants, Virtual Trucking Companies, and escort pilots.
          </p>
        </div>

        <div class="bento-card reveal" style="max-width: 840px; margin: 0 auto; padding: 48px;">
          <h2 style="font-size: 22px; color: var(--color-primary); margin-bottom: 12px;">1. Respect & Radio Discipline</h2>
          <p style="font-size: 15px; color: var(--color-text-secondary); line-height: 1.7; margin-bottom: 32px;">
            All members and event attendees must treat staff and drivers with mutual respect. Voice channels must maintain clear radio discipline during active convoy operations.
          </p>

          <h2 style="font-size: 22px; color: var(--color-primary); margin-bottom: 12px;">2. Escort Convoy Conduct</h2>
          <p style="font-size: 15px; color: var(--color-text-secondary); line-height: 1.7; margin-bottom: 32px;">
            Drivers must follow Lead Escort speed locks and pilot junction clearances. Reckless driving, intentional ramming, or overtaking pilot cars is strictly prohibited.
          </p>

          <h2 style="font-size: 22px; color: var(--color-primary); margin-bottom: 12px;">3. Discord Rules</h2>
          <ul style="font-size: 15px; color: var(--color-text-secondary); line-height: 1.7; margin-bottom: 32px; padding-left: 20px;">
            <li style="margin-bottom: 8px;">No spamming or unsolicited DMs to staff members.</li>
            <li style="margin-bottom: 8px;">Use designated channels for support tickets and event media.</li>
            <li style="margin-bottom: 8px;">Follow instructions from Event Supervisors and Founders.</li>
          </ul>

          <h2 style="font-size: 22px; color: var(--color-primary); margin-bottom: 12px;">4. Policy Enforcement</h2>
          <p style="font-size: 15px; color: var(--color-text-secondary); line-height: 1.7;">
            Violations may result in warnings, event disqualification, or permanent bans from RealOps convoy channels.
          </p>
        </div>

      </div>
    `;
  }
};
