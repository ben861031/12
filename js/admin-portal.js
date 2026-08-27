window.AdminPortal = {
  isAdminLoggedIn: false,
  currentAdminUser: null,
  authReady: false,
  editingStudentId: null,
  carryoverSourceStudentId: null,
  carryoverHasNameMismatch: false,
  activeView: 'roster',
  selectedRiskIds: new Set(),
  rosterPage: 1,
  rosterPageSize: 50,
  thresholdPage: 1,
  thresholdPageSize: 50,
  recordsPage: 1,
  recordsPageSize: 50,
  riskPage: 1,
  riskPageSize: 50,
  adminAccounts: [],
  adminAccountsLoading: false,
  auditAccountsLoading: false,
  auditAccountsLoaded: false,
  normalizeRosterStatus(status) {
    return String(status || '\u5728\u5b78').trim() === '\u5728\u5b78' ? '\u5728\u5b78' : '\u975e\u5728\u5b78';
  },
  init() {
    this.bindEvents();
    window.FitnessFirebase?.onAuthStateChanged(async (user) => {
      const profile = user ? await window.FitnessFirebase.getAuthorizedAdmin(user) : null;
      this.authReady = true;
      this.isAdminLoggedIn = Boolean(profile);
      this.currentAdminUser = profile;
      window.FitnessFirebase.currentAdminProfile = profile;
      if (!profile) window.FitnessStore?.clearPrivateCache();
      if (window.App?.currentTab === 'admin') await this.checkAuthAndRender();
    });
  },
  bindEvents() {
    document.querySelectorAll('[data-admin-view]').forEach(el => {
      el.addEventListener('click', (e) => {
        const view = e.currentTarget.getAttribute('data-admin-view');
        this.switchView(view);
      });
    });
    const rosterSearch = document.getElementById('rosterSearchInput');
    const rosterYear = document.getElementById('rosterEnrollYearFilter');
    const rosterClass = document.getElementById('rosterClassFilter');
    const rosterStatus = document.getElementById('rosterStatusFilter');
    const rosterTrueYear = document.getElementById('rosterTrueYearFilter');
    const rosterAdmission = document.getElementById('rosterAdmissionFilter');
    const rosterIdentity = document.getElementById('rosterIdentityFilter');
    if (rosterSearch) rosterSearch.addEventListener('input', () => this.resetRosterPageAndRender());
    if (rosterYear) rosterYear.addEventListener('change', () => { document.getElementById('rosterClassFilter').value = ''; this.resetRosterPageAndRender(); });
    if (rosterClass) rosterClass.addEventListener('change', () => this.resetRosterPageAndRender());
    if (rosterStatus) rosterStatus.addEventListener('change', () => this.resetRosterPageAndRender());
    if (rosterTrueYear) rosterTrueYear.addEventListener('change', () => this.resetRosterPageAndRender());
    if (rosterAdmission) rosterAdmission.addEventListener('change', () => this.resetRosterPageAndRender());
    if (rosterIdentity) rosterIdentity.addEventListener('change', () => this.resetRosterPageAndRender());
    const thresholdSearch = document.getElementById('thresholdSearchInput');
    const thresholdYear = document.getElementById('thresholdEnrollYearFilter');
    const thresholdClass = document.getElementById('thresholdClassFilter');
    const thresholdStatus = document.getElementById('thresholdStatusFilter');
    const thresholdRosterStatus = document.getElementById('thresholdRosterStatusFilter');
    const thresholdTrueYear = document.getElementById('thresholdTrueYearFilter');
    const thresholdAdmission = document.getElementById('thresholdAdmissionFilter');
    const thresholdIdentity = document.getElementById('thresholdIdentityFilter');
    if (thresholdSearch) thresholdSearch.addEventListener('input', () => this.resetThresholdPageAndRender());
    if (thresholdYear) thresholdYear.addEventListener('change', () => { document.getElementById('thresholdClassFilter').value = ''; this.resetThresholdPageAndRender(); });
    if (thresholdClass) thresholdClass.addEventListener('change', () => this.resetThresholdPageAndRender());
    if (thresholdStatus) thresholdStatus.addEventListener('change', () => this.resetThresholdPageAndRender());
    if (thresholdRosterStatus) thresholdRosterStatus.addEventListener('change', () => this.resetThresholdPageAndRender());
    if (thresholdTrueYear) thresholdTrueYear.addEventListener('change', () => this.resetThresholdPageAndRender());
    if (thresholdAdmission) thresholdAdmission.addEventListener('change', () => this.resetThresholdPageAndRender());
    if (thresholdIdentity) thresholdIdentity.addEventListener('change', () => this.resetThresholdPageAndRender());
    window.FitnessStore.subscribe(() => {
      if (this.isAdminLoggedIn) {
        this.renderCurrentView();
      }
    });
    if (!document.body.dataset.adminAccountMenuBound) {
      document.body.dataset.adminAccountMenuBound = 'true';
      document.addEventListener('click', (event) => {
        const desktopMenu = document.querySelector('.admin-account-menu');
        const mobileMenu = document.querySelector('.mobile-admin-account');
        const clickedInside = desktopMenu?.contains(event.target) || mobileMenu?.contains(event.target);
        if (!clickedInside) this.closeAccountMenu();
      });
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          this.closeAccountMenu();
          this.closeAuditLogDetail();
        }
      });
    }
  },
  resetRosterPageAndRender() {
    this.rosterPage = 1;
    this.renderStudentRoster();
  },
  resetThresholdPageAndRender() {
    this.thresholdPage = 1;
    this.renderThresholdAudit();
  },
  async checkAuthAndRender() {
    if (!this.authReady && window.FitnessFirebase?.auth?.currentUser) {
      const profile = await window.FitnessFirebase.getAuthorizedAdmin(window.FitnessFirebase.auth.currentUser);
      this.isAdminLoggedIn = Boolean(profile);
      this.currentAdminUser = profile;
      window.FitnessFirebase.currentAdminProfile = profile;
    }
    if (!this.isAdminLoggedIn) {
      this.showLoginModal();
      return;
    }
    this.applyRoleBasedNavigation();
    if (!window.FitnessStore.cache.students || window.FitnessStore.cache.students.length === 0) {
      await window.FitnessStore.syncFromFirebase();
    }
    this.renderCurrentView();
  },
  showLoginModal() {
    const modal = document.getElementById('adminLoginModal');
    if (modal) modal.classList.remove('hidden');
    const accInput = document.getElementById('adminAccountInput');
    const pwdInput = document.getElementById('adminPasswordInput');
    if (accInput) accInput.value = '';
    if (pwdInput) pwdInput.value = '';
  },
  hideLoginModal() {
    const modal = document.getElementById('adminLoginModal');
    if (modal) modal.classList.add('hidden');
  },
  togglePasswordVisibility() {
    const pwdInput = document.getElementById('adminPasswordInput');
    if (pwdInput) {
      const isPassword = pwdInput.type === 'password';
      pwdInput.type = isPassword ? 'text' : 'password';
    }
  },
  async verifyLogin() {
    const accInput = document.getElementById('adminAccountInput');
    const pwdInput = document.getElementById('adminPasswordInput');
    const acc = accInput ? accInput.value.trim() : '';
    const pwd = pwdInput ? pwdInput.value.trim() : '';
    const submitButton = document.getElementById('adminLoginSubmitBtn');
    if (!acc || !pwd) {
      this.showToast('\u8acb\u8f38\u5165\u7ba1\u7406\u54e1\u5e33\u865f\u8207\u5bc6\u78bc', 'warning');
      return;
    }
    try {
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = '\u9a57\u8b49\u4e2d\u2026';
      }
      const matchedUser = await window.FitnessFirebase.signInAdmin(acc, pwd);
      this.isAdminLoggedIn = true;
      this.currentAdminUser = matchedUser;
      this.auditAccountsLoaded = false;
      this.hideLoginModal();
      this.applyRoleBasedNavigation();
      this.showToast(`\u6b61\u8fce\u767b\u5165\uff0c${matchedUser.name || matchedUser.username}\uff01`, 'success');
      this.renderCurrentView();
      const res = await window.FitnessStore.syncFromFirebase();
      if (res.success) this.renderCurrentView();
      const roleText = matchedUser.role === 'super_admin' ? '\u7cfb\u7d71\u7ba1\u7406\u54e1' : '\u4e00\u822c\u6559\u8077\u54e1';
      await this.recordAudit(
        '\u767b\u5165\u7cfb\u7d71',
        `\u767b\u5165\u5e33\u865f\uff1a${matchedUser.account || matchedUser.username || acc}\uff1b\u89d2\u8272\uff1a${roleText}`,
        '-',
        'success'
      );
    } catch (err) {
      this.isAdminLoggedIn = false;
      this.currentAdminUser = null;
      const message = /wrong-password|user-not-found|invalid-login-credentials|invalid-credential|invalid-email/i.test(err?.code || err?.message || '')
        ? '\u5e33\u865f\u6216\u5bc6\u78bc\u932f\u8aa4\uff0c\u8acb\u78ba\u8a8d\u8f38\u5165'
        : (err?.message || '\u767b\u5165\u5931\u6557\uff0c\u8acb\u7a0d\u5f8c\u518d\u8a66');
      this.showToast(message, 'danger');
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = '\u767b \u5165';
      }
    }
  },
  async logout() {
    this.closeAccountMenu();
    const user = this.currentAdminUser;
    if (user) {
      const roleText = user.role === 'super_admin' ? '\u7cfb\u7d71\u7ba1\u7406\u54e1' : '\u4e00\u822c\u6559\u8077\u54e1';
      await this.recordAudit(
        '\u767b\u51fa\u7cfb\u7d71',
        `\u767b\u5165\u5e33\u865f\uff1a${user.account || user.username || ''}\uff1b\u89d2\u8272\uff1a${roleText}`,
        '-',
        'success'
      );
    }
    this.isAdminLoggedIn = false;
    this.currentAdminUser = null;
    this.auditAccountsLoaded = false;
    window.FitnessStore.clearPrivateCache();
    await window.FitnessFirebase.signOut();
    this.showToast('\u5df2\u767b\u51fa\u7cfb\u7d71', 'info');
    if (window.App) window.App.switchTab('student');
  },
  applyRoleBasedNavigation() {
    const user = this.currentAdminUser;
    const desktopNameEl = document.getElementById('desktopAdminName');
    const desktopDropdownNameEl = document.getElementById('desktopAdminDropdownName');
    const desktopBadgeEl = document.getElementById('desktopAdminRoleBadge');
    const mobileNameEl = document.getElementById('mobileAdminName');
    const mobileBadgeEl = document.getElementById('mobileAdminRoleBadge');
    const displayName = user ? (user.name || user.username || '\u7ba1\u7406\u54e1') : '\u672a\u767b\u5165';
    const roleText = user ? (user.role === 'super_admin' ? '\u7cfb\u7d71\u7ba1\u7406\u54e1' : '\u4e00\u822c\u6559\u8077\u54e1') : '';
    if (desktopNameEl) desktopNameEl.textContent = displayName;
    if (desktopDropdownNameEl) desktopDropdownNameEl.textContent = displayName;
    if (mobileNameEl) mobileNameEl.textContent = displayName;
    if (desktopBadgeEl) {
      desktopBadgeEl.textContent = roleText;
      desktopBadgeEl.className = user && user.role === 'super_admin'
        ? 'text-[11px] font-bold px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 shrink-0'
        : 'text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 shrink-0';
    }
    if (mobileBadgeEl) {
      mobileBadgeEl.textContent = roleText ? `${roleText} \u767b\u5165\u4e2d` : '';
    }
    const settingsNavs = document.querySelectorAll('[data-admin-view="settings"]');
    const logsNavs = document.querySelectorAll('[data-admin-view="logs"]');
    if (user.role === 'staff') {
      settingsNavs.forEach(el => el.classList.add('hidden'));
      logsNavs.forEach(el => el.classList.add('hidden'));
      if (this.activeView === 'settings' || this.activeView === 'logs') {
        this.activeView = 'roster';
        this.switchView('roster');
      }
    } else {
      settingsNavs.forEach(el => el.classList.remove('hidden'));
      logsNavs.forEach(el => el.classList.remove('hidden'));
    }
  },
  switchView(viewName) {
    this.closeAccountMenu();
    if (this.currentAdminUser?.role === 'staff' && (viewName === 'settings' || viewName === 'logs')) {
      this.showToast('\u4e00\u822c\u6559\u8077\u54e1\u6b0a\u9650\u7121\u6b0a\u5b58\u53d6\u7cfb\u7d71\u8a2d\u5b9a\u8207\u64cd\u4f5c\u7d00\u9304', 'warning');
      this.activeView = 'roster';
      viewName = 'roster';
    } else {
      this.activeView = viewName;
    }
    const workspace = document.getElementById('adminMainWorkspace');
    if (workspace) {
      workspace.classList.toggle('admin-data-table-workspace', ['roster', 'threshold', 'records', 'analytics', 'risk', 'logs'].includes(viewName));
    }
    document.querySelectorAll('[data-admin-view]').forEach(el => {
      const vName = el.getAttribute('data-admin-view');
      const isActive = vName === viewName;
      if (isActive) {
        el.classList.add('active');
        if (el.tagName === 'BUTTON') {
          el.className = 'px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap bg-blue-50 text-blue-600 border border-blue-200';
        }
      } else {
        el.classList.remove('active');
        if (el.tagName === 'BUTTON') {
          el.className = 'px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap bg-slate-50 text-slate-700';
        }
      }
    });
    const views = ['roster', 'threshold', 'dashboard', 'records', 'analytics', 'risk', 'logs', 'settings', 'announcements'];
    views.forEach(v => {
      const el = document.getElementById(`erpView_${v}`);
      if (el) {
        if (v === viewName) el.classList.remove('hidden');
        else el.classList.add('hidden');
      }
    });
    const titlesMap = {
      roster: '\u5b78\u751f\u540d\u518a',
      threshold: '\u9580\u6abb\u67e5\u8a62',
      dashboard: '\u500b\u4eba\u6210\u7e3e\u67e5\u8a62',
      records: '\u6aa2\u6e2c\u8cc7\u6599\u7ba1\u7406',
      analytics: '\u73ed\u7d1a\u7d71\u8a08',
      risk: '\u672a\u5408\u683c\u540d\u55ae',
      logs: '\u64cd\u4f5c\u7d00\u9304',
      settings: '\u7cfb\u7d71\u8a2d\u5b9a',
      announcements: '\u516c\u544a\u7ba1\u7406'
    };
    const elTitle = document.getElementById('adminPageTitle');
    if (elTitle) elTitle.textContent = titlesMap[viewName] || '\u5b78\u751f\u540d\u518a';
    const pageIcon = document.getElementById('adminPageHeaderIcon');
    const sidebarIcon = document.querySelector(`.corp-sidebar [data-admin-view="${viewName}"] svg`)
      || document.querySelector('.corp-sidebar [data-admin-view="roster"] svg');
    if (pageIcon && sidebarIcon) pageIcon.replaceChildren(sidebarIcon.cloneNode(true));
    const actionGroup = document.getElementById('adminHeaderActionGroup');
    if (actionGroup) {
      if (viewName === 'roster') {
        actionGroup.innerHTML = `
          <button onclick="App.openRosterModal()" class="px-4 py-2 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] text-white text-sm font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
            <span>\u532f\u5165\u5b78\u7c4d</span>
          </button>
          <button onclick="AdminPortal.exportRosterExcel()" class="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-sm font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]">
            <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            <span>\u532f\u51fa\u5b78\u7c4d</span>
          </button>
        `;
      } else if (viewName === 'threshold') {
        actionGroup.innerHTML = `
          <button onclick="App.openTestImportModal()" class="px-4 py-2 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] text-white text-sm font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
            <span>\u532f\u5165\u6210\u7e3e</span>
          </button>
          <button onclick="AdminPortal.openExportModal()" class="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-sm font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]">
            <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            <span>\u532f\u51fa\u7e3d\u8868</span>
          </button>
        `;
      } else if (viewName === 'records') {
        actionGroup.innerHTML = `
          <button onclick="AdminPortal.openAddRecordModal()" class="px-4 py-2 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] text-white text-sm font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
            <span>\u55ae\u7368\u65b0\u589e\u6210\u7e3e</span>
          </button>
        `;
      } else if (viewName === 'analytics') {
        actionGroup.innerHTML = `
          <button onclick="AdminPortal.exportAnalyticsExcel()" class="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-sm font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]">
            <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            <span>\u532f\u51fa\u5831\u8868</span>
          </button>
        `;
      } else if (viewName === 'risk') {
        actionGroup.innerHTML = `
          <button onclick="AdminPortal.generateRiskEML()" class="px-4 py-2 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] text-white text-sm font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            <span>\u7522\u751f EML \u7bc4\u672c</span>
          </button>
          <button onclick="AdminPortal.batchCopyEmails()" class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
            <span>\u8907\u88fd Email</span>
          </button>
          <button onclick="AdminPortal.exportRiskExcel()" class="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-sm font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]">
            <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            <span>\u532f\u51fa\u540d\u55ae</span>
          </button>
        `;
      } else if (viewName === 'logs') {
        actionGroup.innerHTML = `
          <button onclick="AdminPortal.exportAuditLogs()" class="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-sm font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]">
            <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            <span>\u532f\u51fa\u7d00\u9304</span>
          </button>
        `;
      } else if (viewName === 'announcements') {
        actionGroup.innerHTML = `
          <button onclick="AdminPortal.openAnnouncementModal()" class="px-4 py-2 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] text-white text-sm font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
            <span>\u65b0\u589e\u516c\u544a</span>
          </button>
        `;
      } else {
        actionGroup.innerHTML = '';
      }
    }
    const statContainer = document.getElementById('adminHeaderStatContainer');
    const showStatViews = ['roster', 'threshold'];
    if (statContainer) {
      if (showStatViews.includes(viewName)) {
        statContainer.classList.remove('hidden');
      } else {
        statContainer.classList.add('hidden');
      }
    }
    const subtitlesMap = {
      roster: '\u5171 0 \u7b46\u5b78\u751f\u8cc7\u6599',
      threshold: '\u5168\u6821\u5b78\u751f\u7562\u696d\u9580\u6abb\u5be9\u6838\u8207\u5408\u683c\u7d00\u9304',
      dashboard: '\u55ae\u4e00\u5b78\u751f\u9ad4\u9069\u80fd\u6b77\u5e74\u6aa2\u6e2c\u6578\u64da\u8207\u6210\u7e3e\u55ae',
      records: '\u5168\u6821\u6b77\u5e74\u9ad4\u9069\u80fd\u539f\u59cb\u6210\u7e3e\u6578\u64da\u7ba1\u7406',
      analytics: '\u5168\u6821\u8207\u5404\u73ed\u7d1a\u9ad4\u9069\u80fd\u901a\u904e\u7387\u7d71\u8a08\u5206\u6790\u5716\u8868',
      risk: '\u9700\u52a0\u5f37\u8f14\u5c0e\u8207\u88dc\u6e2c\u5b78\u751f\u8ffd\u8e64\u540d\u55ae',
      logs: '\u7ba1\u7406\u54e1\u8207\u6559\u8077\u54e1\u7cfb\u7d71\u64cd\u4f5c\u8ecc\u8de1\u7d00\u9304',
      settings: '\u6b0a\u9650\u63a7\u5236\u8207\u7cfb\u7d71\u53c3\u6578\u504f\u597d\u8a2d\u5b9a',
      announcements: '\u5e73\u53f0\u6700\u65b0\u6d88\u606f\u8207\u516c\u544a\u5167\u5bb9\u7de8\u8f2f'
    };
    const elSubtitle = document.getElementById('adminPageSubtitle');
    if (elSubtitle) {
      elSubtitle.textContent = subtitlesMap[viewName] || '';
    }
    this.applyRoleBasedNavigation();
    this.renderCurrentView();
  },
  toggleAccountMenu(event) {
    if (event) event.stopPropagation();
    const dropdown = document.getElementById('adminAccountDropdown');
    const button = document.getElementById('adminAccountMenuButton');
    const chevron = document.getElementById('adminAccountChevron');
    if (!dropdown || !button) return;
    const shouldOpen = dropdown.classList.contains('hidden');
    dropdown.classList.toggle('hidden', !shouldOpen);
    button.setAttribute('aria-expanded', String(shouldOpen));
    if (chevron) chevron.classList.toggle('rotate-180', shouldOpen);
  },
  toggleMobileAccountMenu(event) {
    if (event) event.stopPropagation();
    const dropdown = document.getElementById('mobileAdminAccountDropdown');
    const button = document.getElementById('mobileAdminAccountMenuButton');
    const chevron = document.getElementById('mobileAdminAccountChevron');
    if (!dropdown || !button) return;
    const shouldOpen = dropdown.classList.contains('hidden');
    dropdown.classList.toggle('hidden', !shouldOpen);
    button.setAttribute('aria-expanded', String(shouldOpen));
    if (chevron) chevron.classList.toggle('rotate-180', shouldOpen);
  },
  closeAccountMenu() {
    [
      ['adminAccountDropdown', 'adminAccountMenuButton', 'adminAccountChevron'],
      ['mobileAdminAccountDropdown', 'mobileAdminAccountMenuButton', 'mobileAdminAccountChevron']
    ].forEach(([dropdownId, buttonId, chevronId]) => {
      const dropdown = document.getElementById(dropdownId);
      const button = document.getElementById(buttonId);
      const chevron = document.getElementById(chevronId);
      if (dropdown) dropdown.classList.add('hidden');
      if (button) button.setAttribute('aria-expanded', 'false');
      if (chevron) chevron.classList.remove('rotate-180');
    });
  },
  toggleMoreFilters(view = 'roster') {
    const rowId = view === 'threshold' ? 'thresholdMoreFiltersRow' : 'rosterMoreFiltersRow';
    const row = document.getElementById(rowId);
    if (row) {
      row.classList.toggle('hidden');
    }
  },
  renderCurrentView() {
    if (this.currentAdminUser?.role === 'staff' && (this.activeView === 'settings' || this.activeView === 'logs')) {
      this.activeView = 'roster';
    }
    this.renderHeaderSummary();
    if (this.activeView === 'roster') this.renderStudentRoster();
    if (this.activeView === 'threshold') this.renderThresholdAudit();
    if (this.activeView === 'dashboard') this.renderDashboard();
    if (this.activeView === 'records') this.renderRecordsManagement();
    if (this.activeView === 'analytics') this.renderAnalytics();
    if (this.activeView === 'risk') this.renderRiskTracking();
    if (this.activeView === 'logs' && this.currentAdminUser?.role !== 'staff') this.prepareAuditLogs();
    if (this.activeView === 'announcements') this.renderAnnouncementsManagement();
    if (this.activeView === 'settings' && this.currentAdminUser?.role !== 'staff') this.renderAdminAccountsManagement();
  },
  async clearAllSystemData() {
    if (confirm('\u78ba\u5b9a\u8981\u6e05\u9664\u6240\u6709\u7cfb\u7d71\u8cc7\u6599\u55ce\uff1f\n\n\u9019\u5c07\u6703\u522a\u9664\u6240\u6709\u5b78\u751f\u5b78\u7c4d\u3001\u6210\u7e3e\u7d00\u9304\u8207\u64cd\u4f5c\u7d00\u9304\uff0c\u4e14\u7121\u6cd5\u5fa9\u539f\uff01')) {
      try {
        await window.FitnessStore.clearAllData({ cloud: true });
        this.recordAudit('\u6e05\u9664\u5168\u6821\u7cfb\u7d71\u8cc7\u6599', '\u5df2\u6e05\u9664\u672c\u6a5f\u8207 Firebase \u96f2\u7aef\u7684\u5b78\u751f\u3001\u6210\u7e3e\u53ca\u67e5\u8a62\u8cc7\u6599');
        this.showToast('\u672c\u6a5f\u8207\u96f2\u7aef\u5b78\u751f\u3001\u6210\u7e3e\u53ca\u67e5\u8a62\u8cc7\u6599\u5df2\u6e05\u7a7a', 'success');
        this.renderCurrentView();
      } catch (err) {
        this.showToast(`\u6e05\u9664\u5931\u6557\uff1a${err.message || '\u8acb\u78ba\u8a8d\u7ba1\u7406\u6b0a\u9650\u8207\u7db2\u8def'}`, 'danger');
      }
    }
  },
  populateBulkDeleteSemesterSelect() {
    const select = document.getElementById('bulkDeleteSemesterSelect');
    if (!select || select.options.length > 1) return;
    const records = window.FitnessStore.getFitnessRecords();
    const semesters = [...new Set(records.map(r => r.semester))].sort((a, b) => b.localeCompare(a));
    semesters.forEach(sem => {
      const option = document.createElement('option');
      option.value = sem;
      option.textContent = `${sem.slice(0, 3)}-${sem.slice(3)} \u5b78\u671f`;
      select.appendChild(option);
    });
  },
  bulkDeleteSemesterRecords() {
    const select = document.getElementById('bulkDeleteSemesterSelect');
    if (!select) return;
    const targetSemester = select.value;
    if (!targetSemester) {
      this.showToast('\u8acb\u5148\u9078\u64c7\u8981\u522a\u9664\u7684\u5b78\u671f', 'danger');
      return;
    }
    if (!confirm(`\u26a0\ufe0f \u8b66\u544a\uff1a\u60a8\u78ba\u5b9a\u8981\u522a\u9664\u300c\u5168\u6821\u300d\u5728 ${targetSemester} \u5b78\u671f\u7684\u6240\u6709\u6aa2\u6e2c\u7d00\u9304\u55ce\uff1f\n\n\u6ce8\u610f\uff1a\u9019\u9805\u64cd\u4f5c\u7121\u6cd5\u5fa9\u539f\uff0c\u4e26\u6703\u81ea\u52d5\u91cd\u65b0\u8a08\u7b97\u6240\u6709\u53d7\u5f71\u97ff\u5b78\u751f\u7684\u901a\u904e\u6b21\u6578\uff01`)) {
      return;
    }
    let records = window.FitnessStore.getFitnessRecords();
    const recordsToDelete = records.filter(r => String(r.semester) === String(targetSemester));
    if (recordsToDelete.length === 0) {
      this.showToast('\u8a72\u5b78\u671f\u6c92\u6709\u4efb\u4f55\u6aa2\u6e2c\u7d00\u9304', 'info');
      return;
    }
    const affectedStudentIds = [...new Set(recordsToDelete.map(r => r.studentId))];
    records = records.filter(r => String(r.semester) !== String(targetSemester));
    window.FitnessStore.saveFitnessRecords(records);
    affectedStudentIds.forEach(id => {
      window.FitnessStore.recalculateStudentPassCount(id);
    });
    window.FitnessStore.addAuditLog({
      operator: window.FitnessStore.getCurrentOperatorName(),
      action: '\u6279\u91cf\u522a\u9664\u5b78\u671f\u8cc7\u6599',
      studentId: 'MULTI',
      details: `\u4e00\u6b21\u6027\u522a\u9664 ${targetSemester} \u5b78\u671f\u5168\u6821\u5171 ${recordsToDelete.length} \u7b46\u6aa2\u6e2c\u6210\u7e3e`
    });
    select.value = ''; // Reset select
    this.showToast(`\u5df2\u6210\u529f\u522a\u9664 ${targetSemester} \u5b78\u671f\u5171 ${recordsToDelete.length} \u7b46\u7d00\u9304\u4e26\u91cd\u7b97\u6210\u7e3e\uff01`, 'success');
  },
  getValidStudents() {
    return window.FitnessStore.getStudents().filter(s => s.isRosterImported || s.rosterStatus !== undefined);
  },
  renderHeaderSummary(filteredList = null) {
    let students = [];
    if (filteredList && Array.isArray(filteredList)) {
      students = filteredList;
    } else {
      const allValidStudents = this.getValidStudents();
      students = allValidStudents.filter(s => this.normalizeRosterStatus(s.rosterStatus) === '\u5728\u5b78');
    }
    const total = students.length;
    let passed = 0;
    let failed = 0;
    students.forEach(s => {
      if (s.status === '\u4e0d\u901a\u904e') failed++;
      else passed++;
    });
    const rate = total > 0 ? Math.round((passed / total) * 100) : 0;
    const elTotal = document.getElementById('hdrStatTotal');
    const elPassed = document.getElementById('hdrStatPassed');
    const elFailed = document.getElementById('hdrStatFailed');
    const elRate = document.getElementById('hdrStatRate');
    if (elTotal) elTotal.textContent = total.toLocaleString();
    if (elPassed) elPassed.textContent = passed.toLocaleString();
    if (elFailed) elFailed.textContent = failed.toLocaleString();
    if (elRate) elRate.textContent = `${rate}%`;
    const elSubtitle = document.getElementById('adminPageSubtitle');
    if (elSubtitle && ['roster', 'threshold'].includes(this.activeView)) {
      elSubtitle.textContent = `\u5171 ${total.toLocaleString()} \u7b46\u5b78\u751f\u8cc7\u6599`;
    }
  },
  renderFilterDropdowns() {
    const students = this.getValidStudents();
    const grades = Array.from(new Set(students.map(s => s.className && s.className[2]).filter(Boolean))).sort();
    const gradesMap = { '\u4e00': '\u4e00\u5e74\u7d1a', '\u4e8c': '\u4e8c\u5e74\u7d1a', '\u4e09': '\u4e09\u5e74\u7d1a', '\u56db': '\u56db\u5e74\u7d1a', '\u4e94': '\u4e94\u5e74\u7d1a', '\u516d': '\u516d\u5e74\u7d1a', '\u4e03': '\u4e03\u5e74\u7d1a' };
    const rYearFilter = document.getElementById('rosterEnrollYearFilter');
    const rClassFilter = document.getElementById('rosterClassFilter');
    if (rYearFilter && rClassFilter) {
      if (rYearFilter.children.length <= 1) {
        rYearFilter.innerHTML = '<option value="">\u5e74\u7d1a</option>' + grades.map(g => `<option value="${g}">${gradesMap[g] || g}</option>`).join('');
      }
      const selYear = rYearFilter.value;
      const validClasses = Array.from(new Set(students.filter(s => !selYear || (s.className && s.className[2] === selYear)).map(s => s.className).filter(Boolean))).sort();
      const currentClass = rClassFilter.value;
      rClassFilter.innerHTML = '<option value="">\u73ed\u7d1a</option>' + validClasses.map(c => `<option value="${c}">${c}</option>`).join('');
      if (validClasses.includes(currentClass)) rClassFilter.value = currentClass;
    }
    const tYearFilter = document.getElementById('thresholdEnrollYearFilter');
    const tClassFilter = document.getElementById('thresholdClassFilter');
    if (tYearFilter && tClassFilter) {
      if (tYearFilter.children.length <= 1) {
        tYearFilter.innerHTML = '<option value="">\u5e74\u7d1a</option>' + grades.map(g => `<option value="${g}">${gradesMap[g] || g}</option>`).join('');
      }
      const selYear = tYearFilter.value;
      const validClasses = Array.from(new Set(students.filter(s => !selYear || (s.className && s.className[2] === selYear)).map(s => s.className).filter(Boolean))).sort();
      const currentClass = tClassFilter.value;
      tClassFilter.innerHTML = '<option value="">\u73ed\u7d1a</option>' + validClasses.map(c => `<option value="${c}">${c}</option>`).join('');
      if (validClasses.includes(currentClass)) tClassFilter.value = currentClass;
    }
    const riYearFilter = document.getElementById('riskEnrollYearFilter');
    const riClassFilter = document.getElementById('riskClassFilter');
    if (riYearFilter && riClassFilter) {
      const riskStudents = students.filter(s => s.status === '\u4e0d\u901a\u904e');
      const riskGrades = Array.from(new Set(riskStudents.map(s => s.className && s.className[2]).filter(Boolean))).sort();
      const currentYear = riYearFilter.value;
      riYearFilter.innerHTML = '<option value="">\u5e74\u7d1a</option>' + riskGrades.map(g => `<option value="${g}">${gradesMap[g] || g}</option>`).join('');
      if (riskGrades.includes(currentYear)) riYearFilter.value = currentYear;
      const selYear = riYearFilter.value;
      const validClasses = Array.from(new Set(riskStudents.filter(s => !selYear || (s.className && s.className[2] === selYear)).map(s => s.className).filter(Boolean))).sort();
      const currentClass = riClassFilter.value;
      riClassFilter.innerHTML = '<option value="">\u73ed\u7d1a</option>' + validClasses.map(c => `<option value="${c}">${c}</option>`).join('');
      if (validClasses.includes(currentClass)) riClassFilter.value = currentClass;
    }
    const uniqueTextOptions = (values) => Array.from(new Set(
      values.map(value => String(value ?? '').trim()).filter(Boolean)
    )).sort((a, b) => a.localeCompare(b, 'zh-Hant', { numeric: true }));
    const trueYears = uniqueTextOptions(students.map(s => s.enrollYear || window.FitnessStore.getEnrollYearFromStudentId(s.studentId)));
    const admissions = uniqueTextOptions(students.map(s => s.admissionMethod));
    const identities = uniqueTextOptions(students.map(s => s.identityStatus));
    const populateDropdown = (id, options, defaultLabel) => {
      const el = document.getElementById(id);
      if (!el) return;
      const currentValue = el.value;
      el.replaceChildren(new Option(defaultLabel, ''));
      options.forEach(option => el.add(new Option(option, option)));
      el.value = options.includes(currentValue) ? currentValue : '';
    };
    populateDropdown('rosterTrueYearFilter', trueYears, '\u5165\u5b78\u5e74');
    populateDropdown('rosterAdmissionFilter', admissions, '\u5165\u5b78\u65b9\u5f0f (\u5168\u9078)');
    populateDropdown('rosterIdentityFilter', identities, '\u8eab\u5206 (\u5168\u9078)');
    populateDropdown('thresholdTrueYearFilter', trueYears, '\u5165\u5b78\u5e74');
    populateDropdown('thresholdAdmissionFilter', admissions, '\u5165\u5b78\u65b9\u5f0f (\u5168\u9078)');
    populateDropdown('thresholdIdentityFilter', identities, '\u8eab\u5206 (\u5168\u9078)');
  },
  renderStudentRoster() {
    this.renderFilterDropdowns();
    const students = this.getValidStudents();
    const search = (document.getElementById('rosterSearchInput')?.value || '').toLowerCase().trim();
    const year = document.getElementById('rosterEnrollYearFilter')?.value || '';
    const cls = document.getElementById('rosterClassFilter')?.value || '';
    const status = document.getElementById('rosterStatusFilter')?.value || '';
    const trueYear = document.getElementById('rosterTrueYearFilter')?.value || '';
    const admission = document.getElementById('rosterAdmissionFilter')?.value || '';
    const identity = document.getElementById('rosterIdentityFilter')?.value || '';
    const filtered = students.filter(s => {
      const eYear = s.className ? s.className[2] : '';
      const text = `${s.studentId} ${s.name} ${s.className} ${eYear}`.toLowerCase();
      const matchKeyword = !search || text.includes(search);
      const matchYear = !year || eYear === year;
      const matchClass = !cls || s.className === cls;
      const rStatus = this.normalizeRosterStatus(s.rosterStatus);
      const matchStatus = !status || rStatus === status;
      const sTrueYear = s.enrollYear || window.FitnessStore.getEnrollYearFromStudentId(s.studentId);
      const matchTrueYear = !trueYear || sTrueYear === trueYear;
      const matchAdmission = !admission || (s.admissionMethod && s.admissionMethod === admission);
      const matchIdentity = !identity || (s.identityStatus && s.identityStatus === identity);
      return matchKeyword && matchYear && matchClass && matchStatus && matchTrueYear && matchAdmission && matchIdentity;
    });
    this.renderHeaderSummary(filtered);
    const tbody = document.getElementById('erpRosterTbody');
    if (!tbody) return;
    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" class="text-center py-10 text-slate-400 font-bold">
            \u67e5\u7121\u7b26\u5408\u689d\u4ef6\u4e4b\u5b78\u751f\u540d\u518a\u8cc7\u6599
          </td>
        </tr>
      `;
      this.renderRosterPagination(0, 1);
      this.updateBatchActionBar();
      return;
    }
    const selectedSet = window.FitnessStore.selectedStudentIds;
    const totalPages = Math.max(1, Math.ceil(filtered.length / this.rosterPageSize));
    this.rosterPage = Math.min(Math.max(1, this.rosterPage), totalPages);
    const start = (this.rosterPage - 1) * this.rosterPageSize;
    const pageRows = filtered.slice(start, start + this.rosterPageSize);
    const e = window.SafeUI.escape.bind(window.SafeUI);
    const attr = window.SafeUI.attr.bind(window.SafeUI);
    tbody.innerHTML = pageRows.map(s => {
      const isSelected = selectedSet.has(s.studentId);
      const rosterStatus = this.normalizeRosterStatus(s.rosterStatus);
      const enrollYear = s.enrollYear || window.FitnessStore.getEnrollYearFromStudentId(s.studentId);
      const statusBadge = rosterStatus === '\u5728\u5b78'
        ? `<span class="px-3 py-1 rounded-full text-sm font-bold bg-blue-50 text-blue-700 border border-blue-200">\u5728\u5b78</span>`
        : `<span class="px-3 py-1 rounded-full text-sm font-bold bg-slate-100 text-slate-700 border border-slate-200">\u975e\u5728\u5b78</span>`;
      return `
        <tr class="${isSelected ? 'selected' : ''}">
          <td class="w-[5%] text-center">
            <input type="checkbox" 
                   onchange="AdminPortal.toggleStudentSelect('${attr(s.studentId)}', this.checked)" 
                   ${isSelected ? 'checked' : ''} 
                   class="w-4 h-4 rounded text-blue-600 border-slate-300 cursor-pointer">
          </td>
          <td class="w-[12%] font-bold text-slate-900">${e(s.className || '-')}</td>
          <td class="w-[15%] font-bold text-slate-800 font-mono">${e(s.studentId)}</td>
          <td class="w-[12%] font-bold text-blue-600">${e(s.name)}</td>
          <td class="w-[13%] font-mono text-slate-700 font-bold">${e(enrollYear)}</td>
          <td class="w-[12%] text-slate-600 font-medium">${e(s.admissionMethod || '-')}</td>
          <td class="w-[12%] text-slate-600 font-medium">${e(s.identityStatus || '-')}</td>
          <td class="w-[10%] text-center">${statusBadge}</td>
          <td class="w-[9%] text-center">
            <button onclick="AdminPortal.openRosterEditModal('${attr(s.studentId)}')" 
                    class="bg-slate-100 hover:bg-blue-50 hover:text-blue-600 border border-slate-300 px-3.5 py-1.5 rounded-lg text-sm font-bold transition-all inline-flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              \u7de8\u8f2f
            </button>
          </td>
        </tr>
      `;
    }).join('');
    this.renderRosterPagination(filtered.length, totalPages);
    this.updateBatchActionBar();
  },
  renderRosterPagination(total, totalPages) {
    const container = document.getElementById('rosterPagination');
    if (!container) return;
    const start = total ? (this.rosterPage - 1) * this.rosterPageSize + 1 : 0;
    const end = Math.min(total, this.rosterPage * this.rosterPageSize);
    container.innerHTML = `
      <span>\u986f\u793a ${start}\u2013${end}\uff0c\u5171 ${total.toLocaleString()} \u7b46\uff08\u6bcf\u9801 ${this.rosterPageSize} \u7b46\uff09</span>
      <div class="flex items-center gap-2">
        <button type="button" onclick="AdminPortal.changeRosterPage(-1)" ${this.rosterPage <= 1 ? 'disabled' : ''} class="px-3 py-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40 font-bold">\u4e0a\u4e00\u9801</button>
        <span class="font-mono font-bold text-slate-700">${this.rosterPage} / ${totalPages}</span>
        <button type="button" onclick="AdminPortal.changeRosterPage(1)" ${this.rosterPage >= totalPages ? 'disabled' : ''} class="px-3 py-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40 font-bold">\u4e0b\u4e00\u9801</button>
      </div>
    `;
  },
  changeRosterPage(delta) {
    this.rosterPage = Math.max(1, this.rosterPage + delta);
    this.renderStudentRoster();
    document.querySelector('#erpView_roster .corp-table-container')?.scrollTo({ top: 0, behavior: 'smooth' });
  },
  renderThresholdAudit() {
    this.renderFilterDropdowns();
    const students = this.getValidStudents();
    const search = (document.getElementById('thresholdSearchInput')?.value || '').toLowerCase().trim();
    const year = document.getElementById('thresholdEnrollYearFilter')?.value || '';
    const cls = document.getElementById('thresholdClassFilter')?.value || '';
    const status = document.getElementById('thresholdStatusFilter')?.value || '';
    const rStatusFilter = document.getElementById('thresholdRosterStatusFilter')?.value || '';
    const trueYear = document.getElementById('thresholdTrueYearFilter')?.value || '';
    const admission = document.getElementById('thresholdAdmissionFilter')?.value || '';
    const identity = document.getElementById('thresholdIdentityFilter')?.value || '';
    const filtered = students.filter(s => {
      const eYear = s.className ? s.className[2] : '';
      const semText = s.semesters ? Object.keys(s.semesters).filter(k => s.semesters[k] === 1).join(' ') : '';
      const text = `${s.studentId} ${s.name} ${s.className} ${s.specialIdentity} ${s.otherNotes} ${s.reason} ${semText}`.toLowerCase();
      const matchKeyword = !search || text.includes(search);
      const matchYear = !year || eYear === year;
      const matchClass = !cls || s.className === cls;
      const matchStatus = !status || s.status === status;
      const rStatus = this.normalizeRosterStatus(s.rosterStatus);
      const matchRosterStatus = !rStatusFilter || rStatus === rStatusFilter;
      const sTrueYear = s.enrollYear || window.FitnessStore.getEnrollYearFromStudentId(s.studentId);
      const matchTrueYear = !trueYear || sTrueYear === trueYear;
      const matchAdmission = !admission || (s.admissionMethod && s.admissionMethod === admission);
      const matchIdentity = !identity || (s.identityStatus && s.identityStatus === identity);
      return matchKeyword && matchYear && matchClass && matchStatus && matchRosterStatus && matchTrueYear && matchAdmission && matchIdentity;
    });
    this.renderHeaderSummary(filtered);
    const totalPages = Math.max(1, Math.ceil(filtered.length / this.thresholdPageSize));
    this.thresholdPage = Math.min(Math.max(1, this.thresholdPage), totalPages);
    const pageStart = (this.thresholdPage - 1) * this.thresholdPageSize;
    const pageRows = filtered.slice(pageStart, pageStart + this.thresholdPageSize);
    const tbody = document.getElementById('erpThresholdTbody');
    if (!tbody) return;
    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10" class="text-center py-10 text-slate-400 font-bold">
            \u67e5\u7121\u7b26\u5408\u689d\u4ef6\u4e4b\u8cc7\u6599
          </td>
        </tr>
      `;
      this.renderThresholdPagination(0);
      this.updateBatchActionBar();
      return;
    }
    const selectedSet = window.FitnessStore.selectedStudentIds;
    tbody.innerHTML = pageRows.map(s => {
      const isSelected = selectedSet.has(s.studentId);
      const isPassed = s.status === '\u901a\u904e';
      const passSemList = [];
      if (s.semesters) {
        Object.keys(s.semesters).sort().forEach(sem => {
          if (Number(s.semesters[sem]) === 1) passSemList.push(sem);
        });
      }
      let specTagHtml = '';
      if (Number(s.isTransfer) === 1 || Number(s.transferCredit) === 1) {
        specTagHtml += `<span class="pill-warning text-xs mr-1">\u8f49\u5b78\u6263\u62b5</span>`;
      }
      const specText = `${s.specialIdentity || ''} ${s.identityStatus || ''} ${s.otherNotes || ''} ${s.reason || ''}`;
      const isDisability = Number(s.isExemptAthleteOrDisabled) === 2 || /\u8eab\u969c|\u8eab\u5fc3\u969c\u7919|\u6b98\u969c|\u91ab\u7642\u514d\u6e2c/.test(specText);
      const isAthlete = Number(s.isExemptAthleteOrDisabled) === 1 || /\u9ad4\u4fdd|\u9ad4\u80b2\u4fdd\u9001|\u904b\u52d5\u4ee3\u8868\u968a/.test(specText);
      if (isDisability) {
        specTagHtml += `<span class="px-2 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200 mr-1">\u8eab\u969c\u514d\u6e2c</span>`;
      } else if (isAthlete) {
        specTagHtml += `<span class="px-2 py-0.5 rounded text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 mr-1">\u9ad4\u4fdd\u514d\u6e2c</span>`;
      } else if (Number(s.isExemptAthleteOrDisabled) > 0 || Number(s.exemptCredit) === 2 || /\u514d\u6e2c/.test(specText)) {
        specTagHtml += `<span class="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 mr-1">\u6838\u53ef\u514d\u6e2c</span>`;
      }
      if (s.otherNotes && !specTagHtml.includes(s.otherNotes)) {
        specTagHtml += `<span class="text-slate-500 text-xs">${s.otherNotes}</span>`;
      }
      const reqPass = window.FitnessStore.settings.requiredPassCount || 2;
      const calcDeficit = isPassed ? 0 : Math.max(0, reqPass - (s.passCount || 0));
      return `
        <tr class="${isSelected ? 'selected' : ''}">
          <td class="w-[3%] text-center">
            <input type="checkbox" data-student-id="${s.studentId}"
                   onchange="AdminPortal.toggleStudentSelect('${s.studentId}', this.checked)" 
                   ${isSelected ? 'checked' : ''} 
                   class="w-4 h-4 rounded text-blue-600 border-slate-300 cursor-pointer">
          </td>
          <td class="w-[12%] font-semibold text-slate-600 text-left">${s.className}</td>
          <td class="w-[11%] font-extrabold text-slate-900 font-mono text-left">${s.studentId}</td>
          <td class="w-[9%] font-extrabold text-blue-600 text-left">${s.name}</td>
          <td class="w-[10%] text-center">
            <span class="${isPassed ? 'pill-success' : 'pill-danger'} whitespace-nowrap">
              ${s.status}
            </span>
          </td>
          <td class="w-[9%] text-center font-bold font-mono text-slate-800">${s.passCount} \u6b21</td>
          <td class="w-[9%] text-center font-bold font-mono text-rose-600">${calcDeficit} \u6b21</td>
          <td class="w-[15%] text-center text-sm text-slate-600 font-mono tracking-tight">${passSemList.length > 0 ? passSemList.join('\u3001') : '-'}</td>
          <td class="w-[13%] text-center text-xs px-2">${specTagHtml || '-'}</td>
          <td class="w-[9%] text-center">
            <button onclick="AdminPortal.openThresholdEditModal('${s.studentId}')" 
                    class="bg-slate-100 hover:bg-blue-50 hover:text-blue-600 border border-slate-300 px-3.5 py-1.5 rounded-lg text-sm font-bold transition-all inline-flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              \u7de8\u8f2f
            </button>
          </td>
        </tr>
      `;
    }).join('');
    const selectAll = document.getElementById('thresholdSelectAll');
    if (selectAll) {
      const selectedOnPage = pageRows.filter(s => selectedSet.has(s.studentId)).length;
      selectAll.checked = pageRows.length > 0 && selectedOnPage === pageRows.length;
      selectAll.indeterminate = selectedOnPage > 0 && selectedOnPage < pageRows.length;
    }
    this.renderThresholdPagination(filtered.length);
    this.updateBatchActionBar();
  },
  renderThresholdPagination(total) {
    const pagination = document.getElementById('thresholdPagination');
    if (!pagination) return;
    const totalPages = Math.max(1, Math.ceil(total / this.thresholdPageSize));
    const start = total ? (this.thresholdPage - 1) * this.thresholdPageSize + 1 : 0;
    const end = Math.min(total, this.thresholdPage * this.thresholdPageSize);
    pagination.innerHTML = `
      <span>\u986f\u793a ${start}-${end}\uff0c\u5171 ${total.toLocaleString('zh-TW')} \u7b46\uff08\u6bcf\u9801 ${this.thresholdPageSize} \u7b46\uff09</span>
      <div class="flex items-center gap-2">
        <button type="button" onclick="AdminPortal.changeThresholdPage(-1)" ${this.thresholdPage <= 1 ? 'disabled' : ''} class="px-3 py-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40 font-bold">\u4e0a\u4e00\u9801</button>
        <span class="font-mono font-bold text-slate-700">${this.thresholdPage} / ${totalPages}</span>
        <button type="button" onclick="AdminPortal.changeThresholdPage(1)" ${this.thresholdPage >= totalPages ? 'disabled' : ''} class="px-3 py-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40 font-bold">\u4e0b\u4e00\u9801</button>
      </div>
    `;
  },
  changeThresholdPage(delta) {
    this.thresholdPage = Math.max(1, this.thresholdPage + delta);
    this.renderThresholdAudit();
    document.querySelector('#erpView_threshold .corp-table-container')?.scrollTo({ top: 0, behavior: 'smooth' });
  },
  toggleThresholdPageSelection(isChecked) {
    document.querySelectorAll('#erpThresholdTbody input[data-student-id]').forEach(input => {
      const studentId = input.getAttribute('data-student-id');
      if (!studentId) return;
      if (isChecked) window.FitnessStore.selectedStudentIds.add(studentId);
      else window.FitnessStore.selectedStudentIds.delete(studentId);
    });
    this.renderThresholdAudit();
  },
  openRosterEditModal(studentId) {
    const student = window.FitnessStore.getStudentById(studentId);
    if (!student) return;
    this.editingStudentId = studentId;
    const header = document.getElementById('rosterModalStudentIdHeader');
    const inputName = document.getElementById('rosterInputName');
    const inputClass = document.getElementById('rosterInputClassName');
    const inputEnrollYear = document.getElementById('rosterInputEnrollYear');
    const inputAdmissionMethod = document.getElementById('rosterInputAdmissionMethod');
    const inputIdentity = document.getElementById('rosterInputIdentity');
    const selectStatus = document.getElementById('rosterSelectRosterStatus');
    if (header) header.textContent = `\u5b78\u865f\uff1a${student.studentId}`;
    if (inputName) inputName.value = student.name || '';
    if (inputClass) inputClass.value = student.className || '';
    if (inputEnrollYear) inputEnrollYear.value = student.enrollYear || window.FitnessStore.getEnrollYearFromStudentId(student.studentId);
    if (inputAdmissionMethod) inputAdmissionMethod.value = student.admissionMethod || '';
    if (inputIdentity) inputIdentity.value = student.identityStatus || '';
    if (selectStatus) selectStatus.value = this.normalizeRosterStatus(student.rosterStatus);
    this.renderRosterCarryovers(student);
    const modal = document.getElementById('rosterEditModal');
    if (modal) modal.classList.remove('hidden');
  },
  closeRosterEditModal() {
    const modal = document.getElementById('rosterEditModal');
    if (modal) modal.classList.add('hidden');
    this.editingStudentId = null;
  },
  saveRosterEdit() {
    if (!this.editingStudentId) return;
    const inputName = document.getElementById('rosterInputName')?.value.trim();
    const inputClass = document.getElementById('rosterInputClassName')?.value.trim();
    const inputEnrollYear = document.getElementById('rosterInputEnrollYear')?.value.trim();
    const inputAdmissionMethod = document.getElementById('rosterInputAdmissionMethod')?.value.trim();
    const inputIdentity = document.getElementById('rosterInputIdentity')?.value.trim();
    const selectStatus = document.getElementById('rosterSelectRosterStatus')?.value;
    const student = window.FitnessStore.getStudentById(this.editingStudentId);
    if (!student) return;
    const updated = {
      ...student,
      name: inputName || student.name,
      className: inputClass || student.className,
      enrollYear: inputEnrollYear || student.enrollYear || '110',
      admissionMethod: inputAdmissionMethod !== undefined ? inputAdmissionMethod : student.admissionMethod,
      identityStatus: inputIdentity !== undefined ? inputIdentity : student.identityStatus,
      rosterStatus: this.normalizeRosterStatus(selectStatus || student.rosterStatus),
      updatedAt: new Date().toLocaleDateString('zh-TW')
    };
    window.FitnessStore.saveStudent(updated);
    this.closeRosterEditModal();
    this.showToast(`\u5df2\u6210\u529f\u4fee\u8a02 ${updated.name} \u7684\u5b78\u7c4d\u57fa\u672c\u8cc7\u6599`, 'success');
  },
  renderRosterCarryovers(student = null) {
    const target = student || window.FitnessStore.getStudentById(this.editingStudentId);
    const container = document.getElementById('rosterCarryoverSummary');
    if (!container || !target) return;
    const links = window.FitnessStore.normalizeRecordCarryovers(target);
    const e = window.SafeUI.escape.bind(window.SafeUI);
    const attr = window.SafeUI.attr.bind(window.SafeUI);
    if (links.length === 0) {
      container.innerHTML = `
        <div class="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-500">
          \u76ee\u524d\u6c92\u6709\u820a\u5b78\u865f\u627f\u63a5\u7d00\u9304\u3002
        </div>
      `;
      return;
    }
    container.innerHTML = links.map(link => {
      const linkedTime = link.linkedAt
        ? new Date(link.linkedAt).toLocaleString('zh-TW', { hour12: false })
        : '\u672a\u8a18\u8f09';
      return `
        <div class="rounded-xl border border-blue-200 bg-white p-3.5 shadow-2xs">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div class="min-w-0 space-y-1.5">
              <div class="flex flex-wrap items-center gap-2">
                <span class="font-mono text-sm font-black text-slate-900">${e(link.sourceStudentId)}</span>
                <span class="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">${e(link.sourceStudentName || '\u820a\u5b78\u865f')}</span>
              </div>
              <div class="text-xs font-semibold text-slate-600">\u627f\u63a5\u5b78\u671f\uff1a${e((link.semesters || []).join('\u3001') || '-')}</div>
              <div class="text-xs leading-5 text-slate-500">${e(link.note || '\u672a\u586b\u5beb\u6838\u51c6\u5099\u8a3b')}</div>
              <div class="text-[11px] text-slate-400">${e(link.linkedBy || '\u672a\u8a18\u8f09')} \u00b7 ${e(linkedTime)}</div>
            </div>
            <button type="button" onclick="AdminPortal.revokeRecordCarryover('${attr(link.id)}')" class="shrink-0 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-50">
              \u64a4\u92b7\u627f\u63a5
            </button>
          </div>
        </div>
      `;
    }).join('');
  },
  openRecordCarryoverModal() {
    const role = this.currentAdminUser?.role;
    if (!this.isAdminLoggedIn || !['super_admin', 'staff'].includes(role)) {
      this.showToast('\u53ea\u6709\u5df2\u767b\u5165\u7684\u7cfb\u7d71\u7ba1\u7406\u54e1\u6216\u4e00\u822c\u6559\u8077\u54e1\u53ef\u4ee5\u64cd\u4f5c\u8cc7\u6599\u627f\u63a5', 'warning');
      return;
    }
    const target = window.FitnessStore.getStudentById(this.editingStudentId);
    if (!target) {
      this.showToast('\u627e\u4e0d\u5230\u76ee\u524d\u7684\u65b0\u5b78\u865f\u5b78\u751f\u8cc7\u6599', 'danger');
      return;
    }
    this.carryoverSourceStudentId = null;
    this.carryoverHasNameMismatch = false;
    const setText = (id, value) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    };
    setText('carryoverTargetStudent', `${target.name || '\u672a\u547d\u540d'}\uff08${target.studentId}\uff09`);
    const sourceInput = document.getElementById('carryoverSourceStudentId');
    const noteInput = document.getElementById('carryoverApprovalNote');
    const preview = document.getElementById('carryoverSourcePreview');
    const confirmButton = document.getElementById('confirmCarryoverButton');
    if (sourceInput) sourceInput.value = '';
    if (noteInput) noteInput.value = '';
    if (preview) preview.classList.add('hidden');
    if (confirmButton) confirmButton.disabled = true;
    const modal = document.getElementById('recordCarryoverModal');
    if (modal) modal.classList.remove('hidden');
    setTimeout(() => sourceInput?.focus(), 50);
  },
  closeRecordCarryoverModal() {
    const modal = document.getElementById('recordCarryoverModal');
    if (modal) modal.classList.add('hidden');
    this.carryoverSourceStudentId = null;
    this.carryoverHasNameMismatch = false;
  },
  loadCarryoverSourcePreview() {
    const target = window.FitnessStore.getStudentById(this.editingStudentId);
    const sourceId = String(document.getElementById('carryoverSourceStudentId')?.value || '').trim();
    const source = window.FitnessStore.getStudentById(sourceId);
    const preview = document.getElementById('carryoverSourcePreview');
    const summary = document.getElementById('carryoverSourceSummary');
    const options = document.getElementById('carryoverSemesterOptions');
    const mismatchNotice = document.getElementById('carryoverNameMismatchNotice');
    const mismatchCheckbox = document.getElementById('carryoverNameMismatchConfirm');
    const confirmButton = document.getElementById('confirmCarryoverButton');
    const e = window.SafeUI.escape.bind(window.SafeUI);
    const attr = window.SafeUI.attr.bind(window.SafeUI);
    if (!target || !sourceId) {
      this.showToast('\u8acb\u5148\u8f38\u5165\u820a\u5b78\u865f', 'warning');
      return;
    }
    if (!/^\d{6,12}$/.test(sourceId)) {
      this.showToast('\u820a\u5b78\u865f\u5fc5\u9808\u70ba 6 \u81f3 12 \u78bc\u6578\u5b57', 'warning');
      if (preview) preview.classList.add('hidden');
      return;
    }
    if (sourceId === String(target.studentId)) {
      this.showToast('\u820a\u5b78\u865f\u4e0d\u53ef\u8207\u76ee\u524d\u65b0\u5b78\u865f\u76f8\u540c', 'warning');
      return;
    }
    if (!source) {
      this.showToast(`\u67e5\u7121\u820a\u5b78\u865f ${sourceId} \u7684\u5b78\u751f\u540d\u518a\u8cc7\u6599`, 'danger');
      if (preview) preview.classList.add('hidden');
      return;
    }
    const targetAlreadyCarriedTo = window.FitnessStore.getRecordCarryoverTarget(target.studentId);
    if (targetAlreadyCarriedTo) {
      this.showToast('\u76ee\u524d\u65b0\u5b78\u865f\u5df2\u4f5c\u70ba\u5176\u4ed6\u627f\u63a5\u95dc\u4fc2\u7684\u4f86\u6e90\uff0c\u4e0d\u53ef\u5f62\u6210\u591a\u5c64\u4e32\u63a5', 'danger');
      if (preview) preview.classList.add('hidden');
      return;
    }
    const linkedTarget = window.FitnessStore.getRecordCarryoverTarget(sourceId);
    if (linkedTarget && String(linkedTarget.studentId) !== String(target.studentId)) {
      this.showToast(`\u6b64\u820a\u5b78\u865f\u5df2\u627f\u63a5\u81f3 ${linkedTarget.studentId}\uff0c\u4e0d\u53ef\u91cd\u8907\u4f7f\u7528`, 'danger');
      if (preview) preview.classList.add('hidden');
      return;
    }
    if (window.FitnessStore.normalizeRecordCarryovers(source).length > 0) {
      this.showToast('\u6b64\u4f86\u6e90\u5b78\u865f\u672c\u8eab\u5df2\u6709\u627f\u63a5\u8cc7\u6599\uff0c\u4e0d\u53ef\u5f62\u6210\u591a\u5c64\u4e32\u63a5', 'danger');
      if (preview) preview.classList.add('hidden');
      return;
    }
    const sourceRecords = window.FitnessStore.getAllFitnessRecords()
      .filter(record => String(record.studentId).trim() === sourceId)
      .sort((a, b) => String(a.semester).localeCompare(String(b.semester)));
    const semesterMap = new Map();
    sourceRecords.forEach(record => semesterMap.set(String(record.semester || '').trim(), record));
    if (semesterMap.size === 0) {
      this.showToast('\u6b64\u820a\u5b78\u865f\u76ee\u524d\u6c92\u6709\u53ef\u627f\u63a5\u7684\u6aa2\u6e2c\u7d00\u9304', 'warning');
      if (preview) preview.classList.add('hidden');
      return;
    }
    const occupiedSemesters = new Set(window.FitnessStore.getFitnessRecords(target.studentId)
      .map(record => String(record.semester || '').trim()));
    this.carryoverSourceStudentId = sourceId;
    this.carryoverHasNameMismatch = String(source.name || '').trim() !== String(target.name || '').trim();
    if (summary) {
      summary.innerHTML = `
        <div class="font-bold text-slate-900">${e(source.name || '\u672a\u547d\u540d\u5b78\u751f')}</div>
        <div class="mt-1 font-mono text-xs text-slate-500">\u820a\u5b78\u865f ${e(sourceId)} \u00b7 ${e(source.className || '\u672a\u8a18\u8f09\u73ed\u7d1a')} \u00b7 ${e(this.normalizeRosterStatus(source.rosterStatus))}</div>
      `;
    }
    if (options) {
      options.innerHTML = Array.from(semesterMap.entries()).map(([semester, record]) => {
        const hasConflict = occupiedSemesters.has(semester);
        const resultText = record.status || (record.isPassed ? '\u5408\u683c' : '\u4e0d\u5408\u683c');
        return `
          <label class="flex items-center justify-between gap-3 rounded-xl border ${hasConflict ? 'border-slate-200 bg-slate-100 text-slate-400' : 'border-slate-200 bg-white hover:border-blue-300'} px-3.5 py-3">
            <span class="flex items-center gap-2.5">
              <input type="checkbox" data-carryover-semester="${attr(semester)}" ${hasConflict ? 'disabled' : 'checked'} onchange="AdminPortal.updateCarryoverConfirmState()" class="h-4 w-4 rounded border-slate-300 text-blue-600">
              <span class="font-mono text-sm font-black">${e(semester)}</span>
              <span class="text-xs font-bold ${record.isPassed || record.status === '\u5408\u683c' || record.status === '\u514d\u6e2c' ? 'text-emerald-700' : 'text-rose-700'}">${e(resultText)}</span>
            </span>
            <span class="text-[11px] font-semibold">${hasConflict ? '\u65b0\u5b78\u865f\u5df2\u6709\u6b64\u5b78\u671f\uff0c\u4e0d\u627f\u63a5' : '\u53ef\u627f\u63a5'}</span>
          </label>
        `;
      }).join('');
    }
    if (mismatchNotice) mismatchNotice.classList.toggle('hidden', !this.carryoverHasNameMismatch);
    if (mismatchCheckbox) mismatchCheckbox.checked = false;
    if (preview) preview.classList.remove('hidden');
    if (confirmButton) confirmButton.disabled = true;
    this.updateCarryoverConfirmState();
  },
  updateCarryoverConfirmState() {
    const selectedCount = document.querySelectorAll('#carryoverSemesterOptions input[data-carryover-semester]:checked').length;
    const note = String(document.getElementById('carryoverApprovalNote')?.value || '').trim();
    const mismatchConfirmed = !this.carryoverHasNameMismatch
      || Boolean(document.getElementById('carryoverNameMismatchConfirm')?.checked);
    const button = document.getElementById('confirmCarryoverButton');
    if (button) button.disabled = !(this.carryoverSourceStudentId && selectedCount > 0 && note && mismatchConfirmed);
  },
  confirmRecordCarryover() {
    const target = window.FitnessStore.getStudentById(this.editingStudentId);
    if (!target || !this.carryoverSourceStudentId) return;
    const semesters = Array.from(document.querySelectorAll('#carryoverSemesterOptions input[data-carryover-semester]:checked'))
      .map(input => input.getAttribute('data-carryover-semester'));
    const note = String(document.getElementById('carryoverApprovalNote')?.value || '').trim();
    const confirmedNameMismatch = !this.carryoverHasNameMismatch
      || Boolean(document.getElementById('carryoverNameMismatchConfirm')?.checked);
    const roleText = this.currentAdminUser?.role === 'super_admin' ? '\u7cfb\u7d71\u7ba1\u7406\u54e1' : '\u4e00\u822c\u6559\u8077\u54e1';
    if (!confirm(`\u78ba\u5b9a\u8b93\u65b0\u5b78\u865f ${target.studentId} \u627f\u63a5\u820a\u5b78\u865f ${this.carryoverSourceStudentId} \u7684 ${semesters.length} \u500b\u5b78\u671f\u8cc7\u6599\u55ce\uff1f\n\n\u539f\u59cb\u6210\u7e3e\u4e0d\u6703\u88ab\u6539\u5beb\uff0c\u820a\u5b78\u865f\u5c07\u505c\u6b62\u524d\u53f0\u67e5\u8a62\u3002`)) return;
    try {
      window.FitnessStore.carryOverStudentRecords(
        target.studentId,
        this.carryoverSourceStudentId,
        semesters,
        note,
        {
          name: this.currentAdminUser?.name || '',
          account: this.currentAdminUser?.account || this.currentAdminUser?.username || '',
          role: this.currentAdminUser?.role || '',
          confirmedNameMismatch
        }
      );
      const updated = window.FitnessStore.getStudentById(target.studentId);
      this.renderRosterCarryovers(updated);
      this.closeRecordCarryoverModal();
      this.renderStudentRoster();
      this.showToast(`${roleText}\u5df2\u5b8c\u6210\u820a\u5b78\u865f\u8cc7\u6599\u627f\u63a5\uff0c\u7562\u696d\u9580\u6abb\u5df2\u91cd\u65b0\u8a08\u7b97`, 'success');
    } catch (error) {
      this.showToast(`\u627f\u63a5\u5931\u6557\uff1a${error.message || '\u8cc7\u6599\u6aa2\u6838\u672a\u901a\u904e'}`, 'danger');
    }
  },
  revokeRecordCarryover(carryoverId) {
    const target = window.FitnessStore.getStudentById(this.editingStudentId);
    const link = window.FitnessStore.normalizeRecordCarryovers(target)
      .find(item => String(item.id) === String(carryoverId));
    if (!target || !link) {
      this.showToast('\u627e\u4e0d\u5230\u8981\u64a4\u92b7\u7684\u627f\u63a5\u7d00\u9304', 'danger');
      return;
    }
    if (!confirm(`\u78ba\u5b9a\u64a4\u92b7\u820a\u5b78\u865f ${link.sourceStudentId} \u7684\u8cc7\u6599\u627f\u63a5\u55ce\uff1f\n\n\u539f\u59cb\u6210\u7e3e\u4e0d\u6703\u522a\u9664\uff0c\u65b0\u5b78\u865f\u7684\u9580\u6abb\u5c07\u91cd\u65b0\u8a08\u7b97\u3002`)) return;
    try {
      window.FitnessStore.revokeStudentRecordCarryover(target.studentId, carryoverId, {
        name: this.currentAdminUser?.name || ''
      });
      const updated = window.FitnessStore.getStudentById(target.studentId);
      this.renderRosterCarryovers(updated);
      this.renderStudentRoster();
      this.showToast('\u5df2\u64a4\u92b7\u820a\u5b78\u865f\u627f\u63a5\u4e26\u91cd\u65b0\u8a08\u7b97\u7562\u696d\u9580\u6abb', 'success');
    } catch (error) {
      this.showToast(`\u64a4\u92b7\u5931\u6557\uff1a${error.message || '\u8acb\u7a0d\u5f8c\u518d\u8a66'}`, 'danger');
    }
  },
  openThresholdEditModal(studentId) {
    const student = window.FitnessStore.getStudentById(studentId);
    if (!student) return;
    this.editingStudentId = studentId;
    const header = document.getElementById('thresholdModalStudentHeader');
    const inputPassCount = document.getElementById('thresholdInputPassCount');
    const selectStatus = document.getElementById('thresholdSelectStatus');
    const selectTransfer = document.getElementById('thresholdSelectTransfer');
    const selectAthlete = document.getElementById('thresholdSelectAthlete');
    const inputNotes = document.getElementById('thresholdInputNotes');
    if (header) header.textContent = `\u5b78\u865f\uff1a${student.studentId} | \u5b78\u751f\uff1a${student.name} (${student.className})`;
    if (inputPassCount) inputPassCount.value = student.passCount || 0;
    if (selectStatus) selectStatus.value = student.status || '\u4e0d\u901a\u904e';
    if (selectTransfer) selectTransfer.value = student.isTransfer || 0;
    if (selectAthlete) {
      const specText = `${student.specialIdentity || ''} ${student.identityStatus || ''} ${student.otherNotes || ''} ${student.reason || ''}`;
      const isDisability = Number(student.isExemptAthleteOrDisabled) === 2 || /\u8eab\u969c|\u8eab\u5fc3\u969c\u7919|\u6b98\u969c|\u91ab\u7642\u514d\u6e2c/.test(specText);
      const isAthlete = (Number(student.isExemptAthleteOrDisabled) === 1 && !/\u8eab\u969c|\u8eab\u5fc3\u969c\u7919|\u6b98\u969c/.test(specText)) || /\u9ad4\u4fdd|\u9ad4\u80b2\u4fdd\u9001|\u904b\u52d5\u4ee3\u8868\u968a/.test(specText);
      if (isDisability) {
        selectAthlete.value = 2; // 2: \u8eab\u5fc3\u969c\u7919\u514d\u6e2c
      } else if (isAthlete) {
        selectAthlete.value = 1; // 1: \u9ad4\u4fdd\u751f\u514d\u6e2c
      } else if (Number(student.isExemptAthleteOrDisabled) > 0 || Number(student.exemptCredit) === 2 || /\u514d\u6e2c/.test(specText)) {
        selectAthlete.value = 3; // 3: \u6838\u53ef\u514d\u6e2c (\u5176\u4ed6)
      } else {
        selectAthlete.value = 0; // 0: \u5426 (\u6b63\u5e38\u61c9\u6e2c)
      }
    }
    if (inputNotes) inputNotes.value = student.reason || student.otherNotes || '';
    this.renderThresholdSemesterCheckboxes(student.semesters || {});
    const modal = document.getElementById('thresholdEditModal');
    if (modal) modal.classList.remove('hidden');
  },
  renderThresholdSemesterCheckboxes(semMap) {
    const defaultSems = ["1101", "1102", "1111", "1112", "1121", "1122", "1131", "1132"];
    const container = document.getElementById('thresholdSemesterCheckboxes');
    if (!container) return;
    container.innerHTML = defaultSems.map(sem => {
      const isChecked = Number(semMap[sem]) === 1;
      return `
        <label class="flex items-center gap-1.5 p-1.5 rounded border bg-white cursor-pointer hover:bg-slate-100">
          <input type="checkbox" data-sem-key="${sem}" ${isChecked ? 'checked' : ''} class="w-4 h-4 rounded text-blue-600 border-slate-300">
          <span class="font-mono text-xs font-bold text-slate-700">${sem}</span>
        </label>
      `;
    }).join('');
  },
  closeThresholdEditModal() {
    const modal = document.getElementById('thresholdEditModal');
    if (modal) modal.classList.add('hidden');
    this.editingStudentId = null;
  },
  saveThresholdEdit() {
    if (!this.editingStudentId) return;
    const inputPassCount = parseInt(document.getElementById('thresholdInputPassCount')?.value || '0', 10);
    const selectStatus = document.getElementById('thresholdSelectStatus')?.value;
    const selectTransfer = parseInt(document.getElementById('thresholdSelectTransfer')?.value || '0', 10);
    const selectAthlete = parseInt(document.getElementById('thresholdSelectAthlete')?.value || '0', 10);
    const inputNotes = document.getElementById('thresholdInputNotes')?.value.trim();
    const semCheckboxes = document.querySelectorAll('#thresholdSemesterCheckboxes input[data-sem-key]');
    const updatedSemesters = {};
    let semPassSum = 0;
    semCheckboxes.forEach(cb => {
      const key = cb.getAttribute('data-sem-key');
      const val = cb.checked ? 1 : 0;
      updatedSemesters[key] = val;
      if (val === 1) semPassSum++;
    });
    const currentStudent = window.FitnessStore.getStudentById(this.editingStudentId);
    if (!currentStudent) return;
    const transferAdd = selectTransfer === 1 ? 1 : 0;
    const exemptAdd = (selectAthlete > 0) ? 2 : 0;
    let calculatedPassCount = semPassSum + transferAdd + exemptAdd;
    let finalPassCount = Math.max(inputPassCount, calculatedPassCount);
    const reqPass = window.FitnessStore.settings.requiredPassCount || 2;
    let finalStatus = selectStatus || '\u4e0d\u901a\u904e';
    const isExempt = selectAthlete > 0 || exemptAdd > 0;
    if (isExempt) {
      finalStatus = '\u901a\u904e';
    } else if (finalPassCount >= reqPass) {
      finalStatus = '\u901a\u904e';
    }
    let updatedSpecialIdentity = currentStudent.specialIdentity || '';
    if (selectAthlete === 1) updatedSpecialIdentity = '\u9ad4\u4fdd\u751f';
    else if (selectAthlete === 2) updatedSpecialIdentity = '\u8eab\u5fc3\u969c\u7919';
    else if (selectAthlete === 3) updatedSpecialIdentity = '\u6838\u53ef\u514d\u6e2c';
    const updated = {
      ...currentStudent,
      passCount: finalPassCount,
      status: finalStatus,
      isTransfer: selectTransfer,
      transferCredit: transferAdd,
      isExemptAthleteOrDisabled: selectAthlete,
      specialIdentity: updatedSpecialIdentity,
      exemptCredit: exemptAdd,
      reason: inputNotes,
      semesters: updatedSemesters,
      updatedAt: new Date().toLocaleDateString('zh-TW')
    };
    updated.deficitCount = updated.status === '\u901a\u904e' ? 0 : Math.max(0, reqPass - updated.passCount);
    window.FitnessStore.saveStudent(updated);
    this.closeThresholdEditModal();
    this.showToast(`\u5df2\u6210\u529f\u4fee\u8a02 ${updated.name} \u4e4b\u9580\u6abb\u8207\u8f49\u5b78\u6263\u62b5\u8cc7\u6599`, 'success');
  },
  toggleStudentSelect(studentId, isSelected) {
    if (isSelected) {
      window.FitnessStore.selectedStudentIds.add(studentId);
    } else {
      window.FitnessStore.selectedStudentIds.delete(studentId);
    }
    this.renderCurrentView();
  },
  toggleSelectAll(isChecked) {
    const students = window.FitnessStore.getStudents();
    if (isChecked) {
      students.forEach(s => window.FitnessStore.selectedStudentIds.add(s.studentId));
    } else {
      window.FitnessStore.selectedStudentIds.clear();
    }
    this.renderCurrentView();
  },
  updateBatchActionBar() {
    const bar = document.getElementById('batchActionBar');
    const badge = document.getElementById('batchSelectedCountBadge');
    const count = window.FitnessStore.selectedStudentIds.size;
    if (count > 0 && (this.activeView === 'roster' || this.activeView === 'threshold')) {
      if (bar) bar.classList.remove('hidden');
      if (badge) badge.textContent = count;
    } else {
      if (bar) bar.classList.add('hidden');
    }
  },
  batchPassSelected() {
    const ids = Array.from(window.FitnessStore.selectedStudentIds);
    if (ids.length === 0) return;
    window.FitnessStore.batchUpdateStatus(ids, '\u901a\u904e');
    window.FitnessStore.selectedStudentIds.clear();
    this.showToast(`\u5df2\u6210\u529f\u8a2d\u5b9a ${ids.length} \u4f4d\u5b78\u751f\u70ba\u300c\u901a\u904e\u300d`, 'success');
  },
  batchFailSelected() {
    const ids = Array.from(window.FitnessStore.selectedStudentIds);
    if (ids.length === 0) return;
    window.FitnessStore.batchUpdateStatus(ids, '\u4e0d\u901a\u904e');
    window.FitnessStore.selectedStudentIds.clear();
    this.showToast(`\u5df2\u6210\u529f\u8a2d\u5b9a ${ids.length} \u4f4d\u5b78\u751f\u70ba\u300c\u4e0d\u901a\u904e\u300d`, 'warning');
  },
  batchCopyEmails() {
    const students = this.getValidStudents();
    const domain = window.FitnessStore.settings.schoolDomain || 'mail.edu.tw';
    let ids = [];
    if (this.activeView === 'risk') {
      if (this.selectedRiskIds.size > 0) {
        ids = Array.from(this.selectedRiskIds);
      } else {
        const search = (document.getElementById('riskSearchInput')?.value || '').toLowerCase().trim();
        const year = document.getElementById('riskEnrollYearFilter')?.value || '';
        const cls = document.getElementById('riskClassFilter')?.value || '';
        ids = students.filter(s => s.status === '\u4e0d\u901a\u904e').filter(s => {
          const eYear = s.className ? s.className[2] : '';
          const text = `${s.studentId} ${s.name} ${s.className}`.toLowerCase();
          const matchKeyword = !search || text.includes(search);
          const matchYear = !year || eYear === year;
          const matchClass = !cls || s.className === cls;
          return matchKeyword && matchYear && matchClass;
        }).map(s => s.studentId);
      }
    } else {
      ids = Array.from(window.FitnessStore.selectedStudentIds);
      if (ids.length === 0) {
        ids = students.filter(s => s.status === '\u4e0d\u901a\u904e').map(s => s.studentId);
      }
    }
    if (ids.length === 0) {
      this.showToast('\u76ee\u524d\u7121\u53ef\u8907\u88fd Email \u7684\u5b78\u751f', 'warning');
      return;
    }
    const emailList = ids.map(id => `s${id}@${domain}`).join('; ');
    navigator.clipboard.writeText(emailList).then(() => {
      this.showToast(`\u5df2\u8907\u88fd ${ids.length} \u4f4d\u5b78\u751f\u7684 Email \u81f3\u526a\u8cbc\u7c3f`, 'success');
    }).catch(err => {
      this.showToast(`\u8907\u88fd\u5931\u6557\uff1a${err}`, 'danger');
    });
  },
  generateRiskEML() {
    this.openEmlPreviewModal();
  },
  openEmlPreviewModal() {
    const students = this.getValidStudents();
    const domain = window.FitnessStore.settings.schoolDomain || 'mail.edu.tw';
    let targetStudents = [];
    if (this.selectedRiskIds.size > 0) {
      targetStudents = students.filter(s => this.selectedRiskIds.has(s.studentId));
    } else {
      const search = (document.getElementById('riskSearchInput')?.value || '').toLowerCase().trim();
      const year = document.getElementById('riskEnrollYearFilter')?.value || '';
      const cls = document.getElementById('riskClassFilter')?.value || '';
      targetStudents = students.filter(s => s.status === '\u4e0d\u901a\u904e').filter(s => {
        const eYear = s.className ? s.className[2] : '';
        const text = `${s.studentId} ${s.name} ${s.className}`.toLowerCase();
        const matchKeyword = !search || text.includes(search);
        const matchYear = !year || eYear === year;
        const matchClass = !cls || s.className === cls;
        return matchKeyword && matchYear && matchClass;
      });
    }
    if (targetStudents.length === 0) {
      this.showToast('\u6240\u9078\u6216\u76ee\u524d\u7be9\u9078\u689d\u4ef6\u4e0b\u7121\u672a\u5408\u683c\u5b78\u751f\uff01', 'warning');
      return;
    }
    this.currentEmlTargetStudents = targetStudents;
    const summaryEl = document.getElementById('emlPreviewRecipientSummary');
    if (summaryEl) {
      summaryEl.textContent = `\u5c07\u767c\u9001\u81f3 ${targetStudents.length} \u4f4d\u672a\u5408\u683c\u5b78\u751f (\u5305\u542b ${targetStudents.slice(0, 3).map(s => s.name).join('\u3001')}${targetStudents.length > 3 ? '...\u7b49' : ''})`;
    }
    const dateStr = new Date().toLocaleDateString('zh-TW');
    document.getElementById('emlSubjectInput').value = "\u3010\u91cd\u8981\u63d0\u9192\u3011\u9ad4\u9069\u80fd\u7562\u696d\u9580\u6abb\u672a\u5408\u683c\u901a\u77e5\u53ca\u88dc\u6e2c\u8aaa\u660e";
    document.getElementById('emlSenderInput').value = "\u5b78\u52d9\u8655 \u9ad4\u80b2\u53ca\u6d3b\u52d5\u7d44";
    this.resetEmlTemplateToDefault();
    const modal = document.getElementById('emlPreviewModal');
    if (modal) modal.classList.remove('hidden');
  },
  closeEmlPreviewModal() {
    const modal = document.getElementById('emlPreviewModal');
    if (modal) modal.classList.add('hidden');
  },
  resetEmlTemplateToDefault() {
    const reqPassCount = window.FitnessStore.settings.requiredPassCount || 2;
    const defaultText = [
      `\u540c\u5b78 \u60a8\u597d\uff1a`,
      ``,
      `\u7d93\u6838\u7b97\uff0c\u60a8\u76ee\u524d\u7684\u9ad4\u9069\u80fd\u7562\u696d\u9580\u6abb\u5c1a\u672a\u9054\u6a19\uff08\u672c\u6821\u7562\u696d\u9580\u6abb\u70ba\u9700\u901a\u904e ${reqPassCount} \u6b21\u9ad4\u9069\u80fd\u6aa2\u6e2c\uff09\u3002`,
      ``,
      `\u26a0\ufe0f \u8acb\u6ce8\u610f\uff1a\u672a\u901a\u904e\u9ad4\u9069\u80fd\u7562\u696d\u9580\u6abb\u5c07\u5f71\u97ff\u7562\u696d\u8cc7\u683c\uff0c\u8acb\u52d9\u5fc5\u95dc\u6ce8\u672c\u5b78\u671f\u88dc\u6e2c\u516c\u544a\u8207\u5831\u540d\u6642\u9593\uff01`,
      ``,
      `\u60a8\u53ef\u4ee5\u81f3\u672c\u6821\u9ad4\u9069\u80fd\u67e5\u8a62\u5e73\u53f0\uff0c\u78ba\u8a8d\u500b\u4eba\u6aa2\u6e2c\u6b77\u53f2\u7d00\u9304\u8207\u5404\u55ae\u9805\u6210\u7e3e\uff1a`,
      `\ud83d\udd17 \u67e5\u8a62\u5e73\u53f0\uff1a\u9ede\u6b64\u958b\u555f\u9ad4\u9069\u80fd\u67e5\u8a62\u5e73\u53f0\uff0c`,
      `\ud83d\udcc4 \u898f\u7ae0\u7d30\u5247\uff1a\u9ede\u6b64\u67e5\u770b\u300c\u5b78\u751f\u9ad4\u9069\u80fd\u7562\u696d\u689d\u4ef6\u5be6\u65bd\u7d30\u5247 (PDF)\u300d\uff0c`,
      ``,
      `\u82e5\u7b26\u5408\u514d\u6e2c\u689d\u4ef6\uff08\u5982\u6301\u6709\u8eab\u5fc3\u969c\u7919\u8b49\u660e\u3001\u5c6c\u672c\u6821\u904b\u52d5\u6821\u968a\u7b49\uff09\uff0c\u8acb\u5099\u59a5\u76f8\u95dc\u8b49\u660e\u6587\u4ef6\u81f3\u672c\u7d44\u8fa6\u7406\u3002`
    ].join('\n');
    document.getElementById('emlBodyTextarea').value = defaultText;
  },
  downloadCustomizedEml() {
    if (!this.currentEmlTargetStudents || this.currentEmlTargetStudents.length === 0) {
      this.showToast('\u76ee\u6a19\u5b78\u751f\u540d\u55ae\u5df2\u5931\u6548\uff0c\u8acb\u91cd\u65b0\u958b\u555f\u9810\u89bd\uff01', 'warning');
      return;
    }
    const domain = window.FitnessStore.settings.schoolDomain || 'mail.edu.tw';
    const studentEmails = this.currentEmlTargetStudents.map(s => `s${s.studentId}@${domain}`).join(', ');
    const subjectStr = document.getElementById('emlSubjectInput')?.value?.trim() || '\u3010\u91cd\u8981\u63d0\u9192\u3011\u9ad4\u9069\u80fd\u7562\u696d\u9580\u6abb\u672a\u5408\u683c\u901a\u77e5\u53ca\u88dc\u6e2c\u8aaa\u660e';
    const senderStr = document.getElementById('emlSenderInput')?.value?.trim() || '\u5b78\u52d9\u8655 \u9ad4\u80b2\u53ca\u6d3b\u52d5\u7d44';
    const bodyText = document.getElementById('emlBodyTextarea')?.value || '';
    const encodeHeaderStr = (str) => `=?UTF-8?B?${btoa(unescape(encodeURIComponent(str)))}?=`;
    const fromHeader = `${encodeHeaderStr(senderStr)} <pe-office@${domain}>`;
    const subjectHeader = encodeHeaderStr(subjectStr);
    const paragraphs = bodyText.split(/\n\s*\n/).filter(p => p.trim() !== '');
    const formattedHtmlBody = paragraphs.map(pText => {
      let htmlLines = pText.split('\n').map(line => {
        let trimmed = line.trim();
        if (!trimmed) return '';
        if (trimmed.includes('\ud83d\udd17 \u67e5\u8a62\u5e73\u53f0\uff1a')) {
          return `\ud83d\udd17 <strong>\u67e5\u8a62\u5e73\u53f0\uff1a</strong><a href="${location.origin}${location.pathname}" style="color: #2563eb; font-weight: bold; text-decoration: underline;">\u9ede\u6b64\u958b\u555f\u9ad4\u9069\u80fd\u67e5\u8a62\u5e73\u53f0</a>\uff0c`;
        }
        if (trimmed.includes('\ud83d\udcc4 \u898f\u7ae0\u7d30\u5247\uff1a')) {
          return `\ud83d\udcc4 <strong>\u898f\u7ae0\u7d30\u5247\uff1a</strong><a href="https://jbagt.just.edu.tw/rule/rules/A003-114-11-26-yEO.pdf" target="_blank" style="color: #2563eb; font-weight: bold; text-decoration: underline;">\u9ede\u6b64\u67e5\u770b\u300c\u5b78\u751f\u9ad4\u9069\u80fd\u7562\u696d\u689d\u4ef6\u5be6\u65bd\u7d30\u5247 (PDF)\u300d</a>\uff0c`;
        }
        return trimmed;
      }).filter(Boolean).join('<br>\r\n');
      if (pText.includes('\u26a0\ufe0f \u8acb\u6ce8\u610f\uff1a')) {
        return `<p style="color: #e11d48; font-weight: bold; margin: 0 0 16px 0;">${htmlLines}</p>`;
      }
      return `<p style="margin: 0 0 16px 0;">${htmlLines}</p>`;
    }).join('\r\n');
    const emlContent = [
      `From: ${fromHeader}`,
      `To: ${studentEmails}`,
      `Subject: ${subjectHeader}`,
      `MIME-Version: 1.0`,
      `X-Unsent: 1`,
      `Content-Type: text/html; charset="utf-8"`,
      `Content-Transfer-Encoding: 8bit`,
      ``,
      `<!DOCTYPE html>`,
      `<html>`,
      `<head>`,
      `  <meta charset="utf-8">`,
      `</head>`,
      `<body style="font-family: 'Microsoft JhengHei', '\u5fae\u8edf\u6b63\u9ed1\u9ad4', Arial, sans-serif; font-size: 15px; color: #1e293b; line-height: 1.8; background-color: #ffffff; padding: 20px;">`,
      `  <div style="max-width: 640px; margin: 0 auto;">`,
      formattedHtmlBody,
      `    <p style="margin: 24px 0 0 0; font-weight: bold; color: #1e293b; font-size: 15px;">${senderStr} \u656c\u555f</p>`,
      `  </div>`,
      `</body>`,
      `</html>`
    ].join('\r\n');
    const blob = new Blob(['\uFEFF' + emlContent], { type: 'message/rfc822;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const filenameDate = new Date().toISOString().slice(0, 10);
    a.download = `\u672a\u5408\u683c\u5b78\u751f\u901a\u77e5\u4fe1\u8349\u7a3f_${this.currentEmlTargetStudents.length}\u4eba_${filenameDate}.eml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.closeEmlPreviewModal();
    this.showToast(`\ud83c\udf89 \u6210\u529f\u7522\u751f\u4e26\u4e0b\u8f09\u5305\u542b ${this.currentEmlTargetStudents.length} \u4f4d\u672a\u5408\u683c\u5b78\u751f\u7684\u81ea\u8a02 EML \u90f5\u4ef6\u8349\u7a3f\uff01`, 'success');
  },
  renderDashboard() {
    this.renderHeaderSummary();
    const searchInput = document.getElementById('individualSearchInput');
    if (searchInput) searchInput.value = '';
    const resultArea = document.getElementById('individualSearchResultArea');
    const emptyArea = document.getElementById('individualSearchEmpty');
    if (resultArea) resultArea.classList.add('hidden');
    if (emptyArea) emptyArea.classList.add('hidden');
  },
  searchIndividualRecord() {
    const searchInput = document.getElementById('individualSearchInput');
    if (!searchInput) return;
    const query = searchInput.value.trim().toLowerCase();
    const resultArea = document.getElementById('individualSearchResultArea');
    const emptyArea = document.getElementById('individualSearchEmpty');
    if (!query) {
      resultArea.classList.add('hidden');
      emptyArea.classList.add('hidden');
      return;
    }
    const students = window.FitnessStore.getStudents();
    const student = students.find(s => s.studentId.toLowerCase() === query || s.name.toLowerCase() === query);
    if (!student) {
      resultArea.classList.add('hidden');
      emptyArea.classList.remove('hidden');
      return;
    }
    document.getElementById('indivProfileClass').textContent = student.className || '\u672a\u77e5\u73ed\u7d1a';
    document.getElementById('indivProfileId').textContent = student.studentId;
    document.getElementById('indivProfileName').textContent = student.name;
    const enrollStatusEl = document.getElementById('indivProfileEnrollStatus');
    const rStatus = this.normalizeRosterStatus(student.rosterStatus);
    enrollStatusEl.textContent = rStatus;
    if (rStatus === '\u5728\u5b78') enrollStatusEl.className = 'px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200';
    else enrollStatusEl.className = 'px-2 py-0.5 rounded-full text-xs font-bold bg-slate-50 text-slate-600 border border-slate-200';
    document.getElementById('indivProfilePassCount').textContent = student.passCount || 0;
    const reqPass = window.FitnessStore.settings.requiredPassCount || 2;
    const deficit = student.status === '\u901a\u904e' ? 0 : Math.max(0, reqPass - (student.passCount || 0));
    const deficitEl = document.getElementById('indivProfileDeficit');
    deficitEl.textContent = deficit;
    deficitEl.className = deficit > 0 ? 'text-[36px] font-black text-rose-500 font-mono leading-none' : 'text-[36px] font-black text-emerald-600 font-mono leading-none';
    const specialEl = document.getElementById('indivProfileSpecial');
    const specialTags = [];
    if (student.isExemptAthleteOrDisabled) specialTags.push('\u514d\u6e2c(\u9ad4\u4fdd/\u8eab\u969c)');
    if (student.transferCredit > 0) specialTags.push('\u8f49\u5b78\u62b5\u514d');
    if (student.manualStatusOverride) specialTags.push('\u624b\u52d5\u5f37\u5236\u8986\u5beb');
    if (specialTags.length === 1 && specialTags[0] === '\u514d\u6e2c(\u9ad4\u4fdd/\u8eab\u969c)') {
      specialEl.className = 'mt-4 flex flex-col items-center leading-none';
      specialEl.innerHTML = '<span class="text-[30px] font-black text-amber-700">\u514d\u6e2c</span><span class="text-[13px] font-semibold text-amber-700 mt-2">\u9ad4\u4fdd\uff0f\u8eab\u969c</span>';
    } else if (specialTags.length > 0) {
      specialEl.className = 'text-[15px] font-bold text-amber-700 mt-4 leading-relaxed';
      specialEl.textContent = specialTags.join('\u3001');
    } else {
      specialEl.className = 'text-[30px] font-black text-slate-400 mt-4 leading-none';
      specialEl.textContent = '\u7121';
    }
    const statusEl = document.getElementById('indivProfileStatus');
    const statusPanelEl = document.getElementById('indivProfileStatusPanel');
    const statusIconEl = document.getElementById('indivProfileStatusIcon');
    if (student.status === '\u901a\u904e') {
      statusEl.className = 'text-[28px] font-black text-emerald-700 tracking-tight leading-none';
      statusEl.textContent = '\u901a\u904e';
      statusPanelEl.className = 'min-h-[132px] rounded-2xl bg-emerald-50/60 border border-emerald-200 px-3 py-4 flex flex-col items-center justify-center text-center';
      statusIconEl.className = 'w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0';
      statusIconEl.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>';
    } else {
      statusEl.className = 'text-[28px] font-black text-rose-700 tracking-tight leading-none';
      statusEl.textContent = '\u672a\u5408\u683c';
      statusPanelEl.className = 'min-h-[132px] rounded-2xl bg-rose-50/60 border border-rose-200 px-3 py-4 flex flex-col items-center justify-center text-center';
      statusIconEl.className = 'w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0';
      statusIconEl.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/></svg>';
    }
    const records = window.FitnessStore.getFitnessRecords(student.studentId);
    records.sort((a, b) => a.semester.localeCompare(b.semester));
    const tbody = document.getElementById('individualRecordsTbody');
    if (records.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center py-10 text-slate-500 font-bold">\u8a72\u5b78\u751f\u76ee\u524d\u7121\u4efb\u4f55\u6e2c\u9a57\u660e\u7d30\u7d00\u9304</td></tr>`;
    } else {
      tbody.innerHTML = records.map(r => {
        const scores = r.scores || {};
        const isPassed = r.isPassed;
        const resultHtml = isPassed 
          ? `<span class="pill-success text-xs px-2 py-1">\u5408\u683c</span>`
          : `<span class="pill-danger text-rose-700 text-xs px-2 py-1">\u672a\u5408\u683c</span>`;
        return `
          <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
            <td class="w-[10%] text-center font-bold text-slate-800 font-mono">
              <div>${r.semester}</div>
              ${r.isCarriedRecord ? `<div class="mt-1 text-[10px] font-bold text-blue-600" title="\u539f\u59cb\u5b78\u865f ${window.SafeUI.escape(r.carriedFromStudentId)}">\u820a\u5b78\u865f\u627f\u63a5</div>` : ''}
            </td>
            <td class="w-[10%] text-center font-mono ${!isPassed ? 'text-rose-600 font-semibold' : 'text-slate-600'}">${scores.height || '-'}</td>
            <td class="w-[10%] text-center font-mono ${!isPassed ? 'text-rose-600 font-semibold' : 'text-slate-600'}">${scores.weight || '-'}</td>
            <td class="w-[15%] text-center font-mono ${!isPassed ? 'text-rose-600 font-semibold' : 'text-slate-600'}">${scores.sitAndReach || '-'}</td>
            <td class="w-[15%] text-center font-mono ${!isPassed ? 'text-rose-600 font-semibold' : 'text-slate-600'}">${scores.standingLongJump || '-'}</td>
            <td class="w-[15%] text-center font-mono ${!isPassed ? 'text-rose-600 font-semibold' : 'text-slate-600'}">${scores.sitUps || '-'}</td>
            <td class="w-[15%] text-center font-mono ${!isPassed ? 'text-rose-600 font-semibold' : 'text-slate-600'}">${String(scores.cardio || '-').replace('\u767b\u968e:', '')}</td>
            <td class="w-[10%] text-center">${resultHtml}</td>
          </tr>
        `;
      }).join('');
    }
    emptyArea.classList.add('hidden');
    resultArea.classList.remove('hidden');
  },
  renderAnalytics() {
    const students = this.getValidStudents();
    const classStats = {};
    students.forEach(s => {
      const cls = s.className || '\u672a\u6307\u5b9a\u73ed\u7d1a';
      if (!classStats[cls]) {
        classStats[cls] = { total: 0, passed: 0, failed: 0 };
      }
      classStats[cls].total++;
      if (s.status === '\u901a\u904e') classStats[cls].passed++;
      else classStats[cls].failed++;
    });
    const tbody = document.getElementById('erpAnalyticsTbody');
    if (!tbody) return;
    const sortedClasses = Object.keys(classStats).sort();
    if (sortedClasses.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-slate-400">\u5c1a\u7121\u73ed\u7d1a\u6578\u64da</td></tr>';
      return;
    }
    const escape = window.SafeUI?.escape
      ? window.SafeUI.escape.bind(window.SafeUI)
      : (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
          '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[char]);
    tbody.innerHTML = sortedClasses.map(cls => {
      const stat = classStats[cls];
      const rate = stat.total > 0 ? Math.round((stat.passed / stat.total) * 100) : 0;
      const encodedClass = encodeURIComponent(cls);
      return `
        <tr class="hover:bg-slate-50/80 transition-colors">
          <td>
            <button type="button" onclick="AdminPortal.openClassDrilldown('${encodedClass}', 'threshold')" class="inline-flex items-center gap-1.5 font-bold text-blue-700 hover:text-blue-900 hover:underline underline-offset-4" title="\u67e5\u770b ${escape(cls)} \u7684\u9580\u6abb\u660e\u7d30">
              <span>${escape(cls)}</span>
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
          </td>
          <td>${stat.total} \u4eba</td>
          <td class="font-bold text-emerald-600">${stat.passed} \u4eba</td>
          <td>${stat.failed > 0 ? `
            <button type="button" onclick="AdminPortal.openClassDrilldown('${encodedClass}', 'risk')" class="inline-flex items-center gap-1 font-bold text-rose-600 hover:text-rose-800 hover:underline underline-offset-4" title="\u67e5\u770b ${escape(cls)} \u7684\u672a\u5408\u683c\u540d\u55ae">
              <span>${stat.failed} \u4eba</span>
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>` : '<span class="font-bold text-slate-400">0 \u4eba</span>'}
          </td>
          <td>
            <div class="flex items-center gap-2">
              <span class="font-bold text-slate-700 w-10">${rate}%</span>
              <div class="w-40 h-2.5 bg-slate-100 rounded overflow-hidden border">
                <div class="h-full ${rate >= 70 ? 'bg-emerald-500' : 'bg-rose-500'}" style="width: ${rate}%;"></div>
              </div>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },
  openClassDrilldown(encodedClass, targetView = 'threshold') {
    let className = '';
    try {
      className = decodeURIComponent(encodedClass || '');
    } catch (e) {
      className = String(encodedClass || '');
    }
    if (!className) return;
    if (targetView === 'risk') {
      this.switchView('risk');
      const searchInput = document.getElementById('riskSearchInput');
      const yearFilter = document.getElementById('riskEnrollYearFilter');
      if (searchInput) searchInput.value = '';
      if (yearFilter) yearFilter.value = '';
      this.renderFilterDropdowns();
      const classFilter = document.getElementById('riskClassFilter');
      if (classFilter) classFilter.value = className;
      this.riskPage = 1;
      this.renderRiskTracking();
      this.showToast(`\u5df2\u958b\u555f ${className} \u7684\u672a\u5408\u683c\u540d\u55ae`, 'info');
      return;
    }
    this.switchView('threshold');
    const searchInput = document.getElementById('thresholdSearchInput');
    const yearFilter = document.getElementById('thresholdEnrollYearFilter');
    const statusFilter = document.getElementById('thresholdStatusFilter');
    if (searchInput) searchInput.value = '';
    if (yearFilter) yearFilter.value = '';
    if (statusFilter) statusFilter.value = '';
    this.renderFilterDropdowns();
    const classFilter = document.getElementById('thresholdClassFilter');
    if (classFilter) classFilter.value = className;
    this.thresholdPage = 1;
    this.renderThresholdAudit();
    this.showToast(`\u5df2\u958b\u555f ${className} \u7684\u9580\u6abb\u660e\u7d30`, 'info');
  },
  resetRecordsPageAndRender() {
    this.recordsPage = 1;
    this.renderRecordsManagement();
  },
  renderRecordsManagement() {
    const tbody = document.getElementById('erpRecordsTbody');
    const searchInput = document.getElementById('recordsSearchInput');
    const semesterFilter = document.getElementById('recordsSemesterFilter');
    const resultFilter = document.getElementById('recordsResultFilter');
    if (!tbody) return;
    let records = window.FitnessStore.getFitnessRecords();
    const students = window.FitnessStore.getStudents();
    const studentMap = new Map(students.map(student => [String(student.studentId), student]));
    if (semesterFilter && semesterFilter.options.length <= 2) {
      const semesters = [...new Set(records.map(r => r.semester))].sort((a, b) => b.localeCompare(a));
      semesters.forEach(sem => {
        const option = document.createElement('option');
        option.value = sem;
        option.textContent = `${sem.slice(0, 3)}-${sem.slice(3)} \u5b78\u671f`;
        semesterFilter.appendChild(option);
      });
      if (semesters.length > 0) {
        semesterFilter.value = semesters[0];
      }
    }
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const sem = semesterFilter ? semesterFilter.value : '';
    const result = resultFilter ? resultFilter.value : '';
    if (!sem) {
      tbody.innerHTML = `<tr><td colspan="9" class="text-center py-8 text-slate-500 font-bold">\u8acb\u5148\u5f9e\u53f3\u4e0a\u89d2\u9078\u64c7\u5b78\u671f\u4ee5\u8f09\u5165\u8cc7\u6599\uff0c\u907f\u514d\u4e00\u6b21\u8f09\u5165\u904e\u591a\u7d00\u9304\u9020\u6210\u5361\u9813\u3002</td></tr>`;
      this.renderRecordsPagination(0);
      return;
    }
    if (query) {
      records = records.filter(record => {
        const student = studentMap.get(String(record.studentId));
        return String(record.studentId).toLowerCase().includes(query)
          || String(student?.name || '').toLowerCase().includes(query);
      });
    }
    if (sem !== 'all') {
      records = records.filter(r => String(r.semester) === String(sem));
    }
    if (result) {
      records = records.filter(record => (record.status || (record.isPassed ? '\u5408\u683c' : '\u4e0d\u5408\u683c')) === result);
    }
    records.sort((a, b) => {
      if (a.semester !== b.semester) return b.semester.localeCompare(a.semester);
      return a.studentId.localeCompare(b.studentId);
    });
    if (records.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" class="text-center py-8 text-slate-500">\u67e5\u7121\u6aa2\u6e2c\u7d00\u9304\u8cc7\u6599</td></tr>`;
      this.renderRecordsPagination(0);
      return;
    }
    const totalPages = Math.max(1, Math.ceil(records.length / this.recordsPageSize));
    this.recordsPage = Math.min(Math.max(1, this.recordsPage), totalPages);
    const pageStart = (this.recordsPage - 1) * this.recordsPageSize;
    const pageRecords = records.slice(pageStart, pageStart + this.recordsPageSize);
    tbody.innerHTML = pageRecords.map(r => {
      const displayStatus = r.status || (r.isPassed ? '\u5408\u683c' : '\u4e0d\u5408\u683c');
      const isPassed = displayStatus === '\u5408\u683c';
      const isExempt = displayStatus === '\u514d\u6e2c';
      const statusClass = isPassed ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : (isExempt ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-rose-600 bg-rose-50 border-rose-200');
      const student = studentMap.get(String(r.studentId));
      const studentName = student ? student.name : '\u672a\u77e5';
      return `
        <tr class="hover:bg-slate-50 transition-colors">
          <td class="font-bold text-slate-700">${r.semester}</td>
          <td class="font-mono font-bold text-slate-900">${r.studentId}</td>
          <td class="font-bold text-slate-800">${studentName}</td>
          <td>${r.scores?.sitAndReach || '-'}</td>
          <td>${r.scores?.standingLongJump || '-'}</td>
          <td>${r.scores?.sitUps || '-'}</td>
          <td>${r.scores?.cardio || '-'}</td>
          <td>
            <span class="px-2.5 py-1 rounded-md border text-xs font-bold ${statusClass}">
              ${displayStatus}
            </span>
          </td>
          <td class="text-center">
            <div class="flex items-center justify-center gap-2">
              <button onclick="AdminPortal.openRecordEditModal('${r.studentId}', '${r.semester}')" class="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300/90 px-3 py-1 rounded-lg text-xs font-bold shadow-2xs transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95">
                <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                <span>\u7de8\u8f2f</span>
              </button>
              <button onclick="AdminPortal.deleteRecord('${r.studentId}', '${r.semester}')" class="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 px-3 py-1 rounded-lg text-xs font-bold shadow-2xs transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95">
                <svg class="w-3.5 h-3.5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                <span>\u522a\u9664</span>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
    this.renderRecordsPagination(records.length);
  },
  renderRecordsPagination(total) {
    const pagination = document.getElementById('recordsPagination');
    if (!pagination) return;
    const totalPages = Math.max(1, Math.ceil(total / this.recordsPageSize));
    const start = total ? (this.recordsPage - 1) * this.recordsPageSize + 1 : 0;
    const end = Math.min(total, this.recordsPage * this.recordsPageSize);
    pagination.innerHTML = `
      <span>\u986f\u793a ${start}\u2013${end}\uff0c\u5171 ${total.toLocaleString()} \u7b46\uff08\u6bcf\u9801 ${this.recordsPageSize} \u7b46\uff09</span>
      <div class="flex items-center gap-2">
        <button onclick="AdminPortal.changeRecordsPage(-1)" ${this.recordsPage <= 1 ? 'disabled' : ''} class="px-3 py-1.5 rounded-lg border border-slate-200 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50">\u4e0a\u4e00\u9801</button>
        <span class="font-bold text-slate-700">${this.recordsPage} / ${totalPages}</span>
        <button onclick="AdminPortal.changeRecordsPage(1)" ${this.recordsPage >= totalPages ? 'disabled' : ''} class="px-3 py-1.5 rounded-lg border border-slate-200 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50">\u4e0b\u4e00\u9801</button>
      </div>
    `;
  },
  changeRecordsPage(delta) {
    this.recordsPage = Math.max(1, this.recordsPage + delta);
    this.renderRecordsManagement();
    document.querySelector('#erpView_records .corp-table-container')?.scrollTo({ top: 0, behavior: 'smooth' });
  },
  clearRecordsFilters() {
    const searchInput = document.getElementById('recordsSearchInput');
    const semesterFilter = document.getElementById('recordsSemesterFilter');
    const resultFilter = document.getElementById('recordsResultFilter');
    if (searchInput) searchInput.value = '';
    if (resultFilter) resultFilter.value = '';
    if (semesterFilter) {
      const latestSemesterOption = Array.from(semesterFilter.options).find(option => option.value && option.value !== 'all');
      semesterFilter.value = latestSemesterOption?.value || '';
    }
    const clearButton = document.getElementById('recordsSearchInputClearBtn');
    if (clearButton) clearButton.classList.add('hidden');
    this.resetRecordsPageAndRender();
  },
  openRecordEditModal(studentId, semester) {
    const records = window.FitnessStore.getFitnessRecords(studentId);
    const record = records.find(r => String(r.semester) === String(semester));
    if (!record) return;
    document.getElementById('editRecordStudentId').textContent = studentId;
    document.getElementById('editRecordSemester').textContent = semester;
    if (document.getElementById('editRecordHeight')) {
      document.getElementById('editRecordHeight').value = record.scores?.height || record.height || '';
    }
    if (document.getElementById('editRecordWeight')) {
      document.getElementById('editRecordWeight').value = record.scores?.weight || record.weight || '';
    }
    document.getElementById('editRecordSitAndReach').value = record.scores?.sitAndReach || '';
    document.getElementById('editRecordStandingLongJump').value = record.scores?.standingLongJump || '';
    document.getElementById('editRecordSitUps').value = record.scores?.sitUps || '';
    document.getElementById('editRecordCardio').value = record.scores?.cardio || '';
    const displayStatus = record.status || (record.isPassed ? '\u5408\u683c' : '\u4e0d\u5408\u683c');
    document.getElementById('editRecordStatus').value = displayStatus;
    const modal = document.getElementById('recordEditModal');
    if (modal) modal.classList.remove('hidden');
  },
  closeRecordEditModal() {
    const modal = document.getElementById('recordEditModal');
    if (modal) modal.classList.add('hidden');
  },
  saveRecordEdit() {
    const studentId = document.getElementById('editRecordStudentId').textContent;
    const semester = document.getElementById('editRecordSemester').textContent;
    if (!studentId || !semester) return;
    const height = document.getElementById('editRecordHeight') ? document.getElementById('editRecordHeight').value.trim() : '';
    const weight = document.getElementById('editRecordWeight') ? document.getElementById('editRecordWeight').value.trim() : '';
    const sitAndReach = document.getElementById('editRecordSitAndReach').value.trim();
    const standingLongJump = document.getElementById('editRecordStandingLongJump').value.trim();
    const sitUps = document.getElementById('editRecordSitUps').value.trim();
    const cardio = document.getElementById('editRecordCardio').value.trim();
    const status = document.getElementById('editRecordStatus').value;
    const updatedData = {
      scores: { height, weight, sitAndReach, standingLongJump, sitUps, cardio },
      status: status,
      isPassed: (status === '\u5408\u683c' || status === '\u514d\u6e2c') // sync for legacy logic
    };
    const success = window.FitnessStore.updateFitnessRecord(studentId, semester, updatedData);
    if (success) {
      this.showToast('\u6aa2\u6e2c\u7d00\u9304\u5df2\u66f4\u65b0\uff0c\u4e26\u5df2\u91cd\u65b0\u7d50\u7b97\u7562\u696d\u9580\u6abb', 'success');
      this.closeRecordEditModal();
      this.renderRecordsManagement(); // \u91cd\u65b0\u6e32\u67d3\u7576\u524d\u5217\u8868
    } else {
      this.showToast('\u66f4\u65b0\u5931\u6557\uff0c\u627e\u4e0d\u5230\u8a72\u7b46\u7d00\u9304', 'danger');
    }
  },
  openAddRecordModal() {
    const currentSem = document.getElementById('recordsSemesterFilter')?.value;
    document.getElementById('addRecordStudentId').value = '';
    document.getElementById('addRecordSemester').value = (currentSem && currentSem !== 'all') ? currentSem : '1122';
    if (document.getElementById('addRecordHeight')) document.getElementById('addRecordHeight').value = '';
    if (document.getElementById('addRecordWeight')) document.getElementById('addRecordWeight').value = '';
    document.getElementById('addRecordSitAndReach').value = '';
    document.getElementById('addRecordStandingLongJump').value = '';
    document.getElementById('addRecordSitUps').value = '';
    document.getElementById('addRecordCardio').value = '';
    document.getElementById('addRecordStatus').value = '\u5408\u683c';
    const previewEl = document.getElementById('addRecordStudentPreview');
    if (previewEl) previewEl.classList.add('hidden');
    const modal = document.getElementById('addRecordModal');
    if (modal) modal.classList.remove('hidden');
  },
  closeAddRecordModal() {
    const modal = document.getElementById('addRecordModal');
    if (modal) modal.classList.add('hidden');
  },
  lookupAddRecordStudentInfo() {
    const studentId = document.getElementById('addRecordStudentId').value.trim();
    const previewEl = document.getElementById('addRecordStudentPreview');
    const nameEl = document.getElementById('addRecordStudentName');
    const classEl = document.getElementById('addRecordStudentClass');
    if (!studentId) {
      if (previewEl) previewEl.classList.add('hidden');
      return;
    }
    const student = window.FitnessStore.getStudentById(studentId);
    if (student && previewEl) {
      nameEl.textContent = `\u59d3\u540d\uff1a${student.name}`;
      classEl.textContent = `\u73ed\u7d1a\uff1a${student.className || '\u672a\u8a2d\u5b9a'}`;
      nameEl.className = 'text-slate-800 font-extrabold';
      previewEl.classList.remove('hidden');
    } else if (previewEl) {
      nameEl.textContent = `\u26a0\ufe0f \u67e5\u7121\u5b78\u865f ${studentId} \u4e4b\u5b78\u751f`;
      classEl.textContent = `\uff08\u8acb\u5148\u81f3\u5b78\u751f\u540d\u518a\u532f\u5165\uff09`;
      nameEl.className = 'text-rose-600 font-bold';
      previewEl.classList.remove('hidden');
    }
  },
  saveNewRecord() {
    const studentId = document.getElementById('addRecordStudentId').value.trim();
    const semester = document.getElementById('addRecordSemester').value.trim();
    if (!studentId || !semester) {
      this.showToast('\u8acb\u8f38\u5165\u76ee\u6a19\u5b78\u751f\u5b78\u865f\u8207\u6aa2\u6e2c\u5b78\u671f\uff01', 'warning');
      return;
    }
    const student = window.FitnessStore.getStudentById(studentId);
    if (!student) {
      this.showToast(`\u67e5\u7121\u5b78\u865f ${studentId} \u7684\u5b78\u751f\uff0c\u8acb\u5148\u81f3\u3010\u5b78\u751f\u540d\u518a\u3011\u532f\u5165\u6216\u65b0\u589e\u8a72\u5b78\u751f\uff01`, 'error');
      return;
    }
    const height = document.getElementById('addRecordHeight') ? document.getElementById('addRecordHeight').value.trim() : '';
    const weight = document.getElementById('addRecordWeight') ? document.getElementById('addRecordWeight').value.trim() : '';
    const sitAndReach = document.getElementById('addRecordSitAndReach').value.trim();
    const standingLongJump = document.getElementById('addRecordStandingLongJump').value.trim();
    const sitUps = document.getElementById('addRecordSitUps').value.trim();
    const cardio = document.getElementById('addRecordCardio').value.trim();
    const status = document.getElementById('addRecordStatus').value;
    const newRecord = {
      studentId: student.studentId,
      semester: semester,
      scores: { height, weight, sitAndReach, standingLongJump, sitUps, cardio },
      status: status,
      isPassed: (status === '\u5408\u683c' || status === '\u514d\u6e2c')
    };
    window.FitnessStore.saveFitnessRecord(newRecord);
    window.FitnessStore.recalculateStudentPassCount(student.studentId);
    window.FitnessStore.updateImportHistory(semester);
    window.FitnessStore.addAuditLog({
      operator: window.FitnessStore.getCurrentOperatorName(),
      action: '\u624b\u52d5\u55ae\u7b46\u65b0\u589e\u6210\u7e3e',
      studentId: student.studentId,
      details: `\u55ae\u7368\u65b0\u589e ${student.name} (${student.studentId}) \u5728 ${semester} \u5b78\u671f\u4e4b\u9ad4\u9069\u80fd\u6210\u7e3e (${status})`
    });
    this.closeAddRecordModal();
    this.showToast(`\ud83c\udf89 \u6210\u529f\u65b0\u589e ${student.name} \u5728 ${semester} \u5b78\u671f\u4e4b\u9ad4\u9069\u80fd\u6210\u7e3e\uff01`, 'success');
    this.renderRecordsManagement();
  },
  deleteRecord(studentId, semester) {
    if (confirm(`\u26a0\ufe0f \u78ba\u5b9a\u8981\u522a\u9664\u5b78\u865f ${studentId} \u7684 ${semester} \u5b78\u671f\u6aa2\u6e2c\u6210\u7e3e\u55ce\uff1f\n\n\u6ce8\u610f\uff1a\u9019\u5c07\u6703\u81ea\u52d5\u91cd\u65b0\u8a08\u7b97\u8a72\u5b78\u751f\u7684\u7e3d\u901a\u904e\u6b21\u6578\u3002\u522a\u9664\u5f8c\u7121\u6cd5\u5fa9\u539f\uff01`)) {
      const success = window.FitnessStore.deleteFitnessRecord(studentId, semester);
      if (success) {
        this.showToast('\u6aa2\u6e2c\u7d00\u9304\u5df2\u522a\u9664\uff0c\u4e26\u5df2\u91cd\u65b0\u7d50\u7b97\u7562\u696d\u9580\u6abb', 'success');
        this.renderRecordsManagement();
      } else {
        this.showToast('\u522a\u9664\u5931\u6557\uff0c\u627e\u4e0d\u5230\u8a72\u7b46\u7d00\u9304', 'danger');
      }
    }
  },
  exportAnalyticsExcel() {
    if (typeof XLSX === 'undefined') {
      this.showToast('Excel \u532f\u51fa\u6a21\u7d44\u5c1a\u672a\u8f09\u5165\uff0c\u8acb\u7a0d\u5f8c\u518d\u8a66', 'error');
      return;
    }
    const students = this.getValidStudents();
    const classStats = {};
    students.forEach(s => {
      const cls = s.className || '\u672a\u6307\u5b9a\u73ed\u7d1a';
      if (!classStats[cls]) {
        classStats[cls] = { total: 0, passed: 0, failed: 0 };
      }
      classStats[cls].total++;
      if (s.status === '\u901a\u904e') classStats[cls].passed++;
      else classStats[cls].failed++;
    });
    const sortedClasses = Object.keys(classStats).sort();
    if (sortedClasses.length === 0) {
      this.showToast('\u5c1a\u7121\u73ed\u7d1a\u6578\u64da\u53ef\u4f9b\u532f\u51fa', 'error');
      return;
    }
    const exportData = sortedClasses.map(cls => {
      const stat = classStats[cls];
      const rate = stat.total > 0 ? Math.round((stat.passed / stat.total) * 100) : 0;
      return {
        '\u73ed\u7d1a': cls,
        '\u7e3d\u4eba\u6578': stat.total,
        '\u5408\u683c\u4eba\u6578': stat.passed,
        '\u672a\u5408\u683c\u4eba\u6578': stat.failed,
        '\u5408\u683c\u7387(%)': rate
      };
    });
    const ws = XLSX.utils.json_to_sheet(exportData);
    const colWidths = [
      { wch: 15 }, 
      { wch: 10 }, 
      { wch: 10 }, 
      { wch: 12 }, 
      { wch: 12 }
    ];
    ws['!cols'] = colWidths;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "\u73ed\u7d1a\u7d71\u8a08");
    const today = new Date().toLocaleDateString('zh-TW').replace(/\//g, '');
    XLSX.writeFile(wb, `\u73ed\u7d1a\u7d71\u8a08\u5831\u8868_${today}.xlsx`);
    this.showToast('\u73ed\u7d1a\u7d71\u8a08\u5831\u8868\u4e0b\u8f09\u5b8c\u6210', 'success');
  },
  renderRiskTracking() {
    this.renderFilterDropdowns();
    const students = this.getValidStudents();
    const riskList = students.filter(s => s.status === '\u4e0d\u901a\u904e');
    const search = (document.getElementById('riskSearchInput')?.value || '').toLowerCase().trim();
    const year = document.getElementById('riskEnrollYearFilter')?.value || '';
    const cls = document.getElementById('riskClassFilter')?.value || '';
    const filteredRisk = riskList.filter(s => {
      const eYear = s.className ? s.className[2] : '';
      const text = `${s.studentId} ${s.name} ${s.className}`.toLowerCase();
      const matchKeyword = !search || text.includes(search);
      const matchYear = !year || eYear === year;
      const matchClass = !cls || s.className === cls;
      return matchKeyword && matchYear && matchClass;
    });
    this.renderHeaderSummary(filteredRisk);
    const tbody = document.getElementById('erpRiskTbody');
    if (!tbody) return;
    if (filteredRisk.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-emerald-600 font-bold">\u76ee\u524d\u7121\u7b26\u5408\u689d\u4ef6\u7684\u672a\u5408\u683c\u5b78\u751f</td></tr>';
      this.renderRiskPagination(0);
      return;
    }
    const totalPages = Math.max(1, Math.ceil(filteredRisk.length / this.riskPageSize));
    this.riskPage = Math.min(Math.max(1, this.riskPage), totalPages);
    const pageStart = (this.riskPage - 1) * this.riskPageSize;
    const pageRisk = filteredRisk.slice(pageStart, pageStart + this.riskPageSize);
    tbody.innerHTML = pageRisk.map(s => {
      const isSelected = this.selectedRiskIds.has(s.studentId);
      return `
      <tr class="${isSelected ? 'selected' : ''}">
        <td class="text-center">
          <input type="checkbox" onchange="AdminPortal.toggleRiskSelect('${s.studentId}', this.checked)" ${isSelected ? 'checked' : ''} class="w-4 h-4 rounded text-blue-600 border-slate-300 cursor-pointer">
        </td>
        <td>${s.className || '-'}</td>
        <td class="font-bold text-slate-900 font-mono">${s.studentId}</td>
        <td class="font-bold text-rose-600">${s.name}</td>
        <td class="font-bold text-rose-500">\u5c1a\u7f3a ${s.status === '\u901a\u904e' ? 0 : Math.max(0, (window.FitnessStore.settings.requiredPassCount || 2) - (s.passCount || 0))} \u6b21</td>
        <td class="text-xs font-mono text-slate-500">s${s.studentId}@${window.FitnessStore.settings.schoolDomain || 'mail.edu.tw'}</td>
        <td class="text-right">
          <button onclick="AdminPortal.openThresholdEditModal('${s.studentId}')" 
                  class="bg-slate-50 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 px-3 py-1.5 rounded-lg text-sm font-bold transition-all inline-flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            \u7de8\u8f2f
          </button>
        </td>
      </tr>
      `;
    }).join('');
    this.renderRiskPagination(filteredRisk.length);
  },
  resetRiskPageAndRender() {
    this.riskPage = 1;
    this.renderRiskTracking();
  },
  renderRiskPagination(total) {
    const pagination = document.getElementById('riskPagination');
    if (!pagination) return;
    const totalPages = Math.max(1, Math.ceil(total / this.riskPageSize));
    const start = total ? (this.riskPage - 1) * this.riskPageSize + 1 : 0;
    const end = Math.min(total, this.riskPage * this.riskPageSize);
    pagination.innerHTML = `
      <span>\u986f\u793a ${start}\u2013${end}\uff0c\u5171 ${total.toLocaleString()} \u7b46\uff08\u6bcf\u9801 ${this.riskPageSize} \u7b46\uff09</span>
      <div class="flex items-center gap-2">
        <button onclick="AdminPortal.changeRiskPage(-1)" ${this.riskPage <= 1 ? 'disabled' : ''} class="px-3 py-1.5 rounded-lg border border-slate-200 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50">\u4e0a\u4e00\u9801</button>
        <span class="font-bold text-slate-700">${this.riskPage} / ${totalPages}</span>
        <button onclick="AdminPortal.changeRiskPage(1)" ${this.riskPage >= totalPages ? 'disabled' : ''} class="px-3 py-1.5 rounded-lg border border-slate-200 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50">\u4e0b\u4e00\u9801</button>
      </div>
    `;
  },
  changeRiskPage(delta) {
    this.riskPage = Math.max(1, this.riskPage + delta);
    this.renderRiskTracking();
    document.querySelector('#erpView_risk .corp-table-container')?.scrollTo({ top: 0, behavior: 'smooth' });
  },
  toggleRiskSelect(studentId, isChecked) {
    if (isChecked) {
      this.selectedRiskIds.add(studentId);
    } else {
      this.selectedRiskIds.delete(studentId);
      const selectAllObj = document.getElementById('riskSelectAll');
      if (selectAllObj) selectAllObj.checked = false;
    }
    this.renderRiskTracking(); // re-render to update row styles
  },
  toggleAllRiskSelection(isChecked) {
    const students = this.getValidStudents();
    const riskList = students.filter(s => s.status === '\u4e0d\u901a\u904e');
    const search = (document.getElementById('riskSearchInput')?.value || '').toLowerCase().trim();
    const year = document.getElementById('riskEnrollYearFilter')?.value || '';
    const cls = document.getElementById('riskClassFilter')?.value || '';
    const filteredRisk = riskList.filter(s => {
      const eYear = s.className ? s.className[2] : '';
      const text = `${s.studentId} ${s.name} ${s.className}`.toLowerCase();
      const matchKeyword = !search || text.includes(search);
      const matchYear = !year || eYear === year;
      const matchClass = !cls || s.className === cls;
      return matchKeyword && matchYear && matchClass;
    });
    const pageStart = (this.riskPage - 1) * this.riskPageSize;
    const pageRisk = filteredRisk.slice(pageStart, pageStart + this.riskPageSize);
    if (isChecked) {
      pageRisk.forEach(s => this.selectedRiskIds.add(s.studentId));
    } else {
      pageRisk.forEach(s => this.selectedRiskIds.delete(s.studentId));
    }
    this.renderRiskTracking();
  },
  async prepareAuditLogs() {
    this.renderAuditLogs();
    if (this.auditAccountsLoaded || this.auditAccountsLoading) return;
    this.auditAccountsLoading = true;
    try {
      const accounts = this.adminAccounts.length > 0
        ? this.adminAccounts
        : await window.FitnessFirebase.listAdminAccounts();
      if (Array.isArray(accounts)) this.adminAccounts = accounts;
      const result = await window.FitnessStore.backfillAuditOperatorNames(accounts);
      this.auditAccountsLoaded = true;
      if (result.updated > 0) {
        await this.recordAudit(
          '\u6821\u6b63\u64cd\u4f5c\u7d00\u9304\u59d3\u540d',
          `\u4f9d\u7ba1\u7406\u54e1\u767d\u540d\u55ae\u7684\u5e33\u865f\u6216 UID\uff0c\u5b89\u5168\u56de\u586b ${result.updated} \u7b46\u53ef\u660e\u78ba\u8fa8\u8b58\u7684\u6b77\u53f2\u64cd\u4f5c\u4eba\u59d3\u540d\uff1b${result.unresolved} \u7b46\u56e0\u7f3a\u5c11\u53ef\u8fa8\u8b58\u8cc7\u6599\u800c\u7dad\u6301\u539f\u7d00\u9304`
        );
        this.showToast(`\u5df2\u6821\u6b63 ${result.updated} \u7b46\u6b77\u53f2\u64cd\u4f5c\u4eba\u59d3\u540d`, 'success');
      }
      this.renderAuditLogs();
    } catch (err) {
      console.warn('\u64cd\u4f5c\u7d00\u9304\u59d3\u540d\u56de\u586b\u66ab\u6642\u7121\u6cd5\u57f7\u884c\uff1a', err);
    } finally {
      this.auditAccountsLoading = false;
    }
  },
  getFilteredAuditLogs() {
    const logs = window.FitnessStore.getLogs();
    const keyword = (document.getElementById('auditSearchInput')?.value || '').trim().toLowerCase();
    const operator = document.getElementById('auditOperatorFilter')?.value || '';
    const action = document.getElementById('auditActionFilter')?.value || '';
    const result = document.getElementById('auditResultFilter')?.value || '';
    const dateFrom = document.getElementById('auditDateFrom')?.value || '';
    const dateTo = document.getElementById('auditDateTo')?.value || '';
    const fromTime = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null;
    const toTime = dateTo ? new Date(`${dateTo}T23:59:59.999`).getTime() : null;
    return logs.filter(log => {
      const logResult = log.result === 'failure' || log.result === 'failed' || log.result === '\u5931\u6557' ? 'failure' : 'success';
      const timestamp = new Date(log.timestamp).getTime();
      const searchable = `${log.operator || ''} ${log.operatorAccount || ''} ${log.action || ''} ${log.details || ''} ${log.studentId || ''}`.toLowerCase();
      return (!keyword || searchable.includes(keyword))
        && (!operator || log.operator === operator)
        && (!action || log.action === action)
        && (!result || logResult === result)
        && (fromTime === null || (!Number.isNaN(timestamp) && timestamp >= fromTime))
        && (toTime === null || (!Number.isNaN(timestamp) && timestamp <= toTime));
    });
  },
  populateAuditFilterOptions(logs) {
    const populate = (id, values, label) => {
      const el = document.getElementById(id);
      if (!el) return;
      const selected = el.value;
      const escape = window.SafeUI?.escape
        ? window.SafeUI.escape.bind(window.SafeUI)
        : (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
          })[char]);
      el.innerHTML = `<option value="">${label}</option>` + values.map(value => `<option value="${escape(value)}">${escape(value)}</option>`).join('');
      if (values.includes(selected)) el.value = selected;
    };
    const operators = Array.from(new Set(logs.map(log => log.operator).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'zh-Hant'));
    const actions = Array.from(new Set(logs.map(log => log.action).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'zh-Hant'));
    populate('auditOperatorFilter', operators, '\u6240\u6709\u64cd\u4f5c\u4eba');
    populate('auditActionFilter', actions, '\u6240\u6709\u52d5\u4f5c');
  },
  renderAuditLogs() {
    const allLogs = window.FitnessStore.getLogs();
    this.populateAuditFilterOptions(allLogs);
    const logs = this.getFilteredAuditLogs();
    const tbody = document.getElementById('erpAuditLogsTbody');
    if (!tbody) return;
    const escape = window.SafeUI?.escape
      ? window.SafeUI.escape.bind(window.SafeUI)
      : (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
          '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[char]);
    const countEl = document.getElementById('auditLogCount');
    if (countEl) countEl.textContent = logs.length === allLogs.length ? `\u5171 ${allLogs.length} \u7b46` : `\u986f\u793a ${logs.length}\uff0f${allLogs.length} \u7b46`;
    tbody.innerHTML = logs.map(log => {
      const logResult = log.result === 'failure' || log.result === 'failed' || log.result === '\u5931\u6557' ? 'failure' : 'success';
      const resultHtml = logResult === 'failure'
        ? '<span class="inline-flex px-2 py-1 rounded-lg bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">\u5931\u6557</span>'
        : '<span class="inline-flex px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700">\u6210\u529f</span>';
      return `
      <tr class="hover:bg-slate-50/80 transition-colors">
        <td class="text-slate-500 font-mono">${new Date(log.timestamp).toLocaleString('zh-TW', { hour12: false })}</td>
        <td class="font-bold text-blue-700" title="${escape(log.operatorAccount || '')}">${escape(log.operator)}</td>
        <td class="font-bold text-slate-800">${escape(log.action)}</td>
        <td class="text-center">${resultHtml}</td>
        <td class="text-slate-600"><div class="max-w-[30rem] truncate" title="${escape(log.details)}">${escape(log.details)}</div></td>
        <td class="text-center"><button type="button" onclick="AdminPortal.openAuditLogDetail('${encodeURIComponent(log.id || '')}')" class="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-200 text-xs font-bold text-slate-600 hover:text-blue-700">\u67e5\u770b</button></td>
      </tr>
    `;
    }).join('') || '<tr><td colspan="6" class="text-center py-8 text-slate-400">\u76ee\u524d\u6c92\u6709\u7b26\u5408\u7be9\u9078\u689d\u4ef6\u7684\u7d00\u9304</td></tr>';
  },
  resetAuditFilters() {
    ['auditSearchInput', 'auditOperatorFilter', 'auditActionFilter', 'auditResultFilter', 'auditDateFrom', 'auditDateTo'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    this.renderAuditLogs();
  },
  openAuditLogDetail(encodedId) {
    let id = '';
    try { id = decodeURIComponent(encodedId || ''); } catch (e) { id = String(encodedId || ''); }
    const log = window.FitnessStore.getLogs().find(item => item.id === id);
    if (!log) return;
    const result = log.result === 'failure' || log.result === 'failed' || log.result === '\u5931\u6557' ? '\u5931\u6557' : '\u6210\u529f';
    const role = log.operatorRole === 'super_admin' ? '\u7cfb\u7d71\u7ba1\u7406\u54e1' : (log.operatorRole === 'staff' ? '\u4e00\u822c\u6559\u8077\u54e1' : '\u672a\u8a18\u8f09');
    const setText = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value || '-';
    };
    setText('auditDetailTimestamp', new Date(log.timestamp).toLocaleString('zh-TW', { hour12: false }));
    setText('auditDetailOperator', log.operator);
    setText('auditDetailAccount', `${log.operatorAccount || '\u672a\u8a18\u8f09'}\uff0f${role}`);
    setText('auditDetailAction', log.action);
    setText('auditDetailResult', result);
    setText('auditDetailStudentId', log.studentId || '-');
    setText('auditDetailContent', log.details || '-');
    const modal = document.getElementById('auditLogDetailModal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  },
  closeAuditLogDetail() {
    const modal = document.getElementById('auditLogDetailModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },
  exportAuditLogs() {
    const logs = this.getFilteredAuditLogs();
    if (!logs.length) {
      this.showToast('\u76ee\u524d\u6c92\u6709\u7b26\u5408\u7be9\u9078\u689d\u4ef6\u7684\u64cd\u4f5c\u7d00\u9304\u53ef\u532f\u51fa', 'warning');
      return;
    }
    if (!window.XLSX) {
      this.showToast('Excel \u532f\u51fa\u5143\u4ef6\u5c1a\u672a\u8f09\u5165', 'danger');
      return;
    }
    const rows = logs.map(log => ({
      '\u6642\u9593': new Date(log.timestamp).toLocaleString('zh-TW', { hour12: false }),
      '\u64cd\u4f5c\u4eba': log.operator || '',
      '\u767b\u5165\u5e33\u865f': log.operatorAccount || '',
      '\u89d2\u8272': log.operatorRole === 'super_admin' ? '\u7cfb\u7d71\u7ba1\u7406\u54e1' : (log.operatorRole === 'staff' ? '\u4e00\u822c\u6559\u8077\u54e1' : ''),
      '\u52d5\u4f5c': log.action || '',
      '\u7d50\u679c': log.result === 'failure' || log.result === 'failed' || log.result === '\u5931\u6557' ? '\u5931\u6557' : '\u6210\u529f',
      '\u5b78\u751f\u5b78\u865f\uff0f\u8cc7\u6599\u8b58\u5225': log.studentId || '-',
      '\u8a73\u7d30\u5167\u5bb9': log.details || ''
    }));
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet['!cols'] = [{ wch: 22 }, { wch: 16 }, { wch: 20 }, { wch: 14 }, { wch: 24 }, { wch: 10 }, { wch: 22 }, { wch: 60 }];
    XLSX.utils.book_append_sheet(workbook, worksheet, '\u64cd\u4f5c\u7d00\u9304');
    const date = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `\u64cd\u4f5c\u7d00\u9304_${date}.xlsx`);
    this.showToast(`\u5df2\u532f\u51fa ${logs.length} \u7b46\u64cd\u4f5c\u7d00\u9304`, 'success');
  },
  exportRiskExcel() {
    const students = this.getValidStudents();
    const riskList = students.filter(s => s.status === '\u4e0d\u901a\u904e');
    const search = (document.getElementById('riskSearchInput')?.value || '').toLowerCase().trim();
    const year = document.getElementById('riskEnrollYearFilter')?.value || '';
    const cls = document.getElementById('riskClassFilter')?.value || '';
    const filteredRisk = riskList.filter(s => {
      const eYear = s.className ? s.className[2] : '';
      const text = `${s.studentId} ${s.name} ${s.className}`.toLowerCase();
      const matchKeyword = !search || text.includes(search);
      const matchYear = !year || eYear === year;
      const matchClass = !cls || s.className === cls;
      return matchKeyword && matchYear && matchClass;
    });
    if (filteredRisk.length === 0) {
      this.showToast('\u76ee\u524d\u7121\u8cc7\u6599\u53ef\u4f9b\u532f\u51fa', 'warning');
      return;
    }
    const data = filteredRisk.map(s => ({
      '\u73ed\u7d1a': s.className || '',
      '\u5b78\u865f': s.studentId,
      '\u59d3\u540d': s.name,
      '\u5c1a\u7f3a\u6b21\u6578': s.status === '\u901a\u904e' ? 0 : Math.max(0, (window.FitnessStore.settings.requiredPassCount || 2) - (s.passCount || 0)),
      'Email': `s${s.studentId}@${window.FitnessStore.settings.schoolDomain || 'mail.edu.tw'}`
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '\u672a\u5408\u683c\u540d\u55ae');
    const today = new Date().toLocaleDateString('zh-TW').replace(/\//g, '');
    XLSX.writeFile(wb, `\u672a\u5408\u683c\u540d\u55ae_${today}.xlsx`);
    this.showToast('\u672a\u5408\u683c\u540d\u55ae\u4e0b\u8f09\u5b8c\u6210', 'success');
  },
  exportRosterExcel() {
    const students = this.getValidStudents();
    if (students.length === 0) {
      this.showToast('\u7cfb\u7d71\u76ee\u524d\u7121\u5b78\u751f\u8cc7\u6599\u53ef\u4f9b\u532f\u51fa', 'warning');
      return;
    }
    const search = (document.getElementById('rosterSearchInput')?.value || '').toLowerCase().trim();
    const year = document.getElementById('rosterEnrollYearFilter')?.value || '';
    const cls = document.getElementById('rosterClassFilter')?.value || '';
    const status = document.getElementById('rosterStatusFilter')?.value || '';
    const trueYear = document.getElementById('rosterTrueYearFilter')?.value || '';
    const admission = document.getElementById('rosterAdmissionFilter')?.value || '';
    const identity = document.getElementById('rosterIdentityFilter')?.value || '';
    const filtered = students.filter(s => {
      const eYear = s.className ? s.className[2] : '';
      const text = `${s.studentId} ${s.name} ${s.className} ${eYear}`.toLowerCase();
      const matchKeyword = !search || text.includes(search);
      const matchYear = !year || eYear === year;
      const matchClass = !cls || s.className === cls;
      const rStatus = this.normalizeRosterStatus(s.rosterStatus);
      const matchStatus = !status || rStatus === status;
      const sTrueYear = s.enrollYear || window.FitnessStore.getEnrollYearFromStudentId(s.studentId);
      const matchTrueYear = !trueYear || sTrueYear === trueYear;
      const matchAdmission = !admission || (s.admissionMethod && s.admissionMethod === admission);
      const matchIdentity = !identity || (s.identityStatus && s.identityStatus === identity);
      return matchKeyword && matchYear && matchClass && matchStatus && matchTrueYear && matchAdmission && matchIdentity;
    });
    if (filtered.length === 0) {
      this.showToast('\u6240\u9078\u7be9\u9078\u689d\u4ef6\u4e0b\u67e5\u7121\u4efb\u4f55\u5b78\u7c4d\u8cc7\u6599\u53ef\u4f9b\u532f\u51fa\uff01', 'warning');
      return;
    }
    const dataRows = filtered.map(s => ({
      "\u73ed\u7d1a": s.className || '',
      "\u5b78\u865f": s.studentId,
      "\u59d3\u540d": s.name,
      "\u5165\u5b78\u5e74": (s.enrollYear || window.FitnessStore.getEnrollYearFromStudentId(s.studentId)) + ' \u5b78\u5e74\u5ea6',
      "\u5165\u5b78\u65b9\u5f0f": s.admissionMethod || '',
      "\u8eab\u5206": s.identityStatus || '',
      "\u5b78\u7c4d\u72c0\u614b": this.normalizeRosterStatus(s.rosterStatus)
    }));
    const headers = ["\u73ed\u7d1a", "\u5b78\u865f", "\u59d3\u540d", "\u5165\u5b78\u5e74", "\u5165\u5b78\u65b9\u5f0f", "\u8eab\u5206", "\u5b78\u7c4d\u72c0\u614b"];
    const ws = XLSX.utils.json_to_sheet(dataRows, { header: headers });
    ws['!cols'] = [
      { wch: 18 },
      { wch: 20 },
      { wch: 16 },
      { wch: 16 },
      { wch: 16 },
      { wch: 16 },
      { wch: 14 }
    ];
    if (ws['!ref']) {
      const range = XLSX.utils.decode_range(ws['!ref']);
      ws['!autofilter'] = { ref: XLSX.utils.encode_range(range) };
    }
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '\u7be9\u9078\u5b78\u751f\u5b78\u7c4d\u540d\u518a');
    const dateStr = new Date().toISOString().slice(0, 10);
    const fileNameStr = `\u5b78\u751f\u5b78\u7c4d\u540d\u518a_\u7be9\u9078_${filtered.length}\u7b46_${dateStr}.xlsx`;
    XLSX.writeFile(wb, fileNameStr);
    this.showToast(`\ud83c\udf89 \u6210\u529f\u4f9d\u7be9\u9078\u689d\u4ef6\u532f\u51fa ${filtered.length} \u7b46\u5b78\u751f\u5b78\u7c4d\u81f3 ${fileNameStr}`, 'success');
  },
  openExportModal() {
    const students = this.getValidStudents();
    const classes = Array.from(new Set(students.map(s => s.className).filter(Boolean))).sort();
    const specSelect = document.getElementById('exportSpecificClassSelect');
    if (specSelect) {
      specSelect.innerHTML = classes.map(c => `<option value="${c}">${c}</option>`).join('');
    }
    const modal = document.getElementById('exportModal');
    if (modal) modal.classList.remove('hidden');
  },
  closeExportModal() {
    const modal = document.getElementById('exportModal');
    if (modal) modal.classList.add('hidden');
  },
  onExportScopeChange(val) {
    const container = document.getElementById('exportSpecificClassContainer');
    if (container) {
      if (val === 'specific_class') container.classList.remove('hidden');
      else container.classList.add('hidden');
    }
  },
  executeSmartExport() {
    const students = this.getValidStudents();
    if (students.length === 0) {
      this.showToast('\u7cfb\u7d71\u76ee\u524d\u7121\u5b78\u751f\u8cc7\u6599\u53ef\u4f9b\u532f\u51fa', 'warning');
      return;
    }
    const scope = document.getElementById('exportGradeScope')?.value || 'all';
    const specClass = document.getElementById('exportSpecificClassSelect')?.value || '';
    const statusFilter = document.getElementById('exportStatusFilter')?.value || 'all';
    const sheetStruct = document.getElementById('exportSheetStructure')?.value || 'single_sheet';
    let filtered = students.filter(s => {
      const cls = s.className || '';
      const isEnrolled = this.normalizeRosterStatus(s.rosterStatus) === '\u5728\u5b78';
      let matchScope = true;
      if (scope === 'grade4') matchScope = cls.includes('\u56db') || cls.includes('4');
      else if (scope === 'grade3') matchScope = cls.includes('\u4e09') || cls.includes('3');
      else if (scope === 'specific_class') matchScope = cls === specClass;
      return isEnrolled && matchScope;
    });
    if (statusFilter === 'failed_only') {
      filtered = filtered.filter(s => s.status === '\u4e0d\u901a\u904e');
    } else if (statusFilter === 'passed_only') {
      filtered = filtered.filter(s => s.status === '\u901a\u904e');
    }
    if (filtered.length === 0) {
      this.showToast('\u6240\u9078\u7be9\u9078\u689d\u4ef6\u4e0b\u67e5\u7121\u4efb\u4f55\u5b78\u751f\u8cc7\u6599\uff01', 'warning');
      return;
    }
    const formatStudentRow = (s) => {
      const sems = s.semesters || {};
      return {
        "\u73ed\u7d1a": s.className,
        "\u5b78\u865f": s.studentId,
        "\u59d3\u540d": s.name,
        "1101": sems["1101"] !== undefined ? sems["1101"] : 0,
        "1102": sems["1102"] !== undefined ? sems["1102"] : 0,
        "1111": sems["1111"] !== undefined ? sems["1111"] : 0,
        "1112": sems["1112"] !== undefined ? sems["1112"] : 0,
        "1121": sems["1121"] !== undefined ? sems["1121"] : 0,
        "1122": sems["1122"] !== undefined ? sems["1122"] : 0,
        "1131": sems["1131"] !== undefined ? sems["1131"] : 0,
        "1132": sems["1132"] !== undefined ? sems["1132"] : 0,
        "\u901a\u904e\u6b21\u6578(\u9664\u5404\u5b78\u671f\u52a0\u7e3d\uff0c\u4e26\u52a0\u4e0a0\u8ab2...": s.passCount,
        "\u901a\u904e\u8207\u5426": s.status,
        "\u9700\u88dc\u6b21\u6578": s.status === '\u901a\u904e' ? 0 : Math.max(0, (window.FitnessStore.settings.requiredPassCount || 2) - (s.passCount || 0)),
        "\u662f\u5426\u8f49\u5b78": s.isTransfer ? 1 : 0,
        "\u82e5\u70ba\u8f49\u5b78\u986f\u793a1\uff0c\u4e26\u65bc...": s.transferCredit ? 1 : 0,
        "\u9ad4\u4fdd\u751f\u6216\u8eab\u969c\u7121\u6cd5\u6aa2\u6e2c": s.isExemptAthleteOrDisabled ? 1 : 0,
        "\u82e5\u70ba\u9ad4\u4fdd\u6216\u8eab\u969c\u986f\u793a2\uff0c\u4e26\u65bc...": s.exemptCredit ? 2 : 0,
        "\u6b21\u6578\u5176\u9918(\u5982:\u6821\u5167\u81ea\u8f49\uff0c\u65bc\u4ed6\u5b78\u671f\u6709\u6aa2\u6e2c\u7d00\u9304...": s.otherNotes || '',
        "\u7570\u52d5\u539f\u56e0": s.reason || '',
        "\u6700\u5f8c\u7570\u52d5\u65e5\u671f": s.updatedAt || new Date().toLocaleDateString('zh-TW')
      };
    };
    const optimizeWorksheet = (ws) => {
      ws['!cols'] = [
        { wch: 16 }, { wch: 16 }, { wch: 14 },
        { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 },
        { wch: 32 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 30 },
        { wch: 22 }, { wch: 30 }, { wch: 40 }, { wch: 25 }, { wch: 16 }
      ];
      if (ws['!ref']) {
        const range = XLSX.utils.decode_range(ws['!ref']);
        ws['!autofilter'] = { ref: XLSX.utils.encode_range(range) };
      }
    };
    const exportHeaders = [
      "\u73ed\u7d1a", "\u5b78\u865f", "\u59d3\u540d",
      "1101", "1102", "1111", "1112", "1121", "1122", "1131", "1132",
      "\u901a\u904e\u6b21\u6578(\u9664\u5404\u5b78\u671f\u52a0\u7e3d\uff0c\u4e26\u52a0\u4e0a0\u8ab2...", "\u901a\u904e\u8207\u5426", "\u9700\u88dc\u6b21\u6578",
      "\u662f\u5426\u8f49\u5b78", "\u82e5\u70ba\u8f49\u5b78\u986f\u793a1\uff0c\u4e26\u65bc...", "\u9ad4\u4fdd\u751f\u6216\u8eab\u969c\u7121\u6cd5\u6aa2\u6e2c", "\u82e5\u70ba\u9ad4\u4fdd\u6216\u8eab\u969c\u986f\u793a2\uff0c\u4e26\u65bc...",
      "\u6b21\u6578\u5176\u9918(\u5982:\u6821\u5167\u81ea\u8f49\uff0c\u65bc\u4ed6\u5b78\u671f\u6709\u6aa2\u6e2c\u7d00\u9304...", "\u7570\u52d5\u539f\u56e0", "\u6700\u5f8c\u7570\u52d5\u65e5\u671f"
    ];
    const wb = XLSX.utils.book_new();
    const dateStr = new Date().toISOString().slice(0, 10);
    let fileNameStr = `\u9ad4\u9069\u80fd\u5c65\u6b77\u532f\u51fa_${dateStr}.xlsx`;
    if (sheetStruct === 'multi_sheet_by_class') {
      const classMap = {};
      filtered.forEach(s => {
        const cls = s.className || '\u672a\u5206\u914d\u73ed\u7d1a';
        if (!classMap[cls]) classMap[cls] = [];
        classMap[cls].push(formatStudentRow(s));
      });
      Object.keys(classMap).sort().forEach(clsName => {
        const ws = XLSX.utils.json_to_sheet(classMap[clsName], { header: exportHeaders });
        optimizeWorksheet(ws);
        const safeSheetName = clsName.replace(/[\\/?*\[\]]/g, '').slice(0, 30);
        XLSX.utils.book_append_sheet(wb, ws, safeSheetName);
      });
      fileNameStr = `\u9ad4\u9069\u80fd\u5c65\u6b77_\u5404\u73ed\u7d1a\u5206\u9801\u6a94_${dateStr}.xlsx`;
    } else {
      const dataRows = filtered.map(formatStudentRow);
      const ws = XLSX.utils.json_to_sheet(dataRows, { header: exportHeaders });
      optimizeWorksheet(ws);
      let sheetName = '\u9ad4\u9069\u80fd\u5c65\u6b77\u8207\u9580\u6abb\u8cc7\u6599';
      if (scope === 'grade4') sheetName = '\u56db\u5e74\u7d1a\u5b78\u751f\u9580\u6abb\u4e00\u89bd';
      if (statusFilter === 'failed_only') sheetName = '\u672a\u5408\u683c\u50ac\u8fa6\u540d\u55ae';
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      if (scope === 'grade4') fileNameStr = `\u9ad4\u9069\u80fd\u5c65\u6b77_\u56db\u5e74\u7d1a\u5b78\u751f_${dateStr}.xlsx`;
      else if (statusFilter === 'failed_only') fileNameStr = `\u9ad4\u9069\u80fd\u5c65\u6b77_\u672a\u5408\u683c\u540d\u55ae_${dateStr}.xlsx`;
    }
    XLSX.writeFile(wb, fileNameStr);
    this.closeExportModal();
    this.showToast(`\ud83c\udf89 \u6210\u529f\u532f\u51fa ${filtered.length} \u7b46\u8cc7\u6599\u81f3 ${fileNameStr}`, 'success');
  },
  showToast(msg, type = 'info') {
    if (window.App && window.App.showToast) window.App.showToast(msg, type);
    else alert(msg);
  },
  recordAudit(action, details, studentId = '-', result = 'success') {
    return window.FitnessStore.addAuditLog({
      operator: this.currentAdminUser?.name || window.FitnessStore.getCurrentOperatorName(),
      action,
      studentId,
      details,
      result
    });
  },
  auditAndFixAllData() {
    if (!confirm('\u7cfb\u7d71\u5c07\u6703\u91cd\u65b0\u8a08\u7b97\u5168\u6821\u5b78\u751f\u7684\u53ca\u683c\u6b21\u6578\uff0c\n\u82e5\u6709\u5b78\u751f\u5be6\u969b\u53ca\u683c\u6b21\u6578\u5df2\u9054 2 \u6b21 (\u6216\u4eab\u6709\u514d\u6e2c\u8cc7\u683c) \u4f46\u88ab\u932f\u8aa4\u6a19\u8a18\u70ba\u300c\u4e0d\u901a\u904e\u300d\uff0c\u5c07\u6703\u88ab\u5f37\u5236\u4fee\u6b63\u70ba\u300c\u901a\u904e\u300d\u3002\n\n\u78ba\u5b9a\u8981\u57f7\u884c\u55ce\uff1f')) {
      return;
    }
    const students = window.FitnessStore.getStudents();
    let fixCount = 0;
    students.forEach(s => {
      let semPassSum = 0;
      if (s.semesters) {
        Object.values(s.semesters).forEach(v => {
          if (Number(v) === 1) semPassSum++;
        });
      }
      const admMethod = s.admissionMethod || '';
      const identity = s.identityStatus || '';
      let tCredit = Number(s.transferCredit) || 0;
      let eCredit = Number(s.exemptCredit) || 0;
      let isTrans = Number(s.isTransfer) || 0;
      let isExempt = Number(s.isExemptAthleteOrDisabled) || 0;
      if (admMethod.includes('\u8f49\u5b78\u8003')) { tCredit = 1; isTrans = 1; }
      if (admMethod.includes('\u904b\u52d5\u7e3e\u512a')) { eCredit = 2; isExempt = 1; }
      if (identity.includes('\u8eab\u5fc3\u969c\u7919')) { eCredit = 2; isExempt = 1; }
      s.transferCredit = tCredit;
      s.isTransfer = isTrans;
      s.exemptCredit = eCredit;
      s.isExemptAthleteOrDisabled = isExempt;
      let totalPass = semPassSum + tCredit + eCredit;
      s.passCount = totalPass;
      if (totalPass >= 2 || isExempt > 0 || eCredit > 0) {
        if (s.status !== '\u901a\u904e' || (s.deficitCount !== undefined && s.deficitCount > 0)) {
          s.status = '\u901a\u904e';
          s.deficitCount = 0;
          s.updatedAt = new Date().toLocaleDateString('zh-TW');
          fixCount++;
        }
      }
    });
    if (fixCount > 0) {
      window.FitnessStore.saveStudents(students);
      this.renderCurrentView();
      this.showToast(`\u2705 \u7a3d\u6838\u5b8c\u6210\uff01\u5171\u8a08\u81ea\u52d5\u4fee\u6b63\u4e86 ${fixCount} \u4f4d\u5b78\u751f\u7684\u9580\u6abb\u72c0\u614b\u3002`, 'success');
    } else {
      this.showToast(`\u2705 \u7a3d\u6838\u5b8c\u6210\uff01\u6240\u6709\u5b78\u751f\u7684\u8cc7\u6599\u7686\u7b26\u5408\u908f\u8f2f\uff0c\u7121\u9700\u4fee\u6b63\u3002`, 'info');
    }
    this.recordAudit('\u5168\u6821\u9580\u6abb\u8cc7\u6599\u6821\u6b63', `\u5b8c\u6210\u5168\u6821 ${students.length} \u4f4d\u5b78\u751f\u8cc7\u6599\u7a3d\u6838\uff0c\u81ea\u52d5\u4fee\u6b63 ${fixCount} \u4f4d\u5b78\u751f`);
  },
  renderAnnouncementsManagement() {
    const tbody = document.getElementById('erpAnnouncementsTbody');
    if (!tbody) return;
    let list = window.FitnessStore.getAnnouncements() || [];
    list.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    });
    const today = new Date().toISOString().slice(0, 10);
    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-10 text-slate-400 font-bold">\u76ee\u524d\u7121\u4efb\u4f55\u516c\u544a\u8cc7\u6599\uff0c\u9ede\u64ca\u53f3\u4e0a\u89d2\u6309\u9215\u5373\u53ef\u65b0\u589e</td></tr>`;
      return;
    }
    const badgeColors = {
      '\u91cd\u8981\u901a\u77e5': 'bg-rose-100 text-rose-800 border-rose-200',
      '\u88dc\u6e2c\u516c\u544a': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      '\u7533\u8fa6\u63d0\u9192': 'bg-amber-100 text-amber-800 border-amber-200',
      '\u8ab2\u7a0b\u8cc7\u8a0a': 'bg-emerald-100 text-emerald-800 border-emerald-200'
    };
    tbody.innerHTML = list.map(ann => {
      const start = ann.startDate || '2000-01-01';
      const end = ann.endDate || '2099-12-31';
      let statusBadge = '';
      let toggleBtn = '';
      if (ann.isPublished === false) {
        statusBadge = `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">\u624b\u52d5\u4e0b\u67b6</span>`;
        toggleBtn = `
          <button onclick="AdminPortal.toggleAnnouncementStatus('${ann.id}')" class="text-emerald-700 hover:text-emerald-900 font-bold text-xs bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors" title="\u91cd\u65b0\u4e0a\u67b6">
            \u4e0a\u67b6
          </button>`;
      } else if (today < start) {
        statusBadge = `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">\u672a\u958b\u59cb</span>`;
        toggleBtn = `
          <button onclick="AdminPortal.toggleAnnouncementStatus('${ann.id}')" class="text-amber-700 hover:text-amber-900 font-bold text-xs bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg transition-colors" title="\u624b\u52d5\u4e0b\u67b6 (\u5b78\u751f\u7aef\u96b1\u85cf)">
            \u4e0b\u67b6
          </button>`;
      } else if (today > end) {
        statusBadge = `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">\u5df2\u904e\u671f</span>`;
        toggleBtn = `
          <button onclick="AdminPortal.toggleAnnouncementStatus('${ann.id}')" class="text-amber-700 hover:text-amber-900 font-bold text-xs bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg transition-colors" title="\u624b\u52d5\u4e0b\u67b6 (\u5b78\u751f\u7aef\u96b1\u85cf)">
            \u4e0b\u67b6
          </button>`;
      } else {
        statusBadge = `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">\u520a\u767b\u4e2d</span>`;
        toggleBtn = `
          <button onclick="AdminPortal.toggleAnnouncementStatus('${ann.id}')" class="text-amber-700 hover:text-amber-900 font-bold text-xs bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg transition-colors" title="\u624b\u52d5\u4e0b\u67b6 (\u5b78\u751f\u7aef\u96b1\u85cf)">
            \u4e0b\u67b6
          </button>`;
      }
      const catBadge = badgeColors[ann.category] || 'bg-blue-50 text-blue-700 border-blue-200';
      return `
        <tr>
          <td class="text-center">
            ${ann.isPinned ? `<span class="bg-rose-600 text-white text-xs font-black px-2 py-0.5 rounded-md shadow-2xs">\u7f6e\u9802</span>` : `<span class="text-slate-400 text-xs">\u5426</span>`}
          </td>
          <td class="text-center">
            <span class="px-2.5 py-1 rounded-md text-xs font-bold border ${catBadge}">${ann.category || '\u91cd\u8981\u901a\u77e5'}</span>
          </td>
          <td>
            <div class="font-bold text-slate-900 text-sm">${ann.title}</div>
            ${ann.content ? `<div class="text-xs text-slate-500 line-clamp-1 mt-0.5">${ann.content}</div>` : ''}
          </td>
          <td class="text-center font-mono text-xs font-semibold text-slate-700">
            ${ann.startDate} ~ ${ann.endDate}
          </td>
          <td class="text-center">
            ${statusBadge}
          </td>
          <td class="text-center">
            <div class="flex items-center justify-center gap-1.5">
              ${toggleBtn}
              <button onclick="AdminPortal.openAnnouncementModal('${ann.id}')" class="text-blue-600 hover:text-blue-800 font-bold text-xs bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors">
                \u7de8\u8f2f
              </button>
              <button onclick="AdminPortal.deleteAnnouncement('${ann.id}')" class="text-rose-600 hover:text-rose-800 font-bold text-xs bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg transition-colors">
                \u522a\u9664
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },
  editingAnnouncementId: null,
  toggleAnnouncementStatus(id) {
    const list = window.FitnessStore.getAnnouncements() || [];
    const ann = list.find(a => a.id === id);
    if (!ann) return;
    const newStatus = ann.isPublished === false ? true : false;
    window.FitnessStore.updateAnnouncement(id, { isPublished: newStatus });
    this.recordAudit(newStatus ? '\u4e0a\u67b6\u516c\u544a' : '\u4e0b\u67b6\u516c\u544a', `\u516c\u544a\u300c${ann.title}\u300d\u5df2${newStatus ? '\u4e0a\u67b6' : '\u4e0b\u67b6'}`);
    if (newStatus) {
      this.showToast(`\u5df2\u91cd\u65b0\u4e0a\u67b6\u516c\u544a\u3010${ann.title}\u3011`, 'success');
    } else {
      this.showToast(`\u5df2\u6210\u529f\u4e0b\u67b6\u516c\u544a\u3010${ann.title}\u3011(\u5b78\u751f\u7aef\u5df2\u96b1\u85cf)`, 'info');
    }
    this.renderAnnouncementsManagement();
  },
  openAnnouncementModal(id = null) {
    this.editingAnnouncementId = id;
    const modalHeader = document.getElementById('announcementModalHeader');
    const inputTitle = document.getElementById('announcementInputTitle');
    const selectCategory = document.getElementById('announcementSelectCategory');
    const inputIsPinned = document.getElementById('announcementInputIsPinned');
    const inputIsPublished = document.getElementById('announcementInputIsPublished');
    const inputStartDate = document.getElementById('announcementInputStartDate');
    const inputEndDate = document.getElementById('announcementInputEndDate');
    const inputContent = document.getElementById('announcementInputContent');
    const today = new Date().toISOString().slice(0, 10);
    if (id) {
      const list = window.FitnessStore.getAnnouncements();
      const ann = list.find(a => a.id === id);
      if (ann) {
        if (modalHeader) modalHeader.textContent = '\u4fee\u8a02\u516c\u544a';
        if (inputTitle) inputTitle.value = ann.title || '';
        if (selectCategory) selectCategory.value = ann.category || '\u91cd\u8981\u901a\u77e5';
        if (inputIsPinned) inputIsPinned.checked = !!ann.isPinned;
        if (inputIsPublished) inputIsPublished.checked = ann.isPublished !== false;
        if (inputStartDate) inputStartDate.value = ann.startDate || today;
        if (inputEndDate) inputEndDate.value = ann.endDate || '2099-12-31';
        if (inputContent) inputContent.value = ann.content || '';
      }
    } else {
      if (modalHeader) modalHeader.textContent = '\u65b0\u589e\u516c\u544a';
      if (inputTitle) inputTitle.value = '';
      if (selectCategory) selectCategory.value = '\u88dc\u6e2c\u516c\u544a';
      if (inputIsPinned) inputIsPinned.checked = false;
      if (inputIsPublished) inputIsPublished.checked = true;
      if (inputStartDate) inputStartDate.value = today;
      const nextMonth = new Date();
      nextMonth.setDate(nextMonth.getDate() + 30);
      if (inputEndDate) inputEndDate.value = nextMonth.toISOString().slice(0, 10);
      if (inputContent) inputContent.value = '';
    }
    const modal = document.getElementById('announcementEditModal');
    if (modal) modal.classList.remove('hidden');
  },
  closeAnnouncementModal() {
    const modal = document.getElementById('announcementEditModal');
    if (modal) modal.classList.add('hidden');
    this.editingAnnouncementId = null;
  },
  saveAnnouncementModal() {
    const title = document.getElementById('announcementInputTitle')?.value.trim();
    const category = document.getElementById('announcementSelectCategory')?.value;
    const isPinned = document.getElementById('announcementInputIsPinned')?.checked;
    const isPublished = document.getElementById('announcementInputIsPublished')?.checked;
    const startDate = document.getElementById('announcementInputStartDate')?.value;
    const endDate = document.getElementById('announcementInputEndDate')?.value;
    const content = document.getElementById('announcementInputContent')?.value.trim();
    if (!title) {
      this.showToast('\u8acb\u8f38\u5165\u516c\u544a\u6a19\u984c', 'warning');
      return;
    }
    if (!startDate || !endDate) {
      this.showToast('\u8acb\u9078\u64c7\u5b8c\u6574\u7684\u958b\u59cb\u8207\u7d50\u675f\u520a\u767b\u65e5\u671f', 'warning');
      return;
    }
    if (startDate > endDate) {
      this.showToast('\u958b\u59cb\u65e5\u671f\u4e0d\u5f97\u665a\u65bc\u7d50\u675f\u65e5\u671f', 'warning');
      return;
    }
    const editingId = this.editingAnnouncementId;
    if (editingId) {
      window.FitnessStore.updateAnnouncement(editingId, {
        title, category, isPinned, isPublished, startDate, endDate, content
      });
      this.recordAudit('\u4fee\u8a02\u516c\u544a', `\u5df2\u4fee\u8a02\u516c\u544a\u300c${title}\u300d`);
      this.showToast('\u5df2\u6210\u529f\u4fee\u8a02\u516c\u544a', 'success');
    } else {
      window.FitnessStore.addAnnouncement({
        title, category, isPinned, isPublished, startDate, endDate, content
      });
      this.recordAudit('\u65b0\u589e\u516c\u544a', `\u5df2\u65b0\u589e\u516c\u544a\u300c${title}\u300d`);
      this.showToast('\u5df2\u6210\u529f\u767c\u5e03\u65b0\u516c\u544a', 'success');
    }
    this.closeAnnouncementModal();
    this.renderAnnouncementsManagement();
  },
  deleteAnnouncement(id) {
    if (confirm('\u78ba\u5b9a\u8981\u522a\u9664\u6b64\u7b46\u516c\u544a\u55ce\uff1f\u522a\u9664\u5f8c\u5b78\u751f\u7aef\u5c07\u4e0d\u518d\u986f\u793a\u3002')) {
      const announcement = window.FitnessStore.getAnnouncements().find(item => item.id === id);
      window.FitnessStore.deleteAnnouncement(id);
      this.recordAudit('\u522a\u9664\u516c\u544a', `\u5df2\u522a\u9664\u516c\u544a\u300c${announcement?.title || id}\u300d`);
      this.showToast('\u516c\u544a\u5df2\u6210\u529f\u522a\u9664', 'info');
      this.renderAnnouncementsManagement();
    }
  },
  editingAccountId: null,
  async changeAdminCredentials() {
    const currentPassword = document.getElementById('changePassCurrentPasscode')?.value || '';
    const newPassword = document.getElementById('changePassNewPasscode')?.value || '';
    if (!currentPassword || newPassword.length < 8) {
      this.showToast('\u8acb\u8f38\u5165\u76ee\u524d\u5bc6\u78bc\uff0c\u4e14\u65b0\u5bc6\u78bc\u81f3\u5c11 8 \u78bc', 'warning');
      return;
    }
    try {
      await window.FitnessFirebase.changeCurrentPassword(currentPassword, newPassword);
      document.getElementById('changePassCurrentPasscode').value = '';
      document.getElementById('changePassNewPasscode').value = '';
      this.showToast('Firebase \u767b\u5165\u5bc6\u78bc\u5df2\u66f4\u65b0', 'success');
    } catch (err) {
      this.showToast(`\u5bc6\u78bc\u66f4\u65b0\u5931\u6557\uff1a${err.message || '\u8acb\u91cd\u65b0\u767b\u5165\u5f8c\u518d\u8a66'}`, 'danger');
    }
  },
  openSelfPasswordModal() {
    this.closeAccountMenu();
    if (!this.isAdminLoggedIn || !this.currentAdminUser) {
      this.showToast('\u8acb\u5148\u767b\u5165\u7ba1\u7406\u5f8c\u53f0', 'warning');
      return;
    }
    ['selfPasswordCurrent', 'selfPasswordNew', 'selfPasswordConfirm'].forEach(id => {
      const input = document.getElementById(id);
      if (input) input.value = '';
    });
    const hint = document.getElementById('selfPasswordAccountHint');
    if (hint) {
      const displayName = this.currentAdminUser.name || this.currentAdminUser.username || '\u76ee\u524d\u5e33\u865f';
      hint.textContent = `\u76ee\u524d\u767b\u5165\uff1a${displayName}\uff08\u50c5\u8b8a\u66f4\u81ea\u5df1\u7684\u5bc6\u78bc\uff09`;
    }
    const modal = document.getElementById('selfPasswordModal');
    if (modal) {
      modal.classList.remove('hidden');
      window.setTimeout(() => document.getElementById('selfPasswordCurrent')?.focus(), 0);
    }
  },
  closeSelfPasswordModal() {
    document.getElementById('selfPasswordModal')?.classList.add('hidden');
    ['selfPasswordCurrent', 'selfPasswordNew', 'selfPasswordConfirm'].forEach(id => {
      const input = document.getElementById(id);
      if (input) input.value = '';
    });
  },
  async changeOwnPassword() {
    if (!this.isAdminLoggedIn || !this.currentAdminUser) {
      this.showToast('\u767b\u5165\u72c0\u614b\u5df2\u5931\u6548\uff0c\u8acb\u91cd\u65b0\u767b\u5165\u5f8c\u518d\u8a66', 'warning');
      return;
    }
    const currentPassword = document.getElementById('selfPasswordCurrent')?.value || '';
    const newPassword = document.getElementById('selfPasswordNew')?.value || '';
    const confirmPassword = document.getElementById('selfPasswordConfirm')?.value || '';
    if (!currentPassword) {
      this.showToast('\u8acb\u8f38\u5165\u76ee\u524d\u5bc6\u78bc', 'warning');
      return;
    }
    if (newPassword.length < 8) {
      this.showToast('\u65b0\u5bc6\u78bc\u81f3\u5c11\u9700\u8981 8 \u78bc', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      this.showToast('\u5169\u6b21\u8f38\u5165\u7684\u65b0\u5bc6\u78bc\u4e0d\u4e00\u81f4', 'warning');
      return;
    }
    if (newPassword === currentPassword) {
      this.showToast('\u65b0\u5bc6\u78bc\u4e0d\u53ef\u8207\u76ee\u524d\u5bc6\u78bc\u76f8\u540c', 'warning');
      return;
    }
    const saveButton = document.getElementById('selfPasswordSaveBtn');
    const originalText = saveButton?.textContent || '\u66f4\u65b0\u5bc6\u78bc';
    if (saveButton) {
      saveButton.disabled = true;
      saveButton.textContent = '\u66f4\u65b0\u4e2d\u2026';
    }
    try {
      await window.FitnessFirebase.changeCurrentPassword(currentPassword, newPassword);
      this.closeSelfPasswordModal();
      this.recordAudit('\u4fee\u6539\u81ea\u5df1\u7684\u5bc6\u78bc', '\u767b\u5165\u8005\u5df2\u5b8c\u6210 Firebase \u5bc6\u78bc\u4fee\u6539\uff1b\u7d00\u9304\u4e0d\u5305\u542b\u5bc6\u78bc\u5167\u5bb9');
      this.showToast('\u60a8\u7684 Firebase \u767b\u5165\u5bc6\u78bc\u5df2\u66f4\u65b0', 'success');
    } catch (err) {
      const rawMessage = `${err?.code || ''} ${err?.message || ''}`;
      const message = /wrong-password|invalid-credential|invalid-login-credentials/i.test(rawMessage)
        ? '\u76ee\u524d\u5bc6\u78bc\u4e0d\u6b63\u78ba\uff0c\u8acb\u91cd\u65b0\u8f38\u5165'
        : /weak-password/i.test(rawMessage)
          ? '\u65b0\u5bc6\u78bc\u5f37\u5ea6\u4e0d\u8db3\uff0c\u8acb\u6539\u7528\u66f4\u5b89\u5168\u7684\u5bc6\u78bc'
          : /requires-recent-login/i.test(rawMessage)
            ? '\u767b\u5165\u6642\u9593\u5df2\u904e\u4e45\uff0c\u8acb\u767b\u51fa\u5f8c\u91cd\u65b0\u767b\u5165\u518d\u4fee\u6539'
            : (err?.message || '\u8acb\u91cd\u65b0\u767b\u5165\u5f8c\u518d\u8a66');
      this.recordAudit('\u4fee\u6539\u81ea\u5df1\u7684\u5bc6\u78bc', `\u57f7\u884c\u5931\u6557\uff1a${message}\uff1b\u7d00\u9304\u4e0d\u5305\u542b\u5bc6\u78bc\u5167\u5bb9`, '-', 'failure');
      this.showToast(`\u5bc6\u78bc\u66f4\u65b0\u5931\u6557\uff1a${message}`, 'danger');
    } finally {
      if (saveButton) {
        saveButton.disabled = false;
        saveButton.textContent = originalText;
      }
    }
  },
  async renderAdminAccountsManagement() {
    const tbody = document.getElementById('erpAdminAccountsTbody');
    if (!tbody) return;
    if (this.adminAccountsLoading) return;
    this.adminAccountsLoading = true;
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-7 text-slate-400 font-bold">\u6b63\u5728\u8f09\u5165 Firebase \u7ba1\u7406\u54e1\u767d\u540d\u55ae\u2026</td></tr>`;
    try {
      this.adminAccounts = await window.FitnessFirebase.listAdminAccounts();
      const list = this.adminAccounts;
      if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-7 text-slate-400 font-bold">\u76ee\u524d\u6c92\u6709\u53ef\u7ba1\u7406\u7684\u767d\u540d\u55ae\u5e33\u865f</td></tr>`;
        return;
      }
      const e = window.SafeUI.escape.bind(window.SafeUI);
      const formatDate = (value) => {
        if (!value) return '\u5c1a\u672a\u767b\u5165';
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? '\u2014' : date.toLocaleString('zh-TW', {
          year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
        });
      };
      tbody.innerHTML = list.map(acc => {
        const isSuper = acc.role === 'super_admin';
        const roleBadge = isSuper
          ? `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">\u7cfb\u7d71\u7ba1\u7406\u54e1</span>`
          : `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">\u4e00\u822c\u6559\u8077\u54e1</span>`;
        const statusBadge = acc.enabled
          ? `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">\u555f\u7528</span>`
          : `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">\u505c\u7528</span>`;
        const toggleText = acc.enabled ? '\u505c\u7528' : '\u555f\u7528';
        const toggleClass = acc.enabled
          ? 'text-rose-700 border-rose-200 hover:bg-rose-50'
          : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50';
        return `
          <tr>
            <td class="font-bold text-slate-900 text-xs whitespace-nowrap">${e(acc.name || acc.account)}</td>
            <td class="font-mono font-bold text-slate-800 text-xs whitespace-nowrap">${e(acc.account)}</td>
            <td class="text-center whitespace-nowrap">${roleBadge}</td>
            <td class="text-center whitespace-nowrap">${statusBadge}</td>
            <td class="text-xs text-slate-500 whitespace-nowrap">${e(formatDate(acc.lastSignInAt))}</td>
            <td class="text-center whitespace-nowrap">
              <div class="inline-flex gap-1.5">
                <button data-uid="${e(acc.uid)}" onclick="AdminPortal.openAdminAccountModal(this.dataset.uid)" class="px-2.5 py-1.5 rounded-lg text-xs font-bold text-blue-700 border border-blue-200 hover:bg-blue-50">\u7de8\u8f2f\uff0f\u5bc6\u78bc</button>
                <button data-uid="${e(acc.uid)}" data-enabled="${acc.enabled ? 'false' : 'true'}" onclick="AdminPortal.toggleAdminAccount(this.dataset.uid, this.dataset.enabled === 'true')" class="px-2.5 py-1.5 rounded-lg text-xs font-bold border ${toggleClass}">${toggleText}</button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-7 text-rose-600 font-bold">${window.SafeUI.escape(err.message || '\u767d\u540d\u55ae\u8f09\u5165\u5931\u6557')}</td></tr>`;
    } finally {
      this.adminAccountsLoading = false;
    }
  },
  openAdminAccountModal(id = null) {
    const account = id ? this.adminAccounts.find(item => item.uid === id) : null;
    this.editingAccountId = account?.uid || null;
    const modal = document.getElementById('adminAccountEditModal');
    const header = document.getElementById('accountModalHeader');
    const nameInput = document.getElementById('accountInputName');
    const accountInput = document.getElementById('accountInputUsername');
    const passwordInput = document.getElementById('accountInputPassword');
    const roleSelect = document.getElementById('accountSelectRole');
    const enabledInput = document.getElementById('accountInputEnabled');
    const passwordHint = document.getElementById('accountPasswordHint');
    if (header) header.textContent = account ? '\u7de8\u8f2f\u7ba1\u7406\u54e1\u767d\u540d\u55ae' : '\u65b0\u589e\u7ba1\u7406\u54e1\u767d\u540d\u55ae';
    if (nameInput) nameInput.value = account?.name || '';
    if (accountInput) {
      accountInput.value = account?.account || '';
      accountInput.disabled = Boolean(account);
      accountInput.classList.toggle('opacity-60', Boolean(account));
      accountInput.classList.toggle('cursor-not-allowed', Boolean(account));
    }
    if (passwordInput) passwordInput.value = '';
    if (roleSelect) roleSelect.value = account?.role || 'staff';
    if (enabledInput) enabledInput.checked = account ? account.enabled !== false : true;
    if (passwordHint) passwordHint.textContent = account
      ? '\u7559\u7a7a\u4ee3\u8868\u7dad\u6301\u539f\u5bc6\u78bc\uff1b\u8f38\u5165\u81f3\u5c11 8 \u78bc\u53ef\u76f4\u63a5\u91cd\u8a2d\u3002\u7cfb\u7d71\u4e0d\u6703\u986f\u793a\u6216\u4fdd\u5b58\u539f\u5bc6\u78bc\u3002'
      : '\u65b0\u589e\u5e33\u865f\u5fc5\u9808\u8a2d\u5b9a\u81f3\u5c11 8 \u78bc\u7684\u521d\u59cb\u5bc6\u78bc\uff1b\u5bc6\u78bc\u53ea\u6703\u50b3\u9001\u7d66 Firebase Authentication\u3002';
    if (modal) modal.classList.remove('hidden');
    setTimeout(() => nameInput?.focus(), 50);
  },
  closeAdminAccountModal() {
    const modal = document.getElementById('adminAccountEditModal');
    if (modal) modal.classList.add('hidden');
    this.editingAccountId = null;
  },
  async saveAdminAccountModal() {
    const name = document.getElementById('accountInputName')?.value.trim() || '';
    const account = document.getElementById('accountInputUsername')?.value.trim().toLowerCase() || '';
    const password = document.getElementById('accountInputPassword')?.value || '';
    const role = document.getElementById('accountSelectRole')?.value || 'staff';
    const enabled = document.getElementById('accountInputEnabled')?.checked !== false;
    const saveButton = document.getElementById('adminAccountSaveBtn');
    const isEditingAccount = Boolean(this.editingAccountId);
    if (name.length < 2 || !/^[a-z0-9._-]{3,64}$/.test(account)) {
      this.showToast('\u8acb\u8f38\u5165\u59d3\u540d\uff0c\u4e26\u78ba\u8a8d\u5e33\u865f\u683c\u5f0f\u6b63\u78ba', 'warning');
      return;
    }
    if ((!this.editingAccountId || password) && password.length < 8) {
      this.showToast(this.editingAccountId ? '\u65b0\u5bc6\u78bc\u81f3\u5c11\u9700\u8981 8 \u78bc' : '\u65b0\u589e\u5e33\u865f\u5fc5\u9808\u8a2d\u5b9a\u81f3\u5c11 8 \u78bc\u7684\u521d\u59cb\u5bc6\u78bc', 'warning');
      return;
    }
    if (this.editingAccountId && password && !confirm(`\u78ba\u5b9a\u8981\u91cd\u8a2d\u300c${name}\u300d\u7684\u767b\u5165\u5bc6\u78bc\u55ce\uff1f`)) return;
    try {
      if (saveButton) {
        saveButton.disabled = true;
        saveButton.textContent = '\u5132\u5b58\u4e2d\u2026';
      }
      const saved = await window.FitnessFirebase.saveAdminAccount({
        uid: this.editingAccountId || '',
        account,
        name,
        password,
        role,
        enabled
      });
      this.auditAccountsLoaded = false;
      if (saved?.uid === this.currentAdminUser?.uid) {
        this.currentAdminUser = { ...this.currentAdminUser, name: saved.name, role: saved.role };
        window.FitnessFirebase.currentAdminProfile = this.currentAdminUser;
        this.applyRoleBasedNavigation();
      }
      this.recordAudit(
        isEditingAccount ? '\u66f4\u65b0\u7ba1\u7406\u5e33\u865f' : '\u65b0\u589e\u7ba1\u7406\u5e33\u865f',
        `${isEditingAccount ? '\u66f4\u65b0' : '\u65b0\u589e'}\u300c${saved.name}\uff08${saved.account}\uff09\u300d\uff1b\u89d2\u8272\uff1a${saved.role === 'super_admin' ? '\u7cfb\u7d71\u7ba1\u7406\u54e1' : '\u4e00\u822c\u6559\u8077\u54e1'}\uff1b\u72c0\u614b\uff1a${saved.enabled ? '\u555f\u7528' : '\u505c\u7528'}${password ? '\uff1b\u5305\u542b\u5bc6\u78bc\u91cd\u8a2d' : ''}`
      );
      this.closeAdminAccountModal();
      this.showToast(password ? '\u7ba1\u7406\u54e1\u8cc7\u6599\u8207\u5bc6\u78bc\u5df2\u5b89\u5168\u66f4\u65b0' : '\u7ba1\u7406\u54e1\u767d\u540d\u55ae\u8cc7\u6599\u5df2\u66f4\u65b0', 'success');
      await this.renderAdminAccountsManagement();
    } catch (err) {
      this.recordAudit(
        isEditingAccount ? '\u66f4\u65b0\u7ba1\u7406\u5e33\u865f' : '\u65b0\u589e\u7ba1\u7406\u5e33\u865f',
        `\u57f7\u884c\u5931\u6557\uff1a${err.message || '\u8acb\u7a0d\u5f8c\u518d\u8a66'}`,
        '-',
        'failure'
      );
      this.showToast(`\u767d\u540d\u55ae\u5132\u5b58\u5931\u6557\uff1a${err.message || '\u8acb\u7a0d\u5f8c\u518d\u8a66'}`, 'danger');
    } finally {
      if (saveButton) {
        saveButton.disabled = false;
        saveButton.textContent = '\u5132\u5b58\u8a2d\u5b9a';
      }
    }
  },
  async toggleAdminAccount(id, enabled) {
    const account = this.adminAccounts.find(item => item.uid === id);
    if (!account) return;
    const actionText = enabled ? '\u555f\u7528' : '\u505c\u7528';
    if (!confirm(`\u78ba\u5b9a\u8981${actionText}\u300c${account.name}\uff08${account.account}\uff09\u300d\u55ce\uff1f`)) return;
    try {
      await window.FitnessFirebase.saveAdminAccount({
        uid: account.uid,
        account: account.account,
        name: account.name,
        password: '',
        role: account.role,
        enabled
      });
      this.auditAccountsLoaded = false;
      this.recordAudit(`${actionText}\u7ba1\u7406\u5e33\u865f`, `\u5df2${actionText}\u300c${account.name}\uff08${account.account}\uff09\u300d`);
      this.showToast(`\u5df2${actionText}\u7ba1\u7406\u54e1\u5e33\u865f`, 'success');
      await this.renderAdminAccountsManagement();
    } catch (err) {
      this.recordAudit(`${actionText}\u7ba1\u7406\u5e33\u865f`, `\u57f7\u884c\u5931\u6557\uff1a${err.message || '\u8acb\u7a0d\u5f8c\u518d\u8a66'}`, '-', 'failure');
      this.showToast(`${actionText}\u5931\u6557\uff1a${err.message || '\u8acb\u7a0d\u5f8c\u518d\u8a66'}`, 'danger');
    }
  },
  async syncAllToFirebase() {
    this.showToast('\u6b63\u5728\u4e0a\u50b3\u4e26\u540c\u6b65\u672c\u6a5f\u5168\u91cf\u8cc7\u6599\u81f3 Firebase \u96f2\u7aef...', 'info');
    const res = await window.FitnessStore.syncAllToFirebase();
    if (res.success) {
      this.showToast(`\ud83d\udd25 \u6210\u529f\u5c07 ${res.studentCount} \u7b46\u5b78\u751f\u5b78\u7c4d\u3001${res.recordCount} \u7b46\u6210\u7e3e\u8207 ${res.annCount} \u7b46\u516c\u544a\u5b8c\u5168\u540c\u6b65\u81f3 Firebase \u96f2\u7aef\uff01`, 'success');
      window.FitnessStore.addAuditLog({
        operator: window.FitnessStore.getCurrentOperatorName(),
        action: '\u5168\u91cf\u540c\u6b65\u81f3 Firebase',
        details: `\u6210\u529f\u63a8\u64ad ${res.studentCount} \u7b46\u5b78\u751f\u3001${res.recordCount} \u7b46\u6210\u7e3e\u8cc7\u6599\u81f3 Firebase \u96f2\u7aef`
      });
    } else {
      this.recordAudit('\u5168\u91cf\u540c\u6b65\u81f3 Firebase', `\u540c\u6b65\u5931\u6557\uff1a${res.message || '\u672a\u77e5\u932f\u8aa4'}`, '-', 'failure');
      this.showToast(`\u26a0\ufe0f Firebase \u540c\u6b65\u5931\u6557\uff1a${res.message}`, 'danger');
    }
  },
  async syncFromFirebase() {
    this.showToast('\u6b63\u5728\u5f9e Firebase \u96f2\u7aef\u540c\u6b65\u6700\u65b0\u5168\u6821\u8cc7\u6599...', 'info');
    const res = await window.FitnessStore.syncFromFirebase();
    if (res.success) {
      this.showToast(`\u2705 \u5df2\u6210\u529f\u5f9e Firebase \u96f2\u7aef\u62c9\u53d6 ${res.studentCount} \u7b46\u5b78\u751f\u5b78\u7c4d\u8207 ${res.recordCount} \u7b46\u6210\u7e3e\uff01`, 'success');
      this.recordAudit('\u5f9e Firebase \u62c9\u53d6\u8cc7\u6599', `\u5df2\u62c9\u53d6 ${res.studentCount} \u7b46\u5b78\u751f\u5b78\u7c4d\u8207 ${res.recordCount} \u7b46\u6210\u7e3e`);
      this.renderCurrentView();
    } else {
      this.recordAudit('\u5f9e Firebase \u62c9\u53d6\u8cc7\u6599', `\u62c9\u53d6\u5931\u6557\uff1a${res.message || '\u672a\u77e5\u932f\u8aa4'}`, '-', 'failure');
      this.showToast(`\u26a0\ufe0f \u96f2\u7aef\u62c9\u53d6\u63d0\u793a\uff1a${res.message}`, 'warning');
    }
  },
  handleInputClearBtn(inputId) {
    const input = document.getElementById(inputId);
    const btn = document.getElementById(`${inputId}ClearBtn`);
    if (input && btn) {
      if (input.value.trim().length > 0) {
        btn.classList.remove('hidden');
      } else {
        btn.classList.add('hidden');
      }
    }
  },
  clearSearchInput(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.value = '';
    const btn = document.getElementById(`${inputId}ClearBtn`);
    if (btn) btn.classList.add('hidden');
    input.focus();
    if (inputId === 'rosterSearchInput') {
      this.resetRosterPageAndRender();
    } else if (inputId === 'thresholdSearchInput') {
      this.resetThresholdPageAndRender();
    } else if (inputId === 'individualSearchInput') {
      const area = document.getElementById('individualSearchResultArea');
      const empty = document.getElementById('individualSearchEmpty');
      if (area) area.classList.add('hidden');
      if (empty) empty.classList.add('hidden');
    } else if (inputId === 'recordsSearchInput') {
      this.resetRecordsPageAndRender();
    } else if (inputId === 'riskSearchInput') {
      this.resetRiskPageAndRender();
    } else if (inputId === 'studentIdInput') {
      if (window.StudentPortal) window.StudentPortal.clearSearch();
    }
  }
};
document.addEventListener('DOMContentLoaded', () => {
  window.AdminPortal.init();
});
