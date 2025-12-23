# Antigravity 工作區與 GitHub 整合指南

這份指南統整了在 Antigravity (AI 協作環境) 中,如何從零開始建立工作區、安裝工具並連結 GitHub 的完整流程。

## 討論歷程摘要

### 昨日討論 (2025-12-01)

1. **Git 安裝驗證** (下午 4:43)
   - 執行 `git --version` 確認系統已安裝 Git
   - 確認版本為 2.47.0.windows.1
   
2. **連接專案到 GitHub 的完整流程** (上午 11:38 - 下午 1:23)
   - 學習如何初始化 Git 倉庫 (`git init`)
   - 了解如何新增檔案到暫存區 (`git add`)
   - 學習提交變更 (`git commit`)
   - 理解如何連結遠端倉庫 (`git remote add origin`)
   - 完成第一次推送到 GitHub (`git push -u origin main`)
   - 處理 Git Credential Manager 的帳號驗證流程

### 今日討論 (2025-12-02)

1. **統整業務流程需求** (上午 9:37)
   - 您要求整理所有在 Antigravity 上執行的業務
   - 包含工作區命名、整理、GitHub 倉庫連結等完整過程
   
2. **工作區狀態確認** (上午 9:43)
   - 主要工作區位於 `D:\projects`
   - 共用雲端硬碟工作區位於 `G:\共用雲端硬碟\系統軟體資料夾\@系統開發\projects`
   - 目前專案: `emedu-audio-tools`
   
3. **發現 GitHub CLI 工具** (上午 9:45)
   - 您提到之前與 Claude 4.5 討論時安裝過「GitHub CL」
   - 確認這是 **GitHub CLI** (`gh` 指令),就是您印象中的「Hybrid 連接器」
   - 檢查發現目前系統尚未安裝
   - 確認可使用 `winget` 進行安裝
   
4. **整理兩種 GitHub 連結方式** (下午 3:06)
   - 傳統方式: 手動在網頁建立倉庫 → 本地 `git init` → `git remote add` → `git push`
   - GitHub CLI 方式: 一行指令 `gh repo create` 完成所有步驟

---

## 1. 環境準備: 安裝 Git

在開始之前,必須確保電腦 (Windows) 已安裝 Git。

### 檢查是否已安裝
在終端機 (Terminal) 輸入:
```powershell
git --version
```
如果顯示版本號 (例如 `git version 2.47.0.windows.1`),則已安裝。

