import React, { useState } from 'react';
import { X } from 'lucide-react';

    const SignupModal = ({ open, onClose, onSubmit }) => {
    const [form, setForm] = useState({
        username: '',
        phone: ''
    });

    if (!open) return null;

    const handleChange = (e) => {
        setForm(prev => ({
        ...prev,
        [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = () => {
        onSubmit(form); // اتصال بک‌اند بعداً اینجاست
    };

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-[#0f1715] w-full max-w-md rounded-2xl p-6 relative border border-[#2F5D50]/30 shadow-xl">

            {/* دکمه بستن */}
            <button
            onClick={onClose}
            className="absolute top-4 left-4 text-[#6B6E6C] hover:text-white transition"
            >
            <X size={20} />
            </button>

            <h3 className="text-white text-lg font-medium mb-4">
            ثبت نام برای ادامه گفتگو
            </h3>

            <div className="space-y-3">
            <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="نام کاربری"
                className="w-full px-4 py-3 rounded-xl bg-[#1a2522] text-white text-sm outline-none border border-[#2F5D50]/20 focus:border-[#2F5D50]"
            />

            <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="شماره تلفن"
                className="w-full px-4 py-3 rounded-xl bg-[#1a2522] text-white text-sm outline-none border border-[#2F5D50]/20 focus:border-[#2F5D50]"
            />
            </div>

            <button
            onClick={handleSubmit}
            className="w-full mt-5 bg-[#2F5D50] hover:bg-[#264C42] text-white py-3 rounded-xl transition"
            >
            ثبت اطلاعات
            </button>
        </div>
        </div>
    );
    };

export default SignupModal;
