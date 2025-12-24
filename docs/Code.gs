/**
 * 美業排課系統 - Google Apps Script 後端程式碼 (v8.0)
 * 
 * 更新說明：
 * - v8.0: 支援多地區 (台北/台中/高雄) 切換不同的試算表
 * - v7.0: 修正狀態回傳字串為 'OCCUPIED'
 */

// --- 多地區試算表設定 ---
const SHEET_IDS = {
  '台北伊美': '1K5l3ofWxalR_BKFaB_6HUS-gs-DkuZDiuofNV8u4Lt0',
  '台中伊美': '1pRPoCp1g3nbQxI2OS2nWZIU18QcCKP7lmGQtRqHz3JI',
  '高雄伊美': '1REzFujCbLfxNMEhhyiPYiczhoo4-M-44hHBnlB5c2Us'
};

// 預設使用台中 (若未傳入 location)
const DEFAULT_LOCATION = '台中伊美';

// --- HTTP 處理 ---

function doGet(e) {
  const action = (e && e.parameter) ? e.parameter.action : null;
  const location = (e && e.parameter) ? (e.parameter.location || DEFAULT_LOCATION) : DEFAULT_LOCATION;

  // 1. 只有當 action 是已知的 API 指令時才處理 API 請求
  const recognizedActions = ['getTeachers', 'getContents', 'getSchedule'];
  
  if (action && recognizedActions.includes(action)) {
    if (action === 'getTeachers') return getTeacherList(location);
    if (action === 'getContents') return getContentList(location);
    if (action === 'getSchedule') return getDaySchedule(e.parameter.date, e.parameter.subject, location);
  }

  // 2. 否則，一律回傳前端 UI 介面
  try {
    return HtmlService.createTemplateFromFile('Frontend')
        .evaluate()
        .setTitle('美業教室排課系統 v2.0')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (error) {
    return ContentService.createTextOutput("系統錯誤：在 GAS 專案中找不到名為 『Frontend』 的 HTML 檔案。\n\n請依照手冊說明，在 GAS 中點擊 「+」 -> 「HTML」，建立一個名為 Frontend 的檔案，並貼入 docs/Frontend.html 的內容。");
  }
}

function doPost(e) {
  if (!e || !e.postData) return ContentService.createTextOutput("無 Post Data");
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    const location = data.location || DEFAULT_LOCATION;

    if (action === 'submitBooking') return successResponse(submitBooking(data)); // data 內含 location
    if (action === 'addTeacher') return successResponse(addTeacher(data.name, location));
    if (action === 'addContent') return successResponse(addCourseContent(data.content, location));
    
    throw new Error('Unknown action: ' + action);
  } catch (error) {
    return successResponse({ success: false, message: error.message });
  }
}

// --- 核心功能 ---

// 取得指定地區的 Spreadsheet 物件
function getSS(location) {
  const id = SHEET_IDS[location];
  if (!id) throw new Error(`找不到該地區 (${location}) 的試算表 ID`);
  return SpreadsheetApp.openById(id);
}

function getTeacherList(location) { return successResponse(getListFromSheet(location, 'Settings', 'Teachers')); }
function getContentList(location) { return successResponse(getListFromSheet(location, 'Settings', 'Contents')); }

function addTeacher(name, location) { return appendToList(location, 'Settings', 'Teachers', name, '老師'); }
function addCourseContent(content, location) { return appendToList(location, 'Settings', 'Contents', content, '課程內容'); }

function getDaySchedule(dateStr, subject, location) {
  const date = new Date(dateStr);
  const day = date.getDay();
  
  // 定義標準時段
  let slots = [
    '10:00-11:00', '11:00-12:00', '12:00-13:00', '13:00-14:00', '14:00-15:00',
    '15:00-16:00', '16:00-17:00', '17:00-18:00', '18:00-19:00', '19:00-20:00', '20:00-21:00'
  ];
  if (day === 5 || day === 0) slots = slots.slice(0, 7); // 週五/日提早結束

  // --- 讀取 Sheet 狀態 ---
  const occupancyMap = checkOccupancy(date, subject, slots, location);
  
  const responseData = slots.map(time => {
    const isOccupied = occupancyMap[time] !== undefined;
    return {
      time: time,
      status: isOccupied ? 'OCCUPIED' : 'AVAILABLE',
      occupiedBy: isOccupied ? occupancyMap[time] : null 
    };
  });

  return successResponse(responseData);
}

