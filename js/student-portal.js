/**
 * 體適能查詢與管理平台 - 學生端自服務查詢處理器 (Student Portal)
 * 前台安全隱私設計：姓名中間字自動去識別化遮蔽 (例如: 王小明 -> 王O明)
 */

window.StudentPortal = {
  init() {
    const searchInput = document.getElementById('studentIdInput');
    if (searchInput) {
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.doSearch();
      });
    }
    this.renderActiveAnnouncements();
    window.FitnessStore.subscribe(() => this.renderActiveAnnouncements());
  },

  renderActiveAnnouncements() {
    const e = window.SafeUI.escape.bind(window.SafeUI);
    const allAnnouncements = window.FitnessStore.getAnnouncements() || [];
    const today = new Date().toISOString().slice(0, 10);

    const activeList = allAnnouncements.filter(ann => {
      const start = ann.startDate || '2000-01-01';
      const end = ann.endDate || '2099-12-31';
      const isPublished = ann.isPublished !== false;
      return isPublished && start <= today && today <= end;
    });

    activeList.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    });

    const modalBody = document.getElementById('studentAnnouncementsModalBody');
    if (modalBody) {
      if (activeList.length === 0) {
        modalBody.innerHTML = `<div class="text-center py-12 text-slate-400 font-bold">目前暫無任何公告資訊</div>`;
      } else {
        const badgeColors = {
          '重要通知': 'bg-rose-100 text-rose-800 border-rose-200',
          '補測公告': 'bg-indigo-100 text-indigo-800 border-indigo-200',
          '申辦提醒': 'bg-amber-100 text-amber-800 border-amber-200',
          '課程資訊': 'bg-emerald-100 text-emerald-800 border-emerald-200'
        };

        const rowsHTML = activeList.map(ann => {
          const badgeClass = badgeColors[ann.category] || 'bg-blue-100 text-blue-800 border-blue-200';
          const isPinnedCard = ann.isPinned;
          const annId = window.SafeUI.domId(ann.id);
          if (!annId) return '';

          return `
            <tr role="button" tabindex="0" class="hover:bg-blue-50/50 transition-colors cursor-pointer ${isPinnedCard ? 'bg-amber-50/40 font-bold' : ''}" onclick="StudentPortal.toggleAnnouncementDetail('${annId}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();StudentPortal.toggleAnnouncementDetail('${annId}')}">
              <td class="py-3.5 px-4 font-mono text-xs text-slate-600 font-semibold whitespace-nowrap align-top">
                ${e(ann.startDate || ann.createdAt?.slice(0, 10) || '')}
              </td>
              <td class="py-3.5 px-3 text-center whitespace-nowrap align-top">
                <span class="text-xs font-extrabold px-2.5 py-0.5 rounded-md border ${badgeClass}">
                  ${e(ann.category || '重要通知')}
                </span>
              </td>
              <td class="py-3.5 px-4 text-slate-900 font-bold text-sm leading-relaxed align-top">
                <div class="flex items-center gap-1.5 flex-wrap">
                  ${isPinnedCard ? `<span class="bg-rose-100 text-rose-800 border border-rose-200 text-[11px] font-black px-1.5 py-0.5 rounded shrink-0">📌 置頂</span>` : ''}
                  <span>${e(ann.title)}</span>
                </div>
              </td>
              <td class="py-3.5 px-3 text-center font-bold text-xs text-blue-600 hover:text-blue-800 whitespace-nowrap align-top">
                <span id="annBtn_${annId}">觀看 ▾</span>
              </td>
            </tr>
            <tr id="annDetail_${annId}" class="hidden bg-slate-50/90 border-b border-slate-200">
              <td colspan="4" class="p-4 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-line border-t border-slate-200">
                <div class="font-bold text-slate-900 mb-1.5 flex items-center justify-between flex-wrap gap-2">
                  <span class="text-blue-900">📌 公告詳細說明內容：</span>
                  <span class="text-xs font-mono text-slate-500 font-normal">(刊登起訖時間：${e(ann.startDate)} ~ ${e(ann.endDate)})</span>
                </div>
                <div class="p-3.5 bg-white rounded-xl border border-slate-200 text-slate-800 font-medium shadow-2xs">
                  ${e(ann.content || '無詳細說明')}
                </div>
              </td>
            </tr>
          `;
        }).join('');

        modalBody.innerHTML = `
          <div class="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-slate-200 text-xs font-extrabold text-slate-700 bg-slate-100/90">
                  <th class="py-3 px-4 w-28 shrink-0">日期</th>
                  <th class="py-3 px-3 w-28 text-center shrink-0">分類</th>
                  <th class="py-3 px-4">公告標題</th>
                  <th class="py-3 px-3 w-20 text-center shrink-0">詳情</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${rowsHTML}
              </tbody>
            </table>
          </div>
        `;
      }
    }
  },

  toggleAnnouncementDetail(id) {
    const detailRow = document.getElementById(`annDetail_${id}`);
    const btnSpan = document.getElementById(`annBtn_${id}`);
    if (detailRow) {
      if (detailRow.classList.contains('hidden')) {
        detailRow.classList.remove('hidden');
        if (btnSpan) btnSpan.textContent = '收起 ▴';
      } else {
        detailRow.classList.add('hidden');
        if (btnSpan) btnSpan.textContent = '觀看 ▾';
      }
    }
  },

  openAnnouncementsModal() {
    this.renderActiveAnnouncements();
    const modal = document.getElementById('studentAnnouncementsModal');
    if (modal) modal.classList.remove('hidden');
  },

  closeAnnouncementsModal() {
    const modal = document.getElementById('studentAnnouncementsModal');
    if (modal) modal.classList.add('hidden');
  },

  clearSearch() {
    const input = document.getElementById('studentIdInput');
    if (input) {
      input.value = '';
      input.focus();
    }
    const resultContainer = document.getElementById('studentQueryResult');
    const emptyNotice = document.getElementById('studentQueryEmpty');

    if (resultContainer) resultContainer.classList.add('hidden');
    if (emptyNotice) {
      emptyNotice.classList.remove('hidden');
      emptyNotice.innerHTML = `
        <div class="w-12 h-12 bg-slate-100 text-slate-600 rounded-xl mx-auto flex items-center justify-center mb-3">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
        </div>
        <h3 class="text-base font-bold text-slate-800 mb-1.5">請輸入學號查詢</h3>
        <p class="text-sm text-slate-600 font-normal max-w-md mx-auto leading-relaxed">
          📌 本系統目前僅開放當學期「三、四年級學生」查詢體適能與畢業門檻資料；如有相關疑問，請洽學務處體育及活動組(分機：2213)。
        </p>
      `;
    }
  },

  maskStudentName(name) {
    if (!name || typeof name !== 'string') return '';
    const str = name.trim();
    if (str.length <= 1) return str;
    if (str.length === 2) return str[0] + '〇';
    if (str.length === 3) return str[0] + '〇' + str[2];
    return str[0] + '〇' + str.slice(2);
  },

  async doSearch() {
    const input = document.getElementById('studentIdInput');
    const rawQuery = input ? input.value.trim() : '';
    const query = window.SafeUI.studentId(rawQuery);

    const resultContainer = document.getElementById('studentQueryResult');
    const emptyNotice = document.getElementById('studentQueryEmpty');

    if (!rawQuery) {
      this.showToast('請輸入學號進行查詢', 'warning');
      return;
    }
    if (!query) {
      this.showToast('學號僅能輸入 6 至 12 碼數字', 'warning');
      return;
    }

    const searchButton = document.querySelector('[data-student-search-button]');
    if (searchButton) {
      searchButton.disabled = true;
      searchButton.setAttribute('aria-busy', 'true');
    }

    let student = window.AdminPortal?.isAdminLoggedIn
      ? window.FitnessStore.getStudentById(query)
      : null;
    let lookupRecords = student ? window.FitnessStore.getFitnessRecords(query) : [];

    if (!student) {
      const lookup = await window.FitnessFirebase.loadStudentLookup(query);
      student = lookup?.student || null;
      lookupRecords = Array.isArray(lookup?.records) ? lookup.records : [];
    }

    if (searchButton) {
      searchButton.disabled = false;
      searchButton.removeAttribute('aria-busy');
    }

    if (!student) {
      resultContainer.classList.add('hidden');
      emptyNotice.classList.remove('hidden');
      emptyNotice.innerHTML = `
        <div class="p-8 text-center bg-rose-50 border border-rose-200 rounded-lg">
          <div class="w-12 h-12 bg-white text-rose-500 rounded-full border border-rose-200 mx-auto flex items-center justify-center mb-3">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>
          <h3 class="text-base font-bold text-slate-900 mb-1.5">查無學號 [${window.SafeUI.escape(query)}] 之體適能檢測紀錄</h3>
          <p class="text-sm text-slate-600 font-normal max-w-md mx-auto">
            📌 本系統目前僅開放當學期「三、四年級學生」查詢體適能與畢業門檻資料；如有相關疑問，請洽學務處體育及活動組(分機：2213)。
          </p>
        </div>
      `;
      return;
    }

    emptyNotice.classList.add('hidden');
    resultContainer.classList.remove('hidden');

    this.renderResultCard(student, lookupRecords);
  },

  renderResultCard(student, lookupRecords = null) {
    const e = window.SafeUI.escape.bind(window.SafeUI);
    const reqPass = window.FitnessStore.settings.requiredPassCount || 2;
    const isPassed = student.status === '通過';
    const isExempt = (Number(student.isExemptAthleteOrDisabled) > 0) || (Number(student.exemptCredit) > 0);
    const passCount = Number(student.passCount || 0);
    const deficitCount = isPassed ? 0 : Math.max(0, reqPass - passCount);
    const progressPercent = isPassed ? 100 : Math.min(100, Math.round((passCount / reqPass) * 100));

    const maskedName = this.maskStudentName(student.name);

    const specText = `${student.specialIdentity || ''} ${student.identityStatus || ''} ${student.otherNotes || ''} ${student.reason || ''}`;
    const isDisability = Number(student.isExemptAthleteOrDisabled) === 2 || /身障|身心障礙|殘障|醫療免測/.test(specText);
    const isAthlete = Number(student.isExemptAthleteOrDisabled) === 1 || /體保|體育保送|運動代表隊/.test(specText);

    let statusPillHtml = '';
    if (isDisability) {
      statusPillHtml = `
        <div class="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
        </div>
        <div>
          <div class="text-lg sm:text-xl font-bold text-purple-700 tracking-tight">身障免測核可</div>
          <div class="text-xs font-semibold text-slate-400">畢業門檻</div>
        </div>
      `;
    } else if (isAthlete) {
      statusPillHtml = `
        <div class="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
        </div>
        <div>
          <div class="text-lg sm:text-xl font-bold text-indigo-700 tracking-tight">體保生免測</div>
          <div class="text-xs font-semibold text-slate-400">畢業門檻</div>
        </div>
      `;
    } else if (isExempt) {
      statusPillHtml = `
        <div class="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
        </div>
        <div>
          <div class="text-lg sm:text-xl font-bold text-amber-700 tracking-tight">核可免測身分</div>
          <div class="text-xs font-semibold text-slate-400">畢業門檻</div>
        </div>
      `;
    } else if (isPassed) {
      statusPillHtml = `
        <div class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
        </div>
        <div>
          <div class="text-lg sm:text-xl font-bold text-emerald-700 tracking-tight">合格</div>
          <div class="text-xs font-semibold text-slate-400">畢業門檻</div>
        </div>
      `;
    } else {
      statusPillHtml = `
        <div class="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
        </div>
        <div>
          <div class="text-lg sm:text-xl font-bold text-rose-600 tracking-tight">未合格</div>
          <div class="text-xs font-semibold text-slate-400">畢業門檻</div>
        </div>
      `;
    }

    const semMap = student.semesters || {};
    const passedSemesters = [];
    Object.keys(semMap).sort().forEach(sem => {
      if (Number(semMap[sem]) === 1) {
        passedSemesters.push(sem);
      }
    });

    let semesterListHtml = '';
    if (passedSemesters.length > 0) {
      semesterListHtml = `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          ${passedSemesters.map(sem => {
            const formattedSem = `${sem.slice(0, 3)}-${sem.slice(3)}`;
            return `
              <div class="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80 shadow-2xs hover:bg-white transition-colors">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-teal-700 text-white flex items-center justify-center font-extrabold text-xs shrink-0 font-mono shadow-2xs">
                    ${sem}
                  </div>
                  <div>
                    <div class="text-sm font-bold text-slate-900">${formattedSem} 學期</div>
                    <div class="text-xs text-slate-500 font-medium">體適能檢測：採計 1 次</div>
                  </div>
                </div>
                <span class="bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs px-2.5 py-1 rounded-md font-bold">通過達標</span>
              </div>
            `;
          }).join('')}
        </div>
      `;
    } else {
      semesterListHtml = `
        <div class="p-8 rounded-xl bg-slate-50 border border-slate-200 border-dashed text-center">
          <div class="w-12 h-12 bg-white text-slate-400 rounded-full border border-slate-200 shadow-2xs mx-auto flex items-center justify-center mb-3">
            <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <div class="text-sm font-bold text-slate-700">目前尚無任何學期通過紀錄</div>
          <div class="text-xs font-medium text-slate-400 mt-1">若有疑問請洽詢體育組查核</div>
        </div>
      `;
    }

    const profileCardHtml = `
      <!-- Administrative Academic Student Card Header (Exact Match with User Mockup) -->
      <div class="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm mb-6 overflow-x-auto">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-5 md:gap-0 md:divide-x divide-slate-200/80 min-w-max md:min-w-0">
          
          <!-- 區塊 1: 頭像、姓名、班級、在學狀態 -->
          <div class="flex items-center gap-4 md:pr-8 shrink-0">
            <div class="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-2xl shrink-0 shadow-xs">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            </div>
            
            <div class="space-y-1">
              <h2 class="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight whitespace-nowrap">
                ${e(maskedName)}
              </h2>
              <div class="flex items-center gap-2 text-sm whitespace-nowrap">
                <span class="font-bold text-slate-700 whitespace-nowrap">${e(student.className || '班級')}</span>
                <span class="bg-emerald-100/80 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0"></span>
                  <span>${e(student.rosterStatus || '在學')}</span>
                </span>
              </div>
            </div>
          </div>

          <!-- 區塊 2: 學號 -->
          <div class="space-y-1 md:px-8 shrink-0">
            <div class="text-xs font-semibold text-slate-400 whitespace-nowrap">學號</div>
            <div class="text-lg sm:text-xl font-bold text-slate-900 font-mono tracking-tight whitespace-nowrap">${e(student.studentId)}</div>
          </div>

          <!-- 區塊 3: 入學年度 -->
          <div class="space-y-1 md:px-8 shrink-0">
            <div class="text-xs font-semibold text-slate-400 whitespace-nowrap">入學年度</div>
            <div class="text-lg sm:text-xl font-bold text-slate-900 tracking-tight whitespace-nowrap">
              ${e(student.enrollYear ? `${student.enrollYear} 學年度` : (window.FitnessStore.getEnrollYearFromStudentId(student.studentId) ? `${window.FitnessStore.getEnrollYearFromStudentId(student.studentId)} 學年度` : '-'))}
            </div>
          </div>

          <!-- 區塊 4: 畢業門檻狀態 (狀態膠囊) -->
          <div class="flex items-center gap-3 md:pl-8 shrink-0 whitespace-nowrap">
            ${statusPillHtml}
          </div>
        </div>
      </div>

      <!-- Metric Grid Summary Cards (100% Match with Mockup 2) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <!-- 畢業門檻累計進度 -->
        <div class="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-2.5">
              <span class="text-sm font-bold text-slate-500">畢業門檻累計進度</span>
              <span class="text-base sm:text-lg font-bold font-mono ${isPassed ? 'text-emerald-600' : 'text-rose-600'}">
                ${isExempt ? '免測核可' : `${progressPercent}%`}
              </span>
            </div>
            <div class="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              已採計 <span class="${isPassed ? 'text-emerald-600' : 'text-blue-600'}">${passCount}</span> / ${reqPass} 次
              ${deficitCount > 0 ? `<span class="text-rose-600 text-xs font-bold ml-1.5">(尚差 ${deficitCount} 次)</span>` : ''}
            </div>
          </div>
          <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all duration-700 ease-out ${isPassed ? 'bg-emerald-500' : 'bg-rose-500'}" style="width: ${progressPercent}%;"></div>
          </div>
        </div>

        <!-- 畢業門檻審核標準 -->
        <div class="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm font-bold text-slate-500">畢業門檻審核標準</span>
            <span class="bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs px-2.5 py-0.5 rounded-full font-bold">校規規定</span>
          </div>
          <div class="flex items-center gap-2.5">
            <div class="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
            </div>
            <span class="text-base sm:text-lg font-bold text-slate-900">
              合格標準：通過達 <span class="text-emerald-600 font-bold">${reqPass}</span> 個學期
            </span>
          </div>
          <div class="text-xs text-slate-400 font-semibold">
            在校期間體適能檢測成績達標即可採計門檻
          </div>
        </div>
      </div>

      ${Number(student.isTransfer) === 1 || Number(student.transferCredit) === 1 ? `
        <div class="mb-6 p-4 bg-amber-50 border border-amber-200/80 rounded-2xl text-sm text-amber-900 font-bold flex items-center gap-2.5 shadow-2xs">
          <svg class="w-5 h-5 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <span>📌 轉學扣抵註記：已採計轉學折抵 1 次通過次數。</span>
        </div>
      ` : ''}

      ${student.reason || student.otherNotes ? `
        <div class="mb-6 p-4.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm text-slate-700">
          <div class="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
            <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            異動原因 / 審核備註
          </div>
          ${e(student.reason || student.otherNotes)} <span class="text-slate-400 ml-1 font-mono text-xs">(${e(student.updatedAt || '')})</span>
        </div>
      ` : ''}

      <!-- 歷學期體適能檢測通過清單 (Exact Match with Mockup 2) -->
      <div class="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-7 mb-6">
        <div class="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 class="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5">
            <div class="w-6 h-6 rounded-full border-2 border-emerald-600 text-emerald-600 flex items-center justify-center shrink-0">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
            </div>
            <span>歷學期體適能檢測通過清單</span>
          </h3>
          <span class="bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-3.5 py-1 rounded-full text-xs sm:text-sm font-bold">
            已通過 ${passedSemesters.length} 個學期
          </span>
        </div>

        <div class="pt-5">
          ${passedSemesters.length > 0 ? `
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              ${passedSemesters.map(sem => {
                const formattedSem = `${sem.slice(0, 3)}-${sem.slice(3)}`;
                return `
                  <div class="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-colors">
                    <div class="flex items-center gap-3.5">
                      <div class="w-12 h-12 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-sm font-mono shrink-0 shadow-2xs">
                        ${sem}
                      </div>
                      <div class="space-y-0.5">
                        <div class="text-base font-bold text-slate-900">${formattedSem} 學期</div>
                        <div class="text-xs text-slate-400 font-semibold">體適能檢測：採計 1 次</div>
                      </div>
                    </div>
                    <span class="bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs px-3 py-1 rounded-full font-bold inline-flex items-center gap-1.5 shrink-0">
                      <svg class="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      通過達標
                    </span>
                  </div>
                `;
              }).join('')}
            </div>
          ` : `
            <div class="p-8 rounded-xl bg-slate-50 border border-slate-200 border-dashed text-center">
              <div class="w-12 h-12 bg-white text-slate-400 rounded-full border border-slate-200 shadow-2xs mx-auto flex items-center justify-center mb-3">
                <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <div class="text-sm font-bold text-slate-700">目前尚無任何學期通過紀錄</div>
              <div class="text-xs font-medium text-slate-400 mt-1">若有疑問請洽詢體育組查核</div>
            </div>
          `}
        </div>
      </div>
    `;

    const records = Array.isArray(lookupRecords) ? lookupRecords : window.FitnessStore.getFitnessRecords(student.studentId);
    let detailTableHtml = '';

    if (records.length > 0) {
      detailTableHtml = `
        <!-- 歷學期體適能四項評測指標明細 (Exact Match with Mockup 3) -->
        <div class="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-7 mb-6">
          
          <!-- 標頭 -->
          <div class="flex items-center gap-2.5 mb-5">
            <svg class="w-6 h-6 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
            <h3 class="text-lg sm:text-xl font-bold text-slate-900">歷學期體適能四項評測指標明細</h3>
          </div>

          <!-- 表格卡片容器 (灰色 Header 背景 + 圓角外框) -->
          <div class="rounded-2xl border border-slate-200/80 overflow-hidden bg-white">
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="bg-slate-50/90 border-b border-slate-200/80 text-slate-700 font-bold">
                    <th class="py-3.5 px-4 text-left whitespace-nowrap">評測學期</th>
                    <th class="py-3.5 px-4 text-center whitespace-nowrap">坐姿體前彎 (cm)</th>
                    <th class="py-3.5 px-4 text-center whitespace-nowrap">立定跳遠 (cm)</th>
                    <th class="py-3.5 px-4 text-center whitespace-nowrap">仰臥起坐 (次/分)</th>
                    <th class="py-3.5 px-4 text-center whitespace-nowrap">心肺耐力登階</th>
                    <th class="py-3.5 px-4 text-center whitespace-nowrap">評測結果</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  ${records.map(r => `
                    <tr class="hover:bg-slate-50/50 transition-colors">
                      <td class="py-4 px-4 font-bold text-slate-900 font-mono text-left whitespace-nowrap">
                        ${e(r.semester)} 學期
                      </td>
                      <td class="py-4 px-4 text-center font-bold text-slate-800 font-mono">${e(r.scores?.sitAndReach || '-')}</td>
                      <td class="py-4 px-4 text-center font-bold text-slate-800 font-mono">${e(r.scores?.standingLongJump || '-')}</td>
                      <td class="py-4 px-4 text-center font-bold text-slate-800 font-mono">${e(r.scores?.sitUps || '-')}</td>
                      <td class="py-4 px-4 text-center font-bold text-slate-800 font-mono">${e(String(r.scores?.cardio || '-').replace('登階:', ''))}</td>
                      <td class="py-4 px-4 text-center whitespace-nowrap">
                        <span class="${r.isPassed ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80' : 'bg-rose-50 text-rose-800 border border-rose-200/80'} text-xs px-3 py-1 rounded-full font-bold inline-flex items-center gap-1">
                          <svg class="w-3.5 h-3.5 ${r.isPassed ? 'text-emerald-600' : 'text-rose-600'} shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            ${r.isPassed ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>' : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>'}
                          </svg>
                          ${r.isPassed ? '合格' : '未達標'}
                        </span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- 下方校規備註 -->
          <div class="mt-4 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <svg class="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span>各項指標數值依校規標準進行評定，詳細標準請參考校規規定。</span>
          </div>
        </div>
      `;
    }

    const guidanceHtml = !isPassed ? `
      <div class="bg-rose-50/60 rounded-2xl border border-rose-200 p-6 sm:p-8">
        <h4 class="font-bold text-rose-900 text-base mb-3 flex items-center gap-2">
          <svg class="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          未合格學生說明
        </h4>
        <ul class="list-disc list-inside text-sm text-slate-700 space-y-2 leading-relaxed font-medium">
          <li><strong>參加全校體適能檢測：</strong>請於每學期指定週次報名全校體適能檢測。</li>
          <li><strong>修習體適能補救課程：</strong>修畢相關課程且成績及格後可申請採計。</li>
          <li><strong>免測資格申辦：</strong>轉學扣抵、體保生或醫療障礙請攜帶佐證向體育組辦理。</li>
        </ul>
      </div>
    ` : '';

    const container = document.getElementById('studentQueryResult');
    container.innerHTML = `
      ${profileCardHtml}
      ${detailTableHtml}
      ${guidanceHtml}
    `;
  },

  showToast(msg, type = 'info') {
    if (window.App && window.App.showToast) window.App.showToast(msg, type);
    else alert(msg);
  },

  activeAnnouncementCategory: 'ALL',
  announcementSearchKeyword: '',

  filterAnnouncementCategory(cat) {
    this.activeAnnouncementCategory = cat;
    document.querySelectorAll('.ann-cat-pill').forEach(btn => {
      if (btn.getAttribute('data-ann-cat') === cat) {
        btn.className = 'ann-cat-pill active px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-blue-600 text-white shadow-2xs transition-all cursor-pointer';
      } else {
        btn.className = 'ann-cat-pill px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all cursor-pointer';
      }
    });
    this.renderAnnouncementsPage();
  },

  handleAnnouncementSearch() {
    const input = document.getElementById('announcementSearchInput');
    const clearBtn = document.getElementById('announcementSearchClearBtn');
    if (input) {
      this.announcementSearchKeyword = input.value.trim().toLowerCase();
      if (clearBtn) {
        if (input.value.length > 0) clearBtn.classList.remove('hidden');
        else clearBtn.classList.add('hidden');
      }
    }
    this.renderAnnouncementsPage();
  },

  clearAnnouncementSearch() {
    const input = document.getElementById('announcementSearchInput');
    const clearBtn = document.getElementById('announcementSearchClearBtn');
    if (input) input.value = '';
    if (clearBtn) clearBtn.classList.add('hidden');
    this.announcementSearchKeyword = '';
    this.renderAnnouncementsPage();
  },

  renderAnnouncementsPage() {
    const e = window.SafeUI.escape.bind(window.SafeUI);
    const container = document.getElementById('announcementsPageTableContainer');
    if (!container) return;

    const allAnnouncements = window.FitnessStore.getAnnouncements() || [];
    const today = new Date().toISOString().slice(0, 10);

    let list = allAnnouncements.filter(ann => {
      const start = ann.startDate || '2000-01-01';
      const end = ann.endDate || '2099-12-31';
      const isPublished = ann.isPublished !== false;
      return isPublished && start <= today && today <= end;
    });

    if (this.activeAnnouncementCategory !== 'ALL') {
      list = list.filter(ann => ann.category === this.activeAnnouncementCategory);
    }

    if (this.announcementSearchKeyword) {
      const kw = this.announcementSearchKeyword;
      list = list.filter(ann => (ann.title || '').toLowerCase().includes(kw) || (ann.content || '').toLowerCase().includes(kw));
    }

    list.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    });

    if (list.length === 0) {
      container.innerHTML = `<div class="bg-slate-50 rounded-xl border border-slate-200 border-dashed p-10 text-center text-slate-400 font-bold">無符合條件之最新公告事項</div>`;
      return;
    }

    const badgeColors = {
      '重要通知': 'bg-rose-50 text-rose-700 border-rose-200',
      '補測公告': 'bg-blue-50 text-blue-700 border-blue-200',
      '申辦提醒': 'bg-amber-50 text-amber-800 border-amber-200',
      '課程資訊': 'bg-emerald-50 text-emerald-800 border-emerald-200'
    };

    const rowsHTML = list.map(ann => {
      const badgeClass = badgeColors[ann.category] || 'bg-slate-100 text-slate-700 border-slate-200';
      const isPinnedCard = ann.isPinned;
      const annId = window.SafeUI.domId(ann.id);
      if (!annId) return '';

      return `
        <tr role="button" tabindex="0" class="hover:bg-slate-50/80 transition-colors cursor-pointer ${isPinnedCard ? 'bg-amber-50/30' : ''}" onclick="StudentPortal.toggleAnnouncementDetail('${annId}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();StudentPortal.toggleAnnouncementDetail('${annId}')}">
          <td class="py-4 px-5 font-mono text-sm text-slate-600 font-semibold whitespace-nowrap align-top">
            ${e(ann.startDate || ann.createdAt?.slice(0, 10) || '')}
          </td>
          <td class="py-4 px-4 text-center whitespace-nowrap align-top">
            <span class="text-xs font-extrabold px-2.5 py-1 rounded-md border ${badgeClass}">
              ${e(ann.category || '重要通知')}
            </span>
          </td>
          <td class="py-4 px-5 text-slate-900 font-bold text-[15px] leading-relaxed align-top">
            <div class="flex items-center gap-2 flex-wrap">
              ${isPinnedCard ? `<span class="bg-rose-600 text-white text-[11px] font-black px-2 py-0.5 rounded-md shadow-2xs shrink-0 tracking-wider">置頂</span>` : ''}
              <span class="hover:text-blue-600 transition-colors">${e(ann.title)}</span>
            </div>
          </td>
        </tr>
        <tr id="annDetail_${annId}" class="hidden bg-slate-50 border-b border-slate-200">
          <td colspan="3" class="p-5 text-sm text-slate-700 leading-relaxed font-medium border-t border-slate-200">
            <div class="font-extrabold text-slate-900 mb-2 flex items-center justify-between flex-wrap gap-2">
              <span class="text-blue-900 text-base">📌 公告詳細說明內容：</span>
              <span class="text-xs font-mono text-slate-500 font-normal">(刊登起訖時間：${e(ann.startDate)} ~ ${e(ann.endDate)})</span>
            </div>
            <div class="p-4 bg-white rounded-xl border border-slate-200 text-slate-800 font-medium shadow-2xs leading-relaxed whitespace-pre-line">${e((ann.content || '無詳細說明').trim())}</div>
          </td>
        </tr>
      `;
    }).join('');

    container.innerHTML = `
      <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-200 text-sm font-extrabold text-slate-700 bg-slate-50">
              <th class="py-3.5 px-5 w-32 shrink-0">日期</th>
              <th class="py-3.5 px-4 w-36 text-center shrink-0">分類</th>
              <th class="py-3.5 px-5">標題</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${rowsHTML}
          </tbody>
        </table>
      </div>
    `;
  },

  toggleAnnouncementDetail(id) {
    const targetRow = document.getElementById(`annDetail_${id}`);
    if (!targetRow) return;

    const isCurrentlyHidden = targetRow.classList.contains('hidden');

    // 1. 手風琴效果：先將全站所有已展開的公告詳情一律隱藏收合
    document.querySelectorAll('[id^="annDetail_"]').forEach(el => el.classList.add('hidden'));

    // 2. 若點擊的項目原本是收合狀態，則僅單獨展開此項目
    if (isCurrentlyHidden) {
      targetRow.classList.remove('hidden');
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.StudentPortal.init();
});
