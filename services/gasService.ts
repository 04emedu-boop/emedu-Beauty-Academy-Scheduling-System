import { BookingRequest, ApiResponse, TimeSlotData, Subject, Location } from '../types';

// GAS Web App URL 配置
// 優先順序: 1. 環境變數 (部署時) 2. localStorage (開發/測試) 3. 空字串
const GAS_WEB_APP_URL = import.meta.env.VITE_GAS_WEB_APP_URL ||
    localStorage.getItem('gas_web_app_url') ||
    '';

/**
 * Service to interact with the real Google Apps Script backend
 */

/**
 * 驗證是否為有效的 GAS Web App URL (macros/s/...)
 * 如果是 Google Sheet 的網址 (spreadsheets/d/...) 則會回傳錯誤訊息
 */
export const validateGasUrl = (url: string): { isValid: boolean; error?: string } => {
    if (!url) return { isValid: false, error: '請輸入 Web App URL' };

    try {
        const urlObj = new URL(url);
        if (urlObj.hostname !== 'script.google.com') {
            return { isValid: false, error: '網址必須來自 script.google.com' };
        }
        if (!urlObj.pathname.includes('/macros/s/')) {
            if (urlObj.pathname.includes('/spreadsheets/d/')) {
                return { isValid: false, error: '偵測到 Google 試算表網址！請填入 GAS 「部署」後的網址' };
            }
            return { isValid: false, error: '格式不正確，需包含 /macros/s/' };
        }
        return { isValid: true };
    } catch {
        return { isValid: false, error: '無效的網址格式' };
    }
};


// Helper to handle fetch requests (POST)
const callGasApi = async (data: any): Promise<any> => {
    if (!GAS_WEB_APP_URL) {
        throw new Error('請先設定 Web App URL');
    }

    // Using POST with text/plain to avoid preflight (which GAS doesn't support)
    try {
        const validation = validateGasUrl(GAS_WEB_APP_URL);
        if (!validation.isValid) {
            throw new Error(validation.error);
        }

        const response = await fetch(GAS_WEB_APP_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`連線失敗: ${response.statusText} (${response.status})`);
        }

        const text = await response.text();
        try {
            return JSON.parse(text);
        } catch {
            if (text.includes('<!DOCTYPE html>') || text.includes('<html')) {
                throw new Error('伺服器回傳了 HTML 而非 JSON。請檢查 GAS 網址是否正確，且已發布為「所有人」皆可存取。');
            }
            throw new Error('無法解析伺服器回傳的資料 (JSON Parsing Error)');
        }
    } catch (error: any) {
        console.error('GAS API Error:', error);
        throw error;
    }
};

// Helper to handle fetch requests (GET)
const callGasApiGet = async (params: Record<string, string>): Promise<any> => {
    if (!GAS_WEB_APP_URL) return [];

    try {
        const validation = validateGasUrl(GAS_WEB_APP_URL);
        if (!validation.isValid) {
            throw new Error(validation.error);
        }

        const url = new URL(GAS_WEB_APP_URL);
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

        // GAS Web App redirects for ContentService JSON, so we need typical fetch behavior
        const response = await fetch(url.toString());
        if (!response.ok) {
            throw new Error(`連線失敗: ${response.statusText} (${response.status})`);
        }

        const text = await response.text();
        try {
            return JSON.parse(text);
        } catch {
            if (text.includes('<!DOCTYPE html>') || text.includes('<html')) {
                throw new Error('伺服器回傳了 HTML 而非 JSON。您可能填入了錯誤的網址（例如試算表連結）。');
            }
            throw new Error('讀取資料失敗 (格式錯誤)');
        }
    } catch (error: any) {
        console.error('GAS GET Error:', error);
        // Re-throw the error so App.tsx can show usefull message
        throw error;
    }
};

export const fetchTeachers = async (location: string): Promise<string[]> => {
    if (!GAS_WEB_APP_URL) return [];
    try {
        // Allow error to propagate
        const response = await callGasApiGet({ action: 'getTeachers', location });
        // Ensure response is an array
        return Array.isArray(response) ? response : [];
    } catch (e) {
        console.error('fetchTeachers failed', e);
        return [];
    }
};

export const addTeacher = async (name: string, location: string): Promise<ApiResponse> => {
    return await callGasApi({ action: 'addTeacher', name, location });
};

export const fetchCourseContents = async (location: string): Promise<string[]> => {
    if (!GAS_WEB_APP_URL) return [];
    try {
        const response = await callGasApiGet({ action: 'getContents', location });
        return Array.isArray(response) ? response : [];
    } catch (e) {
        console.error('fetchCourseContents failed', e);
        return [];
    }
};

export const addCourseContent = async (content: string, location: string): Promise<ApiResponse> => {
    return await callGasApi({ action: 'addContent', content, location });
};

export const fetchDaySchedule = async (date: string, subject: Subject, location: Location): Promise<TimeSlotData[]> => {
    if (!GAS_WEB_APP_URL) return [];

    try {
        const response = await callGasApiGet({
            action: 'getSchedule',
            date,
            subject,
            location
        });
        return Array.isArray(response) ? response : [];
    } catch (e) {
        console.error('fetchDaySchedule failed', e);
        return [];
    }
};

export const submitBooking = async (request: BookingRequest): Promise<ApiResponse> => {
    return await callGasApi({
        action: 'submitBooking',
        ...request
    });
};
