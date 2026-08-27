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
    schoolName: '\u666f\u6587\u79d1\u6280\u5927\u5b78',
    currentSemester: '1122',
    importHistory: {}
  },
  selectedStudentIds: new Set(),
  listeners: [],
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
      console.warn('\u516c\u544a\u540c\u6b65\u5931\u6557\uff0c\u4f7f\u7528\u672c\u6a5f\u516c\u544a\u5feb\u53d6\u3002', e);
    }
    this.isReady = true;
    this.notify();
    if (window.App && window.App.updateFirebaseBadge) {
      window.App.updateFirebaseBadge();
    }
  },
  async syncFromFirebase() {
    if (!window.FitnessFirebase) return { success: false, message: 'Firebase \u672a\u8f09\u5165' };
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
        console.log('\u5df2\u5728\u7ba1\u7406\u54e1\u9a57\u8b49\u5f8c\u8f09\u5165\u96f2\u7aef\u8cc7\u6599\u3002');
        return {
          success: true,
          studentCount: remoteStudents ? remoteStudents.length : 0,
          recordCount: remoteRecords ? remoteRecords.length : 0
        };
      } else {
        return { success: false, message: '\u96f2\u7aef\u5c1a\u7121\u53ef\u8f09\u5165\u4e4b\u8cc7\u6599' };
      }
    } catch (err) {
      console.error('syncFromFirebase \u5931\u6557:', err);
      return { success: false, message: err.message || '\u62c9\u53d6\u96f2\u7aef\u8cc7\u6599\u5931\u6557' };
    }
  },
  getDefaultAnnouncements() {
    return [
      {
        id: 'ann_sample_1',
        title: '\u5168\u6821\u5b78\u751f\u9ad4\u9069\u80fd\u7562\u696d\u9580\u6abb\u6aa2\u6e2c\u8207\u88dc\u6e2c\u5831\u540d\u9808\u77e5',
        category: '\u88dc\u6e2c\u516c\u544a',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        isPinned: true,
        content: '\u5c1a\u672a\u9054\u5230\u7562\u696d\u9580\u6abb\uff08\u901a\u904e\u6b21\u6578\u672a\u6eff 2 \u6b21\uff09\u4e4b\u540c\u5b78\uff0c\u8acb\u4f9d\u898f\u5b9a\u5831\u540d\u6bcf\u5b78\u671f\u5168\u6821\u9ad4\u9069\u80fd\u88dc\u6e2c\uff0c\u6216\u9078\u4fee\u76f8\u95dc\u9ad4\u9069\u80fd\u88dc\u6551\u6559\u5b78\u8ab2\u7a0b\u3002',
        createdAt: '2026-08-20'
      },
      {
        id: 'ann_sample_2',
        title: '\u9ad4\u4fdd\u751f\u8207\u8eab\u969c\u514d\u6e2c\u8cc7\u683c\u63a1\u8a08\u8fa6\u7406\u63d0\u9192',
        category: '\u7533\u8fa6\u63d0\u9192',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        isPinned: false,
        content: '\u7b26\u5408\u8f49\u5b78\u6263\u62b5\u3001\u9ad4\u80b2\u4fdd\u9001\u751f\u6216\u9818\u6709\u8eab\u5fc3\u969c\u7919\u624b\u518a/\u91ab\u7642\u514d\u6e2c\u6838\u53ef\u4e4b\u540c\u5b78\uff0c\u8acb\u5099\u9f4a\u4f50\u8b49\u6587\u4ef6\u81f3\u9ad4\u80b2\u7d44\u8fa6\u7406\u9580\u6abb\u62b5\u514d\u767b\u8a18\u3002',
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
        console.error('IndexedDB saveAnnouncements \u5931\u6557:', err);
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
      title: annData.title || '\u7121\u6a19\u984c\u516c\u544a',
      category: annData.category || '\u91cd\u8981\u901a\u77e5',
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
        console.warn('\u7cfb\u7d71\u8a2d\u5b9a\u5c1a\u672a\u5beb\u5165\u96f2\u7aef\u3002', err);
      });
    }
  },
  getAdminAccounts() {
    const profile = window.FitnessFirebase?.currentAdminProfile;
    return profile ? [{ id: profile.uid, username: profile.username, role: profile.role, name: profile.name }] : [];
  },
  addAdminAccount() { throw new Error('\u8acb\u65bc Firebase Authentication \u5efa\u7acb\u5e33\u865f\u4e26\u8a2d\u5b9a Custom Claims\u3002'); },
  updateAdminAccount() { throw new Error('\u8acb\u65bc Firebase Authentication \u7ba1\u7406\u5e33\u865f\u8207\u6b0a\u9650\u3002'); },
  deleteAdminAccount() { throw new Error('\u8acb\u65bc Firebase Authentication \u7ba1\u7406\u5e33\u865f\u8207\u6b0a\u9650\u3002'); },
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
    if (!window.FitnessFirebase) return { success: false, message: 'Firebase SDK \u672a\u8f09\u5165' };
    if (!window.FitnessFirebase.isFirebaseActive) {
      const ok = window.FitnessFirebase.init();
      if (!ok) return { success: false, message: 'Firebase \u5c1a\u672a\u6b63\u78ba\u9023\u7dda\uff0c\u8acb\u6aa2\u67e5 API Key \u8207\u7db2\u8def' };
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
      console.error('Firebase \u5168\u91cf\u63a8\u64ad\u5931\u6557:', err);
      const isPermErr = /permission|\u6b0a\u9650/i.test(String(err.message || '')) || /permission-denied/i.test(String(err.code || ''));
      return { 
        success: false, 
        message: isPermErr 
          ? 'Firebase \u6b0a\u9650\u88ab\u62d2\uff1a\u8acb\u78ba\u8a8d\u76ee\u524d\u5e33\u865f\u5177\u5099 Custom Claims\uff0c\u4e14\u5b89\u5168\u898f\u5247\u5df2\u90e8\u7f72\u81f3 fitness \u547d\u540d\u8cc7\u6599\u5eab\u3002' 
          : (err.message || '\u5beb\u5165\u5931\u6557\uff0c\u8acb\u78ba\u8a8d Firebase Rules \u898f\u5247') 
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
    this.cache.students = students;
    this.notify();
    if (window.FitnessFirebase?.currentAdminProfile) {
      window.FitnessFirebase.saveCollection('students', students).then(() => {
        console.log('\u5b78\u751f\u4e3b\u6a94\u5df2\u540c\u6b65\u81f3 Firebase\u3002');
      }).catch(err => {
        console.warn('\u5b78\u751f\u4e3b\u6a94\u5c1a\u672a\u5beb\u5165 Firebase\uff1a', err);
        if (window.App) window.App.showToast('\u96f2\u7aef\u5132\u5b58\u5931\u6557\uff0c\u8acb\u52ff\u95dc\u9589\u9801\u9762\u4e26\u91cd\u65b0\u540c\u6b65', 'danger');
      });
      this.scheduleStudentLookupPublish();
    }
  },
  updateStudent(studentId, updatedFields, operatorName = '') {
    operatorName = operatorName || this.getCurrentOperatorName();
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
    const isExempt = (Number(newData.isExemptAthleteOrDisabled) > 0) || (exemptAdd > 0) || /\u514d\u6e2c|\u8eab\u969c|\u9ad4\u4fdd/.test(newData.specialIdentity || '');
    const reqPass = this.settings.requiredPassCount || 2;
    if (isExempt) {
      newData.status = '\u901a\u904e';
      newData.deficitCount = 0;
    } else if (newData.manualStatusOverride) {
      newData.status = newData.manualStatusOverride;
      newData.deficitCount = newData.status === '\u901a\u904e' ? 0 : Math.max(0, reqPass - totalPass);
    } else {
      newData.status = totalPass >= reqPass ? '\u901a\u904e' : '\u4e0d\u901a\u904e';
      newData.deficitCount = newData.status === '\u901a\u904e' ? 0 : Math.max(0, reqPass - totalPass);
    }
    students[index] = newData;
    this.saveStudents(students);
    this.addAuditLog({
      operator: operatorName,
      action: '\u7de8\u8f2f\u5b78\u751f\u6a94\u6848',
      studentId: studentId,
      details: `\u4fee\u8a02\u5b78\u865f [${studentId}] (${newData.name})\uff1a\u901a\u904e\u6b21\u6578 ${newData.passCount}\uff0c\u72c0\u614b ${newData.status}`
    });
    return newData;
  },
  bulkUpdateStatus(studentIds, newStatus, specialIdentity = '', notes = '', operatorName = '') {
    operatorName = operatorName || this.getCurrentOperatorName();
    if (!studentIds || studentIds.length === 0) return;
    const students = this.getStudents();
    let updatedCount = 0;
    students.forEach(s => {
      if (studentIds.includes(s.studentId)) {
        if (newStatus) {
          s.status = newStatus;
          s.deficitCount = newStatus === '\u901a\u904e' ? 0 : Math.max(0, 2 - (s.passCount || 0));
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
      action: '\u6279\u91cf\u4f5c\u696d',
      studentId: 'MULTI',
      details: `\u6279\u91cf\u4fee\u6539 ${updatedCount} \u4f4d\u5b78\u751f\u72c0\u614b\u70ba [${newStatus}]`
    });
    return updatedCount;
  },
  getAllFitnessRecords() {
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
    return records;
  },
  normalizeRecordCarryovers(student) {
    if (!student || !Array.isArray(student.recordCarryovers)) return [];
    return student.recordCarryovers.filter(link => link && link.active !== false && link.sourceStudentId);
  },
  getFitnessRecords(studentId = null) {
    const records = this.getAllFitnessRecords();
    if (!studentId) return records;
    const normalizedId = String(studentId).trim();
    const student = this.getStudentById(normalizedId);
    const directRecords = records.filter(r => String(r.studentId).trim() === normalizedId);
    if (!student) return directRecords;
    const recordsBySemester = new Map();
    directRecords.forEach(record => {
      recordsBySemester.set(String(record.semester || '').trim(), record);
    });
    this.normalizeRecordCarryovers(student).forEach(link => {
      const sourceId = String(link.sourceStudentId).trim();
      const allowedSemesters = new Set((link.semesters || []).map(semester => String(semester).trim()));
      records.forEach(record => {
        const semester = String(record.semester || '').trim();
        if (String(record.studentId).trim() !== sourceId || !allowedSemesters.has(semester)) return;
        if (recordsBySemester.has(semester)) return;
        recordsBySemester.set(semester, {
          ...record,
          isCarriedRecord: true,
          carriedFromStudentId: sourceId,
          carriedToStudentId: normalizedId,
          carryoverId: link.id || ''
        });
      });
    });
    return Array.from(recordsBySemester.values());
  },
  getRecordCarryoverTarget(sourceStudentId) {
    const sourceId = String(sourceStudentId || '').trim();
    if (!sourceId) return null;
    return this.getStudents().find(student => this.normalizeRecordCarryovers(student)
      .some(link => String(link.sourceStudentId).trim() === sourceId)) || null;
  },
  carryOverStudentRecords(targetStudentId, sourceStudentId, semesters, note = '', operator = {}) {
    const targetId = String(targetStudentId || '').trim();
    const sourceId = String(sourceStudentId || '').trim();
    const normalizedSemesters = [...new Set((semesters || []).map(value => String(value).trim()).filter(Boolean))].sort();
    const approvalNote = String(note || '').trim();
    const students = this.getStudents();
    const targetIndex = students.findIndex(student => String(student.studentId).trim() === targetId);
    const sourceIndex = students.findIndex(student => String(student.studentId).trim() === sourceId);
    if (!/^\d{6,12}$/.test(targetId) || !/^\d{6,12}$/.test(sourceId)) throw new Error('\u65b0\u820a\u5b78\u865f\u5fc5\u9808\u70ba 6 \u81f3 12 \u78bc\u6578\u5b57');
    if (targetId === sourceId) throw new Error('\u65b0\u820a\u5b78\u865f\u4e0d\u53ef\u76f8\u540c');
    if (targetIndex < 0) throw new Error('\u627e\u4e0d\u5230\u65b0\u5b78\u865f\u5b78\u751f\u8cc7\u6599');
    if (sourceIndex < 0) throw new Error('\u627e\u4e0d\u5230\u820a\u5b78\u865f\u5b78\u751f\u8cc7\u6599');
    if (normalizedSemesters.length === 0) throw new Error('\u8acb\u81f3\u5c11\u9078\u64c7\u4e00\u500b\u627f\u63a5\u5b78\u671f');
    if (!approvalNote) throw new Error('\u8acb\u586b\u5beb\u6821\u65b9\u6838\u51c6\u4f9d\u64da\u6216\u5167\u90e8\u5099\u8a3b');
    const hasNameMismatch = String(students[targetIndex].name || '').trim() !== String(students[sourceIndex].name || '').trim();
    if (hasNameMismatch && operator.confirmedNameMismatch !== true) {
      throw new Error('\u65b0\u820a\u540d\u518a\u59d3\u540d\u4e0d\u4e00\u81f4\uff0c\u5fc5\u9808\u5148\u78ba\u8a8d\u6821\u65b9\u6587\u4ef6');
    }
    const targetAlreadyCarriedTo = this.getRecordCarryoverTarget(targetId);
    if (targetAlreadyCarriedTo) {
      throw new Error(`\u65b0\u5b78\u865f ${targetId} \u5df2\u4f5c\u70ba\u5176\u4ed6\u627f\u63a5\u95dc\u4fc2\u7684\u4f86\u6e90\uff0c\u4e0d\u53ef\u5f62\u6210\u591a\u5c64\u4e32\u63a5`);
    }
    const existingTarget = this.getRecordCarryoverTarget(sourceId);
    if (existingTarget && String(existingTarget.studentId).trim() !== targetId) {
      throw new Error(`\u820a\u5b78\u865f ${sourceId} \u5df2\u627f\u63a5\u81f3 ${existingTarget.studentId}\uff0c\u4e0d\u53ef\u91cd\u8907\u627f\u63a5`);
    }
    if (this.normalizeRecordCarryovers(students[sourceIndex]).length > 0) {
      throw new Error('\u4f86\u6e90\u820a\u5b78\u865f\u672c\u8eab\u5df2\u6709\u627f\u63a5\u8cc7\u6599\uff0c\u70ba\u907f\u514d\u4e32\u63a5\u932f\u8aa4\u4e0d\u53ef\u518d\u4f5c\u70ba\u4f86\u6e90');
    }
    const allRecords = this.getAllFitnessRecords();
    const sourceRecordSemesters = new Set(allRecords
      .filter(record => String(record.studentId).trim() === sourceId)
      .map(record => String(record.semester || '').trim()));
    const missingSemesters = normalizedSemesters.filter(semester => !sourceRecordSemesters.has(semester));
    if (missingSemesters.length > 0) throw new Error(`\u820a\u5b78\u865f\u627e\u4e0d\u5230\u4ee5\u4e0b\u5b78\u671f\uff1a${missingSemesters.join('\u3001')}`);
    const occupiedSemesters = new Set(this.getFitnessRecords(targetId).map(record => String(record.semester || '').trim()));
    const conflicts = normalizedSemesters.filter(semester => occupiedSemesters.has(semester));
    if (conflicts.length > 0) throw new Error(`\u65b0\u5b78\u865f\u5df2\u6709\u4ee5\u4e0b\u5b78\u671f\u8cc7\u6599\uff0c\u4e0d\u80fd\u91cd\u8907\u627f\u63a5\uff1a${conflicts.join('\u3001')}`);
    const currentUser = window.AdminPortal?.currentAdminUser || window.FitnessFirebase?.currentAdminProfile || {};
    const now = new Date().toISOString();
    const link = {
      id: `carry_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      sourceStudentId: sourceId,
      sourceStudentName: students[sourceIndex].name || '',
      semesters: normalizedSemesters,
      note: approvalNote,
      linkedAt: now,
      linkedBy: operator.name || currentUser.name || this.getCurrentOperatorName(),
      linkedByAccount: operator.account || currentUser.account || currentUser.username || '',
      linkedByRole: operator.role || currentUser.role || '',
      active: true
    };
    students[targetIndex] = {
      ...students[targetIndex],
      recordCarryovers: [...this.normalizeRecordCarryovers(students[targetIndex]), link],
      updatedAt: new Date().toLocaleDateString('zh-TW')
    };
    students[sourceIndex] = {
      ...students[sourceIndex],
      lookupDisabledBeforeCarryover: Object.prototype.hasOwnProperty.call(students[sourceIndex], 'lookupDisabledBeforeCarryover')
        ? Boolean(students[sourceIndex].lookupDisabledBeforeCarryover)
        : Boolean(students[sourceIndex].lookupDisabled),
      lookupDisabled: true,
      recordsCarriedToStudentId: targetId,
      recordsCarriedAt: now
    };
    this.saveStudents(students);
    this.recalculateStudentPassCount(targetId);
    this.addAuditLog({
      operator: link.linkedBy,
      action: '\u627f\u63a5\u820a\u5b78\u865f\u8cc7\u6599',
      studentId: targetId,
      details: `\u65b0\u5b78\u865f ${targetId} \u627f\u63a5\u820a\u5b78\u865f ${sourceId}\uff1b\u5b78\u671f\uff1a${normalizedSemesters.join('\u3001')}\uff1b\u6838\u51c6\u5099\u8a3b\uff1a${approvalNote}`
    });
    return link;
  },
  revokeStudentRecordCarryover(targetStudentId, carryoverId, operator = {}) {
    const targetId = String(targetStudentId || '').trim();
    const linkId = String(carryoverId || '').trim();
    const students = this.getStudents();
    const targetIndex = students.findIndex(student => String(student.studentId).trim() === targetId);
    if (targetIndex < 0) throw new Error('\u627e\u4e0d\u5230\u65b0\u5b78\u865f\u5b78\u751f\u8cc7\u6599');
    const links = this.normalizeRecordCarryovers(students[targetIndex]);
    const link = links.find(item => String(item.id) === linkId);
    if (!link) throw new Error('\u627e\u4e0d\u5230\u6307\u5b9a\u7684\u627f\u63a5\u7d00\u9304');
    students[targetIndex] = {
      ...students[targetIndex],
      recordCarryovers: links.filter(item => String(item.id) !== linkId),
      updatedAt: new Date().toLocaleDateString('zh-TW')
    };
    const sourceId = String(link.sourceStudentId).trim();
    const sourceIndex = students.findIndex(student => String(student.studentId).trim() === sourceId);
    const stillLinkedElsewhere = students.some(student => this.normalizeRecordCarryovers(student)
      .some(item => String(item.sourceStudentId).trim() === sourceId));
    if (sourceIndex >= 0 && !stillLinkedElsewhere) {
      const restoredSource = { ...students[sourceIndex] };
      restoredSource.lookupDisabled = Boolean(restoredSource.lookupDisabledBeforeCarryover);
      delete restoredSource.lookupDisabledBeforeCarryover;
      delete restoredSource.recordsCarriedToStudentId;
      delete restoredSource.recordsCarriedAt;
      students[sourceIndex] = restoredSource;
    }
    this.saveStudents(students);
    this.recalculateStudentPassCount(targetId);
    const currentUser = window.AdminPortal?.currentAdminUser || window.FitnessFirebase?.currentAdminProfile || {};
    this.addAuditLog({
      operator: operator.name || currentUser.name || this.getCurrentOperatorName(),
      action: '\u64a4\u92b7\u820a\u5b78\u865f\u627f\u63a5',
      studentId: targetId,
      details: `\u64a4\u92b7\u65b0\u5b78\u865f ${targetId} \u5c0d\u820a\u5b78\u865f ${sourceId} \u7684\u8cc7\u6599\u627f\u63a5\uff1b\u539f\u627f\u63a5\u5b78\u671f\uff1a${(link.semesters || []).join('\u3001')}`
    });
    return link;
  },
  saveFitnessRecords(records) {
    this.cache.testRecords = records;
    this.notify();
    if (window.FitnessFirebase?.currentAdminProfile) {
      window.FitnessFirebase.saveCollection('records', records).then(() => {
        console.log('\u6aa2\u6e2c\u7d00\u9304\u5df2\u540c\u6b65\u81f3 Firebase\u3002');
      }).catch(err => {
        console.warn('\u6aa2\u6e2c\u7d00\u9304\u5c1a\u672a\u5beb\u5165 Firebase\uff1a', err);
        if (window.App) window.App.showToast('\u6210\u7e3e\u5c1a\u672a\u5beb\u5165\u96f2\u7aef\uff0c\u8acb\u91cd\u65b0\u540c\u6b65', 'danger');
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
        console.warn('\u5b78\u751f\u55ae\u7b46\u67e5\u8a62\u7d22\u5f15\u5c1a\u672a\u66f4\u65b0\uff1a', err);
        if (window.App) window.App.showToast('\u5b78\u751f\u67e5\u8a62\u7d22\u5f15\u66f4\u65b0\u5931\u6557\uff0c\u8acb\u57f7\u884c\u5168\u91cf\u540c\u6b65', 'warning');
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
  updateFitnessRecord(studentId, semester, updatedData, operatorName = '') {
    operatorName = operatorName || this.getCurrentOperatorName();
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
      action: '\u7de8\u8f2f\u6aa2\u6e2c\u7d00\u9304',
      studentId: studentId,
      details: `\u4fee\u6539 ${semester} \u5b78\u671f\u6210\u7e3e\uff0c\u72c0\u614b\u8a2d\u70ba [${updatedData.status || records[index].status}]`
    });
    return true;
  },
  deleteFitnessRecord(studentId, semester, operatorName = '') {
    operatorName = operatorName || this.getCurrentOperatorName();
    let records = this.getFitnessRecords();
    const initialLength = records.length;
    records = records.filter(r => !(String(r.studentId) === String(studentId) && String(r.semester) === String(semester)));
    if (records.length === initialLength) return false;
    this.saveFitnessRecords(records);
    this.recalculateStudentPassCount(studentId);
    this.addAuditLog({
      operator: operatorName,
      action: '\u522a\u9664\u6aa2\u6e2c\u7d00\u9304',
      studentId: studentId,
      details: `\u522a\u9664 ${semester} \u5b78\u671f\u4e4b\u9ad4\u9069\u80fd\u6210\u7e3e\u7d00\u9304`
    });
    return true;
  },
  recalculateStudentPassCount(studentId) {
    const requestedId = String(studentId || '').trim();
    if (!requestedId) return;
    const students = this.getStudents();
    const affectedIds = new Set([requestedId]);
    students.forEach(candidate => {
      if (this.normalizeRecordCarryovers(candidate)
        .some(link => String(link.sourceStudentId).trim() === requestedId)) {
        affectedIds.add(String(candidate.studentId).trim());
      }
    });
    affectedIds.forEach(targetId => {
      const index = students.findIndex(student => String(student.studentId).trim() === targetId);
      if (index < 0) return;
      const student = students[index];
      const records = this.getFitnessRecords(targetId);
      const newSemesters = {};
      records.forEach(record => {
        const isPassedStatus = record.status === '\u5408\u683c' || record.status === '\u514d\u6e2c' || record.isPassed === true;
        newSemesters[record.semester] = isPassedStatus ? 1 : 0;
      });
      const semPassSum = Object.values(newSemesters).filter(value => Number(value) === 1).length;
      const transferAdd = Number(student.transferCredit || 0);
      const exemptAdd = Number(student.exemptCredit || 0);
      const isExempt = Number(student.isExemptAthleteOrDisabled) > 0
        || exemptAdd > 0
        || /\u514d\u6e2c|\u8eab\u969c|\u9ad4\u4fdd/.test(student.specialIdentity || '');
      const totalPass = semPassSum + transferAdd + exemptAdd;
      const reqPass = this.settings.requiredPassCount || 2;
      let newStatus = student.status;
      let deficitCount = 0;
      if (isExempt) {
        newStatus = '\u901a\u904e';
      } else if (student.manualStatusOverride) {
        newStatus = student.manualStatusOverride;
        deficitCount = newStatus === '\u901a\u904e' ? 0 : Math.max(0, reqPass - totalPass);
      } else {
        newStatus = totalPass >= reqPass ? '\u901a\u904e' : '\u4e0d\u901a\u904e';
        deficitCount = newStatus === '\u901a\u904e' ? 0 : Math.max(0, reqPass - totalPass);
      }
      students[index] = {
        ...student,
        semesters: newSemesters,
        passCount: totalPass,
        status: newStatus,
        deficitCount,
        updatedAt: new Date().toLocaleDateString('zh-TW')
      };
    });
    this.saveStudents(students);
  },
  getCurrentOperatorName() {
    const user = window.AdminPortal?.currentAdminUser || window.FitnessFirebase?.currentAdminProfile;
    return user?.name || user?.username || user?.account || '\u672a\u8b58\u5225\u64cd\u4f5c\u4eba';
  },
  addAuditLog(logEntry) {
    const logs = this.getLogs();
    const currentUser = window.AdminPortal?.currentAdminUser || window.FitnessFirebase?.currentAdminProfile;
    const currentOp = this.getCurrentOperatorName();
    let activeOperator = currentUser ? currentOp : ((logEntry && logEntry.operator) ? logEntry.operator : currentOp);
    if (!activeOperator || activeOperator === '7902' || activeOperator === 'admin' || activeOperator === '\u7ba1\u7406\u54e1' || /^\d+$/.test(activeOperator)) activeOperator = currentOp;
    const newLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString(),
      operator: activeOperator,
      operatorAccount: currentUser?.account || currentUser?.username || '',
      operatorUid: currentUser?.uid || '',
      operatorRole: currentUser?.role || '',
      action: logEntry ? (logEntry.action || '\u7cfb\u7d71\u8b8a\u66f4') : '\u7cfb\u7d71\u8b8a\u66f4',
      studentId: logEntry ? (logEntry.studentId || '-') : '-',
      details: logEntry ? (logEntry.details || '') : '',
      result: logEntry ? (logEntry.result || 'success') : 'success'
    };
    logs.unshift(newLog);
    if (logs.length > 300) logs.pop();
    return this.saveLogs(logs);
  },
  getLogs() {
    const normalizeLog = (l) => {
      const op = l.operator;
      return { ...l, operator: op || '\u7cfb\u7d71\u7ba1\u7406\u54e1', result: l.result || 'success' };
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
  async backfillAuditOperatorNames(accounts = []) {
    if (!Array.isArray(accounts) || accounts.length === 0) {
      return { updated: 0, unresolved: 0 };
    }
    const normalizeAccount = (value) => String(value || '').trim().toLowerCase();
    const byUid = new Map();
    const byAccount = new Map();
    accounts.forEach(account => {
      const name = String(account?.name || '').trim();
      if (!name || name === '\u7cfb\u7d71\u7ba1\u7406\u54e1' || name === '\u7ba1\u7406\u54e1') return;
      if (account.uid) byUid.set(String(account.uid), name);
      if (account.account) byAccount.set(normalizeAccount(account.account), name);
      if (account.username) byAccount.set(normalizeAccount(account.username), name);
    });
    const isGenericOperator = (value) => {
      const operator = String(value || '').trim();
      return !operator
        || operator === '\u7cfb\u7d71\u7ba1\u7406\u54e1'
        || operator === '\u7ba1\u7406\u54e1'
        || operator.toLowerCase() === 'admin'
        || /^\d+$/.test(operator);
    };
    const logs = this.getLogs();
    let updated = 0;
    let unresolved = 0;
    const now = new Date().toISOString();
    const nextLogs = logs.map(log => {
      if (!isGenericOperator(log.operator)) return log;
      const uidName = log.operatorUid ? byUid.get(String(log.operatorUid)) : '';
      const accountKey = normalizeAccount(log.operatorAccount || (/^\d+$/.test(String(log.operator || '').trim()) ? log.operator : ''));
      const accountName = accountKey ? byAccount.get(accountKey) : '';
      const resolvedName = uidName || accountName;
      if (!resolvedName) {
        unresolved++;
        return log;
      }
      updated++;
      return {
        ...log,
        operator: resolvedName,
        operatorNameBackfilledAt: now
      };
    });
    if (updated > 0) await this.saveLogs(nextLogs);
    return { updated, unresolved };
  },
  saveLogs(logs) {
    this.cache.logs = logs;
    if (window.FitnessFirebase?.currentAdminProfile) {
      return window.FitnessFirebase.saveCollection('logs', logs).catch((err) => {
        console.warn('\u64cd\u4f5c\u7d00\u9304\u5c1a\u672a\u5beb\u5165 Firebase\uff1a', err);
      });
    }
    return Promise.resolve();
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
    let quotaMB = '\u7121\u4e0a\u9650';
    if (navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        if (estimate.usage) usageMB = (estimate.usage / (1024 * 1024)).toFixed(2);
        if (estimate.quota) quotaMB = (estimate.quota / (1024 * 1024)).toFixed(0) + ' MB';
      } catch(e) {}
    }
    return {
      engine: this.isIndexedDBActive ? 'IndexedDB \u5927\u5bb9\u91cf\u6a21\u5f0f' : 'LocalStorage \u76f8\u5bb9\u6a21\u5f0f',
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
