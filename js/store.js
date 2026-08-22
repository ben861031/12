/**
 * 體適能查詢與管理平台 - 中央資料庫 (Data Store Engine)
 * 升級版：支援 IndexedDB 大容量資料庫與快取機制 (自動向下相容 LocalStorage 及自動備份轉移)
 */

// Native IndexedDB Promise Wrapper
const FitnessIDB = {
  dbName: 'FitnessPlatformDB_V2_SAFE',
  storeName: 'app_data',
  dbPromise: null,

  getDB() {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        if (!('indexedDB' in window)) {
          return reject(new Error('IndexedDB is not supported in this environment.'));
        }
        const request = indexedDB.open(this.dbName, 1);
        request.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(this.storeName)) {
            db.createObjectStore(this.storeName);
          }
        };
        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject(e.target.error);
      });
    }
    return this.dbPromise;
  },

  async getItem(key) {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.storeName, 'readonly');
        const store = tx.objectStore(this.storeName);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result !== undefined ? req.result : null);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('FitnessIDB.getItem error:', e);
      return null;
    }
  },

  async setItem(key, val) {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);
        const req = store.put(val, key);
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('FitnessIDB.setItem error:', e);
      return false;
    }
  },

  async removeItem(key) {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);
        const req = store.delete(key);
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('FitnessIDB.removeItem error:', e);
      return false;
    }
  },

  async clear() {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);
        const req = store.clear();
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('FitnessIDB.clear error:', e);
      return false;
    }
  }
};

