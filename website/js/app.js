// ============================================================
// RealOps — Main Application
// Hash-based SPA Router, Scroll Animations, Counter Animations
// ============================================================

const App = {
  // ── Route definitions ──
  routes: {
    '/': { page: () => HomePage, title: 'RealOps — Professional Convoy Control', afterRender: null },
    '/about': { page: () => AboutPage, title: 'About — RealOps', afterRender: null },
    '/events': { page: () => EventsPage, title: 'Events — RealOps', afterRender: () => EventsPage.initFilters() },
    '/team': { page: () => TeamPage, title: 'Team — RealOps', afterRender: () => TeamPage.initFilters() },
    '/recruitment': { page: () => RecruitmentPage, title: 'Recruitment — RealOps', afterRender: null },
    '/stats': { page: () => StatsPage, title: 'Statistics — RealOps', afterRender: null },
    '/contact': { page: () => ContactPage, title: 'Contact — RealOps', afterRender: null },
    '/privacy': { page: () => PrivacyPage, title: 'Privacy Policy — RealOps', afterRender: null },
    '/guidelines': { page: () => GuidelinesPage, title: 'Community Guidelines — RealOps', afterRender: null },
    '/legal': { page: () => LegalPage, title: 'Legal — RealOps', afterRender: null }
  },

  currentRoute: '/',
  observer: null,

  // ── Initialize ──
  async init() {
    // Set up the router
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('load', () => this.handleRoute());

    // Set up navbar scroll effect
    this.initNavScroll();

    // Set up mobile nav
    this.initMobileNav();

    // Initial route
    await this.handleRoute();

    // Prefetch data in background
    API.prefetchAll();

    // Update dynamic links in index.html
    const dashLinks = document.querySelectorAll('a[href="http://localhost:3000"], a[href="https://dashboard.realopsevents.com"]');
    dashLinks.forEach(link => { link.href = API.getDashboardUrl(); });

    const apiLinks = document.querySelectorAll('a[href="http://localhost:3001/api/public/partnerships"], a[href="https://api.realopsevents.com/api/public/partnerships"]');
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

  // ── Router ──
  async handleRoute() {
    const hash = window.location.hash.slice(1) || '/';
    const route = this.routes[hash];

    if (!route) {
      // Redirect unknown routes to home
      window.location.hash = '#/';
      return;
    }

    this.currentRoute = hash;

    // Update page title
    document.title = route.title;

    // Update active nav link
    this.updateActiveNav(hash);

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
              <a href="#/" class="btn btn-primary">Go Home</a>
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
  updateActiveNav(hash) {
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${hash}`) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
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
