import { BookingRequest, ApiResponse, TimeSlotData, Subject, Location } from '../types';

// GAS Web App URL 配置
// 優先順序: 1. 環境變數 (部署時) 2. localStorage (開發/測試) 3. 空字串
const GAS_WEB_APP_URL = import.meta.env.VITE_GAS_WEB_APP_URL ||
    localStorage.getItem('gas_web_app_url') ||
    '';

/**
 * Service to interact with the real Google Apps Script backend
 */

// Helper to handle fetch requests (POST)
const callGasApi = async (data: any): Promise<any> => {
    if (!GAS_WEB_APP_URL) {
        throw new Error('請先設定 Web App URL');
    }

    // Using POST with text/plain to avoid preflight (which GAS doesn't support)
    try {
        // Validate URL first
        try {
            new URL(GAS_WEB_APP_URL);
        } catch {
            throw new Error('無效的 Web App URL');
        }

        const response = await fetch(GAS_WEB_APP_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`Connection failed: ${response.statusText}`);
        }

        const json = await response.json();
        return json;
    } catch (error) {
        console.error('GAS API Error:', error);
        throw error;
    }
};

// Helper to handle fetch requests (GET)
const callGasApiGet = async (params: Record<string, string>): Promise<any> => {
    if (!GAS_WEB_APP_URL) return [];

    try {
        const url = new URL(GAS_WEB_APP_URL);
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

        // GAS Web App redirects for ContentService JSON, so we need typical fetch behavior
        const response = await fetch(url.toString());
        if (!response.ok) {
            throw new Error(`Connection failed: ${response.statusText} (${response.status})`);
        }
        const json = await response.json();
        return json;
    } catch (error) {
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
