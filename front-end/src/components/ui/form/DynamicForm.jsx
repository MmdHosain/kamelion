import React from 'react';

export default function DynamicForm({ fields = [], submitLabel = 'ارسال' }) {
  return (
    <div className="bg-gray-800 border border-gray-700 p-4 rounded-xl w-64">
      <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
        {fields.map((field, idx) => (
          <div key={idx} className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 text-right">{field.name}</label>
            <input
              type={field.type}
              placeholder={field.placeholder}
              className="bg-gray-900 text-white border border-gray-600 rounded px-3 py-2 text-xs focus:border-yellow-500 outline-none text-right dir-rtl"
            />
          </div>
        ))}
        <button className="bg-yellow-600 hover:bg-yellow-500 text-black text-sm font-bold py-2 rounded transition">
          {submitLabel}
        </button>
      </form>
    </div>
  );
}
