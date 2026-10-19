// src/components/ui/DateOfBirthInput.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CalendarDays,
  Sparkles,
  AlertCircle,
  HelpCircle,
  ListFilter,
  Keyboard,
} from 'lucide-react';
import {
  PERSIAN_MONTH_NAMES,
  dateToJalali,
  jalaliToGregorian,
  gregorianToJalali,
  getDaysInJalaliMonth,
  toPersianDigits,
} from '../../utils/jalaliDateUtils';

export const toEnglishDigits = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
    .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
};

const GREGORIAN_MONTHS = [
  { id: 1, name: 'ژانویه (January)' },
  { id: 2, name: 'فوریه (February)' },
  { id: 3, name: 'مارس (March)' },
  { id: 4, name: 'آوریل (April)' },
  { id: 5, name: 'مه (May)' },
  { id: 6, name: 'ژوئن (June)' },
  { id: 7, name: 'ژوئیه (July)' },
  { id: 8, name: 'اوت (August)' },
  { id: 9, name: 'سپتامبر (September)' },
  { id: 10, name: 'اکتبر (October)' },
  { id: 11, name: 'نوامبر (November)' },
  { id: 12, name: 'دسامبر (December)' },
];

export const calculateAge = (birthDate) => {
  if (!birthDate || isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
};

const getDaysInGregorianMonth = (year, month) => {
  if (!year || !month) return 31;
  return new Date(year, month, 0).getDate();
};

export default function DateOfBirthInput({
  value = '',
  onChange,
  error: externalError = '',
  required = true,
  disabled = false,
  className = '',
}) {
  const [calendarType, setCalendarType] = useState('jalali'); // 'jalali' | 'gregorian'
  const [inputMode, setInputMode] = useState('segmented'); // 'segmented' | 'masked'

  const todayDate = useMemo(() => new Date(), []);
  const todayJalali = useMemo(() => dateToJalali(todayDate), [todayDate]);
  const currentJalaliYear = todayJalali.jy;
  const currentGregorianYear = todayDate.getFullYear();

  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDay, setSelectedDay] = useState('');

  const [maskedText, setMaskedText] = useState('');
  const [internalError, setInternalError] = useState('');
  const [calculatedAge, setCalculatedAge] = useState(null);
  const [conversionPreview, setConversionPreview] = useState('');

  // Sync state if external value (ISO YYYY-MM-DD) changes or is cleared
  useEffect(() => {
    if (!value) {
      setSelectedYear('');
      setSelectedMonth('');
      setSelectedDay('');
      setMaskedText('');
      setCalculatedAge(null);
      setConversionPreview('');
      setInternalError('');
      return;
    }

    const parts = String(value).split('T')[0].split('-').map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      const [gy, gm, gd] = parts;
      const birthDate = new Date(gy, gm - 1, gd);
      setCalculatedAge(calculateAge(birthDate));

      if (calendarType === 'jalali') {
        const j = gregorianToJalali(gy, gm, gd);
        setSelectedYear(String(j.jy));
        setSelectedMonth(String(j.jm));
        setSelectedDay(String(j.jd));
        setMaskedText(
          `${j.jy}/${String(j.jm).padStart(2, '0')}/${String(j.jd).padStart(2, '0')}`
        );
        setConversionPreview(`معادل میلادی: ${gy}-${String(gm).padStart(2, '0')}-${String(gd).padStart(2, '0')}`);
      } else {
        setSelectedYear(String(gy));
        setSelectedMonth(String(gm));
        setSelectedDay(String(gd));
        setMaskedText(
          `${gy}/${String(gm).padStart(2, '0')}/${String(gd).padStart(2, '0')}`
        );
        const j = gregorianToJalali(gy, gm, gd);
        setConversionPreview(`معادل شمسی: ${j.jy}/${String(j.jm).padStart(2, '0')}/${String(j.jd).padStart(2, '0')}`);
      }
    }
  }, [value, calendarType]);

  // Compute max days allowed for currently selected month and year
  const maxDays = useMemo(() => {
    const numYear = Number(selectedYear);
    const numMonth = Number(selectedMonth);

    if (calendarType === 'jalali') {
      if (!numMonth) return 31;
      return getDaysInJalaliMonth(numYear || 1400, numMonth);
    }

    if (!numMonth) return 31;
    return getDaysInGregorianMonth(numYear || 2000, numMonth);
  }, [calendarType, selectedYear, selectedMonth]);

  // Auto-correct Day if previously selected Day exceeds new month's max days
  useEffect(() => {
    if (selectedDay && Number(selectedDay) > maxDays) {
      setSelectedDay(String(maxDays));
    }
  }, [maxDays, selectedDay]);

  // Generate list of years (descending, covering ages 0 to ~105)
  const yearsList = useMemo(() => {
    const years = [];
    const startYear = calendarType === 'jalali' ? currentJalaliYear : currentGregorianYear;
    const endYear = startYear - 105;
    for (let y = startYear; y >= endYear; y--) {
      years.push(y);
    }
    return years;
  }, [calendarType, currentJalaliYear, currentGregorianYear]);

  // Validate and emit date to parent
  const evaluateAndEmit = useCallback(
    (yStr, mStr, dStr, isJalali) => {
      const y = Number(toEnglishDigits(yStr));
      const m = Number(toEnglishDigits(mStr));
      const d = Number(toEnglishDigits(dStr));

      if (!yStr || !mStr || !dStr) {
        setInternalError('');
        setCalculatedAge(null);
        setConversionPreview('');
        onChange?.('', {
          isValid: false,
          error: required ? 'لطفاً تاریخ تولد خود را کامل وارد کنید.' : '',
          age: null,
          isoString: '',
        });
        return;
      }

      // Month range check
      if (m < 1 || m > 12) {
        const err = 'ماه تولد باید بین ۱ تا ۱۲ باشد.';
        setInternalError(err);
        onChange?.('', { isValid: false, error: err });
        return;
      }

      // Days range check
      const allowableDays = isJalali
        ? getDaysInJalaliMonth(y, m)
        : getDaysInGregorianMonth(y, m);

      if (d < 1 || d > allowableDays) {
        const err = `روز انتخاب‌شده برای این ماه باید بین ۱ تا ${allowableDays} باشد.`;
        setInternalError(err);
        onChange?.('', { isValid: false, error: err });
        return;
      }

      // Year bounds check
      const minAllowedYear = isJalali ? currentJalaliYear - 115 : currentGregorianYear - 115;
      const maxAllowedYear = isJalali ? currentJalaliYear : currentGregorianYear;
      if (y < minAllowedYear || y > maxAllowedYear) {
        const err = isJalali
          ? `سال تولد باید بین ${minAllowedYear} تا ${maxAllowedYear} باشد.`
          : `سال تولد باید بین ${minAllowedYear} تا ${maxAllowedYear} باشد.`;
        setInternalError(err);
        onChange?.('', { isValid: false, error: err });
        return;
      }

      // Convert to Gregorian Date object and calculate ISO string
      let gy, gm, gd;
      if (isJalali) {
        const converted = jalaliToGregorian(y, m, d);
        gy = converted.gy;
        gm = converted.gm;
        gd = converted.gd;
      } else {
        gy = y;
        gm = m;
        gd = d;
      }

      const birthDate = new Date(gy, gm - 1, gd);
      const now = new Date();

      if (birthDate > now) {
        const err = 'تاریخ تولد نمی‌تواند در آینده باشد.';
        setInternalError(err);
        setCalculatedAge(null);
        onChange?.('', { isValid: false, error: err });
        return;
      }

      const age = calculateAge(birthDate);
      if (age === null || age < 0) {
        const err = 'تاریخ تولد وارد شده نامعتبر است.';
        setInternalError(err);
        setCalculatedAge(null);
        onChange?.('', { isValid: false, error: err });
        return;
      }

      const isoString = `${gy}-${String(gm).padStart(2, '0')}-${String(gd).padStart(2, '0')}`;
      setInternalError('');
      setCalculatedAge(age);

      if (isJalali) {
        setConversionPreview(`معادل میلادی: ${isoString}`);
      } else {
        const j = gregorianToJalali(gy, gm, gd);
        setConversionPreview(`معادل شمسی: ${j.jy}/${String(j.jm).padStart(2, '0')}/${String(j.jd).padStart(2, '0')}`);
      }

      onChange?.(isoString, {
        isValid: true,
        error: '',
        age,
        isoString,
        jalaliString: isJalali ? `${y}/${m}/${d}` : null,
      });
    },
    [
      required,
      currentJalaliYear,
      currentGregorianYear,
      onChange,
    ]
  );

  // Segmented input handlers
  const handleSegmentChange = (field, newVal) => {
    let nextY = selectedYear;
    let nextM = selectedMonth;
    let nextD = selectedDay;

    if (field === 'year') {
      nextY = newVal;
      setSelectedYear(newVal);
    } else if (field === 'month') {
      nextM = newVal;
      setSelectedMonth(newVal);
    } else if (field === 'day') {
      nextD = newVal;
      setSelectedDay(newVal);
    }

    if (nextY && nextM && nextD) {
      const formattedMasked = `${nextY}/${String(nextM).padStart(2, '0')}/${String(nextD).padStart(2, '0')}`;
      setMaskedText(formattedMasked);
    }

    evaluateAndEmit(nextY, nextM, nextD, calendarType === 'jalali');
  };

  // Masked typing input handler
  const handleMaskedInputChange = (e) => {
    const rawInput = e.target.value;
    const digitsOnly = toEnglishDigits(rawInput).replace(/\D/g, '').slice(0, 8);

    let formatted = digitsOnly;
    if (digitsOnly.length > 4 && digitsOnly.length <= 6) {
      formatted = `${digitsOnly.slice(0, 4)}/${digitsOnly.slice(4)}`;
    } else if (digitsOnly.length > 6) {
      formatted = `${digitsOnly.slice(0, 4)}/${digitsOnly.slice(4, 6)}/${digitsOnly.slice(6)}`;
    }

    setMaskedText(formatted);

    if (digitsOnly.length === 8) {
      const y = digitsOnly.slice(0, 4);
      const m = digitsOnly.slice(4, 6);
      const d = digitsOnly.slice(6, 8);

      setSelectedYear(y);
      setSelectedMonth(String(Number(m)));
      setSelectedDay(String(Number(d)));
      evaluateAndEmit(y, m, d, calendarType === 'jalali');
    } else {
      setInternalError('');
      setCalculatedAge(null);
      setConversionPreview('');
      onChange?.('', {
        isValid: false,
        error: required ? 'لطفاً تاریخ تولد را به صورت کامل وارد نمایید.' : '',
      });
    }
  };

  const displayError = externalError || internalError;

  return (
    <div className={`space-y-2 text-right ${className}`} dir="rtl">
      {/* Top Header: Label, Mode Switch & Calendar Switch */}
      <div className="flex items-center justify-between text-xs font-bold text-textDark/80 pr-1">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <CalendarDays className="w-4 h-4 text-primary shrink-0" />
          <span>تاریخ تولد</span>
          {required && <span className="text-rose-500 font-black" title="الزامی">*</span>}
        </label>

        <div className="flex items-center gap-2 text-[11px] font-bold text-textDark/60">
          {/* Calendar Type Toggle */}
          <button
            type="button"
            onClick={() => {
              const nextType = calendarType === 'jalali' ? 'gregorian' : 'jalali';
              setCalendarType(nextType);
              setSelectedYear('');
              setSelectedMonth('');
              setSelectedDay('');
              setMaskedText('');
              setCalculatedAge(null);
              setConversionPreview('');
              setInternalError('');
              onChange?.('', { isValid: false, error: '' });
            }}
            className="hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-1 bg-white/70 px-2 py-0.5 rounded-lg border border-primary/20"
            title="تغییر تقویم بین شمسی و میلادی"
          >
            <span>تقویم:</span>
            <span className="text-primary font-bold">
              {calendarType === 'jalali' ? 'شمسی' : 'Gregorian'}
            </span>
          </button>

          {/* Input Mode Toggle (Segmented Selectors vs Masked Input) */}
          <button
            type="button"
            onClick={() => setInputMode((prev) => (prev === 'segmented' ? 'masked' : 'segmented'))}
            className="hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-1 text-[11px] text-textDark/70 hover:underline"
            title={inputMode === 'segmented' ? 'تایپ مستقیم با کیبورد' : 'انتخاب از لیست کشویی'}
          >
            {inputMode === 'segmented' ? (
              <>
                <Keyboard className="w-3.5 h-3.5 text-primary" />
                <span>تایپ عددی</span>
              </>
            ) : (
              <>
                <ListFilter className="w-3.5 h-3.5 text-primary" />
                <span>انتخاب از لیست</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mode 1: Segmented Dropdown Selectors */}
      {inputMode === 'segmented' ? (
        <div className="grid grid-cols-3 gap-2">
          {/* Day Selector */}
          <div>
            <label className="block text-[10px] font-bold text-textDark/60 mb-1 pr-1">
              روز
            </label>
            <select
              value={selectedDay}
              disabled={disabled}
              onChange={(e) => handleSegmentChange('day', e.target.value)}
              className={`w-full bg-white/90 border p-3 rounded-xl text-xs md:text-sm text-textDark font-medium focus:outline-none focus:ring-2 transition-all shadow-inner cursor-pointer ${
                displayError
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                  : 'border-primary/30 focus:border-primary focus:ring-primary/20'
              }`}
              aria-label="روز تولد"
            >
              <option value="">روز</option>
              {Array.from({ length: maxDays }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  {calendarType === 'jalali' ? toPersianDigits(d) : d}
                </option>
              ))}
            </select>
          </div>

          {/* Month Selector */}
          <div>
            <label className="block text-[10px] font-bold text-textDark/60 mb-1 pr-1">
              ماه
            </label>
            <select
              value={selectedMonth}
              disabled={disabled}
              onChange={(e) => handleSegmentChange('month', e.target.value)}
              className={`w-full bg-white/90 border p-3 rounded-xl text-xs md:text-sm text-textDark font-medium focus:outline-none focus:ring-2 transition-all shadow-inner cursor-pointer ${
                displayError
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                  : 'border-primary/30 focus:border-primary focus:ring-primary/20'
              }`}
              aria-label="ماه تولد"
            >
              <option value="">ماه</option>
              {calendarType === 'jalali'
                ? PERSIAN_MONTH_NAMES.map((name, idx) => (
                    <option key={idx + 1} value={idx + 1}>
                      {name} ({toPersianDigits(idx + 1)})
                    </option>
                  ))
                : GREGORIAN_MONTHS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
            </select>
          </div>

          {/* Year Selector */}
          <div>
            <label className="block text-[10px] font-bold text-textDark/60 mb-1 pr-1">
              سال
            </label>
            <select
              value={selectedYear}
              disabled={disabled}
              onChange={(e) => handleSegmentChange('year', e.target.value)}
              className={`w-full bg-white/90 border p-3 rounded-xl text-xs md:text-sm text-textDark font-medium focus:outline-none focus:ring-2 transition-all shadow-inner cursor-pointer ${
                displayError
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                  : 'border-primary/30 focus:border-primary focus:ring-primary/20'
              }`}
              aria-label="سال تولد"
            >
              <option value="">سال</option>
              {yearsList.map((y) => (
                <option key={y} value={y}>
                  {calendarType === 'jalali' ? toPersianDigits(y) : y}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        /* Mode 2: Masked Numeric Input */
        <div className="relative">
          <input
            type="text"
            dir="ltr"
            inputMode="numeric"
            disabled={disabled}
            value={maskedText}
            onChange={handleMaskedInputChange}
            placeholder={
              calendarType === 'jalali' ? 'مثال: ۱۳۷۴/۰۶/۱۵' : 'YYYY/MM/DD (e.g. 1995/08/20)'
            }
            className={`w-full bg-white/90 border p-3.5 rounded-xl text-textDark font-mono text-center text-sm md:text-base focus:outline-none focus:ring-2 transition-all shadow-inner ${
              displayError
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                : 'border-primary/30 focus:border-primary focus:ring-primary/20'
            }`}
            aria-label="تاریخ تولد به صورت عدد"
          />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-textDark/30 pointer-events-none text-xs">
            {calendarType === 'jalali' ? 'شمسی' : 'میلادی'}
          </span>
        </div>
      )}

      {/* Age & Converted Date Preview Pill */}
      {calculatedAge !== null && !displayError && (
        <div className="flex flex-wrap items-center justify-between text-[11px] text-textDark/85 bg-primary/10 border border-primary/25 rounded-xl px-3 py-2 font-bold animate-fadeIn">
          <div className="flex items-center gap-1.5 text-primary-dark">
            <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
            <span>سن: {toPersianDigits(calculatedAge)} سال</span>
          </div>
          {conversionPreview && (
            <div className="text-textDark/70 font-mono text-[10px]" dir="ltr">
              {conversionPreview}
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {displayError && (
        <div className="text-rose-600 text-xs font-bold flex items-center gap-1.5 bg-rose-50 border border-rose-200 p-2.5 rounded-xl animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{displayError}</span>
        </div>
      )}
    </div>
  );
}
