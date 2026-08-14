// ============================================================
// RealOps — Shared Route Metadata Configuration
// Single source of truth for route titles, descriptions, and OG data
// Used by: app.js (SPA router) and build.js (SSR metadata)
// ============================================================

const ROUTES_META = {
  '/': {
    title: 'RealOps — Professional Convoy Control | TruckersMP',
    description: 'RealOps is one of the leading Convoy Control teams in the TruckersMP community. Professional, organised, and high-quality convoy management for events of all sizes.',
    ogTitle: 'RealOps — Professional Convoy Control',
    ogDescription: 'One of the leading Convoy Control teams in the TruckersMP community. Professional convoy management for events of all sizes.',
    canonical: 'https://realopsevents.com/'
  },
  '/about': {
    title: 'About — RealOps',
    description: 'Learn about RealOps, our mission, history, core values, and dedicated team providing professional convoy control in TruckersMP.',
    ogTitle: 'About — RealOps',
    ogDescription: 'Learn about RealOps, our mission, history, and dedicated convoy control team in TruckersMP.',
    canonical: 'https://realopsevents.com/about'
  },
  '/events': {
    title: 'Events — RealOps',
    description: 'Discover upcoming and past TruckersMP convoy control operations, community events, and joint convoys managed by RealOps.',
    ogTitle: 'Events & Operations — RealOps',
    ogDescription: 'Discover upcoming and past TruckersMP convoy control operations and community events managed by RealOps.',
    canonical: 'https://realopsevents.com/events'
  },
  '/team': {
    title: 'Team — RealOps',
    description: 'Meet the RealOps leadership, dispatchers, convoy controllers, media team, and staff members delivering top-tier operations.',
    ogTitle: 'Our Team — RealOps',
    ogDescription: 'Meet the RealOps leadership, dispatchers, convoy controllers, and staff members delivering top-tier operations.',
    canonical: 'https://realopsevents.com/team'
  },
  '/recruitment': {
    title: 'Recruitment — RealOps',
    description: 'Join the RealOps team. Apply to become a Convoy Controller, Event Manager, Media Team member, or Staff in TruckersMP.',
    ogTitle: 'Join the Team — RealOps Recruitment',
    ogDescription: 'Join RealOps! Apply to become a Convoy Controller, Event Manager, or Media Team member in TruckersMP.',
    canonical: 'https://realopsevents.com/recruitment'
  },
  '/contact': {
    title: 'Contact — RealOps',
    description: 'Get in touch with RealOps for convoy control bookings, event partnerships, feedback, or general inquiries.',
    ogTitle: 'Contact Us — RealOps',
    ogDescription: 'Get in touch with RealOps for convoy control bookings, event partnerships, or inquiries.',
    canonical: 'https://realopsevents.com/contact'
  },
  '/privacy': {
    title: 'Privacy Policy — RealOps',
    description: 'Read the RealOps Privacy Policy to understand how we collect, use, and protect your information.',
    ogTitle: 'Privacy Policy — RealOps',
    ogDescription: 'Read the RealOps Privacy Policy to understand how we protect your personal data.',
    canonical: 'https://realopsevents.com/privacy'
  },
  '/guidelines': {
    title: 'Community Guidelines — RealOps',
    description: 'Review the RealOps Community Guidelines and code of conduct for our events, Discord server, and operations.',
    ogTitle: 'Community Guidelines — RealOps',
    ogDescription: 'Review the RealOps Community Guidelines and code of conduct for our operations.',
    canonical: 'https://realopsevents.com/guidelines'
  },
  '/legal': {
    title: 'Legal — RealOps',
    description: 'RealOps legal notices, terms of service, and TruckersMP community disclaimers.',
    ogTitle: 'Legal & Terms — RealOps',
    ogDescription: 'RealOps legal notices, terms of service, and TruckersMP community disclaimers.',
    canonical: 'https://realopsevents.com/legal'
  }
};

// Export for both browser (app.js) and Node.js (build.js)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ROUTES_META;
}
