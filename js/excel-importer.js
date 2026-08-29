window.FitnessImporter = {
  normalizeRosterStatus(status, fallback = '\u5728\u5b78') {
    const value = String(status || '').trim();
    if (!value) return fallback;
    return value === '\u5728\u5b78' ? '\u5728\u5b78' : '\u975e\u5728\u5b78';
  },
  isMaskedName(name) {
    if (!name || typeof name !== 'string') return false;
    return /[O\u25cb*o]/.test(name.trim());
  },
  isNameMatching(storedName, excelName) {
    if (!storedName || !excelName) return false;
    const s = String(storedName).trim();
    const e = String(excelName).trim();
    if (s === e) return true;
    const isExcelMasked = this.isMaskedName(e);
    const isStoredMasked = this.isMaskedName(s);
    if (isExcelMasked || isStoredMasked) {
      if (s.length === e.length && s.length >= 2) {
        if (s[0] === e[0] && s[s.length - 1] === e[e.length - 1]) {
          return true;
        }
      }
    }
    return false;
  },
  resolveIdentityColumns(bodyRows, idIdx, nameIdx, classIdx, studentMap) {
    if (nameIdx === classIdx) {
      throw new Error('\u7121\u6cd5\u8fa8\u8b58\u59d3\u540d\u8207\u73ed\u7d1a\u6b04\u4f4d\uff0c\u8acb\u78ba\u8a8d Excel \u6a19\u984c\u5217\u5305\u542b\u300c\u5b78\u865f\u3001\u59d3\u540d\u3001\u73ed\u7d1a\u300d');
    }
    let normalNameMatches = 0;
    let swappedNameMatches = 0;
    let comparableRows = 0;
    for (const row of bodyRows.slice(0, 300)) {
      const values = row.map(v => String(v ?? '').trim());
      const studentId = values[idIdx];
      const existingStudent = studentMap.get(studentId);
      if (!existingStudent?.name) continue;
      comparableRows++;
      if (this.isNameMatching(existingStudent.name, values[nameIdx])) normalNameMatches++;
      if (this.isNameMatching(existingStudent.name, values[classIdx])) swappedNameMatches++;
    }
    const shouldSwap = comparableRows >= 3
      && swappedNameMatches >= 3
      && swappedNameMatches >= normalNameMatches + 2
      && swappedNameMatches / comparableRows >= 0.5;
    return {
      nameIdx: shouldSwap ? classIdx : nameIdx,
      classIdx: shouldSwap ? nameIdx : classIdx,
      autoCorrected: shouldSwap,
      comparableRows,
      normalNameMatches,
      swappedNameMatches
    };
  },
  async scanRosterExcel(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const workbook = XLSX.read(e.target.result, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[firstSheetName];
          const jsonRows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
          if (!jsonRows || jsonRows.length === 0) {
            return reject('\u4e0a\u50b3\u7684 Excel \u6a94\u6848\u5167\u7121\u6709\u6548\u5b78\u751f\u6578\u64da');
          }
          const allKeys = [...new Set(jsonRows.flatMap(row => Object.keys(row)))];
          const compactKey = key => String(key || '').replace(/\s+/g, '');
          const idKey = allKeys.find(k => compactKey(k).includes('\u5b78\u865f') || compactKey(k).toLowerCase().includes('id'));
          const nameKey = allKeys.find(k => compactKey(k).includes('\u59d3\u540d') || compactKey(k).includes('\u540d\u5b57') || compactKey(k).toLowerCase().includes('name'));
          const classKey = allKeys.find(k => compactKey(k).includes('\u73ed\u7d1a'));
          const enrollYearKey = allKeys.find(k => compactKey(k).includes('\u5165\u5b78\u5e74'));
          const admissionKey = allKeys.find(k => compactKey(k).includes('\u5165\u5b78\u65b9\u5f0f'));
          const identityKey = allKeys.find(k => compactKey(k) === '\u8eab\u5206' || compactKey(k).includes('\u8eab\u4efd'));
          const rosterStatusKey = allKeys.find(k => compactKey(k).includes('\u5b78\u7c4d\u72c0\u614b'));
          if (!idKey || !nameKey || !classKey) {
            return reject('\u7121\u6cd5\u8fa8\u8b58\u5fc5\u8981\u6b04\u4f4d\uff0c\u8acb\u78ba\u8a8d Excel \u6a19\u984c\u5217\u5305\u542b\u300c\u5b78\u865f\u3001\u59d3\u540d\u3001\u73ed\u7d1a\u300d');
          }
          const existingStudents = window.FitnessStore.getStudents();
          const studentMap = new Map(existingStudents.map(s => [String(s.studentId).trim(), s]));
          let normalNameMatches = 0;
          let swappedNameMatches = 0;
          let comparableRows = 0;
          jsonRows.slice(0, 300).forEach(row => {
            const studentId = String(row[idKey] ?? '').trim();
            const existing = studentMap.get(studentId);
            if (!existing?.name) return;
            comparableRows++;
            if (this.isNameMatching(existing.name, String(row[nameKey] ?? '').trim())) normalNameMatches++;
            if (this.isNameMatching(existing.name, String(row[classKey] ?? '').trim())) swappedNameMatches++;
          });
          const identityColumnsAutoCorrected = comparableRows >= 3
            && swappedNameMatches >= 3
            && swappedNameMatches >= normalNameMatches + 2
            && swappedNameMatches / comparableRows >= 0.5;
          const issues = [];
          const itemMap = new Map();
          let skippedCount = 0;
          let duplicateCount = 0;
          jsonRows.forEach((row, index) => {
            const rowNum = index + 2;
            const studentId = String(row[idKey] ?? '').trim();
            if (!studentId) {
              skippedCount++;
              issues.push({ level: 'warning', type: '\u7f3a\u5c11\u5b78\u865f', rowNum, studentId: '', detail: '\u6b64\u5217\u4e0d\u6703\u532f\u5165' });
              return;
            }
            if (!/^\d{6,12}$/.test(studentId)) {
              skippedCount++;
              issues.push({ level: 'danger', type: '\u5b78\u865f\u683c\u5f0f\u7570\u5e38', rowNum, studentId, detail: '\u5b78\u865f\u9808\u70ba 6\u201312 \u4f4d\u6578\u5b57\uff0c\u6b64\u5217\u4e0d\u6703\u532f\u5165' });
              return;
            }
            const excelName = String(row[identityColumnsAutoCorrected ? classKey : nameKey] ?? '').trim() || '\u672a\u547d\u540d';
            const className = String(row[identityColumnsAutoCorrected ? nameKey : classKey] ?? '').trim() || '\u672a\u8a2d\u5b9a';
            const item = {
              rowNum,
              studentId,
              excelName,
              className,
              enrollYear: String(enrollYearKey ? row[enrollYearKey] ?? '' : '').trim(),
              rosterStatusRaw: String(rosterStatusKey ? row[rosterStatusKey] ?? '' : '').trim(),
              admissionMethod: String(admissionKey ? row[admissionKey] ?? '' : '').trim(),
              identityStatus: String(identityKey ? row[identityKey] ?? '' : '').trim()
            };
            if (itemMap.has(studentId)) {
              duplicateCount++;
              issues.push({ level: 'warning', type: '\u6a94\u6848\u5167\u91cd\u8907\u5b78\u865f', rowNum, studentId, detail: '\u5c07\u63a1\u7528\u6a94\u6848\u4e2d\u6700\u5f8c\u4e00\u5217\u8cc7\u6599' });
            }
            itemMap.set(studentId, item);
            if (excelName === '\u672a\u547d\u540d') {
              issues.push({ level: 'warning', type: '\u7f3a\u5c11\u59d3\u540d', rowNum, studentId, detail: '\u5c07\u4ee5\u300c\u672a\u547d\u540d\u300d\u532f\u5165' });
            }
            if (className === '\u672a\u8a2d\u5b9a') {
              issues.push({ level: 'warning', type: '\u7f3a\u5c11\u73ed\u7d1a', rowNum, studentId, detail: '\u5c07\u4fdd\u7559\u65e2\u6709\u73ed\u7d1a\uff1b\u65b0\u751f\u5247\u70ba\u300c\u672a\u8a2d\u5b9a\u300d' });
            }
            const existing = studentMap.get(studentId);
            if (existing && excelName !== '\u672a\u547d\u540d' && !this.isNameMatching(existing.name, excelName)) {
              issues.push({
                level: 'danger',
                type: '\u59d3\u540d\u4e0d\u4e00\u81f4',
                rowNum,
                studentId,
                detail: `\u7cfb\u7d71\u300c${existing.name || '\u672a\u547d\u540d'}\u300d\u2192 Excel\u300c${excelName}\u300d`
              });
            }
          });
          if (identityColumnsAutoCorrected) {
            issues.unshift({
              level: 'warning',
              type: '\u59d3\u540d\uff0f\u73ed\u7d1a\u81ea\u52d5\u6821\u6b63',
              rowNum: '-',
              studentId: '',
              detail: '\u4f9d\u65e2\u6709\u540d\u518a\u6bd4\u5c0d\u5f8c\u5224\u5b9a\u5169\u6b04\u5167\u5bb9\u4e92\u63db\uff0c\u6a21\u64ec\u8207\u532f\u5165\u5c07\u4f7f\u7528\u6821\u6b63\u5f8c\u6b04\u4f4d'
            });
          }
          const parsedItems = Array.from(itemMap.values());
          if (parsedItems.length === 0) {
            return reject('Excel \u4e2d\u6c92\u6709\u53ef\u532f\u5165\u7684\u6709\u6548\u5b78\u865f');
          }
          const uploadedStudentIds = new Set(parsedItems.map(item => item.studentId));
          const addedCount = parsedItems.filter(item => !studentMap.has(item.studentId)).length;
          const updatedCount = parsedItems.length - addedCount;
          const archivedCount = existingStudents.filter(student => (
            this.normalizeRosterStatus(student.rosterStatus) === '\u5728\u5b78'
            && !uploadedStudentIds.has(String(student.studentId).trim())
          )).length;
          resolve({
            kind: 'roster',
            parsedItems,
            totalRows: parsedItems.length,
            simulation: {
              sourceRows: jsonRows.length,
              validRows: parsedItems.length,
              addedCount,
              updatedCount,
              archivedCount,
              skippedCount,
              duplicateCount,
              overwriteCount: 0,
              issues,
              identityColumnsAutoCorrected
            }
          });
        } catch (err) {
          reject('Excel \u6a21\u64ec\u6aa2\u67e5\u5931\u6557\uff1a' + err.message);
        }
      };
      reader.onerror = () => reject('\u6a94\u6848\u8b80\u53d6\u5931\u6557');
      reader.readAsBinaryString(file);
    });
  },
  applyRosterImport(scanResult, fileName = '') {
    const existingStudents = window.FitnessStore.getStudents();
    const studentMap = new Map(existingStudents.map(s => [String(s.studentId).trim(), s]));
    const uploadedStudentIds = new Set(scanResult.parsedItems.map(item => item.studentId));
    let addedCount = 0;
    let updatedCount = 0;
    scanResult.parsedItems.forEach(item => {
      const admissionMethod = item.admissionMethod || '';
      const identityStatus = item.identityStatus || '';
      const isTrans = admissionMethod.includes('\u8f49\u5b78\u8003') ? 1 : 0;
      const isExempt = admissionMethod.includes('\u904b\u52d5\u7e3e\u512a') || identityStatus.includes('\u8eab\u5fc3\u969c\u7919') ? 1 : 0;
      if (studentMap.has(item.studentId)) {
        const current = studentMap.get(item.studentId);
        if (item.excelName !== '\u672a\u547d\u540d' && !this.isMaskedName(item.excelName)) current.name = item.excelName;
        if (item.className !== '\u672a\u8a2d\u5b9a') current.className = item.className;
        current.rosterStatus = this.normalizeRosterStatus(
          item.rosterStatusRaw,
          this.normalizeRosterStatus(current.rosterStatus)
        );
        current.enrollYear = item.enrollYear || current.enrollYear || window.FitnessStore.getEnrollYearFromStudentId(item.studentId);
        current.admissionMethod = admissionMethod || current.admissionMethod || '';
        current.identityStatus = identityStatus || current.identityStatus || '';
        if (isTrans) { current.isTransfer = 1; current.transferCredit = 1; }
        if (isExempt) { current.isExemptAthleteOrDisabled = 1; current.exemptCredit = 2; }
        current.isRosterImported = true;
        current.updatedAt = new Date().toLocaleDateString('zh-TW');
        updatedCount++;
      } else {
        studentMap.set(item.studentId, {
          studentId: item.studentId,
          name: item.excelName,
          className: item.className,
          enrollYear: item.enrollYear || window.FitnessStore.getEnrollYearFromStudentId(item.studentId),
          rosterStatus: this.normalizeRosterStatus(item.rosterStatusRaw),
          admissionMethod,
          identityStatus,
          isRosterImported: true,
          department: '',
          semesters: {
            "1101": 0, "1102": 0, "1111": 0, "1112": 0,
            "1121": 0, "1122": 0, "1131": 0, "1132": 0
          },
          status: '\u4e0d\u901a\u904e',
          passCount: 0,
          deficitCount: 2,
          isTransfer: isTrans,
          transferCredit: isTrans ? 1 : 0,
          isExemptAthleteOrDisabled: isExempt,
          exemptCredit: isExempt ? 2 : 0,
          otherNotes: '',
          reason: '',
          updatedAt: new Date().toLocaleDateString('zh-TW')
        });
        addedCount++;
      }
    });
    let archivedCount = 0;
    for (const student of studentMap.values()) {
      if (this.normalizeRosterStatus(student.rosterStatus) === '\u5728\u5b78'
        && !uploadedStudentIds.has(String(student.studentId).trim())) {
        student.rosterStatus = '\u975e\u5728\u5b78';
        student.updatedAt = new Date().toLocaleDateString('zh-TW');
        archivedCount++;
      }
    }
    const newStudentList = Array.from(studentMap.values());
    window.FitnessStore.saveStudents(newStudentList);
    window.FitnessStore.addAuditLog({
      operator: window.FitnessStore.getCurrentOperatorName(),
      action: '\u532f\u5165\u5b78\u751f\u540d\u518a',
      studentId: 'MULTI',
      details: `\u532f\u5165\u6a94\u6848\u300c${fileName || '\u672a\u547d\u540d\u6a94\u6848'}\u300d\uff1b\u65b0\u589e ${addedCount} \u4eba\u3001\u66f4\u65b0 ${updatedCount} \u4eba\u3001\u8f49\u70ba\u975e\u5728\u5b78 ${archivedCount} \u4eba`
    });
    return { addedCount, updatedCount, archivedCount, total: newStudentList.length };
  },
  async importRosterExcel(file) {
    const scanResult = await this.scanRosterExcel(file);
    return this.applyRosterImport(scanResult, file?.name || '');
  },
  async scanTestExcel(file, importSemester = '') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const workbook = XLSX.read(e.target.result, { type: 'binary' });
          const targetSheetName = workbook.SheetNames.includes('\u9ad4\u9069\u80fd\u901a\u904e\u8207\u5426\u4e00\u89bd') 
            ? '\u9ad4\u9069\u80fd\u901a\u904e\u8207\u5426\u4e00\u89bd' 
            : workbook.SheetNames[0];
          const sheet = workbook.Sheets[targetSheetName];
          const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
          if (!rawRows || rawRows.length < 2) {
            return reject('\u4e0a\u50b3\u7684 Excel \u6a94\u6848\u5167\u5bb9\u4e0d\u8db3');
          }
          let headerIndex = 0;
          for (let i = 0; i < Math.min(5, rawRows.length); i++) {
            const rowStr = rawRows[i].join('').replace(/\s+/g, '');
            if (rowStr.includes('\u5b78\u865f') || rowStr.includes('\u73ed\u7d1a') || rowStr.includes('1101')) {
              headerIndex = i;
              break;
            }
          }
          const headers = rawRows[headerIndex].map(h => String(h || '').replace(/\s+/g, ''));
          const bodyRows = rawRows.slice(headerIndex + 1);
          let idIdx = headers.findIndex(h => h.includes('\u5b78\u865f'));
          if (idIdx === -1) idIdx = 1;
          let nameIdx = headers.findIndex(h => h.includes('\u59d3\u540d'));
          if (nameIdx === -1) nameIdx = 2;
          let classIdx = headers.findIndex(h => h.includes('\u73ed\u7d1a'));
          if (classIdx === -1) classIdx = 3;
          let semPassStatusIdx = headers.findIndex(h => h.includes('\u901a\u904e1\u4e0d\u901a\u904e0') || h.includes('\u901a\u904e1') || h.includes('\u901a\u904e/\u4e0d\u901a\u904e'));
          let heightIdx = headers.findIndex(h => h.includes('\u8eab\u9ad8'));
          let weightIdx = headers.findIndex(h => h.includes('\u9ad4\u91cd'));
          let sitReachIdx = headers.findIndex(h => h.includes('\u9ad4\u524d\u5f4e'));
          let jumpIdx = headers.findIndex(h => h.includes('\u7acb\u5b9a\u8df3'));
          let sitUpIdx = headers.findIndex(h => h.includes('\u4ef0\u81e5\u8d77\u5750'));
          let stepIdx = headers.findIndex(h => h.includes('\u767b\u968e\u6307\u6578'));
          let identityNotesIdx = headers.findIndex(h => h.includes('\u8eab\u5206\u5099\u8a3b'));
          let courseIdx = headers.findIndex(h => h.includes('\u8ab2\u7a0b\u540d\u7a31'));
          let scoreIdx = headers.findIndex(h => h.includes('\u6700\u5f8c\u6210\u7e3e') || h.includes('\u7b2c\u4e00\u6b21'));
          let teacherIdx = headers.findIndex(h => h.includes('\u6559\u5e2b'));
          const semesterIndices = [];
          headers.forEach((h, idx) => {
            if (/^\d{4}$/.test(h)) {
              semesterIndices.push({ semester: h, index: idx });
            }
          });
          if (semesterIndices.length === 0 && !importSemester) {
            return reject('\u60a8\u4e0a\u50b3\u7684\u662f\u300c\u55ae\u4e00\u5b78\u671f\u6210\u7e3e\u6a94 (17\u6b04)\u300d\uff0c\u8acb\u52d9\u5fc5\u5728\u756b\u9762\u4e0a\u65b9\u586b\u5beb\u300c\u6b78\u6a94\u5b78\u671f\u300d(\u4f8b\u5982: 1122) \u518d\u9032\u884c\u4e0a\u50b3\uff01');
          }
          let passCountIdx = headers.findIndex(h => h.includes('\u901a\u904e\u6b21\u6578') || h.includes('\u7d2f\u8a08\u6b21\u6578'));
          let statusIdx = headers.findIndex(h => h.includes('\u901a\u904e\u8207\u5426') || h.includes('\u7562\u696d\u8cc7\u683c'));
          let deficitIdx = headers.findIndex(h => h.includes('\u9700\u88dc\u6b21\u6578'));
          let transferIdx = headers.findIndex(h => h.includes('\u662f\u5426\u8f49\u5b78'));
          let transferCreditIdx = headers.findIndex(h => h.includes('\u82e5\u70ba\u8f49\u5b78'));
          let athleteIdx = headers.findIndex(h => h.includes('\u9ad4\u4fdd\u751f') || h.includes('\u8eab\u969c\u7121\u6cd5\u6aa2\u6e2c'));
          let athleteCreditIdx = headers.findIndex(h => h.includes('\u82e5\u70ba\u9ad4\u4fdd'));
          let otherNotesIdx = headers.findIndex(h => h.includes('\u6b21\u6578\u5176\u9918') || h.includes('\u6821\u5167\u81ea\u8f49'));
          let reasonIdx = headers.findIndex(h => h.includes('\u7570\u52d5\u539f\u56e0'));
          const existingStudents = window.FitnessStore.getStudents();
          const studentMap = new Map(existingStudents.map(s => [String(s.studentId).trim(), s]));
          const identityColumns = this.resolveIdentityColumns(
            bodyRows,
            idIdx,
            nameIdx,
            classIdx,
            studentMap
          );
          nameIdx = identityColumns.nameIdx;
          classIdx = identityColumns.classIdx;
          const existingRecords = window.FitnessStore.getFitnessRecords();
          const recordMap = new Set(existingRecords.map(r => r.recordId));
          const parsedItems = [];
          const mismatches = [];
          const scoreConflicts = [];
          const logicConflicts = [];
          const simulationIssues = [];
          const seenStudentIds = new Set();
          let skippedCount = 0;
          let duplicateCount = 0;
          bodyRows.forEach((row, rowOffset) => {
            const values = row.map(v => String(v ?? '').trim());
            const studentId = values[idIdx];
            if (!studentId || studentId.includes('\u5b78\u865f') || studentId.includes('\u5408\u8a08')) return;
            const rowNum = headerIndex + rowOffset + 2;
            if (!/^\d{6,12}$/.test(studentId)) {
              skippedCount++;
              simulationIssues.push({
                level: 'danger',
                type: '\u5b78\u865f\u683c\u5f0f\u7570\u5e38',
                rowNum,
                studentId,
                detail: '\u5b78\u865f\u9808\u70ba 6\u201312 \u4f4d\u6578\u5b57\uff0c\u6b64\u5217\u4e0d\u6703\u532f\u5165'
              });
              return;
            }
            if (seenStudentIds.has(studentId)) {
              duplicateCount++;
              simulationIssues.push({
                level: 'warning',
                type: '\u6a94\u6848\u5167\u91cd\u8907\u5b78\u865f',
                rowNum,
                studentId,
                detail: '\u540c\u4e00\u5b78\u751f\u5728\u6a94\u6848\u4e2d\u51fa\u73fe\u591a\u6b21\uff0c\u5f8c\u5217\u8cc7\u6599\u53ef\u80fd\u8986\u84cb\u524d\u5217\u7d50\u679c'
              });
            }
            seenStudentIds.add(studentId);
            const excelName = values[nameIdx] || '\u672a\u77e5\u59d3\u540d';
            const excelClass = values[classIdx] || '\u672a\u77e5\u73ed\u7d1a';
            if (excelName === '\u672a\u77e5\u59d3\u540d') {
              simulationIssues.push({ level: 'warning', type: '\u7f3a\u5c11\u59d3\u540d', rowNum, studentId, detail: '\u5c07\u4fdd\u7559\u65e2\u6709\u59d3\u540d\uff1b\u5168\u65b0\u5b78\u865f\u6703\u4ee5\u300c\u672a\u77e5\u59d3\u540d\u300d\u5efa\u7acb' });
            }
            if (excelClass === '\u672a\u77e5\u73ed\u7d1a') {
              simulationIssues.push({ level: 'warning', type: '\u7f3a\u5c11\u73ed\u7d1a', rowNum, studentId, detail: '\u6210\u7e3e\u532f\u5165\u4e0d\u6703\u8986\u5beb\u540d\u518a\u73ed\u7d1a' });
            }
            const existingStudent = studentMap.get(studentId);
            if (!existingStudent) {
              mismatches.push({
                rowNum,
                studentId,
                excelName,
                excelClass,
                systemName: '\u7121\u5b78\u7c4d\u6a94\u7d00\u9304 (\u5168\u65b0\u5b78\u865f)',
                type: 'NEW_STUDENT'
              });
            } else {
              const matches = this.isNameMatching(existingStudent.name, excelName);
              if (!matches) {
                mismatches.push({
                  rowNum,
                  studentId,
                  excelName,
                  excelClass,
                  systemName: existingStudent.name,
                  type: 'NAME_MISMATCH'
                });
              }
            }
            const rowParsedData = {
              rowNum,
              studentId,
              excelName,
              excelClass,
              values,
              semPassStatusVal: semPassStatusIdx !== -1 ? values[semPassStatusIdx] : '',
              height: heightIdx !== -1 ? values[heightIdx] : '',
              weight: weightIdx !== -1 ? values[weightIdx] : '',
              sitReach: sitReachIdx !== -1 ? values[sitReachIdx] : '',
              jump: jumpIdx !== -1 ? values[jumpIdx] : '',
              sitUp: sitUpIdx !== -1 ? values[sitUpIdx] : '',
              step: stepIdx !== -1 ? values[stepIdx] : '',
              identityNotes: identityNotesIdx !== -1 ? values[identityNotesIdx] : '',
              courseName: courseIdx !== -1 ? values[courseIdx] : '',
              score: scoreIdx !== -1 ? values[scoreIdx] : '',
              teacher: teacherIdx !== -1 ? values[teacherIdx] : '',
              semesterIndices,
              passCountVal: passCountIdx !== -1 ? values[passCountIdx] : '',
              statusVal: statusIdx !== -1 ? values[statusIdx] : '',
              deficitVal: deficitIdx !== -1 ? values[deficitIdx] : '',
              transferVal: transferIdx !== -1 ? values[transferIdx] : '',
              transferCreditVal: transferCreditIdx !== -1 ? values[transferCreditIdx] : '',
              athleteVal: athleteIdx !== -1 ? values[athleteIdx] : '',
              athleteCreditVal: athleteCreditIdx !== -1 ? values[athleteCreditIdx] : '',
              otherNotesVal: otherNotesIdx !== -1 ? values[otherNotesIdx] : '',
              reasonVal: reasonIdx !== -1 ? values[reasonIdx] : ''
            };
            if (existingStudent) {
              let rowSemestersToUpdate = [];
              if (semPassStatusIdx !== -1) {
                const val = rowParsedData.semPassStatusVal;
                const isPass = val === '1' || val.includes('\u901a\u904e') || val.includes('\u5408') || val === 'V';
                if (importSemester) {
                  rowSemestersToUpdate.push({ sem: importSemester, isPass });
                }
              } else if (semesterIndices.length > 0) {
                semesterIndices.forEach(sItem => {
                  const val = values[sItem.index] || '0';
                  const isPass = val === '1' || val.includes('\u901a\u904e') || val.includes('\u5408') || val === 'V';
                  rowSemestersToUpdate.push({ sem: sItem.semester, isPass });
                });
              }
              rowSemestersToUpdate.forEach(update => {
                if (existingStudent.semesters && existingStudent.semesters[update.sem] !== undefined) {
                  const dbPass = existingStudent.semesters[update.sem] === 1;
                  if (dbPass !== update.isPass) {
                    const isDowngrade = dbPass === true && update.isPass === false;
                    const recordId = `${studentId}_${update.sem}`;
                    const hasExplicitRecord = recordMap.has(recordId);
                    const isUpgradeConflict = dbPass === false && update.isPass === true && hasExplicitRecord;
                    if (isDowngrade || isUpgradeConflict) {
                      scoreConflicts.push({
                        rowNum,
                        studentId,
                        name: existingStudent.name,
                        semester: update.sem,
                        dbStatus: dbPass ? '\u901a\u904e' : '\u4e0d\u901a\u904e',
                        excelStatus: update.isPass ? '\u901a\u904e' : '\u4e0d\u901a\u904e'
                      });
                    }
                  }
                }
              });
            }
            if (statusIdx !== -1 && semesterIndices.length > 0) {
              let explicitPasses = 0;
              semesterIndices.forEach(sItem => {
                const val = values[sItem.index] || '0';
                if (val === '1' || val.includes('\u901a\u904e') || val.includes('\u5408') || val === 'V') explicitPasses++;
              });
              if (rowParsedData.transferCreditVal === '1' || Number(rowParsedData.transferCreditVal) > 0) explicitPasses += 1;
              if (rowParsedData.athleteCreditVal === '2' || Number(rowParsedData.athleteCreditVal) === 2) explicitPasses += 2;
              const isExcelNotPassed = rowParsedData.statusVal.includes('\u4e0d\u901a\u904e');
              const excelDeficit = (rowParsedData.deficitVal && !isNaN(rowParsedData.deficitVal)) ? parseInt(rowParsedData.deficitVal) : 0;
              if (explicitPasses >= 2 && (isExcelNotPassed || excelDeficit > 0)) {
                logicConflicts.push({
                  rowNum,
                  studentId,
                  name: rowParsedData.excelName,
                  actualPasses: explicitPasses,
                  excelStatus: rowParsedData.statusVal + (excelDeficit > 0 ? ` (\u7f3a${excelDeficit})` : '')
                });
              }
            }
            parsedItems.push(rowParsedData);
          });
          const uniqueStudentIds = new Set(parsedItems.map(item => item.studentId));
          const addedStudentCount = [...uniqueStudentIds].filter(studentId => !studentMap.has(studentId)).length;
          const updatedStudentCount = uniqueStudentIds.size - addedStudentCount;
          const affectedSemesters = importSemester
            ? [importSemester]
            : semesterIndices.map(item => item.semester);
          let overwriteCount = 0;
          let newRecordCount = 0;
          if (importSemester && (semPassStatusIdx !== -1 || sitReachIdx !== -1)) {
            uniqueStudentIds.forEach(studentId => {
              if (recordMap.has(`${studentId}_${importSemester}`)) overwriteCount++;
              else newRecordCount++;
            });
          }
          if (identityColumns.autoCorrected) {
            simulationIssues.unshift({
              level: 'warning',
              type: '\u59d3\u540d\uff0f\u73ed\u7d1a\u81ea\u52d5\u6821\u6b63',
              rowNum: '-',
              studentId: '',
              detail: '\u4f9d\u65e2\u6709\u540d\u518a\u6bd4\u5c0d\u5f8c\u5224\u5b9a\u5169\u6b04\u5167\u5bb9\u4e92\u63db\uff0c\u6a21\u64ec\u8207\u532f\u5165\u5c07\u4f7f\u7528\u6821\u6b63\u5f8c\u6b04\u4f4d'
            });
          }
          mismatches.forEach(item => simulationIssues.push({
            level: item.type === 'NAME_MISMATCH' ? 'danger' : 'warning',
            type: item.type === 'NAME_MISMATCH' ? '\u59d3\u540d\u4e0d\u4e00\u81f4' : '\u5168\u65b0\u5b78\u865f',
            rowNum: item.rowNum,
            studentId: item.studentId,
            detail: item.type === 'NAME_MISMATCH'
              ? `\u7cfb\u7d71\u300c${item.systemName}\u300d\u2192 Excel\u300c${item.excelName}\u300d`
              : `\u5c07\u65b0\u589e\u300c${item.excelName}\u300d`
          }));
          scoreConflicts.forEach(item => simulationIssues.push({
            level: 'danger',
            type: '\u65e2\u6709\u6210\u7e3e\u885d\u7a81',
            rowNum: item.rowNum,
            studentId: item.studentId,
            detail: `${item.semester}\uff1a\u7cfb\u7d71\u300c${item.dbStatus}\u300d\uff0fExcel\u300c${item.excelStatus}\u300d`
          }));
          logicConflicts.forEach(item => simulationIssues.push({
            level: 'danger',
            type: '\u9580\u6abb\u5224\u5b9a\u77db\u76fe',
            rowNum: item.rowNum,
            studentId: item.studentId,
            detail: `\u5be6\u969b\u7d2f\u8a08 ${item.actualPasses} \u6b21\uff0cExcel \u6a19\u793a\u300c${item.excelStatus}\u300d`
          }));
          resolve({
            parsedItems,
            mismatches,
            scoreConflicts,
            logicConflicts,
            totalRows: parsedItems.length,
            isNew17ColumnFormat: semPassStatusIdx !== -1 || sitReachIdx !== -1,
            identityColumnsAutoCorrected: identityColumns.autoCorrected,
            identityColumnDiagnostics: identityColumns,
            simulation: {
              sourceRows: bodyRows.length,
              validRows: parsedItems.length,
              addedCount: addedStudentCount,
              updatedCount: updatedStudentCount,
              archivedCount: 0,
              overwriteCount,
              newRecordCount,
              skippedCount,
              duplicateCount,
              affectedSemesters,
              issues: simulationIssues,
              identityColumnsAutoCorrected: identityColumns.autoCorrected
            }
          });
        } catch (err) {
          reject('Excel \u9632\u5446\u6bd4\u5c0d\u5931\u6557\uff1a' + err.message);
        }
      };
      reader.onerror = () => reject('\u6a94\u6848\u8b80\u53d6\u5931\u6557');
      reader.readAsBinaryString(file);
    });
  },
  applyTestImport(scanResult, targetSemester = '1122', resolution = 'keep_db', logicResolution = 'keep_excel') {
    const { parsedItems, scoreConflicts = [] } = scanResult;
    const conflictSet = new Set();
    scoreConflicts.forEach(c => conflictSet.add(`${c.studentId}_${c.semester}`));
    const existingStudents = window.FitnessStore.getStudents();
    const studentMap = new Map(existingStudents.map(s => [String(s.studentId).trim(), s]));
    const existingRecords = window.FitnessStore.getFitnessRecords();
    const newRecords = [...existingRecords];
    let updatedCount = 0;
    let addedStudentCount = 0;
    parsedItems.forEach(item => {
      let student = studentMap.get(item.studentId);
      if (!student) {
        student = {
          studentId: item.studentId,
          name: item.excelName,
          className: item.excelClass,
          department: '',
          semesters: {
            "1101": 0, "1102": 0, "1111": 0, "1112": 0,
            "1121": 0, "1122": 0, "1131": 0, "1132": 0
          },
          status: '\u4e0d\u901a\u904e',
          passCount: 0,
          deficitCount: 2,
          isTransfer: 0,
          transferCredit: 0,
          isExemptAthleteOrDisabled: 0,
          exemptCredit: 0,
          otherNotes: '',
          reason: '',
          updatedAt: new Date().toLocaleDateString('zh-TW')
        };
        studentMap.set(item.studentId, student);
        addedStudentCount++;
      } else {
        if (item.excelName && item.excelName !== '\u672a\u77e5\u59d3\u540d') {
          const isExcelMasked = this.isMaskedName(item.excelName);
          const isStoredMasked = this.isMaskedName(student.name);
          if (!isExcelMasked) {
            student.name = item.excelName; // \u5f37\u884c\u5347\u7d1a\u6210\u5168\u540d (\u5982 \u9112\u7f8e\u4f36)
          } else if (isStoredMasked) {
            student.name = item.excelName;
          }
        }
      }
      if (!student.semesters) student.semesters = {};
      if (item.semPassStatusVal !== '' || item.sitReach !== '') {
        const isSemPass = item.semPassStatusVal === '1' || item.semPassStatusVal.includes('\u901a\u904e');
        let shouldUpdateStatus = true;
        if (resolution === 'keep_db' && conflictSet.has(`${item.studentId}_${targetSemester}`)) {
          shouldUpdateStatus = false;
        }
        if (shouldUpdateStatus) {
          student.semesters[targetSemester] = isSemPass ? 1 : 0;
        }
        if (item.identityNotes) {
          if (item.identityNotes.includes('\u8f49\u5b78')) { student.isTransfer = 1; student.transferCredit = 1; }
          if (item.identityNotes.includes('\u9ad4\u4fdd') || item.identityNotes.includes('\u8eab\u969c')) { student.isExemptAthleteOrDisabled = 1; student.exemptCredit = 2; }
          student.otherNotes = item.identityNotes;
        }
        const recordId = `${item.studentId}_${targetSemester}`;
        const recordIdx = newRecords.findIndex(r => r.recordId === recordId);
        const recordObj = {
          recordId,
          studentId: item.studentId,
          semester: targetSemester,
          isPassed: (resolution === 'keep_db' && conflictSet.has(`${item.studentId}_${targetSemester}`)) 
            ? (student.semesters[targetSemester] === 1) 
            : isSemPass,
          scores: {
            height: item.height || '-',
            weight: item.weight || '-',
            sitAndReach: item.sitReach || '-',
            standingLongJump: item.jump || '-',
            sitUps: item.sitUp || '-',
            cardio: item.step ? item.step : '-'
          },
          courseName: item.courseName,
          score: item.score,
          teacher: item.teacher
        };
        if (recordIdx !== -1) newRecords[recordIdx] = recordObj;
        else newRecords.push(recordObj);
      } else {
        item.semesterIndices.forEach(sItem => {
          const val = item.values[sItem.index] || '0';
          const isPass = val === '1' || val.includes('\u901a\u904e') || val.includes('\u5408') || val === 'V';
          if (resolution === 'overwrite' || !conflictSet.has(`${item.studentId}_${sItem.semester}`)) {
            student.semesters[sItem.semester] = isPass ? 1 : 0;
          }
        });
        if (item.transferVal) student.isTransfer = (item.transferVal === '1' || item.transferVal.includes('\u662f')) ? 1 : 0;
        if (item.transferCreditVal) student.transferCredit = (item.transferCreditVal === '1' || Number(item.transferCreditVal) > 0) ? 1 : 0;
        if (item.athleteVal) student.isExemptAthleteOrDisabled = (item.athleteVal === '1' || item.athleteVal.includes('\u662f')) ? 1 : 0;
        if (item.athleteCreditVal) student.exemptCredit = (item.athleteCreditVal === '2' || Number(item.athleteCreditVal) === 2) ? 2 : 0;
        if (item.otherNotesVal) student.otherNotes = item.otherNotesVal;
        if (item.reasonVal) student.reason = item.reasonVal;
      }
      let semPassSum = 0;
      Object.values(student.semesters).forEach(v => {
        if (Number(v) === 1) semPassSum++;
      });
      const admMethod = student.admissionMethod || '';
      const identity = student.identityStatus || '';
      if (admMethod.includes('\u8f49\u5b78\u8003')) { student.transferCredit = 1; student.isTransfer = 1; }
      if (admMethod.includes('\u904b\u52d5\u7e3e\u512a')) { student.exemptCredit = 2; student.isExemptAthleteOrDisabled = 1; }
      if (identity.includes('\u8eab\u5fc3\u969c\u7919')) { student.exemptCredit = 2; student.isExemptAthleteOrDisabled = 1; }
      let totalPass = semPassSum + Number(student.transferCredit || 0) + Number(student.exemptCredit || 0);
      if (item.passCountVal && !isNaN(item.passCountVal)) {
        totalPass = Math.max(totalPass, parseInt(item.passCountVal));
      }
      student.passCount = totalPass;
      const isExempt = (Number(student.isExemptAthleteOrDisabled) > 0) || (Number(student.exemptCredit) > 0);
      const isForcePass = (logicResolution === 'force_pass' && totalPass >= 2);
      if (isExempt || isForcePass) {
        student.status = '\u901a\u904e';
        student.deficitCount = 0;
      } else if (item.statusVal) {
        student.status = item.statusVal.includes('\u4e0d\u901a\u904e') ? '\u4e0d\u901a\u904e' : '\u901a\u904e';
        student.deficitCount = student.status === '\u901a\u904e' ? 0 : Math.max(0, 2 - totalPass);
      } else {
        student.status = totalPass >= 2 ? '\u901a\u904e' : '\u4e0d\u901a\u904e';
        student.deficitCount = student.status === '\u901a\u904e' ? 0 : Math.max(0, 2 - totalPass);
      }
      if (item.deficitVal && !isNaN(item.deficitVal) && !isForcePass) {
        student.deficitCount = parseInt(item.deficitVal);
      }
      student.updatedAt = new Date().toLocaleDateString('zh-TW');
      updatedCount++;
    });
    const newStudentList = Array.from(studentMap.values());
    window.FitnessStore.saveStudents(newStudentList);
    window.FitnessStore.saveFitnessRecords(newRecords);
    if (scanResult.isNew17ColumnFormat && targetSemester) {
      window.FitnessStore.updateImportHistory(targetSemester);
    } else if (scanResult.parsedItems.length > 0 && scanResult.parsedItems[0].semesterIndices) {
      const sems = scanResult.parsedItems[0].semesterIndices.map(s => s.semester);
      if (sems.length > 0) window.FitnessStore.updateImportHistory(sems);
    }
    window.FitnessStore.addAuditLog({
      operator: window.FitnessStore.getCurrentOperatorName(),
      action: '\u532f\u5165\u9ad4\u9069\u80fd\u6210\u7e3e',
      details: `\u6210\u529f\u532f\u5165 Excel\uff1a\u66f4\u65b0/\u65b0\u589e ${updatedCount} \u4f4d\u5b78\u751f\u6210\u7e3e (\u885d\u7a81\u8655\u7406\u539f\u5247: ${resolution === 'overwrite' ? '\u5f37\u5236\u8986\u5beb' : '\u4fdd\u7559\u7cfb\u7d71'})`
    });
    return { updatedCount, addedStudentCount, total: newStudentList.length };
  }
};
