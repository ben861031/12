/**
 * 體適能查詢與管理平台 - 主應用程式控制軸 (Main App Controller)
 * 極簡頂欄設計與標準 Excel 範本產生下載
 */

window.App = {
  currentTab: 'student', // 'student' | 'admin'
  pendingScanResult: null,
  pendingSemester: '1122',

  init() {
    this.bindGlobalEvents();
    this.checkURLParams();
    if (window.StudentPortal) window.StudentPortal.renderActiveAnnouncements();
  },

  bindGlobalEvents() {
    document.getElementById('navStudentTab')?.addEventListener('click', () => this.switchTab('student'));
    document.getElementById('navAdminTab')?.addEventListener('click', () => this.switchTab('admin'));

    document.getElementById('rosterFileInput')?.addEventListener('change', (e) => this.handleRosterUpload(e));
    document.getElementById('testDataFileInput')?.addEventListener('change', (e) => this.handleTestDataUpload(e));
  },

  checkURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mode') === 'admin') {
      this.switchTab('admin');
    }
  },

  switchTab(tab) {
    this.currentTab = tab;

    const mainHeader = document.getElementById('mainTopHeader');
    const studentSec = document.getElementById('studentPortalSection');
    const announcementsSec = document.getElementById('announcementsPortalSection');
    const adminSec = document.getElementById('adminPortalSection');

    // 導覽列中央選單 (成績與門檻查詢 / 最新公告) Active State 狀態切換
    const navStudLink = document.getElementById('navStudentLink');
    const navStudLine = document.getElementById('navStudentLine');
    const navAnnLink = document.getElementById('navAnnouncementsLink');
    const navAnnLine = document.getElementById('navAnnouncementsLine');

    // 1. 先將全數選單重置為未點選狀態 (灰色文字 + 0寬度底線，保持 hover:text-red-600)
    if (navStudLink) { navStudLink.classList.remove('text-red-600'); navStudLink.classList.add('text-slate-700', 'hover:text-red-600'); }
    if (navStudLine) { navStudLine.classList.remove('w-full'); navStudLine.classList.add('w-0'); }
    if (navAnnLink) { navAnnLink.classList.remove('text-red-600'); navAnnLink.classList.add('text-slate-700', 'hover:text-red-600'); }
    if (navAnnLine) { navAnnLine.classList.remove('w-full'); navAnnLine.classList.add('w-0'); }

    // 2. 依據當前 tab 鎖定常駐紅色高亮與紅色底線
    if (tab === 'student') {
      if (navStudLink) { navStudLink.classList.remove('text-slate-700'); navStudLink.classList.add('text-red-600', 'hover:text-red-600'); }
      if (navStudLine) { navStudLine.classList.remove('w-0'); navStudLine.classList.add('w-full'); }

      if (mainHeader) mainHeader.classList.remove('hidden');
      if (studentSec) studentSec.classList.remove('hidden');
      if (announcementsSec) announcementsSec.classList.add('hidden');
      if (adminSec) adminSec.classList.add('hidden');
    } else if (tab === 'announcements') {
      if (navAnnLink) { navAnnLink.classList.remove('text-slate-700'); navAnnLink.classList.add('text-red-600', 'hover:text-red-600'); }
      if (navAnnLine) { navAnnLine.classList.remove('w-0'); navAnnLine.classList.add('w-full'); }

      if (mainHeader) mainHeader.classList.remove('hidden');
      if (studentSec) studentSec.classList.add('hidden');
      if (announcementsSec) announcementsSec.classList.remove('hidden');
      if (adminSec) adminSec.classList.add('hidden');

      if (window.StudentPortal) window.StudentPortal.renderAnnouncementsPage();
    } else {
      if (mainHeader) mainHeader.classList.add('hidden');
      if (studentSec) studentSec.classList.add('hidden');
      if (announcementsSec) announcementsSec.classList.add('hidden');
      if (adminSec) adminSec.classList.remove('hidden');

      window.AdminPortal.checkAuthAndRender();
    }
  },

  toggleMobileMenu() {
    const drawer = document.getElementById('mobileMenuDrawer');
    if (drawer) drawer.classList.toggle('hidden');
  },

  closeMobileMenu() {
    const drawer = document.getElementById('mobileMenuDrawer');
    if (drawer) drawer.classList.add('hidden');
  },

  openRosterModal() {
    const modal = document.getElementById('rosterImportModal');
    if (modal) modal.classList.remove('hidden');
  },
  closeRosterModal() {
    const modal = document.getElementById('rosterImportModal');
    if (modal) modal.classList.add('hidden');
  },

  openTestImportModal() {
    const e = window.SafeUI.escape.bind(window.SafeUI);
    const modal = document.getElementById('testImportModal');
    if (modal) {
      modal.classList.remove('hidden');
      
      const historyList = document.getElementById('importHistoryList');
      if (historyList) {
        const history = window.FitnessStore.settings.importHistory || {};
        const sems = Object.keys(history).sort((a, b) => b.localeCompare(a));
        
        if (sems.length === 0) {
          historyList.innerHTML = `<div class="text-slate-400 text-center py-2">目前尚無匯入紀錄</div>`;
        } else {
          historyList.innerHTML = sems.map(sem => `
            <div class="flex justify-between items-center py-1 border-b border-slate-200/60 last:border-0">
              <span class="font-bold text-slate-700">✅ ${e(sem)} 學期</span>
              <span class="text-slate-500">${e(history[sem])}</span>
            </div>
          `).join('');
        }
      }
    }
  },
  closeTestImportModal() {
    const modal = document.getElementById('testImportModal');
    if (modal) modal.classList.add('hidden');
  },

  downloadRosterTemplate() {
    const sampleData = [
      { "學號": "120539105", "班級": "行流四勞", "姓名": "王小明", "入學方式": "一般", "身分": "一般生" },
      { "學號": "120539106", "班級": "資管四甲", "姓名": "陳小明", "入學方式": "運動績優", "身分": "一般生" },
      { "學號": "120539107", "班級": "國貿三乙", "姓名": "林婷婷", "入學方式": "轉學考", "身分": "身心障礙" }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "學籍名冊");
    XLSX.writeFile(wb, "體適能系統_標準學籍檔範本.xlsx");
    this.showToast("已成功下載學籍 Excel 範本", "success");
  },

  downloadTestScoreTemplate() {
    const sampleData = [
      {
        "序號": 1,
        "學號": "120539105",
        "姓名": "王小明",
        "班級": "行流四勞",
        "性別 男1女2其它0": 1,
        "身高": 170,
        "體重": 60,
        "體前彎": 5,
        "立定跳": 175,
        "仰臥起坐": 10,
        "登階指數": 45.5,
        "通過 1 不通過 0": 0,
        "身分備註": "",
        "課程名稱": "飛鏢",
        "第一次": 80,
        "最後成績": 80,
        "教師": "林鼎政"
      },
      {
        "序號": 2,
        "學號": "120539106",
        "姓名": "陳小明",
        "班級": "資管四甲",
        "性別 男1女2其它0": 1,
        "身高": 175,
        "體重": 68,
        "體前彎": 25,
        "立定跳": 210,
        "仰臥起坐": 35,
        "登階指數": 65.0,
        "通過 1 不通過 0": 1,
        "身分備註": "",
        "課程名稱": "籃球",
        "第一次": 85,
        "最後成績": 85,
        "教師": "張老師"
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "單學期成績");
    XLSX.writeFile(wb, "體適能系統_單學期成績檔範本(17欄位).xlsx");
    this.showToast("已成功下載 17 欄位單學期成績 Excel 範本", "success");
  },

  async handleRosterUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      this.showToast('正在解析並匯入學籍 Excel 資料...', 'info');
      const res = await window.FitnessImporter.importRosterExcel(file);
      this.closeRosterModal();
      this.showToast(`學籍匯入成功！新增 ${res.addedCount} 人，更新 ${res.updatedCount} 人，轉為非在籍 ${res.archivedCount} 人`, 'success');
      window.AdminPortal.renderCurrentView();
    } catch (err) {
      this.showToast(`匯入失敗：${err}`, 'danger');
    } finally {
      e.target.value = '';
    }
  },

  async handleTestDataUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const semesterInput = document.getElementById('importSemesterInput')?.value.trim();
    // 移除前端強制防呆，交由底層 scanTestExcel 根據檔案類型(17/21欄)判斷是否必填
    this.pendingSemester = semesterInput;

    try {
      this.showToast('正在掃描 Excel 並比對系統學籍...', 'info');
      
      const scanResult = await window.FitnessImporter.scanTestExcel(file, semesterInput);
      this.closeTestImportModal();

      if (scanResult.mismatches && scanResult.mismatches.length > 0) {
        this.pendingScanResult = scanResult;
        this.openImportMismatchModal(scanResult);
      } else if (scanResult.scoreConflicts && scanResult.scoreConflicts.length > 0) {
        this.pendingScanResult = scanResult;
        this.openScoreConflictModal(scanResult);
      } else if (scanResult.logicConflicts && scanResult.logicConflicts.length > 0) {
        this.pendingScanResult = scanResult;
        this.openLogicConflictModal(scanResult);
      } else {
        this.executeImport(scanResult, semesterInput, 'keep_db', 'keep_excel');
      }
    } catch (err) {
      this.showToast(`Excel 讀取失敗：${err}`, 'danger');
    } finally {
      e.target.value = '';
    }
  },

  openImportMismatchModal(scanResult) {
    const e = window.SafeUI.escape.bind(window.SafeUI);
    const { mismatches, totalRows } = scanResult;

    const summaryEl = document.getElementById('mismatchSummaryText');
    if (summaryEl) {
      summaryEl.textContent = `共掃描 ${totalRows} 筆資料，發現 ${mismatches.length} 筆學號或姓名與系統現有記錄不吻合！`;
    }

    const tbody = document.getElementById('mismatchTbody');
    if (tbody) {
      tbody.innerHTML = mismatches.map(m => `
        <tr class="border-b border-rose-100 hover:bg-rose-50/50">
          <td class="text-center font-mono font-bold text-slate-500">${e(m.rowNum)}</td>
          <td class="font-mono font-bold text-slate-900">${e(m.studentId)}</td>
          <td>${e(m.excelClass)}</td>
          <td class="font-bold text-indigo-700">${e(m.excelName)}</td>
          <td class="font-bold ${m.type === 'NAME_MISMATCH' ? 'text-rose-600' : 'text-slate-400'}">${e(m.systemName)}</td>
          <td class="text-center">
            ${m.type === 'NAME_MISMATCH' 
              ? '<span class="pill-danger text-[10px]">姓名不一致 (將覆寫)</span>' 
              : '<span class="pill-warning text-[10px]">全新學號 (將新增)</span>'}
          </td>
        </tr>
      `).join('');
    }

    const modal = document.getElementById('importMismatchModal');
    if (modal) modal.classList.remove('hidden');
  },

  cancelImportMismatch() {
    const modal = document.getElementById('importMismatchModal');
    if (modal) modal.classList.add('hidden');
    this.pendingScanResult = null;
    this.showToast('已取消匯入作業', 'info');
  },

  confirmImportDespiteMismatches() {
    if (!this.pendingScanResult) return;

    const modal = document.getElementById('importMismatchModal');
    if (modal) modal.classList.add('hidden');

    if (this.pendingScanResult.scoreConflicts && this.pendingScanResult.scoreConflicts.length > 0) {
      this.openScoreConflictModal(this.pendingScanResult);
    } else {
      this.executeImport(this.pendingScanResult, this.pendingSemester, 'keep_db');
      this.pendingScanResult = null;
    }
  },

  openScoreConflictModal(scanResult) {
    const e = window.SafeUI.escape.bind(window.SafeUI);
    const { scoreConflicts } = scanResult;

    const summaryEl = document.getElementById('conflictSummaryText');
    if (summaryEl) {
      summaryEl.textContent = `發現 ${scoreConflicts.length} 筆 Excel 成績與系統現有狀態相衝`;
    }

    const tbody = document.getElementById('scoreConflictTbody');
    if (tbody) {
      tbody.innerHTML = scoreConflicts.map(c => `
        <tr class="border-b border-slate-100 hover:bg-slate-50">
          <td class="px-4 py-3 font-mono font-bold">${e(c.studentId)}</td>
          <td class="px-4 py-3 font-bold text-slate-800">${e(c.name)}</td>
          <td class="px-4 py-3 text-center font-mono font-bold text-slate-600">${e(c.semester)}</td>
          <td class="px-4 py-3 text-center">
            ${c.dbStatus === '通過' ? '<span class="pill-success text-[10px]">通過</span>' : '<span class="pill-danger text-[10px]">不通過</span>'}
          </td>
          <td class="px-4 py-3 text-center">
            ${c.excelStatus === '通過' ? '<span class="pill-success text-[10px]">通過</span>' : '<span class="pill-danger text-[10px]">不通過</span>'}
          </td>
        </tr>
      `).join('');
    }

    const modal = document.getElementById('scoreConflictModal');
    if (modal) modal.classList.remove('hidden');
  },

  cancelImportConflict() {
    const modal = document.getElementById('scoreConflictModal');
    this.pendingScanResult = null;
    document.getElementById('scoreConflictModal').classList.add('hidden');
    this.showToast('已取消本次成績匯入作業。', 'info');
  },

  confirmImportConflict() {
    const selectedRadio = document.querySelector('input[name="conflictResolution"]:checked');
    const resolution = selectedRadio ? selectedRadio.value : 'keep_db';
    
    document.getElementById('scoreConflictModal').classList.add('hidden');

    if (this.pendingScanResult.logicConflicts && this.pendingScanResult.logicConflicts.length > 0) {
      this.openLogicConflictModal(this.pendingScanResult, resolution);
    } else {
      this.executeImport(this.pendingScanResult, this.pendingSemester, resolution, 'force_pass');
    }
  },

  openLogicConflictModal(scanResult, scoreResolution = 'keep_db') {
    const e = window.SafeUI.escape.bind(window.SafeUI);
    this.pendingScoreResolution = scoreResolution;
    const { logicConflicts, totalRows } = scanResult;

    const summaryEl = document.getElementById('logicConflictSummaryText');
    if (summaryEl) {
      summaryEl.textContent = `共掃描 ${totalRows} 筆資料，發現 ${logicConflicts.length} 筆資料實際及格次數已達 2 次，但 Excel 標記為不通過！`;
    }

    const tbody = document.getElementById('logicConflictTbody');
    if (tbody) {
      tbody.innerHTML = logicConflicts.map(c => `
        <tr class="border-b border-slate-200 hover:bg-rose-50/50">
          <td class="font-mono font-bold text-slate-900">${e(c.studentId)}</td>
          <td class="font-bold text-slate-800">${e(c.name)}</td>
          <td class="text-center font-bold text-emerald-600">${e(c.actualPasses)} 次</td>
          <td class="text-center font-bold text-rose-600">${e(c.excelStatus)}</td>
        </tr>
      `).join('');
    }

    document.getElementById('logicConflictModal').classList.remove('hidden');
  },

  cancelLogicConflict() {
    this.pendingScanResult = null;
    document.getElementById('logicConflictModal').classList.add('hidden');
    this.showToast('已取消本次成績匯入作業。', 'info');
  },

  confirmLogicConflict() {
    const selectedRadio = document.querySelector('input[name="logicResolution"]:checked');
    const logicResolution = selectedRadio ? selectedRadio.value : 'force_pass';
    
    document.getElementById('logicConflictModal').classList.add('hidden');
    
    this.executeImport(this.pendingScanResult, this.pendingSemester, this.pendingScoreResolution || 'keep_db', logicResolution);
  },

  executeImport(scanResult, semester, resolution, logicResolution) {
    const res = window.FitnessImporter.applyTestImport(scanResult, semester, resolution, logicResolution);
    const correctionNote = scanResult.identityColumnsAutoCorrected
      ? '；系統已自動校正姓名／班級欄位'
      : '';
    this.showToast(`體適能成績匯入成功！共更新 ${res.updatedCount} 位學生狀態 (新增 ${res.addedStudentCount} 人)${correctionNote}`, 'success');
    window.AdminPortal.renderCurrentView();
  },

  clearAllData() {
    if (confirm('確定要清空目前系統中的所有學生資料嗎？此動作無法復原。')) {
      window.FitnessStore.clearAllData();
      this.showToast('已成功清空所有學生資料', 'info');
      window.AdminPortal.renderCurrentView();
    }
  },

  openFirebaseModal() {
    const config = window.FitnessFirebase.getConfig() || {};
    document.getElementById('fbApiKey').value = config.apiKey || '';
    document.getElementById('fbProjectId').value = config.projectId || '';

    const modal = document.getElementById('firebaseConfigModal');
    if (modal) modal.classList.remove('hidden');
  },

  closeFirebaseModal() {
    const modal = document.getElementById('firebaseConfigModal');
    if (modal) modal.classList.add('hidden');
  },

  saveFirebaseConfig() {
    const apiKey = document.getElementById('fbApiKey').value.trim();
    const projectId = document.getElementById('fbProjectId').value.trim();

    if (!apiKey || !projectId) {
      window.FitnessFirebase.saveConfig(null);
      this.showToast('已恢復專案預設 Firebase 設定，重新載入後生效', 'info');
    } else {
      const config = { apiKey, projectId };
      const success = window.FitnessFirebase.saveConfig(config);
      if (success) {
        this.showToast('Firebase 設定已儲存，重新載入後生效', 'success');
      } else {
        this.showToast('已儲存金鑰，將於連線後啟用', 'warning');
      }
    }
    this.closeFirebaseModal();
    this.updateFirebaseBadge();
  },

  updateFirebaseBadge() {
    const badge = document.getElementById('firebaseStatusBadge');
    if (!badge) return;
    if (window.FitnessFirebase && window.FitnessFirebase.isFirebaseActive) {
      badge.className = 'px-2.5 py-1.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-pointer';
      badge.textContent = 'Firebase 雲端';
    } else if (window.FitnessStore && window.FitnessStore.isIndexedDBActive) {
      badge.className = 'px-2.5 py-1.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer';
      badge.textContent = 'IndexedDB 大容量資料庫';
    } else {
      badge.className = 'px-2.5 py-1.5 rounded-md text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer';
      badge.textContent = '本地儲存 (LocalStorage 5MB)';
    }
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    const icons = {
      success: '<svg class="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
      danger: '<svg class="w-5 h-5 text-rose-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
      warning: '<svg class="w-5 h-5 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>',
      info: '<svg class="w-5 h-5 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
    };

    const borders = {
      success: 'border-emerald-500/40',
      danger: 'border-rose-500/40',
      warning: 'border-amber-500/40',
      info: 'border-blue-500/40'
    };

    toast.className = `toast-animated px-5 py-3.5 rounded-2xl shadow-2xl bg-slate-900 text-white border ${borders[type] || borders.info} font-bold text-xs sm:text-sm flex items-center gap-3 pointer-events-auto`;
    toast.innerHTML = icons[type] || icons.info;
    const messageSpan = document.createElement('span');
    messageSpan.textContent = String(message ?? '');
    toast.appendChild(messageSpan);

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.App.init();
  window.App.updateFirebaseBadge();
});
