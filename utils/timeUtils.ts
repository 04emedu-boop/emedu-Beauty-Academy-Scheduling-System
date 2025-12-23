import { TIME_SLOTS_WEEKDAY, TIME_SLOTS_FRIDAY_SUNDAY, TIME_SLOTS_HOLIDAY, PUBLIC_HOLIDAYS, PUBLIC_HOLIDAY_MAP } from '../constants';

/**
 * 判斷日期是否為國定假日
 * @param dateStr - 日期字串 (YYYY-MM-DD)
 * @returns 是否為國定假日
 */
export const isPublicHoliday = (dateStr: string): boolean => {
    return PUBLIC_HOLIDAYS.includes(dateStr);
};

/**
 * 根據日期取得可用時段
 * @param dateStr - 日期字串 (YYYY-MM-DD)
 * @returns 該日期可用的時段陣列
 */
export const getAvailableTimeSlots = (dateStr: string): string[] => {
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay(); // 0=週日, 1=週一, ..., 6=週六

    // 週六或國定假日 (公休但開放登記)
    if (dayOfWeek === 6 || isPublicHoliday(dateStr)) {
        return TIME_SLOTS_HOLIDAY;
    }

    // 週五或週日 (10:00-17:00)
    if (dayOfWeek === 5 || dayOfWeek === 0) {
        return TIME_SLOTS_FRIDAY_SUNDAY;
    }

    // 週一至週四 (10:00-21:00)
    return TIME_SLOTS_WEEKDAY;
};

/**
 * 判斷日期是否為公休日(週六或國定假日)
 * @param dateStr - 日期字串 (YYYY-MM-DD)
 * @returns 是否為公休日
 */
/**
 * 判斷日期是否為公休日(週六或國定假日)
 * @param dateStr - 日期字串 (YYYY-MM-DD)
 * @returns 是否為公休日
 */
export const isClosedDay = (dateStr: string): boolean => {
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 6 || isPublicHoliday(dateStr);
};

/**
 * 判斷日期是否允許預約 (即使是公休日，若有開放登記則為 true)
 * 目前邏輯：週六與國定假日雖然是公休日，但仍開放登記
 * @param dateStr - 日期字串 (YYYY-MM-DD)
 * @returns 是否允許預約
 */
export const isBookingAllowed = (dateStr: string): boolean => {
    // 國定假日不可預約
    if (isPublicHoliday(dateStr)) {
        return false;
    }
    // 其他日子 (包含週六) 允許預約
    return true;
};

/**
 * 取得日期的星期文字
 * @param dateStr - 日期字串 (YYYY-MM-DD)
 * @returns 星期文字
 */
export const getDayOfWeekText = (dateStr: string): string => {
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();
    const days = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
    return days[dayOfWeek];
};

/**
 * 取得營業時間文字說明
 * @param dateStr - 日期字串 (YYYY-MM-DD)
 * @returns 營業時間說明
 */
export const getBusinessHoursText = (dateStr: string): string => {
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();

    if (dayOfWeek === 6 || isPublicHoliday(dateStr)) {
        return '公休日 (開放登記)';
    }

    if (dayOfWeek === 5 || dayOfWeek === 0) {
        return '10:00-17:00';
    }

    return '10:00-21:00';
};

/**
 * 取得國定假日名稱
 * @param dateStr - 日期字串 (YYYY-MM-DD)
 * @returns 假日名稱,如果不是國定假日則返回 null
 */
export const getHolidayName = (dateStr: string): string | null => {
    return PUBLIC_HOLIDAY_MAP[dateStr] || null;
};

/**
 * 取得公休日警告訊息
 * @param dateStr - 日期字串 (YYYY-MM-DD)
 * @returns 警告訊息物件,包含標題和內容
 */
export const getClosedDayMessage = (dateStr: string): { title: string; message: string } => {
    const holidayName = getHolidayName(dateStr);

    if (holidayName) {
        return {
            title: '公休日提醒',
            message: `此日期為國定假日(${holidayName})，暫停預約。`
        };
    } else {
        return {
            title: '週六提醒',
            message: '週六為公休日，但仍開放登記。'
        };
    }
};
