// ============================================================
// RealOps — Floating Music Player
// Spotify-style mini player with playlist, visualizer, and volume
// ============================================================

const MusicPlayer = {
  // ── Playlist ──
  tracks: [
    { title: 'Amber Skies',  artist: 'RealOps Radio', src: 'assets/music/amber-skies.mp3' },
    { title: 'Slow Dance',   artist: 'RealOps Radio', src: 'assets/music/slow-dance.mp3' },
    { title: 'Solaris',      artist: 'RealOps Radio', src: 'assets/music/solaris.mp3' },
    { title: 'Waves',        artist: 'RealOps Radio', src: 'assets/music/waves.mp3' },
  ],

  currentIndex: 0,
  audio: null,
  isPlaying: false,
  isExpanded: false,
  isShuffle: false,
  repeatMode: 0, // 0 = off, 1 = all, 2 = one
  volume: 0.7,
  isSeeking: false,
  isVolumeAdjusting: false,
  animationFrame: null,

  // ── Initialize ──
  init() {
    this.audio = new Audio();
    this.audio.volume = this.volume;
    this.audio.preload = 'metadata';

    // Restore state from localStorage
    this.restoreState();

    // Load the current track (don't autoplay)
    this.loadTrack(this.currentIndex, false);

    // Bind DOM events
    this.bindEvents();

    // Initial UI state
    this.updateShuffleUI();
    this.updateRepeatUI();
  },

  // ── State Persistence ──
  restoreState() {
    try {
      const saved = localStorage.getItem('mp_state');
      if (saved) {
        const state = JSON.parse(saved);
        if (typeof state.index === 'number') this.currentIndex = state.index;
        if (typeof state.volume === 'number') {
          this.volume = state.volume;
          this.audio.volume = this.volume;
        }
        if (state.shuffle) this.isShuffle = true;
        if (typeof state.repeat === 'number') this.repeatMode = state.repeat;
        if (state.expanded) this.isExpanded = true;
      }
    } catch (e) { /* ignore parse errors */ }
  },

  saveState() {
    try {
      localStorage.setItem('mp_state', JSON.stringify({
        index: this.currentIndex,
        volume: this.volume,
        shuffle: this.isShuffle,
        repeat: this.repeatMode,
        expanded: this.isExpanded
      }));
    } catch (e) { /* ignore quota errors */ }
  },

  // ── Load Track ──
  loadTrack(index, autoplay = true) {
    if (index < 0 || index >= this.tracks.length) return;
    this.currentIndex = index;

    const track = this.tracks[index];
    this.audio.src = track.src;

    // Update UI
    const titleEl = document.getElementById('mp-title');
    const artistEl = document.getElementById('mp-artist');
    if (titleEl) titleEl.textContent = track.title;
    if (artistEl) artistEl.textContent = track.artist;

    // Reset progress
    this.updateProgress(0, 0);

    if (autoplay) {
      this.play();
    }

    this.saveState();
  },

  // ── Playback ──
  play() {
    const promise = this.audio.play();
    if (promise) {
      promise.then(() => {
        this.isPlaying = true;
        this.updatePlayIcon();
        this.startProgressLoop();
        this.startVisualizerAnimation();
        document.getElementById('mp-mini-bars')?.classList.add('playing');
      }).catch(() => {
        // Autoplay blocked — that's ok, user must interact first
      });
    }
  },

  pause() {
    this.audio.pause();
    this.isPlaying = false;
    this.updatePlayIcon();
    this.stopProgressLoop();
    this.stopVisualizerAnimation();
    document.getElementById('mp-mini-bars')?.classList.remove('playing');
  },

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  },

  // ── Next / Previous ──
  next() {
    let nextIndex;
    if (this.isShuffle) {
      nextIndex = Math.floor(Math.random() * this.tracks.length);
      if (nextIndex === this.currentIndex && this.tracks.length > 1) {
        nextIndex = (nextIndex + 1) % this.tracks.length;
      }
    } else {
      nextIndex = (this.currentIndex + 1) % this.tracks.length;
    }
    this.loadTrack(nextIndex, true);
  },

  prev() {
    // If more than 3s in, restart current track
    if (this.audio.currentTime > 3) {
      this.audio.currentTime = 0;
      return;
    }
    let prevIndex;
    if (this.isShuffle) {
      prevIndex = Math.floor(Math.random() * this.tracks.length);
    } else {
      prevIndex = (this.currentIndex - 1 + this.tracks.length) % this.tracks.length;
    }
    this.loadTrack(prevIndex, true);
  },

  // ── Shuffle / Repeat ──
  toggleShuffle() {
    this.isShuffle = !this.isShuffle;
    this.updateShuffleUI();
    this.saveState();
  },

  toggleRepeat() {
    this.repeatMode = (this.repeatMode + 1) % 3;
    this.updateRepeatUI();
    this.saveState();
  },

  updateShuffleUI() {
    const btn = document.getElementById('mp-shuffle');
    if (btn) {
      btn.classList.toggle('mp-btn-active', this.isShuffle);
    }
  },

  updateRepeatUI() {
    const btn = document.getElementById('mp-repeat');
    if (!btn) return;
    const icon = btn.querySelector('.material-symbols-outlined');
    btn.classList.toggle('mp-btn-active', this.repeatMode > 0);
    if (icon) {
      icon.textContent = this.repeatMode === 2 ? 'repeat_one' : 'repeat';
    }
  },

  // ── UI Updates ──
  updatePlayIcon() {
    const icon = document.getElementById('mp-play-icon');
    if (icon) {
      icon.textContent = this.isPlaying ? 'pause' : 'play_arrow';
    }
  },

  updateProgress(current, total) {
    const fill = document.getElementById('mp-progress-fill');
    const thumb = document.getElementById('mp-progress-thumb');
    const currentEl = document.getElementById('mp-time-current');
    const totalEl = document.getElementById('mp-time-total');

    const pct = total > 0 ? (current / total) * 100 : 0;

    if (fill) fill.style.width = pct + '%';
    if (thumb) thumb.style.left = pct + '%';
    if (currentEl) currentEl.textContent = this.formatTime(current);
    if (totalEl) totalEl.textContent = this.formatTime(total);
  },

  updateVolumeUI(vol) {
    const fill = document.getElementById('mp-volume-fill');
    const thumb = document.getElementById('mp-volume-thumb');
    const icon = document.getElementById('mp-vol-icon');

    const pct = vol * 100;
    if (fill) fill.style.width = pct + '%';
    if (thumb) thumb.style.left = pct + '%';

    if (icon) {
      if (vol === 0) icon.textContent = 'volume_off';
      else if (vol < 0.4) icon.textContent = 'volume_down';
      else icon.textContent = 'volume_up';
    }
  },

  formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins + ':' + (secs < 10 ? '0' : '') + secs;
  },

  // ── Progress Loop ──
  startProgressLoop() {
    this.stopProgressLoop();
    const loop = () => {
      if (!this.isSeeking) {
        this.updateProgress(this.audio.currentTime, this.audio.duration);
      }
      this.animationFrame = requestAnimationFrame(loop);
    };
    this.animationFrame = requestAnimationFrame(loop);
  },

  stopProgressLoop() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  },

  // ── Visualizer Animation ──
  startVisualizerAnimation() {
    const viz = document.getElementById('mp-visualizer');
    if (viz) viz.classList.add('active');
  },

  stopVisualizerAnimation() {
    const viz = document.getElementById('mp-visualizer');
    if (viz) viz.classList.remove('active');
  },

  // ── Expand / Collapse ──
  expand() {
    this.isExpanded = true;
    const player = document.getElementById('music-player');
    const card = document.getElementById('mp-card');
    const toggle = document.getElementById('mp-mini-toggle');

    if (player) player.classList.add('expanded');
    if (card) card.classList.add('visible');
    if (toggle) toggle.classList.add('hidden');

    this.saveState();
  },

  collapse() {
    this.isExpanded = false;
    const player = document.getElementById('music-player');
    const card = document.getElementById('mp-card');
    const toggle = document.getElementById('mp-mini-toggle');

    if (player) player.classList.remove('expanded');
    if (card) card.classList.remove('visible');
    if (toggle) toggle.classList.remove('hidden');

    this.saveState();
  },

  // ── Seeking (progress bar drag/click) ──
  seekTo(e, wrap) {
    const rect = wrap.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    if (this.audio.duration) {
      this.audio.currentTime = pct * this.audio.duration;
      this.updateProgress(this.audio.currentTime, this.audio.duration);
    }
  },

  // ── Volume drag/click ──
  setVolumeFromEvent(e, wrap) {
    const rect = wrap.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    this.volume = pct;
    this.audio.volume = pct;
    this.updateVolumeUI(pct);
    this.saveState();
  },

  toggleMute() {
    if (this.audio.volume > 0) {
      this._prevVolume = this.audio.volume;
      this.audio.volume = 0;
      this.volume = 0;
    } else {
      this.volume = this._prevVolume || 0.7;
      this.audio.volume = this.volume;
    }
    this.updateVolumeUI(this.audio.volume);
    this.saveState();
  },

  // ── Event Binding ──
  bindEvents() {
    // Play / Pause
    document.getElementById('mp-play')?.addEventListener('click', () => this.togglePlay());

    // Next / Prev
    document.getElementById('mp-next')?.addEventListener('click', () => this.next());
    document.getElementById('mp-prev')?.addEventListener('click', () => this.prev());

    // Shuffle / Repeat
    document.getElementById('mp-shuffle')?.addEventListener('click', () => this.toggleShuffle());
    document.getElementById('mp-repeat')?.addEventListener('click', () => this.toggleRepeat());

    // Expand / Collapse
    document.getElementById('mp-mini-toggle')?.addEventListener('click', () => this.expand());
    document.getElementById('mp-close')?.addEventListener('click', () => this.collapse());

    // Volume button (mute toggle)
    document.getElementById('mp-vol-btn')?.addEventListener('click', () => this.toggleMute());

    // Progress bar seeking
    const progressWrap = document.getElementById('mp-progress-wrap');
    if (progressWrap) {
      progressWrap.addEventListener('mousedown', (e) => {
        this.isSeeking = true;
        this.seekTo(e, progressWrap);
      });

      document.addEventListener('mousemove', (e) => {
        if (this.isSeeking) this.seekTo(e, progressWrap);
      });

      document.addEventListener('mouseup', () => {
        if (this.isSeeking) this.isSeeking = false;
      });

      // Touch support for progress
      progressWrap.addEventListener('touchstart', (e) => {
        this.isSeeking = true;
        this.seekTo(e.touches[0], progressWrap);
      }, { passive: true });

      document.addEventListener('touchmove', (e) => {
        if (this.isSeeking) this.seekTo(e.touches[0], progressWrap);
      }, { passive: true });

      document.addEventListener('touchend', () => {
        if (this.isSeeking) this.isSeeking = false;
      });
    }

    // Volume bar dragging
    const volWrap = document.getElementById('mp-volume-bar-wrap');
    if (volWrap) {
      volWrap.addEventListener('mousedown', (e) => {
        this.isVolumeAdjusting = true;
        this.setVolumeFromEvent(e, volWrap);
      });

      document.addEventListener('mousemove', (e) => {
        if (this.isVolumeAdjusting) this.setVolumeFromEvent(e, volWrap);
      });

      document.addEventListener('mouseup', () => {
        if (this.isVolumeAdjusting) this.isVolumeAdjusting = false;
      });

      // Touch support for volume
      volWrap.addEventListener('touchstart', (e) => {
        this.isVolumeAdjusting = true;
        this.setVolumeFromEvent(e.touches[0], volWrap);
      }, { passive: true });

      document.addEventListener('touchmove', (e) => {
        if (this.isVolumeAdjusting) this.setVolumeFromEvent(e.touches[0], volWrap);
      }, { passive: true });

      document.addEventListener('touchend', () => {
        if (this.isVolumeAdjusting) this.isVolumeAdjusting = false;
      });
    }

    // Audio events
    this.audio.addEventListener('ended', () => {
      if (this.repeatMode === 2) {
        // Repeat one
        this.audio.currentTime = 0;
        this.play();
      } else if (this.repeatMode === 1 || this.currentIndex < this.tracks.length - 1) {
        // Repeat all or not last track
        this.next();
      } else {
        // End of playlist, no repeat
        this.pause();
        this.updateProgress(0, this.audio.duration);
      }
    });

    this.audio.addEventListener('loadedmetadata', () => {
      this.updateProgress(0, this.audio.duration);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Don't trigger if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

      if (e.code === 'Space' && this.isExpanded) {
        e.preventDefault();
        this.togglePlay();
      }
    });

    // Initial volume UI
    this.updateVolumeUI(this.volume);

    // Restore expanded state
    if (this.isExpanded) {
      // Delay to allow DOM to render
      requestAnimationFrame(() => this.expand());
    }
  }
};

// Boot player when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  MusicPlayer.init();
});
