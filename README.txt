公司通用問卷調查系統 v1.4（Google Drive 圖片網址版）

本版新增：
- 不需要啟用或付費使用 Firebase Storage。
- 頁首圖片及每一題的參考圖片可直接貼 Google Drive 分享網址。
- 系統會自動辨識常見 Drive 分享網址並轉成圖片顯示網址。
- 後台輸入網址時會立即顯示預覽，權限不正確時會顯示提醒。
- 一般 https 圖片網址與既有 assets 相對路徑仍可使用。

Google Drive 圖片使用方式：
1. 將圖片上傳至 Google Drive。
2. 在圖片上按右鍵 → 共用／分享。
3. 一般存取權改為「知道連結的使用者」。
4. 權限選擇「檢視者」。
5. 複製分享網址，貼到後台的「頁首參考圖片網址」或題目的「參考圖片網址」。
6. 確認後台已顯示圖片預覽，再儲存問卷。

部署時請連同 css/v1.4.css 一起上傳；不需要設定 Storage Rules。

v1.2 原有功能：
- 可為每份問卷選擇「使用公司人員資料庫」或不收集身分。
- 後台可勾選本次開放填寫的部門；未勾選代表全部部門。
- 前台依部門篩選啟用人員，選擇姓名後自動帶入員工編號。
- 回覆及 Excel 結果會記錄部門、姓名、員編與人員 ID。
- 外套尺寸範本改用統一身分區塊，不再要求手動輸入姓名與員編。

本版修正：
- 修正 config.js 已存在卻被誤判為「尚未設定 Firebase」。
- 修正 Firebase 尚未初始化時點擊登入造成 signInWithPopup 錯誤。
- 更新 CSS、config.js 與 app.js 快取版本，避免 GitHub Pages 沿用舊檔。

用途：
- 取代一般 Google 表單，建立公司內部各類問卷。
- 與行政部活動調查系統完全分開。
- Firebase 集合使用 universalForms、universalResponses。

目前功能：
- 建立、編輯、刪除多份問卷。
- 每份問卷具備獨立前台網址。
- 題型：簡答、長文、單選、複選、下拉選單、部門選單、圖片／說明。
- 設定必填、截止時間、草稿／開放／關閉狀態。
- 題目上移、下移及刪除。
- 公開前台填寫與 Firebase 儲存。
- 後台查看結果與 Excel 匯出。
- 一鍵建立「立領撞色外套尺寸調查」範本。

檔案結構：
- index.html：前台與後台頁面結構
- css/app.css：介面樣式
- js/config.js：Firebase 設定
- js/app.js：問卷建立器、填寫與結果功能
- assets/company-logo.png：公司識別
- assets/uniform-survey-reference.jpg：原 Google 問卷參考截圖
- Firestore規則新增區塊.txt：需要合併到共用 Rules 的新集合規則

部署順序：
1. 請建立新的 GitHub Pages 儲存庫或獨立資料夾，不要覆蓋聚餐系統。
2. 上傳本資料夾中的 index.html、css、js、assets。
3. 將「Firestore規則新增區塊.txt」中的兩個 match 區塊加入現有 Rules，放在最後拒絕規則之前。
4. 以管理員 Google 帳號登入後台。
5. 按「建立外套尺寸範本」，補上截止時間並將狀態改為「開放填寫」。
6. 將參考圖片上傳至 Google Drive、開啟連結檢視權限，再將分享網址貼入題目的「參考圖片網址」。

後台網址：index.html#admin
前台網址：由後台「複製前台網址」取得，格式為 index.html#form/問卷ID
