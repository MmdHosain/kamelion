// src/utils/jalaliDateUtils.js

export const PERSIAN_MONTH_NAMES = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

export const PERSIAN_WEEKDAY_NAMES = [
  { key: 'SAT', short: 'ش', full: 'شنبه' },
  { key: 'SUN', short: 'ی', full: 'یکشنبه' },
  { key: 'MON', short: 'د', full: 'دوشنبه' },
  { key: 'TUE', short: 'س', full: 'سه‌شنبه' },
  { key: 'WED', short: 'چ', full: 'چهارشنبه' },
  { key: 'THU', short: 'پ', full: 'پنج‌شنبه' },
  { key: 'FRI', short: 'ج', full: 'جمعه' },
];

/**
 * Standard Gregorian to Jalali conversion algorithm
 */
export function gregorianToJalali(gy, gm, gd) {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    355666 +
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) +
    gd +
    g_d_m[gm - 1];
  let jy = -1595 + 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let jm, jd;
  if (days < 186) {
    jm = 1 + Math.floor(days / 31);
    jd = 1 + (days % 31);
  } else {
    jm = 7 + Math.floor((days - 186) / 30);
    jd = 1 + ((days - 186) % 30);
  }
  return { jy, jm, jd };
}

/**
 * Standard Jalali to Gregorian conversion algorithm
 */
export function jalaliToGregorian(jy, jm, jd) {
  const jy_adj = jy - 979;
  let j_day_no =
    365 * jy_adj +
    Math.floor(jy_adj / 33) * 8 +
    Math.floor(((jy_adj % 33) + 3) / 4);

  for (let i = 0; i < jm - 1; ++i) {
    j_day_no += i < 6 ? 31 : 30;
  }
  j_day_no += jd - 1;

  let g_day_no = j_day_no + 79;

  let gy =
    1600 + 400 * Math.floor(g_day_no / 146097);
  g_day_no = g_day_no % 146097;

  let leap = true;
  if (g_day_no >= 36525) {
    g_day_no--;
    gy += 100 * Math.floor(g_day_no / 36524);
    g_day_no = g_day_no % 36524;

    if (g_day_no >= 365) {
      g_day_no++;
    } else {
      leap = false;
    }
  }

  gy += 4 * Math.floor(g_day_no / 1461);
  g_day_no %= 1461;

  if (g_day_no >= 366) {
    leap = false;
    g_day_no--;
    gy += Math.floor(g_day_no / 365);
    g_day_no = g_day_no % 365;
  }

  const g_days_in_month = [
    31,
    leap ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  let gm = 0;
  while (gm < 12 && g_day_no >= g_days_in_month[gm]) {
    g_day_no -= g_days_in_month[gm];
    gm++;
  }

  return { gy, gm: gm + 1, gd: g_day_no + 1 };
}

/**
 * Returns number of days in a given Jalali month (1-12)
 */
export function getDaysInJalaliMonth(jy, jm) {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  return isJalaliLeapYear(jy) ? 30 : 29;
}

/**
 * Checks if a Jalali year is leap year
 */
export function isJalaliLeapYear(jy) {
  const breaks = [
    -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097,
    2192, 2262, 2324, 2394, 2456, 3178,
  ];
  let jp = breaks[0];
  let jump = 0;
  for (let j = 1; j < breaks.length; j += 1) {
    const jm = breaks[j];
    jump = jm - jp;
    if (jy < jm) break;
    jp = jm;
  }
  let n = jy - jp;
  if (n < 0) n += 1000;
  return (n % 33) % 4 === 1;
}

/**
 * Converts Date object to Jalali object { jy, jm, jd }
 */
export function dateToJalali(date = new Date()) {
  return gregorianToJalali(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  );
}

/**
 * Converts Jalali { jy, jm, jd } to JS Date object
 */
export function jalaliToDate(jy, jm, jd) {
  const { gy, gm, gd } = jalaliToGregorian(jy, jm, jd);
  return new Date(gy, gm - 1, gd);
}

/**
 * Formats Date object to Gregorian YYYY-MM-DD for backend API
 */
export function formatDateForApi(date) {
  if (!date) return '';
  const gy = date.getFullYear();
  const gm = String(date.getMonth() + 1).padStart(2, '0');
  const gd = String(date.getDate()).padStart(2, '0');
  return `${gy}-${gm}-${gd}`;
}

/**
 * Gets Jalali day-of-week index (0 = شنبه Saturday, 1 = یکشنبه, ..., 6 = جمعه Friday)
 */
export function getJalaliDayOfWeekIndex(date) {
  const jsDay = date.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  // Convert: Sat(6) -> 0, Sun(0) -> 1, Mon(1) -> 2, ..., Fri(5) -> 6
  return (jsDay + 1) % 7;
}

/**
 * Format date in full Persian string (e.g. "دوشنبه، ۴ شهریور ۱۴۰۵")
 */
export function formatJalaliDisplay(date, showWeekday = true) {
  if (!date) return '';
  const { jy, jm, jd } = dateToJalali(date);
  const monthName = PERSIAN_MONTH_NAMES[jm - 1];
  const weekdayIndex = getJalaliDayOfWeekIndex(date);
  const weekdayName = PERSIAN_WEEKDAY_NAMES[weekdayIndex].full;

  if (showWeekday) {
    return `${weekdayName}، ${jd} ${monthName} ${jy}`;
  }
  return `${jd} ${monthName} ${jy}`;
}

/**
 * Converts Persian numbers to English if needed
 */
export function toPersianDigits(num) {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/\d/g, (x) => persianDigits[Number(x)]);
}
