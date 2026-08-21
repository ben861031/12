(function() {
  const rootHTML = `
  <!-- ==================== 1. \u9802\u6a13\u6975\u81f4\u7cbe\u7c21\u5c0e\u89bd Header (\u9032\u5165\u5f8c\u53f0\u81ea\u52d5\u96b1\u85cf) ==================== -->
  <header id="mainTopHeader" class="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 lg:px-8 py-3.5 shadow-xs">
    <div class="max-w-7xl mx-auto flex items-center justify-between gap-3">
      <!-- \u54c1\u724c Logo \u8207\u7cfb\u7d71\u540d\u7a31 (\u5de6\u908a\u5340\u584a flex-1 \u9760\u5de6) -->
      <div class="flex-1 flex items-center justify-start min-w-0">
        <div class="flex items-center gap-2.5 sm:gap-3 cursor-pointer group" onclick="App.switchTab('student')">
          <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg sm:text-xl shadow-sm shrink-0 group-hover:scale-105 transition-transform">
            <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
          </div>
          <h1 class="text-sm sm:text-lg font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors whitespace-nowrap overflow-hidden text-ellipsis">
            \u9ad4\u9069\u80fd\u7562\u696d\u9580\u6abb\u67e5\u8a62\u7cfb\u7d71
          </h1>
        </div>
      </div>
      <!-- \u4e2d\u592e\u7d71\u4e00\u5c0e\u89bd\u9023\u7d50 (100% \u6578\u5b78\u7cbe\u6e96\u5c0d\u9f4a\u7f6e\u4e2d flex-none) -->
      <nav class="hidden md:flex items-center justify-center gap-8 text-[16px] font-bold tracking-wide flex-none">
        <button id="navStudentLink" onclick="App.switchTab('student')" class="text-red-600 hover:text-red-600 transition-colors py-1 relative group flex items-center gap-1.5 cursor-pointer border-0 bg-transparent font-bold">
          <span>\u7562\u696d\u9580\u6abb\u67e5\u8a62</span>
          <span id="navStudentLine" class="absolute bottom-0 left-0 w-full h-[2px] bg-red-600 transition-all duration-300 group-hover:w-full"></span>
        </button>
        <button id="navAnnouncementsLink" onclick="App.switchTab('announcements')" class="text-slate-700 hover:text-red-600 transition-colors py-1 relative group flex items-center gap-1.5 cursor-pointer border-0 bg-transparent font-bold">
          <span>\u6700\u65b0\u516c\u544a</span>
          <span id="navAnnouncementsLine" class="absolute bottom-0 left-0 w-0 h-[2px] bg-red-600 transition-all duration-300 group-hover:w-full"></span>
        </button>
        <a href="https://www.just.edu.tw/" target="_blank" class="text-slate-700 hover:text-red-600 transition-colors py-1 relative group">
          \u5b78\u6821\u9996\u9801
          <span class="absolute bottom-0 left-0 w-0 h-[2px] bg-red-600 transition-all duration-300 group-hover:w-full"></span>
        </a>
        <a href="https://stu.just.edu.tw/?Lang=zh-tw" target="_blank" class="text-slate-700 hover:text-red-600 transition-colors py-1 relative group">
          \u5b78\u52d9\u8655\u5b98\u7db2
          <span class="absolute bottom-0 left-0 w-0 h-[2px] bg-red-600 transition-all duration-300 group-hover:w-full"></span>
        </a>
      </nav>
      <!-- \u53f3\u5074\u529f\u80fd\u5340 (\u53f3\u908a\u5340\u584a flex-1 \u9760\u53f3) -->
      <div class="flex-1 flex items-center justify-end gap-2 sm:gap-3">
        <button onclick="App.switchTab('admin')" class="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200/80 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs">
          <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          <span>\u7ba1\u7406\u5f8c\u53f0</span>
        </button>
        <!-- \u624b\u6a5f\u9078\u55ae\u958b\u95dc\u6309\u9215 (\u50c5\u624b\u6a5f\u986f\u793a) -->
        <button id="mobileMenuToggleBtn" onclick="App.toggleMobileMenu()" class="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none border border-slate-200" aria-label="\u9078\u55ae">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
      </div>
    </div>
    <!-- \u624b\u6a5f\u7248\u5c55\u958b\u9078\u55ae\u62bd\u5c5c (Mobile Menu Drawer) -->
    <div id="mobileMenuDrawer" class="hidden md:hidden border-t border-slate-100 mt-3 pt-3 space-y-1.5 text-sm font-bold">
      <button onclick="App.switchTab('student'); App.toggleMobileMenu();" class="w-full text-left font-bold text-slate-700 hover:text-red-600 py-2.5 px-3 rounded-xl hover:bg-slate-50 flex items-center gap-2.5 border-0 bg-transparent transition-colors">
        <svg class="w-4 h-4 text-slate-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <span>\u7562\u696d\u9580\u6abb\u67e5\u8a62</span>
      </button>
      <button onclick="App.switchTab('announcements'); App.toggleMobileMenu();" class="w-full text-left font-bold text-slate-700 hover:text-red-600 py-2.5 px-3 rounded-xl hover:bg-slate-50 flex items-center justify-between border-0 bg-transparent transition-colors">
        <span class="flex items-center gap-2.5">
          <svg class="w-4 h-4 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/></svg>
          <span>\u6700\u65b0\u516c\u544a</span>
        </span>
        <span class="text-xs text-red-600 font-semibold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">\u5c08\u5c6c\u9801\u9762</span>
      </button>
      <a href="https://www.just.edu.tw/" target="_blank" class="flex items-center gap-2.5 font-bold text-slate-700 hover:text-blue-600 py-2.5 px-3 rounded-xl hover:bg-slate-50 transition-colors">
        <svg class="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
        <span>\u5b78\u6821\u9996\u9801</span>
      </a>
      <a href="https://stu.just.edu.tw/?Lang=zh-tw" target="_blank" class="flex items-center gap-2.5 font-bold text-slate-700 hover:text-blue-600 py-2.5 px-3 rounded-xl hover:bg-slate-50 transition-colors">
        <svg class="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/></svg>
        <span>\u5b78\u52d9\u8655\u5b98\u7db2</span>
      </a>
      <a href="https://jbagt.just.edu.tw/rule/rules/A003-114-11-26-yEO.pdf" target="_blank" class="flex items-center gap-2.5 font-bold text-blue-600 hover:text-blue-800 py-2.5 px-3 rounded-xl bg-blue-50/70 border border-blue-200/80 transition-colors">
        <svg class="w-4 h-4 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
        <span>\u5b78\u751f\u9ad4\u9069\u80fd\u7562\u696d\u689d\u4ef6\u5be6\u65bd\u7d30\u5247 (PDF)</span>
      </a>
    </div>
  </header>
  <!-- ==================== 2. \u5b78\u751f\u81ea\u670d\u52d9\u67e5\u8a62 Portal (STUDENT PORTAL) ==================== -->
  <main id="studentPortalSection" class="flex-1 max-w-5xl w-full mx-auto px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
    <!-- \u641c\u5c0b\u5361\u7247 -->
    <div class="bg-white rounded-lg border border-slate-200 shadow-sm p-6 sm:p-8">
      <!-- \u6a19\u982d\u5340 -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 mb-5">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>
          <div>
            <h2 class="text-lg sm:text-xl font-bold text-slate-900">
              \u5b78\u751f\u9ad4\u9069\u80fd\u6210\u7e3e\u8207\u7562\u696d\u9580\u6abb\u67e5\u8a62
            </h2>
          </div>
        </div>
        <a href="https://jbagt.just.edu.tw/rule/rules/A003-114-11-26-yEO.pdf" target="_blank" class="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg shrink-0">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          \u5b78\u751f\u9ad4\u9069\u80fd\u7562\u696d\u689d\u4ef6\u5be6\u65bd\u7d30\u5247
        </a>
      </div>
      <!-- \u641c\u5c0b\u8f38\u5165\u6846\u8207\u6309\u9215\u5340 (Mobile Responsive) -->
      <div class="flex flex-col sm:flex-row items-stretch gap-2.5 max-w-xl">
        <div class="relative flex-1">
          <input type="text" id="studentIdInput" oninput="AdminPortal.handleInputClearBtn('studentIdInput')" placeholder="\u8acb\u8f38\u5165\u5b8c\u6574\u5b78\u865f (\u4f8b\u5982: 121053109)..." class="w-full pl-4 pr-9 py-2.5 rounded-lg border border-slate-300 text-sm font-semibold focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none bg-slate-50 text-slate-900 font-mono transition-all placeholder:text-slate-400 placeholder:font-sans">
          <button type="button" id="studentIdInputClearBtn" onclick="AdminPortal.clearSearchInput('studentIdInput')" class="hidden absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-500 hover:text-slate-700 transition-all flex items-center justify-center cursor-pointer text-xs font-bold shrink-0 z-10" title="\u6e05\u9664\u5167\u5bb9">\u2715</button>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="StudentPortal.doSearch()" class="flex-1 sm:w-28 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg text-sm sm:text-[15px] shadow-sm transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer tracking-wide min-h-[44px]">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            \u67e5\u8a62
          </button>
          <button onclick="StudentPortal.clearSearch()" class="flex-1 sm:w-28 bg-white hover:bg-slate-50 text-slate-700 font-bold py-2.5 rounded-lg text-sm sm:text-[15px] shadow-sm border border-slate-200 transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer tracking-wide min-h-[44px]">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
            \u6e05\u9664
          </button>
        </div>
      </div>
    </div>
    <!-- \u9810\u8a2d\u63d0\u793a\u5361\u7247 -->
    <div id="studentQueryEmpty" class="bg-slate-50 rounded-lg border border-slate-200 border-dashed p-8 sm:p-12 text-center mt-6">
      <h3 class="text-lg font-bold text-slate-900 mb-2">\u8acb\u8f38\u5165\u5b78\u865f\u958b\u59cb\u67e5\u8a62</h3>
      <p class="text-sm text-slate-600 font-medium max-w-md mx-auto">
        \ud83d\udccc \u672c\u7cfb\u7d71\u76ee\u524d\u50c5\u958b\u653e\u7576\u5b78\u671f\u300c\u4e09\u3001\u56db\u5e74\u7d1a\u5b78\u751f\u300d\u67e5\u8a62\u9ad4\u9069\u80fd\u8207\u7562\u696d\u9580\u6abb\u8cc7\u6599\uff1b\u5982\u6709\u76f8\u95dc\u7591\u554f\uff0c\u8acb\u6d3d\u5b78\u52d9\u8655\u9ad4\u80b2\u53ca\u6d3b\u52d5\u7d44(\u5206\u6a5f\uff1a2213)\u3002
      </p>
    </div>
    <!-- \u67e5\u8a62\u7d50\u679c\u5bb9\u5668 -->
    <div id="studentQueryResult" class="hidden space-y-6 mt-6"></div>
  </main>
  <!-- ==================== 2.5. \u5c08\u5c6c\u6700\u65b0\u516c\u544a\u9801\u9762 (ANNOUNCEMENTS PORTAL) ==================== -->
  <main id="announcementsPortalSection" class="hidden flex-1 max-w-5xl w-full mx-auto px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
    <div class="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sm:p-8 space-y-6">
      <!-- \u6a19\u984c\u5340\u584a\u8207\u641c\u5c0b\u95dc\u9375\u5b57\u904e\u6ffe\u5217 -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div class="flex items-center gap-3">
          <div class="w-1.5 h-5 bg-blue-600 rounded-full shrink-0"></div>
          <h2 class="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
            \u6700\u65b0\u516c\u544a\u8207\u6ce8\u610f\u4e8b\u9805
          </h2>
        </div>
        <!-- \u95dc\u9375\u5b57\u641c\u5c0b\u6846 -->
        <div class="relative w-full md:w-72">
          <input type="text" id="announcementSearchInput" oninput="StudentPortal.handleAnnouncementSearch()" placeholder="\u641c\u5c0b\u516c\u544a\u6a19\u984c\u6216\u5167\u6587..." class="w-full pl-3.5 pr-8 py-2 rounded-xl border border-slate-200/90 text-xs font-medium focus:border-blue-600 focus:outline-none bg-slate-50/70 text-slate-800 transition-all placeholder:text-slate-400">
          <button type="button" id="announcementSearchClearBtn" onclick="StudentPortal.clearAnnouncementSearch()" class="hidden absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-500 transition-all flex items-center justify-center cursor-pointer text-[10px] font-bold z-10">\u2715</button>
        </div>
      </div>
      <!-- \u5206\u985e\u6a19\u7c64\u5feb\u901f\u5207\u63db\u5668 (Category Filter Pills) -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
        <button onclick="StudentPortal.filterAnnouncementCategory('ALL')" data-ann-cat="ALL" class="ann-cat-pill active px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-blue-600 text-white shadow-2xs transition-all cursor-pointer">\u5168\u90e8\u516c\u544a</button>
        <button onclick="StudentPortal.filterAnnouncementCategory('\u91cd\u8981\u901a\u77e5')" data-ann-cat="\u91cd\u8981\u901a\u77e5" class="ann-cat-pill px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all cursor-pointer">\u91cd\u8981\u901a\u77e5</button>
        <button onclick="StudentPortal.filterAnnouncementCategory('\u88dc\u6e2c\u516c\u544a')" data-ann-cat="\u88dc\u6e2c\u516c\u544a" class="ann-cat-pill px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all cursor-pointer">\u88dc\u6e2c\u516c\u544a</button>
        <button onclick="StudentPortal.filterAnnouncementCategory('\u7533\u8fa6\u63d0\u9192')" data-ann-cat="\u7533\u8fa6\u63d0\u9192" class="ann-cat-pill px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all cursor-pointer">\u7533\u8fa6\u63d0\u9192</button>
        <button onclick="StudentPortal.filterAnnouncementCategory('\u8ab2\u7a0b\u8cc7\u8a0a')" data-ann-cat="\u8ab2\u7a0b\u8cc7\u8a0a" class="ann-cat-pill px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all cursor-pointer">\u8ab2\u7a0b\u8cc7\u8a0a</button>
      </div>
      <!-- \u516c\u544a\u5927\u5c08\u9662\u6821\u5c0d\u9f4a\u8868\u683c (Table List Container) -->
      <div id="announcementsPageTableContainer"></div>
    </div>
  </main>
  <!-- ==================== 3. \u7ba1\u7406\u5f8c\u53f0 (ADMIN PORTAL) ==================== -->
  <div id="adminPortalSection" class="hidden flex-1 flex flex-col md:flex-row min-h-[calc(100vh-61px)]">
    <!-- \u7c21\u6f54\u5074\u908a\u6b04 -->
    <aside class="corp-sidebar p-4 shrink-0">
      <!-- \u9078\u55ae\u5340\u584a -->
      <div class="space-y-6">
        <div class="px-3">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">ADMIN PORTAL</div>
          <div class="text-base font-extrabold text-slate-900 mt-1">\u7cfb\u7d71\u7ba1\u7406\u5f8c\u53f0</div>
        </div>
        <nav class="space-y-1">
          <!-- \u7368\u7acb\u3010\u5b78\u751f\u540d\u518a\u3011\u6309\u9215 -->
          <div data-admin-view="roster" class="corp-nav-item active">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            <span>\u5b78\u751f\u540d\u518a</span>
          </div>
          <!-- \u7368\u7acb\u3010\u9580\u6abb\u67e5\u8a62\u3011\u6309\u9215 -->
          <div data-admin-view="threshold" class="corp-nav-item">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span>\u9580\u6abb\u67e5\u8a62</span>
          </div>
          <div data-admin-view="dashboard" class="corp-nav-item">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <span>\u500b\u4eba\u6210\u7e3e\u67e5\u8a62</span>
          </div>
          <div data-admin-view="records" class="corp-nav-item">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
            <span>\u6aa2\u6e2c\u8cc7\u6599\u7ba1\u7406</span>
          </div>
          <div data-admin-view="analytics" class="corp-nav-item">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
            <span>\u73ed\u7d1a\u7d71\u8a08</span>
          </div>
          <div data-admin-view="risk" class="corp-nav-item">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            <span>\u672a\u5408\u683c\u540d\u55ae</span>
          </div>
          <div data-admin-view="logs" class="corp-nav-item">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 01-2-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            <span>\u64cd\u4f5c\u7d00\u9304</span>
          </div>
          <div data-admin-view="settings" class="corp-nav-item">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            <span>\u7cfb\u7d71\u8a2d\u5b9a</span>
          </div>
          <div data-admin-view="announcements" class="corp-nav-item">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/></svg>
            <span>\u6700\u65b0\u516c\u544a\u7ba1\u7406</span>
          </div>
        </nav>
      </div>
      <!-- \u5de6\u5074\u5e95\u90e8\u7ba1\u7406\u8005\u5361\u7247 (\u5305\u542b\u5b78\u751f\u67e5\u8a62\u8207\u767b\u51fa\u5169\u5927\u6309\u9215) -->
      <div class="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs space-y-3 mt-6">
        <div class="flex items-center justify-between gap-1.5">
          <span id="sidebarAdminName" class="truncate font-black text-slate-900 text-xs sm:text-sm tracking-tight">\u8521\u96e8\u946b</span>
          <span id="sidebarAdminRoleBadge" class="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">\u7cfb\u7d71\u7ba1\u7406\u54e1</span>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <button onclick="App.switchTab('student')" class="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 font-bold py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1 shadow-2xs active:scale-[0.98] cursor-pointer">
            <svg class="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            <span>\u5b78\u751f\u67e5\u8a62</span>
          </button>
          <button onclick="AdminPortal.logout()" class="w-full bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200/90 font-bold py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1 shadow-2xs active:scale-[0.98] cursor-pointer">
            <svg class="w-3.5 h-3.5 text-slate-500 hover:text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            <span>\u767b\u51fa\u7cfb\u7d71</span>
          </button>
        </div>
      </div>
    </aside>
    <!-- \u53f3\u5074\u4e3b\u5de5\u4f5c\u5340 -->
    <main class="flex-1 px-4 sm:px-6 pt-2 sm:pt-3 pb-6 space-y-4 sm:space-y-5 overflow-y-auto">
      <!-- \u624b\u6a5f\u7248\u5c08\u7528\u5f8c\u53f0\u9802\u6a13\u8cc7\u8a0a\u8207\u6377\u5f91\u5217 (\u50c5\u624b\u6a5f\u986f\u793a) -->
      <div class="md:hidden space-y-3 mb-2">
        <div class="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-2xs">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
            </div>
            <div class="leading-tight">
              <div id="mobileAdminName" class="font-extrabold text-slate-900 text-xs">\u7cfb\u7d71\u7ba1\u7406\u54e1</div>
              <div id="mobileAdminRoleBadge" class="text-[10px] text-blue-600 font-bold">\u767b\u5165\u4e2d</div>
            </div>
          </div>
          <div class="flex items-center gap-1.5">
            <button onclick="App.switchTab('student')" class="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
              <span>\u5b78\u751f\u67e5\u8a62</span>
            </button>
            <button onclick="AdminPortal.logout()" class="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
              <span>\u767b\u51fa</span>
            </button>
          </div>
        </div>
        <div class="bg-white border border-slate-200 rounded-xl p-2 flex items-center gap-1.5 overflow-x-auto hide-scrollbar shadow-2xs">
          <button data-admin-view="roster" onclick="AdminPortal.switchView('roster')" class="px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap bg-blue-50 text-blue-600 border border-blue-200">\u5b78\u751f\u540d\u518a</button>
          <button data-admin-view="threshold" onclick="AdminPortal.switchView('threshold')" class="px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap bg-slate-50 text-slate-700">\u9580\u6abb\u67e5\u8a62</button>
          <button data-admin-view="dashboard" onclick="AdminPortal.switchView('dashboard')" class="px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap bg-slate-50 text-slate-700">\u500b\u4eba\u6210\u7e3e\u67e5\u8a62</button>
          <button data-admin-view="records" onclick="AdminPortal.switchView('records')" class="px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap bg-slate-50 text-slate-700">\u6aa2\u6e2c\u8cc7\u6599\u7ba1\u7406</button>
          <button data-admin-view="analytics" onclick="AdminPortal.switchView('analytics')" class="px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap bg-slate-50 text-slate-700">\u73ed\u7d1a\u7d71\u8a08</button>
          <button data-admin-view="risk" onclick="AdminPortal.switchView('risk')" class="px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap bg-slate-50 text-slate-700">\u672a\u5408\u683c\u540d\u55ae</button>
          <button data-admin-view="logs" onclick="AdminPortal.switchView('logs')" class="px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap bg-slate-50 text-slate-700">\u64cd\u4f5c\u7d00\u9304</button>
          <button data-admin-view="settings" onclick="AdminPortal.switchView('settings')" class="px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap bg-slate-50 text-slate-700">\u7cfb\u7d71\u8a2d\u5b9a</button>
        </div>
      </div>
      <!-- \u9801\u9762\u6a19\u982d\u8207\u53f3\u5074\u9802\u7d1a\u52d5\u4f5c\u6309\u9215\u5217 (\u9802\u90e8\u908a\u8ddd\u5b8c\u5168\u7e2e\u7dca) -->
      <div class="flex flex-row items-center justify-between gap-4 !mt-0">
        <div>
          <h2 id="adminPageTitle" class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">\u5b78\u751f\u540d\u518a</h2>
          <p id="adminPageSubtitle" class="text-xs sm:text-sm font-bold text-slate-400 mt-0.5">\u5171 0 \u7b46\u5b78\u751f\u8cc7\u6599</p>
        </div>
        <div id="adminHeaderActionGroup" class="flex items-center gap-2.5 shrink-0">
          <button onclick="App.openRosterModal()" class="px-4 py-2 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] text-white text-sm font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
            <span>\u532f\u5165\u5b78\u7c4d</span>
          </button>
          <button onclick="AdminPortal.exportRosterExcel()" class="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-sm font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]">
            <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            <span>\u532f\u51fa\u5b78\u7c4d</span>
          </button>
        </div>
      </div>
      <!-- \u7d71\u8a08\u6578\u64da\u770b\u677f (\u50c5\u5728\u3010\u5b78\u751f\u540d\u518a\u3011\u3001\u3010\u9580\u6abb\u67e5\u8a62\u3011\u3001\u3010\u672a\u5408\u683c\u540d\u55ae\u3011\u986f\u793a) -->
      <div id="adminHeaderStatContainer" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- \u5361\u7247 1: \u7e3d\u5b78\u751f\u6578 -->
        <div class="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/80">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
          </div>
          <div>
            <div class="text-xs font-bold text-slate-500">\u7e3d\u5b78\u751f\u6578</div>
            <div class="flex items-baseline gap-1 mt-0.5">
              <span id="hdrStatTotal" class="text-2xl sm:text-3xl font-black text-slate-900 font-mono">0</span>
              <span class="text-xs font-semibold text-slate-500">\u4eba</span>
            </div>
          </div>
        </div>
        <!-- \u5361\u7247 2: \u5408\u683c\u4eba\u6578 (\u6de1\u7da0\u5e95\u8272\u5fae\u5149) -->
        <div class="bg-[#f0fdf4] rounded-2xl border border-[#bbf7d0]/80 p-4 sm:p-5 shadow-2xs flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-[#dcfce7] text-[#16a34a] flex items-center justify-center shrink-0 border border-[#bbf7d0]">
            <svg class="w-6 h-6 text-[#16a34a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <div>
            <div class="text-xs font-bold text-[#15803d]">\u5408\u683c\u4eba\u6578</div>
            <div class="flex items-baseline gap-1 mt-0.5">
              <span id="hdrStatPassed" class="text-2xl sm:text-3xl font-black text-[#15803d] font-mono">0</span>
              <span class="text-xs font-semibold text-[#15803d]">\u4eba</span>
            </div>
          </div>
        </div>
        <!-- \u5361\u7247 3: \u672a\u5408\u683c\u4eba\u6578 (\u6de1\u7d05\u5e95\u8272\u5fae\u5149) -->
        <div class="bg-[#fef2f2] rounded-2xl border border-[#fecaca]/80 p-4 sm:p-5 shadow-2xs flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-[#fee2e2] text-[#dc2626] flex items-center justify-center shrink-0 border border-[#fecaca]">
            <svg class="w-6 h-6 text-[#dc2626]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <div>
            <div class="text-xs font-bold text-[#b91c1c]">\u672a\u5408\u683c\u4eba\u6578</div>
            <div class="flex items-baseline gap-1 mt-0.5">
              <span id="hdrStatFailed" class="text-2xl sm:text-3xl font-black text-[#dc2626] font-mono">0</span>
              <span class="text-xs font-semibold text-[#b91c1c]">\u4eba</span>
            </div>
          </div>
        </div>
        <!-- \u5361\u7247 4: \u5408\u683c\u7387 -->
        <div class="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/80">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/></svg>
          </div>
          <div>
            <div class="text-xs font-bold text-slate-500">\u5408\u683c\u7387</div>
            <div class="mt-0.5">
              <span id="hdrStatRate" class="text-2xl sm:text-3xl font-black text-blue-600 font-mono">0%</span>
            </div>
          </div>
        </div>
      </div>
      <!-- ==================== \u6a21\u7d44 1: \u5b78\u751f\u540d\u518a ==================== -->
      <div id="erpView_roster" class="space-y-4">
        <!-- \u5b78\u751f\u540d\u518a\u7be9\u9078\u5de5\u5177\u5217 (100% \u7cbe\u6e96\u5c0d\u9f4a\u8a2d\u8a08\u7a3f\u5716\u4e8c) -->
        <div class="bg-[#f8fafc] border border-slate-200/90 rounded-2xl p-3 shadow-2xs space-y-3">
          <div class="flex flex-wrap items-center gap-3">
            <!-- \u641c\u5c0b\u6846 -->
            <div class="relative flex-1 min-w-[220px]">
              <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input type="text" id="rosterSearchInput" oninput="AdminPortal.handleInputClearBtn('rosterSearchInput')" placeholder="\u641c\u5c0b\u5b78\u751f\u59d3\u540d / \u5b78\u865f..." class="w-full pl-10 pr-9 py-2.5 bg-white rounded-xl border border-slate-200 text-sm font-medium focus:border-blue-600 focus:outline-none placeholder:text-slate-400 shadow-2xs">
              <button type="button" id="rosterSearchInputClearBtn" onclick="AdminPortal.clearSearchInput('rosterSearchInput')" class="hidden absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-500 hover:text-slate-700 transition-all flex items-center justify-center cursor-pointer text-xs font-bold shrink-0 z-10" title="\u6e05\u9664\u641c\u5c0b\u5167\u5bb9">\u2715</button>
            </div>
            <!-- \u5e74\u7d1a (\u5be6\u8cea\u7d81\u5b9a JS \u5e74\u7d1a\u9023\u52d5\u7be9\u9078) -->
            <select id="rosterEnrollYearFilter" class="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-700 focus:border-blue-600 focus:outline-none shadow-2xs min-w-[95px]">
              <option value="">\u5e74\u7d1a</option>
            </select>
            <!-- \u73ed\u7d1a -->
            <select id="rosterClassFilter" class="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-700 focus:border-blue-600 focus:outline-none shadow-2xs min-w-[100px]">
              <option value="">\u73ed\u7d1a</option>
            </select>
            <!-- \u72c0\u614b -->
            <select id="rosterStatusFilter" class="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-700 focus:border-blue-600 focus:outline-none shadow-2xs min-w-[95px]">
              <option value="">\u72c0\u614b</option>
              <option value="\u5728\u5b78" selected>\u5728\u5b78</option>
              <option value="\u4f11\u5b78">\u4f11\u5b78</option>
              <option value="\u9000\u5b78">\u9000\u5b78</option>
              <option value="\u7562\u696d">\u7562\u696d</option>
            </select>
            <!-- \u66f4\u591a\u7be9\u9078 \u6309\u9215 -->
            <button onclick="AdminPortal.toggleMoreFilters('roster')" class="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2.5 rounded-xl text-sm font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0">
              <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
              <span>\u66f4\u591a\u7be9\u9078</span>
            </button>
          </div>
          <!-- \u9ede\u64ca\u3010\u66f4\u591a\u7be9\u9078\u3011\u5c55\u958b\u4e4b\u9032\u968e\u7be9\u9078\u5217 -->
          <div id="rosterMoreFiltersRow" class="hidden pt-2.5 border-t border-slate-200/60 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <select id="rosterTrueYearFilter" class="bg-white border border-slate-200/90 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:border-emerald-600 focus:outline-none shadow-2xs">
              <option value="">\u5165\u5b78\u5e74 (\u5168\u9078)</option>
            </select>
            <select id="rosterAdmissionFilter" class="bg-white border border-slate-200/90 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:border-emerald-600 focus:outline-none shadow-2xs">
              <option value="">\u5165\u5b78\u7ba1\u9053 (\u5168\u9078)</option>
              <option value="\u7533\u8acb\u5165\u5b78">\u7533\u8acb\u5165\u5b78</option>
              <option value="\u7e41\u661f\u63a8\u85a6">\u7e41\u661f\u63a8\u85a6</option>
              <option value="\u5206\u767c\u5165\u5b78">\u5206\u767c\u5165\u5b78</option>
              <option value="\u904b\u52d5\u7e3e\u512a">\u904b\u52d5\u7e3e\u512a (\u9ad4\u4fdd)</option>
            </select>
            <select id="rosterIdentityFilter" class="bg-white border border-slate-200/90 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:border-emerald-600 focus:outline-none shadow-2xs">
              <option value="">\u8eab\u5206\u72c0\u614b (\u5168\u9078)</option>
              <option value="\u4e00\u822c\u751f">\u4e00\u822c\u751f</option>
              <option value="\u8eab\u5fc3\u969c\u7919">\u8eab\u5fc3\u969c\u7919\u751f</option>
              <option value="\u539f\u4f4f\u6c11">\u539f\u4f4f\u6c11</option>
            </select>
          </div>
        </div>
        <!-- \u8868\u683c\uff1a\u73ed\u7d1a\u3001\u5b78\u865f\u3001\u59d3\u540d\u3001\u5165\u5b78\u5e74\u3001\u5b78\u7c4d\u72c0\u614b\u3001\u64cd\u4f5c (\u767e\u5206\u6bd4\u5e73\u6ed1\u6b04\u5bec) -->
        <div class="corp-card overflow-hidden">
          <div class="corp-table-container max-h-[calc(100vh-320px)] sm:max-h-[calc(100vh-340px)]">
            <table class="corp-table">
              <thead>
                <tr>
                  <th class="w-[5%] text-center">
                    <input type="checkbox" onchange="AdminPortal.toggleSelectAll(this.checked)" class="w-4 h-4 rounded border-slate-300 cursor-pointer">
                  </th>
                  <th class="w-[12%] text-left">\u73ed\u7d1a</th>
                  <th class="w-[15%] text-left">\u5b78\u865f</th>
                  <th class="w-[12%] text-left">\u59d3\u540d</th>
                  <th class="w-[13%] text-left">\u5165\u5b78\u5e74</th>
                  <th class="w-[12%] text-left">\u5165\u5b78\u65b9\u5f0f</th>
                  <th class="w-[12%] text-left">\u8eab\u5206</th>
                  <th class="w-[10%] text-center">\u5b78\u7c4d\u72c0\u614b</th>
                  <th class="w-[9%] text-center">\u64cd\u4f5c</th>
                </tr>
              </thead>
              <tbody id="erpRosterTbody"></tbody>
            </table>
          </div>
        </div>
      </div>
      <!-- ==================== \u6a21\u7d44 2: \u9580\u6abb\u67e5\u8a62 ==================== -->
      <div id="erpView_threshold" class="hidden space-y-4">
        <!-- \u9580\u6abb\u67e5\u8a62\u7be9\u9078\u5de5\u5177\u5217 (100% \u7cbe\u6e96\u5c0d\u9f4a\u8a2d\u8a08\u7a3f\u5716\u4e8c) -->
        <div class="bg-[#f8fafc] border border-slate-200/90 rounded-2xl p-3 shadow-2xs space-y-3">
          <div class="flex flex-wrap items-center gap-3">
            <!-- \u641c\u5c0b\u6846 -->
            <div class="relative flex-1 min-w-[220px]">
              <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input type="text" id="thresholdSearchInput" oninput="AdminPortal.handleInputClearBtn('thresholdSearchInput')" placeholder="\u641c\u5c0b\u5b78\u751f\u59d3\u540d / \u5b78\u865f..." class="w-full pl-10 pr-9 py-2.5 bg-white rounded-xl border border-slate-200 text-sm font-medium focus:border-blue-600 focus:outline-none placeholder:text-slate-400 shadow-2xs">
              <button type="button" id="thresholdSearchInputClearBtn" onclick="AdminPortal.clearSearchInput('thresholdSearchInput')" class="hidden absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-500 hover:text-slate-700 transition-all flex items-center justify-center cursor-pointer text-xs font-bold shrink-0 z-10" title="\u6e05\u9664\u641c\u5c0b\u5167\u5bb9">\u2715</button>
            </div>
            <!-- \u5e74\u7d1a -->
            <select id="thresholdEnrollYearFilter" class="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-700 focus:border-blue-600 focus:outline-none shadow-2xs min-w-[95px]">
              <option value="">\u5e74\u7d1a</option>
            </select>
            <!-- \u73ed\u7d1a -->
            <select id="thresholdClassFilter" class="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-700 focus:border-blue-600 focus:outline-none shadow-2xs min-w-[100px]">
              <option value="">\u73ed\u7d1a</option>
            </select>
            <!-- \u72c0\u614b -->
            <select id="thresholdRosterStatusFilter" class="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-700 focus:border-blue-600 focus:outline-none shadow-2xs min-w-[95px]">
              <option value="\u5728\u5b78" selected>\u5728\u5b78</option>
              <option value="\u975e\u5728\u7c4d">\u975e\u5728\u7c4d</option>
              <option value="">\u5b78\u7c4d</option>
            </select>
            <!-- \u9580\u6abb\u7d50\u679c -->
            <select id="thresholdStatusFilter" class="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-700 focus:border-blue-600 focus:outline-none shadow-2xs min-w-[95px]">
              <option value="">\u9580\u6abb</option>
              <option value="\u901a\u904e">\u901a\u904e</option>
              <option value="\u4e0d\u901a\u904e">\u672a\u904e</option>
              <option value="\u514d\u6e2c">\u514d\u6e2c</option>
            </select>
            <!-- \u66f4\u591a\u7be9\u9078 \u6309\u9215 -->
            <button onclick="AdminPortal.toggleMoreFilters('threshold')" class="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2.5 rounded-xl text-sm font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0">
              <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
              <span>\u66f4\u591a\u7be9\u9078</span>
            </button>
          </div>
          <!-- \u9ede\u64ca\u3010\u66f4\u591a\u7be9\u9078\u3011\u5c55\u958b\u4e4b\u9032\u968e\u7be9\u9078\u5217 -->
          <div id="thresholdMoreFiltersRow" class="hidden pt-2.5 border-t border-slate-200/60 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <select id="thresholdTrueYearFilter" class="bg-white border border-slate-200/90 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:border-emerald-600 focus:outline-none shadow-2xs">
              <option value="">\u5165\u5b78\u5e74 (\u5168\u9078)</option>
            </select>
            <select id="thresholdAdmissionFilter" class="bg-white border border-slate-200/90 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:border-emerald-600 focus:outline-none shadow-2xs">
              <option value="">\u5165\u5b78\u7ba1\u9053 (\u5168\u9078)</option>
              <option value="\u7533\u8acb\u5165\u5b78">\u7533\u8acb\u5165\u5b78</option>
              <option value="\u7e41\u661f\u63a8\u85a6">\u7e41\u661f\u63a8\u85a6</option>
              <option value="\u5206\u767c\u5165\u5b78">\u5206\u767c\u5165\u5b78</option>
              <option value="\u904b\u52d5\u7e3e\u512a">\u904b\u52d5\u7e3e\u512a (\u9ad4\u4fdd)</option>
            </select>
            <select id="thresholdIdentityFilter" class="bg-white border border-slate-200/90 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:border-emerald-600 focus:outline-none shadow-2xs">
              <option value="">\u8eab\u5206\u72c0\u614b (\u5168\u9078)</option>
              <option value="\u4e00\u822c\u751f">\u4e00\u822c\u751f</option>
              <option value="\u8eab\u5fc3\u969c\u7919">\u8eab\u5fc3\u969c\u7919\u751f</option>
              <option value="\u539f\u4f4f\u6c11">\u539f\u4f4f\u6c11</option>
            </select>
          </div>
        </div>
        <div class="corp-card overflow-hidden">
          <div class="corp-table-container max-h-[calc(100vh-320px)] sm:max-h-[calc(100vh-340px)]">
            <table class="corp-table">
              <thead>
                <tr>
                  <th class="w-[3%] text-center">
                    <input type="checkbox" onchange="AdminPortal.toggleSelectAll(this.checked)" class="w-4 h-4 rounded border-slate-300 cursor-pointer">
                  </th>
                  <th class="w-[12%] text-left">\u73ed\u7d1a</th>
                  <th class="w-[11%] text-left">\u5b78\u865f</th>
                  <th class="w-[9%] text-left">\u59d3\u540d</th>
                  <th class="w-[10%] text-center">\u9580\u6abb\u72c0\u614b</th>
                  <th class="w-[9%] text-center">\u901a\u904e\u6b21\u6578</th>
                  <th class="w-[9%] text-center">\u9700\u88dc\u6b21\u6578</th>
                  <th class="w-[15%] text-center">\u901a\u904e\u5b78\u671f\u8ecc\u8de1</th>
                  <th class="w-[13%] text-center">\u7279\u6b8a\u5099\u8a3b</th>
                  <th class="w-[9%] text-center">\u64cd\u4f5c</th>
                </tr>
              </thead>
              <tbody id="erpThresholdTbody"></tbody>
            </table>
          </div>
        </div>
      </div>
      <!-- ==================== \u6a21\u7d44 3: \u500b\u4eba\u6210\u7e3e\u67e5\u8a62 ==================== -->
      <div id="erpView_dashboard" class="hidden space-y-6">
        <!-- \u641c\u5c0b\u5217 -->
        <div class="corp-card p-6 border-t-4 border-t-blue-500">
          <div class="flex flex-col md:flex-row gap-4 items-end">
            <div class="flex-1 w-full">
              <label class="block text-sm font-bold text-slate-700 mb-2">\u8f38\u5165\u5b78\u865f\u6216\u59d3\u540d\u641c\u5c0b</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                </div>
                <input type="text" id="individualSearchInput" oninput="AdminPortal.handleInputClearBtn('individualSearchInput')" onkeyup="if(event.key === 'Enter') AdminPortal.searchIndividualRecord()" placeholder="\u4f8b\u5982: 110001001 \u6216 \u738b\u5c0f\u660e..." class="w-full pl-11 pr-10 py-3 rounded-xl border border-slate-300 text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all">
                <button type="button" id="individualSearchInputClearBtn" onclick="AdminPortal.clearSearchInput('individualSearchInput')" class="hidden absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-500 hover:text-slate-700 transition-all flex items-center justify-center cursor-pointer text-xs font-bold shrink-0 z-10" title="\u6e05\u9664\u641c\u5c0b\u5167\u5bb9">\u2715</button>
              </div>
            </div>
            <button onclick="AdminPortal.searchIndividualRecord()" class="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl text-base shadow-md transition-all whitespace-nowrap w-full md:w-auto h-[50px]">
              \u67e5\u8a62\u7d00\u9304
            </button>
          </div>
        </div>
        <!-- \u67e5\u8a62\u7d50\u679c\u5340 (\u9810\u8a2d\u96b1\u85cf) -->
        <div id="individualSearchResultArea" class="hidden space-y-6">
          <!-- \u500b\u4eba\u8cc7\u8a0a\u5361\u7247 -->
          <div class="corp-card p-0 bg-white border border-slate-200 overflow-hidden shadow-sm">
            <!-- \u9802\u90e8\u88dd\u98fe\u689d -->
            <div class="h-2 bg-gradient-to-r from-blue-500 to-indigo-600 w-full"></div>
            <div class="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <!-- \u5de6\u5074\uff1a\u57fa\u672c\u8cc7\u6599 -->
              <div class="w-full md:w-1/3 flex flex-col justify-center pl-2">
                <div class="flex items-center gap-3 mb-3">
                  <h2 id="indivProfileName" class="text-2xl font-black text-slate-900 tracking-tight leading-none">\u59d3\u540d</h2>
                  <span id="indivProfileEnrollStatus" class="px-3 py-1 rounded-full text-sm font-bold bg-blue-50 text-blue-600 border border-blue-200">\u5728\u5b78</span>
                </div>
                <div class="space-y-2 text-base">
                  <div class="flex items-center text-slate-700">
                    <span class="w-14 text-slate-500 font-bold">\u5b78\u865f\uff1a</span>
                    <span id="indivProfileId" class="font-mono font-bold text-slate-800">\u5b78\u865f</span>
                  </div>
                  <div class="flex items-center text-slate-700">
                    <span class="w-14 text-slate-500 font-bold">\u73ed\u7d1a\uff1a</span>
                    <span id="indivProfileClass" class="font-bold text-slate-800">\u73ed\u7d1a</span>
                  </div>
                </div>
              </div>
              <!-- \u4e2d\u9593\uff1a\u9ad4\u9069\u80fd\u6982\u6cc1\u6578\u64da -->
              <div class="w-full md:w-1/3 flex justify-center gap-10 border-y md:border-y-0 md:border-x border-slate-100 py-4 md:py-0">
                <div class="text-center">
                  <div class="text-sm font-semibold text-slate-500 mb-1.5">\u7d2f\u8a08\u53ca\u683c\u6b21\u6578</div>
                  <div id="indivProfilePassCount" class="text-4xl font-black text-blue-600 font-mono">0</div>
                </div>
                <div class="w-px bg-slate-200"></div>
                <div class="text-center">
                  <div class="text-sm font-semibold text-slate-500 mb-1.5">\u5269\u9918\u9700\u88dc\u6b21\u6578</div>
                  <div id="indivProfileDeficit" class="text-4xl font-black text-rose-500 font-mono">2</div>
                </div>
              </div>
              <!-- \u53f3\u5074\uff1a\u7562\u696d\u9580\u6abb\u8207\u7279\u6b8a\u6a19\u8a18 -->
              <div class="w-full md:w-1/3 flex flex-col items-center md:items-end justify-center pr-2">
                <div class="text-xs font-bold text-slate-400 mb-2 tracking-widest">\u9ad4\u9069\u80fd\u7562\u696d\u9580\u6abb</div>
                <div id="indivProfileStatus" class="text-emerald-700 bg-emerald-50 border border-emerald-200 text-lg px-8 py-2.5 font-black rounded-full shadow-sm mb-2 tracking-wide">\u2705 \u901a\u904e (\u5408\u683c)</div>
                <div id="indivProfileSpecial" class="text-sm font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded hidden border border-amber-200 shadow-sm">
                  <!-- \u7279\u6b8a\u8eab\u5206\u6a19\u8a18 -->
                </div>
              </div>
            </div>
          </div>
          <!-- \u6b77\u5e74\u6aa2\u6e2c\u6210\u7e3e\u660e\u7d30\u8868 -->
          <div class="corp-card overflow-hidden border border-slate-200">
            <div class="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <h3 class="text-base font-bold text-slate-800">\u6b77\u5e74\u9ad4\u9069\u80fd\u6aa2\u6e2c\u539f\u59cb\u6578\u503c\u660e\u7d30</h3>
            </div>
            <div class="corp-table-container max-h-[60vh] overflow-y-auto">
              <table class="corp-table">
                <thead>
                  <tr>
                    <th class="w-[10%] text-center">\u5b78\u671f</th>
                    <th class="w-[10%] text-center">\u8eab\u9ad8<br><span class="text-[10px] font-normal text-slate-500">\u516c\u5206</span></th>
                    <th class="w-[10%] text-center">\u9ad4\u91cd<br><span class="text-[10px] font-normal text-slate-500">\u516c\u65a4</span></th>
                    <th class="w-[15%] text-center">\u5750\u59ff\u9ad4\u524d\u5f4e<br><span class="text-[10px] font-normal text-slate-500">\u67d4\u8edf\u5ea6</span></th>
                    <th class="w-[15%] text-center">\u7acb\u5b9a\u8df3\u9060<br><span class="text-[10px] font-normal text-slate-500">\u77ac\u767c\u529b</span></th>
                    <th class="w-[15%] text-center">\u4ef0\u81e5\u8d77\u5750<br><span class="text-[10px] font-normal text-slate-500">\u808c\u8010\u529b</span></th>
                    <th class="w-[15%] text-center">\u5fc3\u80ba\u8010\u529b<br><span class="text-[10px] font-normal text-slate-500">\u767b\u968e</span></th>
                    <th class="w-[10%] text-center">\u55ae\u5b78\u671f\u7d50\u679c</th>
                  </tr>
                </thead>
                <tbody id="individualRecordsTbody">
                  <!-- JS \u52d5\u614b\u63d2\u5165 -->
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <!-- \u7a7a\u72c0\u614b\u63d0\u793a -->
        <div id="individualSearchEmpty" class="hidden corp-card p-12 text-center border border-dashed border-slate-300">
          <div class="text-5xl mb-4">\ud83d\udd0d</div>
          <h3 class="text-lg font-bold text-slate-800 mb-2">\u67e5\u7121\u7b26\u5408\u7684\u5b78\u751f\u8cc7\u6599</h3>
          <p class="text-sm text-slate-500">\u8acb\u78ba\u8a8d\u5b78\u865f\u6216\u59d3\u540d\u662f\u5426\u8f38\u5165\u6b63\u78ba\uff0c\u6216\u8a72\u5b78\u751f\u5c1a\u672a\u532f\u5165\u7cfb\u7d71\u3002</p>
        </div>
      </div>
      <!-- ==================== \u6a21\u7d44 4: \u6aa2\u6e2c\u8cc7\u6599\u7ba1\u7406 ==================== -->
      <div id="erpView_records" class="hidden corp-card p-6">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
          <h3 class="text-base font-bold text-slate-900">\u6aa2\u6e2c\u8cc7\u6599\u7ba1\u7406</h3>
          <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>
              <input type="text" id="recordsSearchInput" oninput="AdminPortal.handleInputClearBtn('recordsSearchInput')" onkeyup="AdminPortal.renderRecordsManagement()" placeholder="\u641c\u5c0b\u5b78\u865f..." class="pl-9 pr-8 py-2 rounded-lg border border-slate-300 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full sm:w-48">
              <button type="button" id="recordsSearchInputClearBtn" onclick="AdminPortal.clearSearchInput('recordsSearchInput')" class="hidden absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-500 hover:text-slate-700 transition-all flex items-center justify-center cursor-pointer text-[10px] font-bold shrink-0 z-10" title="\u6e05\u9664\u5167\u5bb9">\u2715</button>
            </div>
            <select id="recordsSemesterFilter" onchange="AdminPortal.renderRecordsManagement()" class="pl-3 pr-8 py-2 rounded-lg border border-slate-300 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white">
              <option value="">-- \u8acb\u5148\u9078\u64c7\u5b78\u671f --</option>
              <option value="all">\u986f\u793a\u6240\u6709\u5b78\u671f (\u4e0d\u5efa\u8b70)</option>
            </select>
          </div>
        </div>
        <div class="corp-table-container max-h-[calc(100vh-210px)] sm:max-h-[calc(100vh-230px)] overflow-y-auto">
          <table class="corp-table text-sm">
            <thead>
              <tr>
                <th>\u5b78\u671f</th>
                <th>\u5b78\u865f</th>
                <th>\u59d3\u540d</th>
                <th>\u5750\u59ff\u9ad4\u524d\u5f4e</th>
                <th>\u7acb\u5b9a\u8df3\u9060</th>
                <th>\u4ef0\u81e5\u8d77\u5750</th>
                <th>\u5fc3\u80ba\u8010\u529b</th>
                <th>\u6aa2\u6e2c\u7d50\u679c</th>
                <th class="text-center w-36">\u64cd\u4f5c</th>
              </tr>
            </thead>
            <tbody id="erpRecordsTbody">
              <!-- JS \u52d5\u614b\u63d2\u5165 -->
            </tbody>
          </table>
        </div>
      </div>
      <!-- ==================== \u6a21\u7d44 5: \u73ed\u7d1a\u7d71\u8a08 ==================== -->
      <div id="erpView_analytics" class="hidden corp-card p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-bold text-slate-900">\u5404\u73ed\u7d1a\u9ad4\u9069\u80fd\u7562\u696d\u9580\u6abb\u901a\u904e\u7387\u7d71\u8a08\u5206\u6790</h3>
        </div>
        <div class="corp-table-container max-h-[calc(100vh-210px)] sm:max-h-[calc(100vh-230px)] overflow-y-auto">
          <table class="corp-table">
            <thead>
              <tr>
                <th>\u73ed\u7d1a</th>
                <th>\u7e3d\u4eba\u6578</th>
                <th>\u5408\u683c\u4eba\u6578</th>
                <th>\u672a\u5408\u683c\u4eba\u6578</th>
                <th>\u5408\u683c\u7387</th>
              </tr>
            </thead>
            <tbody id="erpAnalyticsTbody"></tbody>
          </table>
        </div>
      </div>
      <!-- ==================== \u6a21\u7d44 6: \u672a\u5408\u683c\u540d\u55ae ==================== -->
      <div id="erpView_risk" class="hidden corp-card p-6">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
          <div>
            <h3 class="text-lg font-bold text-rose-900">\u672a\u5408\u683c\u5b78\u751f\u540d\u55ae</h3>
            <p class="text-sm text-slate-600 mt-0.5">\u9ede\u64ca\u9802\u90e8\u300c\u8907\u88fd Email\u300d\u53ef\u6279\u91cf\u5bc4\u4fe1\u901a\u77e5\u672a\u5408\u683c\u5b78\u751f\u3002</p>
          </div>
        </div>
        <div class="flex flex-col md:flex-row gap-3 mb-4">
          <div class="flex-1 relative">
            <input type="text" id="riskSearchInput" placeholder="\u641c\u5c0b\u5b78\u865f\u3001\u59d3\u540d\u6216\u73ed\u7d1a..." oninput="AdminPortal.handleInputClearBtn('riskSearchInput')" onkeyup="AdminPortal.renderRiskTracking()" class="w-full pl-4 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400">
            <button type="button" id="riskSearchInputClearBtn" onclick="AdminPortal.clearSearchInput('riskSearchInput')" class="hidden absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-500 hover:text-slate-700 transition-all flex items-center justify-center cursor-pointer text-xs font-bold shrink-0 z-10" title="\u6e05\u9664\u5167\u5bb9">\u2715</button>
          </div>
          <div class="w-full md:w-32">
            <select id="riskEnrollYearFilter" onchange="AdminPortal.renderRiskTracking()" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 cursor-pointer">
              <option value="">\u6240\u6709\u5e74\u7d1a</option>
            </select>
          </div>
          <div class="w-full md:w-40">
            <select id="riskClassFilter" onchange="AdminPortal.renderRiskTracking()" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 cursor-pointer">
              <option value="">\u6240\u6709\u73ed\u7d1a</option>
            </select>
          </div>
        </div>
        <div class="corp-table-container max-h-[calc(100vh-220px)] sm:max-h-[calc(100vh-240px)] overflow-y-auto">
          <table class="corp-table">
            <thead>
              <tr>
                <th class="w-[5%] text-center">
                  <input type="checkbox" id="riskSelectAll" onchange="AdminPortal.toggleAllRiskSelection(this.checked)" class="w-4 h-4 rounded text-blue-600 border-slate-300 cursor-pointer">
                </th>
                <th class="w-[15%]">\u73ed\u7d1a</th>
                <th class="w-[15%]">\u5b78\u865f</th>
                <th class="w-[15%]">\u59d3\u540d</th>
                <th class="w-[15%]">\u5c1a\u5dee\u6b21\u6578</th>
                <th class="w-[25%]">Email</th>
                <th class="w-[10%] text-center">\u64cd\u4f5c</th>
              </tr>
            </thead>
            <tbody id="erpRiskTbody"></tbody>
          </table>
        </div>
      </div>
      <!-- ==================== \u6a21\u7d44 7: \u64cd\u4f5c\u7d00\u9304 ==================== -->
      <div id="erpView_logs" class="hidden corp-card p-6">
        <h3 class="text-base font-bold text-slate-900 mb-4">\u7cfb\u7d71\u64cd\u4f5c\u7d00\u9304 (Audit Trail)</h3>
        <div class="corp-table-container max-h-[calc(100vh-210px)] sm:max-h-[calc(100vh-230px)] overflow-y-auto">
          <table class="corp-table">
            <thead>
              <tr>
                <th class="w-[20%]">\u6642\u9593</th>
                <th class="w-[15%]">\u64cd\u4f5c\u4eba</th>
                <th class="w-[20%]">\u52d5\u4f5c</th>
                <th class="w-[45%]">\u8a73\u7d30\u5167\u5bb9</th>
              </tr>
            </thead>
            <tbody id="erpAuditLogsTbody"></tbody>
          </table>
        </div>
      </div>
      <!-- ==================== \u6a21\u7d44 8: \u7cfb\u7d71\u8a2d\u5b9a ==================== -->
      <div id="erpView_settings" class="hidden space-y-6">
        <!-- \u5340\u584a 1: \u96f2\u7aef\u540c\u6b65\u8207\u5099\u4efd\u4e2d\u5fc3 (Firebase Dual-Sync Center) -->
        <div class="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs">
          <div class="flex items-center gap-3 pb-4 border-b border-slate-100 mb-4">
            <div class="w-10 h-10 rounded-xl bg-teal-50 text-[#0d9488] flex items-center justify-center shrink-0 border border-teal-100">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
            </div>
            <div>
              <h4 class="font-extrabold text-slate-900 text-base">Firebase \u96f2\u7aef\u96d9\u5411\u8cc7\u6599\u540c\u6b65\u8207\u5099\u4efd\u4e2d\u5fc3</h4>
              <p class="text-xs font-medium text-slate-500 mt-0.5">\u8de8\u700f\u89bd\u5668\u81ea\u52d5\u96f2\u7aef\u540c\u6b65\uff0c\u4ea6\u53ef\u624b\u52d5\u63a8\u64ad\u6216\u62c9\u53d6 Firebase \u96f2\u7aef\u6700\u65b0\u8cc7\u6599</p>
            </div>
          </div>
          <div class="flex flex-wrap gap-3">
            <button onclick="AdminPortal.syncAllToFirebase()" class="bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold py-2.5 px-5 rounded-xl text-sm shadow-2xs transition-all flex items-center gap-2 cursor-pointer active:scale-[0.98]">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
              <span>\u4e00\u9375\u63a8\u64ad\u672c\u6a5f\u8cc7\u6599\u81f3 Firebase</span>
            </button>
            <button onclick="AdminPortal.syncFromFirebase()" class="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold py-2.5 px-5 rounded-xl text-sm shadow-2xs transition-all flex items-center gap-2 cursor-pointer active:scale-[0.98]">
              <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
              <span>\u4e00\u9375\u5f9e Firebase \u62c9\u53d6\u5168\u6821\u8cc7\u6599</span>
            </button>
          </div>
        </div>
        <!-- \u5340\u584a 2: \u5e33\u865f\u5b89\u5168\u8207\u6b0a\u9650\u7ba1\u7406 (2-Column Grid) -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- \u5de6\u5361: \u4fee\u6539\u500b\u4eba\u767b\u5165\u5bc6\u78bc -->
          <div class="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <div class="flex items-center gap-3 pb-3 border-b border-slate-100 mb-4">
                <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                </div>
                <div>
                  <h4 class="font-extrabold text-slate-900 text-base">\u4fee\u6539\u500b\u4eba\u767b\u5165\u5bc6\u78bc</h4>
                  <p class="text-xs font-medium text-slate-500 mt-0.5">\u8b8a\u66f4\u7ba1\u7406\u54e1\u5e33\u865f\u8207\u5bc6\u78bc\uff0c\u81ea\u52d5\u540c\u6b65\u81f3\u96f2\u7aef</p>
                </div>
              </div>
              <div class="space-y-3 mb-5">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">\u76ee\u524d\u539f\u5bc6\u78bc <span class="text-rose-500">*</span></label>
                  <input type="password" id="changePassCurrentPasscode" placeholder="\u8f38\u5165\u76ee\u524d\u539f\u5bc6\u78bc" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:border-blue-600 focus:outline-none transition-all">
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">\u65b0\u7ba1\u7406\u54e1\u5e33\u865f <span class="text-rose-500">*</span></label>
                    <input type="text" id="changePassNewUsername" placeholder="\u4f8b\u5982: admin" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:border-blue-600 focus:outline-none transition-all">
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">\u65b0\u7ba1\u7406\u5bc6\u78bc <span class="text-rose-500">*</span></label>
                    <input type="password" id="changePassNewPasscode" placeholder="\u8f38\u5165\u65b0\u5bc6\u78bc" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:border-blue-600 focus:outline-none transition-all">
                  </div>
                </div>
              </div>
            </div>
            <button onclick="AdminPortal.changeAdminCredentials()" class="w-full bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold py-2.5 px-4 rounded-xl text-sm shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
              <span>\u5132\u5b58\u8b8a\u66f4\u5e33\u865f\u5bc6\u78bc</span>
            </button>
          </div>
          <!-- \u53f3\u5361: \u6559\u8077\u54e1\u5e33\u865f\u8207\u5206\u7d1a\u6b0a\u9650\u7ba1\u7406 -->
          <div class="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                  </div>
                  <div>
                    <h4 class="font-extrabold text-slate-900 text-base">\u6559\u8077\u54e1\u5e33\u865f\u8207\u6b0a\u9650\u7ba1\u7406</h4>
                    <p class="text-xs font-medium text-slate-500 mt-0.5">\u65b0\u589e\u6559\u8077\u54e1\u5e33\u865f\u4e26\u63a7\u7ba1\u6b0a\u9650</p>
                  </div>
                </div>
                <button onclick="AdminPortal.openAdminAccountModal()" class="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-2xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-[0.98]">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
                  <span>\u65b0\u589e\u5e33\u865f</span>
                </button>
              </div>
              <div class="corp-table-container max-h-44 overflow-y-auto bg-slate-50 rounded-xl border border-slate-200/80 mb-2">
                <table class="corp-table">
                  <thead>
                    <tr>
                      <th class="w-[25%] text-left">\u59d3\u540d</th>
                      <th class="w-[30%] text-left">\u5e33\u865f</th>
                      <th class="w-[25%] text-center">\u89d2\u8272</th>
                      <th class="w-[20%] text-center">\u64cd\u4f5c</th>
                    </tr>
                  </thead>
                  <tbody id="erpAdminAccountsTbody"></tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <!-- \u5340\u584a 3: \u7cfb\u7d71\u8cc7\u6599\u7a3d\u6838\u8207\u7279\u5b9a\u5b78\u671f\u7ba1\u7406 (2-Column Grid) -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- \u5168\u6821\u9580\u6abb\u8cc7\u6599\u81ea\u52d5\u6821\u6b63 -->
          <div class="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <div class="flex items-center gap-3 pb-3 border-b border-slate-100 mb-4">
                <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                </div>
                <div>
                  <h4 class="font-extrabold text-slate-900 text-base">\u5168\u6821\u9580\u6abb\u8cc7\u6599\u81ea\u52d5\u6821\u6b63</h4>
                  <p class="text-xs font-medium text-slate-500 mt-0.5">\u81ea\u52d5\u91cd\u65b0\u6383\u63cf\u6240\u6709\u6aa2\u6e2c\u6578\u64da\u4e26\u91cd\u65b0\u7d50\u7b97\u901a\u904e\u72c0\u614b</p>
                </div>
              </div>
              <p class="text-xs text-slate-600 leading-relaxed mb-5">\u5982\u532f\u5165\u6a94\u6848\u5305\u542b\u908f\u8f2f\u932f\u8aa4\u6216\u4fee\u6539\u9580\u6abb\u57fa\u6e96\uff0c\u53ef\u57f7\u884c\u81ea\u52d5\u6821\u6b63\uff0c\u8b93\u7cfb\u7d71\u91cd\u65b0\u8a08\u7b97\u6bcf\u4f4d\u5b78\u751f\u7684\u901a\u904e\u5b78\u671f\u8ecc\u8de1\u8207\u9580\u6abb\u7d50\u679c\u3002</p>
            </div>
            <button onclick="AdminPortal.auditAndFixAllData()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
              <span>\u7acb\u5373\u91cd\u65b0\u7a3d\u6838\u8207\u6821\u6b63\u9580\u6abb</span>
            </button>
          </div>
          <!-- \u55ae\u7368\u522a\u9664\u7279\u5b9a\u5b78\u671f\u7d00\u9304 -->
          <div class="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <div class="flex items-center gap-3 pb-3 border-b border-slate-100 mb-4">
                <div class="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </div>
                <div>
                  <h4 class="font-extrabold text-slate-900 text-base">\u55ae\u7368\u522a\u9664\u7279\u5b9a\u5b78\u671f\u7d00\u9304</h4>
                  <p class="text-xs font-medium text-slate-500 mt-0.5">\u4e00\u6b21\u6027\u522a\u9664\u7279\u5b9a\u5b78\u671f\u4e4b\u5168\u6821\u6210\u7e3e\u6578\u64da</p>
                </div>
              </div>
              <p class="text-xs text-slate-600 leading-relaxed mb-4">\u5982\u67d0\u5b78\u671f\u532f\u5165\u932f\u8aa4\uff0c\u53ef\u9078\u64c7\u8a72\u5b78\u671f\u6279\u6b21\u522a\u9664\uff0c\u522a\u9664\u5f8c\u7cfb\u7d71\u6703\u81ea\u52d5\u70ba\u6240\u6709\u5b78\u751f\u91cd\u65b0\u8a08\u7b97\u901a\u904e\u6b21\u6578\u3002</p>
            </div>
            <div class="flex items-center gap-2.5">
              <select id="bulkDeleteSemesterSelect" onclick="AdminPortal.populateBulkDeleteSemesterSelect()" class="flex-1 px-3.5 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-800 bg-slate-50 text-xs focus:bg-white focus:outline-none shadow-2xs">
                <option value="">-- \u9ede\u64ca\u9078\u64c7\u5b78\u671f --</option>
              </select>
              <button onclick="AdminPortal.bulkDeleteSemesterRecords()" class="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-2xs transition-all shrink-0 cursor-pointer active:scale-[0.98]">
                \u522a\u9664\u8a72\u5b78\u671f\u8cc7\u6599
              </button>
            </div>
          </div>
        </div>
        <!-- \u5340\u584a 4: \u5371\u96aa\u64cd\u4f5c\u5340 (Danger Zone) -->
        <div class="bg-rose-50/50 border border-rose-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs">
          <div class="flex items-center gap-3 pb-3 border-b border-rose-200/60 mb-4">
            <div class="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>
            <div>
              <h4 class="font-extrabold text-rose-900 text-base">\u5371\u96aa\u64cd\u4f5c\u5c08\u5340 (\u6e05\u9664\u5168\u6821\u7cfb\u7d71\u8cc7\u6599)</h4>
              <p class="text-xs font-semibold text-rose-700 mt-0.5">\u8b66\u544a\uff1a\u6b64\u64cd\u4f5c\u5c07\u5b8c\u5168\u6e05\u7a7a\u5168\u6821\u5b78\u7c4d\u3001\u6aa2\u6e2c\u6210\u7e3e\u8207\u8a2d\u5b9a\uff0c\u6062\u5fa9\u81f3\u521d\u59cb\u72c0\u614b\u4e14\u7121\u6cd5\u5fa9\u539f</p>
            </div>
          </div>
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p class="text-xs text-rose-700/90 leading-relaxed max-w-2xl">\u6e05\u7a7a\u8cc7\u6599\u5f8c\uff0c\u672c\u6a5f\u8207\u96f2\u7aef\u5099\u4efd\u5747\u6703\u6b78\u96f6\u3002\u57f7\u884c\u524d\u8acb\u78ba\u8a8d\u5df2\u5099\u4efd\u91cd\u8981 Excel \u6a94\u6848\u3002</p>
            <button onclick="AdminPortal.clearAllSystemData()" class="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-5 rounded-xl text-sm shadow-2xs transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-[0.98]">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              <span>\u6e05\u9664\u4e26\u91cd\u8a2d\u7cfb\u7d71\u8cc7\u6599</span>
            </button>
          </div>
        </div>
      </div>
      <!-- ==================== \u6a21\u7d44 9: \u6700\u65b0\u516c\u544a\u7ba1\u7406 ==================== -->
      <div id="erpView_announcements" class="hidden corp-card p-6 space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 class="text-lg font-bold text-slate-900">\ud83d\udce2 \u6700\u65b0\u516c\u544a\u8207\u6ce8\u610f\u4e8b\u9805\u7ba1\u7406</h3>
            <p class="text-sm text-slate-600 mt-1">\u8a2d\u5b9a\u5b78\u751f\u524d\u53f0\u986f\u793a\u4e4b\u516c\u544a\u5167\u5bb9\uff0c\u652f\u63f4\u7cbe\u6e96\u8d77\u8a16\u6642\u9593\u63a7\u5236\uff0c\u903e\u671f\u81ea\u52d5\u96b1\u85cf\u3002</p>
          </div>
        </div>
        <div class="corp-table-container max-h-[60vh] overflow-y-auto">
          <table class="corp-table">
            <thead>
              <tr>
                <th class="w-[8%] text-center">\u7f6e\u9802</th>
                <th class="w-[12%] text-center">\u5206\u985e</th>
                <th class="w-[30%] text-left">\u516c\u544a\u6a19\u984c</th>
                <th class="w-[22%] text-center">\u520a\u767b\u8d77\u8a16\u6642\u9593</th>
                <th class="w-[14%] text-center">\u5373\u6642\u520a\u767b\u72c0\u614b</th>
                <th class="w-[14%] text-center">\u64cd\u4f5c</th>
              </tr>
            </thead>
            <tbody id="erpAnnouncementsTbody"></tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
  <!-- ==================== \u6d6e\u52d5 Dock \u5de5\u5177\u5217 ==================== -->
  <div id="batchActionBar" class="corp-dock-bar hidden">
    <span class="text-sm font-semibold">\u5df2\u9078\u53d6 <span id="batchSelectedCountBadge" class="underline font-extrabold text-amber-300">0</span> \u4f4d\u5b78\u751f\uff1a</span>
    <button onclick="AdminPortal.batchPassSelected()" class="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-1">
      \u8a2d\u70ba\u5408\u683c
    </button>
    <button onclick="AdminPortal.batchFailSelected()" class="bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-1">
      \u8a2d\u70ba\u672a\u5408\u683c
    </button>
    <button onclick="AdminPortal.batchCopyEmails()" class="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-1">
      \u8907\u88fd Email
    </button>
  </div>
  <!-- Modal 1: \u7de8\u8f2f\u5b78\u7c4d\u57fa\u672c\u8cc7\u6599 Modal -->
  <div id="rosterEditModal" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 hidden">
    <div class="corp-card max-w-md w-full p-6 shadow-2xl bg-white rounded-2xl border border-slate-200">
      <div class="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
        <div>
          <h3 class="text-lg font-bold text-slate-900">\u4fee\u8a02\u5b78\u751f\u5b78\u7c4d\u57fa\u672c\u8cc7\u6599</h3>
          <p id="rosterModalStudentIdHeader" class="text-sm text-slate-500 font-mono font-semibold mt-0.5">-</p>
        </div>
        <button onclick="AdminPortal.closeRosterEditModal()" class="text-slate-400 hover:text-slate-600 text-2xl font-bold">\u2715</button>
      </div>
      <div class="space-y-4 text-sm">
        <div>
          <label class="block font-bold text-slate-700 mb-1.5">\u59d3\u540d</label>
          <input type="text" id="rosterInputName" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm">
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1.5">\u73ed\u7d1a</label>
          <input type="text" id="rosterInputClassName" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-medium text-slate-900 text-sm">
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1.5">\u5165\u5b78\u5e74 (\u5b78\u5e74\u5ea6)</label>
          <input type="text" id="rosterInputEnrollYear" placeholder="\u4f8b: 110" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 font-mono text-sm">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1.5">\u5165\u5b78\u65b9\u5f0f</label>
            <input type="text" id="rosterInputAdmissionMethod" placeholder="\u4f8b: \u4e00\u822c, \u8f49\u5b78\u8003, \u904b\u52d5\u7e3e\u512a" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-medium text-slate-900 text-sm">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1.5">\u8eab\u5206</label>
            <input type="text" id="rosterInputIdentity" placeholder="\u4f8b: \u4e00\u822c\u751f, \u8eab\u5fc3\u969c\u7919" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-medium text-slate-900 text-sm">
          </div>
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1.5">\u5b78\u7c4d\u72c0\u614b</label>
          <select id="rosterSelectRosterStatus" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm">
            <option value="\u5728\u5b78">\u5728\u5b78</option>
            <option value="\u975e\u5728\u7c4d">\u975e\u5728\u7c4d</option>
          </select>
        </div>
        <div class="flex gap-3 pt-4 border-t border-slate-200">
          <button onclick="AdminPortal.closeRosterEditModal()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-sm flex-1">\u53d6\u6d88</button>
          <button onclick="AdminPortal.saveRosterEdit()" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm shadow-xs flex-1">\u5132\u5b58\u5b78\u7c4d\u4fee\u8a02</button>
        </div>
      </div>
    </div>
  </div>
  <!-- Modal 2: \u7de8\u8f2f\u9ad4\u9069\u80fd\u7562\u696d\u9580\u6abb Modal -->
  <div id="thresholdEditModal" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 hidden">
    <div class="corp-card max-w-2xl w-full p-6 shadow-2xl bg-white rounded-2xl max-h-[90vh] overflow-y-auto border border-slate-200">
      <div class="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
        <div>
          <h3 class="text-lg font-bold text-slate-900">\u5be9\u6838\u8207\u4fee\u8a02\u9ad4\u9069\u80fd\u7562\u696d\u9580\u6abb</h3>
          <p id="thresholdModalStudentHeader" class="text-sm text-slate-500 font-mono font-semibold mt-0.5">-</p>
        </div>
        <button onclick="AdminPortal.closeThresholdEditModal()" class="text-slate-400 hover:text-slate-600 text-2xl font-bold">\u2715</button>
      </div>
      <div class="space-y-4.5 text-sm">
        <div class="grid grid-cols-2 gap-3.5">
          <div>
            <label class="block font-bold text-slate-700 mb-1.5">\u63a1\u8a08\u6b21\u6578 (\u901a\u904e\u6b21\u6578)</label>
            <input type="number" id="thresholdInputPassCount" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-bold font-mono text-slate-900 text-sm">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1.5">\u9580\u6abb\u901a\u904e\u72c0\u614b</label>
            <select id="thresholdSelectStatus" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm">
              <option value="\u901a\u904e">\u901a\u904e (\u5408\u683c)</option>
              <option value="\u4e0d\u901a\u904e">\u4e0d\u901a\u904e (\u672a\u5408\u683c)</option>
            </select>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3.5">
          <div>
            <label class="block font-bold text-slate-700 mb-1.5">\u662f\u5426\u8f49\u5b78\u6263\u62b5 (\u986f\u793a1)</label>
            <select id="thresholdSelectTransfer" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-medium text-slate-900 text-sm">
              <option value="0">\u5426 (\u4e00\u822c\u5b78\u751f)</option>
              <option value="1">\u662f (\u8f49\u5b78\u6263\u62b51\u6b21)</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1.5">\u7279\u6b8a\u514d\u6e2c\u8eab\u5206\u8a2d\u5b9a</label>
            <select id="thresholdSelectAthlete" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-medium text-slate-900 text-sm">
              <option value="0">\u5426 (\u6b63\u5e38\u61c9\u6e2c)</option>
              <option value="1">\u9ad4\u4fdd\u751f\u514d\u6e2c</option>
              <option value="2">\u8eab\u5fc3\u969c\u7919\u514d\u6e2c</option>
              <option value="3">\u6838\u53ef\u514d\u6e2c (\u5176\u4ed6)</option>
            </select>
          </div>
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1.5">\u5404\u5b78\u671f\u901a\u904e\u8a3b\u8a18 (1101 ~ 1132)</label>
          <div id="thresholdSemesterCheckboxes" class="grid grid-cols-4 gap-2 border border-slate-200 p-3.5 rounded-xl bg-slate-50 text-sm"></div>
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1.5">\u7570\u52d5\u539f\u56e0 / \u6b21\u6578\u5176\u9918\u8aaa\u660e (\u4f8b: \u6821\u5167\u81ea\u8f49...)</label>
          <textarea id="thresholdInputNotes" rows="2" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-medium text-slate-900 text-sm" placeholder="\u586b\u5beb\u7570\u52d5\u539f\u56e0\u6216\u5099\u8a3b..."></textarea>
        </div>
        <div class="flex gap-3 pt-4 border-t border-slate-200">
          <button onclick="AdminPortal.closeThresholdEditModal()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-sm flex-1">\u53d6\u6d88</button>
          <button onclick="AdminPortal.saveThresholdEdit()" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm shadow-xs flex-1">\u5132\u5b58\u8b8a\u66f4</button>
        </div>
      </div>
    </div>
  </div>
  <!-- 2. \u532f\u5165\u5b78\u7c4d Modal -->
  <div id="rosterImportModal" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 hidden">
    <div class="corp-card max-w-md w-full p-6 bg-white rounded-2xl border border-slate-200">
      <div class="flex justify-between items-center mb-3">
        <h3 class="font-bold text-slate-900 text-base">\u532f\u5165\u5b78\u671f\u5b78\u7c4d\u6a94 Excel</h3>
        <button onclick="App.closeRosterModal()" class="text-slate-400 font-bold text-lg">\u2715</button>
      </div>
      <div class="border-2 border-dashed border-blue-200 p-6 text-center rounded-xl mb-3 bg-blue-50/20">
        <input type="file" id="rosterFileInput" accept=".xlsx,.xls" class="block mx-auto text-sm text-slate-700 font-medium">
      </div>
      <div class="flex justify-between items-center text-xs text-slate-500 font-medium">
        <span>\u5305\u542b\u6b04\u4f4d\uff1a\u5b78\u865f\u3001\u73ed\u7d1a\u3001\u59d3\u540d(\u5168\u540d)\u3002</span>
        <button onclick="App.downloadRosterTemplate()" class="text-blue-600 font-bold hover:underline">\u4e0b\u8f09\u6a19\u6e96\u7bc4\u672c (.xlsx)</button>
      </div>
    </div>
  </div>
  <!-- 3. \u532f\u5165\u6210\u7e3e Modal -->
  <div id="testImportModal" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 hidden">
    <div class="corp-card max-w-md w-full p-6 bg-white rounded-2xl border border-slate-200">
      <div class="flex justify-between items-center mb-3">
        <h3 class="font-bold text-slate-900 text-base">\u532f\u5165\u9ad4\u9069\u80fd\u6210\u7e3e Excel (17\u6b04/21\u6b04\u4f4d)</h3>
        <button onclick="App.closeTestImportModal()" class="text-slate-400 font-bold text-lg">\u2715</button>
      </div>
      <div class="space-y-3 mb-3">
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">\u6b78\u6a94\u5b78\u671f (\u5982\u70ba\u55ae\u5b78\u671f\u6210\u7e3e\u8acb\u586b\u5beb)</label>
          <input type="text" id="importSemesterInput" value="" placeholder="\u4f8b: 1122 (\u8acb\u52d9\u5fc5\u586b\u5beb)" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900">
        </div>
        <div class="border-2 border-dashed border-indigo-200 p-6 text-center rounded-xl bg-indigo-50/20">
          <input type="file" id="testDataFileInput" accept=".xlsx,.xls" class="block mx-auto text-sm text-slate-700 font-medium">
        </div>
        <div class="flex justify-end text-xs mb-3">
          <button onclick="App.downloadTestScoreTemplate()" class="text-indigo-600 font-bold hover:underline">\u4e0b\u8f09 17 \u6b04\u4f4d\u6a19\u6e96\u6210\u7e3e\u7bc4\u672c (.xlsx)</button>
        </div>
        <!-- \u6b77\u53f2\u532f\u5165\u72c0\u614b\u5340\u584a -->
        <div class="pt-3 border-t border-slate-200">
          <h4 class="text-sm font-bold text-slate-800 mb-2 flex items-center gap-1.5">
            <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            \u5404\u5b78\u671f\u6700\u5f8c\u532f\u5165\u6642\u9593
          </h4>
          <div id="importHistoryList" class="space-y-1.5 max-h-32 overflow-y-auto text-xs font-mono text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div class="text-slate-400 text-center py-2">\u8b80\u53d6\u4e2d...</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- 4. \ud83d\udee1\ufe0f \u5b78\u7c4d\u6bd4\u5c0d\u9632\u5446\u63d0\u9192 Modal -->
  <div id="importMismatchModal" class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 hidden">
    <div class="corp-card max-w-3xl w-full p-6 shadow-2xl bg-white rounded-2xl max-h-[90vh] flex flex-col border border-slate-200">
      <div class="flex items-center justify-between pb-3 border-b border-rose-200 mb-4">
        <div class="flex items-center gap-2">
          <div class="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-lg shrink-0">
            \u26a0\ufe0f
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900">\u5b78\u7c4d\u5c0d\u6bd4\u9632\u5446\u63d0\u9192\uff1a\u767c\u73fe\u8cc7\u6599\u4e0d\u543b\u5408\uff01</h3>
            <p id="mismatchSummaryText" class="text-xs text-rose-700 font-bold mt-0.5">\u767c\u73fe N \u7b46 Excel \u8cc7\u6599\u8207\u7cfb\u7d71\u73fe\u6709\u5b78\u7c4d\u4e0d\u543b\u5408</p>
          </div>
        </div>
        <button onclick="App.cancelImportMismatch()" class="text-slate-400 hover:text-slate-600 text-2xl font-bold">\u2715</button>
      </div>
      <div class="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-4 text-sm text-rose-900 font-medium space-y-1">
        <p class="font-bold text-rose-950">\ud83d\udccc \u8acb\u78ba\u8a8d\u4ee5\u4e0b\u4e0d\u543b\u5408\u4e4b\u5b78\u865f\u8207\u59d3\u540d\uff1a</p>
        <p>1. <strong>\u59d3\u540d\u4e0d\u4e00\u81f4</strong>\uff1a\u4ee3\u8868 Excel \u5167\u7684\u59d3\u540d\u8207\u7cfb\u7d71\u73fe\u6709\u8a18\u9304\u4e0d\u540c\uff0c\u82e5\u5f37\u884c\u532f\u5165\u5c07\u8986\u5beb\u59d3\u540d\u3002</p>
        <p>2. <strong>\u5168\u65b0\u5b78\u865f</strong>\uff1a\u4ee3\u8868\u8a72\u5b78\u865f\u5c1a\u672a\u5728\u5b78\u7c4d\u540d\u518a\u4e2d\uff0c\u5f37\u884c\u532f\u5165\u5c07\u81ea\u52d5\u65b0\u5efa\u8a72\u5b78\u751f\u3002</p>
      </div>
      <!-- \u4e0d\u543b\u5408\u9805\u76ee\u5217\u8868 -->
      <div class="flex-1 overflow-y-auto corp-table-container mb-4">
        <table class="corp-table">
          <thead>
            <tr>
              <th class="w-12 text-center">\u5217\u6b21</th>
              <th>Excel \u5b78\u865f</th>
              <th>Excel \u73ed\u7d1a</th>
              <th>Excel \u59d3\u540d</th>
              <th>\u7cfb\u7d71\u73fe\u6709\u59d3\u540d</th>
              <th class="text-center">\u72c0\u614b\u8aaa\u660e</th>
            </tr>
          </thead>
          <tbody id="mismatchTbody"></tbody>
        </table>
      </div>
      <div class="flex items-center justify-between pt-4 border-t border-slate-200">
        <span class="text-sm text-slate-600 font-medium">\u8acb\u554f\u60a8\u662f\u5426\u4f9d\u7136\u8981\u5f37\u884c\u532f\u5165\u6b64 Excel \u6a94\u6848\uff1f</span>
        <div class="flex gap-3">
          <button onclick="App.cancelImportMismatch()" class="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-4.5 py-2.5 rounded-xl text-sm transition-colors">
            \u53d6\u6d88\u532f\u5165 (\u4fee\u8a02\u6a94\u6848)
          </button>
          <button onclick="App.confirmImportDespiteMismatches()" class="bg-rose-600 hover:bg-rose-700 text-white font-bold px-5.5 py-2.5 rounded-xl text-sm shadow-xs transition-all">
            \u4f9d\u7136\u5f37\u884c\u532f\u5165 (\u8986\u5beb/\u65b0\u589e)
          </button>
        </div>
      </div>
    </div>
  </div>
  <!-- 5. \u26a0\ufe0f \u6210\u7e3e\u885d\u7a81\u8b66\u793a\u8207\u6c7a\u7b56 Modal -->
  <div id="scoreConflictModal" class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 hidden">
    <div class="corp-card max-w-4xl w-full p-6 shadow-2xl bg-white rounded-2xl max-h-[90vh] flex flex-col border border-slate-200">
      <div class="flex items-center justify-between pb-3 border-b border-amber-300 mb-4">
        <div class="flex items-center gap-2">
          <div class="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-lg shrink-0">
            \u26a0\ufe0f
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900">\u6210\u7e3e\u885d\u7a81\u63d0\u9192\uff1a\u8207\u7cfb\u7d71\u73fe\u6709\u6210\u7e3e\u4e0d\u4e00\u81f4</h3>
            <p id="conflictSummaryText" class="text-xs text-amber-700 font-bold mt-0.5">\u767c\u73fe N \u7b46 Excel \u6210\u7e3e\u8207\u7cfb\u7d71\u73fe\u6709\u72c0\u614b\u76f8\u885d</p>
          </div>
        </div>
      </div>
      <div class="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex gap-3 text-sm text-amber-800">
        <span class="text-lg">\ud83d\udca1</span>
        <div>
          <strong>\u8aaa\u660e\uff1a</strong>
          \u532f\u5165\u7684 Excel \u6a94\u6848\u4e2d\uff0c\u90e8\u5206\u5b78\u751f\u7684\u300c\u55ae\u5b78\u671f\u662f\u5426\u901a\u904e\u300d\u72c0\u614b\u8207\u7cfb\u7d71\u539f\u672c\u7d00\u9304\u7684\u4e0d\u540c\u3002\u8acb\u78ba\u8a8d\u8981\u4ee5\u54ea\u4e00\u908a\u7684\u6210\u7e3e\u70ba\u4e3b\uff1f
        </div>
      </div>
      <div class="flex-1 overflow-auto bg-slate-50 border border-slate-200 rounded-xl mb-4 relative min-h-[150px]">
        <table class="w-full text-sm text-left">
          <thead class="text-xs text-slate-500 bg-white sticky top-0 shadow-sm z-10">
            <tr>
              <th class="px-4 py-3 font-bold">\u5b78\u865f</th>
              <th class="px-4 py-3 font-bold">\u59d3\u540d</th>
              <th class="px-4 py-3 font-bold text-center">\u5b78\u671f</th>
              <th class="px-4 py-3 font-bold text-center">\u7cfb\u7d71\u73fe\u6709\u6210\u7e3e</th>
              <th class="px-4 py-3 font-bold text-center">\u672c\u6b21\u532f\u5165 Excel</th>
            </tr>
          </thead>
          <tbody id="scoreConflictTbody" class="divide-y divide-slate-200">
            <!-- JS dynamically inserts rows here -->
          </tbody>
        </table>
      </div>
      <!-- \u6c7a\u7b56\u5340 -->
      <div class="bg-slate-50 border border-slate-200 p-4 rounded-xl mb-4">
        <h4 class="font-bold text-slate-800 text-sm mb-3">\u8acb\u9078\u64c7\u6574\u6279\u8655\u7406\u539f\u5247 (\u5c07\u5957\u7528\u81f3\u4e0a\u65b9\u6240\u6709\u885d\u7a81\u7684\u5b78\u751f)\uff1a</h4>
        <div class="flex gap-4">
          <label class="flex-1 flex items-start gap-3 p-3 border-2 border-slate-300 rounded-xl cursor-pointer hover:bg-white transition-all has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
            <input type="radio" name="conflictResolution" value="keep_db" class="mt-1" checked>
            <div>
              <div class="font-bold text-slate-900 text-sm">\u4ee5\u300c\u7cfb\u7d71\u300d\u73fe\u6709\u6210\u7e3e\u70ba\u4e3b (\u9810\u8a2d\u5b89\u5168)</div>
              <div class="text-xs text-slate-500 mt-0.5">\u5ffd\u7565\u4e0a\u65b9\u6e05\u55ae\u7684 Excel \u885d\u7a81\u6210\u7e3e\uff0c\u4fdd\u7559\u7cfb\u7d71\u539f\u672c\u72c0\u614b\u3002(\u5176\u4ed6\u7121\u885d\u7a81\u6b04\u4f4d\u4ecd\u6703\u6b63\u5e38\u532f\u5165)</div>
            </div>
          </label>
          <label class="flex-1 flex items-start gap-3 p-3 border-2 border-slate-300 rounded-xl cursor-pointer hover:bg-white transition-all has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
            <input type="radio" name="conflictResolution" value="overwrite" class="mt-1">
            <div>
              <div class="font-bold text-slate-900 text-sm">\u4ee5\u300c\u672c\u6b21 Excel\u300d\u70ba\u4e3b (\u5f37\u5236\u8986\u5beb)</div>
              <div class="text-xs text-slate-500 mt-0.5">\u5f37\u5236\u7528\u9019\u6b21\u4e0a\u50b3\u7684 Excel \u7d00\u9304\u84cb\u6389\u7cfb\u7d71\u5167\u539f\u672c\u7684\u8a72\u5b78\u671f\u6210\u7e3e\u3002</div>
            </div>
          </label>
        </div>
      </div>
      <div class="flex justify-end gap-3 pt-3 border-t border-slate-200">
        <button onclick="App.cancelImportConflict()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-2.5 rounded-xl text-sm transition-colors">
          \u53d6\u6d88\uff0c\u4e0d\u532f\u5165
        </button>
        <button onclick="App.confirmImportConflict()" class="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-md transition-colors flex items-center gap-2">
          \u78ba\u8a8d\u57f7\u884c
        </button>
      </div>
    </div>
  </div>
  <!-- 5.5. \ud83d\udea8 \u7562\u696d\u9580\u6abb\u908f\u8f2f\u7a3d\u6838 Modal -->
  <div id="logicConflictModal" class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 hidden">
    <div class="corp-card max-w-4xl w-full p-6 shadow-2xl bg-white rounded-2xl max-h-[90vh] flex flex-col border border-slate-200">
      <div class="flex items-center justify-between pb-3 border-b border-rose-300 mb-4">
        <div class="flex items-center gap-2">
          <div class="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-lg shrink-0">
            \ud83d\udea8
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900">\u908f\u8f2f\u885d\u7a81\u7a3d\u6838\uff1a\u5df2\u9054\u7562\u696d\u9580\u6abb\u537b\u88ab\u6a19\u8a18\u70ba\u4e0d\u901a\u904e</h3>
            <p id="logicConflictSummaryText" class="text-xs text-rose-700 font-bold mt-0.5">\u767c\u73fe N \u7b46 Excel \u8cc7\u6599\u51fa\u73fe\u908f\u8f2f\u77db\u76fe</p>
          </div>
        </div>
      </div>
      <div class="bg-rose-50 border border-rose-200 rounded-xl p-3 mb-4 flex gap-3 text-sm text-rose-800">
        <span class="text-lg">\ud83d\udca1</span>
        <div>
          <strong>\u8aaa\u660e\uff1a</strong>
          \u7cfb\u7d71\u5075\u6e2c\u5230\u4e0b\u5217\u5b78\u751f<strong>\u5be6\u969b\u901a\u904e\u6b21\u6578\u5df2\u9054 2 \u6b21 (\u6216\u4eab\u6709\u514d\u6e2c\u8cc7\u683c)</strong>\uff0c\u4f46\u60a8\u532f\u5165\u7684 Excel \u6a94\u6848\u537b\u6a19\u793a\u4ed6\u5011\u70ba\u300c\u4e0d\u901a\u904e\u300d\u6216\u300c\u9700\u88dc\u6b21\u6578 > 0\u300d\u3002\u8acb\u9078\u64c7\u8981\u5982\u4f55\u8655\u7406\u9019\u6279\u8cc7\u6599\uff1a
        </div>
      </div>
      <div class="flex-1 overflow-auto bg-slate-50 border border-slate-200 rounded-xl mb-4 relative min-h-[150px]">
        <table class="w-full text-sm text-left">
          <thead class="text-xs text-slate-500 bg-white sticky top-0 shadow-sm z-10">
            <tr>
              <th class="px-4 py-3 font-bold">\u5b78\u865f</th>
              <th class="px-4 py-3 font-bold">\u59d3\u540d</th>
              <th class="px-4 py-3 font-bold text-center">\u5be6\u969b\u901a\u904e\u6b21\u6578</th>
              <th class="px-4 py-3 font-bold text-center">Excel \u5224\u5b9a\u7d50\u679c</th>
            </tr>
          </thead>
          <tbody id="logicConflictTbody" class="divide-y divide-slate-200">
            <!-- JS dynamically inserts rows here -->
          </tbody>
        </table>
      </div>
      <!-- \u6c7a\u7b56\u5340 -->
      <div class="bg-slate-50 border border-slate-200 p-4 rounded-xl mb-4">
        <h4 class="font-bold text-slate-800 text-sm mb-3">\u8acb\u9078\u64c7\u6574\u6279\u8655\u7406\u539f\u5247 (\u5c07\u5957\u7528\u81f3\u4e0a\u65b9\u6240\u6709\u885d\u7a81\u7684\u5b78\u751f)\uff1a</h4>
        <div class="flex gap-4">
          <label class="flex-1 flex items-start gap-3 p-3 border-2 border-slate-300 rounded-xl cursor-pointer hover:bg-white transition-all has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
            <input type="radio" name="logicResolution" value="force_pass" class="mt-1" checked>
            <div>
              <div class="font-bold text-slate-900 text-sm">\u4f9d\u64da\u7cfb\u7d71\u9580\u6abb (\u5f37\u5236\u5224\u5b9a\u70ba\u901a\u904e)</div>
              <div class="text-xs text-slate-500 mt-0.5">\u63a8\u7ffb Excel \u7684\u932f\u8aa4\u6a19\u8a18\uff0c\u81ea\u52d5\u5c07\u4e0a\u65b9\u5b78\u751f\u7684\u72c0\u614b\u6539\u70ba\u300c\u901a\u904e\u300d\u4e26\u5c07\u9700\u88dc\u6b21\u6578\u6b78\u96f6\u3002</div>
            </div>
          </label>
          <label class="flex-1 flex items-start gap-3 p-3 border-2 border-slate-300 rounded-xl cursor-pointer hover:bg-white transition-all has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
            <input type="radio" name="logicResolution" value="keep_excel" class="mt-1">
            <div>
              <div class="font-bold text-slate-900 text-sm">\u4fdd\u7559 Excel \u539f\u5224 (\u7dad\u6301\u4e0d\u901a\u904e)</div>
              <div class="text-xs text-slate-500 mt-0.5">\u5c0a\u91cd Excel \u6a94\u6848\u4e2d\u7684\u7d00\u9304 (\u53ef\u80fd\u8a72\u751f\u6709\u7279\u6b8a\u61f2\u8655\u7b49\u60c5\u6cc1)\uff0c\u532f\u5165\u5f8c\u72c0\u614b\u7dad\u6301\u70ba\u300c\u4e0d\u901a\u904e\u300d\u3002</div>
            </div>
          </label>
        </div>
      </div>
      <div class="flex justify-end gap-3 pt-3 border-t border-slate-200">
        <button onclick="App.cancelLogicConflict()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-2.5 rounded-xl text-sm transition-colors">
          \u53d6\u6d88\uff0c\u4e0d\u532f\u5165
        </button>
        <button onclick="App.confirmLogicConflict()" class="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-md transition-colors flex items-center gap-2">
          \u78ba\u8a8d\u57f7\u884c
        </button>
      </div>
    </div>
  </div>
  <!-- 5. \ud83d\udcca \u9ad8\u7d1a\u532f\u51fa\u5c0d\u8a71\u76d2 Modal -->
  <div id="exportModal" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 hidden">
    <div class="corp-card max-w-lg w-full p-6 bg-white rounded-2xl shadow-2xl border border-slate-200">
      <div class="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
        <h3 class="font-bold text-slate-900 text-lg flex items-center gap-2">
          <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          \u5ba2\u88fd\u5316 Excel \u532f\u51fa\u7684\u9078\u64c7
        </h3>
        <button onclick="AdminPortal.closeExportModal()" class="text-slate-400 hover:text-slate-600 text-2xl font-bold">\u2715</button>
      </div>
      <div class="space-y-4 text-sm">
        <!-- 1. \u5e74\u7d1a\u8207\u73ed\u7d1a\u7be9\u9078 -->
        <div>
          <label class="block font-bold text-slate-800 mb-1.5">1. \u9078\u64c7\u532f\u51fa\u5b78\u751f\u7bc4\u570d (\u542b\u56db\u5e74\u7d1a\u5c08\u7528\u9078\u9805)</label>
          <select id="exportGradeScope" onchange="AdminPortal.onExportScopeChange(this.value)" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 bg-slate-50 text-sm">
            <option value="all" selected>\u5168\u6821\u6240\u6709\u5b78\u751f</option>
            <option value="grade4">\ud83c\udf93 \u4e00\u6b21\u532f\u51fa\u6240\u6709\u300c\u56db\u5e74\u7d1a\u300d\u5b78\u751f (\u56db\u958b\u982d\u73ed\u7d1a)</option>
            <option value="grade3">\ud83c\udf93 \u4e00\u6b21\u532f\u51fa\u6240\u6709\u300c\u4e09\u5e74\u7d1a\u300d\u5b78\u751f (\u4e09\u958b\u982d\u73ed\u7d1a)</option>
            <option value="specific_class">\u7279\u5b9a\u73ed\u7d1a...</option>
          </select>
        </div>
        <div id="exportSpecificClassContainer" class="hidden">
          <label class="block font-bold text-slate-700 mb-1.5">\u6307\u5b9a\u73ed\u7d1a</label>
          <select id="exportSpecificClassSelect" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-medium text-slate-900 text-sm"></select>
        </div>
        <!-- 2. \u9580\u6abb\u72c0\u614b\u904e\u6ffe -->
        <div>
          <label class="block font-bold text-slate-800 mb-1.5">2. \u9580\u6abb\u901a\u904e\u72c0\u6cc1\u904e\u6ffe</label>
          <select id="exportStatusFilter" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 bg-slate-50 text-sm">
            <option value="all" selected>\u6240\u6709\u72c0\u614b (\u5305\u542b\u5408\u683c\u8207\u4e0d\u901a\u904e)</option>
            <option value="failed_only" class="text-rose-600">\u274c \u50c5\u532f\u51fa\u300c\u4e0d\u901a\u904e (\u672a\u5408\u683c)\u300d\u540d\u55ae</option>
            <option value="passed_only" class="text-emerald-600">\u2705 \u50c5\u532f\u51fa\u300c\u901a\u904e (\u5408\u683c)\u300d\u540d\u55ae</option>
          </select>
        </div>
        <!-- 3. Excel \u5de5\u4f5c\u8868\u5206\u9801\u7d50\u69cb -->
        <div>
          <label class="block font-bold text-slate-800 mb-1.5">3. Excel \u5de5\u4f5c\u8868 (Sheet) \u7d50\u69cb</label>
          <select id="exportSheetStructure" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 bg-slate-50 text-sm">
            <option value="single_sheet" selected>\u55ae\u4e00\u5de5\u4f5c\u8868 (\u5168\u90e8\u8cc7\u6599\u6574\u4f75\u5728\u4e00\u9801)</option>
            <option value="multi_sheet_by_class">\u6309\u73ed\u7d1a\u81ea\u52d5\u5206\u9801 (\u6bcf\u500b\u73ed\u7d1a\u7368\u7acb 1 \u500b Sheet \u9801\u7c64)</option>
          </select>
        </div>
        <div class="pt-4 border-t border-slate-200 flex gap-3">
          <button onclick="AdminPortal.closeExportModal()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-sm flex-1 border border-slate-200">
            \u53d6\u6d88
          </button>
          <button onclick="AdminPortal.executeSmartExport()" class="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 rounded-xl text-sm shadow-xs flex-1 flex items-center justify-center gap-1">
            \u7522\u751f\u4e26\u4e0b\u8f09 Excel
          </button>
        </div>
      </div>
    </div>
  </div>
  <!-- 6. \ud83d\udcdd \u6aa2\u6e2c\u8cc7\u6599\u7de8\u8f2f Modal -->
  <div id="recordEditModal" class="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 hidden">
    <div class="corp-card max-w-md w-full p-6 bg-white rounded-xl shadow-2xl border border-slate-200">
      <div class="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
        <h3 class="font-bold text-slate-900 text-lg flex items-center gap-2">
          <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          \u7de8\u8f2f\u6aa2\u6e2c\u6210\u7e3e
        </h3>
        <button onclick="AdminPortal.closeRecordEditModal()" class="text-slate-400 hover:text-slate-600 text-2xl font-bold">\u2715</button>
      </div>
      <div class="mb-4 text-sm font-bold text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center gap-4">
        <div>\u5b78\u865f\uff1a<span id="editRecordStudentId" class="text-slate-900 font-mono"></span></div>
        <div>\u5b78\u671f\uff1a<span id="editRecordSemester" class="text-blue-700 font-mono bg-blue-100 px-2 py-0.5 rounded"></span></div>
      </div>
      <div class="space-y-4 text-sm">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block font-bold text-slate-800 mb-1.5">\u8eab\u9ad8 (cm)</label>
            <input type="text" id="editRecordHeight" placeholder="\u4f8b\u5982: 172.5" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
          </div>
          <div>
            <label class="block font-bold text-slate-800 mb-1.5">\u9ad4\u91cd (kg)</label>
            <input type="text" id="editRecordWeight" placeholder="\u4f8b\u5982: 65.0" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
          </div>
          <div>
            <label class="block font-bold text-slate-800 mb-1.5">\u5750\u59ff\u9ad4\u524d\u5f4e (cm)</label>
            <input type="text" id="editRecordSitAndReach" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
          </div>
          <div>
            <label class="block font-bold text-slate-800 mb-1.5">\u7acb\u5b9a\u8df3\u9060 (cm)</label>
            <input type="text" id="editRecordStandingLongJump" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
          </div>
          <div>
            <label class="block font-bold text-slate-800 mb-1.5">\u4ef0\u81e5\u8d77\u5750 (\u6b21/\u5206)</label>
            <input type="text" id="editRecordSitUps" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
          </div>
          <div>
            <label class="block font-bold text-slate-800 mb-1.5">\u5fc3\u80ba\u8010\u529b\u767b\u968e</label>
            <input type="text" id="editRecordCardio" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
          </div>
        </div>
        <div>
          <label class="block font-bold text-slate-800 mb-1.5 mt-2">\u8a72\u5b78\u671f\u72c0\u614b\u7d50\u679c (\u5c07\u9023\u52d5\u7e3d\u8868)</label>
          <select id="editRecordStatus" class="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold">
            <option value="\u5408\u683c" class="text-emerald-600">\u2705 \u5408\u683c (Passed)</option>
            <option value="\u4e0d\u5408\u683c" class="text-rose-600">\u274c \u4e0d\u5408\u683c (Failed)</option>
            <option value="\u514d\u6e2c" class="text-amber-600">\u26a0\ufe0f \u514d\u6e2c (Exempt)</option>
          </select>
        </div>
        <div class="pt-4 border-t border-slate-200 flex gap-3">
          <button onclick="AdminPortal.closeRecordEditModal()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-lg text-sm flex-1 border border-slate-200">
            \u53d6\u6d88
          </button>
          <button onclick="AdminPortal.saveRecordEdit()" class="bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-2 rounded-lg text-sm shadow-sm flex-1">
            \u5132\u5b58\u8b8a\u66f4
          </button>
        </div>
      </div>
    </div>
  </div>
  <!-- 6.5 \u55ae\u7368\u65b0\u589e\u500b\u4eba\u9ad4\u9069\u80fd\u6210\u7e3e\u7d00\u9304 Modal -->
  <div id="addRecordModal" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 hidden">
    <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 space-y-4">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-teal-50 text-[#0d9488] flex items-center justify-center border border-teal-100">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
          </div>
          <span>\u55ae\u7368\u65b0\u589e\u500b\u4eba\u6aa2\u6e2c\u6210\u7e3e</span>
        </h3>
        <button onclick="AdminPortal.closeAddRecordModal()" class="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="space-y-3 text-sm">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">\u76ee\u6a19\u5b78\u751f\u5b78\u865f <span class="text-rose-500">*</span></label>
            <input type="text" id="addRecordStudentId" onkeyup="AdminPortal.lookupAddRecordStudentInfo()" placeholder="\u8f38\u5165\u5b78\u865f (\u5982: 110001001)" class="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-mono text-sm focus:border-teal-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">\u6aa2\u6e2c\u5b78\u671f <span class="text-rose-500">*</span></label>
            <input type="text" id="addRecordSemester" placeholder="\u5982: 1121 \u6216 1122" class="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-bold text-sm focus:border-teal-500 focus:outline-none">
          </div>
        </div>
        <!-- \u5373\u6642\u5b78\u751f\u9810\u89bd\u8cc7\u8a0a -->
        <div id="addRecordStudentPreview" class="hidden p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-between">
          <span id="addRecordStudentName">\u59d3\u540d\uff1a--</span>
          <span id="addRecordStudentClass" class="text-slate-500">\u73ed\u7d1a\uff1a--</span>
        </div>
        <div class="grid grid-cols-2 gap-3 pt-1">
          <div>
            <label class="block font-bold text-slate-700 mb-1 text-xs">\u8eab\u9ad8 (cm)</label>
            <input type="text" id="addRecordHeight" placeholder="\u4f8b\u5982: 172.5" class="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-teal-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1 text-xs">\u9ad4\u91cd (kg)</label>
            <input type="text" id="addRecordWeight" placeholder="\u4f8b\u5982: 65.0" class="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-teal-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1 text-xs">\u5750\u59ff\u9ad4\u524d\u5f4e (cm)</label>
            <input type="text" id="addRecordSitAndReach" placeholder="\u4f8b\u5982: 35.5" class="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-teal-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1 text-xs">\u7acb\u5b9a\u8df3\u9060 (cm)</label>
            <input type="text" id="addRecordStandingLongJump" placeholder="\u4f8b\u5982: 210" class="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-teal-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1 text-xs">\u4ef0\u81e5\u8d77\u5750 (\u6b21/\u5206)</label>
            <input type="text" id="addRecordSitUps" placeholder="\u4f8b\u5982: 45" class="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-teal-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1 text-xs">\u5fc3\u80ba\u8010\u529b\u767b\u968e</label>
            <input type="text" id="addRecordCardio" placeholder="\u4f8b\u5982: 630" class="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-teal-500 focus:outline-none">
          </div>
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">\u8a72\u5b78\u671f\u6aa2\u6e2c\u7d50\u679c <span class="text-rose-500">*</span></label>
          <select id="addRecordStatus" class="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-bold text-sm focus:border-teal-500 focus:outline-none">
            <option value="\u5408\u683c" selected class="text-emerald-600 font-bold">\u2705 \u5408\u683c (Passed)</option>
            <option value="\u4e0d\u5408\u683c" class="text-rose-600 font-bold">\u274c \u4e0d\u5408\u683c (Failed)</option>
            <option value="\u514d\u6e2c" class="text-amber-600 font-bold">\u26a0\ufe0f \u514d\u6e2c (Exempt)</option>
          </select>
        </div>
        <div class="pt-3 border-t border-slate-100 flex gap-3">
          <button onclick="AdminPortal.closeAddRecordModal()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-sm flex-1 cursor-pointer">
            \u53d6\u6d88
          </button>
          <button onclick="AdminPortal.saveNewRecord()" class="bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold py-2.5 rounded-xl text-sm shadow-2xs flex-1 cursor-pointer active:scale-[0.98]">
            \u5132\u5b58\u8a72\u7b46\u6210\u7e3e\u7d00\u9304
          </button>
        </div>
      </div>
    </div>
  </div>
  <!-- 6.6 EML \u90f5\u4ef6\u7bc4\u672c\u7de8\u8f2f\u8207\u9810\u89bd Modal -->
  <div id="emlPreviewModal" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 hidden">
    <div class="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] flex flex-col">
      <!-- Modal \u6a19\u982d\u5340 -->
      <div class="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
        <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-teal-50 text-[#0d9488] flex items-center justify-center border border-teal-100">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          </div>
          <span>EML \u90f5\u4ef6\u8349\u7a3f\u9810\u89bd\u8207\u5167\u5bb9\u81ea\u8a02\u7de8\u8f2f</span>
        </h3>
        <button onclick="AdminPortal.closeEmlPreviewModal()" class="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <!-- \u6536\u4ef6\u5b78\u751f\u8207\u72c0\u614b\u8cc7\u8a0a\u689d -->
      <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs font-bold text-slate-700 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-1 rounded-md bg-teal-100 text-teal-800 border border-teal-200 font-extrabold">\u767c\u9001\u5c0d\u8c61</span>
          <span id="emlPreviewRecipientSummary" class="text-slate-900 font-bold">\u5171 0 \u4f4d\u672a\u5408\u683c\u5b78\u751f</span>
        </div>
        <span class="text-slate-500 font-normal">\ud83d\udca1 \u4e0b\u8f09 .EML \u6a94\u958b\u555f\u5f8c\u6703\u5728 Outlook \u5448\u9001\uff0c\u60a8\u53ef\u4ee5\u5728\u6b64\u81ea\u7531\u5fae\u8abf\u6587\u5b57</span>
      </div>
      <!-- \u7de8\u8f2f\u5340 (\u53ef\u6372\u52d5) -->
      <div class="space-y-4 text-sm overflow-y-auto flex-1 pr-1">
        <div>
          <label class="block font-bold text-slate-800 mb-1">\u90f5\u4ef6\u4e3b\u65e8 (Subject)</label>
          <input type="text" id="emlSubjectInput" class="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm focus:border-teal-500 focus:outline-none">
        </div>
        <div>
          <label class="block font-bold text-slate-800 mb-1">\u5bc4\u4ef6\u8005\u55ae\u4f4d\u540d\u7a31 (Sender Title)</label>
          <input type="text" id="emlSenderInput" class="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-800 text-sm focus:border-teal-500 focus:outline-none">
        </div>
        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="block font-bold text-slate-800">\u90f5\u4ef6\u5167\u6587\u7de8\u8f2f (\u652f\u63f4\u81ea\u7531\u4fee\u6539\u6216\u88dc\u5145\u6ce8\u610f\u4e8b\u9805)</label>
            <button onclick="AdminPortal.resetEmlTemplateToDefault()" class="text-xs text-teal-700 hover:text-teal-900 font-bold underline cursor-pointer">
              \u21ba \u91cd\u7f6e\u70ba\u9810\u8a2d\u5167\u6587
            </button>
          </div>
          <textarea id="emlBodyTextarea" rows="9" class="w-full p-3.5 border border-slate-300 rounded-xl font-sans text-sm leading-relaxed text-slate-800 focus:border-teal-500 focus:outline-none"></textarea>
        </div>
      </div>
      <!-- \u5e95\u90e8\u64cd\u4f5c\u6309\u9215\u5340 -->
      <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
        <button onclick="AdminPortal.closeEmlPreviewModal()" class="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm cursor-pointer">
          \u53d6\u6d88
        </button>
        <button onclick="AdminPortal.downloadCustomizedEml()" class="px-6 py-2.5 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold text-sm shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          <span>\u78ba\u8a8d\u4e26\u4e0b\u8f09 .EML \u90f5\u4ef6\u8349\u7a3f\u6a94</span>
        </button>
      </div>
    </div>
  </div>
  <!-- 7. \u7ba1\u7406\u767b\u5165 Modal (\u5168\u87a2\u5e55\u4e0d\u900f\u660e\u767b\u5165\u9801) -->
  <div id="adminLoginModal" class="fixed inset-0 z-50 bg-[#f0f4f8] flex items-center justify-center p-4 hidden">
    <div class="max-w-[420px] w-full p-8 sm:p-9 bg-white rounded-3xl text-center shadow-2xl border border-slate-100/80">
      <!-- \u9802\u90e8 Icon -->
      <div class="w-20 h-20 rounded-full bg-emerald-50/80 border border-emerald-100 mx-auto flex items-center justify-center mb-4 shrink-0 shadow-2xs">
        <svg class="w-9 h-9 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <h3 class="font-black text-slate-900 text-2xl mb-2.5 tracking-tight">\u9ad4\u9069\u80fd\u7cfb\u7d71\u7ba1\u7406\u5f8c\u53f0</h3>
      <div class="w-12 h-1 bg-emerald-500 rounded-full mx-auto mb-7"></div>
      <div class="space-y-4 mb-7 text-left">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1.5">\u7ba1\u7406\u54e1\u5e33\u865f</label>
          <div class="relative">
            <svg class="w-5 h-5 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            <input type="text" id="adminAccountInput" placeholder="\u8acb\u8f38\u5165\u7ba1\u7406\u54e1\u5e33\u865f" class="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/40 text-sm font-semibold text-slate-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:bg-white focus:outline-none transition-colors placeholder:text-slate-400 placeholder:font-normal">
          </div>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1.5">\u7ba1\u7406\u54e1\u5bc6\u78bc</label>
          <div class="relative">
            <svg class="w-5 h-5 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            <input type="password" id="adminPasswordInput" placeholder="\u8acb\u8f38\u5165\u7ba1\u7406\u54e1\u5bc6\u78bc" class="w-full pl-11 pr-11 py-3 rounded-2xl border border-slate-200 bg-slate-50/40 text-sm font-semibold text-slate-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:bg-white focus:outline-none transition-colors placeholder:text-slate-400 placeholder:font-normal">
            <button type="button" onclick="AdminPortal.togglePasswordVisibility()" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none" aria-label="\u5207\u63db\u5bc6\u78bc\u986f\u793a">
              <svg id="pwdEyeIcon" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            </button>
          </div>
        </div>
      </div>
      <!-- \u7da0\u8272\u5be6\u5fc3\u767b\u5165\u6309\u9215 -->
      <button onclick="AdminPortal.verifyLogin()" class="w-full bg-[#0d9488] hover:bg-[#0f766e] text-white py-3.5 rounded-2xl text-base font-extrabold shadow-md shadow-emerald-600/20 transition-all active:scale-[0.99] cursor-pointer tracking-wider">
        \u767b \u5165
      </button>
      <!-- \u6216 \u5206\u9694\u7dda -->
      <div class="relative my-6 text-center">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-slate-200/80"></div>
        </div>
        <div class="relative inline-block bg-white px-3 text-xs font-bold text-slate-400">\u6216</div>
      </div>
      <!-- \u7da0\u8272\u5916\u6846\u8fd4\u56de\u5b78\u751f\u67e5\u8a62\u6309\u9215 -->
      <button onclick="AdminPortal.hideLoginModal(); App.switchTab('student');" class="w-full bg-white hover:bg-emerald-50/60 text-[#0d9488] border-2 border-[#0d9488] font-extrabold py-3.5 rounded-2xl text-base transition-all flex items-center justify-center gap-2 cursor-pointer">
        <svg class="w-5 h-5 text-[#0d9488]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        <span>\u8fd4\u56de\u5b78\u751f\u67e5\u8a62</span>
      </button>
    </div>
  </div>
  <!-- 7. Firebase \u8a2d\u5b9a Modal -->
  <div id="firebaseConfigModal" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 hidden">
    <div class="corp-card max-w-md w-full p-6 bg-white rounded-2xl border border-slate-200">
      <div class="flex justify-between items-center mb-3">
        <h3 class="font-bold text-slate-900 text-base">Firebase \u96f2\u7aef\u8cc7\u6599\u5eab</h3>
        <button onclick="App.closeFirebaseModal()" class="text-slate-400 font-bold text-lg">\u2715</button>
      </div>
      <div class="space-y-3.5 text-sm">
        <div>
          <label class="block font-bold text-slate-700 mb-1">API Key</label>
          <input type="text" id="fbApiKey" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-mono font-medium text-slate-900 text-sm">
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">Project ID</label>
          <input type="text" id="fbProjectId" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-mono font-medium text-slate-900 text-sm">
        </div>
        <div class="flex gap-3 pt-3">
          <button onclick="App.closeFirebaseModal()" class="bg-slate-100 text-slate-700 py-2.5 rounded-xl text-sm font-bold flex-1">\u53d6\u6d88</button>
          <button onclick="App.saveFirebaseConfig()" class="bg-blue-600 text-white py-2.5 rounded-xl text-sm font-bold flex-1 shadow-xs">\u5132\u5b58</button>
        </div>
      </div>
    </div>
  </div>
  <!-- 8. \u65b0\u589e/\u4fee\u8a02\u516c\u544a Modal -->
  <div id="announcementEditModal" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 hidden">
    <div class="corp-card max-w-lg w-full p-6 bg-white rounded-2xl border border-slate-200 shadow-xl">
      <div class="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
        <h3 id="announcementModalHeader" class="font-bold text-slate-900 text-base">\u65b0\u589e\u6700\u65b0\u516c\u544a</h3>
        <button onclick="AdminPortal.closeAnnouncementModal()" class="text-slate-400 hover:text-slate-600 font-bold text-lg">\u2715</button>
      </div>
      <div class="space-y-4 text-sm">
        <div>
          <label class="block font-bold text-slate-700 mb-1">\u516c\u544a\u6a19\u984c <span class="text-rose-500">*</span></label>
          <input type="text" id="announcementInputTitle" placeholder="\u4f8b\u5982: 112\u5b78\u5e74\u5ea6\u4e0b\u5b78\u671f \u5b78\u751f\u9ad4\u9069\u80fd\u88dc\u6e2c\u5831\u540d\u9808\u77e5" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-medium text-slate-900 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">\u516c\u544a\u5206\u985e</label>
            <select id="announcementSelectCategory" class="w-full px-3 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-800 text-sm focus:border-blue-500">
              <option value="\u91cd\u8981\u901a\u77e5">\u91cd\u8981\u901a\u77e5</option>
              <option value="\u88dc\u6e2c\u516c\u544a">\u88dc\u6e2c\u516c\u544a</option>
              <option value="\u7533\u8fa6\u63d0\u9192">\u7533\u8fa6\u63d0\u9192</option>
              <option value="\u8ab2\u7a0b\u8cc7\u8a0a">\u8ab2\u7a0b\u8cc7\u8a0a</option>
            </select>
          </div>
          <div class="flex items-center gap-4 pt-6">
            <label class="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
              <input type="checkbox" id="announcementInputIsPinned" class="w-4 h-4 text-rose-600 rounded border-slate-300">
              <span>\ud83d\udccc \u7f6e\u9802</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
              <input type="checkbox" id="announcementInputIsPublished" checked class="w-4 h-4 text-emerald-600 rounded border-slate-300">
              <span>\u555f\u7528\u520a\u767b (\u72c0\u614b\u958b\u95dc)</span>
            </label>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">\u958b\u59cb\u520a\u767b\u65e5\u671f <span class="text-rose-500">*</span></label>
            <input type="date" id="announcementInputStartDate" class="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-slate-900 text-sm">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">\u7d50\u675f\u520a\u767b\u65e5\u671f <span class="text-rose-500">*</span></label>
            <input type="date" id="announcementInputEndDate" class="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-slate-900 text-sm">
          </div>
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">\u516c\u544a\u8a73\u7d30\u8aaa\u660e / \u5167\u6587</label>
          <textarea id="announcementInputContent" rows="4" placeholder="\u8acb\u8f38\u5165\u8a73\u7d30\u8aaa\u660e\u4e8b\u9805\u3001\u5831\u540d\u5730\u9ede\u6216\u8fa6\u7406\u6642\u9593..." class="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-medium text-slate-900 text-sm focus:border-blue-500"></textarea>
        </div>
        <div class="flex gap-3 pt-3">
          <button onclick="AdminPortal.closeAnnouncementModal()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-sm font-bold flex-1">\u53d6\u6d88</button>
          <button onclick="AdminPortal.saveAnnouncementModal()" class="bg-[#0d9488] hover:bg-[#0f766e] text-white py-2.5 rounded-xl text-sm font-bold flex-1 shadow-xs cursor-pointer active:scale-[0.98]">\u5132\u5b58\u516c\u544a</button>
        </div>
      </div>
    </div>
  </div>
  <!-- 9. \u5b78\u751f\u7aef\u89c0\u770b\u6700\u65b0\u516c\u544a Modal -->
  <div id="studentAnnouncementsModal" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 hidden">
    <div class="corp-card max-w-xl w-full p-6 bg-white rounded-2xl border border-slate-200 shadow-2xl max-h-[85vh] flex flex-col">
      <div class="flex justify-between items-center pb-3 border-b border-slate-100 mb-4 shrink-0">
        <div class="flex items-center gap-2.5">
          <h3 class="font-bold text-slate-900 text-lg">\ud83d\udce2 \u6700\u65b0\u516c\u544a\u8207\u6ce8\u610f\u4e8b\u9805</h3>
        </div>
        <button onclick="StudentPortal.closeAnnouncementsModal()" class="text-slate-400 hover:text-slate-600 font-bold text-xl px-2">\u2715</button>
      </div>
      <div id="studentAnnouncementsModalBody" class="space-y-3 overflow-y-auto pr-1 flex-1">
        <!-- JS \u52d5\u614b\u7e6a\u88fd\u516c\u544a -->
      </div>
      <div class="pt-4 border-t border-slate-100 mt-4 flex justify-end shrink-0">
        <button onclick="StudentPortal.closeAnnouncementsModal()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-5 rounded-xl text-sm font-bold shadow-2xs">
          \u95dc\u9589
        </button>
      </div>
    </div>
  </div>
  <!-- 10. \u7ba1\u7406\u54e1\u5e33\u865f\u8207\u6b0a\u9650 Modal -->
  <div id="adminAccountEditModal" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 hidden">
    <div class="corp-card max-w-md w-full p-6 bg-white rounded-2xl border border-slate-200 shadow-xl">
      <div class="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
        <h3 id="accountModalHeader" class="font-bold text-slate-900 text-base">\u65b0\u589e\u540c\u4ec1\u767d\u540d\u55ae\u5e33\u865f</h3>
        <button onclick="AdminPortal.closeAdminAccountModal()" class="text-slate-400 hover:text-slate-600 font-bold text-lg">\u2715</button>
      </div>
      <div class="space-y-4 text-sm">
        <div>
          <label class="block font-bold text-slate-700 mb-1">\u540c\u4ec1\u59d3\u540d <span class="text-rose-500">*</span></label>
          <input type="text" id="accountInputName" placeholder="\u4f8b\u5982: \u9673\u52a9\u6559" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-medium text-slate-900 text-sm">
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">\u767b\u5165\u5e33\u865f <span class="text-rose-500">*</span></label>
          <input type="text" id="accountInputUsername" placeholder="\u4f8b\u5982: staff01" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-mono text-slate-900 text-sm">
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">\u767b\u5165\u5bc6\u78bc <span class="text-rose-500">*</span></label>
          <input type="password" id="accountInputPassword" placeholder="\u8f38\u5165\u5bc6\u78bc" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-mono text-slate-900 text-sm">
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">\u6b0a\u9650\u89d2\u8272\u5206\u914d</label>
          <select id="accountSelectRole" class="w-full px-3 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm">
            <option value="staff" selected>\u4e00\u822c\u6559\u8077\u54e1 (\u96b1\u85cf\u7cfb\u7d71\u8a2d\u5b9a\u8207\u64cd\u4f5c\u7d00\u9304)</option>
            <option value="super_admin">\u7cfb\u7d71\u7ba1\u7406\u54e1 (\u5177\u5099\u6700\u9ad8\u5b8c\u6574\u7ba1\u7406\u6b0a\u9650)</option>
          </select>
        </div>
        <div class="flex gap-3 pt-3">
          <button onclick="AdminPortal.closeAdminAccountModal()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-sm font-bold flex-1">\u53d6\u6d88</button>
          <button onclick="AdminPortal.saveAdminAccountModal()" class="bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl text-sm font-bold flex-1 shadow-xs">\u5132\u5b58\u5e33\u865f</button>
        </div>
      </div>
    </div>
  </div>
  <!-- Toast \u52d5\u614b\u901a\u77e5 -->
  <div id="toastContainer" class="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none"></div>
  `;
  function mountUI() {
    const root = document.getElementById('root');
    if (root) {
      root.innerHTML = rootHTML;
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountUI);
  } else {
    mountUI();
  }
})();