### 安裝步驟 (如果尚未安裝)
1. 前往 [Git 官網](https://git-scm.com/download/win) 下載 Windows 安裝程式。
2. 執行安裝程式,建議選擇 "Standalone Installer"。
3. 安裝過程中大多可維持預設值 (Next 直到完成)。
4. 安裝完成後,重新啟動終端機或 VS Code。

---

## 2. 工作區 (Workspace) 整理與命名

在 Antigravity 中,我們通常會指定一個明確的專案資料夾作為「工作區」。

### 您目前的工作區配置
- **主要工作區**: `D:\projects`
- **共用雲端硬碟工作區**: `G:\共用雲端硬碟\系統軟體資料夾\@系統開發\projects`
- **目前專案**: `emedu-audio-tools`

### 命名建議
- **路徑**: 建議使用簡短且無空格的路徑,例如 `D:\projects` 或 `C:\Dev`。
- **專案名稱**: 使用英文小寫,單字間用連字號 `-` 分隔 (kebab-case),例如 `my-web-app` 或 `video-subtitle-tool`。

### 建立新專案範例
```powershell
# 進入總專案目錄
cd D:\projects

# 建立新專案資料夾
mkdir my-new-project

# 進入該資料夾
cd my-new-project
```

---

## 3. 安裝 GitHub CLI (選用但強烈建議)

**GitHub CLI** (簡稱 `gh`) 是 GitHub 官方推出的命令列工具,可以大幅簡化帳號串接與倉庫管理流程。

### 為什麼需要 GitHub CLI?
這就是您之前提到的「Hybrid 連接器」!它的優勢包括:

- **快速帳號驗證**: 執行 `gh auth login` 自動開啟瀏覽器登入,無需手動設定 SSH 金鑰或 Personal Access Token。
- **一鍵建立倉庫**: 直接在終端機建立 GitHub 倉庫,不用切換到網頁操作。
- **簡化日常操作**: 查看 Pull Request、Issues 等都可以在終端機完成。

### 檢查是否已安裝
```powershell
gh --version
```

### 安裝步驟 (使用 winget)
```powershell
# 安裝 GitHub CLI
winget install --id GitHub.cli

# 安裝完成後,重新啟動終端機
# 驗證安裝
gh --version
```

### 登入 GitHub 帳號
```powershell
# 執行登入指令
gh auth login

# 按照提示選擇:
# 1. GitHub.com (不是 GitHub Enterprise)
# 2. HTTPS (推薦)
# 3. Yes (登入 Git 認證)
# 4. Login with a web browser (用瀏覽器登入)
# 5. 複製顯示的代碼,按 Enter 開啟瀏覽器
# 6. 在瀏覽器中貼上代碼並授權
```

完成後,您的 Git 和 GitHub 帳號就完全串接好了!

---

## 4. GitHub 倉庫連結方式

有三種方式可以將本地專案連結到 GitHub,您可以選擇其中一種:

### 方式 A: 使用 GitHub CLI (推薦,更快速)

```powershell
# 1. 進入專案資料夾
cd D:\projects\my-new-project

# 2. 初始化 Git (如果尚未初始化)
git init

# 3. 加入檔案並提交
git add .
git commit -m "Initial commit"

# 4. 使用 gh 建立倉庫並推送 (一次完成!)
gh repo create my-new-project --public --source=. --push
# 或使用 --private 建立私有倉庫
```

這個指令會自動:
- 在您的 GitHub 帳號建立倉庫
- 設定 remote origin
- 推送程式碼到 GitHub

### 方式 B: 傳統方式 (手動操作)

這是昨天 (2025-12-01) 學習的方法:

#### 第一步: 在 GitHub 建立倉庫
1. 登入 [GitHub 網站](https://github.com)。
2. 點擊右上角的 **+** 號 -> **New repository**。
3. **Repository name**: 輸入專案名稱 (建議與本地資料夾名稱一致)。
4. **Visibility**: 選擇 Public (公開) 或 Private (私有)。
5. 點擊 **Create repository**。
6. **重要**: 保留頁面開啟,複製 "HTTPS" 的網址 (例如 `https://github.com/username/repo-name.git`)。

#### 第二步: 初始化本地倉庫 (Local Repository)
在 VS Code 或終端機中,確保位於專案資料夾內:

```powershell
# 1. 初始化 Git
git init

# 2. 加入所有檔案到暫存區
git add .

# 3. 提交第一次變更
git commit -m "Initial commit"
```

#### 第三步: 連結遠端倉庫 (Remote)
將剛才複製的 GitHub 網址貼上:

```powershell
# 將 GitHub 倉庫設定為 'origin'
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 驗證是否連結成功
git remote -v
```

#### 第四步: 推送到 GitHub (與帳號驗證)
```powershell
# 推送程式碼到 main 分支
git push -u origin main
```

**關於帳號驗證 (Authentication):**
- 當你第一次執行 `git push` 時,Windows 會跳出 **Git Credential Manager** 的視窗。
- 選擇 **"Sign in with your browser"** (用瀏覽器登入)。
- 在瀏覽器中授權後,Git 就會記住你的權限,未來不需要每次都輸入密碼。

### 方式 C: SSH 金鑰方式 (進階,一次設定永久有效)

SSH 方式的優點是設定完成後,**完全不需要每次都驗證帳號**,適合經常使用 Git 的開發者。

#### 第一步: 生成 SSH 金鑰
```powershell
# 生成新的 SSH 金鑰 (請替換成您的 GitHub 註冊信箱)
ssh-keygen -t ed25519 -C "your_email@example.com"

# 按照提示:
# 1. 儲存位置: 直接按 Enter (使用預設路徑 C:\Users\您的使用者名稱\.ssh\id_ed25519)
# 2. Passphrase: 可以直接按 Enter (不設密碼) 或輸入密碼增加安全性
```

#### 第二步: 啟動 SSH Agent 並加入金鑰
```powershell
# 啟動 SSH Agent
Start-Service ssh-agent

# 加入 SSH 私鑰
ssh-add C:\Users\您的使用者名稱\.ssh\id_ed25519
```

#### 第三步: 複製公鑰到 GitHub
```powershell
# 顯示公鑰內容 (複製整段輸出)
Get-Content C:\Users\您的使用者名稱\.ssh\id_ed25519.pub
```

然後到 GitHub 網站:
1. 點擊右上角頭像 -> **Settings**
2. 左側選單選擇 **SSH and GPG keys**
3. 點擊 **New SSH key**
4. **Title**: 輸入識別名稱 (例如: "My Windows PC")
5. **Key**: 貼上剛才複製的公鑰內容
6. 點擊 **Add SSH key**

#### 第四步: 測試連接
```powershell
# 測試 SSH 連接
ssh -T git@github.com

# 如果成功,會顯示: Hi 您的使用者名稱! You've successfully authenticated...
```

#### 第五步: 使用 SSH 連接倉庫
```powershell
# 方法 1: 建立新倉庫時使用 SSH
# 在 GitHub 建立倉庫後,複製 SSH 網址 (格式: git@github.com:username/repo.git)

git init
git add .
git commit -m "Initial commit"
git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main

# 方法 2: 將現有的 HTTPS 倉庫改為 SSH
git remote set-url origin git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git
```

**SSH 方式的優缺點:**
- ✅ 優點: 設定完成後永久有效,不需要每次驗證
- ✅ 優點: 更安全,使用加密金鑰而非密碼
- ❌ 缺點: 初次設定較複雜
- ❌ 缺點: 如果換電腦需要重新設定

---

## 三種方式比較表

| 方式 | 難度 | 速度 | 適合對象 |
|------|------|------|----------|
| **A. GitHub CLI** | ⭐ 簡單 | ⚡ 最快 | 所有人,特別是新手 |
| **B. HTTPS 傳統** | ⭐⭐ 中等 | ⚡⚡ 中等 | 想了解完整流程的人 |
| **C. SSH 金鑰** | ⭐⭐⭐ 較難 | ⚡⚡⚡ 初次慢,之後最快 | 經常使用 Git 的開發者 |

**建議:**
- 如果您是新手或想要最快速的方式 → 選擇 **方式 A (GitHub CLI)**
- 如果您想要深入理解 Git 運作 → 選擇 **方式 B (HTTPS)**
- 如果您每天都會用 Git,想要一勞永逸 → 選擇 **方式 C (SSH)**

---

## 5. 日常業務執行流程 (SOP)

以後每次開發新功能或結束一天的工作時,請執行以下步驟:

1. **修改程式碼** (在 Antigravity 中完成)。
2. **儲存檔案**。
3. **執行 Git 同步指令**:

```powershell
# 1. 加入變更
git add .

# 2. 提交並說明做了什麼 (例如: 更新首頁設計)
git commit -m "Update homepage design"

# 3. 推送到雲端
git push
```

---

## 常見問題

- **Q: 如果 `git push` 失敗並顯示 "remote contains work that you do not have locally"?**
  - A: 這通常發生在你在 GitHub 網頁上修改了檔案,但本地沒有更新。請先執行 `git pull` 拉取最新變更。

- **Q: 如何確認目前連結的是哪個 GitHub 帳號?**
  - A: 執行 `git config user.name` 和 `git config user.email` 查看設定。

- **Q: GitHub CLI 和傳統方式有什麼差別?**
  - A: GitHub CLI (`gh`) 可以一行指令完成建立倉庫+推送,傳統方式需要先去網頁建立倉庫再手動設定 remote。兩種方式最終效果相同,CLI 更快速方便。

- **Q: 什麼是 "Hybrid 連接器"?**
  - A: 這是您對 GitHub CLI 的稱呼。它之所以被稱為 "Hybrid",是因為它結合了命令列操作和瀏覽器驗證,提供最便捷的 GitHub 整合體驗。
