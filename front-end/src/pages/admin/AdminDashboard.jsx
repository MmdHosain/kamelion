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

const PRIMARY = '#2F5D50';
const ACCENT = '#E6C5CC';
const TEXT = '#6B6E6C';

/* ------------------ Dummy API-shaped data ------------------ */

const statisticsData = [
  { month: 'Jan', value: 400 },
  { month: 'Feb', value: 600 },
  { month: 'Mar', value: 520 },
  { month: 'Apr', value: 780 },
  { month: 'May', value: 690 },
  { month: 'Jun', value: 920 }
];

const earningData = [
  { name: 'Completed', value: 75 },
  { name: 'Remaining', value: 25 }
];

const calendarDays = Array.from({ length: 30 }, (_, i) => i + 1);
const today = 12;
const eventDay = 18;

/* ------------------ Component ------------------ */

const AdminDashboard = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* ================= Statistics Chart ================= */}
      <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-primary">
            Statistics
          </h2>
          <select className="border rounded-lg px-3 py-1 text-sm text-mutedText">
            <option>2026</option>
            <option>2025</option>
          </select>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={statisticsData}>
              <XAxis dataKey="month" stroke={TEXT} />
              <YAxis stroke={TEXT} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke={PRIMARY}
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ================= Earning in Month ================= */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-primary mb-4">
          Earning in Month
        </h2>

        <div className="h-44 flex items-center justify-center relative">
          <PieChart width={160} height={160}>
            <Pie
              data={earningData}
              innerRadius={55}
              outerRadius={75}
              dataKey="value"
            >
              <Cell fill={PRIMARY} />
              <Cell fill={ACCENT} />
            </Pie>
          </PieChart>
          <div className="absolute text-xl font-semibold text-primary">
            75%
          </div>
        </div>

        <div className="space-y-2 mt-4 text-sm text-mutedText">
          <div className="flex justify-between">
            <span>Deposit</span>
            <span>$12,400</span>
          </div>
          <div className="flex justify-between">
            <span>Expense</span>
            <span>$3,200</span>
          </div>
          <div className="flex justify-between">
            <span>Payable</span>
            <span>$1,150</span>
          </div>
        </div>
      </div>

      {/* ================= Monthly Sale ================= */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-sm text-mutedText mb-2">
          Monthly Sale
        </h3>
        <div className="text-2xl font-semibold text-primary mb-4">
          $8,420
        </div>

        <div className="w-full bg-secondary/40 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full"
            style={{ width: '70%' }}
          />
        </div>
        <div className="mt-2 text-xs text-mutedText">
          ▲ 12% from last month
        </div>
      </div>

      {/* ================= Yearly Sale ================= */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-sm text-mutedText mb-2">
          Yearly Sale
        </h3>
        <div className="text-2xl font-semibold text-primary mb-4">
          $96,300
        </div>

        <div className="w-full bg-secondary/40 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full"
            style={{ width: '85%' }}
          />
        </div>
        <div className="mt-2 text-xs text-mutedText">
          ▲ 24% growth
        </div>
      </div>

      {/* ================= Calendar ================= */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-primary mb-4">
          Calendar
        </h2>

        <div className="grid grid-cols-7 gap-2 text-center text-sm">
          {calendarDays.map((day) => (
            <div
              key={day}
              className={`rounded-lg py-2 cursor-pointer
                ${
                  day === today
                    ? 'bg-primary text-white'
                    : day === eventDay
                    ? 'bg-secondary text-primary'
                    : 'text-mutedText'
                }
              `}
            >
              {day}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
