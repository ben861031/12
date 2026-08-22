/**
 * 體適能查詢與管理平台 - 管理後台邏輯 (Admin Portal)
 * 劃分「學生名冊」(班級, 學號, 姓名, 入學年, 學籍狀態, 操作) 與「門檻查詢」(門檻狀態, 通過次數, 需補次數, 軌跡)
 * 專用獨立對話盒：編輯學籍基本資料 Modal vs 審核體適能畢業門檻 Modal
 */

window.AdminPortal = {
  isAdminLoggedIn: false,
  currentAdminUser: null,
  authReady: false,
  editingStudentId: null,
  activeView: 'roster',
  selectedRiskIds: new Set(),
  rosterPage: 1,
  rosterPageSize: 50,
  adminAccounts: [],
  adminAccountsLoading: false,

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

    if (rosterSearch) rosterSearch.addEventListener('input', () => this.renderStudentRoster());
    if (rosterYear) rosterYear.addEventListener('change', () => { document.getElementById('rosterClassFilter').value = ''; this.renderStudentRoster(); });
    if (rosterClass) rosterClass.addEventListener('change', () => this.renderStudentRoster());
    if (rosterStatus) rosterStatus.addEventListener('change', () => this.renderStudentRoster());
    if (rosterTrueYear) rosterTrueYear.addEventListener('change', () => this.renderStudentRoster());
    if (rosterAdmission) rosterAdmission.addEventListener('change', () => this.renderStudentRoster());
    if (rosterIdentity) rosterIdentity.addEventListener('change', () => this.renderStudentRoster());

    const thresholdSearch = document.getElementById('thresholdSearchInput');
    const thresholdYear = document.getElementById('thresholdEnrollYearFilter');
    const thresholdClass = document.getElementById('thresholdClassFilter');
    const thresholdStatus = document.getElementById('thresholdStatusFilter');
    const thresholdRosterStatus = document.getElementById('thresholdRosterStatusFilter');
    const thresholdTrueYear = document.getElementById('thresholdTrueYearFilter');
    const thresholdAdmission = document.getElementById('thresholdAdmissionFilter');
    const thresholdIdentity = document.getElementById('thresholdIdentityFilter');

    if (thresholdSearch) thresholdSearch.addEventListener('input', () => this.renderThresholdAudit());
    if (thresholdYear) thresholdYear.addEventListener('change', () => { document.getElementById('thresholdClassFilter').value = ''; this.renderThresholdAudit(); });
    if (thresholdClass) thresholdClass.addEventListener('change', () => this.renderThresholdAudit());
    if (thresholdStatus) thresholdStatus.addEventListener('change', () => this.renderThresholdAudit());
    if (thresholdRosterStatus) thresholdRosterStatus.addEventListener('change', () => this.renderThresholdAudit());
    if (thresholdTrueYear) thresholdTrueYear.addEventListener('change', () => this.renderThresholdAudit());
    if (thresholdAdmission) thresholdAdmission.addEventListener('change', () => this.renderThresholdAudit());
    if (thresholdIdentity) thresholdIdentity.addEventListener('change', () => this.renderThresholdAudit());

    window.FitnessStore.subscribe(() => {
      if (this.isAdminLoggedIn) {
        this.renderCurrentView();
      }
    });
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

    // 防呆：若記憶體尚無學生資料，靜默從雲端拉取
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
      this.showToast('請輸入管理員帳號與密碼', 'warning');
      return;
    }

    try {
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = '驗證中…';
      }
      const matchedUser = await window.FitnessFirebase.signInAdmin(acc, pwd);
      this.isAdminLoggedIn = true;
      this.currentAdminUser = matchedUser;
      this.hideLoginModal();
      this.applyRoleBasedNavigation();
      this.showToast(`歡迎登入，${matchedUser.name || matchedUser.username}！`, 'success');
      this.renderCurrentView();

      const res = await window.FitnessStore.syncFromFirebase();
      if (res.success) this.renderCurrentView();
    } catch (err) {
      this.isAdminLoggedIn = false;
      this.currentAdminUser = null;
      const message = /wrong-password|user-not-found|invalid-login-credentials|invalid-credential|invalid-email/i.test(err?.code || err?.message || '')
        ? '帳號或密碼錯誤，請確認輸入'
        : (err?.message || '登入失敗，請稍後再試');
      this.showToast(message, 'danger');
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = '登 入';
      }
    }
  },

  async logout() {
    this.isAdminLoggedIn = false;
    this.currentAdminUser = null;
    window.FitnessStore.clearPrivateCache();
    await window.FitnessFirebase.signOut();
    this.showToast('已登出系統', 'info');
    if (window.App) window.App.switchTab('student');
  },

  applyRoleBasedNavigation() {
    const user = this.currentAdminUser;
    const nameEl = document.getElementById('sidebarAdminName');
    const badgeEl = document.getElementById('sidebarAdminRoleBadge');
    const mobileNameEl = document.getElementById('mobileAdminName');
    const mobileBadgeEl = document.getElementById('mobileAdminRoleBadge');

    const displayName = user ? (user.name || user.username || '管理員') : '未登入';
    const roleText = user ? (user.role === 'super_admin' ? '系統管理員' : '一般教職員') : '';

    if (nameEl) nameEl.textContent = displayName;
    if (mobileNameEl) mobileNameEl.textContent = displayName;

    if (badgeEl) {
      badgeEl.textContent = roleText;
      badgeEl.className = user && user.role === 'super_admin'
        ? 'text-[11px] font-bold px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 shrink-0'
        : 'text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 shrink-0';
    }

    if (mobileBadgeEl) {
      mobileBadgeEl.textContent = roleText ? `${roleText} 登入中` : '';
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
    if (this.currentAdminUser?.role === 'staff' && (viewName === 'settings' || viewName === 'logs')) {
      this.showToast('一般教職員權限無權存取系統設定與操作紀錄', 'warning');
      this.activeView = 'roster';
      viewName = 'roster';
    } else {
      this.activeView = viewName;
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

    // 動態更新頁面頂部大標題與右上角按鈕群
    const titlesMap = {
      roster: '學生名冊',
      threshold: '門檻查詢',
      dashboard: '個人成績查詢',
      records: '檢測資料管理',
      analytics: '班級統計',
      risk: '未合格名單',
      logs: '操作紀錄',
      settings: '系統設定',
      announcements: '最新公告管理'
    };
    const elTitle = document.getElementById('adminPageTitle');
    if (elTitle) elTitle.textContent = titlesMap[viewName] || '學生名冊';

    const actionGroup = document.getElementById('adminHeaderActionGroup');
    if (actionGroup) {
      if (viewName === 'roster') {
        actionGroup.innerHTML = `
          <button onclick="App.openRosterModal()" class="px-4 py-2 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] text-white text-sm font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
            <span>匯入學籍</span>
          </button>
          <button onclick="AdminPortal.exportRosterExcel()" class="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-sm font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]">
            <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            <span>匯出學籍</span>
          </button>
        `;
      } else if (viewName === 'threshold') {
        actionGroup.innerHTML = `
          <button onclick="App.openTestImportModal()" class="px-4 py-2 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] text-white text-sm font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
            <span>匯入成績</span>
          </button>
          <button onclick="AdminPortal.openExportModal()" class="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-sm font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]">
            <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            <span>匯出總表</span>
          </button>
        `;
      } else if (viewName === 'records') {
        actionGroup.innerHTML = `
          <button onclick="AdminPortal.openAddRecordModal()" class="px-4 py-2 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] text-white text-sm font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
            <span>單獨新增成績</span>
          </button>
        `;
      } else if (viewName === 'analytics') {
        actionGroup.innerHTML = `
          <button onclick="AdminPortal.exportAnalyticsExcel()" class="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-sm font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]">
            <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            <span>匯出報表</span>
          </button>
        `;
      } else if (viewName === 'risk') {
        actionGroup.innerHTML = `
          <button onclick="AdminPortal.generateRiskEML()" class="px-4 py-2 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] text-white text-sm font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            <span>產生 EML 範本</span>
          </button>
          <button onclick="AdminPortal.batchCopyEmails()" class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
            <span>複製 Email</span>
          </button>
          <button onclick="AdminPortal.exportRiskExcel()" class="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-sm font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]">
            <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            <span>匯出名單</span>
          </button>
        `;
      } else if (viewName === 'announcements') {
        actionGroup.innerHTML = `
          <button onclick="AdminPortal.openAnnouncementModal()" class="px-4 py-2 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] text-white text-sm font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
            <span>新增最新公告</span>
          </button>
        `;
      } else {
        actionGroup.innerHTML = '';
      }
    }

    // 控制頂部 4 大統計卡片顯示/隱藏 (僅【學生名冊】與【門檻查詢】顯示)
    const statContainer = document.getElementById('adminHeaderStatContainer');
    const showStatViews = ['roster', 'threshold'];
    if (statContainer) {
      if (showStatViews.includes(viewName)) {
        statContainer.classList.remove('hidden');
      } else {
        statContainer.classList.add('hidden');
      }
    }

    // 動態更新頁面頂部副標題
    const subtitlesMap = {
      roster: '共 0 筆學生資料',
      threshold: '全校學生畢業門檻審核與合格紀錄',
      dashboard: '單一學生體適能歷年檢測數據與成績單',
      records: '全校歷年體適能原始成績數據管理',
      analytics: '全校與各班級體適能通過率統計分析圖表',
      risk: '需加強輔導與補測學生追蹤名單',
      logs: '管理員與教職員系統操作軌跡紀錄',
      settings: '權限控制與系統參數偏好設定',
      announcements: '平台最新消息與公告內容編輯'
    };
    const elSubtitle = document.getElementById('adminPageSubtitle');
    if (elSubtitle) {
      elSubtitle.textContent = subtitlesMap[viewName] || '';
    }

    this.applyRoleBasedNavigation();
    this.renderCurrentView();
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
    if (this.activeView === 'logs' && this.currentAdminUser?.role !== 'staff') this.renderAuditLogs();
    if (this.activeView === 'announcements') this.renderAnnouncementsManagement();
    if (this.activeView === 'settings' && this.currentAdminUser?.role !== 'staff') this.renderAdminAccountsManagement();
  },

  async clearAllSystemData() {
    if (confirm('確定要清除所有系統資料嗎？\n\n這將會刪除所有學生學籍、成績紀錄與操作紀錄，且無法復原！')) {
      try {
        await window.FitnessStore.clearAllData({ cloud: true });
        this.showToast('本機與雲端學生、成績及查詢資料已清空', 'success');
        this.renderCurrentView();
      } catch (err) {
        this.showToast(`清除失敗：${err.message || '請確認管理權限與網路'}`, 'danger');
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
      option.textContent = `${sem.slice(0, 3)}-${sem.slice(3)} 學期`;
      select.appendChild(option);
    });
  },

  bulkDeleteSemesterRecords() {
    const select = document.getElementById('bulkDeleteSemesterSelect');
    if (!select) return;

    const targetSemester = select.value;
    if (!targetSemester) {
      this.showToast('請先選擇要刪除的學期', 'danger');
      return;
    }

    if (!confirm(`⚠️ 警告：您確定要刪除「全校」在 ${targetSemester} 學期的所有檢測紀錄嗎？\n\n注意：這項操作無法復原，並會自動重新計算所有受影響學生的通過次數！`)) {
      return;
    }

    let records = window.FitnessStore.getFitnessRecords();
    const recordsToDelete = records.filter(r => String(r.semester) === String(targetSemester));
    
    if (recordsToDelete.length === 0) {
      this.showToast('該學期沒有任何檢測紀錄', 'info');
      return;
    }

    // Identify affected students before deleting
    const affectedStudentIds = [...new Set(recordsToDelete.map(r => r.studentId))];

    // Filter out the records for the target semester
    records = records.filter(r => String(r.semester) !== String(targetSemester));
    
    // Save updated records
    window.FitnessStore.saveFitnessRecords(records);

    // Recalculate pass counts for all affected students
    affectedStudentIds.forEach(id => {
      window.FitnessStore.recalculateStudentPassCount(id);
    });

    // Add Audit Log
    window.FitnessStore.addAuditLog({
      operator: '管理員',
      action: '批量刪除學期資料',
      studentId: 'MULTI',
      details: `一次性刪除 ${targetSemester} 學期全校共 ${recordsToDelete.length} 筆檢測成績`
    });

    select.value = ''; // Reset select
    this.showToast(`已成功刪除 ${targetSemester} 學期共 ${recordsToDelete.length} 筆紀錄並重算成績！`, 'success');
  },

  getValidStudents() {
    // 依需求：所有統計與報表僅顯示有正式學籍的學生（過濾掉只有成績但未建立學籍的「幽靈學生」）
    return window.FitnessStore.getStudents().filter(s => s.isRosterImported || s.rosterStatus !== undefined);
  },

  renderHeaderSummary(filteredList = null) {
    let students = [];
    if (filteredList && Array.isArray(filteredList)) {
      students = filteredList;
    } else {
      const allValidStudents = this.getValidStudents();
      students = allValidStudents.filter(s => (s.rosterStatus || '在學') === '在學');
    }
    
    const total = students.length;
    let passed = 0;
    let failed = 0;

    students.forEach(s => {
      if (s.status === '不通過') failed++;
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
      elSubtitle.textContent = `共 ${total.toLocaleString()} 筆學生資料`;
    }
  },

  renderFilterDropdowns() {
    const students = this.getValidStudents();
    const grades = Array.from(new Set(students.map(s => s.className && s.className[2]).filter(Boolean))).sort();
    const gradesMap = { '一': '一年級', '二': '二年級', '三': '三年級', '四': '四年級', '五': '五年級', '六': '六年級', '七': '七年級' };

    const rYearFilter = document.getElementById('rosterEnrollYearFilter');
    const rClassFilter = document.getElementById('rosterClassFilter');
    if (rYearFilter && rClassFilter) {
      if (rYearFilter.children.length <= 1) {
        rYearFilter.innerHTML = '<option value="">年級</option>' + grades.map(g => `<option value="${g}">${gradesMap[g] || g}</option>`).join('');
      }
      const selYear = rYearFilter.value;
      const validClasses = Array.from(new Set(students.filter(s => !selYear || (s.className && s.className[2] === selYear)).map(s => s.className).filter(Boolean))).sort();
      const currentClass = rClassFilter.value;
      rClassFilter.innerHTML = '<option value="">班級</option>' + validClasses.map(c => `<option value="${c}">${c}</option>`).join('');
      if (validClasses.includes(currentClass)) rClassFilter.value = currentClass;
    }

    const tYearFilter = document.getElementById('thresholdEnrollYearFilter');
    const tClassFilter = document.getElementById('thresholdClassFilter');
    if (tYearFilter && tClassFilter) {
      if (tYearFilter.children.length <= 1) {
        tYearFilter.innerHTML = '<option value="">年級</option>' + grades.map(g => `<option value="${g}">${gradesMap[g] || g}</option>`).join('');
      }
      const selYear = tYearFilter.value;
      const validClasses = Array.from(new Set(students.filter(s => !selYear || (s.className && s.className[2] === selYear)).map(s => s.className).filter(Boolean))).sort();
      const currentClass = tClassFilter.value;
      tClassFilter.innerHTML = '<option value="">班級</option>' + validClasses.map(c => `<option value="${c}">${c}</option>`).join('');
      if (validClasses.includes(currentClass)) tClassFilter.value = currentClass;
    }

    const riYearFilter = document.getElementById('riskEnrollYearFilter');
    const riClassFilter = document.getElementById('riskClassFilter');
    if (riYearFilter && riClassFilter) {
      const riskStudents = students.filter(s => s.status === '不通過');
      const riskGrades = Array.from(new Set(riskStudents.map(s => s.className && s.className[2]).filter(Boolean))).sort();
      const currentYear = riYearFilter.value;
      riYearFilter.innerHTML = '<option value="">年級</option>' + riskGrades.map(g => `<option value="${g}">${gradesMap[g] || g}</option>`).join('');
      if (riskGrades.includes(currentYear)) riYearFilter.value = currentYear;

      const selYear = riYearFilter.value;
      const validClasses = Array.from(new Set(riskStudents.filter(s => !selYear || (s.className && s.className[2] === selYear)).map(s => s.className).filter(Boolean))).sort();
      const currentClass = riClassFilter.value;
      riClassFilter.innerHTML = '<option value="">班級</option>' + validClasses.map(c => `<option value="${c}">${c}</option>`).join('');
      if (validClasses.includes(currentClass)) riClassFilter.value = currentClass;
    }

    // Populate True Year, Admission, Identity dropdowns
    const trueYears = Array.from(new Set(students.map(s => s.enrollYear || window.FitnessStore.getEnrollYearFromStudentId(s.studentId)).filter(Boolean))).sort();
    const admissions = Array.from(new Set(students.map(s => s.admissionMethod).filter(Boolean))).sort();
    const identities = Array.from(new Set(students.map(s => s.identityStatus).filter(Boolean))).sort();

    const populateDropdown = (id, options, defaultLabel) => {
      const el = document.getElementById(id);
      if (el && el.children.length <= 1) {
        el.innerHTML = `<option value="">${defaultLabel}</option>` + options.map(o => `<option value="${o}">${o}</option>`).join('');
      }
    };

    populateDropdown('rosterTrueYearFilter', trueYears, '入學年');
    populateDropdown('rosterAdmissionFilter', admissions, '入學方式');
    populateDropdown('rosterIdentityFilter', identities, '身分');

    populateDropdown('thresholdTrueYearFilter', trueYears, '入學年');
    populateDropdown('thresholdAdmissionFilter', admissions, '入學方式');
    populateDropdown('thresholdIdentityFilter', identities, '身分');
  },

  // 1. 學生名冊檢視：班級、學號、姓名、入學年、學籍狀態、操作 (獨立點擊開啟 openRosterEditModal)
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
      const rStatus = s.rosterStatus || '在學';
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
            查無符合條件之學生名冊資料
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
      const rosterStatus = s.rosterStatus || '在學';
      const enrollYear = s.enrollYear || window.FitnessStore.getEnrollYearFromStudentId(s.studentId);

      let statusBadge = `<span class="px-3 py-1 rounded-full text-sm font-bold bg-blue-50 text-blue-700 border border-blue-200">在學</span>`;
      if (rosterStatus === '畢業') {
        statusBadge = `<span class="px-3 py-1 rounded-full text-sm font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">畢業</span>`;
      } else if (rosterStatus === '轉學') {
        statusBadge = `<span class="px-3 py-1 rounded-full text-sm font-bold bg-amber-50 text-amber-800 border border-amber-200">轉學</span>`;
      } else if (rosterStatus === '休學') {
        statusBadge = `<span class="px-3 py-1 rounded-full text-sm font-bold bg-rose-50 text-rose-700 border border-rose-200">休學</span>`;
      }

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
              編輯
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
      <span>顯示 ${start}–${end}，共 ${total.toLocaleString()} 筆</span>
      <div class="flex items-center gap-2">
        <button type="button" onclick="AdminPortal.changeRosterPage(-1)" ${this.rosterPage <= 1 ? 'disabled' : ''} class="px-3 py-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40 font-bold">上一頁</button>
        <span class="font-mono font-bold text-slate-700">${this.rosterPage} / ${totalPages}</span>
        <button type="button" onclick="AdminPortal.changeRosterPage(1)" ${this.rosterPage >= totalPages ? 'disabled' : ''} class="px-3 py-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40 font-bold">下一頁</button>
      </div>
    `;
  },

  changeRosterPage(delta) {
    this.rosterPage = Math.max(1, this.rosterPage + delta);
    this.renderStudentRoster();
    document.getElementById('erpView_roster')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  // 2. 門檻查詢檢視：學號、班級、姓名、門檻狀態、通過次數、需補次數、軌跡、特殊身分/備註、編輯 (獨立點擊開啟 openThresholdEditModal)
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
      const rStatus = s.rosterStatus || '在學';
      const matchRosterStatus = !rStatusFilter || rStatus === rStatusFilter;

      const sTrueYear = s.enrollYear || window.FitnessStore.getEnrollYearFromStudentId(s.studentId);
      const matchTrueYear = !trueYear || sTrueYear === trueYear;
      const matchAdmission = !admission || (s.admissionMethod && s.admissionMethod === admission);
      const matchIdentity = !identity || (s.identityStatus && s.identityStatus === identity);

      return matchKeyword && matchYear && matchClass && matchStatus && matchRosterStatus && matchTrueYear && matchAdmission && matchIdentity;
    });

    this.renderHeaderSummary(filtered);

    const tbody = document.getElementById('erpThresholdTbody');
    if (!tbody) return;

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10" class="text-center py-10 text-slate-400 font-bold">
            查無符合條件之資料
          </td>
        </tr>
      `;
      this.updateBatchActionBar();
      return;
    }

    const selectedSet = window.FitnessStore.selectedStudentIds;

    tbody.innerHTML = filtered.map(s => {
      const isSelected = selectedSet.has(s.studentId);
      const isPassed = s.status === '通過';

      const passSemList = [];
      if (s.semesters) {
        Object.keys(s.semesters).sort().forEach(sem => {
          if (Number(s.semesters[sem]) === 1) passSemList.push(sem);
        });
      }

      let specTagHtml = '';
      if (Number(s.isTransfer) === 1 || Number(s.transferCredit) === 1) {
        specTagHtml += `<span class="pill-warning text-xs mr-1">轉學扣抵</span>`;
      }

      const specText = `${s.specialIdentity || ''} ${s.identityStatus || ''} ${s.otherNotes || ''} ${s.reason || ''}`;
      const isDisability = Number(s.isExemptAthleteOrDisabled) === 2 || /身障|身心障礙|殘障|醫療免測/.test(specText);
      const isAthlete = Number(s.isExemptAthleteOrDisabled) === 1 || /體保|體育保送|運動代表隊/.test(specText);

      if (isDisability) {
        specTagHtml += `<span class="px-2 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200 mr-1">身障免測</span>`;
      } else if (isAthlete) {
        specTagHtml += `<span class="px-2 py-0.5 rounded text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 mr-1">體保免測</span>`;
      } else if (Number(s.isExemptAthleteOrDisabled) > 0 || Number(s.exemptCredit) === 2 || /免測/.test(specText)) {
        specTagHtml += `<span class="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 mr-1">核可免測</span>`;
      }

      if (s.otherNotes && !specTagHtml.includes(s.otherNotes)) {
        specTagHtml += `<span class="text-slate-500 text-xs">${s.otherNotes}</span>`;
      }

      const reqPass = window.FitnessStore.settings.requiredPassCount || 2;
      const calcDeficit = isPassed ? 0 : Math.max(0, reqPass - (s.passCount || 0));

      return `
        <tr class="${isSelected ? 'selected' : ''}">
          <td class="w-[3%] text-center">
            <input type="checkbox" 
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
          <td class="w-[9%] text-center font-bold font-mono text-slate-800">${s.passCount} 次</td>
          <td class="w-[9%] text-center font-bold font-mono text-rose-600">${calcDeficit} 次</td>
          <td class="w-[15%] text-center text-sm text-slate-600 font-mono tracking-tight">${passSemList.length > 0 ? passSemList.join('、') : '-'}</td>
          <td class="w-[13%] text-center text-xs px-2">${specTagHtml || '-'}</td>
          <td class="w-[9%] text-center">
            <button onclick="AdminPortal.openThresholdEditModal('${s.studentId}')" 
                    class="bg-slate-100 hover:bg-blue-50 hover:text-blue-600 border border-slate-300 px-3.5 py-1.5 rounded-lg text-sm font-bold transition-all inline-flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              編輯
            </button>
          </td>
        </tr>
      `;
    }).join('');

    this.updateBatchActionBar();
  },

  // -------------------------------------------------------------
  // 📇 專用 Modal 1: 編輯學籍基本資料 (僅包含姓名、班級、入學年、學籍狀態)
  // -------------------------------------------------------------
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

    if (header) header.textContent = `學號：${student.studentId}`;
    if (inputName) inputName.value = student.name || '';
    if (inputClass) inputClass.value = student.className || '';
    if (inputEnrollYear) inputEnrollYear.value = student.enrollYear || window.FitnessStore.getEnrollYearFromStudentId(student.studentId);
    if (inputAdmissionMethod) inputAdmissionMethod.value = student.admissionMethod || '';
    if (inputIdentity) inputIdentity.value = student.identityStatus || '';
    if (selectStatus) selectStatus.value = student.rosterStatus || '在學';

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
      rosterStatus: selectStatus || student.rosterStatus || '在學',
      updatedAt: new Date().toLocaleDateString('zh-TW')
    };

    window.FitnessStore.saveStudent(updated);
    this.closeRosterEditModal();
    this.showToast(`已成功修訂 ${updated.name} 的學籍基本資料`, 'success');
  },

  // -------------------------------------------------------------
  // 🎯 專用 Modal 2: 審核與修訂體適能畢業門檻 (專門設定門檻、扣抵與學期紀錄)
  // -------------------------------------------------------------
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

    if (header) header.textContent = `學號：${student.studentId} | 學生：${student.name} (${student.className})`;
    if (inputPassCount) inputPassCount.value = student.passCount || 0;
    if (selectStatus) selectStatus.value = student.status || '不通過';
    if (selectTransfer) selectTransfer.value = student.isTransfer || 0;
    if (selectAthlete) {
      const specText = `${student.specialIdentity || ''} ${student.identityStatus || ''} ${student.otherNotes || ''} ${student.reason || ''}`;
      const isDisability = Number(student.isExemptAthleteOrDisabled) === 2 || /身障|身心障礙|殘障|醫療免測/.test(specText);
      const isAthlete = (Number(student.isExemptAthleteOrDisabled) === 1 && !/身障|身心障礙|殘障/.test(specText)) || /體保|體育保送|運動代表隊/.test(specText);

      if (isDisability) {
        selectAthlete.value = 2; // 2: 身心障礙免測
      } else if (isAthlete) {
        selectAthlete.value = 1; // 1: 體保生免測
      } else if (Number(student.isExemptAthleteOrDisabled) > 0 || Number(student.exemptCredit) === 2 || /免測/.test(specText)) {
        selectAthlete.value = 3; // 3: 核可免測 (其他)
      } else {
        selectAthlete.value = 0; // 0: 否 (正常應測)
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
    let finalStatus = selectStatus || '不通過';

    const isExempt = selectAthlete > 0 || exemptAdd > 0;
    if (isExempt) {
      finalStatus = '通過';
    } else if (finalPassCount >= reqPass) {
      finalStatus = '通過';
    }

    let updatedSpecialIdentity = currentStudent.specialIdentity || '';
    if (selectAthlete === 1) updatedSpecialIdentity = '體保生';
    else if (selectAthlete === 2) updatedSpecialIdentity = '身心障礙';
    else if (selectAthlete === 3) updatedSpecialIdentity = '核可免測';

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

    updated.deficitCount = updated.status === '通過' ? 0 : Math.max(0, reqPass - updated.passCount);

    window.FitnessStore.saveStudent(updated);
    this.closeThresholdEditModal();
    this.showToast(`已成功修訂 ${updated.name} 之門檻與轉學扣抵資料`, 'success');
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

    window.FitnessStore.batchUpdateStatus(ids, '通過');
    window.FitnessStore.selectedStudentIds.clear();
    this.showToast(`已成功設定 ${ids.length} 位學生為「通過」`, 'success');
  },

  batchFailSelected() {
    const ids = Array.from(window.FitnessStore.selectedStudentIds);
    if (ids.length === 0) return;

    window.FitnessStore.batchUpdateStatus(ids, '不通過');
    window.FitnessStore.selectedStudentIds.clear();
    this.showToast(`已成功設定 ${ids.length} 位學生為「不通過」`, 'warning');
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
        ids = students.filter(s => s.status === '不通過').filter(s => {
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
        ids = students.filter(s => s.status === '不通過').map(s => s.studentId);
      }
    }

    if (ids.length === 0) {
      this.showToast('目前無可複製 Email 的學生', 'warning');
      return;
    }

    const emailList = ids.map(id => `s${id}@${domain}`).join('; ');
    navigator.clipboard.writeText(emailList).then(() => {
      this.showToast(`已複製 ${ids.length} 位學生的 Email 至剪貼簿`, 'success');
    }).catch(err => {
      this.showToast(`複製失敗：${err}`, 'danger');
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
      targetStudents = students.filter(s => s.status === '不通過').filter(s => {
        const eYear = s.className ? s.className[2] : '';
        const text = `${s.studentId} ${s.name} ${s.className}`.toLowerCase();
        const matchKeyword = !search || text.includes(search);
        const matchYear = !year || eYear === year;
        const matchClass = !cls || s.className === cls;
        return matchKeyword && matchYear && matchClass;
      });
    }

    if (targetStudents.length === 0) {
      this.showToast('所選或目前篩選條件下無未合格學生！', 'warning');
      return;
    }

    this.currentEmlTargetStudents = targetStudents;

    const summaryEl = document.getElementById('emlPreviewRecipientSummary');
    if (summaryEl) {
      summaryEl.textContent = `將發送至 ${targetStudents.length} 位未合格學生 (包含 ${targetStudents.slice(0, 3).map(s => s.name).join('、')}${targetStudents.length > 3 ? '...等' : ''})`;
    }

    const dateStr = new Date().toLocaleDateString('zh-TW');

    document.getElementById('emlSubjectInput').value = "【重要提醒】體適能畢業門檻未合格通知及補測說明";
    document.getElementById('emlSenderInput').value = "學務處 體育及活動組";

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
      `同學 您好：`,
      ``,
      `經核算，您目前的體適能畢業門檻尚未達標（本校畢業門檻為需通過 ${reqPassCount} 次體適能檢測）。`,
      ``,
      `⚠️ 請注意：未通過體適能畢業門檻將影響畢業資格，請務必關注本學期補測公告與報名時間！`,
      ``,
      `您可以至本校體適能查詢平台，確認個人檢測歷史紀錄與各單項成績：`,
      `🔗 查詢平台：點此開啟體適能查詢平台，`,
      `📄 規章細則：點此查看「學生體適能畢業條件實施細則 (PDF)」，`,
      ``,
      `若符合免測條件（如持有身心障礙證明、屬本校運動校隊等），請備妥相關證明文件至本組辦理。`
    ].join('\n');

    document.getElementById('emlBodyTextarea').value = defaultText;
  },

  downloadCustomizedEml() {
    if (!this.currentEmlTargetStudents || this.currentEmlTargetStudents.length === 0) {
      this.showToast('目標學生名單已失效，請重新開啟預覽！', 'warning');
      return;
    }

    const domain = window.FitnessStore.settings.schoolDomain || 'mail.edu.tw';
    const studentEmails = this.currentEmlTargetStudents.map(s => `s${s.studentId}@${domain}`).join(', ');

    const subjectStr = document.getElementById('emlSubjectInput')?.value?.trim() || '【重要提醒】體適能畢業門檻未合格通知及補測說明';
    const senderStr = document.getElementById('emlSenderInput')?.value?.trim() || '學務處 體育及活動組';
    const bodyText = document.getElementById('emlBodyTextarea')?.value || '';

    const encodeHeaderStr = (str) => `=?UTF-8?B?${btoa(unescape(encodeURIComponent(str)))}?=`;
    const fromHeader = `${encodeHeaderStr(senderStr)} <pe-office@${domain}>`;
    const subjectHeader = encodeHeaderStr(subjectStr);

    const paragraphs = bodyText.split(/\n\s*\n/).filter(p => p.trim() !== '');

    const formattedHtmlBody = paragraphs.map(pText => {
      let htmlLines = pText.split('\n').map(line => {
        let trimmed = line.trim();
        if (!trimmed) return '';
        if (trimmed.includes('🔗 查詢平台：')) {
          return `🔗 <strong>查詢平台：</strong><a href="${location.origin}${location.pathname}" style="color: #2563eb; font-weight: bold; text-decoration: underline;">點此開啟體適能查詢平台</a>，`;
        }
        if (trimmed.includes('📄 規章細則：')) {
          return `📄 <strong>規章細則：</strong><a href="https://jbagt.just.edu.tw/rule/rules/A003-114-11-26-yEO.pdf" target="_blank" style="color: #2563eb; font-weight: bold; text-decoration: underline;">點此查看「學生體適能畢業條件實施細則 (PDF)」</a>，`;
        }
        return trimmed;
      }).filter(Boolean).join('<br>\r\n');

      if (pText.includes('⚠️ 請注意：')) {
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
      `<body style="font-family: 'Microsoft JhengHei', '微軟正黑體', Arial, sans-serif; font-size: 15px; color: #1e293b; line-height: 1.8; background-color: #ffffff; padding: 20px;">`,
      `  <div style="max-width: 640px; margin: 0 auto;">`,
      formattedHtmlBody,
      `    <p style="margin: 24px 0 0 0; font-weight: bold; color: #1e293b; font-size: 15px;">${senderStr} 敬啟</p>`,
      `  </div>`,
      `</body>`,
      `</html>`
    ].join('\r\n');

    const blob = new Blob(['\uFEFF' + emlContent], { type: 'message/rfc822;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const filenameDate = new Date().toISOString().slice(0, 10);
    a.download = `未合格學生通知信草稿_${this.currentEmlTargetStudents.length}人_${filenameDate}.eml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.closeEmlPreviewModal();
    this.showToast(`🎉 成功產生並下載包含 ${this.currentEmlTargetStudents.length} 位未合格學生的自訂 EML 郵件草稿！`, 'success');
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

    // Populate profile card
    document.getElementById('indivProfileClass').textContent = student.className || '未知班級';
    document.getElementById('indivProfileId').textContent = student.studentId;
    document.getElementById('indivProfileName').textContent = student.name;
    
    // 學籍狀態
    const enrollStatusEl = document.getElementById('indivProfileEnrollStatus');
    const rStatus = student.rosterStatus || '在學';
    enrollStatusEl.textContent = rStatus;
    if (rStatus === '在學') enrollStatusEl.className = 'px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200';
    else if (rStatus === '畢業') enrollStatusEl.className = 'px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200';
    else if (rStatus === '休學') enrollStatusEl.className = 'px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200';
    else enrollStatusEl.className = 'px-2 py-0.5 rounded-full text-xs font-bold bg-slate-50 text-slate-600 border border-slate-200';

    // 數據統計
    document.getElementById('indivProfilePassCount').textContent = student.passCount || 0;
    const reqPass = window.FitnessStore.settings.requiredPassCount || 2;
    const deficit = student.status === '通過' ? 0 : Math.max(0, reqPass - (student.passCount || 0));
    const deficitEl = document.getElementById('indivProfileDeficit');
    deficitEl.textContent = deficit;
    deficitEl.className = deficit > 0 ? 'text-4xl font-black text-rose-500 font-mono' : 'text-4xl font-black text-emerald-500 font-mono';

    // 特殊標記
    const specialEl = document.getElementById('indivProfileSpecial');
    const specialTags = [];
    if (student.isExemptAthleteOrDisabled) specialTags.push('免測(體保/身障)');
    if (student.transferCredit > 0) specialTags.push('轉學抵免');
    if (student.manualStatusOverride) specialTags.push('手動強制覆寫');
    
    if (specialTags.length > 0) {
      specialEl.textContent = specialTags.join('、');
      specialEl.classList.remove('hidden');
    } else {
      specialEl.classList.add('hidden');
    }
    
    // 總結算
    const statusEl = document.getElementById('indivProfileStatus');
    if (student.status === '通過') {
      statusEl.className = 'text-emerald-700 bg-emerald-50 border border-emerald-200 text-lg px-8 py-2.5 font-black rounded-full shadow-sm mb-2 tracking-wide';
      statusEl.textContent = '✅ 通過 (合格)';
    } else {
      statusEl.className = 'text-rose-700 bg-rose-50 border border-rose-200 text-lg px-8 py-2.5 font-black rounded-full shadow-sm mb-2 tracking-wide';
      statusEl.textContent = '❌ 未合格';
    }

    // Populate records table
    const records = window.FitnessStore.getFitnessRecords().filter(r => r.studentId === student.studentId);
    records.sort((a, b) => a.semester.localeCompare(b.semester));

    const tbody = document.getElementById('individualRecordsTbody');
    if (records.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center py-10 text-slate-500 font-bold">該學生目前無任何測驗明細紀錄</td></tr>`;
    } else {
      tbody.innerHTML = records.map(r => {
        const scores = r.scores || {};
        const isPassed = r.isPassed;
        const resultHtml = isPassed 
          ? `<span class="pill-success text-xs px-2 py-1">合格</span>`
          : `<span class="pill-danger text-rose-700 text-xs px-2 py-1">未合格</span>`;
          
        return `
          <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
            <td class="w-[10%] text-center font-bold text-slate-800 font-mono">${r.semester}</td>
            <td class="w-[10%] text-center font-mono ${!isPassed ? 'text-rose-600 font-semibold' : 'text-slate-600'}">${scores.height || '-'}</td>
            <td class="w-[10%] text-center font-mono ${!isPassed ? 'text-rose-600 font-semibold' : 'text-slate-600'}">${scores.weight || '-'}</td>
            <td class="w-[15%] text-center font-mono ${!isPassed ? 'text-rose-600 font-semibold' : 'text-slate-600'}">${scores.sitAndReach || '-'}</td>
            <td class="w-[15%] text-center font-mono ${!isPassed ? 'text-rose-600 font-semibold' : 'text-slate-600'}">${scores.standingLongJump || '-'}</td>
            <td class="w-[15%] text-center font-mono ${!isPassed ? 'text-rose-600 font-semibold' : 'text-slate-600'}">${scores.sitUps || '-'}</td>
            <td class="w-[15%] text-center font-mono ${!isPassed ? 'text-rose-600 font-semibold' : 'text-slate-600'}">${String(scores.cardio || '-').replace('登階:', '')}</td>
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
      const cls = s.className || '未指定班級';
      if (!classStats[cls]) {
        classStats[cls] = { total: 0, passed: 0, failed: 0 };
      }
      classStats[cls].total++;
      if (s.status === '通過') classStats[cls].passed++;
      else classStats[cls].failed++;
    });

    const tbody = document.getElementById('erpAnalyticsTbody');
    if (!tbody) return;

    const sortedClasses = Object.keys(classStats).sort();

    if (sortedClasses.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-slate-400">尚無班級數據</td></tr>';
      return;
    }

    tbody.innerHTML = sortedClasses.map(cls => {
      const stat = classStats[cls];
      const rate = stat.total > 0 ? Math.round((stat.passed / stat.total) * 100) : 0;
      return `
        <tr>
          <td class="font-bold text-slate-900">${cls}</td>
          <td>${stat.total} 人</td>
          <td class="font-bold text-emerald-600">${stat.passed} 人</td>
          <td class="font-bold text-rose-600">${stat.failed} 人</td>
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

  // ==========================================
  // 模組 4: 檢測資料管理 (Records Management)
  // ==========================================
  renderRecordsManagement() {
    const tbody = document.getElementById('erpRecordsTbody');
    const searchInput = document.getElementById('recordsSearchInput');
    const semesterFilter = document.getElementById('recordsSemesterFilter');
    
    if (!tbody) return;

    let records = window.FitnessStore.getFitnessRecords();
    
    // Populate semester filter if empty (except the initial 2 options)
    if (semesterFilter && semesterFilter.options.length <= 2) {
      const semesters = [...new Set(records.map(r => r.semester))].sort((a, b) => b.localeCompare(a));
      semesters.forEach(sem => {
        const option = document.createElement('option');
        option.value = sem;
        option.textContent = `${sem.slice(0, 3)}-${sem.slice(3)} 學期`;
        semesterFilter.appendChild(option);
      });
      // Try to auto-select the latest semester to avoid lag while still showing something
      if (semesters.length > 0) {
        semesterFilter.value = semesters[0];
      }
    }

    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const sem = semesterFilter ? semesterFilter.value : '';

    if (!sem) {
      tbody.innerHTML = `<tr><td colspan="9" class="text-center py-8 text-slate-500 font-bold">請先從右上角選擇學期以載入資料，避免一次載入過多紀錄造成卡頓。</td></tr>`;
      return;
    }

    if (query) {
      records = records.filter(r => String(r.studentId).toLowerCase().includes(query));
    }
    if (sem !== 'all') {
      records = records.filter(r => String(r.semester) === String(sem));
    }

    // Sort by semester descending, then studentId
    records.sort((a, b) => {
      if (a.semester !== b.semester) return b.semester.localeCompare(a.semester);
      return a.studentId.localeCompare(b.studentId);
    });

    if (records.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" class="text-center py-8 text-slate-500">查無檢測紀錄資料</td></tr>`;
      return;
    }

    tbody.innerHTML = records.map(r => {
      const displayStatus = r.status || (r.isPassed ? '合格' : '不合格');
      const isPassed = displayStatus === '合格';
      const isExempt = displayStatus === '免測';
      const statusClass = isPassed ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : (isExempt ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-rose-600 bg-rose-50 border-rose-200');
      
      const student = window.FitnessStore.getStudentById(r.studentId);
      const studentName = student ? student.name : '未知';

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
                <span>編輯</span>
              </button>
              <button onclick="AdminPortal.deleteRecord('${r.studentId}', '${r.semester}')" class="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 px-3 py-1 rounded-lg text-xs font-bold shadow-2xs transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95">
                <svg class="w-3.5 h-3.5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                <span>刪除</span>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
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
    
    const displayStatus = record.status || (record.isPassed ? '合格' : '不合格');
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
      isPassed: (status === '合格' || status === '免測') // sync for legacy logic
    };

    const success = window.FitnessStore.updateFitnessRecord(studentId, semester, updatedData);

    if (success) {
      this.showToast('檢測紀錄已更新，並已重新結算畢業門檻', 'success');
      this.closeRecordEditModal();
      this.renderRecordsManagement(); // 重新渲染當前列表
    } else {
      this.showToast('更新失敗，找不到該筆紀錄', 'danger');
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
    document.getElementById('addRecordStatus').value = '合格';

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
      nameEl.textContent = `姓名：${student.name}`;
      classEl.textContent = `班級：${student.className || '未設定'}`;
      nameEl.className = 'text-slate-800 font-extrabold';
      previewEl.classList.remove('hidden');
    } else if (previewEl) {
      nameEl.textContent = `⚠️ 查無學號 ${studentId} 之學生`;
      classEl.textContent = `（請先至學生名冊匯入）`;
      nameEl.className = 'text-rose-600 font-bold';
      previewEl.classList.remove('hidden');
    }
  },

  saveNewRecord() {
    const studentId = document.getElementById('addRecordStudentId').value.trim();
    const semester = document.getElementById('addRecordSemester').value.trim();

    if (!studentId || !semester) {
      this.showToast('請輸入目標學生學號與檢測學期！', 'warning');
      return;
    }

    const student = window.FitnessStore.getStudentById(studentId);
    if (!student) {
      this.showToast(`查無學號 ${studentId} 的學生，請先至【學生名冊】匯入或新增該學生！`, 'error');
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
      isPassed: (status === '合格' || status === '免測')
    };

    window.FitnessStore.saveFitnessRecord(newRecord);
    window.FitnessStore.recalculateStudentPassCount(student.studentId);
    window.FitnessStore.updateImportHistory(semester);

    window.FitnessStore.addAuditLog({
      operator: this.currentAdminUser?.name || '管理員',
      action: '手動單筆新增成績',
      studentId: student.studentId,
      details: `單獨新增 ${student.name} (${student.studentId}) 在 ${semester} 學期之體適能成績 (${status})`
    });

    this.closeAddRecordModal();
    this.showToast(`🎉 成功新增 ${student.name} 在 ${semester} 學期之體適能成績！`, 'success');
    this.renderRecordsManagement();
  },

  deleteRecord(studentId, semester) {
    if (confirm(`⚠️ 確定要刪除學號 ${studentId} 的 ${semester} 學期檢測成績嗎？\n\n注意：這將會自動重新計算該學生的總通過次數。刪除後無法復原！`)) {
      const success = window.FitnessStore.deleteFitnessRecord(studentId, semester);
      if (success) {
        this.showToast('檢測紀錄已刪除，並已重新結算畢業門檻', 'success');
        this.renderRecordsManagement();
      } else {
        this.showToast('刪除失敗，找不到該筆紀錄', 'danger');
      }
    }
  },

  exportAnalyticsExcel() {
    if (typeof XLSX === 'undefined') {
      this.showToast('Excel 匯出模組尚未載入，請稍後再試', 'error');
      return;
    }

    const students = this.getValidStudents();
    const classStats = {};

    students.forEach(s => {
      const cls = s.className || '未指定班級';
      if (!classStats[cls]) {
        classStats[cls] = { total: 0, passed: 0, failed: 0 };
      }
      classStats[cls].total++;
      if (s.status === '通過') classStats[cls].passed++;
      else classStats[cls].failed++;
    });

    const sortedClasses = Object.keys(classStats).sort();
    if (sortedClasses.length === 0) {
      this.showToast('尚無班級數據可供匯出', 'error');
      return;
    }

    const exportData = sortedClasses.map(cls => {
      const stat = classStats[cls];
      const rate = stat.total > 0 ? Math.round((stat.passed / stat.total) * 100) : 0;
      return {
        '班級': cls,
        '總人數': stat.total,
        '合格人數': stat.passed,
        '未合格人數': stat.failed,
        '合格率(%)': rate
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
    XLSX.utils.book_append_sheet(wb, ws, "班級統計");

    const today = new Date().toLocaleDateString('zh-TW').replace(/\//g, '');
    XLSX.writeFile(wb, `班級統計報表_${today}.xlsx`);
    this.showToast('班級統計報表下載完成', 'success');
  },

  renderRiskTracking() {
    this.renderFilterDropdowns();
    
    const students = this.getValidStudents();
    const riskList = students.filter(s => s.status === '不通過');
    
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
      tbody.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-emerald-600 font-bold">目前無符合條件的未合格學生</td></tr>';
      return;
    }

    tbody.innerHTML = filteredRisk.map(s => {
      const isSelected = this.selectedRiskIds.has(s.studentId);
      return `
      <tr class="${isSelected ? 'selected' : ''}">
        <td class="text-center">
          <input type="checkbox" onchange="AdminPortal.toggleRiskSelect('${s.studentId}', this.checked)" ${isSelected ? 'checked' : ''} class="w-4 h-4 rounded text-blue-600 border-slate-300 cursor-pointer">
        </td>
        <td>${s.className || '-'}</td>
        <td class="font-bold text-slate-900 font-mono">${s.studentId}</td>
        <td class="font-bold text-rose-600">${s.name}</td>
        <td class="font-bold text-rose-500">尚缺 ${s.status === '通過' ? 0 : Math.max(0, (window.FitnessStore.settings.requiredPassCount || 2) - (s.passCount || 0))} 次</td>
        <td class="text-xs font-mono text-slate-500">s${s.studentId}@${window.FitnessStore.settings.schoolDomain || 'mail.edu.tw'}</td>
        <td class="text-right">
          <button onclick="AdminPortal.openThresholdEditModal('${s.studentId}')" 
                  class="bg-slate-50 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 px-3 py-1.5 rounded-lg text-sm font-bold transition-all inline-flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            編輯
          </button>
        </td>
      </tr>
      `;
    }).join('');
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
    const riskList = students.filter(s => s.status === '不通過');
    
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

    if (isChecked) {
      filteredRisk.forEach(s => this.selectedRiskIds.add(s.studentId));
    } else {
      filteredRisk.forEach(s => this.selectedRiskIds.delete(s.studentId));
    }
    this.renderRiskTracking();
  },

  renderAuditLogs() {
    const logs = window.FitnessStore.getLogs();
    const tbody = document.getElementById('erpAuditLogsTbody');
    if (!tbody) return;

    tbody.innerHTML = logs.map(log => `
      <tr>
        <td class="text-slate-500 font-mono">${new Date(log.timestamp).toLocaleString('zh-TW', { hour12: false })}</td>
        <td class="font-bold text-blue-700">${log.operator}</td>
        <td class="font-bold text-slate-800">${log.action}</td>
        <td class="text-slate-600">${log.details}</td>
      </tr>
    `).join('') || '<tr><td colspan="4" class="text-center py-4 text-slate-400">目前無紀錄</td></tr>';
  },

  exportRiskExcel() {
    const students = this.getValidStudents();
    const riskList = students.filter(s => s.status === '不通過');
    
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
      this.showToast('目前無資料可供匯出', 'warning');
      return;
    }

    const data = filteredRisk.map(s => ({
      '班級': s.className || '',
      '學號': s.studentId,
      '姓名': s.name,
      '尚缺次數': s.status === '通過' ? 0 : Math.max(0, (window.FitnessStore.settings.requiredPassCount || 2) - (s.passCount || 0)),
      'Email': `s${s.studentId}@${window.FitnessStore.settings.schoolDomain || 'mail.edu.tw'}`
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '未合格名單');
    
    const today = new Date().toLocaleDateString('zh-TW').replace(/\//g, '');
    XLSX.writeFile(wb, `未合格名單_${today}.xlsx`);
    this.showToast('未合格名單下載完成', 'success');
  },

  // -------------------------------------------------------------
  // 📇 專門匯出「學生學籍名冊」 Excel (班級、學號、姓名、入學年、學籍狀態)
  // -------------------------------------------------------------
  exportRosterExcel() {
    const students = this.getValidStudents();
    if (students.length === 0) {
      this.showToast('系統目前無學生資料可供匯出', 'warning');
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
      const rStatus = s.rosterStatus || '在學';
      const matchStatus = !status || rStatus === status;
      
      const sTrueYear = s.enrollYear || window.FitnessStore.getEnrollYearFromStudentId(s.studentId);
      const matchTrueYear = !trueYear || sTrueYear === trueYear;
      const matchAdmission = !admission || (s.admissionMethod && s.admissionMethod === admission);
      const matchIdentity = !identity || (s.identityStatus && s.identityStatus === identity);

      return matchKeyword && matchYear && matchClass && matchStatus && matchTrueYear && matchAdmission && matchIdentity;
    });

    if (filtered.length === 0) {
      this.showToast('所選篩選條件下查無任何學籍資料可供匯出！', 'warning');
      return;
    }

    const dataRows = filtered.map(s => ({
      "班級": s.className || '',
      "學號": s.studentId,
      "姓名": s.name,
      "入學年": (s.enrollYear || window.FitnessStore.getEnrollYearFromStudentId(s.studentId)) + ' 學年度',
      "入學管道": s.admissionMethod || '一般管道',
      "身分狀態": s.identityStatus || '一般生',
      "學籍狀態": s.rosterStatus || '在學'
    }));

    const headers = ["班級", "學號", "姓名", "入學年", "入學管道", "身分狀態", "學籍狀態"];
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
    XLSX.utils.book_append_sheet(wb, ws, '篩選學生學籍名冊');

    const dateStr = new Date().toISOString().slice(0, 10);
    const fileNameStr = `學生學籍名冊_篩選_${filtered.length}筆_${dateStr}.xlsx`;
    XLSX.writeFile(wb, fileNameStr);

    this.showToast(`🎉 成功依篩選條件匯出 ${filtered.length} 筆學生學籍至 ${fileNameStr}`, 'success');
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
      this.showToast('系統目前無學生資料可供匯出', 'warning');
      return;
    }

    const scope = document.getElementById('exportGradeScope')?.value || 'all';
    const specClass = document.getElementById('exportSpecificClassSelect')?.value || '';
    const statusFilter = document.getElementById('exportStatusFilter')?.value || 'all';
    const sheetStruct = document.getElementById('exportSheetStructure')?.value || 'single_sheet';

    let filtered = students.filter(s => {
      const cls = s.className || '';
      const isEnrolled = (s.rosterStatus || '在學') === '在學';
      
      let matchScope = true;
      if (scope === 'grade4') matchScope = cls.includes('四') || cls.includes('4');
      else if (scope === 'grade3') matchScope = cls.includes('三') || cls.includes('3');
      else if (scope === 'specific_class') matchScope = cls === specClass;
      
      return isEnrolled && matchScope;
    });

    if (statusFilter === 'failed_only') {
      filtered = filtered.filter(s => s.status === '不通過');
    } else if (statusFilter === 'passed_only') {
      filtered = filtered.filter(s => s.status === '通過');
    }

    if (filtered.length === 0) {
      this.showToast('所選篩選條件下查無任何學生資料！', 'warning');
      return;
    }

    const formatStudentRow = (s) => {
      const sems = s.semesters || {};
      return {
        "班級": s.className,
        "學號": s.studentId,
        "姓名": s.name,
        "1101": sems["1101"] !== undefined ? sems["1101"] : 0,
        "1102": sems["1102"] !== undefined ? sems["1102"] : 0,
        "1111": sems["1111"] !== undefined ? sems["1111"] : 0,
        "1112": sems["1112"] !== undefined ? sems["1112"] : 0,
        "1121": sems["1121"] !== undefined ? sems["1121"] : 0,
        "1122": sems["1122"] !== undefined ? sems["1122"] : 0,
        "1131": sems["1131"] !== undefined ? sems["1131"] : 0,
        "1132": sems["1132"] !== undefined ? sems["1132"] : 0,
        "通過次數(除各學期加總，並加上0課...": s.passCount,
        "通過與否": s.status,
        "需補次數": s.status === '通過' ? 0 : Math.max(0, (window.FitnessStore.settings.requiredPassCount || 2) - (s.passCount || 0)),
        "是否轉學": s.isTransfer ? 1 : 0,
        "若為轉學顯示1，並於...": s.transferCredit ? 1 : 0,
        "體保生或身障無法檢測": s.isExemptAthleteOrDisabled ? 1 : 0,
        "若為體保或身障顯示2，並於...": s.exemptCredit ? 2 : 0,
        "次數其餘(如:校內自轉，於他學期有檢測紀錄...": s.otherNotes || '',
        "異動原因": s.reason || '',
        "最後異動日期": s.updatedAt || new Date().toLocaleDateString('zh-TW')
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
      "班級", "學號", "姓名",
      "1101", "1102", "1111", "1112", "1121", "1122", "1131", "1132",
      "通過次數(除各學期加總，並加上0課...", "通過與否", "需補次數",
      "是否轉學", "若為轉學顯示1，並於...", "體保生或身障無法檢測", "若為體保或身障顯示2，並於...",
      "次數其餘(如:校內自轉，於他學期有檢測紀錄...", "異動原因", "最後異動日期"
    ];

    const wb = XLSX.utils.book_new();
    const dateStr = new Date().toISOString().slice(0, 10);
    let fileNameStr = `體適能履歷匯出_${dateStr}.xlsx`;

    if (sheetStruct === 'multi_sheet_by_class') {
      const classMap = {};
      filtered.forEach(s => {
        const cls = s.className || '未分配班級';
        if (!classMap[cls]) classMap[cls] = [];
        classMap[cls].push(formatStudentRow(s));
      });

      Object.keys(classMap).sort().forEach(clsName => {
        const ws = XLSX.utils.json_to_sheet(classMap[clsName], { header: exportHeaders });
        optimizeWorksheet(ws);
        const safeSheetName = clsName.replace(/[\\/?*\[\]]/g, '').slice(0, 30);
        XLSX.utils.book_append_sheet(wb, ws, safeSheetName);
      });

      fileNameStr = `體適能履歷_各班級分頁檔_${dateStr}.xlsx`;
    } else {
      const dataRows = filtered.map(formatStudentRow);
      const ws = XLSX.utils.json_to_sheet(dataRows, { header: exportHeaders });
      optimizeWorksheet(ws);
      
      let sheetName = '體適能履歷與門檻資料';
      if (scope === 'grade4') sheetName = '四年級學生門檻一覽';
      if (statusFilter === 'failed_only') sheetName = '未合格催辦名單';

      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      
      if (scope === 'grade4') fileNameStr = `體適能履歷_四年級學生_${dateStr}.xlsx`;
      else if (statusFilter === 'failed_only') fileNameStr = `體適能履歷_未合格名單_${dateStr}.xlsx`;
    }

    XLSX.writeFile(wb, fileNameStr);
    this.closeExportModal();
    this.showToast(`🎉 成功匯出 ${filtered.length} 筆資料至 ${fileNameStr}`, 'success');
  },

  showToast(msg, type = 'info') {
    if (window.App && window.App.showToast) window.App.showToast(msg, type);
    else alert(msg);
  },

  auditAndFixAllData() {
    if (!confirm('系統將會重新計算全校學生的及格次數，\n若有學生實際及格次數已達 2 次 (或享有免測資格) 但被錯誤標記為「不通過」，將會被強制修正為「通過」。\n\n確定要執行嗎？')) {
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

      // Re-evaluate exemptions based on Roster Identity
      const admMethod = s.admissionMethod || '';
      const identity = s.identityStatus || '';
      
      let tCredit = Number(s.transferCredit) || 0;
      let eCredit = Number(s.exemptCredit) || 0;
      let isTrans = Number(s.isTransfer) || 0;
      let isExempt = Number(s.isExemptAthleteOrDisabled) || 0;

      if (admMethod.includes('轉學考')) { tCredit = 1; isTrans = 1; }
      if (admMethod.includes('運動績優')) { eCredit = 2; isExempt = 1; }
      if (identity.includes('身心障礙')) { eCredit = 2; isExempt = 1; }

      s.transferCredit = tCredit;
      s.isTransfer = isTrans;
      s.exemptCredit = eCredit;
      s.isExemptAthleteOrDisabled = isExempt;

      let totalPass = semPassSum + tCredit + eCredit;
      s.passCount = totalPass;

      if (totalPass >= 2 || isExempt > 0 || eCredit > 0) {
        if (s.status !== '通過' || (s.deficitCount !== undefined && s.deficitCount > 0)) {
          s.status = '通過';
          s.deficitCount = 0;
          s.updatedAt = new Date().toLocaleDateString('zh-TW');
          fixCount++;
        }
      }
    });

    if (fixCount > 0) {
      window.FitnessStore.saveStudents(students);
      this.renderCurrentView();
      this.showToast(`✅ 稽核完成！共計自動修正了 ${fixCount} 位學生的門檻狀態。`, 'success');
    } else {
      this.showToast(`✅ 稽核完成！所有學生的資料皆符合邏輯，無需修正。`, 'info');
    }
  },

  // -------------------------------------------------------------
  // 📢 最新公告與注意事項管理 (起訖時間控制 & 置頂功能)
  // -------------------------------------------------------------
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
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-10 text-slate-400 font-bold">目前無任何公告資料，點擊右上角按鈕即可新增</td></tr>`;
      return;
    }

    const badgeColors = {
      '重要通知': 'bg-rose-100 text-rose-800 border-rose-200',
      '補測公告': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      '申辦提醒': 'bg-amber-100 text-amber-800 border-amber-200',
      '課程資訊': 'bg-emerald-100 text-emerald-800 border-emerald-200'
    };

    tbody.innerHTML = list.map(ann => {
      const start = ann.startDate || '2000-01-01';
      const end = ann.endDate || '2099-12-31';

      let statusBadge = '';
      let toggleBtn = '';

      if (ann.isPublished === false) {
        statusBadge = `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">手動下架</span>`;
        toggleBtn = `
          <button onclick="AdminPortal.toggleAnnouncementStatus('${ann.id}')" class="text-emerald-700 hover:text-emerald-900 font-bold text-xs bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors" title="重新上架">
            上架
          </button>`;
      } else if (today < start) {
        statusBadge = `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">未開始</span>`;
        toggleBtn = `
          <button onclick="AdminPortal.toggleAnnouncementStatus('${ann.id}')" class="text-amber-700 hover:text-amber-900 font-bold text-xs bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg transition-colors" title="手動下架 (學生端隱藏)">
            下架
          </button>`;
      } else if (today > end) {
        statusBadge = `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">已過期</span>`;
        toggleBtn = `
          <button onclick="AdminPortal.toggleAnnouncementStatus('${ann.id}')" class="text-amber-700 hover:text-amber-900 font-bold text-xs bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg transition-colors" title="手動下架 (學生端隱藏)">
            下架
          </button>`;
      } else {
        statusBadge = `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">刊登中</span>`;
        toggleBtn = `
          <button onclick="AdminPortal.toggleAnnouncementStatus('${ann.id}')" class="text-amber-700 hover:text-amber-900 font-bold text-xs bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg transition-colors" title="手動下架 (學生端隱藏)">
            下架
          </button>`;
      }

      const catBadge = badgeColors[ann.category] || 'bg-blue-50 text-blue-700 border-blue-200';

      return `
        <tr>
          <td class="text-center">
            ${ann.isPinned ? `<span class="bg-rose-600 text-white text-xs font-black px-2 py-0.5 rounded-md shadow-2xs">置頂</span>` : `<span class="text-slate-400 text-xs">否</span>`}
          </td>
          <td class="text-center">
            <span class="px-2.5 py-1 rounded-md text-xs font-bold border ${catBadge}">${ann.category || '重要通知'}</span>
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
                編輯
              </button>
              <button onclick="AdminPortal.deleteAnnouncement('${ann.id}')" class="text-rose-600 hover:text-rose-800 font-bold text-xs bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg transition-colors">
                刪除
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

    if (newStatus) {
      this.showToast(`已重新上架公告【${ann.title}】`, 'success');
    } else {
      this.showToast(`已成功下架公告【${ann.title}】(學生端已隱藏)`, 'info');
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
        if (modalHeader) modalHeader.textContent = '修訂最新公告';
        if (inputTitle) inputTitle.value = ann.title || '';
        if (selectCategory) selectCategory.value = ann.category || '重要通知';
        if (inputIsPinned) inputIsPinned.checked = !!ann.isPinned;
        if (inputIsPublished) inputIsPublished.checked = ann.isPublished !== false;
        if (inputStartDate) inputStartDate.value = ann.startDate || today;
        if (inputEndDate) inputEndDate.value = ann.endDate || '2099-12-31';
        if (inputContent) inputContent.value = ann.content || '';
      }
    } else {
      if (modalHeader) modalHeader.textContent = '新增最新公告';
      if (inputTitle) inputTitle.value = '';
      if (selectCategory) selectCategory.value = '補測公告';
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
      this.showToast('請輸入公告標題', 'warning');
      return;
    }
    if (!startDate || !endDate) {
      this.showToast('請選擇完整的開始與結束刊登日期', 'warning');
      return;
    }
    if (startDate > endDate) {
      this.showToast('開始日期不得晚於結束日期', 'warning');
      return;
    }

    if (this.editingAnnouncementId) {
      window.FitnessStore.updateAnnouncement(this.editingAnnouncementId, {
        title, category, isPinned, isPublished, startDate, endDate, content
      });
      this.showToast('已成功修訂公告', 'success');
    } else {
      window.FitnessStore.addAnnouncement({
        title, category, isPinned, isPublished, startDate, endDate, content
      });
      this.showToast('已成功發布新公告', 'success');
    }

    this.closeAnnouncementModal();
    this.renderAnnouncementsManagement();
  },

  deleteAnnouncement(id) {
    if (confirm('確定要刪除此筆公告嗎？刪除後學生端將不再顯示。')) {
      window.FitnessStore.deleteAnnouncement(id);
      this.showToast('公告已成功刪除', 'info');
      this.renderAnnouncementsManagement();
    }
  },

  editingAccountId: null,

  async changeAdminCredentials() {
    const currentPassword = document.getElementById('changePassCurrentPasscode')?.value || '';
    const newPassword = document.getElementById('changePassNewPasscode')?.value || '';
    if (!currentPassword || newPassword.length < 8) {
      this.showToast('請輸入目前密碼，且新密碼至少 8 碼', 'warning');
      return;
    }
    try {
      await window.FitnessFirebase.changeCurrentPassword(currentPassword, newPassword);
      document.getElementById('changePassCurrentPasscode').value = '';
      document.getElementById('changePassNewPasscode').value = '';
      this.showToast('Firebase 登入密碼已更新', 'success');
    } catch (err) {
      this.showToast(`密碼更新失敗：${err.message || '請重新登入後再試'}`, 'danger');
    }
  },

  async renderAdminAccountsManagement() {
    const tbody = document.getElementById('erpAdminAccountsTbody');
    if (!tbody) return;
    if (this.adminAccountsLoading) return;
    this.adminAccountsLoading = true;
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-7 text-slate-400 font-bold">正在載入 Firebase 管理員白名單…</td></tr>`;

    try {
      this.adminAccounts = await window.FitnessFirebase.listAdminAccounts();
      const list = this.adminAccounts;
      if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-7 text-slate-400 font-bold">目前沒有可管理的白名單帳號</td></tr>`;
        return;
      }

      const e = window.SafeUI.escape.bind(window.SafeUI);
      const formatDate = (value) => {
        if (!value) return '尚未登入';
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('zh-TW', {
          year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
        });
      };

      tbody.innerHTML = list.map(acc => {
        const isSuper = acc.role === 'super_admin';
        const roleBadge = isSuper
          ? `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">系統管理員</span>`
          : `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">一般教職員</span>`;
        const statusBadge = acc.enabled
          ? `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">啟用</span>`
          : `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">停用</span>`;
        const toggleText = acc.enabled ? '停用' : '啟用';
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
                <button data-uid="${e(acc.uid)}" onclick="AdminPortal.openAdminAccountModal(this.dataset.uid)" class="px-2.5 py-1.5 rounded-lg text-xs font-bold text-blue-700 border border-blue-200 hover:bg-blue-50">編輯／密碼</button>
                <button data-uid="${e(acc.uid)}" data-enabled="${acc.enabled ? 'false' : 'true'}" onclick="AdminPortal.toggleAdminAccount(this.dataset.uid, this.dataset.enabled === 'true')" class="px-2.5 py-1.5 rounded-lg text-xs font-bold border ${toggleClass}">${toggleText}</button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-7 text-rose-600 font-bold">${window.SafeUI.escape(err.message || '白名單載入失敗')}</td></tr>`;
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

    if (header) header.textContent = account ? '編輯管理員白名單' : '新增管理員白名單';
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
      ? '留空代表維持原密碼；輸入至少 8 碼可直接重設。系統不會顯示或保存原密碼。'
      : '新增帳號必須設定至少 8 碼的初始密碼；密碼只會傳送給 Firebase Authentication。';
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

    if (name.length < 2 || !/^[a-z0-9._-]{3,64}$/.test(account)) {
      this.showToast('請輸入姓名，並確認帳號格式正確', 'warning');
      return;
    }
    if ((!this.editingAccountId || password) && password.length < 8) {
      this.showToast(this.editingAccountId ? '新密碼至少需要 8 碼' : '新增帳號必須設定至少 8 碼的初始密碼', 'warning');
      return;
    }
    if (this.editingAccountId && password && !confirm(`確定要重設「${name}」的登入密碼嗎？`)) return;

    try {
      if (saveButton) {
        saveButton.disabled = true;
        saveButton.textContent = '儲存中…';
      }
      const saved = await window.FitnessFirebase.saveAdminAccount({
        uid: this.editingAccountId || '',
        account,
        name,
        password,
        role,
        enabled
      });
      if (saved?.uid === this.currentAdminUser?.uid) {
        this.currentAdminUser = { ...this.currentAdminUser, name: saved.name, role: saved.role };
        window.FitnessFirebase.currentAdminProfile = this.currentAdminUser;
        this.applyRoleBasedNavigation();
      }
      this.closeAdminAccountModal();
      this.showToast(password ? '管理員資料與密碼已安全更新' : '管理員白名單資料已更新', 'success');
      await this.renderAdminAccountsManagement();
    } catch (err) {
      this.showToast(`白名單儲存失敗：${err.message || '請稍後再試'}`, 'danger');
    } finally {
      if (saveButton) {
        saveButton.disabled = false;
        saveButton.textContent = '儲存設定';
      }
    }
  },

  async toggleAdminAccount(id, enabled) {
    const account = this.adminAccounts.find(item => item.uid === id);
    if (!account) return;
    const actionText = enabled ? '啟用' : '停用';
    if (!confirm(`確定要${actionText}「${account.name}（${account.account}）」嗎？`)) return;
    try {
      await window.FitnessFirebase.saveAdminAccount({
        uid: account.uid,
        account: account.account,
        name: account.name,
        password: '',
        role: account.role,
        enabled
      });
      this.showToast(`已${actionText}管理員帳號`, 'success');
      await this.renderAdminAccountsManagement();
    } catch (err) {
      this.showToast(`${actionText}失敗：${err.message || '請稍後再試'}`, 'danger');
    }
  },

  async syncAllToFirebase() {
    this.showToast('正在上傳並同步本機全量資料至 Firebase 雲端...', 'info');
    const res = await window.FitnessStore.syncAllToFirebase();
    if (res.success) {
      this.showToast(`🔥 成功將 ${res.studentCount} 筆學生學籍、${res.recordCount} 筆成績與 ${res.annCount} 筆公告完全同步至 Firebase 雲端！`, 'success');
      window.FitnessStore.addAuditLog({
        operator: this.currentAdminUser?.username || '管理員',
        action: '全量同步至 Firebase',
        details: `成功推播 ${res.studentCount} 筆學生、${res.recordCount} 筆成績資料至 Firebase 雲端`
      });
    } else {
      this.showToast(`⚠️ Firebase 同步失敗：${res.message}`, 'danger');
    }
  },

  async syncFromFirebase() {
    this.showToast('正在從 Firebase 雲端同步最新全校資料...', 'info');
    const res = await window.FitnessStore.syncFromFirebase();
    if (res.success) {
      this.showToast(`✅ 已成功從 Firebase 雲端拉取 ${res.studentCount} 筆學生學籍與 ${res.recordCount} 筆成績！`, 'success');
      this.renderCurrentView();
    } else {
      this.showToast(`⚠️ 雲端拉取提示：${res.message}`, 'warning');
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
      this.filterRosterTable();
    } else if (inputId === 'thresholdSearchInput') {
      this.filterThresholdTable();
    } else if (inputId === 'individualSearchInput') {
      const area = document.getElementById('individualSearchResultArea');
      const empty = document.getElementById('individualSearchEmpty');
      if (area) area.classList.add('hidden');
      if (empty) empty.classList.add('hidden');
    } else if (inputId === 'recordsSearchInput') {
      this.renderRecordsManagement();
    } else if (inputId === 'riskSearchInput') {
      this.renderRiskTracking();
    } else if (inputId === 'studentIdInput') {
      if (window.StudentPortal) window.StudentPortal.clearSearch();
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.AdminPortal.init();
});