function checkOccupancy(date, subject, slots, location) {
  const roYear = date.getFullYear() - 1911;
  const month = date.getMonth() + 1;
  const sheetName = `${roYear}/${month}`;
  
  const ss = getSS(location);
  const sheet = ss.getSheetByName(sheetName);
  const map = {}; 
  
  if (!sheet) return map;

  // 1. 搜尋日期
  const dateStrShort = `${month}月${date.getDate()}日`;
  const textFinder = sheet.createTextFinder(dateStrShort);
  const dateCell = textFinder.findNext();
  
  if (!dateCell) return map;

  const startRow = dateCell.getRow();
  const startCol = dateCell.getColumn();

  // 2. 搜尋科目欄位
  const headerRange = sheet.getRange(startRow, startCol, 1, 10);
  const headerValues = headerRange.getDisplayValues()[0];
  
  let subjectOffset = -1;
  for (let i = 0; i < headerValues.length; i++) {
    if (headerValues[i].includes(subject)) {
      subjectOffset = i;
      break;
    }
  }
  
  if (subjectOffset === -1) return map;

  // 3. 掃描時段
  const range = sheet.getRange(startRow + 1, startCol, 25, subjectOffset + 1);
  const values = range.getDisplayValues(); 
  
  for (let r = 0; r < values.length; r++) {
    const timeLabel = values[r][0].replace(/\s/g, ''); 
    const cellContent = values[r][subjectOffset];
    
    const matchedSlot = slots.find(s => timeLabel.includes(s.replace(/\s/g, '')));
    
    if (matchedSlot) {
      if (cellContent && cellContent.trim() !== '') {
        map[matchedSlot] = cellContent; 
      }
    }
  }
  
  return map;
}

function submitBooking(data) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const location = data.location || DEFAULT_LOCATION;

    logBooking(data, location); 
    
    const writeResult = writeToMainSchedule(data, location); 
    
    if (writeResult.success) return { success: true, message: '預約成功！' };
    else return { success: true, message: '預約已記錄 (Log)，但寫入主表失敗：' + writeResult.message };
    
  } catch (e) {
    return { success: false, message: '預約失敗：' + e.message };
  } finally {
    lock.releaseLock();
  }
}

function writeToMainSchedule(data, location) {
  const { date, time, subject, teacherName, courseContent } = data;
  const d = new Date(date);
  const roYear = d.getFullYear() - 1911;
  const month = d.getMonth() + 1;
  const sheetName = `${roYear}/${month}`;
  
  const ss = getSS(location);
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { success: false, message: `找不到工作表 ${sheetName}` };

  const dateStrShort = `${month}月${d.getDate()}日`;
  const textFinder = sheet.createTextFinder(dateStrShort);
  const dateCell = textFinder.findNext();
  
  if (!dateCell) return { success: false, message: `找不到日期: ${dateStrShort}` };
  
  const startRow = dateCell.getRow();
  const startCol = dateCell.getColumn();
  
  const headerRange = sheet.getRange(startRow, startCol, 1, 10);
  const headerValues = headerRange.getDisplayValues()[0];
  let subjectOffset = -1;
  for (let i = 0; i < headerValues.length; i++) {
    if (headerValues[i].includes(subject)) {
      subjectOffset = i;
      break;
    }
  }
  if (subjectOffset === -1) return { success: false, message: `找不到科目: ${subject}` };

  const timeClean = time.replace(/\s/g, ''); 
  const timeRange = sheet.getRange(startRow + 1, startCol, 25, 1);
  const timeValues = timeRange.getDisplayValues();
  
  let timeRowOffset = -1;
  for (let i = 0; i < timeValues.length; i++) {
    if (timeValues[i][0].replace(/\s/g, '').includes(timeClean)) {
      timeRowOffset = i + 1; 
      break;
    }
  }
  
  if (timeRowOffset === -1) return { success: false, message: `找不到時段: ${time}` };
  
  const targetRow = startRow + timeRowOffset;
  const targetCol = startCol + subjectOffset;
  
  const cell = sheet.getRange(targetRow, targetCol);
  const currentVal = cell.getValue();
  
  if (currentVal && currentVal.toString().trim() !== '') {
     return { success: false, message: '該時段已被預約！' };
  }

  const newVal = `${teacherName}(${courseContent})`;
  cell.setValue(newVal);
  return { success: true };
}

function logBooking(data, location) {
  const ss = getSS(location);
  let sheet = ss.getSheetByName('Booking_Logs');
  if (!sheet) {
    sheet = ss.insertSheet('Booking_Logs');
    sheet.appendRow(['Timestamp', 'Date', 'Time', 'Subject', 'Location', 'Teacher', 'Count', 'Content']);
  }
  sheet.appendRow([new Date(), data.date, data.time, data.subject, data.location, data.teacherName, data.studentCount, data.courseContent]);
}

function getListFromSheet(location, n, t) {
  const ss = getSS(location);
  let s = ss.getSheetByName(n);
  if (!s) { s = ss.insertSheet(n); s.appendRow(['Type', 'Value']); }
  return s.getDataRange().getValues().filter(r => r[0] === t).map(r => r[1]);
}

function appendToList(location, n, t, v, desc) {
  const ss = getSS(location);
  let s = ss.getSheetByName(n);
  if (!s) { s = ss.insertSheet(n); s.appendRow(['Type', 'Value']); }
  const d = s.getDataRange().getValues();
  if (d.some(r => r[0] === t && r[1] === v)) return { success: false, message: '已存在' };
  s.appendRow([t, v]);
  return { success: true, message: `成功新增${desc}` };
}

function successResponse(d) { return ContentService.createTextOutput(JSON.stringify(d)).setMimeType(ContentService.MimeType.JSON); }
