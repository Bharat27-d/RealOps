// ============================================================
// RealOps — API Service
// Fetches public data from the dashboard backend
// ============================================================

const API = (() => {
  // Configure the base URL dynamically based on environment
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const BASE_URL = isLocal ? 'http://localhost:3001/api/public' : 'https://api.realopsevents.com/api/public';
  const DASHBOARD_URL = isLocal ? 'http://localhost:3000' : 'https://dashboard.realopsevents.com';

  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  // ── Session cache helpers ──
  function getCached(key) {
    try {
      const raw = sessionStorage.getItem(`realops_${key}`);
      if (!raw) return null;
      const { data, timestamp } = JSON.parse(raw);
      if (Date.now() - timestamp > CACHE_TTL) {
        sessionStorage.removeItem(`realops_${key}`);
        return null;
      }
      return data;
    } catch {
      return null;
    }
  }

  function setCache(key, data) {
    try {
      sessionStorage.setItem(`realops_${key}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch {
      // sessionStorage might be full or unavailable
    }
  }

  // ── Generic fetch with caching ──
  async function fetchData(endpoint, cacheKey, disableCache = false) {
    // Try cache first
    if (!disableCache) {
      const cached = getCached(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.warn(`Failed to fetch ${endpoint}:`, error.message);
      // Return cached data even if expired, as fallback
      const stale = getCached(cacheKey);
      if (stale) return stale;
      return null;
    }
  }

  // ── Public API ──
  return {
    async getEvents() {
      return await fetchData('/events', 'events') || [];
    },

    async getStaff() {
      return await fetchData('/staff', 'staff') || [];
    },

    async getStats() {
      return await fetchData('/stats', 'stats') || {
        totalEvents: 0,
        completedEvents: 0,
        totalStaff: 0,
        activePartnerships: 0,
        foundedYear: 2021
      };
    },

    async getPartnerships() {
      return await fetchData('/partnerships', 'partnerships') || [];
    },

    async getRecruitment() {
      return await fetchData('/recruitment', 'recruitment', true) || [];
    },

    async submitContact(data) {
      try {
        const response = await fetch(`${BASE_URL}/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Submission failed');
        return await response.json();
      } catch (error) {
        console.error('Contact submission error:', error);
        throw error;
      }
    },

    // Prefetch all data in parallel (used on initial page load)
    getDashboardUrl: () => DASHBOARD_URL,
    getApiUrl: () => BASE_URL,

    async prefetchAll() {
      return Promise.allSettled([
        this.getEvents(),
        this.getStaff(),
        this.getStats(),
        this.getPartnerships(),
        this.getRecruitment()
      ]);
    }
  };
})();
