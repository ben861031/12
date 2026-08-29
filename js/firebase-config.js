import { getApp, getApps, initializeApp } from './vendor/firebase/firebase-app.js';
import {
  EmailAuthProvider,
  browserSessionPersistence,
  getAuth,
  getIdTokenResult,
  onAuthStateChanged,
  reauthenticateWithCredential,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updatePassword
} from './vendor/firebase/firebase-auth.js';
window.FitnessFirebase = {
  app: null,
  auth: null,
  isFirebaseActive: false,
  configKey: 'FITNESS_FIREBASE_CONFIG_V2',
  databaseId: 'fitness',
  loginAliasDomain: 'fitness-admin.local',
  functionsRegion: 'asia-east1',
  currentAdminProfile: null,
  defaultConfig: {
    apiKey: 'AIzaSyCzvPwTbxc_Lg7peKRgP0zUrlmI6kkE0b4',
    authDomain: 'seal-management-68465.firebaseapp.com',
    projectId: 'seal-management-68465',
    storageBucket: 'seal-management-68465.firebasestorage.app',
    messagingSenderId: '933578260928',
    appId: '1:933578260928:web:fc147363ced2ae69bf0825',
    measurementId: 'G-YB5HD04CK4'
  },
  getConfig() {
    try {
      const saved = localStorage.getItem(this.configKey);
      return saved ? { ...this.defaultConfig, ...JSON.parse(saved) } : this.defaultConfig;
    } catch (e) {
      return this.defaultConfig;
    }
  },
  saveConfig(config) {
    if (!config || !config.apiKey || !config.projectId) {
      localStorage.removeItem(this.configKey);
      return false;
    }
    localStorage.setItem(this.configKey, JSON.stringify({
      ...this.defaultConfig,
      ...config,
      authDomain: config.authDomain || `${config.projectId}.firebaseapp.com`
    }));
    return true;
  },
  init() {
    if (this.isFirebaseActive && this.auth) return true;
    const config = this.getConfig();
    if (!config?.apiKey || !config?.projectId) {
      this.isFirebaseActive = false;
      console.warn('Firebase \u8a2d\u5b9a\u5c1a\u672a\u5b8c\u6210\uff0c\u7cfb\u7d71\u505c\u7559\u5728\u5b89\u5168\u96e2\u7dda\u6a21\u5f0f\u3002');
      return false;
    }
    try {
      this.app = getApps().length ? getApp() : initializeApp(config);
      this.auth = getAuth(this.app);
      setPersistence(this.auth, browserSessionPersistence).catch((err) => {
        console.warn('\u7121\u6cd5\u8a2d\u5b9a Firebase \u5de5\u4f5c\u968e\u6bb5\u4fdd\u5b58\u65b9\u5f0f\u3002', err);
      });
      this.isFirebaseActive = true;
      return true;
    } catch (err) {
      console.warn('Firebase Authentication \u521d\u59cb\u5316\u5931\u6557\u3002', err);
      this.isFirebaseActive = false;
      this.auth = null;
      return false;
    }
  },
  get databaseRoot() {
    const projectId = encodeURIComponent(this.getConfig().projectId);
    const databaseId = encodeURIComponent(this.databaseId);
    return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents`;
  },
  _path(path) {
    return String(path || '').split('/').filter(Boolean).map(encodeURIComponent).join('/');
  },
  _documentName(path) {
    return `${this.databaseRoot.replace('https://firestore.googleapis.com/v1/', '')}/${this._path(path)}`;
  },
  async _headers(requireAdmin = false) {
    const headers = { 'Content-Type': 'application/json' };
    if (requireAdmin) {
      await this.requireAdmin();
      headers.Authorization = `Bearer ${await this.auth.currentUser.getIdToken()}`;
    }
    return headers;
  },
  async _request(url, options = {}, requireAdmin = false) {
    const response = await fetch(url, {
      ...options,
      headers: { ...(await this._headers(requireAdmin)), ...(options.headers || {}) }
    });
    if (response.status === 404) return null;
    if (!response.ok) {
      let detail = '';
      try {
        detail = (await response.json())?.error?.message || '';
      } catch (e) {
        detail = await response.text().catch(() => '');
      }
      const error = new Error(detail || `Firestore \u8acb\u6c42\u5931\u6557 (${response.status})`);
      error.status = response.status;
      throw error;
    }
    return response.status === 204 ? null : response.json();
  },
  _toValue(value) {
    if (value === null || value === undefined) return { nullValue: null };
    if (typeof value === 'string') return { stringValue: value };
    if (typeof value === 'boolean') return { booleanValue: value };
    if (typeof value === 'number') {
      if (!Number.isFinite(value)) return { nullValue: null };
      return Number.isInteger(value)
        ? { integerValue: String(value) }
        : { doubleValue: value };
    }
    if (Array.isArray(value)) {
      return { arrayValue: { values: value.map((item) => this._toValue(item)) } };
    }
    if (typeof value === 'object') {
      const fields = {};
      Object.entries(value).forEach(([key, item]) => {
        if (item !== undefined) fields[key] = this._toValue(item);
      });
      return { mapValue: { fields } };
    }
    return { stringValue: String(value) };
  },
  _fromValue(value) {
    if (!value || 'nullValue' in value) return null;
    if ('stringValue' in value) return value.stringValue;
    if ('booleanValue' in value) return value.booleanValue;
    if ('integerValue' in value) return Number(value.integerValue);
    if ('doubleValue' in value) return Number(value.doubleValue);
    if ('timestampValue' in value) return value.timestampValue;
    if ('arrayValue' in value) return (value.arrayValue.values || []).map((item) => this._fromValue(item));
    if ('mapValue' in value) return this._decodeFields(value.mapValue.fields || {});
    return null;
  },
  _encodeFields(data) {
    const fields = {};
    Object.entries(data || {}).forEach(([key, value]) => {
      if (value !== undefined) fields[key] = this._toValue(value);
    });
    return fields;
  },
  _decodeFields(fields) {
    const data = {};
    Object.entries(fields || {}).forEach(([key, value]) => {
      data[key] = this._fromValue(value);
    });
    return data;
  },
  async _getDocument(path, requireAdmin = false) {
    const result = await this._request(`${this.databaseRoot}/${this._path(path)}`, {}, requireAdmin);
    return result ? this._decodeFields(result.fields || {}) : null;
  },
  async _listDocuments(collectionPath) {
    await this.requireAdmin();
    const documents = [];
    let pageToken = '';
    do {
      const query = new URLSearchParams({ pageSize: '1000' });
      if (pageToken) query.set('pageToken', pageToken);
      const result = await this._request(
        `${this.databaseRoot}/${this._path(collectionPath)}?${query}`,
        {},
        true
      );
      documents.push(...(result?.documents || []).map((item) => ({
        id: decodeURIComponent(item.name.split('/').pop()),
        data: this._decodeFields(item.fields || {})
      })));
      pageToken = result?.nextPageToken || '';
    } while (pageToken);
    return documents;
  },
  async _commitWrites(operations) {
    if (!operations.length) return true;
    const writes = operations.map((operation) => {
      const name = this._documentName(operation.path);
      if (operation.type === 'delete') return { delete: name };
      return { update: { name, fields: this._encodeFields(operation.data) } };
    });
    await this._request(`${this.databaseRoot}:commit`, {
      method: 'POST',
      body: JSON.stringify({ writes })
    }, true);
    return true;
  },
  onAuthStateChanged(callback) {
    if (!this.auth) this.init();
    if (!this.auth) {
      callback(null);
      return () => {};
    }
    return onAuthStateChanged(this.auth, callback);
  },
  async getAuthorizedAdmin(user = this.auth?.currentUser, forceRefresh = false) {
    if (!user) return null;
    const token = await getIdTokenResult(user, forceRefresh);
    const role = token.claims.role;
    const isAdmin = token.claims.admin === true || role === 'super_admin' || role === 'staff';
    if (!isAdmin) return null;
    const aliasSuffix = `@${this.loginAliasDomain}`;
    const visibleAccount = (user.email || '').endsWith(aliasSuffix)
      ? user.email.slice(0, -aliasSuffix.length)
      : (user.email || '');
    return {
      uid: user.uid,
      email: user.email || '',
      username: visibleAccount,
      name: user.displayName || token.claims.name || visibleAccount || '\u7ba1\u7406\u54e1',
      role: role === 'staff' ? 'staff' : 'super_admin'
    };
  },
  async callAdminAccounts(action, payload = {}) {
    const profile = await this.requireAdmin();
    if (profile.role !== 'super_admin') throw new Error('\u53ea\u6709\u7cfb\u7d71\u7ba1\u7406\u54e1\u53ef\u4ee5\u7ba1\u7406\u767d\u540d\u55ae');
    const config = this.getConfig();
    const endpoint = `https://${this.functionsRegion}-${config.projectId}.cloudfunctions.net/adminAccounts`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await this.auth.currentUser.getIdToken()}`
      },
      body: JSON.stringify({ data: { action, ...payload } })
    });
    let body = null;
    try {
      body = await response.json();
    } catch (error) {
      throw new Error(`\u767d\u540d\u55ae\u670d\u52d9\u56de\u61c9\u683c\u5f0f\u932f\u8aa4 (${response.status})`);
    }
    if (!response.ok || body?.error) {
      const message = body?.error?.message
        || (response.status === 404 ? '\u767d\u540d\u55ae\u670d\u52d9\u5c1a\u672a\u90e8\u7f72\uff0c\u8acb\u5148\u90e8\u7f72 Cloud Functions' : '')
        || `\u767d\u540d\u55ae\u670d\u52d9\u66ab\u6642\u7121\u6cd5\u4f7f\u7528 (${response.status})`;
      const error = new Error(message);
      error.code = body?.error?.status || response.status;
      throw error;
    }
    return body?.result ?? body?.data ?? body?.response ?? null;
  },
  async listAdminAccounts() {
    const result = await this.callAdminAccounts('list');
    return Array.isArray(result?.accounts) ? result.accounts : [];
  },
  async saveAdminAccount(account) {
    const result = await this.callAdminAccounts('save', account);
    return result?.account || null;
  },
  async signInAdmin(account, password) {
    if (!this.auth && !this.init()) throw new Error('Firebase Authentication \u5c1a\u672a\u555f\u7528');
    const normalizedAccount = String(account || '').trim().toLowerCase();
    const email = normalizedAccount.includes('@')
      ? normalizedAccount
      : `${normalizedAccount}@${this.loginAliasDomain}`;
    const credential = await signInWithEmailAndPassword(this.auth, email, password);
    const profile = await this.getAuthorizedAdmin(credential.user, true);
    if (!profile) {
      await signOut(this.auth);
      throw new Error('\u6b64\u5e33\u865f\u5c1a\u672a\u88ab\u6388\u4e88\u9ad4\u9069\u80fd\u7ba1\u7406\u6b0a\u9650');
    }
    this.currentAdminProfile = profile;
    return profile;
  },
  async signOut() {
    this.currentAdminProfile = null;
    if (this.auth) await signOut(this.auth);
  },
  async changeCurrentPassword(currentPassword, newPassword) {
    const user = this.auth?.currentUser;
    if (!user?.email) throw new Error('\u8acb\u91cd\u65b0\u767b\u5165\u5f8c\u518d\u4fee\u6539\u5bc6\u78bc');
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
    return true;
  },
  async requireAdmin() {
    const profile = await this.getAuthorizedAdmin(this.auth?.currentUser);
    if (!profile) throw new Error('\u9700\u8981\u5df2\u6388\u6b0a\u7684 Firebase \u7ba1\u7406\u54e1\u8eab\u5206');
    this.currentAdminProfile = profile;
    return profile;
  },
  async _loadDocumentData(key, requireAdmin = true) {
    const meta = await this._getDocument(`fitness_data/${key}`, requireAdmin);
    if (!meta) return null;
    if (meta.isChunked && Number(meta.totalParts) > 0) {
      let allData = [];
      for (let i = 1; i <= Number(meta.totalParts); i += 1) {
        const partData = await this._getDocument(`fitness_data/${key}_part_${i}`, requireAdmin);
        if (Array.isArray(partData?.data)) allData = allData.concat(partData.data);
      }
      return allData;
    }
    return meta.data ?? null;
  },
  async loadPublicAnnouncements() {
    if (!this.isFirebaseActive && !this.init()) return null;
    try {
      return await this._loadDocumentData('announcements', false);
    } catch (err) {
      console.warn('\u516c\u958b\u516c\u544a\u8f09\u5165\u5931\u6557\u3002', err);
      return null;
    }
  },
  async loadStudentLookup(studentId) {
    const normalizedId = window.SafeUI?.studentId(studentId) || '';
    if (!normalizedId) return null;
    if (!this.isFirebaseActive && !this.init()) return null;
    try {
      return await this._getDocument(`student_lookup/${normalizedId}`, false);
    } catch (err) {
      console.warn('\u5b78\u751f\u55ae\u7b46\u67e5\u8a62\u5931\u6557\u3002', err);
      return null;
    }
  },
  async loadCollection(key) {
    if (key === 'announcements') return this.loadPublicAnnouncements();
    await this.requireAdmin();
    return this._loadDocumentData(key, true);
  },
  async _saveCollection(key, data) {
    const jsonStr = JSON.stringify(data);
    const nowIso = new Date().toISOString();
    const oldMeta = await this._getDocument(`fitness_data/${key}`, true);
    const oldParts = Number(oldMeta?.totalParts || 0);
    const parts = [];
    if (jsonStr.length > 700000 && Array.isArray(data)) {
      const partsNeeded = Math.ceil(jsonStr.length / 600000);
      const chunkSize = Math.ceil(data.length / partsNeeded);
      for (let i = 0; i < partsNeeded; i += 1) {
        parts.push(data.slice(i * chunkSize, (i + 1) * chunkSize));
      }
    }
    const operations = [];
    if (parts.length) {
      parts.forEach((part, index) => {
        operations.push({
          type: 'set',
          path: `fitness_data/${key}_part_${index + 1}`,
          data: { part: index + 1, totalParts: parts.length, updatedAt: nowIso, data: part }
        });
      });
      operations.push({
        type: 'set',
        path: `fitness_data/${key}`,
        data: { isChunked: true, totalParts: parts.length, totalCount: data.length, updatedAt: nowIso }
      });
    } else {
      operations.push({
        type: 'set',
        path: `fitness_data/${key}`,
        data: { isChunked: false, totalParts: 0, updatedAt: nowIso, data }
      });
    }
    for (let i = parts.length + 1; i <= oldParts; i += 1) {
      operations.push({ type: 'delete', path: `fitness_data/${key}_part_${i}` });
    }
    for (let start = 0; start < operations.length; start += 400) {
      await this._commitWrites(operations.slice(start, start + 400));
    }
    return true;
  },
  async saveCollection(key, data) {
    await this.requireAdmin();
    return this._saveCollection(key, data);
  },
  async saveChunkedData(key, data) {
    return this.saveCollection(key, data);
  },
  async publishStudentLookups(students, records) {
    await this.requireAdmin();
    const maskPublicName = (value) => {
      const name = String(value || '').trim();
      if (name.length <= 1) return name;
      if (name.length === 2) return `${name[0]}\u3007`;
      return `${name[0]}\u3007${name.slice(2)}`;
    };
    const recordMap = new Map();
    (records || []).forEach((record) => {
      const id = window.SafeUI?.studentId(record.studentId);
      if (!id) return;
      if (!recordMap.has(id)) recordMap.set(id, []);
      recordMap.get(id).push(record);
    });
    const recordsForStudent = (student, currentId) => {
      const recordsBySemester = new Map();
      (recordMap.get(currentId) || []).forEach(record => {
        recordsBySemester.set(String(record.semester || '').trim(), record);
      });
      const carryovers = Array.isArray(student.recordCarryovers)
        ? student.recordCarryovers.filter(link => link && link.active !== false && link.sourceStudentId)
        : [];
      carryovers.forEach(link => {
        const sourceId = window.SafeUI?.studentId(link.sourceStudentId);
        if (!sourceId) return;
        const allowedSemesters = new Set((link.semesters || []).map(value => String(value).trim()));
        (recordMap.get(sourceId) || []).forEach(record => {
          const semester = String(record.semester || '').trim();
          if (!allowedSemesters.has(semester) || recordsBySemester.has(semester)) return;
          recordsBySemester.set(semester, record);
        });
      });
      return Array.from(recordsBySemester.values()).map(record => {
        const scores = record?.scores || {};
        return {
          studentId: currentId,
          semester: String(record?.semester || '').trim(),
          isPassed: record?.isPassed === true || ['\u5408\u683c', '\u514d\u6e2c'].includes(String(record?.status || '').trim()),
          scores: {
            sitAndReach: scores.sitAndReach ?? '-',
            standingLongJump: scores.standingLongJump ?? '-',
            sitUps: scores.sitUps ?? '-',
            cardio: scores.cardio ?? '-'
          }
        };
      });
    };
    const entries = (students || []).map((student) => {
      const id = window.SafeUI?.studentId(student.studentId);
      if (!id || student.lookupDisabled === true) return null;
      const publicStudent = {
        studentId: id,
        name: maskPublicName(student.name),
        className: student.className || '',
        enrollYear: student.enrollYear || '',
        status: student.status || '',
        passCount: Number(student.passCount || 0),
        semesters: student.semesters || {},
        isTransfer: Number(student.isTransfer || 0),
        transferCredit: Number(student.transferCredit || 0)
      };
      return [id, {
        student: publicStudent,
        records: recordsForStudent(student, id),
        publishedAt: new Date().toISOString()
      }];
    }).filter(Boolean);
    const existing = await this._listDocuments('student_lookup');
    const activeIds = new Set(entries.map(([id]) => id));
    const operations = entries.map(([id, data]) => ({ type: 'set', path: `student_lookup/${id}`, data }));
    existing.forEach((lookupDoc) => {
      if (!activeIds.has(lookupDoc.id)) {
        operations.push({ type: 'delete', path: `student_lookup/${lookupDoc.id}` });
      }
    });
    for (let start = 0; start < operations.length; start += 400) {
      await this._commitWrites(operations.slice(start, start + 400));
    }
    return { success: true, count: entries.length };
  }
};
window.FitnessFirebase.init();
