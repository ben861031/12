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
    const navStudLink = document.getElementById('navStudentLink');
    const navStudLine = document.getElementById('navStudentLine');
    const navAnnLink = document.getElementById('navAnnouncementsLink');
    const navAnnLine = document.getElementById('navAnnouncementsLine');
    if (navStudLink) { navStudLink.classList.remove('text-red-600'); navStudLink.classList.add('text-slate-700', 'hover:text-red-600'); }
    if (navStudLine) { navStudLine.classList.remove('w-full'); navStudLine.classList.add('w-0'); }
    if (navAnnLink) { navAnnLink.classList.remove('text-red-600'); navAnnLink.classList.add('text-slate-700', 'hover:text-red-600'); }
    if (navAnnLine) { navAnnLine.classList.remove('w-full'); navAnnLine.classList.add('w-0'); }
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
          historyList.innerHTML = `<div class="text-slate-400 text-center py-2">\u76ee\u524d\u5c1a\u7121\u532f\u5165\u7d00\u9304</div>`;
        } else {
          historyList.innerHTML = sems.map(sem => `
            <div class="flex justify-between items-center py-1 border-b border-slate-200/60 last:border-0">
              <span class="font-bold text-slate-700">\u2705 ${e(sem)} \u5b78\u671f</span>
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
      { "\u5b78\u865f": "120539105", "\u73ed\u7d1a": "\u884c\u6d41\u56db\u52de", "\u59d3\u540d": "\u738b\u5c0f\u660e", "\u5165\u5b78\u65b9\u5f0f": "\u4e00\u822c", "\u8eab\u5206": "\u4e00\u822c\u751f" },
      { "\u5b78\u865f": "120539106", "\u73ed\u7d1a": "\u8cc7\u7ba1\u56db\u7532", "\u59d3\u540d": "\u9673\u5c0f\u660e", "\u5165\u5b78\u65b9\u5f0f": "\u904b\u52d5\u7e3e\u512a", "\u8eab\u5206": "\u4e00\u822c\u751f" },
      { "\u5b78\u865f": "120539107", "\u73ed\u7d1a": "\u570b\u8cbf\u4e09\u4e59", "\u59d3\u540d": "\u6797\u5a77\u5a77", "\u5165\u5b78\u65b9\u5f0f": "\u8f49\u5b78\u8003", "\u8eab\u5206": "\u8eab\u5fc3\u969c\u7919" }
    ];
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "\u5b78\u7c4d\u540d\u518a");
    XLSX.writeFile(wb, "\u9ad4\u9069\u80fd\u7cfb\u7d71_\u6a19\u6e96\u5b78\u7c4d\u6a94\u7bc4\u672c.xlsx");
    this.showToast("\u5df2\u6210\u529f\u4e0b\u8f09\u5b78\u7c4d Excel \u7bc4\u672c", "success");
  },
  downloadTestScoreTemplate() {
    const sampleData = [
      {
        "\u5e8f\u865f": 1,
        "\u5b78\u865f": "120539105",
        "\u59d3\u540d": "\u738b\u5c0f\u660e",
        "\u73ed\u7d1a": "\u884c\u6d41\u56db\u52de",
        "\u6027\u5225 \u75371\u59732\u5176\u5b830": 1,
        "\u8eab\u9ad8": 170,
        "\u9ad4\u91cd": 60,
        "\u9ad4\u524d\u5f4e": 5,
        "\u7acb\u5b9a\u8df3": 175,
        "\u4ef0\u81e5\u8d77\u5750": 10,
        "\u767b\u968e\u6307\u6578": 45.5,
        "\u901a\u904e 1 \u4e0d\u901a\u904e 0": 0,
        "\u8eab\u5206\u5099\u8a3b": "",
        "\u8ab2\u7a0b\u540d\u7a31": "\u98db\u93e2",
        "\u7b2c\u4e00\u6b21": 80,
        "\u6700\u5f8c\u6210\u7e3e": 80,
        "\u6559\u5e2b": "\u6797\u9f0e\u653f"
      },
      {
        "\u5e8f\u865f": 2,
        "\u5b78\u865f": "120539106",
        "\u59d3\u540d": "\u9673\u5c0f\u660e",
        "\u73ed\u7d1a": "\u8cc7\u7ba1\u56db\u7532",
        "\u6027\u5225 \u75371\u59732\u5176\u5b830": 1,
        "\u8eab\u9ad8": 175,
        "\u9ad4\u91cd": 68,
        "\u9ad4\u524d\u5f4e": 25,
        "\u7acb\u5b9a\u8df3": 210,
        "\u4ef0\u81e5\u8d77\u5750": 35,
        "\u767b\u968e\u6307\u6578": 65.0,
        "\u901a\u904e 1 \u4e0d\u901a\u904e 0": 1,
        "\u8eab\u5206\u5099\u8a3b": "",
        "\u8ab2\u7a0b\u540d\u7a31": "\u7c43\u7403",
        "\u7b2c\u4e00\u6b21": 85,
        "\u6700\u5f8c\u6210\u7e3e": 85,
        "\u6559\u5e2b": "\u5f35\u8001\u5e2b"
      }
    ];
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "\u55ae\u5b78\u671f\u6210\u7e3e");
    XLSX.writeFile(wb, "\u9ad4\u9069\u80fd\u7cfb\u7d71_\u55ae\u5b78\u671f\u6210\u7e3e\u6a94\u7bc4\u672c(17\u6b04\u4f4d).xlsx");
    this.showToast("\u5df2\u6210\u529f\u4e0b\u8f09 17 \u6b04\u4f4d\u55ae\u5b78\u671f\u6210\u7e3e Excel \u7bc4\u672c", "success");
  },
  async handleRosterUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      this.showToast('\u6b63\u5728\u89e3\u6790\u4e26\u532f\u5165\u5b78\u7c4d Excel \u8cc7\u6599...', 'info');
      const res = await window.FitnessImporter.importRosterExcel(file);
      this.closeRosterModal();
      window.FitnessStore.addAuditLog({
        action: '\u532f\u5165\u5b78\u751f\u540d\u518a',
        studentId: 'MULTI',
        details: `\u532f\u5165\u6a94\u6848\u300c${file.name}\u300d\uff1b\u65b0\u589e ${res.addedCount} \u4eba\u3001\u66f4\u65b0 ${res.updatedCount} \u4eba\u3001\u8f49\u70ba\u975e\u5728\u5b78 ${res.archivedCount} \u4eba`
      });
      this.showToast(`\u5b78\u7c4d\u532f\u5165\u6210\u529f\uff01\u65b0\u589e ${res.addedCount} \u4eba\uff0c\u66f4\u65b0 ${res.updatedCount} \u4eba\uff0c\u8f49\u70ba\u975e\u5728\u5b78 ${res.archivedCount} \u4eba`, 'success');
      window.AdminPortal.renderCurrentView();
    } catch (err) {
      this.showToast(`\u532f\u5165\u5931\u6557\uff1a${err}`, 'danger');
    } finally {
      e.target.value = '';
    }
  },
  async handleTestDataUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const semesterInput = document.getElementById('importSemesterInput')?.value.trim();
    this.pendingSemester = semesterInput;
    try {
      this.showToast('\u6b63\u5728\u6383\u63cf Excel \u4e26\u6bd4\u5c0d\u7cfb\u7d71\u5b78\u7c4d...', 'info');
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
      this.showToast(`Excel \u8b80\u53d6\u5931\u6557\uff1a${err}`, 'danger');
    } finally {
      e.target.value = '';
    }
  },
  openImportMismatchModal(scanResult) {
    const e = window.SafeUI.escape.bind(window.SafeUI);
    const { mismatches, totalRows } = scanResult;
    const summaryEl = document.getElementById('mismatchSummaryText');
    if (summaryEl) {
      summaryEl.textContent = `\u5171\u6383\u63cf ${totalRows} \u7b46\u8cc7\u6599\uff0c\u767c\u73fe ${mismatches.length} \u7b46\u5b78\u865f\u6216\u59d3\u540d\u8207\u7cfb\u7d71\u73fe\u6709\u8a18\u9304\u4e0d\u543b\u5408\uff01`;
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
              ? '<span class="pill-danger text-[10px]">\u59d3\u540d\u4e0d\u4e00\u81f4 (\u5c07\u8986\u5beb)</span>' 
              : '<span class="pill-warning text-[10px]">\u5168\u65b0\u5b78\u865f (\u5c07\u65b0\u589e)</span>'}
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
    this.showToast('\u5df2\u53d6\u6d88\u532f\u5165\u4f5c\u696d', 'info');
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
      summaryEl.textContent = `\u767c\u73fe ${scoreConflicts.length} \u7b46 Excel \u6210\u7e3e\u8207\u7cfb\u7d71\u73fe\u6709\u72c0\u614b\u76f8\u885d`;
    }
    const tbody = document.getElementById('scoreConflictTbody');
    if (tbody) {
      tbody.innerHTML = scoreConflicts.map(c => `
        <tr class="border-b border-slate-100 hover:bg-slate-50">
          <td class="px-4 py-3 font-mono font-bold">${e(c.studentId)}</td>
          <td class="px-4 py-3 font-bold text-slate-800">${e(c.name)}</td>
          <td class="px-4 py-3 text-center font-mono font-bold text-slate-600">${e(c.semester)}</td>
          <td class="px-4 py-3 text-center">
            ${c.dbStatus === '\u901a\u904e' ? '<span class="pill-success text-[10px]">\u901a\u904e</span>' : '<span class="pill-danger text-[10px]">\u4e0d\u901a\u904e</span>'}
          </td>
          <td class="px-4 py-3 text-center">
            ${c.excelStatus === '\u901a\u904e' ? '<span class="pill-success text-[10px]">\u901a\u904e</span>' : '<span class="pill-danger text-[10px]">\u4e0d\u901a\u904e</span>'}
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
    this.showToast('\u5df2\u53d6\u6d88\u672c\u6b21\u6210\u7e3e\u532f\u5165\u4f5c\u696d\u3002', 'info');
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
      summaryEl.textContent = `\u5171\u6383\u63cf ${totalRows} \u7b46\u8cc7\u6599\uff0c\u767c\u73fe ${logicConflicts.length} \u7b46\u8cc7\u6599\u5be6\u969b\u53ca\u683c\u6b21\u6578\u5df2\u9054 2 \u6b21\uff0c\u4f46 Excel \u6a19\u8a18\u70ba\u4e0d\u901a\u904e\uff01`;
    }
    const tbody = document.getElementById('logicConflictTbody');
    if (tbody) {
      tbody.innerHTML = logicConflicts.map(c => `
        <tr class="border-b border-slate-200 hover:bg-rose-50/50">
          <td class="font-mono font-bold text-slate-900">${e(c.studentId)}</td>
          <td class="font-bold text-slate-800">${e(c.name)}</td>
          <td class="text-center font-bold text-emerald-600">${e(c.actualPasses)} \u6b21</td>
          <td class="text-center font-bold text-rose-600">${e(c.excelStatus)}</td>
        </tr>
      `).join('');
    }
    document.getElementById('logicConflictModal').classList.remove('hidden');
  },
  cancelLogicConflict() {
    this.pendingScanResult = null;
    document.getElementById('logicConflictModal').classList.add('hidden');
    this.showToast('\u5df2\u53d6\u6d88\u672c\u6b21\u6210\u7e3e\u532f\u5165\u4f5c\u696d\u3002', 'info');
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
      ? '\uff1b\u7cfb\u7d71\u5df2\u81ea\u52d5\u6821\u6b63\u59d3\u540d\uff0f\u73ed\u7d1a\u6b04\u4f4d'
      : '';
    const semesters = semester || [...new Set((scanResult.rows || []).map(row => row.semester).filter(Boolean))].join('\u3001') || '\u4f9d\u6a94\u6848\u5167\u5bb9';
    window.FitnessStore.addAuditLog({
      action: '\u532f\u5165\u9ad4\u9069\u80fd\u6210\u7e3e',
      studentId: 'MULTI',
      details: `\u6b78\u6a94\u5b78\u671f\uff1a${semesters}\uff1b\u66f4\u65b0 ${res.updatedCount} \u4f4d\u5b78\u751f\u3001\u65b0\u589e ${res.addedStudentCount} \u4eba${correctionNote}`
    });
    this.showToast(`\u9ad4\u9069\u80fd\u6210\u7e3e\u532f\u5165\u6210\u529f\uff01\u5171\u66f4\u65b0 ${res.updatedCount} \u4f4d\u5b78\u751f\u72c0\u614b (\u65b0\u589e ${res.addedStudentCount} \u4eba)${correctionNote}`, 'success');
    window.AdminPortal.renderCurrentView();
  },
  clearAllData() {
    if (confirm('\u78ba\u5b9a\u8981\u6e05\u7a7a\u76ee\u524d\u7cfb\u7d71\u4e2d\u7684\u6240\u6709\u5b78\u751f\u8cc7\u6599\u55ce\uff1f\u6b64\u52d5\u4f5c\u7121\u6cd5\u5fa9\u539f\u3002')) {
      window.FitnessStore.clearAllData();
      this.showToast('\u5df2\u6210\u529f\u6e05\u7a7a\u6240\u6709\u5b78\u751f\u8cc7\u6599', 'info');
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
      this.showToast('\u5df2\u6062\u5fa9\u5c08\u6848\u9810\u8a2d Firebase \u8a2d\u5b9a\uff0c\u91cd\u65b0\u8f09\u5165\u5f8c\u751f\u6548', 'info');
    } else {
      const config = { apiKey, projectId };
      const success = window.FitnessFirebase.saveConfig(config);
      if (success) {
        this.showToast('Firebase \u8a2d\u5b9a\u5df2\u5132\u5b58\uff0c\u91cd\u65b0\u8f09\u5165\u5f8c\u751f\u6548', 'success');
      } else {
        this.showToast('\u5df2\u5132\u5b58\u91d1\u9470\uff0c\u5c07\u65bc\u9023\u7dda\u5f8c\u555f\u7528', 'warning');
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
      badge.textContent = 'Firebase \u96f2\u7aef';
    } else if (window.FitnessStore && window.FitnessStore.isIndexedDBActive) {
      badge.className = 'px-2.5 py-1.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer';
      badge.textContent = 'IndexedDB \u5927\u5bb9\u91cf\u8cc7\u6599\u5eab';
    } else {
      badge.className = 'px-2.5 py-1.5 rounded-md text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer';
      badge.textContent = '\u672c\u5730\u5132\u5b58 (LocalStorage 5MB)';
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
