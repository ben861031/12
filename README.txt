公司通用問卷調查系統 v1.3（Firebase 圖片上傳版）

本版新增：
- 問卷頁首與各題參考圖片可由後台直接上傳，不必先放到 GitHub。
- 上傳前自動縮放至最長邊 1600px，並轉成 WebP 壓縮，降低 Storage 用量。
- 上傳後自動填入 Firebase 公開圖片網址並顯示預覽。
- 仍保留外部圖片網址輸入方式。
- 儲存後會清理被替換或移除的舊圖片；刪除問卷時同步刪除該問卷上傳的圖片。
- 若取消編輯，會清理本次尚未儲存的新上傳圖片。

重要部署步驟：
1. 除原有檔案外，務必上傳 css/v1.3.css。
2. Firebase Console 開啟「Storage」，如尚未建立請先按開始使用。
3. 進入 Storage → Rules，將「Firebase Storage規則.txt」整份貼上並發布。
4. GitHub Pages 重新部署後，以管理員登入即可看到「上傳圖片」。

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
6. 取得外套與尺寸表原始圖片後，可上傳至可公開讀取的位置，再將網址填入題目的「參考圖片網址」。

後台網址：index.html#admin
前台網址：由後台「複製前台網址」取得，格式為 index.html#form/問卷ID
