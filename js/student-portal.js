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
    const allAnnouncements = window.FitnessStore.getAnnouncements() || [];
    const today = new Date().toISOString().slice(0, 10);
    const activeList = allAnnouncements.filter(ann => {
      const start = ann.startDate || '2000-01-01';
      const end = ann.endDate || '2099-12-31';
      return start <= today && today <= end;
    });
    activeList.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    });
    const modalBody = document.getElementById('studentAnnouncementsModalBody');
    if (modalBody) {
      if (activeList.length === 0) {
        modalBody.innerHTML = `<div class="text-center py-12 text-slate-400 font-bold">\u76ee\u524d\u66ab\u7121\u4efb\u4f55\u516c\u544a\u8cc7\u8a0a</div>`;
      } else {
        const badgeColors = {
          '\u91cd\u8981\u901a\u77e5': 'bg-rose-100 text-rose-800 border-rose-200',
          '\u88dc\u6e2c\u516c\u544a': 'bg-indigo-100 text-indigo-800 border-indigo-200',
          '\u7533\u8fa6\u63d0\u9192': 'bg-amber-100 text-amber-800 border-amber-200',
          '\u8ab2\u7a0b\u8cc7\u8a0a': 'bg-emerald-100 text-emerald-800 border-emerald-200'
        };
        modalBody.innerHTML = activeList.map(ann => {
          const badgeClass = badgeColors[ann.category] || 'bg-blue-100 text-blue-800 border-blue-200';
          return `
            <div class="p-4 rounded-xl border border-slate-200 ${ann.isPinned ? 'bg-amber-50/40 border-amber-200/80' : 'bg-slate-50/70'} transition-all shadow-2xs">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div class="flex items-center gap-2 flex-wrap">
                  ${ann.isPinned ? `<span class="bg-rose-600 text-white text-[11px] font-black px-2 py-0.5 rounded shadow-2xs">\ud83d\udccc \u7f6e\u9802</span>` : ''}
                  <span class="text-xs font-bold px-2.5 py-0.5 rounded-md border ${badgeClass}">${ann.category || '\u91cd\u8981\u901a\u77e5'}</span>
                  <h4 class="text-sm font-bold text-slate-900">${ann.title}</h4>
                </div>
                <span class="text-xs font-mono text-slate-500 shrink-0 font-medium">
                  ${ann.startDate} ~ ${ann.endDate}
                </span>
              </div>
              ${ann.content ? `<p class="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium mt-1.5 whitespace-pre-line pl-2.5 border-l-2 border-slate-300">${ann.content}</p>` : ''}
            </div>
          `;
        }).join('');
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
        <h3 class="text-base font-bold text-slate-800 mb-1.5">\u8acb\u8f38\u5165\u5b78\u865f\u67e5\u8a62</h3>
        <p class="text-sm text-slate-600 font-normal max-w-md mx-auto leading-relaxed">
          \ud83d\udccc \u672c\u7cfb\u7d71\u76ee\u524d\u50c5\u958b\u653e\u7576\u5b78\u671f\u300c\u4e09\u3001\u56db\u5e74\u7d1a\u5b78\u751f\u300d\u67e5\u8a62\u9ad4\u9069\u80fd\u8207\u7562\u696d\u9580\u6abb\u8cc7\u6599\uff1b\u5982\u6709\u76f8\u95dc\u7591\u554f\uff0c\u8acb\u6d3d\u5b78\u52d9\u8655\u9ad4\u80b2\u53ca\u6d3b\u52d5\u7d44(\u5206\u6a5f\uff1a2213)\u3002
        </p>
      `;
    }
  },
  maskStudentName(name) {
    if (!name || typeof name !== 'string') return '';
    const str = name.trim();
    if (str.length <= 1) return str;
    if (str.length === 2) return str[0] + '\u3007';
    if (str.length === 3) return str[0] + '\u3007' + str[2];
    return str[0] + '\u3007' + str.slice(2);
  },
  doSearch() {
    const input = document.getElementById('studentIdInput');
    const query = input ? input.value.trim() : '';
    const resultContainer = document.getElementById('studentQueryResult');
    const emptyNotice = document.getElementById('studentQueryEmpty');
    if (!query) {
      this.showToast('\u8acb\u8f38\u5165\u5b78\u865f\u9032\u884c\u67e5\u8a62', 'warning');
      return;
    }
    const student = window.FitnessStore.getStudentById(query);
    if (!student) {
      resultContainer.classList.add('hidden');
      emptyNotice.classList.remove('hidden');
      emptyNotice.innerHTML = `
        <div class="p-8 text-center bg-rose-50 border border-rose-200 rounded-lg">
          <div class="w-12 h-12 bg-white text-rose-500 rounded-full border border-rose-200 mx-auto flex items-center justify-center mb-3">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>
          <h3 class="text-base font-bold text-slate-900 mb-1.5">\u67e5\u7121\u5b78\u865f [${query}] \u4e4b\u9ad4\u9069\u80fd\u6aa2\u6e2c\u7d00\u9304</h3>
          <p class="text-sm text-slate-600 font-normal max-w-md mx-auto">
            \ud83d\udccc \u672c\u7cfb\u7d71\u76ee\u524d\u50c5\u958b\u653e\u7576\u5b78\u671f\u300c\u4e09\u3001\u56db\u5e74\u7d1a\u5b78\u751f\u300d\u67e5\u8a62\u9ad4\u9069\u80fd\u8207\u7562\u696d\u9580\u6abb\u8cc7\u6599\uff1b\u5982\u6709\u76f8\u95dc\u7591\u554f\uff0c\u8acb\u6d3d\u5b78\u52d9\u8655\u9ad4\u80b2\u53ca\u6d3b\u52d5\u7d44(\u5206\u6a5f\uff1a2213)\u3002
          </p>
        </div>
      `;
      return;
    }
    emptyNotice.classList.add('hidden');
    resultContainer.classList.remove('hidden');
    this.renderResultCard(student);
  },
  renderResultCard(student) {
    const reqPass = window.FitnessStore.settings.requiredPassCount || 2;
    const isPassed = student.status === '\u901a\u904e';
    const isExempt = (Number(student.isExemptAthleteOrDisabled) > 0) || (Number(student.exemptCredit) > 0);
    const passCount = Number(student.passCount || 0);
    const deficitCount = isPassed ? 0 : Math.max(0, reqPass - passCount);
    const progressPercent = isPassed ? 100 : Math.min(100, Math.round((passCount / reqPass) * 100));
    const maskedName = this.maskStudentName(student.name);
    const specText = `${student.specialIdentity || ''} ${student.identityStatus || ''} ${student.otherNotes || ''} ${student.reason || ''}`;
    const isDisability = Number(student.isExemptAthleteOrDisabled) === 2 || /\u8eab\u969c|\u8eab\u5fc3\u969c\u7919|\u6b98\u969c|\u91ab\u7642\u514d\u6e2c/.test(specText);
    const isAthlete = Number(student.isExemptAthleteOrDisabled) === 1 || /\u9ad4\u4fdd|\u9ad4\u80b2\u4fdd\u9001|\u904b\u52d5\u4ee3\u8868\u968a/.test(specText);
    let statusPillHtml = '';
    if (isDisability) {
      statusPillHtml = `
        <div class="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
        </div>
        <div>
          <div class="text-lg sm:text-xl font-bold text-purple-700 tracking-tight">\u8eab\u969c\u514d\u6e2c\u6838\u53ef</div>
          <div class="text-xs font-semibold text-slate-400">\u7562\u696d\u9580\u6abb</div>
        </div>
      `;
    } else if (isAthlete) {
      statusPillHtml = `
        <div class="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
        </div>
        <div>
          <div class="text-lg sm:text-xl font-bold text-indigo-700 tracking-tight">\u9ad4\u4fdd\u751f\u514d\u6e2c</div>
          <div class="text-xs font-semibold text-slate-400">\u7562\u696d\u9580\u6abb</div>
        </div>
      `;
    } else if (isExempt) {
      statusPillHtml = `
        <div class="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
        </div>
        <div>
          <div class="text-lg sm:text-xl font-bold text-amber-700 tracking-tight">\u6838\u53ef\u514d\u6e2c\u8eab\u5206</div>
          <div class="text-xs font-semibold text-slate-400">\u7562\u696d\u9580\u6abb</div>
        </div>
      `;
    } else if (isPassed) {
      statusPillHtml = `
        <div class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
        </div>
        <div>
          <div class="text-lg sm:text-xl font-bold text-emerald-700 tracking-tight">\u5408\u683c</div>
          <div class="text-xs font-semibold text-slate-400">\u7562\u696d\u9580\u6abb</div>
        </div>
      `;
    } else {
      statusPillHtml = `
        <div class="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
        </div>
        <div>
          <div class="text-lg sm:text-xl font-bold text-rose-600 tracking-tight">\u672a\u5408\u683c</div>
          <div class="text-xs font-semibold text-slate-400">\u7562\u696d\u9580\u6abb</div>
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
                    <div class="text-sm font-bold text-slate-900">${formattedSem} \u5b78\u671f</div>
                    <div class="text-xs text-slate-500 font-medium">\u9ad4\u9069\u80fd\u6aa2\u6e2c\uff1a\u63a1\u8a08 1 \u6b21</div>
                  </div>
                </div>
                <span class="bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs px-2.5 py-1 rounded-md font-bold">\u901a\u904e\u9054\u6a19</span>
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
          <div class="text-sm font-bold text-slate-700">\u76ee\u524d\u5c1a\u7121\u4efb\u4f55\u5b78\u671f\u901a\u904e\u7d00\u9304</div>
          <div class="text-xs font-medium text-slate-400 mt-1">\u82e5\u6709\u7591\u554f\u8acb\u6d3d\u8a62\u9ad4\u80b2\u7d44\u67e5\u6838</div>
        </div>
      `;
    }
    const profileCardHtml = `
      <!-- Administrative Academic Student Card Header (Exact Match with User Mockup) -->
      <div class="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm mb-6 overflow-x-auto">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-5 md:gap-0 md:divide-x divide-slate-200/80 min-w-max md:min-w-0">
          <!-- \u5340\u584a 1: \u982d\u50cf\u3001\u59d3\u540d\u3001\u73ed\u7d1a\u3001\u5728\u5b78\u72c0\u614b -->
          <div class="flex items-center gap-4 md:pr-8 shrink-0">
            <div class="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-2xl shrink-0 shadow-xs">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            </div>
            <div class="space-y-1">
              <h2 class="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight whitespace-nowrap">
                ${maskedName}
              </h2>
              <div class="flex items-center gap-2 text-sm whitespace-nowrap">
                <span class="font-bold text-slate-700 whitespace-nowrap">${student.className || '\u73ed\u7d1a'}</span>
                <span class="bg-emerald-100/80 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0"></span>
                  <span>${student.rosterStatus || '\u5728\u5b78'}</span>
                </span>
              </div>
            </div>
          </div>
          <!-- \u5340\u584a 2: \u5b78\u865f -->
          <div class="space-y-1 md:px-8 shrink-0">
            <div class="text-xs font-semibold text-slate-400 whitespace-nowrap">\u5b78\u865f</div>
            <div class="text-lg sm:text-xl font-bold text-slate-900 font-mono tracking-tight whitespace-nowrap">${student.studentId}</div>
          </div>
          <!-- \u5340\u584a 3: \u5165\u5b78\u5e74\u5ea6 -->
          <div class="space-y-1 md:px-8 shrink-0">
            <div class="text-xs font-semibold text-slate-400 whitespace-nowrap">\u5165\u5b78\u5e74\u5ea6</div>
            <div class="text-lg sm:text-xl font-bold text-slate-900 tracking-tight whitespace-nowrap">
              ${student.enrollYear ? `${student.enrollYear} \u5b78\u5e74\u5ea6` : (window.FitnessStore.getEnrollYearFromStudentId(student.studentId) ? `${window.FitnessStore.getEnrollYearFromStudentId(student.studentId)} \u5b78\u5e74\u5ea6` : '-')}
            </div>
          </div>
          <!-- \u5340\u584a 4: \u7562\u696d\u9580\u6abb\u72c0\u614b (\u72c0\u614b\u81a0\u56ca) -->
          <div class="flex items-center gap-3 md:pl-8 shrink-0 whitespace-nowrap">
            ${statusPillHtml}
          </div>
        </div>
      </div>
      <!-- Metric Grid Summary Cards (100% Match with Mockup 2) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <!-- \u7562\u696d\u9580\u6abb\u7d2f\u8a08\u9032\u5ea6 -->
        <div class="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-2.5">
              <span class="text-sm font-bold text-slate-500">\u7562\u696d\u9580\u6abb\u7d2f\u8a08\u9032\u5ea6</span>
              <span class="text-base sm:text-lg font-bold font-mono ${isPassed ? 'text-emerald-600' : 'text-rose-600'}">
                ${isExempt ? '\u514d\u6e2c\u6838\u53ef' : `${progressPercent}%`}
              </span>
            </div>
            <div class="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              \u5df2\u63a1\u8a08 <span class="${isPassed ? 'text-emerald-600' : 'text-blue-600'}">${passCount}</span> / ${reqPass} \u6b21
              ${deficitCount > 0 ? `<span class="text-rose-600 text-xs font-bold ml-1.5">(\u5c1a\u5dee ${deficitCount} \u6b21)</span>` : ''}
            </div>
          </div>
          <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all duration-700 ease-out ${isPassed ? 'bg-emerald-500' : 'bg-rose-500'}" style="width: ${progressPercent}%;"></div>
          </div>
        </div>
        <!-- \u7562\u696d\u9580\u6abb\u5be9\u6838\u6a19\u6e96 -->
        <div class="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm font-bold text-slate-500">\u7562\u696d\u9580\u6abb\u5be9\u6838\u6a19\u6e96</span>
            <span class="bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs px-2.5 py-0.5 rounded-full font-bold">\u6821\u898f\u898f\u5b9a</span>
          </div>
          <div class="flex items-center gap-2.5">
            <div class="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
            </div>
            <span class="text-base sm:text-lg font-bold text-slate-900">
              \u5408\u683c\u6a19\u6e96\uff1a\u901a\u904e\u9054 <span class="text-emerald-600 font-bold">${reqPass}</span> \u500b\u5b78\u671f
            </span>
          </div>
          <div class="text-xs text-slate-400 font-semibold">
            \u5728\u6821\u671f\u9593\u9ad4\u9069\u80fd\u6aa2\u6e2c\u6210\u7e3e\u9054\u6a19\u5373\u53ef\u63a1\u8a08\u9580\u6abb
          </div>
        </div>
      </div>
      ${Number(student.isTransfer) === 1 || Number(student.transferCredit) === 1 ? `
        <div class="mb-6 p-4 bg-amber-50 border border-amber-200/80 rounded-2xl text-sm text-amber-900 font-bold flex items-center gap-2.5 shadow-2xs">
          <svg class="w-5 h-5 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <span>\ud83d\udccc \u8f49\u5b78\u6263\u62b5\u8a3b\u8a18\uff1a\u5df2\u63a1\u8a08\u8f49\u5b78\u6298\u62b5 1 \u6b21\u901a\u904e\u6b21\u6578\u3002</span>
        </div>
      ` : ''}
      ${student.reason || student.otherNotes ? `
        <div class="mb-6 p-4.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm text-slate-700">
          <div class="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
            <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            \u7570\u52d5\u539f\u56e0 / \u5be9\u6838\u5099\u8a3b
          </div>
          ${student.reason || student.otherNotes} <span class="text-slate-400 ml-1 font-mono text-xs">(${student.updatedAt || ''})</span>
        </div>
      ` : ''}
      <!-- \u6b77\u5b78\u671f\u9ad4\u9069\u80fd\u6aa2\u6e2c\u901a\u904e\u6e05\u55ae (Exact Match with Mockup 2) -->
      <div class="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-7 mb-6">
        <div class="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 class="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5">
            <div class="w-6 h-6 rounded-full border-2 border-emerald-600 text-emerald-600 flex items-center justify-center shrink-0">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
            </div>
            <span>\u6b77\u5b78\u671f\u9ad4\u9069\u80fd\u6aa2\u6e2c\u901a\u904e\u6e05\u55ae</span>
          </h3>
          <span class="bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-3.5 py-1 rounded-full text-xs sm:text-sm font-bold">
            \u5df2\u901a\u904e ${passedSemesters.length} \u500b\u5b78\u671f
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
                        <div class="text-base font-bold text-slate-900">${formattedSem} \u5b78\u671f</div>
                        <div class="text-xs text-slate-400 font-semibold">\u9ad4\u9069\u80fd\u6aa2\u6e2c\uff1a\u63a1\u8a08 1 \u6b21</div>
                      </div>
                    </div>
                    <span class="bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs px-3 py-1 rounded-full font-bold inline-flex items-center gap-1.5 shrink-0">
                      <svg class="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      \u901a\u904e\u9054\u6a19
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
              <div class="text-sm font-bold text-slate-700">\u76ee\u524d\u5c1a\u7121\u4efb\u4f55\u5b78\u671f\u901a\u904e\u7d00\u9304</div>
              <div class="text-xs font-medium text-slate-400 mt-1">\u82e5\u6709\u7591\u554f\u8acb\u6d3d\u8a62\u9ad4\u80b2\u7d44\u67e5\u6838</div>
            </div>
          `}
        </div>
      </div>
    `;
    const records = window.FitnessStore.getFitnessRecords(student.studentId);
    let detailTableHtml = '';
    if (records.length > 0) {
      detailTableHtml = `
        <!-- \u6b77\u5b78\u671f\u9ad4\u9069\u80fd\u56db\u9805\u8a55\u6e2c\u6307\u6a19\u660e\u7d30 (Exact Match with Mockup 3) -->
        <div class="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-7 mb-6">
          <!-- \u6a19\u982d -->
          <div class="flex items-center gap-2.5 mb-5">
            <svg class="w-6 h-6 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
            <h3 class="text-lg sm:text-xl font-bold text-slate-900">\u6b77\u5b78\u671f\u9ad4\u9069\u80fd\u56db\u9805\u8a55\u6e2c\u6307\u6a19\u660e\u7d30</h3>
          </div>
          <!-- \u8868\u683c\u5361\u7247\u5bb9\u5668 (\u7070\u8272 Header \u80cc\u666f + \u5713\u89d2\u5916\u6846) -->
          <div class="rounded-2xl border border-slate-200/80 overflow-hidden bg-white">
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="bg-slate-50/90 border-b border-slate-200/80 text-slate-700 font-bold">
                    <th class="py-3.5 px-4 text-left whitespace-nowrap">\u8a55\u6e2c\u5b78\u671f</th>
                    <th class="py-3.5 px-4 text-center whitespace-nowrap">\u5750\u59ff\u9ad4\u524d\u5f4e (cm)</th>
                    <th class="py-3.5 px-4 text-center whitespace-nowrap">\u7acb\u5b9a\u8df3\u9060 (cm)</th>
                    <th class="py-3.5 px-4 text-center whitespace-nowrap">\u4ef0\u81e5\u8d77\u5750 (\u6b21/\u5206)</th>
                    <th class="py-3.5 px-4 text-center whitespace-nowrap">\u5fc3\u80ba\u8010\u529b\u767b\u968e</th>
                    <th class="py-3.5 px-4 text-center whitespace-nowrap">\u8a55\u6e2c\u7d50\u679c</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  ${records.map(r => `
                    <tr class="hover:bg-slate-50/50 transition-colors">
                      <td class="py-4 px-4 font-bold text-slate-900 font-mono text-left whitespace-nowrap">
                        ${r.semester} \u5b78\u671f
                      </td>
                      <td class="py-4 px-4 text-center font-bold text-slate-800 font-mono">${r.scores?.sitAndReach || '-'}</td>
                      <td class="py-4 px-4 text-center font-bold text-slate-800 font-mono">${r.scores?.standingLongJump || '-'}</td>
                      <td class="py-4 px-4 text-center font-bold text-slate-800 font-mono">${r.scores?.sitUps || '-'}</td>
                      <td class="py-4 px-4 text-center font-bold text-slate-800 font-mono">${String(r.scores?.cardio || '-').replace('\u767b\u968e:', '')}</td>
                      <td class="py-4 px-4 text-center whitespace-nowrap">
                        <span class="${r.isPassed ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80' : 'bg-rose-50 text-rose-800 border border-rose-200/80'} text-xs px-3 py-1 rounded-full font-bold inline-flex items-center gap-1">
                          <svg class="w-3.5 h-3.5 ${r.isPassed ? 'text-emerald-600' : 'text-rose-600'} shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            ${r.isPassed ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>' : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>'}
                          </svg>
                          ${r.isPassed ? '\u5408\u683c' : '\u672a\u9054\u6a19'}
                        </span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
          <!-- \u4e0b\u65b9\u6821\u898f\u5099\u8a3b -->
          <div class="mt-4 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <svg class="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span>\u5404\u9805\u6307\u6a19\u6578\u503c\u4f9d\u6821\u898f\u6a19\u6e96\u9032\u884c\u8a55\u5b9a\uff0c\u8a73\u7d30\u6a19\u6e96\u8acb\u53c3\u8003\u6821\u898f\u898f\u5b9a\u3002</span>
          </div>
        </div>
      `;
    }
    const guidanceHtml = !isPassed ? `
      <div class="bg-rose-50/60 rounded-2xl border border-rose-200 p-6 sm:p-8">
        <h4 class="font-bold text-rose-900 text-base mb-3 flex items-center gap-2">
          <svg class="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          \u672a\u5408\u683c\u5b78\u751f\u8aaa\u660e
        </h4>
        <ul class="list-disc list-inside text-sm text-slate-700 space-y-2 leading-relaxed font-medium">
          <li><strong>\u53c3\u52a0\u5168\u6821\u9ad4\u9069\u80fd\u6aa2\u6e2c\uff1a</strong>\u8acb\u65bc\u6bcf\u5b78\u671f\u6307\u5b9a\u9031\u6b21\u5831\u540d\u5168\u6821\u9ad4\u9069\u80fd\u6aa2\u6e2c\u3002</li>
          <li><strong>\u4fee\u7fd2\u9ad4\u9069\u80fd\u88dc\u6551\u8ab2\u7a0b\uff1a</strong>\u4fee\u7562\u76f8\u95dc\u8ab2\u7a0b\u4e14\u6210\u7e3e\u53ca\u683c\u5f8c\u53ef\u7533\u8acb\u63a1\u8a08\u3002</li>
          <li><strong>\u514d\u6e2c\u8cc7\u683c\u7533\u8fa6\uff1a</strong>\u8f49\u5b78\u6263\u62b5\u3001\u9ad4\u4fdd\u751f\u6216\u91ab\u7642\u969c\u7919\u8acb\u651c\u5e36\u4f50\u8b49\u5411\u9ad4\u80b2\u7d44\u8fa6\u7406\u3002</li>
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
  }
};
document.addEventListener('DOMContentLoaded', () => {
  window.StudentPortal.init();
});