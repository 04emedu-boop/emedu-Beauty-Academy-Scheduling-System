# 美業教室排課系統 v2.0

**美業補習班教室登記系統** - 實現矩陣式課表的即時自動化登記系統

## 📋 專案簡介

本系統主要解決「老師預約」與「行政排課」之間的資訊落差,提供:
- ✅ **自動化寫入**: 老師在網頁登記後,名字與學生人數直接顯示在 Google Sheet
- ✅ **即時防撞機制**: 系統自動鎖定已預約時段,杜絕撞期
- ✅ **直覺化介面**: 簡潔易用的預約流程

## 🚀 快速開始

### 環境需求
- Node.js v18+ 
- npm v9+

### 安裝步驟

```bash
# 1. Clone 專案
git clone https://github.com/emedu/emedu-Beauty-Academy-Scheduling-System.git
cd emedu-Beauty-Academy-Scheduling-System

# 2. 安裝相依套件
npm install

# 3. 啟動開發伺服器
npm run dev

# 4. 開啟瀏覽器訪問
# http://localhost:3000
```

## 📦 可用指令

```bash
npm run dev      # 啟動開發伺服器
npm run build    # 建置生產版本
npm run preview  # 預覽生產版本
```

## 🛠️ 技術堆疊

- **前端框架**: React 19
- **開發語言**: TypeScript
- **建置工具**: Vite 6
- **樣式框架**: Tailwind CSS (CDN)
- **圖示庫**: Lucide React
- **後端**: Google Apps Script
- **資料庫**: Google Sheets

## 📁 專案結構

```
emedu-Beauty-Academy-Scheduling-System/
├── components/          # React 元件
│   ├── Header.tsx
│   ├── SubjectSelector.tsx
│   └── BookingGrid.tsx
├── services/           # 服務層
│   └── mockGasService.ts
├── docs/              # 文件
├── App.tsx            # 主應用程式
├── types.ts           # TypeScript 型別定義
├── constants.ts       # 常數定義
├── index.tsx          # 應用程式入口
├── index.html         # HTML 模板
└── vite.config.ts     # Vite 配置
```

## 📖 詳細文件

完整的系統文件請參閱 [README.md](./README.md) (原專案文件)

## 🔧 開發指南

### 程式碼風格
- 使用 TypeScript 進行型別檢查
- 遵循 React Hooks 最佳實踐
- 元件採用函數式寫法

### 常數管理
所有魔術數字和配置值都定義在 `constants.ts`:
- `TOAST_DURATION`: Toast 通知顯示時間
- `MAX_STUDENT_COUNT`: 學生人數上限
- `MIN_STUDENT_COUNT`: 學生人數下限

## 🐛 已知問題

目前使用 Mock 資料服務 (`mockGasService.ts`),實際部署時需要:
1. 實作真實的 Google Apps Script 後端
2. 更新 API 端點
3. 處理實際的 Google Sheets 整合

## 📝 更新日誌

### v2.0 (2025-12-09)
- ✅ 修復日期格式問題
- ✅ 加強學生人數驗證
- ✅ 移除未使用的環境變數配置
- ✅ 將魔術數字移至常數檔案
- ✅ 改善錯誤處理

## 👥 貢獻

歡迎提交 Issue 和 Pull Request!

## 📄 授權

Private - 僅供內部使用

---

**最後更新**: 2025-12-09  
**維護者**: 開發團隊


**文件狀態**：正式版 (v2.0)  
**適用對象**：補習班行政主管、教務人員、系統維護工程師  
**更新日期**：2025/12/09  
**專案目標**：實現「矩陣式課表」的即時自動化登記，消除行政手動謄寫負擔，並透過系統防呆避免排課衝突。

---

## 目錄 (Table of Contents)

1.  **[行政營運篇] 系統概述與操作指引**
    *   系統解決了什麼問題？
    *   操作流程圖解
    *   行政人員每月例行職責
2.  **[技術開發篇] 系統規格與維護指南**
    *   系統架構
    *   資料庫與試算表規範 (關鍵)
    *   核心演算法邏輯
3.  **[交接檢核篇] 系統移交確認清單**

---

## 第一部分：[行政營運篇] 系統概述與操作指引

### 1. 系統核心價值
本系統主要解決「老師預約」與「行政排課」之間的資訊落差。
*   **自動化寫入**：老師在網頁登記後，名字與學生人數會直接顯示在 Google Sheet 的格子內，行政人員無需再手動打字。
*   **即時防撞機制**：若行政人員已在表格上預排「執照班」或「模考」，系統會自動鎖定該時段，老師無法預約，杜絕撞期。

### 2. 老師端操作流程 (User Journey)
請教務人員指導老師依照以下四步驟進行登記：

1.  **確認身分 (Login)**：從選單中點選自己的名字（避免手寫名字錯誤）。
2.  **選擇時間 (Time)**：選擇日期與時段（例如：12月1日 10:00-11:00）。
3.  **篩選資源 (Resource)**：
    *   系統會自動檢查該時段，只顯示「目前空白」的教室（例如：學科、彩妝...）。
    *   選擇教室後，輸入**「學生人數」**。
4.  **完成登記 (Submit)**：提交後，行政表格對應格子立即顯示如 `依珊 (3)` 之資訊。

