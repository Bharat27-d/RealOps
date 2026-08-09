// ============================================================
// RealOps — Main Application
// History API SPA Router, Scroll Animations, Counter Animations
// ============================================================

const App = {
  siteUrl: 'https://realopsevents.com',

  // ── Route definitions ──
  routes: {
    '/': {
      page: () => HomePage,
      title: 'RealOps — Professional Convoy Control | TruckersMP',
      description: 'RealOps is one of the leading Convoy Control teams in the TruckersMP community. Professional, organised, and high-quality convoy management for events of all sizes.',
      ogTitle: 'RealOps — Professional Convoy Control',
      ogDescription: 'One of the leading Convoy Control teams in the TruckersMP community. Professional convoy management for events of all sizes.',
      afterRender: null
    },
    '/about': {
      page: () => AboutPage,
      title: 'About — RealOps',
      description: 'Learn about RealOps, our mission, history, core values, and dedicated team providing professional convoy control in TruckersMP.',
      ogTitle: 'About — RealOps',
      ogDescription: 'Learn about RealOps, our mission, history, and dedicated convoy control team in TruckersMP.',
      afterRender: null
    },
    '/events': {
      page: () => EventsPage,
      title: 'Events — RealOps',
      description: 'Discover upcoming and past TruckersMP convoy control operations, community events, and joint convoys managed by RealOps.',
      ogTitle: 'Events & Operations — RealOps',
      ogDescription: 'Discover upcoming and past TruckersMP convoy control operations and community events managed by RealOps.',
      afterRender: () => EventsPage.initFilters()
    },
    '/team': {
      page: () => TeamPage,
      title: 'Team — RealOps',
      description: 'Meet the RealOps leadership, dispatchers, convoy controllers, media team, and staff members delivering top-tier operations.',
      ogTitle: 'Our Team — RealOps',
      ogDescription: 'Meet the RealOps leadership, dispatchers, convoy controllers, and staff members delivering top-tier operations.',
      afterRender: () => TeamPage.initFilters()
    },
    '/recruitment': {
      page: () => RecruitmentPage,
      title: 'Recruitment — RealOps',
      description: 'Join the RealOps team. Apply to become a Convoy Controller, Event Manager, Media Team member, or Staff in TruckersMP.',
      ogTitle: 'Join the Team — RealOps Recruitment',
      ogDescription: 'Join RealOps! Apply to become a Convoy Controller, Event Manager, or Media Team member in TruckersMP.',
      afterRender: null
    },
    '/contact': {
      page: () => ContactPage,
      title: 'Contact — RealOps',
      description: 'Get in touch with RealOps for convoy control bookings, event partnerships, feedback, or general inquiries.',
      ogTitle: 'Contact Us — RealOps',
      ogDescription: 'Get in touch with RealOps for convoy control bookings, event partnerships, or inquiries.',
      afterRender: null
    },
    '/privacy': {
      page: () => PrivacyPage,
      title: 'Privacy Policy — RealOps',
      description: 'Read the RealOps Privacy Policy to understand how we collect, use, and protect your information.',
      ogTitle: 'Privacy Policy — RealOps',
      ogDescription: 'Read the RealOps Privacy Policy to understand how we protect your personal data.',
      afterRender: null
    },
    '/guidelines': {
      page: () => GuidelinesPage,
      title: 'Community Guidelines — RealOps',
      description: 'Review the RealOps Community Guidelines and code of conduct for our events, Discord server, and operations.',
      ogTitle: 'Community Guidelines — RealOps',
      ogDescription: 'Review the RealOps Community Guidelines and code of conduct for our operations.',
      afterRender: null
    },
    '/legal': {
      page: () => LegalPage,
      title: 'Legal — RealOps',
      description: 'RealOps legal notices, terms of service, and TruckersMP community disclaimers.',
      ogTitle: 'Legal & Terms — RealOps',
      ogDescription: 'RealOps legal notices, terms of service, and TruckersMP community disclaimers.',
      afterRender: null
    }
  },

  currentRoute: '/',
  observer: null,

  // ── Dynamic Metadata (Canonical, Open Graph, Twitter Cards) ──
  updateMetadata(route, path) {
    const canonicalUrl = path === '/' ? `${this.siteUrl}/` : `${this.siteUrl}${path}`;
    const title = route.title || 'RealOps — Professional Convoy Control';
    const description = route.description || 'Professional convoy management in TruckersMP.';
    const ogTitle = route.ogTitle || title;
    const ogDescription = route.ogDescription || description;

    // Document title
    document.title = title;

    // Helper to set or create meta tag
    const setMeta = (attr, key, content) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Helper to set or create link tag
    const setLink = (rel, href) => {
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    // Standard SEO
    setMeta('name', 'description', description);
    setLink('canonical', canonicalUrl);

    // Open Graph
    setMeta('property', 'og:url', canonicalUrl);
    setMeta('property', 'og:title', ogTitle);
    setMeta('property', 'og:description', ogDescription);

    // Twitter Card
    setMeta('name', 'twitter:url', canonicalUrl);
    setMeta('name', 'twitter:title', ogTitle);
    setMeta('name', 'twitter:description', ogDescription);
  },

  // ── Initialize ──
  async init() {
    // Set up the router (History API)
    window.addEventListener('popstate', () => this.handleRoute());

    // Intercept all internal link clicks for SPA navigation
    document.addEventListener('click', (e) => {
      const anchor = e.target.closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('//') || href.startsWith('mailto:') || anchor.hasAttribute('target')) return;
      if (this.routes[href]) {
        e.preventDefault();
        this.navigateTo(href);
      }
    });

    // Set up navbar scroll effect
    this.initNavScroll();

    // Set up mobile nav
    this.initMobileNav();

    // Initial route
    await this.handleRoute();

    // Prefetch data in background
    API.prefetchAll();

    // Update dynamic links in index.html
    const dashLinks = document.querySelectorAll('a[href="http://localhost:3000"], a[href="https://dashboard.realopsevents.com"], a[href="https://dashboard.realops.cc"]');
    dashLinks.forEach(link => { link.href = API.getDashboardUrl(); });

    const apiLinks = document.querySelectorAll('a[href="http://localhost:3001/api/public/partnerships"], a[href="https://api.realopsevents.com/api/public/partnerships"], a[href="https://realops.cc/api/public/partnerships"]');
    apiLinks.forEach(link => { link.href = API.getApiUrl() + '/partnerships'; });

    // Register Service Worker for offline PWA support
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => {
          console.warn('Service Worker registration failed:', err);
        });
      });
    }
  },

  // ── Navigate (pushState) ──
  navigateTo(path) {
    if (path === this.currentRoute) {
      window.scrollTo(0, 0);
      return;
    }
    window.history.pushState(null, '', path);
    this.handleRoute();
    window.scrollTo(0, 0);
  },

  // ── Router ──
  async handleRoute() {
    const path = window.location.pathname || '/';
    const route = this.routes[path];

    if (!route) {
      // Redirect unknown routes to home
      window.history.replaceState(null, '', '/');
      this.handleRoute();
      return;
    }

    this.currentRoute = path;

    // Update page metadata (Title, Canonical, OG URL, Twitter URL, Description)
    this.updateMetadata(route, path);

    // Update active nav link
    this.updateActiveNav(path);

    // Show loading state
    const content = document.getElementById('app-content');
    if (content) {
      content.style.opacity = '0';
      content.style.transform = 'translateY(12px)';
    }

    try {
      // Render the page
      const pageModule = route.page();
      const html = await pageModule.render();

      // Short delay for smooth transition
      await new Promise(r => setTimeout(r, 80));

      if (content) {
        content.innerHTML = html;
        content.style.opacity = '1';
        content.style.transform = 'translateY(0)';

        // Run page-specific initialization
        if (route.afterRender) {
          route.afterRender();
        }

        // Initialize scroll animations
        this.initScrollAnimations();

        // Initialize counter animations
        this.initCounterAnimations();
      }
    } catch (error) {
      console.error('Route render error:', error);
      if (content) {
        content.innerHTML = `
          <div class="empty-state" style="min-height:60vh;display:flex;flex-direction:column;align-items:center;justify-content:center;">
            <div class="empty-state-icon">⚠️</div>
            <h3 class="empty-state-title">Something went wrong</h3>
            <p class="empty-state-desc">We couldn't load this page. Please try refreshing.</p>
            <div style="margin-top:var(--space-6);">
              <a href="/" class="btn btn-primary">Go Home</a>
            </div>
          </div>
        `;
        content.style.opacity = '1';
        content.style.transform = 'translateY(0)';
      }
    }

    // Close mobile nav if open
    this.closeMobileNav();
  },

  // ── Active Nav Link ──
  updateActiveNav(path) {
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href');
      if (href === path) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });

    // Position the sliding indicator after a short delay to allow DOM update
    requestAnimationFrame(() => this.positionActiveIndicator());
  },

  // ── Sliding Active Indicator ──
  positionActiveIndicator() {
    const indicator = document.getElementById('nav-active-indicator');
    const navLinks = document.getElementById('nav-links');
    if (!indicator || !navLinks) return;

    // Don't show indicator on mobile (drawer mode)
    if (window.innerWidth <= 768) {
      indicator.classList.remove('visible');
      return;
    }

    const activeLink = navLinks.querySelector('.nav-link.active');
    if (!activeLink) {
      indicator.classList.remove('visible');
      return;
    }

    const navRect = navLinks.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();

    const left = linkRect.left - navRect.left;
    const width = linkRect.width;

    indicator.style.left = left + 'px';
    indicator.style.width = width + 'px';

    // Show with a slight delay on first load for a nice entrance
    if (!indicator.classList.contains('visible')) {
      requestAnimationFrame(() => {
        indicator.classList.add('visible');
      });
    }
  },

  // ── Navbar Scroll Effect ──
  initNavScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    const onScroll = () => {
      if (window.scrollY > 20) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Reposition active indicator on resize (debounced)
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => this.positionActiveIndicator(), 100);
    });
  },

  // ── Mobile Navigation ──
  initMobileNav() {
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    const overlay = document.querySelector('.nav-overlay');

    if (toggle) {
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        links.classList.toggle('open');
        overlay.classList.toggle('open');
        document.body.style.overflow = links.classList.contains('open') ? 'hidden' : '';
      });
    }

    if (overlay) {
      overlay.addEventListener('click', () => {
        this.closeMobileNav();
      });
    }

    // Close on nav link click
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        this.closeMobileNav();
      });
    });
  },

  closeMobileNav() {
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    const overlay = document.querySelector('.nav-overlay');

    if (toggle) toggle.classList.remove('active');
    if (links) links.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  },

  // ── Scroll Reveal Animations ──
  initScrollAnimations() {
    // Disconnect previous observer
    if (this.observer) {
      this.observer.disconnect();
    }

    const elements = document.querySelectorAll('.reveal, .reveal-scale');
    if (elements.length === 0) return;

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          this.observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    elements.forEach(el => {
      this.observer.observe(el);
    });
  },

  // ── Animated Counters ──
  initCounterAnimations() {
    const counters = document.querySelectorAll('[data-count]');
    if (counters.length === 0) return;

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.count, 10);

          if (isNaN(target) || target === 0) {
            el.textContent = '0';
            counterObserver.unobserve(el);
            return;
          }

          this.animateCounter(el, target);
          counterObserver.unobserve(el);
        }
      });
    }, {
      threshold: 0.3
    });

    counters.forEach(counter => {
      counterObserver.observe(counter);
    });
  },

  animateCounter(element, target) {
    const duration = 2000; // 2 seconds
    const startTime = performance.now();
    const startValue = 0;

    // Easing function (ease-out cubic)
    const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);

      const currentValue = Math.round(startValue + (target - startValue) * easedProgress);
      element.textContent = currentValue.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = target.toLocaleString();
      }
    };

    requestAnimationFrame(updateCounter);
  },

  // ── Toast Notifications ──
  showToast(message, type = 'success') {
    // Remove existing toasts
    document.querySelectorAll('.toast').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span>${type === 'success' ? '✅' : '❌'}</span>
      <span>${this.escapeHtml(message)}</span>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  },

  // ── Utility: Escape HTML ──
  escapeHtml(str) {
    if (!str) return '';
    const text = String(str);
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  // ── Utility: Format Date ──
  formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  }
};

// ── Boot ──
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
