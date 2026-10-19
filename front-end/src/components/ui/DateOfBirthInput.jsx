// src/components/ui/DateOfBirthInput.jsx
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import {
  CalendarDays,
  Sparkles,
  AlertCircle,
  ListFilter,
  Keyboard,
  ChevronDown,
  Check,
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

/**
 * Elevated, Accessible Custom Select Dropdown for Date Segments
 */
function DateSegmentDropdown({
  label,
  value,
  placeholder,
  options,
  isOpen,
  onToggle,
  onSelect,
  onClose,
  disabled,
  hasError,
  ariaLabel,
  zIndexClass = 'z-20',
  menuMinWidth = 'min-w-full',
  defaultScrollValue,
}) {
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const listboxRef = useRef(null);
  const selectedItemRef = useRef(null);
  const highlightedItemRef = useRef(null);

  const [placement, setPlacement] = useState('bottom');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const typeAheadBufferRef = useRef('');
  const typeAheadTimeoutRef = useRef(null);

  // Find display label for currently selected value
  const selectedOption = useMemo(() => {
    if (!value) return null;
    return options.find((opt) => String(opt.value) === String(value)) || null;
  }, [options, value]);

  // Intelligent viewport collision detection (opens upward if near bottom)
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      if (spaceBelow < 220 && spaceAbove > 220) {
        setPlacement('top');
      } else {
        setPlacement('bottom');
      }
    }
  }, [isOpen]);

  // Set initial highlighted index & auto-scroll into view upon opening
  useEffect(() => {
    if (isOpen) {
      let initialIdx = -1;
      if (value) {
        initialIdx = options.findIndex((opt) => String(opt.value) === String(value));
      } else if (defaultScrollValue) {
        initialIdx = options.findIndex((opt) => String(opt.value) === String(defaultScrollValue));
      }
      setHighlightedIndex(initialIdx !== -1 ? initialIdx : 0);

      const timer = setTimeout(() => {
        const targetEl = selectedItemRef.current || highlightedItemRef.current;
        if (targetEl && listboxRef.current) {
          targetEl.scrollIntoView({ block: 'nearest' });
        }
      }, 30);
      return () => clearTimeout(timer);
    } else {
      setHighlightedIndex(-1);
    }
  }, [isOpen, value, options, defaultScrollValue]);

  // Click outside listener for clean dismissal
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (disabled) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        onToggle();
      } else {
        setHighlightedIndex((prev) => {
          const next = prev < options.length - 1 ? prev + 1 : prev;
          setTimeout(() => {
            highlightedItemRef.current?.scrollIntoView({ block: 'nearest' });
          }, 0);
          return next;
        });
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        onToggle();
      } else {
        setHighlightedIndex((prev) => {
          const next = prev > 0 ? prev - 1 : 0;
          setTimeout(() => {
            highlightedItemRef.current?.scrollIntoView({ block: 'nearest' });
          }, 0);
          return next;
        });
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      if (isOpen) {
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < options.length) {
          onSelect(options[highlightedIndex].value);
          onClose();
          triggerRef.current?.focus();
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onToggle();
      }
    } else if (e.key === 'Escape') {
      if (isOpen) {
        e.preventDefault();
        onClose();
        triggerRef.current?.focus();
      }
    } else if (e.key === 'Tab') {
      if (isOpen) {
        onClose();
      }
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // Type-ahead jump search for digits and characters
      if (typeAheadTimeoutRef.current) clearTimeout(typeAheadTimeoutRef.current);
      typeAheadBufferRef.current += e.key;
      typeAheadTimeoutRef.current = setTimeout(() => {
        typeAheadBufferRef.current = '';
      }, 600);

      const query = toEnglishDigits(typeAheadBufferRef.current).toLowerCase();
      const matchIdx = options.findIndex((opt) => {
        const labelStr = toEnglishDigits(opt.label).toLowerCase();
        const valStr = toEnglishDigits(String(opt.value)).toLowerCase();
        return labelStr.startsWith(query) || valStr.startsWith(query);
      });

      if (matchIdx !== -1) {
        if (!isOpen) onToggle();
        setHighlightedIndex(matchIdx);
        setTimeout(() => {
          highlightedItemRef.current?.scrollIntoView({ block: 'nearest' });
        }, 10);
      }
    }
  };

  return (
    <div className={`relative flex flex-col ${zIndexClass}`} ref={containerRef}>
      <span className="block text-[10px] font-bold text-textDark/60 mb-1 pr-1">
        {label}
      </span>

      {/* Trigger Button */}
      <button
        type="button"
        ref={triggerRef}
        onClick={() => {
          if (!disabled) onToggle();
        }}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        className={`w-full h-11 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 flex items-center justify-between gap-1 select-none cursor-pointer ${
          isOpen
            ? 'bg-white border-primary ring-2 ring-primary/20 shadow-md text-textDark'
            : hasError
            ? 'bg-rose-50/50 border-rose-400 text-rose-800 hover:border-rose-500 focus:ring-2 focus:ring-rose-200'
            : value
            ? 'bg-white/95 border-primary/35 text-textDark hover:border-primary shadow-xs'
            : 'bg-white/80 border-primary/25 text-textDark/40 hover:border-primary/50 hover:bg-white shadow-inner'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        <span
          className={`truncate ${
            value ? 'font-bold text-textDark' : 'font-medium text-textDark/40'
          }`}
        >
          {selectedOption ? selectedOption.displayLabel || selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-primary' : 'text-textDark/40'
          }`}
        />
      </button>

      {/* Floating Animated Listbox */}
      {isOpen && (
        <div
          ref={listboxRef}
          role="listbox"
          aria-label={ariaLabel}
          tabIndex={-1}
          className={`absolute ${
            placement === 'top'
              ? 'bottom-full mb-1.5 origin-bottom'
              : 'top-full mt-1.5 origin-top'
          } right-0 ${menuMinWidth} z-50 bg-white/98 backdrop-blur-2xl border border-primary/25 rounded-2xl shadow-xl shadow-primary/10 max-h-52 overflow-y-auto custom-scroll p-1.5 animate-scaleUp`}
        >
          {options.map((opt, idx) => {
            const isSelected = String(opt.value) === String(value);
            const isHighlighted = idx === highlightedIndex;

            return (
              <div
                key={opt.value}
                ref={
                  isSelected
                    ? selectedItemRef
                    : isHighlighted
                    ? highlightedItemRef
                    : null
                }
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onSelect(opt.value);
                  onClose();
                  triggerRef.current?.focus();
                }}
                onMouseEnter={() => setHighlightedIndex(idx)}
                className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm transition-all duration-150 flex items-center justify-between cursor-pointer select-none mb-0.5 last:mb-0 ${
                  isSelected
                    ? 'bg-gradient-to-r from-primary to-primary-dark text-white font-black shadow-xs'
                    : isHighlighted
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-textDark hover:bg-primary/5 hover:text-primary font-medium'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 shrink-0 text-white stroke-[2.5]" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Main DateOfBirthInput Component
 */
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
  const [openDropdown, setOpenDropdown] = useState(null); // 'day' | 'month' | 'year' | null

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
        const err = `سال تولد باید بین ${minAllowedYear} تا ${maxAllowedYear} باشد.`;
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

  // Options mapping for Day dropdown
  const dayOptions = useMemo(() => {
    return Array.from({ length: maxDays }, (_, i) => i + 1).map((d) => ({
      value: String(d),
      label: calendarType === 'jalali' ? toPersianDigits(d) : String(d),
      displayLabel: calendarType === 'jalali' ? toPersianDigits(d) : String(d),
    }));
  }, [maxDays, calendarType]);

  // Options mapping for Month dropdown
  const monthOptions = useMemo(() => {
    if (calendarType === 'jalali') {
      return PERSIAN_MONTH_NAMES.map((name, idx) => ({
        value: String(idx + 1),
        label: `${name} (${toPersianDigits(idx + 1)})`,
        displayLabel: name,
      }));
    }
    return GREGORIAN_MONTHS.map((m) => ({
      value: String(m.id),
      label: m.name,
      displayLabel: m.name.split(' ')[0],
    }));
  }, [calendarType]);

  // Options mapping for Year dropdown
  const yearOptions = useMemo(() => {
    return yearsList.map((y) => ({
      value: String(y),
      label: calendarType === 'jalali' ? toPersianDigits(y) : String(y),
      displayLabel: calendarType === 'jalali' ? toPersianDigits(y) : String(y),
    }));
  }, [yearsList, calendarType]);

  const displayError = externalError || internalError;

  return (
    <div className={`space-y-2 text-right ${className}`} dir="rtl">
      {/* Top Header: Label, Mode Switch & Calendar Switch */}
      <div className="flex items-center justify-between text-xs font-bold text-textDark/80 pr-1">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <CalendarDays className="w-3.5 h-3.5 text-primary shrink-0" />
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
              setOpenDropdown(null);
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
            onClick={() => {
              setOpenDropdown(null);
              setInputMode((prev) => (prev === 'segmented' ? 'masked' : 'segmented'));
            }}
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

      {/* Mode 1: Elevated Segmented Dropdown Selectors */}
      {inputMode === 'segmented' ? (
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 relative">
          {/* Day Dropdown */}
          <DateSegmentDropdown
            label="روز"
            value={selectedDay}
            placeholder="روز"
            options={dayOptions}
            isOpen={openDropdown === 'day'}
            onToggle={() => setOpenDropdown((prev) => (prev === 'day' ? null : 'day'))}
            onSelect={(val) => handleSegmentChange('day', val)}
            onClose={() => setOpenDropdown(null)}
            disabled={disabled}
            hasError={Boolean(displayError)}
            ariaLabel="روز تولد"
            zIndexClass={openDropdown === 'day' ? 'z-40' : 'z-20'}
          />

          {/* Month Dropdown */}
          <DateSegmentDropdown
            label="ماه"
            value={selectedMonth}
            placeholder="ماه"
            options={monthOptions}
            isOpen={openDropdown === 'month'}
            onToggle={() => setOpenDropdown((prev) => (prev === 'month' ? null : 'month'))}
            onSelect={(val) => handleSegmentChange('month', val)}
            onClose={() => setOpenDropdown(null)}
            disabled={disabled}
            hasError={Boolean(displayError)}
            ariaLabel="ماه تولد"
            zIndexClass={openDropdown === 'month' ? 'z-40' : 'z-20'}
            menuMinWidth="min-w-[130px] sm:min-w-full"
          />

          {/* Year Dropdown */}
          <DateSegmentDropdown
            label="سال"
            value={selectedYear}
            placeholder="سال"
            options={yearOptions}
            isOpen={openDropdown === 'year'}
            onToggle={() => setOpenDropdown((prev) => (prev === 'year' ? null : 'year'))}
            onSelect={(val) => handleSegmentChange('year', val)}
            onClose={() => setOpenDropdown(null)}
            disabled={disabled}
            hasError={Boolean(displayError)}
            ariaLabel="سال تولد"
            zIndexClass={openDropdown === 'year' ? 'z-40' : 'z-20'}
            defaultScrollValue={String(
              calendarType === 'jalali' ? currentJalaliYear - 30 : currentGregorianYear - 30
            )}
          />
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
            className={`w-full h-11 px-3.5 py-2.5 rounded-xl text-textDark font-mono text-center text-sm md:text-base focus:outline-none focus:ring-2 transition-all shadow-inner ${
              displayError
                ? 'bg-rose-50/50 border border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                : 'bg-white/90 border border-primary/30 focus:border-primary focus:ring-primary/20'
            }`}
            aria-label="تاریخ تولد به صورت عدد"
          />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-textDark/35 pointer-events-none text-xs font-bold">
            {calendarType === 'jalali' ? 'شمسی' : 'میلادی'}
          </span>
        </div>
      )}

      {/* Age & Converted Date Preview Pill */}
      {calculatedAge !== null && !displayError && (
        <div className="flex flex-wrap items-center justify-between text-[11px] text-textDark/85 bg-primary/10 border border-primary/25 rounded-xl px-3 py-2 font-bold animate-fadeIn shadow-2xs">
          <div className="flex items-center gap-1.5 text-primary-dark">
            <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
            <span>سن: {toPersianDigits(calculatedAge)} سال</span>
          </div>
          {conversionPreview && (
            <div className="text-textDark/70 font-mono text-[10px] tracking-wide" dir="ltr">
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
