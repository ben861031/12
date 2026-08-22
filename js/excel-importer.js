/**
 * 體適能查詢與管理平台 - Excel 匯入與數據解析處理器 (Excel Data Ingestion Engine)
 * 姓名全名還原與遮蔽還原升級機制
 */

window.FitnessImporter = {

  // 檢查名字是否包含遮蔽字 (如 O, ○, *, o)
  isMaskedName(name) {
    if (!name || typeof name !== 'string') return false;
    return /[O○*o]/.test(name.trim());
  },

  // 姓名比對與遮蔽相容檢查 (例: 王○明 與 王小明 視為同一人)
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

  // 依現有學籍交叉驗證「姓名／班級」欄位，防止 Excel 標題列格式差異造成兩欄互換。
  resolveIdentityColumns(bodyRows, idIdx, nameIdx, classIdx, studentMap) {
    if (nameIdx === classIdx) {
      throw new Error('無法辨識姓名與班級欄位，請確認 Excel 標題列包含「學號、姓名、班級」');
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

    // 至少 3 筆既有學生一致，且互換後的姓名命中率明顯較高，才自動校正。
    // 這可處理部分學期檔案標題順序與實際資料順序不一致的情況。
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

  // 1. 匯入每學期學籍資料檔 (Roster Data)
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
            return reject('上傳的 Excel 檔案內無有效學生數據');
          }

          const existingStudents = window.FitnessStore.getStudents();
          const studentMap = new Map(existingStudents.map(s => [String(s.studentId).trim(), s]));
          const uploadedStudentIds = new Set();

          let addedCount = 0;
          let updatedCount = 0;

          jsonRows.forEach(row => {
            const keys = Object.keys(row);
            const idKey = keys.find(k => k.includes('學號') || k.toLowerCase().includes('id'));
            const nameKey = keys.find(k => k.includes('姓名') || k.includes('名字') || k.toLowerCase().includes('name'));
            const classKey = keys.find(k => k.includes('班級'));

            if (!idKey || !row[idKey]) return;

            const studentId = String(row[idKey]).trim();
            uploadedStudentIds.add(studentId);

            const excelName = nameKey ? String(row[nameKey]).trim() : '未命名';
            const className = classKey ? String(row[classKey]).trim() : '未設定';

            const admissionMethod = row['入學方式'] ? String(row['入學方式']).trim() : '';
            const identityStatus = row['身分'] ? String(row['身分']).trim() : '';

            let tCredit = 0;
            let eCredit = 0;
            let isTrans = 0;
            let isExempt = 0;

            if (admissionMethod.includes('轉學考')) {
               tCredit = 1;
               isTrans = 1;
            } else if (admissionMethod.includes('運動績優')) {
               eCredit = 2;
               isExempt = 1;
            }

            if (identityStatus.includes('身心障礙')) {
               eCredit = 2;
               isExempt = 1;
            }

            if (studentMap.has(studentId)) {
              const current = studentMap.get(studentId);
              // 若 Excel 中的名字不是遮蔽名，升級覆寫為完整全名！
              if (!this.isMaskedName(excelName)) {
                current.name = excelName;
              }
              current.className = className || current.className;
              current.rosterStatus = row['學籍狀態'] || current.rosterStatus || '在學';
              current.enrollYear = row['入學年'] || current.enrollYear || window.FitnessStore.getEnrollYearFromStudentId(studentId);
              
              current.admissionMethod = admissionMethod || current.admissionMethod || '';
              current.identityStatus = identityStatus || current.identityStatus || '';
              
              // Only overwrite credits if they are truthy from the import, otherwise keep existing
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
                enrollYear: row['入學年'] || window.FitnessStore.getEnrollYearFromStudentId(studentId),
                rosterStatus: row['學籍狀態'] || '在學',
                admissionMethod: admissionMethod,
                identityStatus: identityStatus,
                isRosterImported: true,
                department: '',
                semesters: {
                  "1101": 0, "1102": 0, "1111": 0, "1112": 0,
                  "1121": 0, "1122": 0, "1131": 0, "1132": 0
                },
                status: '不通過',
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
            if (s.rosterStatus === '在學' && !uploadedStudentIds.has(String(s.studentId))) {
              s.rosterStatus = '非在籍';
              s.updatedAt = new Date().toLocaleDateString('zh-TW');
              archivedCount++;
            }
          }

          const newStudentList = Array.from(studentMap.values());
          window.FitnessStore.saveStudents(newStudentList);

          window.FitnessStore.addAuditLog({
            operator: '管理員',
            action: '匯入學籍資料',
            details: `成功匯入學籍檔：新增 ${addedCount} 人，更新 ${updatedCount} 人，轉為非在籍 ${archivedCount} 人`
          });

          resolve({ addedCount, updatedCount, archivedCount, total: newStudentList.length });
        } catch (err) {
          reject('Excel 解析失敗：' + err.message);
        }
      };
      reader.onerror = () => reject('檔案讀取失敗');
      reader.readAsBinaryString(file);
    });
  },

  // 2. 預析與防呆比對 (Scan Excel for Mismatches)
  async scanTestExcel(file, importSemester = '') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const workbook = XLSX.read(e.target.result, { type: 'binary' });

          const targetSheetName = workbook.SheetNames.includes('體適能通過與否一覽') 
            ? '體適能通過與否一覽' 
            : workbook.SheetNames[0];

          const sheet = workbook.Sheets[targetSheetName];
          const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

          if (!rawRows || rawRows.length < 2) {
            return reject('上傳的 Excel 檔案內容不足');
          }

          let headerIndex = 0;
          for (let i = 0; i < Math.min(5, rawRows.length); i++) {
            const rowStr = rawRows[i].join('').replace(/\s+/g, '');
            if (rowStr.includes('學號') || rowStr.includes('班級') || rowStr.includes('1101')) {
              headerIndex = i;
              break;
            }
          }

          const headers = rawRows[headerIndex].map(h => String(h || '').replace(/\s+/g, ''));
          const bodyRows = rawRows.slice(headerIndex + 1);

          let idIdx = headers.findIndex(h => h.includes('學號'));
          // 標準檔案順序：序號、學號、姓名、班級。
          if (idIdx === -1) idIdx = 1;

          let nameIdx = headers.findIndex(h => h.includes('姓名'));
          if (nameIdx === -1) nameIdx = 2;

          let classIdx = headers.findIndex(h => h.includes('班級'));
          if (classIdx === -1) classIdx = 3;

          let semPassStatusIdx = headers.findIndex(h => h.includes('通過1不通過0') || h.includes('通過1') || h.includes('通過/不通過'));
          let heightIdx = headers.findIndex(h => h.includes('身高'));
          let weightIdx = headers.findIndex(h => h.includes('體重'));
          let sitReachIdx = headers.findIndex(h => h.includes('體前彎'));
          let jumpIdx = headers.findIndex(h => h.includes('立定跳'));
          let sitUpIdx = headers.findIndex(h => h.includes('仰臥起坐'));
          let stepIdx = headers.findIndex(h => h.includes('登階指數'));
          let identityNotesIdx = headers.findIndex(h => h.includes('身分備註'));
          let courseIdx = headers.findIndex(h => h.includes('課程名稱'));
          let scoreIdx = headers.findIndex(h => h.includes('最後成績') || h.includes('第一次'));
          let teacherIdx = headers.findIndex(h => h.includes('教師'));

          const semesterIndices = [];
          headers.forEach((h, idx) => {
            if (/^\d{4}$/.test(h)) {
              semesterIndices.push({ semester: h, index: idx });
            }
          });

          if (semesterIndices.length === 0 && !importSemester) {
            return reject('您上傳的是「單一學期成績檔 (17欄)」，請務必在畫面上方填寫「歸檔學期」(例如: 1122) 再進行上傳！');
          }

          let passCountIdx = headers.findIndex(h => h.includes('通過次數') || h.includes('累計次數'));
          let statusIdx = headers.findIndex(h => h.includes('通過與否') || h.includes('畢業資格'));
          let deficitIdx = headers.findIndex(h => h.includes('需補次數'));
          let transferIdx = headers.findIndex(h => h.includes('是否轉學'));
          let transferCreditIdx = headers.findIndex(h => h.includes('若為轉學'));
          let athleteIdx = headers.findIndex(h => h.includes('體保生') || h.includes('身障無法檢測'));
          let athleteCreditIdx = headers.findIndex(h => h.includes('若為體保'));
          let otherNotesIdx = headers.findIndex(h => h.includes('次數其餘') || h.includes('校內自轉'));
          let reasonIdx = headers.findIndex(h => h.includes('異動原因'));

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

          bodyRows.forEach((row, rowOffset) => {
            const values = row.map(v => String(v ?? '').trim());
            const studentId = values[idIdx];

            if (!studentId || studentId.includes('學號') || studentId.includes('合計')) return;

            const excelName = values[nameIdx] || '未知姓名';
            const excelClass = values[classIdx] || '未知班級';
            const rowNum = headerIndex + rowOffset + 2;

            const existingStudent = studentMap.get(studentId);

            if (!existingStudent) {
              mismatches.push({
                rowNum,
                studentId,
                excelName,
                excelClass,
                systemName: '無學籍檔紀錄 (全新學號)',
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

            // Detect Score Conflicts
            if (existingStudent) {
              let rowSemestersToUpdate = [];
              if (semPassStatusIdx !== -1) {
                const val = rowParsedData.semPassStatusVal;
                const isPass = val === '1' || val.includes('通過') || val.includes('合') || val === 'V';
                if (importSemester) {
                  rowSemestersToUpdate.push({ sem: importSemester, isPass });
                }
              } else if (semesterIndices.length > 0) {
                semesterIndices.forEach(sItem => {
                  const val = values[sItem.index] || '0';
                  const isPass = val === '1' || val.includes('通過') || val.includes('合') || val === 'V';
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
                        dbStatus: dbPass ? '通過' : '不通過',
                        excelStatus: update.isPass ? '通過' : '不通過'
                      });
                    }
                  }
                }
              });
            }

            // Detect Logic Conflicts (Graduation Threshold Mismatch in Excel)
            if (statusIdx !== -1 && semesterIndices.length > 0) {
              let explicitPasses = 0;
              semesterIndices.forEach(sItem => {
                const val = values[sItem.index] || '0';
                if (val === '1' || val.includes('通過') || val.includes('合') || val === 'V') explicitPasses++;
              });
              
              if (rowParsedData.transferCreditVal === '1' || Number(rowParsedData.transferCreditVal) > 0) explicitPasses += 1;
              if (rowParsedData.athleteCreditVal === '2' || Number(rowParsedData.athleteCreditVal) === 2) explicitPasses += 2;
              
              const isExcelNotPassed = rowParsedData.statusVal.includes('不通過');
              const excelDeficit = (rowParsedData.deficitVal && !isNaN(rowParsedData.deficitVal)) ? parseInt(rowParsedData.deficitVal) : 0;
              
              if (explicitPasses >= 2 && (isExcelNotPassed || excelDeficit > 0)) {
                logicConflicts.push({
                  rowNum,
                  studentId,
                  name: rowParsedData.excelName,
                  actualPasses: explicitPasses,
                  excelStatus: rowParsedData.statusVal + (excelDeficit > 0 ? ` (缺${excelDeficit})` : '')
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
            isNew17ColumnFormat: semPassStatusIdx !== -1 || sitReachIdx !== -1,
            identityColumnsAutoCorrected: identityColumns.autoCorrected,
            identityColumnDiagnostics: identityColumns
          });
        } catch (err) {
          reject('Excel 防呆比對失敗：' + err.message);
        }
      };
      reader.onerror = () => reject('檔案讀取失敗');
      reader.readAsBinaryString(file);
    });
  },

  // 3. 執行匯入 (自動辨識全名並完成寫入)
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
          status: '不通過',
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
        // 姓名更新原則：
        // 1. 若 Excel 名稱為非遮蔽的完整全名（如: 鄒美伶），強行升級覆寫全名！
        // 2. 若 Excel 名稱包含遮蔽（如: 鄒○伶），但 Store 內已經是全名，保留 Store 內的全名！
        if (item.excelName && item.excelName !== '未知姓名') {
          const isExcelMasked = this.isMaskedName(item.excelName);
          const isStoredMasked = this.isMaskedName(student.name);

          if (!isExcelMasked) {
            student.name = item.excelName; // 強行升級成全名 (如 鄒美伶)
          } else if (isStoredMasked) {
            student.name = item.excelName;
          }
        }
        // 依據需求，匯入「體適能成績」時，不要覆寫班級，班級一律以「學籍名冊」的最新狀態為主
        // if (item.excelClass && item.excelClass !== '未知班級') student.className = item.excelClass;
      }

      if (!student.semesters) student.semesters = {};

      if (item.semPassStatusVal !== '' || item.sitReach !== '') {
        const isSemPass = item.semPassStatusVal === '1' || item.semPassStatusVal.includes('通過');
        
        let shouldUpdateStatus = true;
        if (resolution === 'keep_db' && conflictSet.has(`${item.studentId}_${targetSemester}`)) {
          shouldUpdateStatus = false;
        }

        if (shouldUpdateStatus) {
          student.semesters[targetSemester] = isSemPass ? 1 : 0;
        }

        if (item.identityNotes) {
          if (item.identityNotes.includes('轉學')) { student.isTransfer = 1; student.transferCredit = 1; }
          if (item.identityNotes.includes('體保') || item.identityNotes.includes('身障')) { student.isExemptAthleteOrDisabled = 1; student.exemptCredit = 2; }
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
          const isPass = val === '1' || val.includes('通過') || val.includes('合') || val === 'V';
          
          if (resolution === 'overwrite' || !conflictSet.has(`${item.studentId}_${sItem.semester}`)) {
            student.semesters[sItem.semester] = isPass ? 1 : 0;
          }
        });

        if (item.transferVal) student.isTransfer = (item.transferVal === '1' || item.transferVal.includes('是')) ? 1 : 0;
        if (item.transferCreditVal) student.transferCredit = (item.transferCreditVal === '1' || Number(item.transferCreditVal) > 0) ? 1 : 0;
        if (item.athleteVal) student.isExemptAthleteOrDisabled = (item.athleteVal === '1' || item.athleteVal.includes('是')) ? 1 : 0;
        if (item.athleteCreditVal) student.exemptCredit = (item.athleteCreditVal === '2' || Number(item.athleteCreditVal) === 2) ? 2 : 0;

        if (item.otherNotesVal) student.otherNotes = item.otherNotesVal;
        if (item.reasonVal) student.reason = item.reasonVal;
      }

      let semPassSum = 0;
      Object.values(student.semesters).forEach(v => {
        if (Number(v) === 1) semPassSum++;
      });

      // Always enforce roster-based exemptions (override PE excel notes if roster implies exemption)
      const admMethod = student.admissionMethod || '';
      const identity = student.identityStatus || '';

      if (admMethod.includes('轉學考')) { student.transferCredit = 1; student.isTransfer = 1; }
      if (admMethod.includes('運動績優')) { student.exemptCredit = 2; student.isExemptAthleteOrDisabled = 1; }
      if (identity.includes('身心障礙')) { student.exemptCredit = 2; student.isExemptAthleteOrDisabled = 1; }

      let totalPass = semPassSum + Number(student.transferCredit || 0) + Number(student.exemptCredit || 0);

      if (item.passCountVal && !isNaN(item.passCountVal)) {
        totalPass = Math.max(totalPass, parseInt(item.passCountVal));
      }

      student.passCount = totalPass;

      const isExempt = (Number(student.isExemptAthleteOrDisabled) > 0) || (Number(student.exemptCredit) > 0);
      const isForcePass = (logicResolution === 'force_pass' && totalPass >= 2);

      if (isExempt || isForcePass) {
        student.status = '通過';
        student.deficitCount = 0;
      } else if (item.statusVal) {
        student.status = item.statusVal.includes('不通過') ? '不通過' : '通過';
        student.deficitCount = student.status === '通過' ? 0 : Math.max(0, 2 - totalPass);
      } else {
        student.status = totalPass >= 2 ? '通過' : '不通過';
        student.deficitCount = student.status === '通過' ? 0 : Math.max(0, 2 - totalPass);
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
      operator: '管理員',
      action: '匯入體適能成績',
      details: `成功匯入 Excel：更新/新增 ${updatedCount} 位學生成績 (衝突處理原則: ${resolution === 'overwrite' ? '強制覆寫' : '保留系統'})`
    });

    return { updatedCount, addedStudentCount, total: newStudentList.length };
  }

};
