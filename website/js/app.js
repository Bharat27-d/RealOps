// ============================================================
// RealOps — Main Application
// History API SPA Router, Scroll Animations, Counter Animations
// ============================================================

const App = {
  siteUrl: 'https://realopsevents.com',

  // ── Route definitions ──
  routes: {
    '/': { page: () => HomePage, afterRender: null },
    '/about': { page: () => AboutPage, afterRender: null },
    '/events': { page: () => EventsPage, afterRender: () => EventsPage.initFilters() },
    '/team': { page: () => TeamPage, afterRender: () => TeamPage.initFilters() },
    '/recruitment': { page: () => RecruitmentPage, afterRender: null },
    '/contact': { page: () => ContactPage, afterRender: null },
    '/privacy': { page: () => PrivacyPage, afterRender: null },
    '/guidelines': { page: () => GuidelinesPage, afterRender: null },
    '/legal': { page: () => LegalPage, afterRender: null }
  },

  currentRoute: '/',
  observer: null,

  // ── Dynamic Metadata (Canonical, Open Graph, Twitter Cards) ──
  updateMetadata(route, path) {
    const meta = (typeof ROUTES_META !== 'undefined' && ROUTES_META[path]) || {};
    const canonicalUrl = meta.canonical || (path === '/' ? `${this.siteUrl}/` : `${this.siteUrl}${path}`);
    const title = meta.title || 'RealOps — Professional Convoy Control';
    const description = meta.description || 'Professional convoy management in TruckersMP.';
    const ogTitle = meta.ogTitle || title;
    const ogDescription = meta.ogDescription || description;

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
      // Show 404 page
      this.currentRoute = path;
      document.title = 'Page Not Found — RealOps';
      const content = document.getElementById('app-content');
      if (content) {
        content.innerHTML = `
          <main style="padding-top: 140px; padding-bottom: 80px; max-width: var(--max-width); margin: 0 auto; text-align: center; min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div style="font-size: 80px; margin-bottom: 16px;">🚧</div>
            <h1 style="font-size: 48px; font-weight: 800; color: var(--color-text); margin-bottom: 12px;">404</h1>
            <h2 style="font-size: 22px; font-weight: 600; color: var(--color-text-secondary); margin-bottom: 8px;">Page Not Found</h2>
            <p style="font-size: 15px; color: var(--color-text-muted); max-width: 440px; line-height: 1.6; margin-bottom: 32px;">
              The road you're looking for doesn't exist. It may have been moved or the URL might be incorrect.
            </p>
            <div style="display: flex; gap: 14px; flex-wrap: wrap; justify-content: center;">
              <a href="/" class="glass-button-primary" style="padding: 12px 28px; font-size: 15px; font-weight: 600; text-decoration: none;">Go Home</a>
              <a href="/events" onclick="window.scrollTo(0,0)" class="glass-button-secondary" style="padding: 12px 24px; font-size: 15px; font-weight: 500; text-decoration: none;">View Events</a>
            </div>
          </main>
        `;
        content.style.opacity = '1';
        content.style.transform = 'translateY(0)';
      }
      this.updateActiveNav(path);
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
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
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
