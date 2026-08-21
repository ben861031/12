window.FitnessFirebase = {
  db: null,
  isFirebaseActive: false,
  configKey: 'FITNESS_FIREBASE_CONFIG',
  defaultConfig: {
    apiKey: "AIzaSyCzvPwTbxc_Lg7peKRgP0zUrlmI6kkE0b4",
    authDomain: "seal-management-68465.firebaseapp.com",
    projectId: "seal-management-68465",
    storageBucket: "seal-management-68465.firebasestorage.app",
    messagingSenderId: "933578260928",
    appId: "1:933578260928:web:fc147363ced2ae69bf0825",
    measurementId: "G-YB5HD04CK4"
  },
  getConfig() {
    try {
      const saved = localStorage.getItem(this.configKey);
      return saved ? JSON.parse(saved) : this.defaultConfig;
    } catch (e) {
      return this.defaultConfig;
    }
  },
  saveConfig(config) {
    if (!config || !config.apiKey || !config.projectId) {
      localStorage.removeItem(this.configKey);
      this.isFirebaseActive = false;
      this.db = null;
      return false;
    }
    localStorage.setItem(this.configKey, JSON.stringify(config));
    return this.init();
  },
  async ensureFirebaseSDK() {
    if (typeof firebase !== 'undefined' && firebase.auth) return true;
    return new Promise((resolve) => {
      const scriptApp = document.createElement('script');
      scriptApp.src = 'https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js';
      scriptApp.onload = () => {
        const scriptDb = document.createElement('script');
        scriptDb.src = 'https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js';
        scriptDb.onload = () => {
          const scriptAuth = document.createElement('script');
          scriptAuth.src = 'https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js';
          scriptAuth.onload = () => resolve(true);
          scriptAuth.onerror = () => resolve(true);
          document.head.appendChild(scriptAuth);
        };
        scriptDb.onerror = () => resolve(false);
        document.head.appendChild(scriptDb);
      };
      scriptApp.onerror = () => resolve(false);
      document.head.appendChild(scriptApp);
    });
  },
  init() {
    const config = this.getConfig();
    if (!config || !config.apiKey) {
      console.log('\ud83d\udca1 \u672a\u8a2d\u5b9a Firebase \u91d1\u9470\uff0c\u4f7f\u7528 LocalStorage / IndexedDB \u6a21\u5f0f');
      this.isFirebaseActive = false;
      this.db = null;
      return false;
    }
    if (typeof firebase === 'undefined') {
      console.warn('\u26a0\ufe0f Firebase SDK \u5c1a\u672a\u52a0\u8f09\u5b8c\u6210\uff0c\u5617\u8a66\u767c\u8d77\u81ea\u52d5\u7570\u6b65\u8f09\u5165...');
      this.ensureFirebaseSDK().then(ok => {
        if (ok && typeof firebase !== 'undefined') {
          this.init();
          if (window.App) window.App.updateFirebaseBadge();
        }
      });
      this.isFirebaseActive = false;
      this.db = null;
      return false;
    }
    try {
      const app = !firebase.apps.length ? firebase.initializeApp(config) : firebase.app();
      if (firebase.auth && !firebase.auth().currentUser) {
        firebase.auth().signInAnonymously().catch(err => {
          console.log('Firebase \u975c\u9ed8\u8a8d\u8b49\u63d0\u793a (\u5982\u672a\u555f\u7528\u533f\u540d\u767b\u5165\u53ef\u5ffd\u7565):', err.message);
        });
      }
      try {
        this._fitnessDb = app.firestore('fitness');
      } catch (e1) {
        this._fitnessDb = null;
      }
      try {
        this._defaultDb = firebase.firestore();
      } catch (e2) {
        this._defaultDb = null;
      }
      this.db = this._fitnessDb || this._defaultDb;
      this.isFirebaseActive = true;
      console.log('\ud83d\udd25 \u6210\u529f\u521d\u59cb\u5316 Firebase \u96d9\u91cd\u8cc7\u6599\u5eab\u5099\u4efd\u5f15\u64ce\uff01');
      return true;
    } catch (err) {
      console.warn('\u26a0\ufe0f Firebase \u521d\u59cb\u5316\u5931\u6557\uff0c\u5207\u56de LocalStorage/IndexedDB \u6a21\u5f0f:', err);
      this.isFirebaseActive = false;
      this.db = null;
      return false;
    }
  },
  async _doSaveCollection(dbInstance, key, data) {
    if (!dbInstance) return false;
    const jsonStr = JSON.stringify(data);
    const nowIso = new Date().toISOString();
    if (jsonStr.length > 700000 && Array.isArray(data)) {
      const partsNeeded = Math.ceil(jsonStr.length / 600000);
      const chunkSize = Math.ceil(data.length / partsNeeded);
      const batch = dbInstance.batch();
      for (let i = 0; i < partsNeeded; i++) {
        const chunkData = data.slice(i * chunkSize, (i + 1) * chunkSize);
        const docRef = dbInstance.collection('fitness_data').doc(`${key}_part_${i + 1}`);
        batch.set(docRef, {
          part: i + 1,
          totalParts: partsNeeded,
          updatedAt: nowIso,
          data: chunkData
        });
      }
      const metaRef = dbInstance.collection('fitness_data').doc(key);
      batch.set(metaRef, {
        isChunked: true,
        totalParts: partsNeeded,
        totalCount: data.length,
        updatedAt: nowIso
      });
      await batch.commit();
      console.log(`\ud83d\udd25 [${key}] \u81ea\u52d5\u5207\u5206\u6210 ${partsNeeded} \u500b\u5206\u5377\u6587\u6a94\u4e0a\u50b3 Firebase \u6210\u529f\uff01`);
    } else {
      await dbInstance.collection('fitness_data').doc(key).set({
        isChunked: false,
        updatedAt: nowIso,
        data: data
      });
    }
    return true;
  },
  async saveCollectionREST(dbName, key, data) {
    const config = this.getConfig();
    if (!config || !config.projectId || !config.apiKey) return false;
    const jsonStr = JSON.stringify(data);
    const nowIso = new Date().toISOString();
    if (jsonStr.length > 700000 && Array.isArray(data)) {
      const partsNeeded = Math.ceil(jsonStr.length / 600000);
      const chunkSize = Math.ceil(data.length / partsNeeded);
      for (let i = 0; i < partsNeeded; i++) {
        const chunkData = data.slice(i * chunkSize, (i + 1) * chunkSize);
        const docId = `${key}_part_${i + 1}`;
        const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${dbName}/documents/fitness_data/${docId}?key=${config.apiKey}`;
        const resp = await fetch(url, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fields: {
              part: { integerValue: i + 1 },
              totalParts: { integerValue: partsNeeded },
              updatedAt: { stringValue: nowIso },
              dataJson: { stringValue: JSON.stringify(chunkData) }
            }
          })
        });
        if (!resp.ok) {
          const errJson = await resp.json();
          throw new Error(errJson.error?.message || 'REST \u4e0a\u50b3\u5931\u6557');
        }
      }
      const metaUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${dbName}/documents/fitness_data/${key}?key=${config.apiKey}`;
      const metaResp = await fetch(metaUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            isChunked: { booleanValue: true },
            totalParts: { integerValue: partsNeeded },
            totalCount: { integerValue: data.length },
            updatedAt: { stringValue: nowIso }
          }
        })
      });
      if (!metaResp.ok) {
        const errJson = await metaResp.json();
        throw new Error(errJson.error?.message || 'REST Meta \u4e0a\u50b3\u5931\u6557');
      }
      console.log(`\ud83d\udd25 REST \u901a\u9053\u76f4\u9023\u6210\u529f\uff01[${key}] \u5df2\u5099\u4efd\u81f3 Firebase \u96f2\u7aef (${dbName})`);
      return true;
    } else {
      const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${dbName}/documents/fitness_data/${key}?key=${config.apiKey}`;
      const resp = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            isChunked: { booleanValue: false },
            updatedAt: { stringValue: nowIso },
            dataJson: { stringValue: jsonStr }
          }
        })
      });
      if (!resp.ok) {
        const errJson = await resp.json();
        throw new Error(errJson.error?.message || 'REST API \u5beb\u5165\u5931\u6557');
      }
      console.log(`\ud83d\udd25 REST \u901a\u9053\u76f4\u9023\u6210\u529f\uff01[${key}] \u5df2\u5099\u4efd\u81f3 Firebase \u96f2\u7aef (${dbName})`);
      return true;
    }
  },
  async loadCollectionREST(dbName, key) {
    const config = this.getConfig();
    if (!config || !config.projectId || !config.apiKey) return null;
    try {
      const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${dbName}/documents/fitness_data/${key}?key=${config.apiKey}`;
      const resp = await fetch(url);
      if (!resp.ok) return null;
      const json = await resp.json();
      const fields = json.fields || {};
      if (fields.isChunked && fields.isChunked.booleanValue) {
        const totalParts = fields.totalParts ? Number(fields.totalParts.integerValue || 0) : 0;
        let allData = [];
        for (let i = 1; i <= totalParts; i++) {
          const partUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${dbName}/documents/fitness_data/${key}_part_${i}?key=${config.apiKey}`;
          const partResp = await fetch(partUrl);
          if (partResp.ok) {
            const partJson = await partResp.json();
            const partStr = partJson.fields?.dataJson?.stringValue;
            if (partStr) {
              allData = allData.concat(JSON.parse(partStr));
            }
          }
        }
        return allData;
      } else if (fields.dataJson && fields.dataJson.stringValue) {
        return JSON.parse(fields.dataJson.stringValue);
      }
      return null;
    } catch (e) {
      return null;
    }
  },
  async saveCollection(key, data) {
    if (!this.isFirebaseActive) return false;
    try {
      return await this._doSaveCollection(this.db, key, data);
    } catch (e1) {
      console.warn(`SDK \u4e3b\u9023\u7dda\u672a\u901a\u904e\uff0c\u81ea\u52d5\u555f\u52d5 HTTP REST \u901a\u9053 (fitness)...`, e1);
      try {
        return await this.saveCollectionREST('fitness', key, data);
      } catch (e2) {
        try {
          return await this.saveCollectionREST('(default)', key, data);
        } catch (e3) {
          throw e1;
        }
      }
    }
  },
  async saveChunkedData(key, data) {
    return await this.saveCollection(key, data);
  },
  async _doLoadCollection(dbInstance, key) {
    if (!dbInstance) return null;
    const doc = await dbInstance.collection('fitness_data').doc(key).get();
    if (!doc.exists) return null;
    const meta = doc.data();
    if (meta.isChunked && meta.totalParts) {
      let allData = [];
      for (let i = 1; i <= meta.totalParts; i++) {
        const partDoc = await dbInstance.collection('fitness_data').doc(`${key}_part_${i}`).get();
        if (partDoc.exists && partDoc.data() && partDoc.data().data) {
          allData = allData.concat(partDoc.data().data);
        }
      }
      return allData;
    }
    return meta.data || null;
  },
  async loadCollection(key) {
    if (!this.isFirebaseActive) return null;
    try {
      const res = await this._doLoadCollection(this.db, key);
      if (res !== null) return res;
    } catch (e1) {}
    try {
      const restFitness = await this.loadCollectionREST('fitness', key);
      if (restFitness !== null) return restFitness;
    } catch (e2) {}
    try {
      const restDefault = await this.loadCollectionREST('(default)', key);
      if (restDefault !== null) return restDefault;
    } catch (e3) {}
    return null;
  }
};
document.addEventListener('DOMContentLoaded', () => {
  window.FitnessFirebase.init();
});