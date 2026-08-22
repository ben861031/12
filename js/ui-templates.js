/**
 * 體適能畢業門檻查詢系統 - SPA 模組化介面範本庫 (UI Templates)
 * 將 HTML 結構封裝為單頁應用程式 (SPA) 動態模組
 */
(function() {
  const rootHTML = `
  <!-- ==================== 1. 頂樓極致精簡導覽 Header (進入後台自動隱藏) ==================== -->
  <header id="mainTopHeader" class="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 lg:px-8 py-3.5 shadow-xs">
    <div class="max-w-7xl mx-auto flex items-center justify-between gap-3">
      
      <!-- 品牌 Logo 與系統名稱 (左邊區塊 flex-1 靠左) -->
      <div class="flex-1 flex items-center justify-start min-w-0">
        <div class="flex items-center gap-2.5 sm:gap-3 cursor-pointer group" onclick="App.switchTab('student')">
          <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg sm:text-xl shadow-sm shrink-0 group-hover:scale-105 transition-transform">
            <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
          </div>
          <h1 class="text-sm sm:text-lg font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors whitespace-nowrap overflow-hidden text-ellipsis">
            <span class="hidden sm:inline">體適能畢業門檻查詢系統</span><span class="sm:hidden">體適能查詢</span>
          </h1>
        </div>
      </div>

      <!-- 中央統一導覽連結 (100% 數學精準對齊置中 flex-none) -->
      <nav class="hidden md:flex items-center justify-center gap-8 text-[16px] font-bold tracking-wide flex-none">
        <button id="navStudentLink" onclick="App.switchTab('student')" class="text-red-600 hover:text-red-600 transition-colors py-1 relative group flex items-center gap-1.5 cursor-pointer border-0 bg-transparent font-bold">
          <span>畢業門檻查詢</span>
          <span id="navStudentLine" class="absolute bottom-0 left-0 w-full h-[2px] bg-red-600 transition-all duration-300 group-hover:w-full"></span>
        </button>
        <button id="navAnnouncementsLink" onclick="App.switchTab('announcements')" class="text-slate-700 hover:text-red-600 transition-colors py-1 relative group flex items-center gap-1.5 cursor-pointer border-0 bg-transparent font-bold">
          <span>最新公告</span>
          <span id="navAnnouncementsLine" class="absolute bottom-0 left-0 w-0 h-[2px] bg-red-600 transition-all duration-300 group-hover:w-full"></span>
        </button>
        <a href="https://www.just.edu.tw/" target="_blank" class="text-slate-700 hover:text-red-600 transition-colors py-1 relative group">
          學校首頁
          <span class="absolute bottom-0 left-0 w-0 h-[2px] bg-red-600 transition-all duration-300 group-hover:w-full"></span>
        </a>
        <a href="https://stu.just.edu.tw/?Lang=zh-tw" target="_blank" class="text-slate-700 hover:text-red-600 transition-colors py-1 relative group">
          學務處官網
          <span class="absolute bottom-0 left-0 w-0 h-[2px] bg-red-600 transition-all duration-300 group-hover:w-full"></span>
        </a>
      </nav>

      <!-- 右側功能區 (右邊區塊 flex-1 靠右) -->
      <div class="flex-1 flex items-center justify-end gap-2 sm:gap-3">
        <button onclick="App.switchTab('admin')" class="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200/80 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap">
          <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          <span>管理後台</span>
        </button>

        <!-- 手機選單開關按鈕 (僅手機顯示) -->
        <button id="mobileMenuToggleBtn" onclick="App.toggleMobileMenu()" class="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none border border-slate-200" aria-label="選單">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
      </div>
    </div>

    <!-- 手機版展開選單抽屜 (Mobile Menu Drawer) -->
    <div id="mobileMenuDrawer" class="hidden md:hidden border-t border-slate-100 mt-3 pt-3 space-y-1.5 text-sm font-bold">
      <button onclick="App.switchTab('student'); App.toggleMobileMenu();" class="w-full text-left font-bold text-slate-700 hover:text-red-600 py-2.5 px-3 rounded-xl hover:bg-slate-50 flex items-center gap-2.5 border-0 bg-transparent transition-colors">
        <svg class="w-4 h-4 text-slate-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <span>畢業門檻查詢</span>
      </button>

      <button onclick="App.switchTab('announcements'); App.toggleMobileMenu();" class="w-full text-left font-bold text-slate-700 hover:text-red-600 py-2.5 px-3 rounded-xl hover:bg-slate-50 flex items-center justify-between border-0 bg-transparent transition-colors">
        <span class="flex items-center gap-2.5">
          <svg class="w-4 h-4 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/></svg>
          <span>最新公告</span>
        </span>
        <span class="text-xs text-red-600 font-semibold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">專屬頁面</span>
      </button>

      <a href="https://www.just.edu.tw/" target="_blank" class="flex items-center gap-2.5 font-bold text-slate-700 hover:text-blue-600 py-2.5 px-3 rounded-xl hover:bg-slate-50 transition-colors">
        <svg class="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
        <span>學校首頁</span>
      </a>

      <a href="https://stu.just.edu.tw/?Lang=zh-tw" target="_blank" class="flex items-center gap-2.5 font-bold text-slate-700 hover:text-blue-600 py-2.5 px-3 rounded-xl hover:bg-slate-50 transition-colors">
        <svg class="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/></svg>
        <span>學務處官網</span>
      </a>

      <a href="https://jbagt.just.edu.tw/rule/rules/A003-114-11-26-yEO.pdf" target="_blank" class="flex items-center gap-2.5 font-bold text-blue-600 hover:text-blue-800 py-2.5 px-3 rounded-xl bg-blue-50/70 border border-blue-200/80 transition-colors">
        <svg class="w-4 h-4 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
        <span>學生體適能畢業條件實施細則 (PDF)</span>
      </a>
    </div>
  </header>

  <!-- ==================== 2. 學生自服務查詢 Portal (STUDENT PORTAL) ==================== -->
  <main id="studentPortalSection" class="flex-1 max-w-5xl w-full mx-auto px-4 py-8 sm:px-6 sm:py-10 lg:px-8">

    <!-- 搜尋卡片 -->
    <div class="bg-white rounded-lg border border-slate-200 shadow-sm p-6 sm:p-8">
      
      <!-- 標頭區 -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 mb-5">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>
          <div>
            <h2 class="text-lg sm:text-xl font-bold text-slate-900">
              學生體適能成績與畢業門檻查詢
            </h2>
          </div>
        </div>
        
        <a href="https://jbagt.just.edu.tw/rule/rules/A003-114-11-26-yEO.pdf" target="_blank" class="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg shrink-0">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          學生體適能畢業條件實施細則
        </a>
      </div>

      <!-- 搜尋輸入框與按鈕區 (Mobile Responsive) -->
      <div class="flex flex-col sm:flex-row items-stretch gap-2.5 max-w-xl">
        <div class="relative flex-1">
          <input type="text" id="studentIdInput" inputmode="numeric" pattern="[0-9]*" maxlength="12" autocomplete="off" oninput="AdminPortal.handleInputClearBtn('studentIdInput')" placeholder="請輸入完整學號 (例如: 121053109)..." class="w-full pl-4 pr-9 py-2.5 rounded-lg border border-slate-300 text-sm font-semibold focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none bg-slate-50 text-slate-900 font-mono transition-all placeholder:text-slate-400 placeholder:font-sans">
          <button type="button" id="studentIdInputClearBtn" onclick="AdminPortal.clearSearchInput('studentIdInput')" class="hidden absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-500 hover:text-slate-700 transition-all flex items-center justify-center cursor-pointer text-xs font-bold shrink-0 z-10" title="清除內容">✕</button>
        </div>
        <div class="flex items-center gap-2">
          <button data-student-search-button onclick="StudentPortal.doSearch()" class="flex-1 sm:w-28 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-2.5 rounded-lg text-sm sm:text-[15px] shadow-sm transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer tracking-wide min-h-[44px]">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            查詢
          </button>
          <button onclick="StudentPortal.clearSearch()" class="flex-1 sm:w-28 bg-white hover:bg-slate-50 text-slate-700 font-bold py-2.5 rounded-lg text-sm sm:text-[15px] shadow-sm border border-slate-200 transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer tracking-wide min-h-[44px]">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
            清除
          </button>
        </div>
      </div>

    </div>

    <!-- 預設提示卡片 -->
    <div id="studentQueryEmpty" class="bg-slate-50 rounded-lg border border-slate-200 border-dashed p-8 sm:p-12 text-center mt-6">
      <h3 class="text-lg font-bold text-slate-900 mb-2">請輸入學號開始查詢</h3>
      <p class="text-sm text-slate-600 font-medium max-w-md mx-auto">
        📌 本系統目前僅開放當學期「三、四年級學生」查詢體適能與畢業門檻資料；如有相關疑問，請洽學務處體育及活動組(分機：2213)。
      </p>
    </div>

    <!-- 查詢結果容器 -->
    <div id="studentQueryResult" class="hidden space-y-6 mt-6"></div>

  </main>

  <!-- ==================== 2.5. 專屬最新公告頁面 (ANNOUNCEMENTS PORTAL) ==================== -->
  <main id="announcementsPortalSection" class="hidden flex-1 max-w-5xl w-full mx-auto px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
    <div class="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sm:p-8 space-y-6">
      
      <!-- 標題區塊與搜尋關鍵字過濾列 -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div class="flex items-center gap-3">
          <div class="w-1.5 h-5 bg-blue-600 rounded-full shrink-0"></div>
          <h2 class="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
            最新公告與注意事項
          </h2>
        </div>

        <!-- 關鍵字搜尋框 -->
        <div class="relative w-full md:w-72">
          <input type="text" id="announcementSearchInput" oninput="StudentPortal.handleAnnouncementSearch()" placeholder="搜尋公告標題或內文..." class="w-full pl-3.5 pr-8 py-2 rounded-xl border border-slate-200/90 text-xs font-medium focus:border-blue-600 focus:outline-none bg-slate-50/70 text-slate-800 transition-all placeholder:text-slate-400">
          <button type="button" id="announcementSearchClearBtn" onclick="StudentPortal.clearAnnouncementSearch()" class="hidden absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-500 transition-all flex items-center justify-center cursor-pointer text-[10px] font-bold z-10">✕</button>
        </div>
      </div>

      <!-- 分類標籤快速切換器 (Category Filter Pills) -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
        <button onclick="StudentPortal.filterAnnouncementCategory('ALL')" data-ann-cat="ALL" class="ann-cat-pill active px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-blue-600 text-white shadow-2xs transition-all cursor-pointer">全部公告</button>
        <button onclick="StudentPortal.filterAnnouncementCategory('重要通知')" data-ann-cat="重要通知" class="ann-cat-pill px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all cursor-pointer">重要通知</button>
        <button onclick="StudentPortal.filterAnnouncementCategory('補測公告')" data-ann-cat="補測公告" class="ann-cat-pill px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all cursor-pointer">補測公告</button>
        <button onclick="StudentPortal.filterAnnouncementCategory('申辦提醒')" data-ann-cat="申辦提醒" class="ann-cat-pill px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all cursor-pointer">申辦提醒</button>
        <button onclick="StudentPortal.filterAnnouncementCategory('課程資訊')" data-ann-cat="課程資訊" class="ann-cat-pill px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all cursor-pointer">課程資訊</button>
      </div>

      <!-- 公告大專院校對齊表格 (Table List Container) -->
      <div id="announcementsPageTableContainer"></div>

    </div>
  </main>

  <!-- ==================== 3. 管理後台 (ADMIN PORTAL) ==================== -->
  <div id="adminPortalSection" class="hidden flex-1 flex flex-col md:flex-row min-h-[calc(100vh-61px)]">
    
    <!-- 簡潔側邊欄 -->
    <aside class="corp-sidebar p-4 shrink-0">
      
      <!-- 選單區塊 -->
      <div class="space-y-6">
        <div class="px-3">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">ADMIN PORTAL</div>
          <div class="text-base font-extrabold text-slate-900 mt-1">系統管理後台</div>
        </div>

        <nav class="space-y-1">
          <!-- 獨立【學生名冊】按鈕 -->
          <div data-admin-view="roster" class="corp-nav-item active">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            <span>學生名冊</span>
          </div>
          <!-- 獨立【門檻查詢】按鈕 -->
          <div data-admin-view="threshold" class="corp-nav-item">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span>門檻查詢</span>
          </div>
          <div data-admin-view="dashboard" class="corp-nav-item">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <span>個人成績查詢</span>
          </div>
          <div data-admin-view="records" class="corp-nav-item">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
            <span>檢測資料管理</span>
          </div>
          <div data-admin-view="analytics" class="corp-nav-item">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
            <span>班級統計</span>
          </div>
          <div data-admin-view="risk" class="corp-nav-item">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            <span>未合格名單</span>
          </div>
          <div data-admin-view="logs" class="corp-nav-item">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 01-2-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            <span>操作紀錄</span>
          </div>
          <div data-admin-view="settings" class="corp-nav-item">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            <span>系統設定</span>
          </div>
          <div data-admin-view="announcements" class="corp-nav-item">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/></svg>
            <span>最新公告管理</span>
          </div>
        </nav>
      </div>

      <!-- 左側底部登入者卡片（所有已登入同仁皆可修改自己的密碼） -->
      <div class="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs space-y-3 mt-6">
        <div class="flex items-center justify-between gap-1.5">
          <span id="sidebarAdminName" class="truncate font-black text-slate-900 text-xs sm:text-sm tracking-tight">未登入</span>
          <span id="sidebarAdminRoleBadge" class="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">系統管理員</span>
        </div>

        <button onclick="AdminPortal.openSelfPasswordModal()" class="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/90 font-bold py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-2xs active:scale-[0.98] cursor-pointer">
          <svg class="w-3.5 h-3.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          <span>修改我的密碼</span>
        </button>

        <div class="grid grid-cols-2 gap-2">
          <button onclick="App.switchTab('student')" class="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 font-bold py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1 shadow-2xs active:scale-[0.98] cursor-pointer">
            <svg class="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            <span>學生查詢</span>
          </button>
          <button onclick="AdminPortal.logout()" class="w-full bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200/90 font-bold py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1 shadow-2xs active:scale-[0.98] cursor-pointer">
            <svg class="w-3.5 h-3.5 text-slate-500 hover:text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            <span>登出系統</span>
          </button>
        </div>
      </div>
    </aside>

    <!-- 右側主工作區 -->
    <main class="flex-1 px-4 sm:px-6 pt-2 sm:pt-3 pb-6 space-y-4 sm:space-y-5 overflow-y-auto">
      
      <!-- 手機版專用後台頂樓資訊與捷徑列 (僅手機顯示) -->
      <div class="md:hidden space-y-3 mb-2">
        <div class="mobile-admin-toolbar bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-2 shadow-2xs">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
            </div>
            <div class="leading-tight">
              <div id="mobileAdminName" class="font-extrabold text-slate-900 text-xs">系統管理員</div>
              <div id="mobileAdminRoleBadge" class="text-[10px] text-blue-600 font-bold">登入中</div>
            </div>
          </div>

          <div class="mobile-admin-toolbar-actions flex items-center gap-1.5">
            <button onclick="AdminPortal.openSelfPasswordModal()" title="修改我的密碼" class="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              <span>改密碼</span>
            </button>
            <button onclick="App.switchTab('student')" class="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
              <span>學生查詢</span>
            </button>
            <button onclick="AdminPortal.logout()" class="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
              <span>登出</span>
            </button>
          </div>
        </div>

        <div class="bg-white border border-slate-200 rounded-xl p-2 flex items-center gap-1.5 overflow-x-auto hide-scrollbar shadow-2xs">
          <button data-admin-view="roster" onclick="AdminPortal.switchView('roster')" class="px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap bg-blue-50 text-blue-600 border border-blue-200">學生名冊</button>
          <button data-admin-view="threshold" onclick="AdminPortal.switchView('threshold')" class="px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap bg-slate-50 text-slate-700">門檻查詢</button>
          <button data-admin-view="dashboard" onclick="AdminPortal.switchView('dashboard')" class="px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap bg-slate-50 text-slate-700">個人成績查詢</button>
          <button data-admin-view="records" onclick="AdminPortal.switchView('records')" class="px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap bg-slate-50 text-slate-700">檢測資料管理</button>
          <button data-admin-view="analytics" onclick="AdminPortal.switchView('analytics')" class="px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap bg-slate-50 text-slate-700">班級統計</button>
          <button data-admin-view="risk" onclick="AdminPortal.switchView('risk')" class="px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap bg-slate-50 text-slate-700">未合格名單</button>
          <button data-admin-view="logs" onclick="AdminPortal.switchView('logs')" class="px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap bg-slate-50 text-slate-700">操作紀錄</button>
          <button data-admin-view="settings" onclick="AdminPortal.switchView('settings')" class="px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap bg-slate-50 text-slate-700">系統設定</button>
        </div>
      </div>

      <!-- 頁面標頭與右側頂級動作按鈕列 (頂部邊距完全縮緊) -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 !mt-0">
        <div class="min-w-0 w-full sm:w-auto">
          <h2 id="adminPageTitle" class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">學生名冊</h2>
          <p id="adminPageSubtitle" class="text-xs sm:text-sm font-bold text-slate-400 mt-0.5">共 0 筆學生資料</p>
        </div>

        <div id="adminHeaderActionGroup" class="flex items-center gap-2.5 flex-wrap w-full sm:w-auto sm:shrink-0">
          <button onclick="App.openRosterModal()" class="px-4 py-2 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] text-white text-sm font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
            <span>匯入學籍</span>
          </button>
          <button onclick="AdminPortal.exportRosterExcel()" class="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-sm font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]">
            <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            <span>匯出學籍</span>
          </button>
        </div>
      </div>
      
      <!-- 統計數據看板 (僅在【學生名冊】、【門檻查詢】、【未合格名單】顯示) -->
      <div id="adminHeaderStatContainer" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- 卡片 1: 總學生數 -->
        <div class="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/80">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
          </div>
          <div>
            <div class="text-xs font-bold text-slate-500">總學生數</div>
            <div class="flex items-baseline gap-1 mt-0.5">
              <span id="hdrStatTotal" class="text-2xl sm:text-3xl font-black text-slate-900 font-mono">0</span>
              <span class="text-xs font-semibold text-slate-500">人</span>
            </div>
          </div>
        </div>

        <!-- 卡片 2: 合格人數 (淡綠底色微光) -->
        <div class="bg-[#f0fdf4] rounded-2xl border border-[#bbf7d0]/80 p-4 sm:p-5 shadow-2xs flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-[#dcfce7] text-[#16a34a] flex items-center justify-center shrink-0 border border-[#bbf7d0]">
            <svg class="w-6 h-6 text-[#16a34a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <div>
            <div class="text-xs font-bold text-[#15803d]">合格人數</div>
            <div class="flex items-baseline gap-1 mt-0.5">
              <span id="hdrStatPassed" class="text-2xl sm:text-3xl font-black text-[#15803d] font-mono">0</span>
              <span class="text-xs font-semibold text-[#15803d]">人</span>
            </div>
          </div>
        </div>

        <!-- 卡片 3: 未合格人數 (淡紅底色微光) -->
        <div class="bg-[#fef2f2] rounded-2xl border border-[#fecaca]/80 p-4 sm:p-5 shadow-2xs flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-[#fee2e2] text-[#dc2626] flex items-center justify-center shrink-0 border border-[#fecaca]">
            <svg class="w-6 h-6 text-[#dc2626]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <div>
            <div class="text-xs font-bold text-[#b91c1c]">未合格人數</div>
            <div class="flex items-baseline gap-1 mt-0.5">
              <span id="hdrStatFailed" class="text-2xl sm:text-3xl font-black text-[#dc2626] font-mono">0</span>
              <span class="text-xs font-semibold text-[#b91c1c]">人</span>
            </div>
          </div>
        </div>

        <!-- 卡片 4: 合格率 -->
        <div class="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/80">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/></svg>
          </div>
          <div>
            <div class="text-xs font-bold text-slate-500">合格率</div>
            <div class="mt-0.5">
              <span id="hdrStatRate" class="text-2xl sm:text-3xl font-black text-blue-600 font-mono">0%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ==================== 模組 1: 學生名冊 ==================== -->
      <div id="erpView_roster" class="space-y-4">
        
        <!-- 學生名冊篩選工具列 (100% 精準對齊設計稿圖二) -->
        <div class="bg-[#f8fafc] border border-slate-200/90 rounded-2xl p-3 shadow-2xs space-y-3">
          <div class="flex flex-wrap items-center gap-3">
            <!-- 搜尋框 -->
            <div class="relative flex-1 min-w-[220px]">
              <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input type="text" id="rosterSearchInput" oninput="AdminPortal.handleInputClearBtn('rosterSearchInput')" placeholder="搜尋學生姓名 / 學號..." class="w-full pl-10 pr-9 py-2.5 bg-white rounded-xl border border-slate-200 text-sm font-medium focus:border-blue-600 focus:outline-none placeholder:text-slate-400 shadow-2xs">
              <button type="button" id="rosterSearchInputClearBtn" onclick="AdminPortal.clearSearchInput('rosterSearchInput')" class="hidden absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-500 hover:text-slate-700 transition-all flex items-center justify-center cursor-pointer text-xs font-bold shrink-0 z-10" title="清除搜尋內容">✕</button>
            </div>

            <!-- 年級 (實質綁定 JS 年級連動篩選) -->
            <select id="rosterEnrollYearFilter" class="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-700 focus:border-blue-600 focus:outline-none shadow-2xs min-w-[95px]">
              <option value="">年級</option>
            </select>

            <!-- 班級 -->
            <select id="rosterClassFilter" class="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-700 focus:border-blue-600 focus:outline-none shadow-2xs min-w-[100px]">
              <option value="">班級</option>
            </select>

            <!-- 狀態 -->
            <select id="rosterStatusFilter" class="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-700 focus:border-blue-600 focus:outline-none shadow-2xs min-w-[95px]">
              <option value="">狀態</option>
              <option value="在學" selected>在學</option>
              <option value="休學">休學</option>
              <option value="退學">退學</option>
              <option value="畢業">畢業</option>
            </select>

            <!-- 更多篩選 按鈕 -->
            <button onclick="AdminPortal.toggleMoreFilters('roster')" class="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2.5 rounded-xl text-sm font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0">
              <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
              <span>更多篩選</span>
            </button>
          </div>

          <!-- 點擊【更多篩選】展開之進階篩選列 -->
          <div id="rosterMoreFiltersRow" class="hidden pt-2.5 border-t border-slate-200/60 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <select id="rosterTrueYearFilter" class="bg-white border border-slate-200/90 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:border-emerald-600 focus:outline-none shadow-2xs">
              <option value="">入學年 (全選)</option>
            </select>
            <select id="rosterAdmissionFilter" class="bg-white border border-slate-200/90 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:border-emerald-600 focus:outline-none shadow-2xs">
              <option value="">入學管道 (全選)</option>
              <option value="申請入學">申請入學</option>
              <option value="繁星推薦">繁星推薦</option>
              <option value="分發入學">分發入學</option>
              <option value="運動績優">運動績優 (體保)</option>
            </select>
            <select id="rosterIdentityFilter" class="bg-white border border-slate-200/90 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:border-emerald-600 focus:outline-none shadow-2xs">
              <option value="">身分狀態 (全選)</option>
              <option value="一般生">一般生</option>
              <option value="身心障礙">身心障礙生</option>
              <option value="原住民">原住民</option>
            </select>
          </div>
        </div>

        <!-- 表格：班級、學號、姓名、入學年、學籍狀態、操作 (百分比平滑欄寬) -->
        <div class="corp-card overflow-hidden">
          <div class="corp-table-container max-h-[calc(100vh-320px)] sm:max-h-[calc(100vh-340px)]">
            <table class="corp-table">
              <thead>
                <tr>
                  <th class="w-[5%] text-center">
                    <input type="checkbox" onchange="AdminPortal.toggleSelectAll(this.checked)" class="w-4 h-4 rounded border-slate-300 cursor-pointer">
                  </th>
                  <th class="w-[12%] text-left">班級</th>
                  <th class="w-[15%] text-left">學號</th>
                  <th class="w-[12%] text-left">姓名</th>
                  <th class="w-[13%] text-left">入學年</th>
                  <th class="w-[12%] text-left">入學方式</th>
                  <th class="w-[12%] text-left">身分</th>
                  <th class="w-[10%] text-center">學籍狀態</th>
                  <th class="w-[9%] text-center">操作</th>
                </tr>
              </thead>
              <tbody id="erpRosterTbody"></tbody>
            </table>
          </div>
          <div id="rosterPagination" class="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-t border-slate-200 text-xs text-slate-500"></div>
        </div>

      </div>

      <!-- ==================== 模組 2: 門檻查詢 ==================== -->
      <div id="erpView_threshold" class="hidden space-y-4">
        
        <!-- 門檻查詢篩選工具列 (100% 精準對齊設計稿圖二) -->
        <div class="bg-[#f8fafc] border border-slate-200/90 rounded-2xl p-3 shadow-2xs space-y-3">
          <div class="flex flex-wrap items-center gap-3">
            <!-- 搜尋框 -->
            <div class="relative flex-1 min-w-[220px]">
              <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input type="text" id="thresholdSearchInput" oninput="AdminPortal.handleInputClearBtn('thresholdSearchInput')" placeholder="搜尋學生姓名 / 學號..." class="w-full pl-10 pr-9 py-2.5 bg-white rounded-xl border border-slate-200 text-sm font-medium focus:border-blue-600 focus:outline-none placeholder:text-slate-400 shadow-2xs">
              <button type="button" id="thresholdSearchInputClearBtn" onclick="AdminPortal.clearSearchInput('thresholdSearchInput')" class="hidden absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-500 hover:text-slate-700 transition-all flex items-center justify-center cursor-pointer text-xs font-bold shrink-0 z-10" title="清除搜尋內容">✕</button>
            </div>

            <!-- 年級 -->
            <select id="thresholdEnrollYearFilter" class="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-700 focus:border-blue-600 focus:outline-none shadow-2xs min-w-[95px]">
              <option value="">年級</option>
            </select>

            <!-- 班級 -->
            <select id="thresholdClassFilter" class="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-700 focus:border-blue-600 focus:outline-none shadow-2xs min-w-[100px]">
              <option value="">班級</option>
            </select>

            <!-- 狀態 -->
            <select id="thresholdRosterStatusFilter" class="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-700 focus:border-blue-600 focus:outline-none shadow-2xs min-w-[95px]">
              <option value="在學" selected>在學</option>
              <option value="非在籍">非在籍</option>
              <option value="">學籍</option>
            </select>

            <!-- 門檻結果 -->
            <select id="thresholdStatusFilter" class="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-700 focus:border-blue-600 focus:outline-none shadow-2xs min-w-[95px]">
              <option value="">門檻</option>
              <option value="通過">通過</option>
              <option value="不通過">未過</option>
              <option value="免測">免測</option>
            </select>

            <!-- 更多篩選 按鈕 -->
            <button onclick="AdminPortal.toggleMoreFilters('threshold')" class="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2.5 rounded-xl text-sm font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0">
              <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
              <span>更多篩選</span>
            </button>
          </div>

          <!-- 點擊【更多篩選】展開之進階篩選列 -->
          <div id="thresholdMoreFiltersRow" class="hidden pt-2.5 border-t border-slate-200/60 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <select id="thresholdTrueYearFilter" class="bg-white border border-slate-200/90 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:border-emerald-600 focus:outline-none shadow-2xs">
              <option value="">入學年 (全選)</option>
            </select>
            <select id="thresholdAdmissionFilter" class="bg-white border border-slate-200/90 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:border-emerald-600 focus:outline-none shadow-2xs">
              <option value="">入學管道 (全選)</option>
              <option value="申請入學">申請入學</option>
              <option value="繁星推薦">繁星推薦</option>
              <option value="分發入學">分發入學</option>
              <option value="運動績優">運動績優 (體保)</option>
            </select>
            <select id="thresholdIdentityFilter" class="bg-white border border-slate-200/90 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:border-emerald-600 focus:outline-none shadow-2xs">
              <option value="">身分狀態 (全選)</option>
              <option value="一般生">一般生</option>
              <option value="身心障礙">身心障礙生</option>
              <option value="原住民">原住民</option>
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
                  <th class="w-[12%] text-left">班級</th>
                  <th class="w-[11%] text-left">學號</th>
                  <th class="w-[9%] text-left">姓名</th>
                  <th class="w-[10%] text-center">門檻狀態</th>
                  <th class="w-[9%] text-center">通過次數</th>
                  <th class="w-[9%] text-center">需補次數</th>
                  <th class="w-[15%] text-center">通過學期軌跡</th>
                  <th class="w-[13%] text-center">特殊備註</th>
                  <th class="w-[9%] text-center">操作</th>
                </tr>
              </thead>
              <tbody id="erpThresholdTbody"></tbody>
            </table>
          </div>
        </div>

      </div>

      <!-- ==================== 模組 3: 個人成績查詢 ==================== -->
      <div id="erpView_dashboard" class="hidden space-y-6">
        
        <!-- 搜尋列 -->
        <div class="corp-card p-6 border-t-4 border-t-blue-500">
          <div class="flex flex-col md:flex-row gap-4 items-end">
            <div class="flex-1 w-full">
              <label class="block text-sm font-bold text-slate-700 mb-2">輸入學號或姓名搜尋</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                </div>
                <input type="text" id="individualSearchInput" oninput="AdminPortal.handleInputClearBtn('individualSearchInput')" onkeyup="if(event.key === 'Enter') AdminPortal.searchIndividualRecord()" placeholder="例如: 110001001 或 王小明..." class="w-full pl-11 pr-10 py-3 rounded-xl border border-slate-300 text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all">
                <button type="button" id="individualSearchInputClearBtn" onclick="AdminPortal.clearSearchInput('individualSearchInput')" class="hidden absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-500 hover:text-slate-700 transition-all flex items-center justify-center cursor-pointer text-xs font-bold shrink-0 z-10" title="清除搜尋內容">✕</button>
              </div>
            </div>
            <button onclick="AdminPortal.searchIndividualRecord()" class="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl text-base shadow-md transition-all whitespace-nowrap w-full md:w-auto h-[50px]">
              查詢紀錄
            </button>
          </div>
        </div>

        <!-- 查詢結果區 (預設隱藏) -->
        <div id="individualSearchResultArea" class="hidden space-y-6">
          
          <!-- 個人資訊卡片 -->
          <div class="corp-card p-0 bg-white border border-slate-200 overflow-hidden shadow-sm">
            <!-- 頂部裝飾條 -->
            <div class="h-2 bg-gradient-to-r from-blue-500 to-indigo-600 w-full"></div>
            
            <div class="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              
              <!-- 左側：基本資料 -->
              <div class="w-full md:w-1/3 flex flex-col justify-center pl-2">
                <div class="flex items-center gap-3 mb-3">
                  <h2 id="indivProfileName" class="text-2xl font-black text-slate-900 tracking-tight leading-none">姓名</h2>
                  <span id="indivProfileEnrollStatus" class="px-3 py-1 rounded-full text-sm font-bold bg-blue-50 text-blue-600 border border-blue-200">在學</span>
                </div>
                <div class="space-y-2 text-base">
                  <div class="flex items-center text-slate-700">
                    <span class="w-14 text-slate-500 font-bold">學號：</span>
                    <span id="indivProfileId" class="font-mono font-bold text-slate-800">學號</span>
                  </div>
                  <div class="flex items-center text-slate-700">
                    <span class="w-14 text-slate-500 font-bold">班級：</span>
                    <span id="indivProfileClass" class="font-bold text-slate-800">班級</span>
                  </div>
                </div>
              </div>

              <!-- 中間：體適能概況數據 -->
              <div class="w-full md:w-1/3 flex justify-center gap-10 border-y md:border-y-0 md:border-x border-slate-100 py-4 md:py-0">
                <div class="text-center">
                  <div class="text-sm font-semibold text-slate-500 mb-1.5">累計及格次數</div>
                  <div id="indivProfilePassCount" class="text-4xl font-black text-blue-600 font-mono">0</div>
                </div>
                <div class="w-px bg-slate-200"></div>
                <div class="text-center">
                  <div class="text-sm font-semibold text-slate-500 mb-1.5">剩餘需補次數</div>
                  <div id="indivProfileDeficit" class="text-4xl font-black text-rose-500 font-mono">2</div>
                </div>
              </div>

              <!-- 右側：畢業門檻與特殊標記 -->
              <div class="w-full md:w-1/3 flex flex-col items-center md:items-end justify-center pr-2">
                <div class="text-xs font-bold text-slate-400 mb-2 tracking-widest">體適能畢業門檻</div>
                <div id="indivProfileStatus" class="text-emerald-700 bg-emerald-50 border border-emerald-200 text-lg px-8 py-2.5 font-black rounded-full shadow-sm mb-2 tracking-wide">✅ 通過 (合格)</div>
                <div id="indivProfileSpecial" class="text-sm font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded hidden border border-amber-200 shadow-sm">
                  <!-- 特殊身分標記 -->
                </div>
              </div>

            </div>
          </div>

          <!-- 歷年檢測成績明細表 -->
          <div class="corp-card overflow-hidden border border-slate-200">
            <div class="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <h3 class="text-base font-bold text-slate-800">歷年體適能檢測原始數值明細</h3>
            </div>
            <div class="corp-table-container max-h-[60vh] overflow-y-auto">
              <table class="corp-table">
                <thead>
                  <tr>
                    <th class="w-[10%] text-center">學期</th>
                    <th class="w-[10%] text-center">身高<br><span class="text-[10px] font-normal text-slate-500">公分</span></th>
                    <th class="w-[10%] text-center">體重<br><span class="text-[10px] font-normal text-slate-500">公斤</span></th>
                    <th class="w-[15%] text-center">坐姿體前彎<br><span class="text-[10px] font-normal text-slate-500">柔軟度</span></th>
                    <th class="w-[15%] text-center">立定跳遠<br><span class="text-[10px] font-normal text-slate-500">瞬發力</span></th>
                    <th class="w-[15%] text-center">仰臥起坐<br><span class="text-[10px] font-normal text-slate-500">肌耐力</span></th>
                    <th class="w-[15%] text-center">心肺耐力<br><span class="text-[10px] font-normal text-slate-500">登階</span></th>
                    <th class="w-[10%] text-center">單學期結果</th>
                  </tr>
                </thead>
                <tbody id="individualRecordsTbody">
                  <!-- JS 動態插入 -->
                </tbody>
              </table>
            </div>
          </div>

        </div>
        
        <!-- 空狀態提示 -->
        <div id="individualSearchEmpty" class="hidden corp-card p-12 text-center border border-dashed border-slate-300">
          <div class="text-5xl mb-4">🔍</div>
          <h3 class="text-lg font-bold text-slate-800 mb-2">查無符合的學生資料</h3>
          <p class="text-sm text-slate-500">請確認學號或姓名是否輸入正確，或該學生尚未匯入系統。</p>
        </div>

      </div>



      <!-- ==================== 模組 4: 檢測資料管理 ==================== -->
      <div id="erpView_records" class="hidden corp-card p-6">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
          <h3 class="text-base font-bold text-slate-900">檢測資料管理</h3>
          
          <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">


            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>
              <input type="text" id="recordsSearchInput" oninput="AdminPortal.handleInputClearBtn('recordsSearchInput')" onkeyup="AdminPortal.renderRecordsManagement()" placeholder="搜尋學號..." class="pl-9 pr-8 py-2 rounded-lg border border-slate-300 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full sm:w-48">
              <button type="button" id="recordsSearchInputClearBtn" onclick="AdminPortal.clearSearchInput('recordsSearchInput')" class="hidden absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-500 hover:text-slate-700 transition-all flex items-center justify-center cursor-pointer text-[10px] font-bold shrink-0 z-10" title="清除內容">✕</button>
            </div>
            
            <select id="recordsSemesterFilter" onchange="AdminPortal.renderRecordsManagement()" class="pl-3 pr-8 py-2 rounded-lg border border-slate-300 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white">
              <option value="">-- 請先選擇學期 --</option>
              <option value="all">顯示所有學期 (不建議)</option>
            </select>
          </div>
        </div>

        <div class="corp-table-container max-h-[calc(100vh-210px)] sm:max-h-[calc(100vh-230px)] overflow-y-auto">
          <table class="corp-table text-sm">
            <thead>
              <tr>
                <th>學期</th>
                <th>學號</th>
                <th>姓名</th>
                <th>坐姿體前彎</th>
                <th>立定跳遠</th>
                <th>仰臥起坐</th>
                <th>心肺耐力</th>
                <th>檢測結果</th>
                <th class="text-center w-36">操作</th>
              </tr>
            </thead>
            <tbody id="erpRecordsTbody">
              <!-- JS 動態插入 -->
            </tbody>
          </table>
        </div>
      </div>

      <!-- ==================== 模組 5: 班級統計 ==================== -->
      <div id="erpView_analytics" class="hidden corp-card p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-bold text-slate-900">各班級體適能畢業門檻通過率統計分析</h3>
        </div>
        <div class="corp-table-container max-h-[calc(100vh-210px)] sm:max-h-[calc(100vh-230px)] overflow-y-auto">
          <table class="corp-table">
            <thead>
              <tr>
                <th>班級</th>
                <th>總人數</th>
                <th>合格人數</th>
                <th>未合格人數</th>
                <th>合格率</th>
              </tr>
            </thead>
            <tbody id="erpAnalyticsTbody"></tbody>
          </table>
        </div>
      </div>

      <!-- ==================== 模組 6: 未合格名單 ==================== -->
      <div id="erpView_risk" class="hidden corp-card p-6">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
          <div>
            <h3 class="text-lg font-bold text-rose-900">未合格學生名單</h3>
            <p class="text-sm text-slate-600 mt-0.5">點擊頂部「複製 Email」可批量寄信通知未合格學生。</p>
          </div>
        </div>

        <div class="flex flex-col md:flex-row gap-3 mb-4">
          <div class="flex-1 relative">
            <input type="text" id="riskSearchInput" placeholder="搜尋學號、姓名或班級..." oninput="AdminPortal.handleInputClearBtn('riskSearchInput')" onkeyup="AdminPortal.renderRiskTracking()" class="w-full pl-4 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400">
            <button type="button" id="riskSearchInputClearBtn" onclick="AdminPortal.clearSearchInput('riskSearchInput')" class="hidden absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-500 hover:text-slate-700 transition-all flex items-center justify-center cursor-pointer text-xs font-bold shrink-0 z-10" title="清除內容">✕</button>
          </div>
          <div class="w-full md:w-32">
            <select id="riskEnrollYearFilter" onchange="AdminPortal.renderRiskTracking()" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 cursor-pointer">
              <option value="">所有年級</option>
            </select>
          </div>
          <div class="w-full md:w-40">
            <select id="riskClassFilter" onchange="AdminPortal.renderRiskTracking()" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 cursor-pointer">
              <option value="">所有班級</option>
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
                <th class="w-[15%]">班級</th>
                <th class="w-[15%]">學號</th>
                <th class="w-[15%]">姓名</th>
                <th class="w-[15%]">尚差次數</th>
                <th class="w-[25%]">Email</th>
                <th class="w-[10%] text-center">操作</th>
              </tr>
            </thead>
            <tbody id="erpRiskTbody"></tbody>
          </table>
        </div>
      </div>

      <!-- ==================== 模組 7: 操作紀錄 ==================== -->
      <div id="erpView_logs" class="hidden corp-card p-6">
        <h3 class="text-base font-bold text-slate-900 mb-4">系統操作紀錄 (Audit Trail)</h3>
        <div class="corp-table-container max-h-[calc(100vh-210px)] sm:max-h-[calc(100vh-230px)] overflow-y-auto">
          <table class="corp-table">
            <thead>
              <tr>
                <th class="w-[20%]">時間</th>
                <th class="w-[15%]">操作人</th>
                <th class="w-[20%]">動作</th>
                <th class="w-[45%]">詳細內容</th>
              </tr>
            </thead>
            <tbody id="erpAuditLogsTbody"></tbody>
          </table>
        </div>
      </div>

      <!-- ==================== 模組 8: 系統設定 ==================== -->
      <div id="erpView_settings" class="hidden space-y-6">
        
        <!-- 區塊 1: 雲端同步與備份中心 (Firebase Dual-Sync Center) -->
        <div class="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs">
          <div class="flex items-center gap-3 pb-4 border-b border-slate-100 mb-4">
            <div class="w-10 h-10 rounded-xl bg-teal-50 text-[#0d9488] flex items-center justify-center shrink-0 border border-teal-100">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
            </div>
            <div>
              <h4 class="font-extrabold text-slate-900 text-base">Firebase 雲端雙向資料同步與備份中心</h4>
              <p class="text-xs font-medium text-slate-500 mt-0.5">跨瀏覽器自動雲端同步，亦可手動推播或拉取 Firebase 雲端最新資料</p>
            </div>
          </div>
          <div class="flex flex-wrap gap-3">
            <button onclick="AdminPortal.syncAllToFirebase()" class="bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold py-2.5 px-5 rounded-xl text-sm shadow-2xs transition-all flex items-center gap-2 cursor-pointer active:scale-[0.98]">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
              <span>一鍵推播本機資料至 Firebase</span>
            </button>
            <button onclick="AdminPortal.syncFromFirebase()" class="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold py-2.5 px-5 rounded-xl text-sm shadow-2xs transition-all flex items-center gap-2 cursor-pointer active:scale-[0.98]">
              <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
              <span>一鍵從 Firebase 拉取全校資料</span>
            </button>
          </div>
        </div>

        <!-- 區塊 2: 帳號安全與管理員白名單 -->
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          <!-- 左卡: 修改個人登入密碼 -->
          <div class="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col justify-between xl:col-span-1">
            <div>
              <div class="flex items-center gap-3 pb-3 border-b border-slate-100 mb-4">
                <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                </div>
                <div>
                  <h4 class="font-extrabold text-slate-900 text-base">修改 Firebase 登入密碼</h4>
                  <p class="text-xs font-medium text-slate-500 mt-0.5">帳號由 Firebase Authentication 管理，不再存放於系統資料</p>
                </div>
              </div>
              <div class="space-y-3 mb-5">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">目前原密碼 <span class="text-rose-500">*</span></label>
                  <input type="password" id="changePassCurrentPasscode" placeholder="輸入目前原密碼" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:border-blue-600 focus:outline-none transition-all">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">新管理密碼 <span class="text-rose-500">*</span></label>
                  <input type="password" id="changePassNewPasscode" autocomplete="new-password" placeholder="至少 8 碼" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:border-blue-600 focus:outline-none transition-all">
                </div>
              </div>
            </div>
            <button onclick="AdminPortal.changeAdminCredentials()" class="w-full bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold py-2.5 px-4 rounded-xl text-sm shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
              <span>儲存變更帳號密碼</span>
            </button>
          </div>

          <!-- 右卡: Firebase Auth 管理員白名單 -->
          <div class="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col justify-between xl:col-span-2">
            <div>
              <div class="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                  </div>
                  <div>
                    <h4 class="font-extrabold text-slate-900 text-base">管理員白名單與密碼管理</h4>
                    <p class="text-xs font-medium text-slate-500 mt-0.5">姓名與角色分開顯示；只有系統管理員可新增、編輯、重設密碼或停用帳號</p>
                  </div>
                </div>
                <button onclick="AdminPortal.openAdminAccountModal()" class="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-2xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-[0.98]">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
                  <span>新增白名單</span>
                </button>
              </div>
              <div class="corp-table-container max-h-72 overflow-auto bg-slate-50 rounded-xl border border-slate-200/80 mb-2">
                <table class="corp-table min-w-[780px]">
                  <thead>
                    <tr>
                      <th class="text-left">姓名</th>
                      <th class="text-left">登入帳號</th>
                      <th class="text-center">角色</th>
                      <th class="text-center">狀態</th>
                      <th class="text-left">最後登入</th>
                      <th class="text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody id="erpAdminAccountsTbody"></tbody>
                </table>
              </div>
              <p class="text-[11px] leading-relaxed text-slate-500 mt-2">密碼不會顯示或儲存在本系統。停用與密碼重設會立即撤銷 Firebase 更新權杖，最晚於既有登入憑證到期後完全失效。</p>
            </div>
          </div>

        </div>

        <!-- 區塊 3: 系統資料稽核與特定學期管理 (2-Column Grid) -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <!-- 全校門檻資料自動校正 -->
          <div class="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <div class="flex items-center gap-3 pb-3 border-b border-slate-100 mb-4">
                <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                </div>
                <div>
                  <h4 class="font-extrabold text-slate-900 text-base">全校門檻資料自動校正</h4>
                  <p class="text-xs font-medium text-slate-500 mt-0.5">自動重新掃描所有檢測數據並重新結算通過狀態</p>
                </div>
              </div>
              <p class="text-xs text-slate-600 leading-relaxed mb-5">如匯入檔案包含邏輯錯誤或修改門檻基準，可執行自動校正，讓系統重新計算每位學生的通過學期軌跡與門檻結果。</p>
            </div>
            <button onclick="AdminPortal.auditAndFixAllData()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
              <span>立即重新稽核與校正門檻</span>
            </button>
          </div>

          <!-- 單獨刪除特定學期紀錄 -->
          <div class="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <div class="flex items-center gap-3 pb-3 border-b border-slate-100 mb-4">
                <div class="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </div>
                <div>
                  <h4 class="font-extrabold text-slate-900 text-base">單獨刪除特定學期紀錄</h4>
                  <p class="text-xs font-medium text-slate-500 mt-0.5">一次性刪除特定學期之全校成績數據</p>
                </div>
              </div>
              <p class="text-xs text-slate-600 leading-relaxed mb-4">如某學期匯入錯誤，可選擇該學期批次刪除，刪除後系統會自動為所有學生重新計算通過次數。</p>
            </div>
            <div class="flex items-center gap-2.5">
              <select id="bulkDeleteSemesterSelect" onclick="AdminPortal.populateBulkDeleteSemesterSelect()" class="flex-1 px-3.5 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-800 bg-slate-50 text-xs focus:bg-white focus:outline-none shadow-2xs">
                <option value="">-- 點擊選擇學期 --</option>
              </select>
              <button onclick="AdminPortal.bulkDeleteSemesterRecords()" class="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-2xs transition-all shrink-0 cursor-pointer active:scale-[0.98]">
                刪除該學期資料
              </button>
            </div>
          </div>

        </div>

        <!-- 區塊 4: 危險操作區 (Danger Zone) -->
        <div class="bg-rose-50/50 border border-rose-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs">
          <div class="flex items-center gap-3 pb-3 border-b border-rose-200/60 mb-4">
            <div class="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>
            <div>
              <h4 class="font-extrabold text-rose-900 text-base">危險操作專區 (清除全校系統資料)</h4>
              <p class="text-xs font-semibold text-rose-700 mt-0.5">警告：此操作將完全清空全校學籍、檢測成績與設定，恢復至初始狀態且無法復原</p>
            </div>
          </div>
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p class="text-xs text-rose-700/90 leading-relaxed max-w-2xl">清空資料後，本機與雲端備份均會歸零。執行前請確認已備份重要 Excel 檔案。</p>
            <button onclick="AdminPortal.clearAllSystemData()" class="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-5 rounded-xl text-sm shadow-2xs transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-[0.98]">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              <span>清除並重設系統資料</span>
            </button>
          </div>
        </div>

      </div>

      <!-- ==================== 模組 9: 最新公告管理 ==================== -->
      <div id="erpView_announcements" class="hidden corp-card p-6 space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 class="text-lg font-bold text-slate-900">📢 最新公告與注意事項管理</h3>
            <p class="text-sm text-slate-600 mt-1">設定學生前台顯示之公告內容，支援精準起訖時間控制，逾期自動隱藏。</p>
          </div>
        </div>

        <div class="corp-table-container max-h-[60vh] overflow-y-auto">
          <table class="corp-table">
            <thead>
              <tr>
                <th class="w-[8%] text-center">置頂</th>
                <th class="w-[12%] text-center">分類</th>
                <th class="w-[30%] text-left">公告標題</th>
                <th class="w-[22%] text-center">刊登起訖時間</th>
                <th class="w-[14%] text-center">即時刊登狀態</th>
                <th class="w-[14%] text-center">操作</th>
              </tr>
            </thead>
            <tbody id="erpAnnouncementsTbody"></tbody>
          </table>
        </div>
      </div>
    </main>

  </div>

  <!-- ==================== 浮動 Dock 工具列 ==================== -->
  <div id="batchActionBar" class="corp-dock-bar hidden">
    <span class="text-sm font-semibold">已選取 <span id="batchSelectedCountBadge" class="underline font-extrabold text-amber-300">0</span> 位學生：</span>
    <button onclick="AdminPortal.batchPassSelected()" class="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-1">
      設為合格
    </button>
    <button onclick="AdminPortal.batchFailSelected()" class="bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-1">
      設為未合格
    </button>
    <button onclick="AdminPortal.batchCopyEmails()" class="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-1">
      複製 Email
    </button>
  </div>

  <!-- Modal 1: 編輯學籍基本資料 Modal -->
  <div id="rosterEditModal" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 hidden">
    <div class="corp-card max-w-md w-full p-6 shadow-2xl bg-white rounded-2xl border border-slate-200">
      
      <div class="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
        <div>
          <h3 class="text-lg font-bold text-slate-900">修訂學生學籍基本資料</h3>
          <p id="rosterModalStudentIdHeader" class="text-sm text-slate-500 font-mono font-semibold mt-0.5">-</p>
        </div>
        <button onclick="AdminPortal.closeRosterEditModal()" class="text-slate-400 hover:text-slate-600 text-2xl font-bold">✕</button>
      </div>

      <div class="space-y-4 text-sm">
        <div>
          <label class="block font-bold text-slate-700 mb-1.5">姓名</label>
          <input type="text" id="rosterInputName" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm">
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1.5">班級</label>
          <input type="text" id="rosterInputClassName" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-medium text-slate-900 text-sm">
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1.5">入學年 (學年度)</label>
          <input type="text" id="rosterInputEnrollYear" placeholder="例: 110" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 font-mono text-sm">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1.5">入學方式</label>
            <input type="text" id="rosterInputAdmissionMethod" placeholder="例: 一般, 轉學考, 運動績優" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-medium text-slate-900 text-sm">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1.5">身分</label>
            <input type="text" id="rosterInputIdentity" placeholder="例: 一般生, 身心障礙" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-medium text-slate-900 text-sm">
          </div>
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1.5">學籍狀態</label>
          <select id="rosterSelectRosterStatus" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm">
            <option value="在學">在學</option>
            <option value="非在籍">非在籍</option>
          </select>
        </div>

        <div class="flex gap-3 pt-4 border-t border-slate-200">
          <button onclick="AdminPortal.closeRosterEditModal()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-sm flex-1">取消</button>
          <button onclick="AdminPortal.saveRosterEdit()" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm shadow-xs flex-1">儲存學籍修訂</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal 2: 編輯體適能畢業門檻 Modal -->
  <div id="thresholdEditModal" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 hidden">
    <div class="corp-card max-w-2xl w-full p-6 shadow-2xl bg-white rounded-2xl max-h-[90vh] overflow-y-auto border border-slate-200">
      
      <div class="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
        <div>
          <h3 class="text-lg font-bold text-slate-900">審核與修訂體適能畢業門檻</h3>
          <p id="thresholdModalStudentHeader" class="text-sm text-slate-500 font-mono font-semibold mt-0.5">-</p>
        </div>
        <button onclick="AdminPortal.closeThresholdEditModal()" class="text-slate-400 hover:text-slate-600 text-2xl font-bold">✕</button>
      </div>

      <div class="space-y-4.5 text-sm">
        <div class="grid grid-cols-2 gap-3.5">
          <div>
            <label class="block font-bold text-slate-700 mb-1.5">採計次數 (通過次數)</label>
            <input type="number" id="thresholdInputPassCount" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-bold font-mono text-slate-900 text-sm">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1.5">門檻通過狀態</label>
            <select id="thresholdSelectStatus" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm">
              <option value="通過">通過 (合格)</option>
              <option value="不通過">不通過 (未合格)</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3.5">
          <div>
            <label class="block font-bold text-slate-700 mb-1.5">是否轉學扣抵 (顯示1)</label>
            <select id="thresholdSelectTransfer" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-medium text-slate-900 text-sm">
              <option value="0">否 (一般學生)</option>
              <option value="1">是 (轉學扣抵1次)</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1.5">特殊免測身分設定</label>
            <select id="thresholdSelectAthlete" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-medium text-slate-900 text-sm">
              <option value="0">否 (正常應測)</option>
              <option value="1">體保生免測</option>
              <option value="2">身心障礙免測</option>
              <option value="3">核可免測 (其他)</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1.5">各學期通過註記 (1101 ~ 1132)</label>
          <div id="thresholdSemesterCheckboxes" class="grid grid-cols-4 gap-2 border border-slate-200 p-3.5 rounded-xl bg-slate-50 text-sm"></div>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1.5">異動原因 / 次數其餘說明 (例: 校內自轉...)</label>
          <textarea id="thresholdInputNotes" rows="2" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-medium text-slate-900 text-sm" placeholder="填寫異動原因或備註..."></textarea>
        </div>

        <div class="flex gap-3 pt-4 border-t border-slate-200">
          <button onclick="AdminPortal.closeThresholdEditModal()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-sm flex-1">取消</button>
          <button onclick="AdminPortal.saveThresholdEdit()" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm shadow-xs flex-1">儲存變更</button>
        </div>
      </div>
    </div>
  </div>

  <!-- 2. 匯入學籍 Modal -->
  <div id="rosterImportModal" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 hidden">
    <div class="corp-card max-w-md w-full p-6 bg-white rounded-2xl border border-slate-200">
      <div class="flex justify-between items-center mb-3">
        <h3 class="font-bold text-slate-900 text-base">匯入學期學籍檔 Excel</h3>
        <button onclick="App.closeRosterModal()" class="text-slate-400 font-bold text-lg">✕</button>
      </div>
      <div class="border-2 border-dashed border-blue-200 p-6 text-center rounded-xl mb-3 bg-blue-50/20">
        <input type="file" id="rosterFileInput" accept=".xlsx,.xls" class="block mx-auto text-sm text-slate-700 font-medium">
      </div>
      <div class="flex justify-between items-center text-xs text-slate-500 font-medium">
        <span>包含欄位：學號、班級、姓名(全名)。</span>
        <button onclick="App.downloadRosterTemplate()" class="text-blue-600 font-bold hover:underline">下載標準範本 (.xlsx)</button>
      </div>
    </div>
  </div>

  <!-- 3. 匯入成績 Modal -->
  <div id="testImportModal" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 hidden">
    <div class="corp-card max-w-md w-full p-6 bg-white rounded-2xl border border-slate-200">
      <div class="flex justify-between items-center mb-3">
        <h3 class="font-bold text-slate-900 text-base">匯入體適能成績 Excel (17欄/21欄位)</h3>
        <button onclick="App.closeTestImportModal()" class="text-slate-400 font-bold text-lg">✕</button>
      </div>
      <div class="space-y-3 mb-3">
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">歸檔學期 (如為單學期成績請填寫)</label>
          <input type="text" id="importSemesterInput" value="" placeholder="例: 1122 (請務必填寫)" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900">
        </div>
        <div class="border-2 border-dashed border-indigo-200 p-6 text-center rounded-xl bg-indigo-50/20">
          <input type="file" id="testDataFileInput" accept=".xlsx,.xls" class="block mx-auto text-sm text-slate-700 font-medium">
        </div>
        <div class="flex justify-end text-xs mb-3">
          <button onclick="App.downloadTestScoreTemplate()" class="text-indigo-600 font-bold hover:underline">下載 17 欄位標準成績範本 (.xlsx)</button>
        </div>
        
        <!-- 歷史匯入狀態區塊 -->
        <div class="pt-3 border-t border-slate-200">
          <h4 class="text-sm font-bold text-slate-800 mb-2 flex items-center gap-1.5">
            <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            各學期最後匯入時間
          </h4>
          <div id="importHistoryList" class="space-y-1.5 max-h-32 overflow-y-auto text-xs font-mono text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div class="text-slate-400 text-center py-2">讀取中...</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 4. 🛡️ 學籍比對防呆提醒 Modal -->
  <div id="importMismatchModal" class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 hidden">
    <div class="corp-card max-w-3xl w-full p-6 shadow-2xl bg-white rounded-2xl max-h-[90vh] flex flex-col border border-slate-200">
      
      <div class="flex items-center justify-between pb-3 border-b border-rose-200 mb-4">
        <div class="flex items-center gap-2">
          <div class="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-lg shrink-0">
            ⚠️
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900">學籍對比防呆提醒：發現資料不吻合！</h3>
            <p id="mismatchSummaryText" class="text-xs text-rose-700 font-bold mt-0.5">發現 N 筆 Excel 資料與系統現有學籍不吻合</p>
          </div>
        </div>
        <button onclick="App.cancelImportMismatch()" class="text-slate-400 hover:text-slate-600 text-2xl font-bold">✕</button>
      </div>

      <div class="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-4 text-sm text-rose-900 font-medium space-y-1">
        <p class="font-bold text-rose-950">📌 請確認以下不吻合之學號與姓名：</p>
        <p>1. <strong>姓名不一致</strong>：代表 Excel 內的姓名與系統現有記錄不同，若強行匯入將覆寫姓名。</p>
        <p>2. <strong>全新學號</strong>：代表該學號尚未在學籍名冊中，強行匯入將自動新建該學生。</p>
      </div>

      <!-- 不吻合項目列表 -->
      <div class="flex-1 overflow-y-auto corp-table-container mb-4">
        <table class="corp-table">
          <thead>
            <tr>
              <th class="w-12 text-center">列次</th>
              <th>Excel 學號</th>
              <th>Excel 班級</th>
              <th>Excel 姓名</th>
              <th>系統現有姓名</th>
              <th class="text-center">狀態說明</th>
            </tr>
          </thead>
          <tbody id="mismatchTbody"></tbody>
        </table>
      </div>

      <div class="flex items-center justify-between pt-4 border-t border-slate-200">
        <span class="text-sm text-slate-600 font-medium">請問您是否依然要強行匯入此 Excel 檔案？</span>
        <div class="flex gap-3">
          <button onclick="App.cancelImportMismatch()" class="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-4.5 py-2.5 rounded-xl text-sm transition-colors">
            取消匯入 (修訂檔案)
          </button>
          <button onclick="App.confirmImportDespiteMismatches()" class="bg-rose-600 hover:bg-rose-700 text-white font-bold px-5.5 py-2.5 rounded-xl text-sm shadow-xs transition-all">
            依然強行匯入 (覆寫/新增)
          </button>
        </div>
      </div>

    </div>
  </div>

  <!-- 5. ⚠️ 成績衝突警示與決策 Modal -->
  <div id="scoreConflictModal" class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 hidden">
    <div class="corp-card max-w-4xl w-full p-6 shadow-2xl bg-white rounded-2xl max-h-[90vh] flex flex-col border border-slate-200">
      
      <div class="flex items-center justify-between pb-3 border-b border-amber-300 mb-4">
        <div class="flex items-center gap-2">
          <div class="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-lg shrink-0">
            ⚠️
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900">成績衝突提醒：與系統現有成績不一致</h3>
            <p id="conflictSummaryText" class="text-xs text-amber-700 font-bold mt-0.5">發現 N 筆 Excel 成績與系統現有狀態相衝</p>
          </div>
        </div>
      </div>

      <div class="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex gap-3 text-sm text-amber-800">
        <span class="text-lg">💡</span>
        <div>
          <strong>說明：</strong>
          匯入的 Excel 檔案中，部分學生的「單學期是否通過」狀態與系統原本紀錄的不同。請確認要以哪一邊的成績為主？
        </div>
      </div>

      <div class="flex-1 overflow-auto bg-slate-50 border border-slate-200 rounded-xl mb-4 relative min-h-[150px]">
        <table class="w-full text-sm text-left">
          <thead class="text-xs text-slate-500 bg-white sticky top-0 shadow-sm z-10">
            <tr>
              <th class="px-4 py-3 font-bold">學號</th>
              <th class="px-4 py-3 font-bold">姓名</th>
              <th class="px-4 py-3 font-bold text-center">學期</th>
              <th class="px-4 py-3 font-bold text-center">系統現有成績</th>
              <th class="px-4 py-3 font-bold text-center">本次匯入 Excel</th>
            </tr>
          </thead>
          <tbody id="scoreConflictTbody" class="divide-y divide-slate-200">
            <!-- JS dynamically inserts rows here -->
          </tbody>
        </table>
      </div>

      <!-- 決策區 -->
      <div class="bg-slate-50 border border-slate-200 p-4 rounded-xl mb-4">
        <h4 class="font-bold text-slate-800 text-sm mb-3">請選擇整批處理原則 (將套用至上方所有衝突的學生)：</h4>
        <div class="flex gap-4">
          <label class="flex-1 flex items-start gap-3 p-3 border-2 border-slate-300 rounded-xl cursor-pointer hover:bg-white transition-all has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
            <input type="radio" name="conflictResolution" value="keep_db" class="mt-1" checked>
            <div>
              <div class="font-bold text-slate-900 text-sm">以「系統」現有成績為主 (預設安全)</div>
              <div class="text-xs text-slate-500 mt-0.5">忽略上方清單的 Excel 衝突成績，保留系統原本狀態。(其他無衝突欄位仍會正常匯入)</div>
            </div>
          </label>
          <label class="flex-1 flex items-start gap-3 p-3 border-2 border-slate-300 rounded-xl cursor-pointer hover:bg-white transition-all has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
            <input type="radio" name="conflictResolution" value="overwrite" class="mt-1">
            <div>
              <div class="font-bold text-slate-900 text-sm">以「本次 Excel」為主 (強制覆寫)</div>
              <div class="text-xs text-slate-500 mt-0.5">強制用這次上傳的 Excel 紀錄蓋掉系統內原本的該學期成績。</div>
            </div>
          </label>
        </div>
      </div>

      <div class="flex justify-end gap-3 pt-3 border-t border-slate-200">
        <button onclick="App.cancelImportConflict()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-2.5 rounded-xl text-sm transition-colors">
          取消，不匯入
        </button>
        <button onclick="App.confirmImportConflict()" class="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-md transition-colors flex items-center gap-2">
          確認執行
        </button>
      </div>
    </div>
  </div>

  <!-- 5.5. 🚨 畢業門檻邏輯稽核 Modal -->
  <div id="logicConflictModal" class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 hidden">
    <div class="corp-card max-w-4xl w-full p-6 shadow-2xl bg-white rounded-2xl max-h-[90vh] flex flex-col border border-slate-200">
      
      <div class="flex items-center justify-between pb-3 border-b border-rose-300 mb-4">
        <div class="flex items-center gap-2">
          <div class="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-lg shrink-0">
            🚨
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900">邏輯衝突稽核：已達畢業門檻卻被標記為不通過</h3>
            <p id="logicConflictSummaryText" class="text-xs text-rose-700 font-bold mt-0.5">發現 N 筆 Excel 資料出現邏輯矛盾</p>
          </div>
        </div>
      </div>

      <div class="bg-rose-50 border border-rose-200 rounded-xl p-3 mb-4 flex gap-3 text-sm text-rose-800">
        <span class="text-lg">💡</span>
        <div>
          <strong>說明：</strong>
          系統偵測到下列學生<strong>實際通過次數已達 2 次 (或享有免測資格)</strong>，但您匯入的 Excel 檔案卻標示他們為「不通過」或「需補次數 > 0」。請選擇要如何處理這批資料：
        </div>
      </div>

      <div class="flex-1 overflow-auto bg-slate-50 border border-slate-200 rounded-xl mb-4 relative min-h-[150px]">
        <table class="w-full text-sm text-left">
          <thead class="text-xs text-slate-500 bg-white sticky top-0 shadow-sm z-10">
            <tr>
              <th class="px-4 py-3 font-bold">學號</th>
              <th class="px-4 py-3 font-bold">姓名</th>
              <th class="px-4 py-3 font-bold text-center">實際通過次數</th>
              <th class="px-4 py-3 font-bold text-center">Excel 判定結果</th>
            </tr>
          </thead>
          <tbody id="logicConflictTbody" class="divide-y divide-slate-200">
            <!-- JS dynamically inserts rows here -->
          </tbody>
        </table>
      </div>

      <!-- 決策區 -->
      <div class="bg-slate-50 border border-slate-200 p-4 rounded-xl mb-4">
        <h4 class="font-bold text-slate-800 text-sm mb-3">請選擇整批處理原則 (將套用至上方所有衝突的學生)：</h4>
        <div class="flex gap-4">
          <label class="flex-1 flex items-start gap-3 p-3 border-2 border-slate-300 rounded-xl cursor-pointer hover:bg-white transition-all has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
            <input type="radio" name="logicResolution" value="force_pass" class="mt-1" checked>
            <div>
              <div class="font-bold text-slate-900 text-sm">依據系統門檻 (強制判定為通過)</div>
              <div class="text-xs text-slate-500 mt-0.5">推翻 Excel 的錯誤標記，自動將上方學生的狀態改為「通過」並將需補次數歸零。</div>
            </div>
          </label>
          <label class="flex-1 flex items-start gap-3 p-3 border-2 border-slate-300 rounded-xl cursor-pointer hover:bg-white transition-all has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
            <input type="radio" name="logicResolution" value="keep_excel" class="mt-1">
            <div>
              <div class="font-bold text-slate-900 text-sm">保留 Excel 原判 (維持不通過)</div>
              <div class="text-xs text-slate-500 mt-0.5">尊重 Excel 檔案中的紀錄 (可能該生有特殊懲處等情況)，匯入後狀態維持為「不通過」。</div>
            </div>
          </label>
        </div>
      </div>

      <div class="flex justify-end gap-3 pt-3 border-t border-slate-200">
        <button onclick="App.cancelLogicConflict()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-2.5 rounded-xl text-sm transition-colors">
          取消，不匯入
        </button>
        <button onclick="App.confirmLogicConflict()" class="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-md transition-colors flex items-center gap-2">
          確認執行
        </button>
      </div>
    </div>
  </div>

  <!-- 5. 📊 高級匯出對話盒 Modal -->
  <div id="exportModal" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 hidden">
    <div class="corp-card max-w-lg w-full p-6 bg-white rounded-2xl shadow-2xl border border-slate-200">
      
      <div class="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
        <h3 class="font-bold text-slate-900 text-lg flex items-center gap-2">
          <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          客製化 Excel 匯出的選擇
        </h3>
        <button onclick="AdminPortal.closeExportModal()" class="text-slate-400 hover:text-slate-600 text-2xl font-bold">✕</button>
      </div>

      <div class="space-y-4 text-sm">
        
        <!-- 1. 年級與班級篩選 -->
        <div>
          <label class="block font-bold text-slate-800 mb-1.5">1. 選擇匯出學生範圍 (含四年級專用選項)</label>
          <select id="exportGradeScope" onchange="AdminPortal.onExportScopeChange(this.value)" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 bg-slate-50 text-sm">
            <option value="all" selected>全校所有學生</option>
            <option value="grade4">🎓 一次匯出所有「四年級」學生 (四開頭班級)</option>
            <option value="grade3">🎓 一次匯出所有「三年級」學生 (三開頭班級)</option>
            <option value="specific_class">特定班級...</option>
          </select>
        </div>

        <div id="exportSpecificClassContainer" class="hidden">
          <label class="block font-bold text-slate-700 mb-1.5">指定班級</label>
          <select id="exportSpecificClassSelect" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-medium text-slate-900 text-sm"></select>
        </div>

        <!-- 2. 門檻狀態過濾 -->
        <div>
          <label class="block font-bold text-slate-800 mb-1.5">2. 門檻通過狀況過濾</label>
          <select id="exportStatusFilter" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 bg-slate-50 text-sm">
            <option value="all" selected>所有狀態 (包含合格與不通過)</option>
            <option value="failed_only" class="text-rose-600">❌ 僅匯出「不通過 (未合格)」名單</option>
            <option value="passed_only" class="text-emerald-600">✅ 僅匯出「通過 (合格)」名單</option>
          </select>
        </div>

        <!-- 3. Excel 工作表分頁結構 -->
        <div>
          <label class="block font-bold text-slate-800 mb-1.5">3. Excel 工作表 (Sheet) 結構</label>
          <select id="exportSheetStructure" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 bg-slate-50 text-sm">
            <option value="single_sheet" selected>單一工作表 (全部資料整併在一頁)</option>
            <option value="multi_sheet_by_class">按班級自動分頁 (每個班級獨立 1 個 Sheet 頁籤)</option>
          </select>
        </div>

        <div class="pt-4 border-t border-slate-200 flex gap-3">
          <button onclick="AdminPortal.closeExportModal()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-sm flex-1 border border-slate-200">
            取消
          </button>
          <button onclick="AdminPortal.executeSmartExport()" class="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 rounded-xl text-sm shadow-xs flex-1 flex items-center justify-center gap-1">
            產生並下載 Excel
          </button>
        </div>

      </div>

    </div>
  </div>

  <!-- 6. 📝 檢測資料編輯 Modal -->
  <div id="recordEditModal" class="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 hidden">
    <div class="corp-card max-w-md w-full p-6 bg-white rounded-xl shadow-2xl border border-slate-200">
      
      <div class="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
        <h3 class="font-bold text-slate-900 text-lg flex items-center gap-2">
          <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          編輯檢測成績
        </h3>
        <button onclick="AdminPortal.closeRecordEditModal()" class="text-slate-400 hover:text-slate-600 text-2xl font-bold">✕</button>
      </div>

      <div class="mb-4 text-sm font-bold text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center gap-4">
        <div>學號：<span id="editRecordStudentId" class="text-slate-900 font-mono"></span></div>
        <div>學期：<span id="editRecordSemester" class="text-blue-700 font-mono bg-blue-100 px-2 py-0.5 rounded"></span></div>
      </div>

      <div class="space-y-4 text-sm">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block font-bold text-slate-800 mb-1.5">身高 (cm)</label>
            <input type="text" id="editRecordHeight" placeholder="例如: 172.5" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
          </div>
          <div>
            <label class="block font-bold text-slate-800 mb-1.5">體重 (kg)</label>
            <input type="text" id="editRecordWeight" placeholder="例如: 65.0" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
          </div>
          <div>
            <label class="block font-bold text-slate-800 mb-1.5">坐姿體前彎 (cm)</label>
            <input type="text" id="editRecordSitAndReach" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
          </div>
          <div>
            <label class="block font-bold text-slate-800 mb-1.5">立定跳遠 (cm)</label>
            <input type="text" id="editRecordStandingLongJump" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
          </div>
          <div>
            <label class="block font-bold text-slate-800 mb-1.5">仰臥起坐 (次/分)</label>
            <input type="text" id="editRecordSitUps" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
          </div>
          <div>
            <label class="block font-bold text-slate-800 mb-1.5">心肺耐力登階</label>
            <input type="text" id="editRecordCardio" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
          </div>
        </div>
        
        <div>
          <label class="block font-bold text-slate-800 mb-1.5 mt-2">該學期狀態結果 (將連動總表)</label>
          <select id="editRecordStatus" class="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold">
            <option value="合格" class="text-emerald-600">✅ 合格 (Passed)</option>
            <option value="不合格" class="text-rose-600">❌ 不合格 (Failed)</option>
            <option value="免測" class="text-amber-600">⚠️ 免測 (Exempt)</option>
          </select>
        </div>

        <div class="pt-4 border-t border-slate-200 flex gap-3">
          <button onclick="AdminPortal.closeRecordEditModal()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-lg text-sm flex-1 border border-slate-200">
            取消
          </button>
          <button onclick="AdminPortal.saveRecordEdit()" class="bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-2 rounded-lg text-sm shadow-sm flex-1">
            儲存變更
          </button>
        </div>

      </div>
    </div>
  </div>

  <!-- 6.5 單獨新增個人體適能成績紀錄 Modal -->
  <div id="addRecordModal" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 hidden">
    <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 space-y-4">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-teal-50 text-[#0d9488] flex items-center justify-center border border-teal-100">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
          </div>
          <span>單獨新增個人檢測成績</span>
        </h3>
        <button onclick="AdminPortal.closeAddRecordModal()" class="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <div class="space-y-3 text-sm">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">目標學生學號 <span class="text-rose-500">*</span></label>
            <input type="text" id="addRecordStudentId" onkeyup="AdminPortal.lookupAddRecordStudentInfo()" placeholder="輸入學號 (如: 110001001)" class="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-mono text-sm focus:border-teal-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">檢測學期 <span class="text-rose-500">*</span></label>
            <input type="text" id="addRecordSemester" placeholder="如: 1121 或 1122" class="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-bold text-sm focus:border-teal-500 focus:outline-none">
          </div>
        </div>

        <!-- 即時學生預覽資訊 -->
        <div id="addRecordStudentPreview" class="hidden p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-between">
          <span id="addRecordStudentName">姓名：--</span>
          <span id="addRecordStudentClass" class="text-slate-500">班級：--</span>
        </div>

        <div class="grid grid-cols-2 gap-3 pt-1">
          <div>
            <label class="block font-bold text-slate-700 mb-1 text-xs">身高 (cm)</label>
            <input type="text" id="addRecordHeight" placeholder="例如: 172.5" class="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-teal-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1 text-xs">體重 (kg)</label>
            <input type="text" id="addRecordWeight" placeholder="例如: 65.0" class="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-teal-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1 text-xs">坐姿體前彎 (cm)</label>
            <input type="text" id="addRecordSitAndReach" placeholder="例如: 35.5" class="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-teal-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1 text-xs">立定跳遠 (cm)</label>
            <input type="text" id="addRecordStandingLongJump" placeholder="例如: 210" class="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-teal-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1 text-xs">仰臥起坐 (次/分)</label>
            <input type="text" id="addRecordSitUps" placeholder="例如: 45" class="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-teal-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1 text-xs">心肺耐力登階</label>
            <input type="text" id="addRecordCardio" placeholder="例如: 630" class="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-teal-500 focus:outline-none">
          </div>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">該學期檢測結果 <span class="text-rose-500">*</span></label>
          <select id="addRecordStatus" class="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-bold text-sm focus:border-teal-500 focus:outline-none">
            <option value="合格" selected class="text-emerald-600 font-bold">✅ 合格 (Passed)</option>
            <option value="不合格" class="text-rose-600 font-bold">❌ 不合格 (Failed)</option>
            <option value="免測" class="text-amber-600 font-bold">⚠️ 免測 (Exempt)</option>
          </select>
        </div>

        <div class="pt-3 border-t border-slate-100 flex gap-3">
          <button onclick="AdminPortal.closeAddRecordModal()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-sm flex-1 cursor-pointer">
            取消
          </button>
          <button onclick="AdminPortal.saveNewRecord()" class="bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold py-2.5 rounded-xl text-sm shadow-2xs flex-1 cursor-pointer active:scale-[0.98]">
            儲存該筆成績紀錄
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- 6.6 EML 郵件範本編輯與預覽 Modal -->
  <div id="emlPreviewModal" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 hidden">
    <div class="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] flex flex-col">
      
      <!-- Modal 標頭區 -->
      <div class="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
        <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-teal-50 text-[#0d9488] flex items-center justify-center border border-teal-100">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          </div>
          <span>EML 郵件草稿預覽與內容自訂編輯</span>
        </h3>
        <button onclick="AdminPortal.closeEmlPreviewModal()" class="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- 收件學生與狀態資訊條 -->
      <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs font-bold text-slate-700 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-1 rounded-md bg-teal-100 text-teal-800 border border-teal-200 font-extrabold">發送對象</span>
          <span id="emlPreviewRecipientSummary" class="text-slate-900 font-bold">共 0 位未合格學生</span>
        </div>
        <span class="text-slate-500 font-normal">💡 下載 .EML 檔開啟後會在 Outlook 呈送，您可以在此自由微調文字</span>
      </div>

      <!-- 編輯區 (可捲動) -->
      <div class="space-y-4 text-sm overflow-y-auto flex-1 pr-1">
        <div>
          <label class="block font-bold text-slate-800 mb-1">郵件主旨 (Subject)</label>
          <input type="text" id="emlSubjectInput" class="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm focus:border-teal-500 focus:outline-none">
        </div>

        <div>
          <label class="block font-bold text-slate-800 mb-1">寄件者單位名稱 (Sender Title)</label>
          <input type="text" id="emlSenderInput" class="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-800 text-sm focus:border-teal-500 focus:outline-none">
        </div>

        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="block font-bold text-slate-800">郵件內文編輯 (支援自由修改或補充注意事項)</label>
            <button onclick="AdminPortal.resetEmlTemplateToDefault()" class="text-xs text-teal-700 hover:text-teal-900 font-bold underline cursor-pointer">
              ↺ 重置為預設內文
            </button>
          </div>
          <textarea id="emlBodyTextarea" rows="9" class="w-full p-3.5 border border-slate-300 rounded-xl font-sans text-sm leading-relaxed text-slate-800 focus:border-teal-500 focus:outline-none"></textarea>
        </div>
      </div>

      <!-- 底部操作按鈕區 -->
      <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
        <button onclick="AdminPortal.closeEmlPreviewModal()" class="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm cursor-pointer">
          取消
        </button>

        <button onclick="AdminPortal.downloadCustomizedEml()" class="px-6 py-2.5 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold text-sm shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          <span>確認並下載 .EML 郵件草稿檔</span>
        </button>
      </div>

    </div>
  </div>

  <!-- 7. 管理登入 Modal (全螢幕不透明登入頁) -->
  <div id="adminLoginModal" role="dialog" aria-modal="true" aria-labelledby="adminLoginTitle" class="fixed inset-0 z-50 bg-[#f0f4f8] flex items-center justify-center p-4 hidden">
    <div class="max-w-[420px] w-full p-8 sm:p-9 bg-white rounded-3xl text-center shadow-2xl border border-slate-100/80">
      
      <!-- 頂部 Icon -->
      <div class="w-20 h-20 rounded-full bg-emerald-50/80 border border-emerald-100 mx-auto flex items-center justify-center mb-4 shrink-0 shadow-2xs">
        <svg class="w-9 h-9 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      
      <h3 id="adminLoginTitle" class="font-black text-slate-900 text-2xl mb-2.5 tracking-tight">體適能系統管理後台</h3>
      <div class="w-12 h-1 bg-emerald-500 rounded-full mx-auto mb-7"></div>
      
      <div class="space-y-4 mb-7 text-left">
        <div>
          <label for="adminAccountInput" class="block text-xs font-bold text-slate-700 mb-1.5">管理員帳號</label>
          <div class="relative">
            <svg class="w-5 h-5 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            <input type="text" id="adminAccountInput" autocomplete="username" placeholder="請輸入管理員帳號" class="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/40 text-sm font-semibold text-slate-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:bg-white focus:outline-none transition-colors placeholder:text-slate-400 placeholder:font-normal">
          </div>
        </div>

        <div>
          <label for="adminPasswordInput" class="block text-xs font-bold text-slate-700 mb-1.5">管理員密碼</label>
          <div class="relative">
            <svg class="w-5 h-5 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            <input type="password" id="adminPasswordInput" autocomplete="current-password" placeholder="請輸入管理員密碼" class="w-full pl-11 pr-11 py-3 rounded-2xl border border-slate-200 bg-slate-50/40 text-sm font-semibold text-slate-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:bg-white focus:outline-none transition-colors placeholder:text-slate-400 placeholder:font-normal">
            <button type="button" onclick="AdminPortal.togglePasswordVisibility()" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none" aria-label="切換密碼顯示">
              <svg id="pwdEyeIcon" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            </button>
          </div>
        </div>
      </div>
      
      <!-- 綠色實心登入按鈕 -->
      <button id="adminLoginSubmitBtn" onclick="AdminPortal.verifyLogin()" class="w-full bg-[#0d9488] hover:bg-[#0f766e] disabled:opacity-60 text-white py-3.5 rounded-2xl text-base font-extrabold shadow-md shadow-emerald-600/20 transition-all active:scale-[0.99] cursor-pointer tracking-wider">
        登 入
      </button>

      <!-- 或 分隔線 -->
      <div class="relative my-6 text-center">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-slate-200/80"></div>
        </div>
        <div class="relative inline-block bg-white px-3 text-xs font-bold text-slate-400">或</div>
      </div>

      <!-- 綠色外框返回學生查詢按鈕 -->
      <button onclick="AdminPortal.hideLoginModal(); App.switchTab('student');" class="w-full bg-white hover:bg-emerald-50/60 text-[#0d9488] border-2 border-[#0d9488] font-extrabold py-3.5 rounded-2xl text-base transition-all flex items-center justify-center gap-2 cursor-pointer">
        <svg class="w-5 h-5 text-[#0d9488]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        <span>返回學生查詢</span>
      </button>
    </div>
  </div>

  <!-- 7. Firebase 設定 Modal -->
  <div id="firebaseConfigModal" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 hidden">
    <div class="corp-card max-w-md w-full p-6 bg-white rounded-2xl border border-slate-200">
      <div class="flex justify-between items-center mb-3">
        <h3 class="font-bold text-slate-900 text-base">Firebase 雲端資料庫</h3>
        <button onclick="App.closeFirebaseModal()" class="text-slate-400 font-bold text-lg">✕</button>
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
          <button onclick="App.closeFirebaseModal()" class="bg-slate-100 text-slate-700 py-2.5 rounded-xl text-sm font-bold flex-1">取消</button>
          <button onclick="App.saveFirebaseConfig()" class="bg-blue-600 text-white py-2.5 rounded-xl text-sm font-bold flex-1 shadow-xs">儲存</button>
        </div>
      </div>
    </div>
  </div>

  <!-- 8. 新增/修訂公告 Modal -->
  <div id="announcementEditModal" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 hidden">
    <div class="corp-card max-w-lg w-full p-6 bg-white rounded-2xl border border-slate-200 shadow-xl">
      <div class="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
        <h3 id="announcementModalHeader" class="font-bold text-slate-900 text-base">新增最新公告</h3>
        <button onclick="AdminPortal.closeAnnouncementModal()" class="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
      </div>

      <div class="space-y-4 text-sm">
        <div>
          <label class="block font-bold text-slate-700 mb-1">公告標題 <span class="text-rose-500">*</span></label>
          <input type="text" id="announcementInputTitle" placeholder="例如: 112學年度下學期 學生體適能補測報名須知" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-medium text-slate-900 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">公告分類</label>
            <select id="announcementSelectCategory" class="w-full px-3 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-800 text-sm focus:border-blue-500">
              <option value="重要通知">重要通知</option>
              <option value="補測公告">補測公告</option>
              <option value="申辦提醒">申辦提醒</option>
              <option value="課程資訊">課程資訊</option>
            </select>
          </div>
          <div class="flex items-center gap-4 pt-6">
            <label class="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
              <input type="checkbox" id="announcementInputIsPinned" class="w-4 h-4 text-rose-600 rounded border-slate-300">
              <span>📌 置頂</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
              <input type="checkbox" id="announcementInputIsPublished" checked class="w-4 h-4 text-emerald-600 rounded border-slate-300">
              <span>啟用刊登 (狀態開關)</span>
            </label>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">開始刊登日期 <span class="text-rose-500">*</span></label>
            <input type="date" id="announcementInputStartDate" class="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-slate-900 text-sm">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">結束刊登日期 <span class="text-rose-500">*</span></label>
            <input type="date" id="announcementInputEndDate" class="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-slate-900 text-sm">
          </div>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">公告詳細說明 / 內文</label>
          <textarea id="announcementInputContent" rows="4" placeholder="請輸入詳細說明事項、報名地點或辦理時間..." class="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-medium text-slate-900 text-sm focus:border-blue-500"></textarea>
        </div>

        <div class="flex gap-3 pt-3">
          <button onclick="AdminPortal.closeAnnouncementModal()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-sm font-bold flex-1">取消</button>
          <button onclick="AdminPortal.saveAnnouncementModal()" class="bg-[#0d9488] hover:bg-[#0f766e] text-white py-2.5 rounded-xl text-sm font-bold flex-1 shadow-xs cursor-pointer active:scale-[0.98]">儲存公告</button>
        </div>
      </div>
    </div>
  </div>

  <!-- 9. 學生端觀看最新公告 Modal -->
  <div id="studentAnnouncementsModal" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 hidden">
    <div class="corp-card max-w-xl w-full p-6 bg-white rounded-2xl border border-slate-200 shadow-2xl max-h-[85vh] flex flex-col">
      <div class="flex justify-between items-center pb-3 border-b border-slate-100 mb-4 shrink-0">
        <div class="flex items-center gap-2.5">
          <h3 class="font-bold text-slate-900 text-lg">📢 最新公告與注意事項</h3>
        </div>
        <button onclick="StudentPortal.closeAnnouncementsModal()" class="text-slate-400 hover:text-slate-600 font-bold text-xl px-2">✕</button>
      </div>

      <div id="studentAnnouncementsModalBody" class="space-y-3 overflow-y-auto pr-1 flex-1">
        <!-- JS 動態繪製公告 -->
      </div>

      <div class="pt-4 border-t border-slate-100 mt-4 flex justify-end shrink-0">
        <button onclick="StudentPortal.closeAnnouncementsModal()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-5 rounded-xl text-sm font-bold shadow-2xs">
          關閉
        </button>
      </div>
    </div>
  </div>

  <!-- 10. 管理員白名單、姓名、角色與密碼 Modal -->
  <div id="adminAccountEditModal" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 hidden">
    <div class="corp-card max-w-lg w-full p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
        <h3 id="accountModalHeader" class="font-bold text-slate-900 text-base">新增同仁白名單帳號</h3>
        <button onclick="AdminPortal.closeAdminAccountModal()" class="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
      </div>

      <div class="space-y-4 text-sm">
        <div>
          <label for="accountInputName" class="block font-bold text-slate-700 mb-1">真實姓名 <span class="text-rose-500">*</span></label>
          <input type="text" id="accountInputName" maxlength="40" autocomplete="name" placeholder="例如：王小明" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-medium text-slate-900 text-sm focus:border-purple-500 focus:outline-none">
          <p class="text-[11px] text-slate-500 mt-1">畫面會顯示真實姓名；「系統管理員」只作為角色標籤。</p>
        </div>

        <div>
          <label for="accountInputUsername" class="block font-bold text-slate-700 mb-1">登入帳號 <span class="text-rose-500">*</span></label>
          <input type="text" id="accountInputUsername" maxlength="64" autocomplete="username" placeholder="例如：staff01" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-mono text-slate-900 text-sm focus:border-purple-500 focus:outline-none">
          <p class="text-[11px] text-slate-500 mt-1">登入時只需輸入帳號；系統會安全對應 Firebase 內部信箱。</p>
        </div>

        <div>
          <label for="accountInputPassword" class="block font-bold text-slate-700 mb-1">設定／重設登入密碼</label>
          <input type="password" id="accountInputPassword" minlength="8" autocomplete="new-password" placeholder="至少 8 碼" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-mono text-slate-900 text-sm focus:border-purple-500 focus:outline-none">
          <p id="accountPasswordHint" class="text-[11px] leading-relaxed text-slate-500 mt-1">密碼只會送往 Firebase Authentication，不會儲存在 Firestore 或 GitHub。</p>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">權限角色分配</label>
          <select id="accountSelectRole" class="w-full px-3 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm">
            <option value="staff" selected>一般教職員 (隱藏系統設定與操作紀錄)</option>
            <option value="super_admin">系統管理員 (具備最高完整管理權限)</option>
          </select>
        </div>

        <label class="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
          <input type="checkbox" id="accountInputEnabled" checked class="mt-0.5 w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500">
          <span>
            <span class="block font-bold text-slate-800">啟用此管理員帳號</span>
            <span class="block text-[11px] leading-relaxed text-slate-500 mt-0.5">取消勾選會停用登入並撤銷管理權限，不會刪除稽核紀錄。</span>
          </span>
        </label>

        <div class="flex gap-3 pt-3">
          <button onclick="AdminPortal.closeAdminAccountModal()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-sm font-bold flex-1">取消</button>
          <button id="adminAccountSaveBtn" onclick="AdminPortal.saveAdminAccountModal()" class="bg-purple-600 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-wait text-white py-2.5 rounded-xl text-sm font-bold flex-1 shadow-xs">儲存設定</button>
        </div>
      </div>
    </div>
  </div>

  <!-- 11. 所有已登入教職員皆可使用的個人密碼修改 Modal -->
  <div id="selfPasswordModal" role="dialog" aria-modal="true" aria-labelledby="selfPasswordModalTitle" class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 hidden">
    <div class="corp-card max-w-md w-full p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-xl">
      <div class="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
        <div>
          <h3 id="selfPasswordModalTitle" class="font-bold text-slate-900 text-base">修改我的登入密碼</h3>
          <p id="selfPasswordAccountHint" class="text-[11px] text-slate-500 mt-0.5">僅變更目前登入帳號</p>
        </div>
        <button type="button" onclick="AdminPortal.closeSelfPasswordModal()" aria-label="關閉修改密碼視窗" class="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
      </div>

      <form class="space-y-4 text-sm" onsubmit="event.preventDefault(); AdminPortal.changeOwnPassword();">
        <div>
          <label for="selfPasswordCurrent" class="block font-bold text-slate-700 mb-1">目前密碼 <span class="text-rose-500">*</span></label>
          <input type="password" id="selfPasswordCurrent" required autocomplete="current-password" placeholder="輸入目前登入密碼" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-mono text-slate-900 text-sm focus:border-purple-500 focus:outline-none">
        </div>

        <div>
          <label for="selfPasswordNew" class="block font-bold text-slate-700 mb-1">新密碼 <span class="text-rose-500">*</span></label>
          <input type="password" id="selfPasswordNew" required minlength="8" autocomplete="new-password" placeholder="至少 8 碼" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-mono text-slate-900 text-sm focus:border-purple-500 focus:outline-none">
        </div>

        <div>
          <label for="selfPasswordConfirm" class="block font-bold text-slate-700 mb-1">再次輸入新密碼 <span class="text-rose-500">*</span></label>
          <input type="password" id="selfPasswordConfirm" required minlength="8" autocomplete="new-password" placeholder="再次輸入相同的新密碼" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-mono text-slate-900 text-sm focus:border-purple-500 focus:outline-none">
          <p class="text-[11px] leading-relaxed text-slate-500 mt-1.5">密碼只會送往 Firebase Authentication，不會儲存在 Firestore 或 GitHub。</p>
        </div>

        <div class="flex gap-3 pt-3">
          <button type="button" onclick="AdminPortal.closeSelfPasswordModal()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-sm font-bold flex-1">取消</button>
          <button id="selfPasswordSaveBtn" type="submit" class="bg-purple-600 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-wait text-white py-2.5 rounded-xl text-sm font-bold flex-1 shadow-xs">更新密碼</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Toast 動態通知 -->
  <div id="toastContainer" role="status" aria-live="polite" aria-atomic="true" class="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none"></div>
  `;

  function mountUI() {
    const root = document.getElementById('root');
    if (root) {
      root.innerHTML = rootHTML;
    }
  }

  // 立即掛載以防 DOM 階段提早觸發
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountUI);
  } else {
    mountUI();
  }
})();
