const FitnessIDB = {
  dbName: 'FitnessPlatformDB_V1',
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
    STUDENTS: 'FITNESS_STORE_STUDENTS_V4',
    TEST_RECORDS: 'FITNESS_STORE_RECORDS_V4',
    LOGS: 'FITNESS_STORE_AUDIT_LOGS_V4',
    SETTINGS: 'FITNESS_STORE_SETTINGS_V4',
    ANNOUNCEMENTS: 'FITNESS_STORE_ANNOUNCEMENTS_V4'
  },
  settings: {
    requiredPassCount: 2,
    schoolDomain: 'just.edu.tw',
    schoolName: '\u666f\u6587\u79d1\u6280\u5927\u5b78',
    currentSemester: '1122',
    importHistory: {},
    adminAccount: { username: 'admin', passcode: 'admin123' }
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
  subscribe(fn) {
    if (typeof fn === 'function') this.listeners.push(fn);
  },
  notify() {
    this.listeners.forEach(fn => fn());
  },
  async init() {
    const savedSettings = localStorage.getItem(this.STORAGE_KEYS.SETTINGS);
    if (savedSettings) {
      try { this.settings = { ...this.settings, ...JSON.parse(savedSettings) }; } catch(e){}
    }
    try {
      const idbStudents = await FitnessIDB.getItem(this.STORAGE_KEYS.STUDENTS);
      const idbRecords = await FitnessIDB.getItem(this.STORAGE_KEYS.TEST_RECORDS);
      const idbLogs = await FitnessIDB.getItem(this.STORAGE_KEYS.LOGS);
      const idbSettings = await FitnessIDB.getItem(this.STORAGE_KEYS.SETTINGS);
      const idbAnnouncements = await FitnessIDB.getItem(this.STORAGE_KEYS.ANNOUNCEMENTS);
      this.isIndexedDBActive = true;
      if (idbStudents === null && idbRecords === null) {
        const lsStudents = localStorage.getItem(this.STORAGE_KEYS.STUDENTS);
        const lsRecords = localStorage.getItem(this.STORAGE_KEYS.TEST_RECORDS);
        const lsLogs = localStorage.getItem(this.STORAGE_KEYS.LOGS);
        const lsAnnouncements = localStorage.getItem(this.STORAGE_KEYS.ANNOUNCEMENTS);
        if (lsStudents || lsRecords || lsLogs || lsAnnouncements) {
          console.log('\ud83d\ude80 \u6b63\u5728\u81ea\u52d5\u5c07 LocalStorage \u8cc7\u6599\u8f49\u79fb\u81f3 IndexedDB \u5927\u5bb9\u91cf\u8cc7\u6599\u5eab...');
          const parsedStudents = lsStudents ? JSON.parse(lsStudents) : [];
          const parsedRecords = lsRecords ? JSON.parse(lsRecords) : [];
          const parsedLogs = lsLogs ? JSON.parse(lsLogs) : [];
          const parsedAnnouncements = lsAnnouncements ? JSON.parse(lsAnnouncements) : this.getDefaultAnnouncements();
          this.cache.students = parsedStudents;
          this.cache.testRecords = parsedRecords;
          this.cache.logs = parsedLogs;
          this.cache.announcements = parsedAnnouncements;
          await FitnessIDB.setItem(this.STORAGE_KEYS.STUDENTS, parsedStudents);
          await FitnessIDB.setItem(this.STORAGE_KEYS.TEST_RECORDS, parsedRecords);
          await FitnessIDB.setItem(this.STORAGE_KEYS.LOGS, parsedLogs);
          await FitnessIDB.setItem(this.STORAGE_KEYS.SETTINGS, this.settings);
          await FitnessIDB.setItem(this.STORAGE_KEYS.ANNOUNCEMENTS, parsedAnnouncements);
          console.log('\u2705 LocalStorage \u8cc7\u6599\u6210\u529f\u5099\u4efd\u5347\u7d1a\u81f3 IndexedDB\uff01');
        } else {
          this.cache.students = [];
          this.cache.testRecords = [];
          this.cache.logs = [];
          this.cache.announcements = this.getDefaultAnnouncements();
          await FitnessIDB.setItem(this.STORAGE_KEYS.STUDENTS, []);
          await FitnessIDB.setItem(this.STORAGE_KEYS.TEST_RECORDS, []);
          await FitnessIDB.setItem(this.STORAGE_KEYS.LOGS, []);
          await FitnessIDB.setItem(this.STORAGE_KEYS.ANNOUNCEMENTS, this.cache.announcements);
        }
      } else {
        this.cache.students = Array.isArray(idbStudents) ? idbStudents : [];
        this.cache.testRecords = Array.isArray(idbRecords) ? idbRecords : [];
        this.cache.logs = Array.isArray(idbLogs) ? idbLogs : [];
        this.cache.announcements = Array.isArray(idbAnnouncements) ? idbAnnouncements : this.getDefaultAnnouncements();
        if (idbSettings) {
          this.settings = { ...this.settings, ...idbSettings };
        }
      }
    } catch (err) {
      console.warn('\u26a0\ufe0f IndexedDB \u555f\u52d5\u5931\u6557\uff0c\u56de\u9000\u81f3 LocalStorage \u6a21\u5f0f:', err);
      this.isIndexedDBActive = false;
      const rawStudents = localStorage.getItem(this.STORAGE_KEYS.STUDENTS);
      const rawRecords = localStorage.getItem(this.STORAGE_KEYS.TEST_RECORDS);
      const rawLogs = localStorage.getItem(this.STORAGE_KEYS.LOGS);
      const rawAnnouncements = localStorage.getItem(this.STORAGE_KEYS.ANNOUNCEMENTS);
      this.cache.students = rawStudents ? JSON.parse(rawStudents) : [];
      this.cache.testRecords = rawRecords ? JSON.parse(rawRecords) : [];
      this.cache.logs = rawLogs ? JSON.parse(rawLogs) : [];
      this.cache.announcements = rawAnnouncements ? JSON.parse(rawAnnouncements) : this.getDefaultAnnouncements();
    }
    try {
      await this.syncFromFirebase();
    } catch (e) {
      console.log('\u521d\u6b21\u96f2\u7aef\u975c\u9ed8\u540c\u6b65:', e);
    }
    this.isReady = true;
    this.notify();
    if (window.App && window.App.updateFirebaseBadge) {
      window.App.updateFirebaseBadge();
    }
  },
  async syncFromFirebase() {
    if (!window.FitnessFirebase) return { success: false, message: 'Firebase \u672a\u8f09\u5165' };
    if (typeof firebase === 'undefined' && window.FitnessFirebase.ensureFirebaseSDK) {
      await window.FitnessFirebase.ensureFirebaseSDK();
    }
    if (!window.FitnessFirebase.isFirebaseActive) {
      window.FitnessFirebase.init();
    }
    try {
      const remoteStudents = await window.FitnessFirebase.loadCollection('students');
      const remoteRecords = await window.FitnessFirebase.loadCollection('records');
      const remoteAnnouncements = await window.FitnessFirebase.loadCollection('announcements');
      const remoteLogs = await window.FitnessFirebase.loadCollection('logs');
      const remoteSettings = await window.FitnessFirebase.loadCollection('settings');
      let updated = false;
      if (Array.isArray(remoteStudents) && remoteStudents.length > 0) {
        const localTS = parseInt(localStorage.getItem(this.STORAGE_KEYS.STUDENTS + '_TS') || '0', 10);
        if (!localTS || !this.cache.students || this.cache.students.length === 0) {
          this.cache.students = remoteStudents;
          if (this.isIndexedDBActive) await FitnessIDB.setItem(this.STORAGE_KEYS.STUDENTS, remoteStudents);
          try { localStorage.setItem(this.STORAGE_KEYS.STUDENTS, JSON.stringify(remoteStudents)); } catch(e){}
          updated = true;
        } else {
          console.log('\u2139\ufe0f \u672c\u5730\u542b\u6709\u6700\u65b0\u4fee\u8a02\u8cc7\u6599\uff0c\u4fdd\u8b77\u672c\u5730\u7de8\u8f2f\u4e0d\u53d7\u5f71\u97ff\u3002');
        }
      }
      if (Array.isArray(remoteRecords) && remoteRecords.length > 0) {
        const localTS = parseInt(localStorage.getItem(this.STORAGE_KEYS.TEST_RECORDS + '_TS') || '0', 10);
        if (!localTS || !this.cache.testRecords || this.cache.testRecords.length === 0) {
          this.cache.testRecords = remoteRecords;
          if (this.isIndexedDBActive) await FitnessIDB.setItem(this.STORAGE_KEYS.TEST_RECORDS, remoteRecords);
          try { localStorage.setItem(this.STORAGE_KEYS.TEST_RECORDS, JSON.stringify(remoteRecords)); } catch(e){}
          updated = true;
        } else {
          console.log('\u2139\ufe0f \u672c\u5730\u542b\u6709\u6700\u65b0\u4fee\u8a02\u6aa2\u6e2c\u7d00\u9304\uff0c\u4fdd\u8b77\u672c\u5730\u7de8\u8f2f\u4e0d\u53d7\u820a\u96f2\u7aef\u5f71\u97ff\u3002');
        }
      }
      if (Array.isArray(remoteAnnouncements) && remoteAnnouncements.length > 0) {
        this.cache.announcements = remoteAnnouncements;
        if (this.isIndexedDBActive) await FitnessIDB.setItem(this.STORAGE_KEYS.ANNOUNCEMENTS, remoteAnnouncements);
        try { localStorage.setItem(this.STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(remoteAnnouncements)); } catch(e){}
        updated = true;
      }
      if (Array.isArray(remoteLogs) && remoteLogs.length > 0) {
        this.cache.logs = remoteLogs;
        if (this.isIndexedDBActive) await FitnessIDB.setItem(this.STORAGE_KEYS.LOGS, remoteLogs);
        try { localStorage.setItem(this.STORAGE_KEYS.LOGS, JSON.stringify(remoteLogs)); } catch(e){}
        updated = true;
      }
      if (remoteSettings && typeof remoteSettings === 'object') {
        this.settings = { ...this.settings, ...remoteSettings };
        if (this.isIndexedDBActive) await FitnessIDB.setItem(this.STORAGE_KEYS.SETTINGS, this.settings);
        try { localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings)); } catch(e){}
        updated = true;
      }
      if (updated) {
        this.notify();
        console.log('\u2601\ufe0f \u6210\u529f\u81ea\u52d5\u5f9e Firebase \u96f2\u7aef\u8f09\u5165\u6700\u65b0\u5168\u6821\u5b78\u7c4d\u8207\u6210\u7e3e\uff01');
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
    try {
      localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
    } catch (e) {}
    if (this.isIndexedDBActive) {
      FitnessIDB.setItem(this.STORAGE_KEYS.SETTINGS, this.settings);
    }
    if (window.FitnessFirebase && window.FitnessFirebase.isFirebaseActive) {
      window.FitnessFirebase.saveCollection('settings', this.settings);
    }
  },
  getAdminAccounts() {
    if (!Array.isArray(this.settings.adminAccounts) || this.settings.adminAccounts.length === 0) {
      this.settings.adminAccounts = [
        { id: 'acc_master', username: (this.settings.adminAccount?.username || 'admin'), passcode: (this.settings.adminAccount?.passcode || 'admin123'), role: 'super_admin', name: '\u6700\u9ad8\u7ba1\u7406\u54e1', createdAt: '2026-08-20' },
        { id: 'acc_staff1', username: 'staff', passcode: 'staff123', role: 'staff', name: '\u9ad4\u80b2\u7d44\u540c\u4ec1', createdAt: '2026-08-20' }
      ];
    }
    return this.settings.adminAccounts;
  },
  saveAdminAccounts(accounts) {
    this.settings.adminAccounts = accounts;
    this.saveSettings();
    return true;
  },
  addAdminAccount(accData) {
    const list = this.getAdminAccounts();
    const newAcc = {
      id: 'acc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      username: (accData.username || '').trim(),
      passcode: (accData.passcode || '').trim(),
      role: accData.role || 'staff', // 'super_admin' | 'staff'
      name: (accData.name || accData.username || '\u540c\u4ec1').trim(),
      createdAt: new Date().toLocaleDateString('zh-TW')
    };
    list.push(newAcc);
    this.saveAdminAccounts(list);
    return newAcc;
  },
  updateAdminAccount(id, updatedFields) {
    const list = this.getAdminAccounts();
    const idx = list.findIndex(a => a.id === id);
    if (idx === -1) return false;
    list[idx] = {
      ...list[idx],
      ...updatedFields,
      updatedAt: new Date().toLocaleDateString('zh-TW')
    };
    this.saveAdminAccounts(list);
    return list[idx];
  },
  deleteAdminAccount(id) {
    const list = this.getAdminAccounts();
    if (list.length <= 1) return false; // \u9632\u5446\uff1a\u81f3\u5c11\u4fdd\u7559\u4e00\u500b\u5e33\u865f
    const newList = list.filter(a => a.id !== id);
    this.saveAdminAccounts(newList);
    return true;
  },
  getAdminCredentials() {
    return { username: 'admin', passcode: 'admin123' };
  },
  authenticateAdmin(username, passcode) {
    const list = this.getAdminAccounts();
    const targetUser = (username || '').trim();
    const targetPass = (passcode || '').trim();
    const match = list.find(a => a.username === targetUser && a.passcode === targetPass);
    if (match) return match;
    const legacy = (typeof this.getAdminCredentials === 'function') ? this.getAdminCredentials() : { username: 'admin', passcode: 'admin123' };
    if (legacy && targetUser === legacy.username && targetPass === legacy.passcode) {
      return { id: 'acc_master', username: legacy.username, passcode: legacy.passcode, role: 'super_admin', name: '\u7cfb\u7d71\u7ba1\u7406\u54e1' };
    }
    return null;
  },
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
    if (typeof firebase === 'undefined' && window.FitnessFirebase.ensureFirebaseSDK) {
      await window.FitnessFirebase.ensureFirebaseSDK();
    }
    if (!window.FitnessFirebase.isFirebaseActive) {
      const ok = window.FitnessFirebase.init();
      if (!ok) return { success: false, message: 'Firebase \u5c1a\u672a\u6b63\u78ba\u9023\u7dda\uff0c\u8acb\u6aa2\u67e5 API Key \u8207\u7db2\u8def' };
    }
    try {
      const students = this.getStudents();
      const records = this.getFitnessRecords();
      const announcements = this.getAnnouncements();
      const logs = this.getLogs();
      const settings = this.settings;
      await window.FitnessFirebase.saveCollection('students', students);
      await window.FitnessFirebase.saveCollection('records', records);
      await window.FitnessFirebase.saveCollection('announcements', announcements);
      await window.FitnessFirebase.saveCollection('logs', logs);
      await window.FitnessFirebase.saveCollection('settings', settings);
      return {
        success: true,
        studentCount: students.length,
        recordCount: records.length,
        annCount: announcements.length,
        logCount: logs.length
      };
    } catch (err) {
      console.error('Firebase \u5168\u91cf\u63a8\u64ad\u5931\u6557:', err);
      const isPermErr = /permission|\u6b0a\u9650/i.test(String(err.message || '')) || /permission-denied/i.test(String(err.code || ''));
      return { 
        success: false, 
        message: isPermErr 
          ? 'Firebase \u6b0a\u9650\u88ab\u62d2\uff01\u8acb\u524d\u5f80 Firebase Console \u9801\u7c64\u5c07\u3010\u898f\u5247 Rules\u3011\u8a2d\u7f6e\u70ba allow read, write: if true; \u4e26\u9ede\u64ca\u300c\u767c\u5e03 Publish\u300d' 
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
    const nowTs = Date.now();
    this.cache.students = students;
    this.notify();
    if (this.isIndexedDBActive) {
      FitnessIDB.setItem(this.STORAGE_KEYS.STUDENTS, students).catch(err => {
        console.error('IndexedDB saveStudents \u5931\u6557:', err);
      });
      FitnessIDB.setItem(this.STORAGE_KEYS.STUDENTS + '_TS', nowTs);
    }
    try {
      localStorage.setItem(this.STORAGE_KEYS.STUDENTS, JSON.stringify(students));
      localStorage.setItem(this.STORAGE_KEYS.STUDENTS + '_TS', nowTs.toString());
    } catch (e) {
      console.warn('\u26a0\ufe0f LocalStorage \u5df2\u9054 5MB \u4e0a\u9650\uff0c\u5df2\u6539\u70ba\u5168\u91cf\u5beb\u5165 IndexedDB \u5927\u5bb9\u91cf\u8cc7\u6599\u5eab\u3002');
    }
    if (window.FitnessFirebase) {
      window.FitnessFirebase.saveCollection('students', students).then(() => {
        console.log('\ud83d\udd25 \u5b78\u751f\u4e3b\u6a94\u5df2\u6210\u529f\u5207\u5206\u4e26\u540c\u6b65\u4e0a\u50b3\u81f3 Cloud Firebase\uff01');
      }).catch(err => {
        console.warn('\u26a0\ufe0f \u5b78\u751f\u4e3b\u6a94 Firebase \u4e0a\u50b3\u53d7\u963b (\u53ef\u80fd Firebase Rules \u8a2d\u70ba\u552f\u8b80):', err);
      });
    }
  },
  updateStudent(studentId, updatedFields, operatorName = '\u7ba1\u7406\u54e1') {
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
  bulkUpdateStatus(studentIds, newStatus, specialIdentity = '', notes = '', operatorName = '\u7ba1\u7406\u54e1') {
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
    const nowTs = Date.now();
    this.cache.testRecords = records;
    this.notify();
    if (this.isIndexedDBActive) {
      FitnessIDB.setItem(this.STORAGE_KEYS.TEST_RECORDS, records).catch(err => {
        console.error('IndexedDB saveFitnessRecords \u5931\u6557:', err);
      });
      FitnessIDB.setItem(this.STORAGE_KEYS.TEST_RECORDS + '_TS', nowTs);
    }
    try {
      localStorage.setItem(this.STORAGE_KEYS.TEST_RECORDS, JSON.stringify(records));
      localStorage.setItem(this.STORAGE_KEYS.TEST_RECORDS + '_TS', nowTs.toString());
    } catch (e) {
      console.warn('\u26a0\ufe0f LocalStorage \u5df2\u9054\u5bb9\u91cf\u4e0a\u9650\uff0c\u9ad4\u9069\u80fd\u6aa2\u6e2c\u7d00\u9304\u5df2\u5168\u91cf\u5beb\u5165 IndexedDB\u3002');
    }
    if (window.FitnessFirebase) {
      window.FitnessFirebase.saveCollection('records', records).then(() => {
        console.log('\ud83d\udd25 \u6aa2\u6e2c\u7d00\u9304\u5df2\u6210\u529f\u540c\u6b65\u4e0a\u50b3\u81f3 Cloud Firebase\uff01');
      }).catch(err => {
        console.warn('\u26a0\ufe0f \u6aa2\u6e2c\u7d00\u9304 Firebase \u4e0a\u50b3\u53d7\u963b:', err);
      });
    }
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
  updateFitnessRecord(studentId, semester, updatedData, operatorName = '\u7ba1\u7406\u54e1') {
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
  deleteFitnessRecord(studentId, semester, operatorName = '\u7ba1\u7406\u54e1') {
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
    const student = this.getStudentById(studentId);
    if (!student) return;
    const records = this.getFitnessRecords(studentId);
    const newSemesters = {};
    records.forEach(r => {
      const isPassedStatus = r.status === '\u5408\u683c' || r.status === '\u514d\u6e2c' || r.isPassed === true;
      newSemesters[r.semester] = isPassedStatus ? 1 : 0;
    });
    let semPassSum = 0;
    Object.values(newSemesters).forEach(val => {
      if (Number(val) === 1) semPassSum += 1;
    });
    let transferAdd = Number(student.transferCredit || 0);
    let exemptAdd = Number(student.exemptCredit || 0);
    const isExempt = (Number(student.isExemptAthleteOrDisabled) > 0) || (exemptAdd > 0) || /\u514d\u6e2c|\u8eab\u969c|\u9ad4\u4fdd/.test(student.specialIdentity || '');
    let totalPass = semPassSum + transferAdd + exemptAdd;
    const reqPass = this.settings.requiredPassCount || 2;
    let newStatus = student.status;
    let deficitCount = 0;
    if (isExempt) {
      newStatus = '\u901a\u904e';
      deficitCount = 0;
    } else if (student.manualStatusOverride) {
      newStatus = student.manualStatusOverride;
      deficitCount = newStatus === '\u901a\u904e' ? 0 : Math.max(0, reqPass - totalPass);
    } else {
      newStatus = totalPass >= reqPass ? '\u901a\u904e' : '\u4e0d\u901a\u904e';
      deficitCount = newStatus === '\u901a\u904e' ? 0 : Math.max(0, reqPass - totalPass);
    }
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
    if (window.AdminPortal && window.AdminPortal.currentAdminUser && window.AdminPortal.currentAdminUser.name) {
      return window.AdminPortal.currentAdminUser.name;
    }
    try {
      const stored = localStorage.getItem('CURRENT_ADMIN_USER');
      if (stored) {
        const u = JSON.parse(stored);
        if (u && u.name) return u.name;
      }
    } catch(e) {}
    return '\u8521\u96e8\u946b';
  },
  addAuditLog(logEntry) {
    const logs = this.getLogs();
    const currentOp = this.getCurrentOperatorName();
    const activeOperator = (logEntry && logEntry.operator && logEntry.operator !== '\u7ba1\u7406\u54e1') 
      ? logEntry.operator 
      : currentOp;
    const newLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString(),
      operator: activeOperator,
      action: logEntry ? (logEntry.action || '\u7cfb\u7d71\u8b8a\u66f4') : '\u7cfb\u7d71\u8b8a\u66f4',
      studentId: logEntry ? (logEntry.studentId || '-') : '-',
      details: logEntry ? (logEntry.details || '') : ''
    };
    logs.unshift(newLog);
    if (logs.length > 300) logs.pop();
    this.saveLogs(logs);
  },
  getLogs() {
    if (this.cache.logs !== null) {
      return this.cache.logs;
    }
    let list = [];
    try {
      const raw = localStorage.getItem(this.STORAGE_KEYS.LOGS);
      list = raw ? JSON.parse(raw) : [];
    } catch (e) {
      list = [];
    }
    const currentOp = this.getCurrentOperatorName();
    list = list.map(l => {
      if (!l.operator || l.operator === '\u7ba1\u7406\u54e1') {
        return { ...l, operator: currentOp };
      }
      return l;
    });
    this.cache.logs = list;
    return list;
  },
  saveLogs(logs) {
    this.cache.logs = logs;
    if (this.isIndexedDBActive) {
      FitnessIDB.setItem(this.STORAGE_KEYS.LOGS, logs).catch(err => {
        console.error('IndexedDB saveLogs \u5931\u6557:', err);
      });
    }
    if (window.FitnessFirebase && window.FitnessFirebase.isFirebaseActive) {
      window.FitnessFirebase.saveCollection('logs', logs);
    }
    try {
      localStorage.setItem(this.STORAGE_KEYS.LOGS, JSON.stringify(logs));
    } catch (e) {}
  },
  clearAllData() {
    this.cache.students = [];
    this.cache.testRecords = [];
    this.cache.logs = [];
    if (this.isIndexedDBActive) {
      FitnessIDB.clear().catch(err => console.error('IndexedDB clear \u5931\u6557:', err));
    }
    try {
      localStorage.removeItem(this.STORAGE_KEYS.STUDENTS);
      localStorage.removeItem(this.STORAGE_KEYS.TEST_RECORDS);
      localStorage.removeItem(this.STORAGE_KEYS.LOGS);
    } catch (e) {}
    this.selectedStudentIds.clear();
    this.init();
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