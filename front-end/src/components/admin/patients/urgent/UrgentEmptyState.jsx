import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const UrgentEmptyState = () => {
  return (
    <div className="bg-white/80 border border-primary/15 rounded-3xl p-8 sm:p-12 flex flex-col items-center justify-center text-center gap-3 shadow-xs">
      <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shadow-inner">
        <ShieldCheck className="w-8 h-8" />
      </div>
      <h3 className="text-base sm:text-lg font-black text-textDark">
        بیمار اورژانسی فعالی در سیستم ثبت نشده است.
      </h3>
      <p className="text-xs sm:text-sm text-textDark/60 font-medium max-w-md">
        در حال حاضر هیچ بیماری با کد ارجاع اورژانسی معتبر و منقضی‌نشده در سامانه وجود ندارد.
      </p>
    </div>
  );
};

export default UrgentEmptyState;

