/**
 * Modern Glassmorphism Bento Navigation Application
 * Zero-build, pure standard ES6+, native Web Crypto API
 */

(function () {
  'use strict';

  const AUTO_LOCK_DELAY_MS = 3 * 60 * 1000;

  // Global State
  let navData = null;
  let activeEngine = localStorage.getItem('nav_active_engine') || 'google';
  let isUnlocked = false;
  let decryptedItems = null;
  let autoLockTimer = null;
  const colorSchemeMedia = window.matchMedia('(prefers-color-scheme: light)');

  // DOM Elements
  const searchInput = document.getElementById('search-input');
  const searchClearBtn = document.getElementById('search-clear-btn');
  const engineTabsContainer = document.getElementById('engine-tabs-container');
  const categoryNavList = document.getElementById('category-nav-list');
  const mainContent = document.getElementById('main-content');
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileSidebarCloseBtn = document.getElementById('mobile-sidebar-close-btn');
  const mobileThemeToggleBtn = document.getElementById('mobile-theme-toggle-btn');
  const sidebar = document.getElementById('sidebar');
  const sidebarBackdrop = document.getElementById('sidebar-backdrop');
  const sidebarCollapseBtn = document.getElementById('sidebar-collapse-btn');
  const desktopSidebarToggleBtn = document.getElementById('desktop-sidebar-toggle-btn');
  const collapseIcon = document.getElementById('collapse-icon');
  const brandLogoBtn = document.getElementById('brand-logo-btn');
  const brandLogoText = document.getElementById('brand-logo-text');
  const sidebarSubtitle = document.getElementById('sidebar-subtitle');
  const sidebarHitokotoRefreshBtn = document.getElementById('sidebar-hitokoto-refresh-btn');
  const toastContainer = document.getElementById('toast-container');
  const hitokotoText = document.getElementById('hitokoto-text');
  const hitokotoFrom = document.getElementById('hitokoto-from');
  const hitokotoRefreshBtn = document.getElementById('hitokoto-refresh-btn');
  const backToTopBtn = document.getElementById('back-to-top-btn');

  let scrollSpyInitialized = false;
  let scrollSpyTicking = false;
  let scrollLockTargetId = null;
  let scrollLockTimer = null;
  let settledPinY = null;
  let currentActiveCategoryId = null;

  // Vault Modal Elements
  const unlockModal = document.getElementById('unlock-modal');
  const unlockPasswordInput = document.getElementById('unlock-password-input');
  const unlockSubmitBtn = document.getElementById('unlock-submit-btn');
  const unlockCancelBtn = document.getElementById('unlock-cancel-btn');
  const togglePasswordVisibility = document.getElementById('toggle-password-visibility');
  const togglePasswordIcon = document.getElementById('toggle-password-icon');

  // Fallback Hitokoto Quotes
  const fallbackShortQuotes = [
    { hitokoto: '心有猛虎，细嗅蔷薇。', from: '西格夫里·萨松' },
    { hitokoto: '星光不问赶路人。', from: '大冰' },
    { hitokoto: '生活原本沉闷，跑起来有风。', from: '网络' },
    { hitokoto: 'Stay hungry, stay foolish.', from: 'Steve Jobs' },
    { hitokoto: '代码即诗篇，探索无止境。', from: '个人导航' }
  ];

  const fallbackHeroQuotes = [
    { hitokoto: '每一个不曾起舞的日子，都是对生命的辜负。', from: '尼采' },
    { hitokoto: '生活原本沉闷，但跑起来就会有风。', from: '网络' },
    { hitokoto: '星光不问赶路人，岁月不负有心人。', from: '大冰' },
    { hitokoto: 'Stay hungry, stay foolish.', from: 'Steve Jobs' },
    { hitokoto: '愿你出走半生，归来仍是少年。', from: '网络' }
  ];

  // SVG Icons Helper
  const ICONS = {
    home: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>',
    film: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"/>',
    compass: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>',
    newspaper: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>',
    server: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"/>',
    'shield-check': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>',
    photo: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>',
    sparkles: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>',
    'lock-closed': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>',
    'lock-open': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"/>',
    external: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>',
    copy: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>',
    eye: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>',
    'eye-off': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>'
  };

  function getIconSvg(iconName, extraClass = 'w-4 h-4') {
    const path = ICONS[iconName] || ICONS.home;
    return `<svg class="${escapeHtml(extraClass)}" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">${path}</svg>`;
  }

  // Toast Notification (safe textContent; uses centralized polite live region on #toast-container)
  function showToast(message, type = 'info') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    const bgClass = type === 'success' ? 'bg-emerald-600/90 border-emerald-400/40 text-white' :
                    type === 'error' ? 'bg-rose-600/90 border-rose-400/40 text-white' :
                    'bg-indigo-600/90 border-indigo-400/40 text-white';

    toast.className = `flex items-center gap-2 px-4 py-2.5 rounded-xl border shadow-lg backdrop-blur-md text-sm font-medium transition-all duration-300 transform translate-y-2 opacity-0 ${bgClass}`;

    const span = document.createElement('span');
    span.textContent = String(message ?? '');
    toast.appendChild(span);
    toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    });

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  // Register Service Worker for PWA offline capability
  function registerServiceWorker() {
    if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.protocol === 'http:')) {
      navigator.serviceWorker.register('./sw.js').catch((err) => {
        console.warn('Service worker registration skipped:', err);
      });
    }
  }

  // Initialize App
  async function init() {
    initTheme();
    initSidebarState();
    setupEventListeners();
    registerServiceWorker();
    await loadNavigationData();
    fetchHeroHitokoto();
    if (!getCustomSubtitle()) {
      fetchSidebarHitokoto();
    }
  }

  // Sidebar Collapse Management
  function initSidebarState() {
    const isCollapsed = localStorage.getItem('sidebar_collapsed') === 'true';
    if (isCollapsed) {
      sidebar.classList.add('is-collapsed');
      if (collapseIcon) collapseIcon.classList.add('rotated');
    }
    syncSidebarExpandedAria(isCollapsed);
  }

  function syncSidebarExpandedAria(isCollapsed) {
    const expanded = isCollapsed ? 'false' : 'true';
    if (sidebarCollapseBtn) sidebarCollapseBtn.setAttribute('aria-expanded', expanded);
    if (desktopSidebarToggleBtn) desktopSidebarToggleBtn.setAttribute('aria-expanded', expanded);
  }

  function toggleSidebarCollapse() {
    const isNowCollapsed = sidebar.classList.toggle('is-collapsed');
    if (collapseIcon) {
      collapseIcon.classList.toggle('rotated', isNowCollapsed);
    }
    syncSidebarExpandedAria(isNowCollapsed);
    localStorage.setItem('sidebar_collapsed', isNowCollapsed ? 'true' : 'false');
  }

  // Theme Management (respects system preference changes + cross-tab storage sync)
  function getSavedTheme() {
    try {
      const val = localStorage.getItem('nav_theme');
      return val === 'light' || val === 'dark' ? val : null;
    } catch (_) {
      return null;
    }
  }

  function applyTheme(theme, persist = false) {
    const isLight = theme === 'light';
    document.documentElement.classList.toggle('light', isLight);
    document.documentElement.classList.toggle('dark', !isLight);

    const colorSchemeMeta = document.querySelector('meta[name="color-scheme"]');
    const saved = persist ? theme : getSavedTheme();
    if (colorSchemeMeta) {
      colorSchemeMeta.setAttribute('content', saved ? saved : 'light dark');
    }

    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', isLight ? '#f8fafc' : '#030712');
    }
  }

  function initTheme() {
    const savedTheme = getSavedTheme();
    applyTheme(savedTheme || (colorSchemeMedia.matches ? 'light' : 'dark'));

    colorSchemeMedia.addEventListener('change', (e) => {
      if (!getSavedTheme()) {
        applyTheme(e.matches ? 'light' : 'dark');
      }
    });

    window.addEventListener('storage', (e) => {
      if (e.key === 'nav_theme') {
        const next = e.newValue === 'light' || e.newValue === 'dark'
          ? e.newValue
          : (colorSchemeMedia.matches ? 'light' : 'dark');
        applyTheme(next);
      }
    });
  }

  function toggleTheme() {
    const currentlyLight = document.documentElement.classList.contains('light');
    const targetTheme = currentlyLight ? 'dark' : 'light';
    const systemTheme = colorSchemeMedia.matches ? 'light' : 'dark';
    try {
      if (targetTheme === systemTheme) {
        localStorage.removeItem('nav_theme');
        applyTheme(targetTheme, false);
      } else {
        localStorage.setItem('nav_theme', targetTheme);
        applyTheme(targetTheme, true);
      }
    } catch (_) {
      applyTheme(targetTheme, false);
    }
  }

  // Sync page title, headings, footer, logo, and active search engine from links.json
  function applySiteMetadata() {
    if (!navData) return;
    const site = navData.site || {};

    if (site.title) {
      const sidebarTitle = document.getElementById('sidebar-site-title');
      const mobileTitle = document.getElementById('mobile-site-title');
      if (sidebarTitle) sidebarTitle.textContent = site.title;
      if (mobileTitle) mobileTitle.textContent = site.title;
      document.title = site.pageTitle || (site.author ? `${site.author} · ${site.title}` : site.title);
    }

    if (brandLogoText && site.logoText) {
      brandLogoText.textContent = site.logoText;
    }

    if (site.footerText) {
      const footerEl = document.getElementById('site-footer-text');
      if (footerEl) footerEl.textContent = site.footerText;
    }

    if (Array.isArray(navData.searchEngines) && navData.searchEngines.length > 0) {
      const matched = navData.searchEngines.find((e) => e.id === activeEngine) || navData.searchEngines[0];
      activeEngine = matched.id;
      localStorage.setItem('nav_active_engine', activeEngine);
      if (searchInput) {
        searchInput.placeholder = matched.placeholder || `使用 ${matched.name} 搜索全网，或输入关键词过滤书签...`;
      }
    }
  }

  // Load Data
  async function loadNavigationData() {
    try {
      const response = await fetch('./links.json', { cache: 'no-cache' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      navData = await response.json();
      applySiteMetadata();
      renderSidebarSubtitle();
      renderAll();
    } catch (err) {
      console.warn('Could not load links.json:', err);
      const isFileProtocol = window.location.protocol === 'file:';
      const hint = isFileProtocol
        ? '检测到当前通过 file:// 直接打开本地文件，浏览器安全策略会阻止读取 links.json，请使用本地 HTTP 服务（如 npx serve 或部署到静态托管）访问。'
        : `加载 links.json 失败 (${err.message})，请检查网络连接或配置文件格式。`;

      if (categoryNavList) {
        const errDiv = document.createElement('div');
        errDiv.className = 'py-4 text-center text-xs text-rose-400';
        errDiv.textContent = '配置加载失败';
        categoryNavList.replaceChildren(errDiv);
      }
      if (mainContent) {
        const card = document.createElement('div');
        card.className = 'glass-card rounded-2xl p-6 sm:p-8 max-w-lg mx-auto my-10 text-center border border-rose-500/30';

        const heading = document.createElement('h2');
        heading.className = 'text-base font-bold text-[var(--card-text-primary)] mb-2';
        heading.textContent = '导航数据加载失败';

        const para = document.createElement('p');
        para.className = 'text-xs text-[var(--card-text-secondary)] leading-relaxed mb-4';
        para.textContent = hint;

        const retryBtn = document.createElement('button');
        retryBtn.type = 'button';
        retryBtn.id = 'retry-load-btn';
        retryBtn.className = 'px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer';
        retryBtn.textContent = '重新加载';

        card.append(heading, para, retryBtn);
        mainContent.replaceChildren(card);
      }
      showToast('导航数据加载失败，请检查配置或访问方式', 'error');
    }
  }

  // Check if custom subtitle is set in links.json
  function getCustomSubtitle() {
    if (navData && navData.site && typeof navData.site.subtitle === 'string' && navData.site.subtitle.trim() !== '') {
      return navData.site.subtitle.trim();
    }
    return null;
  }

  // Construct Hitokoto API URL from config (supports maxLength, minLength, types)
  function buildHitokotoUrl(config = {}) {
    const params = new URLSearchParams();
    params.set('encode', 'json');
    if (config.maxLength && typeof config.maxLength === 'number' && config.maxLength > 0) {
      params.set('max_length', config.maxLength);
    }
    if (config.minLength && typeof config.minLength === 'number' && config.minLength > 0) {
      params.set('min_length', config.minLength);
    }
    if (Array.isArray(config.types) && config.types.length > 0) {
      config.types.forEach((t) => params.append('c', t));
    }
    return `https://v1.hitokoto.cn/?${params.toString()}`;
  }

  function renderSidebarSubtitle(quote, from) {
    if (!sidebarSubtitle) return;
    const custom = getCustomSubtitle();
    if (custom) {
      sidebarSubtitle.textContent = custom;
      sidebarSubtitle.title = custom;
      if (sidebarHitokotoRefreshBtn) sidebarHitokotoRefreshBtn.classList.add('hidden');
    } else {
      if (sidebarHitokotoRefreshBtn) sidebarHitokotoRefreshBtn.classList.remove('hidden');
      if (quote) {
        sidebarSubtitle.style.opacity = '0';
        setTimeout(() => {
          sidebarSubtitle.textContent = quote;
          sidebarSubtitle.title = `“${quote}” —— ${from || '一言'} (点击换一言)`;
          sidebarSubtitle.style.opacity = '1';
        }, 150);
      } else {
        sidebarSubtitle.textContent = '加载一言中...';
        sidebarSubtitle.title = '点击换一言';
      }
    }
  }

  // Hero Hitokoto
  async function fetchHeroHitokoto() {
    if (!hitokotoText) return;
    try {
      if (hitokotoRefreshBtn) hitokotoRefreshBtn.classList.add('animate-spin');
      const heroConfig = navData?.site?.hitokoto?.hero || navData?.site?.heroHitokoto || {};
      const apiUrl = buildHitokotoUrl(heroConfig);
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error('API offline');
      const data = await response.json();
      displayHitokoto(data.hitokoto, data.from_who || data.from || '未知');
    } catch (_) {
      const random = fallbackHeroQuotes[Math.floor(Math.random() * fallbackHeroQuotes.length)];
      displayHitokoto(random.hitokoto, random.from);
    } finally {
      if (hitokotoRefreshBtn) {
        setTimeout(() => hitokotoRefreshBtn.classList.remove('animate-spin'), 600);
      }
    }
  }

  // Sidebar Hitokoto
  async function fetchSidebarHitokoto() {
    if (!sidebarSubtitle || getCustomSubtitle()) return;
    try {
      if (sidebarHitokotoRefreshBtn) sidebarHitokotoRefreshBtn.classList.add('animate-spin');
      const sidebarConfig = navData?.site?.hitokoto?.sidebar || navData?.site?.sidebarHitokoto || { maxLength: 12, types: ['d', 'i', 'k'] };
      const apiUrl = buildHitokotoUrl(sidebarConfig);
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error('API offline');
      const data = await response.json();
      const quote = data.hitokoto;
      const from = data.from_who || data.from || '未知';
      renderSidebarSubtitle(quote, from);
    } catch (_) {
      const random = fallbackShortQuotes[Math.floor(Math.random() * fallbackShortQuotes.length)];
      renderSidebarSubtitle(random.hitokoto, random.from);
    } finally {
      if (sidebarHitokotoRefreshBtn) {
        setTimeout(() => sidebarHitokotoRefreshBtn.classList.remove('animate-spin'), 600);
      }
    }
  }

  function displayHitokoto(quote, from) {
    hitokotoText.style.opacity = '0';
    hitokotoFrom.style.opacity = '0';
    setTimeout(() => {
      hitokotoText.textContent = `${quote}`;
      hitokotoFrom.textContent = `—— ${from}`;
      hitokotoText.style.opacity = '1';
      hitokotoFrom.style.opacity = '1';
    }, 200);
  }

  // Render Engine Pill Tabs
  function renderEngineTabs() {
    if (!navData || !navData.searchEngines || !engineTabsContainer) return;
    const engines = navData.searchEngines;
    let html = '';
    engines.forEach((eng) => {
      const isActive = eng.id === activeEngine;
      const activeClass = isActive
        ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30'
        : 'text-[var(--card-text-secondary)] hover:text-[var(--card-text-primary)] hover:bg-white/5';
      html += `
        <button type="button" aria-pressed="${isActive ? 'true' : 'false'}" class="engine-tab px-3 py-1 rounded-xl text-xs transition-colors cursor-pointer ${activeClass}" data-engine="${escapeHtml(eng.id)}" data-name="${escapeHtml(eng.name)}" data-placeholder="${escapeHtml(eng.placeholder || '')}">
          ${escapeHtml(eng.name)}
        </button>
      `;
    });
    engineTabsContainer.innerHTML = html;
  }

  // Render Sidebar and Categories
  function renderAll() {
    if (!navData) return;
    renderEngineTabs();
    renderSidebarNav();
    renderContentCategories();
  }

  function renderSidebarVaultHtml() {
    if (!navData || !navData.encryptedVault) return '';
    const v = navData.encryptedVault;
    const safeId = escapeHtml(v.id || 'private-vault');
    const safeName = escapeHtml(v.name || '私密站点');
    return `
      <a href="#${safeId}" title="${safeName}" class="sidebar-nav-item sidebar-vault-item flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium text-amber-600 dark:text-amber-300/90 hover:text-amber-700 dark:hover:text-amber-200 hover:bg-amber-500/10 transition-colors group border border-amber-500/25">
        <span class="sidebar-icon-badge p-1.5 rounded-lg bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 shrink-0">
          ${getIconSvg(isUnlocked ? 'lock-open' : 'lock-closed', 'w-4 h-4')}
        </span>
        <span class="truncate flex-1 sidebar-hide-on-collapse">${safeName}</span>
        <span class="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 sidebar-hide-on-collapse">
          ${isUnlocked ? '已解锁' : '加密'}
        </span>
      </a>
    `;
  }

  function renderSidebarNav() {
    let html = '';

    (navData.categories || []).forEach((cat) => {
      const safeId = escapeHtml(cat.id);
      const safeName = escapeHtml(cat.name);
      const count = Array.isArray(cat.items) ? cat.items.length : 0;
      html += `
        <a href="#${safeId}" title="${safeName} (${count})" class="sidebar-nav-item flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[var(--card-text-secondary)] hover:text-[var(--card-text-primary)] hover:bg-white/5 transition-colors group border border-transparent">
          <span class="sidebar-icon-badge p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-300 transition-colors shrink-0">
            ${getIconSvg(cat.icon, 'w-4 h-4')}
          </span>
          <span class="truncate flex-1 sidebar-hide-on-collapse">${safeName}</span>
          <span class="text-[11px] px-1.5 py-0.5 rounded-md bg-white/5 text-[var(--card-text-secondary)] font-mono sidebar-hide-on-collapse">${count}</span>
        </a>
      `;
    });

    if (navData.encryptedVault) {
      html += `<div id="sidebar-vault-wrapper" class="pt-2 mt-2 border-t border-[var(--glass-border)]">${renderSidebarVaultHtml()}</div>`;
    }

    categoryNavList.innerHTML = html;
  }

  function renderContentCategories() {
    let html = '';

    (navData.categories || []).forEach((cat) => {
      const safeId = escapeHtml(cat.id);
      const safeName = escapeHtml(cat.name);
      const safeBadge = escapeHtml(cat.badge || '');
      const items = Array.isArray(cat.items) ? cat.items : [];
      html += `
        <section id="${safeId}" class="category-section scroll-mt-16 lg:scroll-mt-5 mb-6">
          <div class="flex items-center justify-between mb-3 pb-1.5 border-b border-[var(--glass-border)]">
            <div class="flex items-center gap-2.5">
              <span class="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                ${getIconSvg(cat.icon, 'w-4 h-4')}
              </span>
              <div>
                <h3 class="text-sm font-semibold text-[var(--card-text-primary)] flex items-center gap-2">
                  <span>${safeName}</span>
                  <span class="text-xs font-normal px-2 py-0.5 rounded-full bg-white/5 text-[var(--card-text-secondary)] font-mono">${items.length}</span>
                </h3>
              </div>
            </div>
            ${safeBadge ? `<span class="text-[11px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-md bg-white/5 text-[var(--card-text-secondary)] hidden sm:inline-block">${safeBadge}</span>` : ''}
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2.5">
            ${items.map((item) => renderBookmarkCard(item)).join('')}
          </div>
        </section>
      `;
    });

    if (navData.encryptedVault) {
      html += renderVaultSection();
    }

    mainContent.innerHTML = html;
    currentActiveCategoryId = null;
    initScrollSpy();
  }

  // Refresh only the vault section & sidebar vault item, preserving search and scroll state
  function refreshVaultUI() {
    if (!navData || !navData.encryptedVault) return;
    const vaultId = navData.encryptedVault.id || 'private-vault';

    const sidebarVaultWrapper = document.getElementById('sidebar-vault-wrapper');
    if (sidebarVaultWrapper) {
      sidebarVaultWrapper.innerHTML = renderSidebarVaultHtml();
    }

    const existingSection = document.getElementById(vaultId);
    const newVaultHtml = renderVaultSection();
    if (existingSection) {
      existingSection.outerHTML = newVaultHtml;
    } else if (mainContent) {
      mainContent.insertAdjacentHTML('beforeend', newVaultHtml);
    }

    if (searchInput && searchInput.value.trim()) {
      handleSearchInput();
    } else {
      updateActiveCategoryOnScroll();
    }

    if (currentActiveCategoryId === vaultId) {
      setActiveSidebarItem(vaultId, true);
    }
  }

  // Deterministic colorful gradient palettes for bookmark icons without image
  function getInitialBadgeStyle(text) {
    const palettes = [
      { bg: 'from-emerald-500/20 to-teal-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
      { bg: 'from-blue-500/20 to-indigo-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
      { bg: 'from-purple-500/20 to-pink-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
      { bg: 'from-amber-500/20 to-orange-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
      { bg: 'from-rose-500/20 to-red-500/20', text: 'text-rose-400', border: 'border-rose-500/30' },
      { bg: 'from-cyan-500/20 to-sky-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' }
    ];
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % palettes.length;
    return palettes[idx];
  }

  function getHeaderScrollOffset() {
    if (window.innerWidth < 1024) {
      const mobileHeader = document.querySelector('main > header');
      return (mobileHeader ? mobileHeader.offsetHeight : 56) + 12;
    }
    return 20;
  }

  function setActiveSidebarItem(id, force = false) {
    if (!id) return;
    if (!force && id === currentActiveCategoryId) return;
    currentActiveCategoryId = id;
    document.querySelectorAll('.sidebar-nav-item').forEach((item) => {
      const isMatch = item.getAttribute('href') === `#${id}`;
      item.classList.toggle('active', isMatch);
      if (isMatch && categoryNavList) {
        const navRect = categoryNavList.getBoundingClientRect();
        const itemRect = item.getBoundingClientRect();
        if (itemRect.top < navRect.top) {
          categoryNavList.scrollTop -= (navRect.top - itemRect.top) + 6;
        } else if (itemRect.bottom > navRect.bottom) {
          categoryNavList.scrollTop += (itemRect.bottom - navRect.bottom) + 6;
        }
      }
    });
  }

  function updateActiveCategoryOnScroll() {
    const sections = Array.from(document.querySelectorAll('.category-section'))
      .filter((sec) => !sec.classList.contains('hidden') && sec.offsetParent !== null);
    if (!sections.length) return;

    const scrollTop = window.scrollY;
    const viewportHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;

    if (scrollTop <= 30) {
      setActiveSidebarItem(sections[0].id);
      return;
    }

    if (scrollTop + viewportHeight >= docHeight - 8) {
      setActiveSidebarItem(sections[sections.length - 1].id);
      return;
    }

    const triggerY = getHeaderScrollOffset() + 80;
    let activeId = sections[0].id;
    for (let i = 0; i < sections.length; i++) {
      const rect = sections[i].getBoundingClientRect();
      if (rect.top <= triggerY) {
        activeId = sections[i].id;
      } else {
        break;
      }
    }
    setActiveSidebarItem(activeId);
  }

  function initScrollSpy() {
    if (!scrollSpyInitialized) {
      scrollSpyInitialized = true;

      const releaseScrollPin = () => {
        scrollLockTargetId = null;
        settledPinY = null;
        if (scrollLockTimer) {
          clearTimeout(scrollLockTimer);
          scrollLockTimer = null;
        }
      };

      window.addEventListener('wheel', releaseScrollPin, { passive: true });
      window.addEventListener('touchstart', releaseScrollPin, { passive: true });
      window.addEventListener('keydown', (e) => {
        if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key)) {
          if (!isEditableElement(document.activeElement)) {
            releaseScrollPin();
          }
        }
      });

      window.addEventListener('scrollend', () => {
        if (scrollLockTargetId) {
          scrollLockTargetId = null;
          settledPinY = window.scrollY;
          if (scrollLockTimer) {
            clearTimeout(scrollLockTimer);
            scrollLockTimer = null;
          }
        }
      });

      window.addEventListener('scroll', () => {
        if (scrollLockTargetId) return;
        if (settledPinY !== null) {
          if (Math.abs(window.scrollY - settledPinY) <= 12) return;
          settledPinY = null;
        }
        if (!scrollSpyTicking) {
          scrollSpyTicking = true;
          requestAnimationFrame(() => {
            updateActiveCategoryOnScroll();
            scrollSpyTicking = false;
          });
        }
      }, { passive: true });
    }

    if (!scrollLockTargetId && settledPinY === null) {
      updateActiveCategoryOnScroll();
    }
  }

  function renderBookmarkCard(item) {
    const title = String(item?.title || '未命名');
    const description = String(item?.description || '');
    const safeUrl = sanitizeUrl(item?.url);
    const initial = title.charAt(0).toUpperCase() || 'U';
    const domain = getDomain(safeUrl);
    const badge = getInitialBadgeStyle(title);
    const rawIcon = item?.icon && !String(item.icon).includes('avatar.png') ? sanitizeUrl(item.icon) : '';
    const hasIcon = rawIcon && rawIcon !== '#';

    return `
      <div class="bookmark-card glass-card rounded-xl px-2.5 py-2 sm:px-3 sm:py-2.5 flex items-center justify-between gap-2.5 group relative overflow-hidden" data-title="${escapeHtml(title)}" data-desc="${escapeHtml(description)}" data-url="${escapeHtml(safeUrl)}">
        <a href="${escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2.5 flex-1 min-w-0" title="${escapeHtml(title)}${description ? ' - ' + escapeHtml(description) : ''}">
          <!-- Compact Icon with Colorful Initial Fallback -->
          <div class="w-8 h-8 rounded-lg bg-gradient-to-tr ${badge.bg} border ${badge.border} flex items-center justify-center shrink-0 overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
            ${
              hasIcon
                ? `<img src="${escapeHtml(rawIcon)}" alt="${escapeHtml(title)}" loading="lazy" decoding="async" class="bookmark-icon-img w-full h-full object-cover" data-fallback-initial="${escapeHtml(initial)}" data-fallback-text-class="${escapeHtml(badge.text)}">`
                : `<span class="font-bold text-xs ${badge.text}">${escapeHtml(initial)}</span>`
            }
          </div>
          <!-- Title & Single Line Description -->
          <div class="overflow-hidden flex-1 min-w-0">
            <div class="text-xs font-semibold text-[var(--card-text-primary)] group-hover:text-indigo-400 transition-colors truncate flex items-center gap-1">
              <span class="truncate">${escapeHtml(title)}</span>
              <span class="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400 shrink-0" aria-hidden="true">↗</span>
            </div>
            <p class="text-[11px] text-[var(--card-text-secondary)] truncate leading-tight opacity-75 mt-0.5">
              ${escapeHtml(description || domain)}
            </p>
          </div>
        </a>

        <!-- Quick Copy Action Button -->
        <button type="button" class="copy-url-btn p-1 rounded-md opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:bg-white/10 hover:text-indigo-400 text-[var(--card-text-secondary)] transition-opacity shrink-0" data-url="${escapeHtml(safeUrl)}" aria-label="复制 ${escapeHtml(title)} 的网址" title="复制网址">
          ${getIconSvg('copy', 'w-3.5 h-3.5')}
        </button>
      </div>
    `;
  }

  function renderVaultSection() {
    const v = navData.encryptedVault;
    const safeId = escapeHtml(v.id || 'private-vault');
    const safeName = escapeHtml(v.name || '私密站点');
    const safeDesc = escapeHtml(v.description || '');
    const safeBadge = escapeHtml(v.badge ? `${v.badge} 密文封存` : 'AES-256 密文封存');

    if (isUnlocked && Array.isArray(decryptedItems)) {
      return `
        <section id="${safeId}" class="category-section scroll-mt-16 lg:scroll-mt-5 mb-6">
          <div class="flex items-center justify-between mb-3 pb-1.5 border-b border-amber-500/30">
            <div class="flex items-center gap-2.5">
              <span class="p-1.5 rounded-lg bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30">
                ${getIconSvg('lock-open', 'w-4 h-4')}
              </span>
              <div>
                <h3 class="text-sm font-semibold text-amber-700 dark:text-amber-200 flex items-center gap-2">
                  <span>${safeName}</span>
                  <span class="text-xs font-normal px-2 py-0.5 rounded-full bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono">${decryptedItems.length}</span>
                </h3>
                <p class="text-xs text-amber-700/80 dark:text-amber-300/70 mt-0.5">已通过 AES-256-GCM 密码学授权解锁（离开页面 3 分钟后自动上锁）</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button id="lock-vault-btn" type="button" class="text-xs px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 dark:bg-amber-500/20 dark:hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 font-medium transition-colors border border-amber-500/30 flex items-center gap-1.5 cursor-pointer">
                ${getIconSvg('lock-closed', 'w-3.5 h-3.5')}
                <span>重新上锁</span>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2.5">
            ${decryptedItems.map((item) => renderBookmarkCard(item)).join('')}
          </div>
        </section>
      `;
    }

    // Locked State
    return `
      <section id="${safeId}" class="category-section scroll-mt-16 lg:scroll-mt-5 mb-6">
        <div class="glass-card rounded-2xl p-4 sm:p-5 border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-transparent to-purple-500/5 relative overflow-hidden">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-amber-500/15 dark:bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-600 dark:text-amber-300 shadow-md shrink-0">
                ${getIconSvg('lock-closed', 'w-5 h-5')}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-base font-bold text-[var(--card-text-primary)]">${safeName}</h3>
                  <span class="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">${safeBadge}</span>
                </div>
                <p class="text-xs text-[var(--card-text-secondary)] mt-0.5 max-w-xl">
                  ${safeDesc}
                </p>
              </div>
            </div>
            <button id="trigger-unlock-btn" type="button" class="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold text-xs shadow-md shadow-amber-500/20 transition-all transform hover:-translate-y-0.5 flex items-center gap-1.5 shrink-0 cursor-pointer">
              ${getIconSvg('lock-open', 'w-3.5 h-3.5')}
              <span>输入密码解锁</span>
            </button>
          </div>
        </div>
      </section>
    `;
  }

  function lockVault(reasonMessage) {
    if (autoLockTimer) {
      clearTimeout(autoLockTimer);
      autoLockTimer = null;
    }
    if (!isUnlocked) return;
    isUnlocked = false;
    decryptedItems = null;
    refreshVaultUI();
    if (reasonMessage) {
      showToast(reasonMessage, 'info');
    }
  }

  // Copy text with fallback for non-HTTPS LAN environments
  function copyTextToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(() => legacyCopy(text));
    }
    return legacyCopy(text);
  }

  function legacyCopy(text) {
    return new Promise((resolve, reject) => {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.top = '-9999px';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const ok = document.execCommand('copy');
        textarea.remove();
        if (ok) resolve();
        else reject(new Error('execCommand failed'));
      } catch (err) {
        reject(err);
      }
    });
  }

  // Web Crypto AES-256-GCM Decryption via shared VaultCrypto module
  async function decryptVault(password) {
    if (!navData || !navData.encryptedVault) {
      return { ok: false, reason: 'NO_VAULT' };
    }
    if (!window.VaultCrypto) {
      return { ok: false, reason: 'MODULE_MISSING' };
    }

    try {
      const items = await window.VaultCrypto.decryptVault(password, navData.encryptedVault.crypto);
      decryptedItems = items;
      isUnlocked = true;
      return { ok: true };
    } catch (err) {
      if (err && err.code === 'CRYPTO_UNAVAILABLE') {
        console.warn('Web Crypto API unavailable:', err.message);
        return { ok: false, reason: 'CRYPTO_UNAVAILABLE' };
      }
      console.warn('Decryption failed: Authentication tag mismatch or invalid password.');
      return { ok: false, reason: 'INVALID_PASSWORD' };
    }
  }

  // Search Filter & Engine Redirection
  function handleSearchInput() {
    const query = searchInput.value.trim().toLowerCase();
    searchClearBtn.classList.toggle('hidden', !query);

    const cards = document.querySelectorAll('.bookmark-card');
    let matchCount = 0;

    cards.forEach((card) => {
      const title = (card.getAttribute('data-title') || '').toLowerCase();
      const desc = (card.getAttribute('data-desc') || '').toLowerCase();
      const url = (card.getAttribute('data-url') || '').toLowerCase();
      const isMatch = !query || title.includes(query) || desc.includes(query) || url.includes(query);

      card.classList.toggle('hidden', !isMatch);
      card.classList.toggle('flex', isMatch);
      if (isMatch) matchCount++;
    });

    // Hide empty category sections when searching (class-based, no inline style matching)
    document.querySelectorAll('.category-section').forEach((section) => {
      if (!query) {
        section.classList.remove('hidden');
      } else {
        const visibleCards = section.querySelectorAll('.bookmark-card:not(.hidden)');
        section.classList.toggle('hidden', visibleCards.length === 0);
      }
    });

    // Empty state handling when no local bookmarks match
    let emptyStateEl = document.getElementById('search-empty-state');
    if (!emptyStateEl) {
      emptyStateEl = document.createElement('div');
      emptyStateEl.id = 'search-empty-state';
      mainContent.appendChild(emptyStateEl);
    }

    if (query && matchCount === 0) {
      const engines = navData?.searchEngines || [];
      const targetEngine = engines.find((e) => e.id === activeEngine) || engines[0];
      const engineName = targetEngine ? targetEngine.name : '搜索引擎';
      emptyStateEl.className = 'py-10 px-4 text-center glass-card rounded-2xl border-white/10 max-w-md mx-auto my-6';

      const iconWrap = document.createElement('div');
      iconWrap.className = 'w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto mb-3 text-lg';
      iconWrap.setAttribute('aria-hidden', 'true');
      iconWrap.textContent = '🔍';

      const titleEl = document.createElement('h4');
      titleEl.className = 'text-sm font-semibold text-[var(--card-text-primary)]';
      titleEl.textContent = `未找到匹配 “${query}” 的书签`;

      const descEl = document.createElement('p');
      descEl.className = 'text-xs text-[var(--card-text-secondary)] mt-1.5 leading-relaxed';
      const kbd = document.createElement('kbd');
      kbd.className = 'px-1.5 py-0.5 rounded bg-white/10 font-bold text-indigo-400';
      kbd.textContent = 'Enter 回车';
      descEl.append('按 ', kbd, ` 直接使用 ${engineName} 全网检索`);

      const searchBtn = document.createElement('button');
      searchBtn.type = 'button';
      searchBtn.id = 'empty-state-search-btn';
      searchBtn.className = 'mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer';
      searchBtn.textContent = `使用 ${engineName} 全网搜索`;

      emptyStateEl.replaceChildren(iconWrap, titleEl, descEl, searchBtn);
      emptyStateEl.classList.remove('hidden');
    } else {
      emptyStateEl.classList.add('hidden');
    }

    if (!scrollLockTargetId && settledPinY === null) {
      updateActiveCategoryOnScroll();
    }
  }

  function handleSearchSubmit() {
    const query = searchInput.value.trim();
    if (!query) return;

    const engines = navData?.searchEngines || [];
    const targetEngine = engines.find((e) => e.id === activeEngine) || engines[0];
    if (targetEngine) {
      const targetUrl = sanitizeUrl(targetEngine.url);
      if (targetUrl !== '#') {
        window.open(targetUrl + encodeURIComponent(query), '_blank', 'noopener,noreferrer');
      }
    }
  }

  function isEditableElement(el) {
    if (!el) return false;
    const tag = el.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
  }

  function isComposingEvent(e) {
    return Boolean(e && (e.isComposing || e.keyCode === 229));
  }

  // Setup Global Event Listeners
  function setupEventListeners() {
    // Delegated click handlers inside mainContent (safe across partial re-renders)
    if (mainContent) {
      mainContent.addEventListener('click', (e) => {
        const copyBtn = e.target.closest('.copy-url-btn');
        if (copyBtn) {
          e.preventDefault();
          e.stopPropagation();
          const url = copyBtn.getAttribute('data-url');
          if (url && url !== '#') {
            copyTextToClipboard(url)
              .then(() => showToast('已复制网址到剪贴板', 'success'))
              .catch(() => showToast('复制失败，请手动复制', 'error'));
          }
          return;
        }

        if (e.target.closest('#trigger-unlock-btn')) {
          openUnlockModal();
          return;
        }

        if (e.target.closest('#lock-vault-btn')) {
          lockVault('私密分类已安全重新上锁');
          return;
        }

        if (e.target.closest('#empty-state-search-btn')) {
          handleSearchSubmit();
          return;
        }

        if (e.target.closest('#retry-load-btn')) {
          loadNavigationData();
        }
      });

      // Capture-phase error fallback for bookmark icons (no inline onerror JS)
      mainContent.addEventListener('error', (e) => {
        const img = e.target;
        if (!img || img.tagName !== 'IMG' || !img.classList.contains('bookmark-icon-img')) return;
        const container = img.parentElement;
        if (!container) return;

        const initial = img.getAttribute('data-fallback-initial') || 'U';
        const textClass = img.getAttribute('data-fallback-text-class') || 'text-indigo-400';
        const span = document.createElement('span');
        span.className = `font-bold text-xs ${textClass}`;
        span.textContent = initial;
        container.replaceChildren(span);
      }, true);
    }

    // Delegated click for search engine tabs
    if (engineTabsContainer) {
      engineTabsContainer.addEventListener('click', (e) => {
        const tab = e.target.closest('.engine-tab');
        if (!tab) return;
        activeEngine = tab.getAttribute('data-engine');
        localStorage.setItem('nav_active_engine', activeEngine);
        const name = tab.getAttribute('data-name');
        const placeholder = tab.getAttribute('data-placeholder');
        searchInput.placeholder = placeholder || `使用 ${name} 搜索全网，或输入关键词过滤书签...`;
        renderEngineTabs();
        searchInput.focus();
      });
    }

    // Delegated click for sidebar category navigation
    if (categoryNavList) {
      categoryNavList.addEventListener('click', (e) => {
        const a = e.target.closest('a[href^="#"]');
        if (!a) return;
        const href = a.getAttribute('href') || '';
        closeMobileSidebar();
        const targetId = href.slice(1);
        const targetEl = document.getElementById(targetId);
        if (!targetEl) return;

        e.preventDefault();

        if (targetEl.classList.contains('hidden') && searchInput && searchInput.value.trim()) {
          searchInput.value = '';
          handleSearchInput();
        }

        scrollLockTargetId = targetId;
        settledPinY = null;
        if (scrollLockTimer) clearTimeout(scrollLockTimer);
        setActiveSidebarItem(targetId, true);

        const offset = getHeaderScrollOffset();
        const targetTop = Math.max(0, window.scrollY + targetEl.getBoundingClientRect().top - offset);
        window.scrollTo({ top: targetTop, behavior: 'smooth' });

        if (history.replaceState) {
          history.replaceState(null, '', `#${targetId}`);
        }

        scrollLockTimer = setTimeout(() => {
          scrollLockTargetId = null;
          settledPinY = window.scrollY;
        }, 850);
      });
    }

    // Search input
    searchInput.addEventListener('input', handleSearchInput);
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !isComposingEvent(e)) {
        handleSearchSubmit();
      }
    });

    searchClearBtn.addEventListener('click', () => {
      searchInput.value = '';
      handleSearchInput();
      searchInput.focus();
    });

    // Global keyboard shortcuts (native <dialog> handles Esc, focus containment, and focus return)
    window.addEventListener('keydown', (e) => {
      if (isComposingEvent(e)) return;
      if (unlockModal && unlockModal.open) return;

      if ((e.key === '/' || (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey))) && !isEditableElement(document.activeElement)) {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
      } else if (e.key === 'Escape' && document.activeElement === searchInput) {
        searchInput.value = '';
        handleSearchInput();
        searchInput.blur();
      }
    });

    // Theme Toggle
    themeToggleBtn.addEventListener('click', toggleTheme);

    if (mobileThemeToggleBtn) {
      mobileThemeToggleBtn.addEventListener('click', toggleTheme);
    }

    // Mobile Sidebar
    mobileMenuBtn.addEventListener('click', () => {
      const willOpen = sidebar.classList.contains('-translate-x-full');
      sidebar.classList.toggle('-translate-x-full', !willOpen);
      sidebarBackdrop.classList.toggle('hidden', !willOpen);
      mobileMenuBtn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    });

    if (mobileSidebarCloseBtn) {
      mobileSidebarCloseBtn.addEventListener('click', closeMobileSidebar);
    }

    sidebarBackdrop.addEventListener('click', closeMobileSidebar);

    // Desktop Sidebar Collapse & Expand
    if (sidebarCollapseBtn) {
      sidebarCollapseBtn.addEventListener('click', toggleSidebarCollapse);
    }
    if (desktopSidebarToggleBtn) {
      desktopSidebarToggleBtn.addEventListener('click', toggleSidebarCollapse);
    }
    if (brandLogoBtn) {
      brandLogoBtn.addEventListener('click', (e) => {
        if (sidebar.classList.contains('is-collapsed')) {
          e.preventDefault();
          toggleSidebarCollapse();
        }
      });
    }

    // Hitokoto Refresh
    if (hitokotoRefreshBtn) {
      hitokotoRefreshBtn.addEventListener('click', fetchHeroHitokoto);
    }
    if (sidebarHitokotoRefreshBtn) {
      sidebarHitokotoRefreshBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        fetchSidebarHitokoto();
      });
    }

    if (sidebarSubtitle) {
      sidebarSubtitle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!getCustomSubtitle()) {
          fetchSidebarHitokoto();
        }
      });
    }

    // Floating Back to Top Button
    if (backToTopBtn) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 250) {
          backToTopBtn.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-3');
        } else {
          backToTopBtn.classList.add('opacity-0', 'pointer-events-none', 'translate-y-3');
        }
      }, { passive: true });
      backToTopBtn.addEventListener('click', () => {
        scrollLockTargetId = null;
        settledPinY = null;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Anti-shoulder-surfing auto re-lock with grace timeout (avoids locking immediately when opening links)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && isUnlocked) {
        if (!autoLockTimer) {
          autoLockTimer = setTimeout(() => {
            autoLockTimer = null;
            if (document.hidden && isUnlocked) {
              lockVault('长时间离开页面，私密分类已自动重新上锁');
            }
          }, AUTO_LOCK_DELAY_MS);
        }
      } else if (!document.hidden && autoLockTimer) {
        clearTimeout(autoLockTimer);
        autoLockTimer = null;
      }
    });

    // Unlock Modal logic (native <dialog> + progressive fallback for closedby="any")
    unlockSubmitBtn.addEventListener('click', submitUnlock);
    unlockPasswordInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !isComposingEvent(e)) submitUnlock();
    });
    unlockCancelBtn.addEventListener('click', closeUnlockModal);
    if (unlockModal) {
      unlockModal.addEventListener('close', () => {
        unlockPasswordInput.value = '';
      });
      if (!('closedBy' in HTMLDialogElement.prototype)) {
        const isOutsideDialog = (e) => {
          const r = unlockModal.getBoundingClientRect();
          return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
        };
        let pressedOutside = false;
        unlockModal.addEventListener('pointerdown', (e) => {
          pressedOutside = isOutsideDialog(e);
        });
        unlockModal.addEventListener('pointerup', (e) => {
          if (pressedOutside && isOutsideDialog(e)) closeUnlockModal();
          pressedOutside = false;
        });
      }
    }

    togglePasswordVisibility.addEventListener('click', () => {
      const show = unlockPasswordInput.type === 'password';
      unlockPasswordInput.type = show ? 'text' : 'password';
      togglePasswordVisibility.setAttribute('aria-pressed', show ? 'true' : 'false');
      togglePasswordVisibility.setAttribute('aria-label', show ? '隐藏密码' : '显示密码');
      if (togglePasswordIcon) {
        togglePasswordIcon.innerHTML = show ? ICONS['eye-off'] : ICONS.eye;
      }
    });
  }

  function closeMobileSidebar() {
    sidebar.classList.add('-translate-x-full');
    sidebarBackdrop.classList.add('hidden');
    if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'false');
  }

  function openUnlockModal() {
    unlockPasswordInput.value = '';
    unlockPasswordInput.type = 'password';
    if (togglePasswordVisibility) {
      togglePasswordVisibility.setAttribute('aria-pressed', 'false');
      togglePasswordVisibility.setAttribute('aria-label', '显示密码');
    }
    if (togglePasswordIcon) {
      togglePasswordIcon.innerHTML = ICONS.eye;
    }
    if (typeof unlockModal.showModal === 'function') {
      unlockModal.showModal();
    } else {
      unlockModal.setAttribute('open', '');
    }
    unlockPasswordInput.focus();
  }

  function closeUnlockModal() {
    if (typeof unlockModal.close === 'function') {
      if (unlockModal.open) unlockModal.close();
    } else {
      unlockModal.removeAttribute('open');
    }
  }

  async function submitUnlock() {
    const password = unlockPasswordInput.value;
    if (!password) {
      showToast('请输入解锁密码', 'error');
      unlockPasswordInput.focus();
      return;
    }

    unlockSubmitBtn.disabled = true;
    unlockSubmitBtn.textContent = '验证解密中...';

    const result = await decryptVault(password);

    unlockSubmitBtn.disabled = false;
    unlockSubmitBtn.textContent = '确定解锁';

    if (result.ok) {
      closeUnlockModal();
      refreshVaultUI();
      showToast('私密分类已成功解锁！', 'success');
    } else if (result.reason === 'CRYPTO_UNAVAILABLE') {
      showToast('当前环境不支持 Web Crypto API，请通过 HTTPS 或 localhost 访问', 'error');
    } else {
      unlockPasswordInput.classList.add('animate-shake', 'border-rose-500');
      setTimeout(() => unlockPasswordInput.classList.remove('animate-shake', 'border-rose-500'), 500);
      showToast('密码错误，解密失败', 'error');
    }
  }

  function sanitizeUrl(url, allowHash = false) {
    if (typeof url !== 'string') return '#';
    const trimmed = url.trim();
    if (!trimmed) return '#';
    if (allowHash && trimmed.startsWith('#')) return trimmed;
    if (/^(\.\/|\/(?!\/)|assets\/)/i.test(trimmed)) return trimmed;
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return parsed.href;
      }
    } catch (_) {
      return '#';
    }
    return '#';
  }

  function getDomain(url) {
    const fallbackHost = (() => {
      const homeUrl = navData?.site?.homeUrl;
      if (homeUrl) {
        try {
          return new URL(homeUrl).hostname;
        } catch (_) {
          // ignore
        }
      }
      return window.location.hostname || 'local';
    })();

    try {
      if (!url || url === '#' || url.startsWith('javascript:')) return fallbackHost;
      const u = new URL(url, window.location.href);
      return u.hostname || fallbackHost;
    } catch (_) {
      return url || fallbackHost;
    }
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