window.FitnessStore = {
  STORAGE_KEYS: {
    STUDENTS: 'FITNESS_STORE_STUDENTS_V5_PRIVATE',
    TEST_RECORDS: 'FITNESS_STORE_RECORDS_V5_PRIVATE',
    LOGS: 'FITNESS_STORE_AUDIT_LOGS_V5_PRIVATE',
    SETTINGS: 'FITNESS_STORE_SETTINGS_V5_PRIVATE',
    ANNOUNCEMENTS: 'FITNESS_STORE_ANNOUNCEMENTS_V5_PUBLIC'
  },

  settings: {
    requiredPassCount: 2,
    schoolDomain: 'just.edu.tw',
    schoolName: '景文科技大學',
    currentSemester: '1122',
    importHistory: {}
  },

  selectedStudentIds: new Set(),
  listeners: [],

  // 快取記憶體
  cache: {
    students: null,
    testRecords: null,
    logs: null,
    announcements: null
  },

  isIndexedDBActive: false,
  isReady: false,
  lookupPublishTimer: null,

  subscribe(fn) {
    if (typeof fn === 'function') this.listeners.push(fn);
  },

  notify() {
    this.listeners.forEach(fn => fn());
  },

  async init() {
    // 公開頁面絕不讀取學生、成績、設定或稽核紀錄的本機快取。
    this.cache.students = [];
    this.cache.testRecords = [];
    this.cache.logs = [];
    this.isIndexedDBActive = false;

    try {
      const rawAnnouncements = localStorage.getItem(this.STORAGE_KEYS.ANNOUNCEMENTS);
      this.cache.announcements = rawAnnouncements ? JSON.parse(rawAnnouncements) : this.getDefaultAnnouncements();
    } catch (e) {
      this.cache.announcements = this.getDefaultAnnouncements();
    }

    try {
      const remoteAnnouncements = await window.FitnessFirebase?.loadPublicAnnouncements();
      if (Array.isArray(remoteAnnouncements)) {
        this.cache.announcements = remoteAnnouncements;
        localStorage.setItem(this.STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(remoteAnnouncements));
      }
    } catch (e) {
      console.warn('公告同步失敗，使用本機公告快取。', e);
    }

    this.isReady = true;
    this.notify();
    if (window.App && window.App.updateFirebaseBadge) {
      window.App.updateFirebaseBadge();
    }
  },

  async syncFromFirebase() {
    if (!window.FitnessFirebase) return { success: false, message: 'Firebase 未載入' };
    if (!window.FitnessFirebase.isFirebaseActive) {
      window.FitnessFirebase.init();
    }

    try {
      await window.FitnessFirebase.requireAdmin();
      const remoteStudents = await window.FitnessFirebase.loadCollection('students');
      const remoteRecords = await window.FitnessFirebase.loadCollection('records');
      const remoteAnnouncements = await window.FitnessFirebase.loadCollection('announcements');
      const remoteLogs = await window.FitnessFirebase.loadCollection('logs');
      const remoteSettings = await window.FitnessFirebase.loadCollection('settings');

      let updated = false;

      if (Array.isArray(remoteStudents)) {
        this.cache.students = remoteStudents;
        updated = true;
      }

      if (Array.isArray(remoteRecords)) {
        this.cache.testRecords = remoteRecords;
        updated = true;
      }

      if (Array.isArray(remoteAnnouncements) && remoteAnnouncements.length > 0) {
        this.cache.announcements = remoteAnnouncements;
        try { localStorage.setItem(this.STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(remoteAnnouncements)); } catch(e){}
        updated = true;
      }

      if (Array.isArray(remoteLogs) && remoteLogs.length > 0) {
        this.cache.logs = remoteLogs;
        updated = true;
      }

      if (remoteSettings && typeof remoteSettings === 'object') {
        const { adminAccount, adminAccounts, ...safeSettings } = remoteSettings;
        this.settings = { ...this.settings, ...safeSettings };
        updated = true;
      }

      if (updated) {
        this.notify();
        console.log('已在管理員驗證後載入雲端資料。');
        return {
          success: true,
          studentCount: remoteStudents ? remoteStudents.length : 0,
          recordCount: remoteRecords ? remoteRecords.length : 0
        };
      } else {
        return { success: false, message: '雲端尚無可載入之資料' };
      }
    } catch (err) {
      console.error('syncFromFirebase 失敗:', err);
      return { success: false, message: err.message || '拉取雲端資料失敗' };
    }
  },

  getDefaultAnnouncements() {
    return [
      {
        id: 'ann_sample_1',
        title: '全校學生體適能畢業門檻檢測與補測報名須知',
        category: '補測公告',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        isPinned: true,
        content: '尚未達到畢業門檻（通過次數未滿 2 次）之同學，請依規定報名每學期全校體適能補測，或選修相關體適能補救教學課程。',
        createdAt: '2026-08-20'
      },
      {
        id: 'ann_sample_2',
        title: '體保生與身障免測資格採計辦理提醒',
        category: '申辦提醒',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        isPinned: false,
        content: '符合轉學扣抵、體育保送生或領有身心障礙手冊/醫療免測核可之同學，請備齊佐證文件至體育組辦理門檻抵免登記。',
        createdAt: '2026-08-20'
      }
    ];
  },

  getAnnouncements() {
    if (this.cache.announcements !== null) {
      return this.cache.announcements;
    }
    try {
      const raw = localStorage.getItem(this.STORAGE_KEYS.ANNOUNCEMENTS);
      return raw ? JSON.parse(raw) : this.getDefaultAnnouncements();
    } catch (e) {
      return this.getDefaultAnnouncements();
    }
  },

  saveAnnouncements(announcements) {
    this.cache.announcements = announcements;
    if (this.isIndexedDBActive) {
      FitnessIDB.setItem(this.STORAGE_KEYS.ANNOUNCEMENTS, announcements).catch(err => {
        console.error('IndexedDB saveAnnouncements 失敗:', err);
      });
    }
    if (window.FitnessFirebase && window.FitnessFirebase.isFirebaseActive) {
      window.FitnessFirebase.saveCollection('announcements', announcements);
    }
    try {
      localStorage.setItem(this.STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
    } catch (e) {}
    this.notify();
  },

  addAnnouncement(annData) {
    const list = this.getAnnouncements();
    const newAnn = {
      id: 'ann_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      title: annData.title || '無標題公告',
      category: annData.category || '重要通知',
      startDate: annData.startDate || new Date().toISOString().slice(0, 10),
      endDate: annData.endDate || '2099-12-31',
      isPinned: !!annData.isPinned,
      content: annData.content || '',
      createdAt: new Date().toLocaleDateString('zh-TW')
    };
    list.unshift(newAnn);
    this.saveAnnouncements(list);
    return newAnn;
  },

  updateAnnouncement(id, updatedFields) {
    const list = this.getAnnouncements();
    const idx = list.findIndex(a => a.id === id);
    if (idx === -1) return false;
    list[idx] = {
      ...list[idx],
      ...updatedFields,
      updatedAt: new Date().toLocaleDateString('zh-TW')
    };
    this.saveAnnouncements(list);
    return list[idx];
  },

  deleteAnnouncement(id) {
    const list = this.getAnnouncements();
    const newList = list.filter(a => a.id !== id);
    this.saveAnnouncements(newList);
    return true;
  },

  saveSettings() {
    const { adminAccount, adminAccounts, ...safeSettings } = this.settings;
    this.settings = safeSettings;
    if (window.FitnessFirebase && window.FitnessFirebase.isFirebaseActive) {
      window.FitnessFirebase.saveCollection('settings', safeSettings).catch((err) => {
        console.warn('系統設定尚未寫入雲端。', err);
      });
    }
  },

  getAdminAccounts() {
    const profile = window.FitnessFirebase?.currentAdminProfile;
    return profile ? [{ id: profile.uid, username: profile.username, role: profile.role, name: profile.name }] : [];
  },

  addAdminAccount() { throw new Error('請於 Firebase Authentication 建立帳號並設定 Custom Claims。'); },
  updateAdminAccount() { throw new Error('請於 Firebase Authentication 管理帳號與權限。'); },
  deleteAdminAccount() { throw new Error('請於 Firebase Authentication 管理帳號與權限。'); },

  updateImportHistory(semesters) {
    if (!this.settings.importHistory) this.settings.importHistory = {};
    const now = new Date();
    
    const formattedDate = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    if (Array.isArray(semesters)) {
      semesters.forEach(sem => {
        this.settings.importHistory[sem] = formattedDate;
      });
    } else if (typeof semesters === 'string') {
      this.settings.importHistory[semesters] = formattedDate;
    }
    this.saveSettings();
  },

  async syncAllToFirebase() {
    if (!window.FitnessFirebase) return { success: false, message: 'Firebase SDK 未載入' };
    
    if (!window.FitnessFirebase.isFirebaseActive) {
      const ok = window.FitnessFirebase.init();
      if (!ok) return { success: false, message: 'Firebase 尚未正確連線，請檢查 API Key 與網路' };
    }

    try {
      const students = this.getStudents();
      const records = this.getFitnessRecords();
      const announcements = this.getAnnouncements();
      const logs = this.getLogs();
      const { adminAccount, adminAccounts, ...settings } = this.settings;

      await window.FitnessFirebase.saveCollection('students', students);
      await window.FitnessFirebase.saveCollection('records', records);
      await window.FitnessFirebase.saveCollection('announcements', announcements);
      await window.FitnessFirebase.saveCollection('logs', logs);
      await window.FitnessFirebase.saveCollection('settings', settings);
      const published = await window.FitnessFirebase.publishStudentLookups(students, records);

      return {
        success: true,
        studentCount: students.length,
        recordCount: records.length,
        annCount: announcements.length,
        logCount: logs.length,
        lookupCount: published.count
      };
    } catch (err) {
      console.error('Firebase 全量推播失敗:', err);
      const isPermErr = /permission|權限/i.test(String(err.message || '')) || /permission-denied/i.test(String(err.code || ''));
      return { 
        success: false, 
        message: isPermErr 
          ? 'Firebase 權限被拒：請確認目前帳號具備 Custom Claims，且安全規則已部署至 fitness 命名資料庫。' 
          : (err.message || '寫入失敗，請確認 Firebase Rules 規則') 
      };
    }
  },

  getStudents() {
    if (this.cache.students !== null) {
      return this.cache.students;
    }
    try {
      const raw = localStorage.getItem(this.STORAGE_KEYS.STUDENTS);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  getStudentById(studentId) {
    if (!studentId) return null;
    const cleanId = String(studentId).trim().toLowerCase();
    const students = this.getStudents();
    return students.find(s => String(s.studentId).trim().toLowerCase() === cleanId) || null;
  },

  getEnrollYearFromStudentId(studentId) {
    if (!studentId) return '110';
    const str = String(studentId).trim();
    if (str.length >= 4) {
      const code = str.slice(2, 4);
      const num = parseInt(code, 10);
      if (!isNaN(num)) {
        return String(100 + num);
      }
    }
    return '110';
  },

  saveStudent(student) {
    if (!student || !student.studentId) return false;
    const students = this.getStudents();
    const cleanId = String(student.studentId).trim().toLowerCase();
    const index = students.findIndex(s => String(s.studentId).trim().toLowerCase() === cleanId);
    if (index !== -1) {
      students[index] = student;
    } else {
      students.push(student);
    }
    this.saveStudents(students);
    return true;
  },

  saveStudents(students) {
    // 私人學生資料只保留在已登入管理員分頁的記憶體中。
    this.cache.students = students;
    this.notify();

    if (window.FitnessFirebase?.currentAdminProfile) {
      window.FitnessFirebase.saveCollection('students', students).then(() => {
        console.log('學生主檔已同步至 Firebase。');
      }).catch(err => {
        console.warn('學生主檔尚未寫入 Firebase：', err);
        if (window.App) window.App.showToast('雲端儲存失敗，請勿關閉頁面並重新同步', 'danger');
      });
      this.scheduleStudentLookupPublish();
    }
  },

  updateStudent(studentId, updatedFields, operatorName = '管理員') {
    const students = this.getStudents();
    const index = students.findIndex(s => String(s.studentId).trim() === String(studentId).trim());
    if (index === -1) return false;

    const oldData = { ...students[index] };
    const newData = {
      ...oldData,
      ...updatedFields,
      updatedAt: new Date().toLocaleDateString('zh-TW')
    };

    let semPassSum = 0;
    if (newData.semesters) {
      Object.values(newData.semesters).forEach(val => {
        if (Number(val) === 1) semPassSum += 1;
      });
    }

    let transferAdd = Number(newData.transferCredit || 0);
    let exemptAdd = Number(newData.exemptCredit || 0);

    let totalPass = semPassSum + transferAdd + exemptAdd;
    if (updatedFields.passCount !== undefined) {
      totalPass = Math.max(totalPass, Number(updatedFields.passCount));
    }

    newData.passCount = totalPass;

    const isExempt = (Number(newData.isExemptAthleteOrDisabled) > 0) || (exemptAdd > 0) || /免測|身障|體保/.test(newData.specialIdentity || '');
    const reqPass = this.settings.requiredPassCount || 2;

    if (isExempt) {
      newData.status = '通過';
      newData.deficitCount = 0;
    } else if (newData.manualStatusOverride) {
      newData.status = newData.manualStatusOverride;
      newData.deficitCount = newData.status === '通過' ? 0 : Math.max(0, reqPass - totalPass);
    } else {
      newData.status = totalPass >= reqPass ? '通過' : '不通過';
      newData.deficitCount = newData.status === '通過' ? 0 : Math.max(0, reqPass - totalPass);
    }

    students[index] = newData;
    this.saveStudents(students);

    this.addAuditLog({
      operator: operatorName,
      action: '編輯學生檔案',
      studentId: studentId,
      details: `修訂學號 [${studentId}] (${newData.name})：通過次數 ${newData.passCount}，狀態 ${newData.status}`
    });

    return newData;
  },

  bulkUpdateStatus(studentIds, newStatus, specialIdentity = '', notes = '', operatorName = '管理員') {
    if (!studentIds || studentIds.length === 0) return;
    const students = this.getStudents();
    let updatedCount = 0;

    students.forEach(s => {
      if (studentIds.includes(s.studentId)) {
        if (newStatus) {
          s.status = newStatus;
          s.deficitCount = newStatus === '通過' ? 0 : Math.max(0, 2 - (s.passCount || 0));
        }
        if (specialIdentity !== undefined) s.specialIdentity = specialIdentity;
        if (notes) s.notes = notes;
        s.updatedAt = new Date().toLocaleDateString('zh-TW');
        updatedCount++;
      }
    });

    this.saveStudents(students);
    this.selectedStudentIds.clear();

    this.addAuditLog({
      operator: operatorName,
      action: '批量作業',
      studentId: 'MULTI',
      details: `批量修改 ${updatedCount} 位學生狀態為 [${newStatus}]`
    });

    return updatedCount;
  },

  getFitnessRecords(studentId = null) {
    let records = [];
    if (this.cache.testRecords !== null) {
      records = this.cache.testRecords;
    } else {
      try {
        const raw = localStorage.getItem(this.STORAGE_KEYS.TEST_RECORDS);
        records = raw ? JSON.parse(raw) : [];
      } catch (e) {
        records = [];
      }
    }
    if (studentId) {
      return records.filter(r => String(r.studentId).trim() === String(studentId).trim());
    }
    return records;
  },

  saveFitnessRecords(records) {
    this.cache.testRecords = records;
    this.notify();

    if (window.FitnessFirebase?.currentAdminProfile) {
      window.FitnessFirebase.saveCollection('records', records).then(() => {
        console.log('檢測紀錄已同步至 Firebase。');
      }).catch(err => {
        console.warn('檢測紀錄尚未寫入 Firebase：', err);
        if (window.App) window.App.showToast('成績尚未寫入雲端，請重新同步', 'danger');
      });
      this.scheduleStudentLookupPublish();
    }
  },

  scheduleStudentLookupPublish() {
    if (this.lookupPublishTimer) clearTimeout(this.lookupPublishTimer);
    this.lookupPublishTimer = setTimeout(async () => {
      this.lookupPublishTimer = null;
      try {
        await window.FitnessFirebase.publishStudentLookups(this.getStudents(), this.getFitnessRecords());
      } catch (err) {
        console.warn('學生單筆查詢索引尚未更新：', err);
        if (window.App) window.App.showToast('學生查詢索引更新失敗，請執行全量同步', 'warning');
      }
    }, 1200);
  },

  saveFitnessRecord(record) {
    if (!record || !record.studentId) return false;
    const records = this.getFitnessRecords();
    const idx = records.findIndex(r => String(r.studentId).trim() === String(record.studentId).trim() && String(r.semester).trim() === String(record.semester).trim());
    if (idx >= 0) {
      records[idx] = { ...records[idx], ...record };
    } else {
      records.push(record);
    }
    this.saveFitnessRecords(records);
    this.recalculateStudentPassCount(record.studentId);
    return true;
  },

  updateFitnessRecord(studentId, semester, updatedData, operatorName = '管理員') {
    const records = this.getFitnessRecords();
    const index = records.findIndex(r => String(r.studentId) === String(studentId) && String(r.semester) === String(semester));
    if (index === -1) return false;

    records[index] = {
      ...records[index],
      ...updatedData
    };
    this.saveFitnessRecords(records);

    this.recalculateStudentPassCount(studentId);

    this.addAuditLog({
      operator: operatorName,
      action: '編輯檢測紀錄',
      studentId: studentId,
      details: `修改 ${semester} 學期成績，狀態設為 [${updatedData.status || records[index].status}]`
    });

    return true;
  },

  deleteFitnessRecord(studentId, semester, operatorName = '管理員') {
    let records = this.getFitnessRecords();
    const initialLength = records.length;
    records = records.filter(r => !(String(r.studentId) === String(studentId) && String(r.semester) === String(semester)));
    
    if (records.length === initialLength) return false;

    this.saveFitnessRecords(records);
    this.recalculateStudentPassCount(studentId);

    this.addAuditLog({
      operator: operatorName,
      action: '刪除檢測紀錄',
      studentId: studentId,
      details: `刪除 ${semester} 學期之體適能成績紀錄`
    });

    return true;
  },

  recalculateStudentPassCount(studentId) {
    const student = this.getStudentById(studentId);
    if (!student) return;

    // Get all current records for this student
    const records = this.getFitnessRecords(studentId);
    
    // Rebuild the student's semesters object based purely on records
    const newSemesters = {};
    records.forEach(r => {
      const isPassedStatus = r.status === '合格' || r.status === '免測' || r.isPassed === true;
      newSemesters[r.semester] = isPassedStatus ? 1 : 0;
    });

    // We do NOT modify manual overrides here, we just recount based on truth
    let semPassSum = 0;
    Object.values(newSemesters).forEach(val => {
      if (Number(val) === 1) semPassSum += 1;
    });

    let transferAdd = Number(student.transferCredit || 0);
    let exemptAdd = Number(student.exemptCredit || 0);
    
    // Explicit exempt flag based on identity or setting
    const isExempt = (Number(student.isExemptAthleteOrDisabled) > 0) || (exemptAdd > 0) || /免測|身障|體保/.test(student.specialIdentity || '');
    
    let totalPass = semPassSum + transferAdd + exemptAdd;
    const reqPass = this.settings.requiredPassCount || 2;

    let newStatus = student.status;
    let deficitCount = 0;

    if (isExempt) {
      newStatus = '通過';
      deficitCount = 0;
    } else if (student.manualStatusOverride) {
      newStatus = student.manualStatusOverride;
      deficitCount = newStatus === '通過' ? 0 : Math.max(0, reqPass - totalPass);
    } else {
      newStatus = totalPass >= reqPass ? '通過' : '不通過';
      deficitCount = newStatus === '通過' ? 0 : Math.max(0, reqPass - totalPass);
    }

    // Direct update to student array to avoid circular log loops
    const students = this.getStudents();
    const index = students.findIndex(s => String(s.studentId) === String(studentId));
    if (index !== -1) {
      students[index].semesters = newSemesters;
      students[index].passCount = totalPass;
      students[index].status = newStatus;
      students[index].deficitCount = deficitCount;
      students[index].updatedAt = new Date().toLocaleDateString('zh-TW');
      this.saveStudents(students);
    }
  },

  getCurrentOperatorName() {
    return window.AdminPortal?.currentAdminUser?.name || '系統管理員';
  },

  addAuditLog(logEntry) {
    const logs = this.getLogs();
    const currentOp = this.getCurrentOperatorName();

    let activeOperator = (logEntry && logEntry.operator) ? logEntry.operator : currentOp;
    if (!activeOperator || activeOperator === '7902' || activeOperator === 'admin' || activeOperator === '管理員' || /^\d+$/.test(activeOperator)) {
      activeOperator = currentOp;
    }

    const newLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString(),
      operator: activeOperator,
      action: logEntry ? (logEntry.action || '系統變更') : '系統變更',
      studentId: logEntry ? (logEntry.studentId || '-') : '-',
      details: logEntry ? (logEntry.details || '') : ''
    };
    logs.unshift(newLog);
    if (logs.length > 300) logs.pop();
    this.saveLogs(logs);
  },

  getLogs() {
    const normalizeLog = (l) => {
      const op = l.operator;
      return { ...l, operator: op || '系統管理員' };
    };

    if (this.cache.logs !== null) {
      return this.cache.logs.map(normalizeLog);
    }

    let list = [];
    try {
      const raw = localStorage.getItem(this.STORAGE_KEYS.LOGS);
      list = raw ? JSON.parse(raw) : [];
    } catch (e) {
      list = [];
    }

    list = list.map(normalizeLog);
    this.cache.logs = list;
    return list;
  },

  saveLogs(logs) {
    this.cache.logs = logs;
    if (window.FitnessFirebase?.currentAdminProfile) {
      window.FitnessFirebase.saveCollection('logs', logs).catch((err) => {
        console.warn('操作紀錄尚未寫入 Firebase：', err);
      });
    }
  },

  async clearAllData({ cloud = false } = {}) {
    this.cache.students = [];
    this.cache.testRecords = [];
    this.cache.logs = [];
    this.selectedStudentIds.clear();

    if (cloud) {
      await window.FitnessFirebase.requireAdmin();
      await window.FitnessFirebase.saveCollection('students', []);
      await window.FitnessFirebase.saveCollection('records', []);
      await window.FitnessFirebase.saveCollection('logs', []);
      await window.FitnessFirebase.publishStudentLookups([], []);
    }
    this.notify();
    return true;
  },

  clearPrivateCache() {
    this.cache.students = [];
    this.cache.testRecords = [];
    this.cache.logs = [];
    this.selectedStudentIds.clear();
    this.notify();
  },

  async getStorageEstimateInfo() {
    let usageMB = '0.00';
    let quotaMB = '無上限';
    if (navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        if (estimate.usage) usageMB = (estimate.usage / (1024 * 1024)).toFixed(2);
        if (estimate.quota) quotaMB = (estimate.quota / (1024 * 1024)).toFixed(0) + ' MB';
      } catch(e) {}
    }
    return {
      engine: this.isIndexedDBActive ? 'IndexedDB 大容量模式' : 'LocalStorage 相容模式',
      studentsCount: (this.cache.students || []).length,
      recordsCount: (this.cache.testRecords || []).length,
      usageMB,
      quotaMB
    };
  },

  exportRosterToExcel() {
    if (window.AdminPortal && window.AdminPortal.exportRosterExcel) {
      window.AdminPortal.exportRosterExcel();
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.FitnessStore.init();
});
