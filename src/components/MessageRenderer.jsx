import React from 'react';
import Slider from './ui/Slider/Slider';

const MessageRenderer = ({ message }) => {
  if (!message) return null;

  const { type, content, role, payload } = message;
  const isUser = role === 'user';

  if (type === 'slider') {
    const sliderItems = Array.isArray(payload)
      ? payload
      : payload?.items || [];

    return (
      <div className={`flex flex-col mb-4 ${isUser ? 'items-end' : 'items-start'}`}>
        {content && (
          <div className="bg-[#222] text-white px-4 py-3 rounded-2xl rounded-tl-none max-w-[85%] text-sm leading-6 mb-2">
            {content}
          </div>
        )}

        <div className="w-full max-w-full overflow-hidden">
          <Slider items={sliderItems} />
        </div>
      </div>
    );
  }

  if (type === 'text') {
    return (
      <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div
          className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-6 shadow-sm
            ${isUser
              ? 'bg-yellow-600 text-white rounded-br-none'
              : 'bg-[#222] text-gray-100 rounded-tl-none border border-white/5'
            }
          `}
        >
          {content}
        </div>
      </div>
    );
  }

  if (type === 'form') {
    return (
      <div className="flex w-full mb-4 justify-start">
        <div className="bg-[#222] border border-white/10 p-4 rounded-2xl rounded-tl-none w-3/4">
          <p className="text-white text-sm mb-3">لطفا اطلاعات زیر را وارد کنید:</p>
          {payload?.fields?.map((f, i) => (
            <input
              key={i}
              placeholder={f.name}
              className="w-full mb-2 p-2 rounded bg-black/50 text-white text-sm border border-white/10 focus:border-yellow-500 outline-none"
            />
          ))}
          <button className="w-full bg-yellow-600 hover:bg-yellow-500 text-white py-2 rounded-lg text-sm transition mt-1">
            {payload?.submitLabel || 'ثبت'}
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default MessageRenderer;
