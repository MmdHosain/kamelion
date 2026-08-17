import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, Users, Calendar, CheckCircle2, DollarSign, Activity } from 'lucide-react';

const statisticsData = [
  { month: 'فروردین', value: 120 },
  { month: 'اردیبهشت', value: 185 },
  { month: 'خرداد', value: 160 },
  { month: 'تیر', value: 240 },
  { month: 'مرداد', value: 210 },
  { month: 'شهریور', value: 290 },
];

const earningData = [
  { name: 'ویزیت‌های انجام شده', value: 78 },
  { name: 'در انتظار ویزیت', value: 22 },
];

const calendarDays = Array.from({ length: 30 }, (_, i) => i + 1);
const today = 12;
const eventDay = 18;

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-primary/15 pb-4">
        <h1 className="text-xl md:text-2xl font-black text-primary flex items-center gap-2.5">
          <Activity className="w-6 h-6" />
          داشبورد آمار و گزارشات کلینیک
        </h1>
        <p className="text-xs md:text-sm text-textDark/70 font-medium mt-0.5">
          نمای کلی مراجعات، ویزیت‌های موفق، بازدهی سیستم تریاژ و آمار ماهانه
        </p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/85 border border-primary/20 rounded-3xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-textDark/70">کل ویزیت‌های ماه</span>
            <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Users size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-primary mb-1">۲۹۰ بیمار</div>
          <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
            <TrendingUp size={12} />
            ۲۴٪ رشد نسبت به ماه قبل
          </span>
        </div>

        <div className="bg-white/85 border border-primary/20 rounded-3xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-textDark/70">نوبت‌های آنلاین</span>
            <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Calendar size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-primary mb-1">۱۸۴ نوبت</div>
          <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
            <CheckCircle2 size={12} />
            ۹۴٪ درصد حضور موفق
          </span>
        </div>

        <div className="bg-white/85 border border-primary/20 rounded-3xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-textDark/70">تریاژ هوشمند AI</span>
            <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Activity size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-primary mb-1">۴۲۰ گفتگو</div>
          <span className="text-[11px] font-bold text-primary">۳۲ کد اورژانس صادرشده</span>
        </div>

        <div className="bg-white/85 border border-primary/20 rounded-3xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-textDark/70">رضایت مراجعین</span>
            <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-primary mb-1">۴.۹ / ۵.۰</div>
          <span className="text-[11px] font-bold text-amber-500">بر اساس ۱۲۰ دیدگاه</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white/85 border border-primary/20 rounded-3xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-primary flex items-center gap-2">
              <TrendingUp size={18} />
              روند ویزیت‌های ۶ ماه اخیر
            </h3>
            <span className="text-xs bg-primary/10 text-primary font-bold px-3 py-1 rounded-xl">
              سال ۱۴۰۳
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={statisticsData}>
                <XAxis dataKey="month" stroke="#4a2545" tick={{ fill: '#4a2545', fontSize: 12 }} />
                <YAxis stroke="#4a2545" tick={{ fill: '#4a2545', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    borderRadius: '16px',
                    borderColor: 'rgba(231,84,128,0.3)',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    direction: 'rtl',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#e75480"
                  strokeWidth={3.5}
                  dot={{ r: 5, fill: '#ba2d63' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white/85 border border-primary/20 rounded-3xl shadow-sm p-6 flex flex-col justify-between">
          <h3 className="text-base font-bold text-primary mb-4">
            وضعیت انجام نوبت‌ها
          </h3>

          <div className="h-44 flex items-center justify-center relative">
            <PieChart width={160} height={160}>
              <Pie
                data={earningData}
                innerRadius={55}
                outerRadius={75}
                dataKey="value"
              >
                <Cell fill="#e75480" />
                <Cell fill="#f7d6e4" />
              </Pie>
            </PieChart>
            <div className="absolute text-xl font-black text-primary">
              ۷۸٪
            </div>
          </div>

          <div className="space-y-2 mt-4 text-xs font-bold text-textDark/80">
            <div className="flex justify-between items-center border-b border-primary/10 pb-2">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#e75480]"></span>
                ویزیت‌های تکمیل‌شده
              </span>
              <span className="font-mono text-primary font-black">۷۸٪</span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#f7d6e4]"></span>
                در انتظار ویزیت
              </span>
              <span className="font-mono text-textDark/60 font-black">۲۲٪</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