### 3. 行政人員職責 (SOP)
⚠️ **重要：系統運作高度依賴 Excel 表格的格式，請務必遵守以下規範。**

*   **[每月一次] 建立新課表**：
    *   複製範本分頁，並重新命名為 `民國年/月份` (例如：`114/12`)。
    *   修改第一列的日期（需包含正確的星期）。
*   **[開放登記前] 預排固定課程**：
    *   在開放給老師使用前，請先將「執照班」、「團體課」或「公休日」直接打字在表格格子內。
    *   **原理**：只要格子裡有字（非空白），系統就會視為「已佔用」，自動阻擋老師預約。
*   **[隨時] 維護老師名單**：
    *   若有新老師加入，請至「系統設定」分頁的 A 欄新增名字，網頁選單會自動更新。
*   **[嚴禁] 更動表格結構**：
    *   絕對禁止在「學科」、「彩妝」、「造型」等欄位中間插入新欄位，這會導致系統定位錯誤（例如老師選彩妝，名字卻填到造型格）。

---

## 第二部分：[技術開發篇] 系統規格與維護指南

### 1. 系統架構
*   **Frontend**: HTML5, Tailwind CSS (UI), JavaScript (ES6+), React 18.
*   **Backend**: Google Apps Script (GAS).
*   **Database**: Google Sheets (採用視覺化矩陣儲存模式).

### 2. 資料庫 Schema 與 試算表結構規範

#### 2.1 系統設定 (Settings Sheet)
*   **Sheet Name**: `系統設定`
*   **Col A**: 老師名單 (供前端下拉選單讀取)。
*   **Col B**: 標準時段設定 (供前端驗證與後端比對)。

#### 2.2 月份排程表 (Schedule Sheets)
本系統採用「所見即所得」的矩陣資料庫，**座標定位 (Coordinate Mapping)** 是核心。

*   **分頁命名規則**: 必須為 `ROC年/月份` (Regex: `^\d{3}/\d{1,2}$`, e.g., `114/12`).
*   **表頭結構 (Header Structure)**:
    *   **Row 1 (日期錨點)**: 必須包含日期全名 (e.g., `2025年12月1日`). 程式以此掃描 X 軸。
    *   **Row 2 (科目錨點)**: 固定 6 欄一組：`[ 時段 | 學科 | 彩妝 | 造型 | 護膚 | 實習 ]`。
*   **資料結構 (Data Structure)**:
    *   **Column 1 (時間錨點)**: 每一組的第一欄為時段字串 (e.g., `10:00-11:00`)。
    *   **Cells**: 空白=`Available`；非空白=`Occupied`。

### 3. 核心邏輯演算法 (Core Algorithms)

#### 3.1 座標定位邏輯
系統如何將資料寫入 `(2025-12-01, 10:00-11:00, 彩妝)`？

1.  **Sheet Selector**: 將 `2025-12` 轉為 `114/12`，取得 Sheet 物件。
2.  **Column Locator (X-Axis)**:
    *   Scan Row 1 找到日期。
    *   Apply Offset: 學科(+1), 彩妝(+2), 造型(+3), 護膚(+4), 實習(+5)。
3.  **Row Locator (Y-Axis)**:
    *   在該日期區塊的「時段欄」Scan 縱軸，匹配 `10:00-11:00`。
4.  **Target Cell**: `Sheet.getRange(Row, Col + Offset)`.

#### 3.2 寫入與格式化 (submitBooking)
*   **輸入**: `{ teacherName: "依珊", studentCount: 3, ... }`
*   **流程**:
    1.  開啟 `LockService` (防併發衝突)。
    2.  再次檢查 Target Cell 是否為空。
    3.  格式化字串：**`${teacherName} (${studentCount})`**。
    4.  寫入資料。

### 4. 前端介面規範 (UI/UX)
*   **Step 1 Login**: 下拉選單選人。
*   **Step 2 Date/Time**: 選擇後觸發 `getAvailableClassrooms` API。
*   **Step 3 Resource**:
    *   動態顯示可用教室 (Radio Buttons)。
    *   輸入學生人數 (Number Input)。
*   **Step 4 Submit**: 送出並顯示成功訊息。

---

## 第三部分：[交接檢核篇] 系統移交確認清單

交接時，請雙方依照下表確認系統狀態與知識轉移：

### 1. 帳號與權限
*   [ ] 確認 Google Sheet 的編輯權限已移交給接手人員。
*   [ ] 確認 Google Apps Script 專案的擁有權已移交。
*   [ ] 確認接手人員知道如何進入 GAS 後台 (Extensions > Apps Script)。

### 2. 運作知識確認
*   [ ] **[關鍵]** 接手人員是否理解「分頁命名規則 (114/12)」的重要性？
*   [ ] **[關鍵]** 接手人員是否知道「禁止更動表格欄位順序」？
*   [ ] 接手人員是否知道如何新增「老師名單」？
*   [ ] 接手人員是否知道如何在每個月初建立新分頁？

### 3. 故障排除
*   [ ] 若老師反應「找不到該月份」，是否知道要檢查分頁名稱？
*   [ ] 若老師反應「一直預約失敗」，是否知道要檢查該格子是否被意外填入空白鍵或隱藏字元？
