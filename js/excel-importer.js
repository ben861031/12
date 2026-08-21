window.FitnessImporter = {
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
  async importRosterExcel(file) {
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
          const existingStudents = window.FitnessStore.getStudents();
          const studentMap = new Map(existingStudents.map(s => [String(s.studentId).trim(), s]));
          const uploadedStudentIds = new Set();
          let addedCount = 0;
          let updatedCount = 0;
          jsonRows.forEach(row => {
            const keys = Object.keys(row);
            const idKey = keys.find(k => k.includes('\u5b78\u865f') || k.toLowerCase().includes('id'));
            const nameKey = keys.find(k => k.includes('\u59d3\u540d') || k.includes('\u540d\u5b57') || k.toLowerCase().includes('name'));
            const classKey = keys.find(k => k.includes('\u73ed\u7d1a'));
            if (!idKey || !row[idKey]) return;
            const studentId = String(row[idKey]).trim();
            uploadedStudentIds.add(studentId);
            const excelName = nameKey ? String(row[nameKey]).trim() : '\u672a\u547d\u540d';
            const className = classKey ? String(row[classKey]).trim() : '\u672a\u8a2d\u5b9a';
            const admissionMethod = row['\u5165\u5b78\u65b9\u5f0f'] ? String(row['\u5165\u5b78\u65b9\u5f0f']).trim() : '';
            const identityStatus = row['\u8eab\u5206'] ? String(row['\u8eab\u5206']).trim() : '';
            let tCredit = 0;
            let eCredit = 0;
            let isTrans = 0;
            let isExempt = 0;
            if (admissionMethod.includes('\u8f49\u5b78\u8003')) {
               tCredit = 1;
               isTrans = 1;
            } else if (admissionMethod.includes('\u904b\u52d5\u7e3e\u512a')) {
               eCredit = 2;
               isExempt = 1;
            }
            if (identityStatus.includes('\u8eab\u5fc3\u969c\u7919')) {
               eCredit = 2;
               isExempt = 1;
            }
            if (studentMap.has(studentId)) {
              const current = studentMap.get(studentId);
              if (!this.isMaskedName(excelName)) {
                current.name = excelName;
              }
              current.className = className || current.className;
              current.rosterStatus = row['\u5b78\u7c4d\u72c0\u614b'] || current.rosterStatus || '\u5728\u5b78';
              current.enrollYear = row['\u5165\u5b78\u5e74'] || current.enrollYear || window.FitnessStore.getEnrollYearFromStudentId(studentId);
              current.admissionMethod = admissionMethod || current.admissionMethod || '';
              current.identityStatus = identityStatus || current.identityStatus || '';
              if (isTrans) { current.isTransfer = 1; current.transferCredit = 1; }
              if (isExempt) { current.isExemptAthleteOrDisabled = 1; current.exemptCredit = 2; }
              current.isRosterImported = true;
              current.updatedAt = new Date().toLocaleDateString('zh-TW');
              updatedCount++;
            } else {
              const newStudent = {
                studentId: studentId,
                name: excelName,
                className: className,
                enrollYear: row['\u5165\u5b78\u5e74'] || window.FitnessStore.getEnrollYearFromStudentId(studentId),
                rosterStatus: row['\u5b78\u7c4d\u72c0\u614b'] || '\u5728\u5b78',
                admissionMethod: admissionMethod,
                identityStatus: identityStatus,
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
                transferCredit: tCredit,
                isExemptAthleteOrDisabled: isExempt,
                exemptCredit: eCredit,
                otherNotes: '',
                reason: '',
                updatedAt: new Date().toLocaleDateString('zh-TW')
              };
              studentMap.set(studentId, newStudent);
              addedCount++;
            }
          });
          let archivedCount = 0;
          for (const s of studentMap.values()) {
            if (s.rosterStatus === '\u5728\u5b78' && !uploadedStudentIds.has(String(s.studentId))) {
              s.rosterStatus = '\u975e\u5728\u7c4d';
              s.updatedAt = new Date().toLocaleDateString('zh-TW');
              archivedCount++;
            }
          }
          const newStudentList = Array.from(studentMap.values());
          window.FitnessStore.saveStudents(newStudentList);
          window.FitnessStore.addAuditLog({
            operator: '\u7ba1\u7406\u54e1',
            action: '\u532f\u5165\u5b78\u7c4d\u8cc7\u6599',
            details: `\u6210\u529f\u532f\u5165\u5b78\u7c4d\u6a94\uff1a\u65b0\u589e ${addedCount} \u4eba\uff0c\u66f4\u65b0 ${updatedCount} \u4eba\uff0c\u8f49\u70ba\u975e\u5728\u7c4d ${archivedCount} \u4eba`
          });
          resolve({ addedCount, updatedCount, archivedCount, total: newStudentList.length });
        } catch (err) {
          reject('Excel \u89e3\u6790\u5931\u6557\uff1a' + err.message);
        }
      };
      reader.onerror = () => reject('\u6a94\u6848\u8b80\u53d6\u5931\u6557');
      reader.readAsBinaryString(file);
    });
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
          if (idIdx === -1) idIdx = 0;
          let nameIdx = headers.findIndex(h => h.includes('\u59d3\u540d'));
          if (nameIdx === -1) nameIdx = 2;
          let classIdx = headers.findIndex(h => h.includes('\u73ed\u7d1a'));
          if (classIdx === -1) classIdx = 1;
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
          const existingRecords = window.FitnessStore.getFitnessRecords();
          const recordMap = new Set(existingRecords.map(r => r.recordId));
          const parsedItems = [];
          const mismatches = [];
          const scoreConflicts = [];
          const logicConflicts = [];
          bodyRows.forEach((row, rowOffset) => {
            const values = row.map(v => String(v ?? '').trim());
            const studentId = values[idIdx];
            if (!studentId || studentId.includes('\u5b78\u865f') || studentId.includes('\u5408\u8a08')) return;
            const excelName = values[nameIdx] || '\u672a\u77e5\u59d3\u540d';
            const excelClass = values[classIdx] || '\u672a\u77e5\u73ed\u7d1a';
            const rowNum = headerIndex + rowOffset + 2;
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
          resolve({
            parsedItems,
            mismatches,
            scoreConflicts,
            logicConflicts,
            totalRows: parsedItems.length,
            isNew17ColumnFormat: semPassStatusIdx !== -1 || sitReachIdx !== -1
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
      operator: '\u7ba1\u7406\u54e1',
      action: '\u532f\u5165\u9ad4\u9069\u80fd\u6210\u7e3e',
      details: `\u6210\u529f\u532f\u5165 Excel\uff1a\u66f4\u65b0/\u65b0\u589e ${updatedCount} \u4f4d\u5b78\u751f\u6210\u7e3e (\u885d\u7a81\u8655\u7406\u539f\u5247: ${resolution === 'overwrite' ? '\u5f37\u5236\u8986\u5beb' : '\u4fdd\u7559\u7cfb\u7d71'})`
    });
    return { updatedCount, addedStudentCount, total: newStudentList.length };
  }
};