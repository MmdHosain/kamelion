// src/components/MessageRenderer.jsx
import React from 'react';
// Import Slider component from its correct location
import Slider from './ui/Slider/Slider'; // Adjust path if necessary

const MessageRenderer = ({ message, onCtaAction }) => {
  if (!message) return null;
  const { type, content, role, payload, timestamp } = message;
  const isUser = role === 'user';

  const timeString = timestamp
    ? new Date(timestamp).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

  /* ===============================
  Slider Message
  =============================== */
  if (type === 'slider') {
    const sliderItems = Array.isArray(payload)
      ? payload
      : payload?.items || [];

    return (
      <div className={`flex flex-col mb-4 ${isUser ? 'items-start' : 'items-end'}`}>
        {content && (
          <div
            className={`
              animate-messageIn
              px-4 py-3
              rounded-2xl
              max-w-[85%]
              text-sm leading-6
              mb-2
              shadow-sm
              flex flex-col gap-1
              ${isUser ? 'bg-primary text-white rounded-tr-md' : 'bg-dark text-lightText rounded-tl-md border border-primary/20'}
            `}
          >
            <div>{content}</div>
            <div className={`text-[10px] opacity-70 ${isUser ? 'text-left' : 'text-right'}`}>
              {timeString}
            </div>
          </div>
        )}
        <div className="w-full max-w-full overflow-hidden">
          <Slider items={sliderItems} />
        </div>
      </div>
    );
  }

  /* ===============================
  Text Message
  =============================== */
  if (type === 'text') {
    return (
      <div className={`flex w-full mb-4 ${isUser ? 'justify-start' : 'justify-end'}`}>
        <div
          className={`
            animate-messageIn
            max-w-[85%] px-4 py-3
            text-sm leading-6
            transition-all duration-200 ease-out
            hover:shadow-md
            flex flex-col gap-1
            ${
              isUser
                ? 'bg-primary text-white rounded-2xl rounded-tr-md shadow-sm'
                : 'bg-dark text-lightText rounded-2xl rounded-tl-md border border-primary/20'
            }
          `}
        >
          <div>{content}</div>
          <div className={`text-[10px] opacity-70 ${isUser ? 'text-left' : 'text-right'}`}>
            {timeString}
          </div>
        </div>
      </div>
    );
  }

  /* ===============================
  Form Message
  =============================== */
  if (type === 'form') {
    return (
      <div className={`flex w-full mb-4 ${isUser ? 'justify-start' : 'justify-end'}`}>
        <div
          className={`
            animate-messageIn
            bg-darkGray
            border border-white/10
            p-4
            rounded-2xl
            w-3/4
            flex flex-col gap-1
            ${isUser ? 'rounded-tr-md' : 'rounded-tl-md'}
          `}
        >
          <p className="text-white text-sm mb-3">
            لطفا اطلاعات زیر را وارد کنید:
          </p>
          {payload?.fields?.map((f, i) => (
            <input
              key={i}
              placeholder={f.name}
              className="
                w-full mb-2 p-2
                rounded
                bg-black/50
                text-white text-sm
                border border-white/10
                focus:border-primary
                outline-none
              "
            />
          ))}
          <button
            className="
              w-full
              bg-primary
              hover:bg-primaryHover
              text-white
              py-2
              rounded-lg
              text-sm
              transition
              mt-1
            "
          >
            {payload?.submitLabel || 'ثبت'}
          </button>
          <div className={`text-[10px] opacity-70 mt-1 ${isUser ? 'text-left' : 'text-right'} text-white/70`}>
            {timeString}
          </div>
        </div>
      </div>
    );
  }

  /* ===============================
  CTA Message (Button)
  =============================== */
  if (type === 'cta') {
    return (
      <div className={`flex w-full mb-4 ${isUser ? 'justify-start' : 'justify-end'}`}>
        <div className={`bg-dark border border-primary/20 p-4 rounded-2xl max-w-[85%] flex flex-col gap-1 ${isUser ? 'rounded-tr-md' : 'rounded-tl-md'}`}>
          <p className="text-lightText text-sm mb-3 leading-6">
            {content}
          </p>
          <button
            onClick={() => onCtaAction?.(payload)}
            className="bg-primary hover:bg-primaryLight text-white text-sm px-4 py-2 rounded-lg transition"
          >
            {payload?.buttonLabel || 'ادامه'}
          </button>
          <div className={`text-[10px] opacity-70 mt-1 ${isUser ? 'text-left' : 'text-right'} text-lightText`}>
            {timeString}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default MessageRenderer;
