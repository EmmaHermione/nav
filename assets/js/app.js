/**
 * Modern Glassmorphism Bento Navigation Application
 * Zero-build, pure standard ES6+, native Web Crypto API
 */

(function () {
  'use strict';

  // Global State
  let navData = null;
  let activeEngine = 'google';
  let isUnlocked = false;
  let decryptedItems = null;

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

  // Vault Modal Elements
  const unlockModal = document.getElementById('unlock-modal');
  const unlockPasswordInput = document.getElementById('unlock-password-input');
  const unlockSubmitBtn = document.getElementById('unlock-submit-btn');
  const unlockCancelBtn = document.getElementById('unlock-cancel-btn');
  const togglePasswordVisibility = document.getElementById('toggle-password-visibility');

  // Fallback Hitokoto Quotes
  const fallbackShortQuotes = [
    { hitokoto: "心有猛虎，细嗅蔷薇。", from: "西格夫里·萨松" },
    { hitokoto: "星光不问赶路人。", from: "大冰" },
    { hitokoto: "生活原本沉闷，跑起来有风。", from: "网络" },
    { hitokoto: "Stay hungry, stay foolish.", from: "Steve Jobs" },
    { hitokoto: "代码即诗篇，探索无止境。", from: "个人导航" }
  ];

  const fallbackHeroQuotes = [
    { hitokoto: "每一个不曾起舞的日子，都是对生命的辜负。", from: "尼采" },
    { hitokoto: "生活原本沉闷，但跑起来就会有风。", from: "网络" },
    { hitokoto: "星光不问赶路人，岁月不负有心人。", from: "大冰" },
    { hitokoto: "Stay hungry, stay foolish.", from: "Steve Jobs" },
    { hitokoto: "愿你出走半生，归来仍是少年。", from: "网络" }
  ];

  // SVG Icons Helper
  const ICONS = {
    home: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>`,
    film: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"/>`,
    compass: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>`,
    newspaper: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>`,
    server: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"/>`,
    'shield-check': `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>`,
    photo: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>`,
    sparkles: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>`,
    'lock-closed': `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>`,
    'lock-open': `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"/>`,
    external: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>`,
    copy: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>`
  };

  function getIconSvg(iconName, extraClass = 'w-4 h-4') {
    const path = ICONS[iconName] || ICONS.home;
    return `<svg class="${extraClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24">${path}</svg>`;
  }

  // Toast Notification
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    const bgClass = type === 'success' ? 'bg-emerald-600/90 border-emerald-400/40 text-white' :
                    type === 'error' ? 'bg-rose-600/90 border-rose-400/40 text-white' :
                    'bg-indigo-600/90 border-indigo-400/40 text-white';
    
    toast.className = `flex items-center gap-2 px-4 py-2.5 rounded-xl border shadow-lg backdrop-blur-md text-sm font-medium transition-all duration-300 transform translate-y-2 opacity-0 ${bgClass}`;
    toast.innerHTML = `<span>${message}</span>`;
    toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    });

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  // Initialize App
  async function init() {
    initTheme();
    initSidebarState();
    setupEventListeners();
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
  }

  function toggleSidebarCollapse() {
    const isNowCollapsed = sidebar.classList.toggle('is-collapsed');
    if (collapseIcon) {
      collapseIcon.classList.toggle('rotated', isNowCollapsed);
    }
    localStorage.setItem('sidebar_collapsed', isNowCollapsed ? 'true' : 'false');
  }

  // Theme Management
  function initTheme() {
    const savedTheme = localStorage.getItem('nav_theme') || 
      (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    setTheme(savedTheme);
  }

  function setTheme(theme) {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('nav_theme', theme);
  }

  // Load Data
  async function loadNavigationData() {
    try {
      const response = await fetch('./links.json');
      if (!response.ok) throw new Error('Failed to load links.json');
      navData = await response.json();
      renderSidebarSubtitle();
      renderAll();
    } catch (err) {
      console.warn('Could not load links.json directly via fetch:', err);
      // If run directly from file:// protocol where fetch is blocked, fallback will notify
      showToast('正在初始化导航数据...', 'info');
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
      config.types.forEach(t => params.append('c', t));
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

  // Hero Hitokoto (Search Section - No length limitation by default, fully configurable)
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
    } catch (err) {
      const random = fallbackHeroQuotes[Math.floor(Math.random() * fallbackHeroQuotes.length)];
      displayHitokoto(random.hitokoto, random.from);
    } finally {
      if (hitokotoRefreshBtn) {
        setTimeout(() => hitokotoRefreshBtn.classList.remove('animate-spin'), 600);
      }
    }
  }

  // Sidebar Hitokoto (Sidebar Header - Short sentences with word length limitation)
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
    } catch (err) {
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
    engines.forEach(eng => {
      const isActive = eng.id === activeEngine;
      const activeClass = isActive
        ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30'
        : 'text-[var(--card-text-secondary)] hover:text-[var(--card-text-primary)] hover:bg-white/5';
      html += `
        <button type="button" class="engine-tab px-3 py-1 rounded-xl text-xs transition-all cursor-pointer ${activeClass}" data-engine="${eng.id}" data-name="${eng.name}" data-placeholder="${eng.placeholder}">
          ${eng.name}
        </button>
      `;
    });
    engineTabsContainer.innerHTML = html;

    engineTabsContainer.querySelectorAll('.engine-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        activeEngine = tab.getAttribute('data-engine');
        const name = tab.getAttribute('data-name');
        const placeholder = tab.getAttribute('data-placeholder');
        searchInput.placeholder = placeholder || `使用 ${name} 搜索全网，或输入关键词过滤书签...`;
        renderEngineTabs();
        searchInput.focus();
      });
    });
  }

  // Render Sidebar and Categories
  function renderAll() {
    if (!navData) return;
    renderEngineTabs();
    renderSidebarNav();
    renderContentCategories();
  }

  function renderSidebarNav() {
    let html = '';
    
    // Regular Categories (tight, compact spacing)
    navData.categories.forEach(cat => {
      html += `
        <a href="#${cat.id}" title="${cat.name} (${cat.items.length})" class="sidebar-nav-item flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[var(--card-text-secondary)] hover:text-[var(--card-text-primary)] hover:bg-white/5 transition-all group border border-transparent">
          <span class="sidebar-icon-badge p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-300 transition-colors shrink-0">
            ${getIconSvg(cat.icon, 'w-4 h-4')}
          </span>
          <span class="truncate flex-1 sidebar-hide-on-collapse">${cat.name}</span>
          <span class="text-[11px] px-1.5 py-0.2 rounded-md bg-white/5 text-[var(--card-text-secondary)] font-mono sidebar-hide-on-collapse">${cat.items.length}</span>
        </a>
      `;
    });

    // Encrypted Vault Category in Sidebar (compact)
    if (navData.encryptedVault) {
      const v = navData.encryptedVault;
      html += `
        <div class="pt-2 mt-2 border-t border-[var(--glass-border)]">
          <a href="#${v.id}" title="${v.name}" class="sidebar-nav-item sidebar-vault-item flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium text-amber-500 dark:text-amber-300/90 hover:text-amber-600 dark:hover:text-amber-200 hover:bg-amber-500/10 transition-all group border border-amber-500/25">
            <span class="sidebar-icon-badge p-1.5 rounded-lg bg-amber-500/20 text-amber-500 dark:text-amber-300 shrink-0">
              ${getIconSvg(isUnlocked ? 'lock-open' : 'lock-closed', 'w-4 h-4')}
            </span>
            <span class="truncate flex-1 sidebar-hide-on-collapse">${v.name}</span>
            <span class="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-500 dark:text-amber-300 sidebar-hide-on-collapse">
              ${isUnlocked ? '已解锁' : '加密'}
            </span>
          </a>
        </div>
      `;
    }

    categoryNavList.innerHTML = html;

    // Smooth scroll + exact active lock on sidebar click
    categoryNavList.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href') || '';
        closeMobileSidebar();
        if (!href.startsWith('#')) return;
        const targetId = href.slice(1);
        const targetEl = document.getElementById(targetId);
        if (!targetEl) return;

        e.preventDefault();

        // If search filter hid this category, clear filter first
        if (targetEl.style.display === 'none' && searchInput && searchInput.value.trim()) {
          searchInput.value = '';
          handleSearchInput();
        }

        scrollLockTargetId = targetId;
        settledPinY = null;
        if (scrollLockTimer) clearTimeout(scrollLockTimer);
        setActiveSidebarItem(targetId);

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
    });
  }

  function renderContentCategories() {
    let html = '';

    navData.categories.forEach(cat => {
      html += `
        <section id="${cat.id}" class="category-section scroll-mt-16 lg:scroll-mt-5 mb-6">
          <div class="flex items-center justify-between mb-3 pb-1.5 border-b border-[var(--glass-border)]">
            <div class="flex items-center gap-2.5">
              <span class="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                ${getIconSvg(cat.icon, 'w-4 h-4')}
              </span>
              <div>
                <h3 class="text-sm font-semibold text-[var(--card-text-primary)] flex items-center gap-2">
                  <span>${cat.name}</span>
                  <span class="text-xs font-normal px-2 py-0.5 rounded-full bg-white/5 text-[var(--card-text-secondary)] font-mono">${cat.items.length}</span>
                </h3>
              </div>
            </div>
            <span class="text-[11px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-md bg-white/5 text-[var(--card-text-secondary)] hidden sm:inline-block">${cat.badge}</span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2.5">
            ${cat.items.map(item => renderBookmarkCard(item)).join('')}
          </div>
        </section>
      `;
    });

    // Render Encrypted Vault Section
    if (navData.encryptedVault) {
      html += renderVaultSection();
    }

    mainContent.innerHTML = html;
    attachCardListeners();
    initScrollSpy();
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

  function setActiveSidebarItem(id) {
    if (!id) return;
    document.querySelectorAll('.sidebar-nav-item').forEach(item => {
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
      .filter(sec => sec.offsetParent !== null);
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
          if (document.activeElement !== searchInput && document.activeElement !== unlockPasswordInput) {
            releaseScrollPin();
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
    const initial = (item.title || 'U').charAt(0).toUpperCase();
    const domain = getDomain(item.url);
    const badge = getInitialBadgeStyle(item.title || 'U');

    return `
      <div class="bookmark-card glass-card rounded-xl px-2.5 py-2 sm:px-3 sm:py-2.5 flex items-center justify-between gap-2.5 group relative overflow-hidden transition-all duration-200" data-title="${escapeHtml(item.title)}" data-desc="${escapeHtml(item.description)}" data-url="${escapeHtml(item.url)}">
        <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2.5 flex-1 min-w-0" title="${escapeHtml(item.title)}${item.description ? ' - ' + escapeHtml(item.description) : ''}">
          <!-- Compact Icon with Colorful Initial Fallback -->
          <div class="w-8 h-8 rounded-lg bg-gradient-to-tr ${badge.bg} border ${badge.border} flex items-center justify-center shrink-0 overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
            ${
              item.icon && !item.icon.includes('avatar.png')
                ? `<img src="${item.icon}" alt="${escapeHtml(item.title)}" class="w-full h-full object-cover" onerror="this.onerror=null; this.parentElement.innerHTML='<span class=\\'font-bold text-xs ${badge.text}\\'>${initial}</span>';">`
                : `<span class="font-bold text-xs ${badge.text}">${initial}</span>`
            }
          </div>
          <!-- Title & Single Line Description -->
          <div class="overflow-hidden flex-1 min-w-0">
            <div class="text-xs font-semibold text-[var(--card-text-primary)] group-hover:text-indigo-400 transition-colors truncate flex items-center gap-1">
              <span class="truncate">${escapeHtml(item.title)}</span>
              <span class="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400 shrink-0">↗</span>
            </div>
            <p class="text-[11px] text-[var(--card-text-secondary)] truncate leading-tight opacity-75 mt-0.5">
              ${escapeHtml(item.description || domain)}
            </p>
          </div>
        </a>

        <!-- Quick Copy Action Button (visible on hover, saves vertical space) -->
        <button type="button" class="copy-url-btn p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-white/10 hover:text-indigo-400 text-[var(--card-text-secondary)] transition-all shrink-0" data-url="${escapeHtml(item.url)}" title="复制网址">
          ${getIconSvg('copy', 'w-3.5 h-3.5')}
        </button>
      </div>
    `;
  }

  function renderVaultSection() {
    const v = navData.encryptedVault;
    if (isUnlocked && decryptedItems) {
      return `
        <section id="${v.id}" class="category-section scroll-mt-16 lg:scroll-mt-5 mb-6">
          <div class="flex items-center justify-between mb-3 pb-1.5 border-b border-amber-500/30">
            <div class="flex items-center gap-2.5">
              <span class="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ${getIconSvg('lock-open', 'w-4 h-4')}
              </span>
              <div>
                <h3 class="text-sm font-semibold text-amber-200 flex items-center gap-2">
                  <span>${v.name}</span>
                  <span class="text-xs font-normal px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">${decryptedItems.length}</span>
                </h3>
                <p class="text-xs text-amber-300/70 mt-0.5">已通过 AES-256-GCM 密码学授权解锁</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button id="lock-vault-btn" class="text-xs px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-medium transition-colors border border-amber-500/30 flex items-center gap-1.5">
                ${getIconSvg('lock-closed', 'w-3.5 h-3.5')}
                <span>重新上锁</span>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2.5">
            ${decryptedItems.map(item => renderBookmarkCard(item)).join('')}
          </div>
        </section>
      `;
    }

    // Locked State
    return `
      <section id="${v.id}" class="category-section scroll-mt-16 lg:scroll-mt-5 mb-6">
        <div class="glass-card rounded-2xl p-4 sm:p-5 border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-transparent to-purple-500/5 relative overflow-hidden">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-md shrink-0">
                ${getIconSvg('lock-closed', 'w-5 h-5')}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-base font-bold text-[var(--card-text-primary)]">${v.name}</h3>
                  <span class="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">AES-256 密文封存</span>
                </div>
                <p class="text-xs text-[var(--card-text-secondary)] mt-0.5 max-w-xl">
                  ${v.description}
                </p>
              </div>
            </div>
            <button id="trigger-unlock-btn" class="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold text-xs shadow-md shadow-amber-500/20 transition-all transform hover:-translate-y-0.5 flex items-center gap-1.5 shrink-0">
              ${getIconSvg('lock-open', 'w-3.5 h-3.5')}
              <span>输入密码解锁</span>
            </button>
          </div>
        </div>
      </section>
    `;
  }

  // Attach Event Handlers
  function attachCardListeners() {
    // Copy URL buttons
    document.querySelectorAll('.copy-url-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const url = btn.getAttribute('data-url');
        if (url) {
          navigator.clipboard.writeText(url).then(() => {
            showToast('已复制网址到剪贴板', 'success');
          }).catch(() => {
            showToast('复制失败，请手动复制', 'error');
          });
        }
      });
    });

    // Vault triggers
    const triggerUnlockBtn = document.getElementById('trigger-unlock-btn');
    if (triggerUnlockBtn) {
      triggerUnlockBtn.addEventListener('click', openUnlockModal);
    }

    const lockVaultBtn = document.getElementById('lock-vault-btn');
    if (lockVaultBtn) {
      lockVaultBtn.addEventListener('click', () => {
        isUnlocked = false;
        decryptedItems = null;
        renderAll();
        showToast('私密分类已安全重新上锁', 'info');
      });
    }
  }

  // Web Crypto AES-256-GCM Decryption (Mathematical Guarantee Against F12)
  async function decryptVault(password) {
    if (!navData || !navData.encryptedVault) return false;
    const cryptoData = navData.encryptedVault.crypto;

    try {
      const salt = hexToBytes(cryptoData.salt);
      const iv = hexToBytes(cryptoData.iv);
      const ciphertextWithTag = hexToBytes(cryptoData.ciphertext);

      const subtle = window.crypto.subtle;
      const pwKey = await subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      );

      const derivedKey = await subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: cryptoData.iterations || 100000,
          hash: 'SHA-256'
        },
        pwKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
      );

      const decryptedBuf = await subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        derivedKey,
        ciphertextWithTag
      );

      const jsonStr = new TextDecoder().decode(decryptedBuf);
      decryptedItems = JSON.parse(jsonStr);
      isUnlocked = true;
      return true;
    } catch (err) {
      // AES-GCM rejects automatically on wrong key or tampered ciphertext
      console.warn('Decryption failed: Authentication tag mismatch or invalid password.');
      return false;
    }
  }

  // Web Crypto AES-256-GCM Encryption (For Generator Tool)
  // Hex helpers
  function hexToBytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes;
  }

  function bytesToHex(bytes) {
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Search Filter & Engine Redirection
  function handleSearchInput(e) {
    const query = searchInput.value.trim().toLowerCase();
    searchClearBtn.classList.toggle('hidden', !query);

    const cards = document.querySelectorAll('.bookmark-card');
    let matchCount = 0;

    cards.forEach(card => {
      const title = (card.getAttribute('data-title') || '').toLowerCase();
      const desc = (card.getAttribute('data-desc') || '').toLowerCase();
      const url = (card.getAttribute('data-url') || '').toLowerCase();

      if (!query || title.includes(query) || desc.includes(query) || url.includes(query)) {
        card.style.display = 'flex';
        matchCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Hide empty category sections when searching
    document.querySelectorAll('.category-section').forEach(section => {
      if (!query) {
        section.style.display = 'block';
      } else {
        const visibleCards = section.querySelectorAll('.bookmark-card[style*="display: flex"]');
        section.style.display = visibleCards.length > 0 ? 'block' : 'none';
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
      const targetEngine = engines.find(e => e.id === activeEngine) || engines[0];
      const engineName = targetEngine ? targetEngine.name : '搜索引擎';
      emptyStateEl.className = 'py-10 px-4 text-center glass-card rounded-2xl border-white/10 max-w-md mx-auto my-6';
      emptyStateEl.innerHTML = `
        <div class="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto mb-3 text-lg">
          🔍
        </div>
        <h4 class="text-sm font-semibold text-[var(--card-text-primary)]">未找到匹配 “${escapeHtml(query)}” 的书签</h4>
        <p class="text-xs text-[var(--card-text-secondary)] mt-1.5 leading-relaxed">
          按 <kbd class="px-1.5 py-0.5 rounded bg-white/10 font-bold text-indigo-400">Enter 回车</kbd> 直接使用 ${engineName} 全网检索
        </p>
        <button type="button" id="empty-state-search-btn" class="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md transition-all cursor-pointer">
          使用 ${engineName} 全网搜索
        </button>
      `;
      emptyStateEl.style.display = 'block';
      const btn = emptyStateEl.querySelector('#empty-state-search-btn');
      if (btn) btn.onclick = handleSearchSubmit;
    } else {
      emptyStateEl.style.display = 'none';
    }

    if (!scrollLockTargetId && settledPinY === null) {
      updateActiveCategoryOnScroll();
    }
  }

  function handleSearchSubmit() {
    const query = searchInput.value.trim();
    if (!query) return;

    // Check if user hit enter without matching local cards or wants engine search
    const engines = navData?.searchEngines || [];
    const targetEngine = engines.find(e => e.id === activeEngine) || engines[0];
    if (targetEngine) {
      window.open(targetEngine.url + encodeURIComponent(query), '_blank');
    }
  }

  // Setup Global Event Listeners
  function setupEventListeners() {
    // Search input
    searchInput.addEventListener('input', handleSearchInput);
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        handleSearchSubmit();
      }
    });

    searchClearBtn.addEventListener('click', () => {
      searchInput.value = '';
      handleSearchInput();
      searchInput.focus();
    });

    // Keyboard shortcuts: '/' or 'Cmd+K' to focus search
    window.addEventListener('keydown', (e) => {
      if ((e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) && document.activeElement !== searchInput) {
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
    themeToggleBtn.addEventListener('click', () => {
      const isLight = document.documentElement.classList.contains('light');
      setTheme(isLight ? 'dark' : 'light');
    });

    if (mobileThemeToggleBtn) {
      mobileThemeToggleBtn.addEventListener('click', () => {
        const isLight = document.documentElement.classList.contains('light');
        setTheme(isLight ? 'dark' : 'light');
      });
    }

    // Mobile Sidebar
    mobileMenuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('-translate-x-full');
      sidebarBackdrop.classList.toggle('hidden');
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

    // Hitokoto Refresh (Independent for Hero and Sidebar)
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

    // Sidebar Subtitle Click (only refreshes sidebar when in Hitokoto mode)
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
      });
      backToTopBtn.addEventListener('click', () => {
        scrollLockTargetId = null;
        settledPinY = null;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Anti-shoulder-surfing auto re-lock on page hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && isUnlocked) {
        isUnlocked = false;
        decryptedItems = null;
        renderAll();
        showToast('🛡️ 为保护隐私，私密分类已在离开页面时自动重新上锁', 'info');
      }
    });

    // Unlock Modal logic
    unlockSubmitBtn.addEventListener('click', submitUnlock);
    unlockPasswordInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submitUnlock();
    });
    unlockCancelBtn.addEventListener('click', closeUnlockModal);

    togglePasswordVisibility.addEventListener('click', () => {
      const isPass = unlockPasswordInput.type === 'password';
      unlockPasswordInput.type = isPass ? 'text' : 'password';
    });
  }

  function closeMobileSidebar() {
    sidebar.classList.add('-translate-x-full');
    sidebarBackdrop.classList.add('hidden');
  }

  function openUnlockModal() {
    unlockModal.classList.remove('hidden');
    unlockPasswordInput.value = '';
    unlockPasswordInput.focus();
  }

  function closeUnlockModal() {
    unlockModal.classList.add('hidden');
  }

  async function submitUnlock() {
    const password = unlockPasswordInput.value;
    if (!password) {
      showToast('请输入解锁密码', 'error');
      return;
    }

    unlockSubmitBtn.disabled = true;
    unlockSubmitBtn.textContent = '验证解密中...';

    const success = await decryptVault(password);

    unlockSubmitBtn.disabled = false;
    unlockSubmitBtn.textContent = '确定解锁';

    if (success) {
      closeUnlockModal();
      renderAll();
      showToast('🎉 私密分类已成功解锁！', 'success');
    } else {
      unlockPasswordInput.classList.add('animate-shake', 'border-rose-500');
      setTimeout(() => unlockPasswordInput.classList.remove('animate-shake', 'border-rose-500'), 500);
      showToast('❌ 密码错误，解密失败', 'error');
    }
  }

  function getDomain(url) {
    try {
      if (!url || url.startsWith('javascript:')) return 'nav.778080.xyz';
      const u = new URL(url);
      return u.hostname;
    } catch (e) {
      return url || '';
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
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
