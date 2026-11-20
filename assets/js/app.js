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
  const engineSelectorBtn = document.getElementById('engine-selector-btn');
  const engineDropdown = document.getElementById('engine-dropdown');
  const engineIcon = document.getElementById('engine-icon');
  const categoryNavList = document.getElementById('category-nav-list');
  const mainContent = document.getElementById('main-content');
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const sidebar = document.getElementById('sidebar');
  const sidebarBackdrop = document.getElementById('sidebar-backdrop');
  const toastContainer = document.getElementById('toast-container');
  const hitokotoText = document.getElementById('hitokoto-text');
  const hitokotoFrom = document.getElementById('hitokoto-from');
  const hitokotoRefreshBtn = document.getElementById('hitokoto-refresh-btn');

  // Vault Modal Elements
  const unlockModal = document.getElementById('unlock-modal');
  const unlockPasswordInput = document.getElementById('unlock-password-input');
  const unlockSubmitBtn = document.getElementById('unlock-submit-btn');
  const unlockCancelBtn = document.getElementById('unlock-cancel-btn');
  const togglePasswordVisibility = document.getElementById('toggle-password-visibility');
  const openToolModalBtn = document.getElementById('open-tool-modal-btn');

  // Encrypt Tool Modal Elements
  const toolModal = document.getElementById('tool-modal');
  const toolCloseBtn = document.getElementById('tool-close-btn');
  const toolPasswordInput = document.getElementById('tool-password-input');
  const toolJsonInput = document.getElementById('tool-json-input');
  const toolGenerateBtn = document.getElementById('tool-generate-btn');
  const toolOutput = document.getElementById('tool-output');
  const toolCopyBtn = document.getElementById('tool-copy-btn');

  // Fallback Hitokoto Quotes
  const fallbackQuotes = [
    { hitokoto: "生活原本沉闷，但跑起来就会有风。", from: "网络" },
    { hitokoto: "星光不问赶路人，岁月不负有心人。", from: "大冰" },
    { hitokoto: "Stay hungry, stay foolish.", from: "Steve Jobs" },
    { hitokoto: "每一个不曾起舞的日子，都是对生命的辜负。", from: "尼采" },
    { hitokoto: "代码即诗篇，探索永无止境。", from: "个人导航" }
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
    setupEventListeners();
    fetchHitokoto();
    await loadNavigationData();
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
      renderAll();
    } catch (err) {
      console.warn('Could not load links.json directly via fetch:', err);
      // If run directly from file:// protocol where fetch is blocked, fallback will notify
      showToast('正在初始化导航数据...', 'info');
    }
  }

  // Hitokoto (一言)
  async function fetchHitokoto() {
    try {
      hitokotoRefreshBtn.classList.add('animate-spin');
      const response = await fetch('https://v1.hitokoto.cn/?encode=json');
      if (!response.ok) throw new Error('API offline');
      const data = await response.json();
      displayHitokoto(data.hitokoto, data.from_who || data.from || '未知');
    } catch (err) {
      const random = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
      displayHitokoto(random.hitokoto, random.from);
    } finally {
      setTimeout(() => hitokotoRefreshBtn.classList.remove('animate-spin'), 600);
    }
  }

  function displayHitokoto(quote, from) {
    hitokotoText.style.opacity = '0';
    hitokotoFrom.style.opacity = '0';
    setTimeout(() => {
      hitokotoText.textContent = `“ ${quote} ”`;
      hitokotoFrom.textContent = `—— ${from}`;
      hitokotoText.style.opacity = '1';
      hitokotoFrom.style.opacity = '1';
    }, 200);
  }

  // Render Sidebar and Categories
  function renderAll() {
    if (!navData) return;
    renderSidebarNav();
    renderContentCategories();
  }

  function renderSidebarNav() {
    let html = '';
    
    // Regular Categories
    navData.categories.forEach(cat => {
      html += `
        <a href="#${cat.id}" class="sidebar-nav-item flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[var(--card-text-secondary)] hover:text-[var(--card-text-primary)] hover:bg-white/5 transition-all group">
          <span class="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-300 transition-colors">
            ${getIconSvg(cat.icon, 'w-4 h-4')}
          </span>
          <span class="truncate flex-1">${cat.name}</span>
          <span class="text-xs px-2 py-0.5 rounded-full bg-white/5 text-[var(--card-text-secondary)] font-mono">${cat.items.length}</span>
        </a>
      `;
    });

    // Encrypted Vault Category in Sidebar
    if (navData.encryptedVault) {
      const v = navData.encryptedVault;
      html += `
        <div class="pt-3 mt-3 border-t border-[var(--glass-border)]">
          <a href="#${v.id}" class="sidebar-nav-item flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-amber-300/90 hover:text-amber-200 hover:bg-amber-500/10 transition-all group border border-amber-500/20">
            <span class="p-1.5 rounded-lg bg-amber-500/20 text-amber-300">
              ${getIconSvg(isUnlocked ? 'lock-open' : 'lock-closed', 'w-4 h-4')}
            </span>
            <span class="truncate flex-1">${v.name}</span>
            <span class="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
              ${isUnlocked ? '已解锁' : '加密'}
            </span>
          </a>
        </div>
      `;
    }

    categoryNavList.innerHTML = html;

    // Attach click for smooth scrolling and mobile drawer auto-close
    categoryNavList.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', (e) => {
        closeMobileSidebar();
      });
    });
  }

  function renderContentCategories() {
    let html = '';

    navData.categories.forEach(cat => {
      html += `
        <section id="${cat.id}" class="category-section scroll-mt-24 mb-6">
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
  }

  function renderBookmarkCard(item) {
    const initial = (item.title || 'U').charAt(0).toUpperCase();
    const domain = getDomain(item.url);

    return `
      <div class="bookmark-card glass-card rounded-xl px-2.5 py-2 sm:px-3 sm:py-2.5 flex items-center justify-between gap-2.5 group relative overflow-hidden transition-all duration-200" data-title="${escapeHtml(item.title)}" data-desc="${escapeHtml(item.description)}" data-url="${escapeHtml(item.url)}">
        <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2.5 flex-1 min-w-0" title="${escapeHtml(item.title)}${item.description ? ' - ' + escapeHtml(item.description) : ''}">
          <!-- Compact Icon -->
          <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
            ${
              item.icon && !item.icon.includes('avatar.png')
                ? `<img src="${item.icon}" alt="${escapeHtml(item.title)}" class="w-full h-full object-cover" onerror="this.onerror=null; this.parentElement.innerHTML='<span class=\\'font-bold text-xs text-indigo-300\\'>${initial}</span>';">`
                : `<span class="font-bold text-xs text-indigo-300">${initial}</span>`
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
        <section id="${v.id}" class="category-section scroll-mt-24 mb-6">
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
      <section id="${v.id}" class="category-section scroll-mt-24 mb-6">
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
  async function encryptVault(password, itemsArray) {
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
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
        iterations: 100000,
        hash: 'SHA-256'
      },
      pwKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );

    const plaintext = new TextEncoder().encode(JSON.stringify(itemsArray));
    const ciphertextWithTag = await subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      derivedKey,
      plaintext
    );

    return {
      algorithm: 'AES-256-GCM',
      kdf: 'PBKDF2-SHA256',
      iterations: 100000,
      salt: bytesToHex(salt),
      iv: bytesToHex(iv),
      ciphertext: bytesToHex(new Uint8Array(ciphertextWithTag)),
      itemCount: itemsArray.length
    };
  }

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

    // Search Engine Selector
    engineSelectorBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      engineDropdown.classList.toggle('hidden');
    });

    document.querySelectorAll('.engine-option').forEach(opt => {
      opt.addEventListener('click', () => {
        activeEngine = opt.getAttribute('data-engine');
        const name = opt.getAttribute('data-name');
        const placeholder = opt.getAttribute('data-placeholder');
        document.getElementById('current-engine-name').textContent = name;
        searchInput.placeholder = placeholder || `使用 ${name} 搜索全网...`;
        engineDropdown.classList.add('hidden');
      });
    });

    window.addEventListener('click', () => {
      engineDropdown.classList.add('hidden');
    });

    // Theme Toggle
    themeToggleBtn.addEventListener('click', () => {
      const isLight = document.documentElement.classList.contains('light');
      setTheme(isLight ? 'dark' : 'light');
    });

    // Mobile Sidebar
    mobileMenuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('-translate-x-full');
      sidebarBackdrop.classList.toggle('hidden');
    });

    sidebarBackdrop.addEventListener('click', closeMobileSidebar);

    // Hitokoto Refresh
    hitokotoRefreshBtn.addEventListener('click', fetchHitokoto);

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

    // Secret Encryptor Tool Modal logic
    openToolModalBtn.addEventListener('click', () => {
      toolModal.classList.remove('hidden');
    });
    toolCloseBtn.addEventListener('click', () => {
      toolModal.classList.add('hidden');
    });
    toolGenerateBtn.addEventListener('click', handleToolGenerate);
    toolCopyBtn.addEventListener('click', () => {
      if (toolOutput.value) {
        navigator.clipboard.writeText(toolOutput.value).then(() => {
          showToast('已复制加密密文 JSON 片段！', 'success');
        });
      }
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

  async function handleToolGenerate() {
    const password = toolPasswordInput.value.trim();
    const jsonStr = toolJsonInput.value.trim();

    if (!password) {
      showToast('请设置私密密码', 'error');
      return;
    }

    let items;
    try {
      items = JSON.parse(jsonStr);
      if (!Array.isArray(items)) throw new Error('Must be array');
    } catch (e) {
      showToast('书签列表必须是标准的 JSON 数组格式', 'error');
      return;
    }

    toolGenerateBtn.textContent = '正在计算 AES-256-GCM 密文...';
    toolGenerateBtn.disabled = true;

    try {
      const cryptoResult = await encryptVault(password, items);
      toolOutput.value = JSON.stringify(cryptoResult, null, 2);
      toolCopyBtn.classList.remove('hidden');
      showToast('✅ 加密密文生成成功！请复制更新到 links.json', 'success');
    } catch (err) {
      showToast('加密失败: ' + err.message, 'error');
    } finally {
      toolGenerateBtn.textContent = '一键生成加密密文';
      toolGenerateBtn.disabled = false;
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
