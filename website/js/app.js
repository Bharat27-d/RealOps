// ============================================================
// RealOps — Main Application
// History API SPA Router, Scroll Animations, Counter Animations
// ============================================================

const App = {
  // ── Route definitions ──
  routes: {
    '/': { page: () => HomePage, title: 'RealOps — Professional Real Operation', afterRender: null },
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

    // Set up background audio player
    this.initAudioPlayer();

    // Set up floating back-to-top button
    this.initScrollTop();

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
    let path = window.location.pathname || '/';

    // Normalize path (.html removal or index.html handling)
    if (path.endsWith('/index.html')) path = '/';
    else path = path.replace(/\.html$/, '');

    // Check hash-based fallback if pathname is root
    if (path === '/' && window.location.hash) {
      const hashPath = window.location.hash.replace(/^#\/?/, '/');
      if (this.routes[hashPath]) {
        path = hashPath;
      }
    }

    let route = this.routes[path];

    if (!route) {
      // Fallback to home route if invalid path
      path = '/';
      route = this.routes['/'];
      window.history.replaceState(null, '', '/');
    }

    this.currentRoute = path;

    // Update page title
    document.title = route.title;

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
  },

  // ── Navbar Scroll & Scroll Progress Line ──
  initNavScroll() {
    const navbar = document.querySelector('.navbar');
    const progressBar = document.getElementById('scroll-progress-bar');

    const onScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

      if (progressBar) {
        progressBar.style.width = `${scrollPercent}%`;
      }

      if (navbar) {
        if (scrollTop > 20) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
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

  // ── Background Audio Player Engine ──
  bgAudio: null,
  isAudioPlaying: false,
  currentTrackIndex: 0,
  tracks: [
    { title: 'Amber Skies — VXLLAIN', url: 'assets/audio/amber-skies.mp3' },
    { title: 'waves — MoonlightFM', url: 'assets/audio/waves.mp3' },
    { title: 'slow dance — MoonlightFM', url: 'assets/audio/slow-dance.mp3' },
    { title: 'Solaris — Ixst child', url: 'assets/audio/solaris.mp3' }
  ],

  initAudioPlayer() {
    const dockContainer = document.getElementById('audio-dock-container');
    const dockToggle = document.getElementById('audio-dock-toggle');
    const toggleIcon = document.getElementById('dock-toggle-icon');
    const dockTrack = document.getElementById('audio-dock-track');
    const prevDockBtn = document.getElementById('audio-prev-btn');
    const playPauseDockBtn = document.getElementById('audio-play-pause-btn');
    const playDockIcon = document.getElementById('audio-play-icon');
    const nextDockBtn = document.getElementById('audio-next-dock-btn');
    const volumeSlider = document.getElementById('audio-volume-slider');
    const volumePercentage = document.getElementById('volume-percentage');
    const volumeIcon = document.getElementById('volume-icon');

    if (!dockContainer) return;

    const initialTrack = this.tracks[this.currentTrackIndex];
    this.bgAudio = new Audio(initialTrack.url);
    this.bgAudio.loop = true;
    this.bgAudio.volume = 0.35;

    const updateTrackUI = () => {
      const cur = this.tracks[this.currentTrackIndex];
      if (dockTrack) dockTrack.textContent = cur.title;
    };

    updateTrackUI();

    const changeTrack = (delta = 1) => {
      this.currentTrackIndex = (this.currentTrackIndex + delta + this.tracks.length) % this.tracks.length;
      const nextTrack = this.tracks[this.currentTrackIndex];
      this.bgAudio.src = nextTrack.url;
      updateTrackUI();
      if (this.isAudioPlaying) {
        this.bgAudio.play().catch(() => {});
      }
      App.showToast(`📻 Track: ${nextTrack.title}`, 'success');
    };

    const togglePlayPause = () => {
      if (this.isAudioPlaying) {
        this.bgAudio.pause();
        this.isAudioPlaying = false;
        if (playPauseDockBtn) playPauseDockBtn.classList.remove('active');
        if (playDockIcon) playDockIcon.textContent = 'play_arrow';
        App.showToast('Radio Muted', 'info');
      } else {
        this.bgAudio.play().then(() => {
          this.isAudioPlaying = true;
          if (playPauseDockBtn) playPauseDockBtn.classList.add('active');
          if (playDockIcon) playDockIcon.textContent = 'pause';
          const cur = this.tracks[this.currentTrackIndex];
          App.showToast(`📻 Playing: ${cur.title}`, 'success');
        }).catch(err => {
          console.warn('Audio playback prevented by browser:', err);
          App.showToast('Click anywhere to start radio', 'error');
        });
      }
    };

    if (playPauseDockBtn) playPauseDockBtn.addEventListener('click', togglePlayPause);
    if (nextDockBtn) nextDockBtn.addEventListener('click', () => changeTrack(1));
    if (prevDockBtn) prevDockBtn.addEventListener('click', () => changeTrack(-1));

    // Volume Slider Handler
    if (volumeSlider) {
      volumeSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.bgAudio.volume = val;
        const pct = Math.round(val * 100);
        if (volumePercentage) volumePercentage.textContent = `${pct}%`;

        if (volumeIcon) {
          if (val === 0) volumeIcon.textContent = 'volume_off';
          else if (val < 0.5) volumeIcon.textContent = 'volume_down';
          else volumeIcon.textContent = 'volume_up';
        }
      });
    }

    // Dock Minimize / Expand Toggle
    if (dockToggle && dockContainer) {
      dockToggle.addEventListener('click', () => {
        dockContainer.classList.toggle('minimized');
      });
    }
  },

  // ── Scroll Reveal Animations & Card Mouse Spotlights ──
  initScrollAnimations() {
    // Card Spotlight Tracking
    document.querySelectorAll('.bento-card, .event-card, .team-card, .stat-card-modern').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });

    // Disconnect previous observer
    if (this.observer) {
      this.observer.disconnect();
    }

    const elements = document.querySelectorAll('.reveal, .reveal-scale');
    if (elements.length === 0) return;

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
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
  },

  // ── Scroll to Top Listener ──
  initScrollTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'auto';
      } else {
        btn.style.opacity = '0';
        btn.style.pointerEvents = 'none';
      }
    });
  }
};

// ── Boot ──
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
