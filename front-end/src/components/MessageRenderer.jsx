// src/components/MessageRenderer.jsx
import React from 'react';
// Import Slider component from its correct location
import Slider from './ui/Slider/Slider'; // Adjust path if necessary

const MessageRenderer = ({ message, onCtaAction }) => {
  if (!message) return null;
  const { type, content, role, payload } = message;
  const isUser = role === 'user';

  /* ===============================
  Slider Message
  =============================== */
  if (type === 'slider') {
    const sliderItems = Array.isArray(payload)
      ? payload
      : payload?.items || [];

    return (
      <div className={`flex flex-col mb-4 ${isUser ? 'items-end' : 'items-start'}`}>
        {content && (
          <div
            className="
              animate-messageIn
              bg-dark text-lightText
              px-4 py-3
              rounded-2xl rounded-tl-md
              max-w-[85%]
              text-sm leading-6
              mb-2
              border border-primary/20
              shadow-sm
            "
          >
            {content}
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
      <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div
          className={`
            animate-messageIn
            max-w-[85%] px-4 py-3
            text-sm leading-6
            transition-all duration-200 ease-out
            hover:shadow-md
            ${
              isUser
                ? `
                  bg-primary text-white
                  rounded-2xl rounded-br-md
                  shadow-sm
                `
                : `
                  bg-dark text-lightText
                  rounded-2xl rounded-tl-md
                  border border-primary/20
                `
            }
          `}
        >
          {content}
        </div>
      </div>
    );
  }

  /* ===============================
  Form Message
  =============================== */
  if (type === 'form') {
    return (
      <div className="flex w-full mb-4 justify-start">
        <div
          className="
            animate-messageIn
            bg-[#222]
            border border-white/10
            p-4
            rounded-2xl rounded-tl-none
            w-3/4
          "
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
              hover:bg-[#3a7464]
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
        </div>
      </div>
    );
  }

  /* ===============================
  CTA Message (Button)
  =============================== */
  if (type === 'cta') {
    return (
      <div className="flex w-full mb-4 justify-start">
        <div className="bg-dark border border-primary/20 p-4 rounded-2xl rounded-tl-md max-w-[85%]">
          <p className="text-lightText text-sm mb-3 leading-6">
            {content}
          </p>
          <button
            onClick={() => onCtaAction?.(payload)}
            className="bg-primary hover:bg-primaryLight text-white text-sm px-4 py-2 rounded-lg transition"
          >
            {payload?.buttonLabel || 'ادامه'}
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default MessageRenderer;
