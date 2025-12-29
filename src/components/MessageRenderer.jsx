import React from 'react';
// مطمئن شو که این فایل‌ها وجود دارند (در ادامه کدشان هست)
import TextMessage from './ui/TextMessage';
import Slider from './ui/Slider/Slider';
import DynamicForm from './ui/Form/DynamicForm';

const COMPONENT_MAP = {
  text: TextMessage,
  slider: Slider,
  form: DynamicForm,
  images: Slider, // تصاویر را هم با اسلایدر نشان می‌دهیم
};

export default function MessageRenderer({ message }) {
  if (!message) return null;

  // اگر تایپ شناخته نشد، پیش‌فرض TextMessage باشد تا برنامه کرش نکند
  const Component = COMPONENT_MAP[message.type] || TextMessage;

  const isUser = message.role === 'user';
  // اسلایدر و فرم و تصاویر نباید داخل حباب باشند
  const isPureContent = ['slider', 'form', 'images'].includes(message.type);

  // Wrapper برای چیدمان راست/چپ
  const Wrapper = ({ children }) => (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
        {children}
      </div>
    </div>
  );

  // Bubble برای پیام‌های متنی
  const Bubble = ({ children }) => (
    <div className={`px-4 py-2 rounded-2xl text-sm leading-6 
      ${isUser ? 'bg-yellow-500 text-black rounded-br-none' : 'bg-gray-800 text-white rounded-bl-none border border-gray-700'}`}>
      {children}
    </div>
  );

  return (
    <Wrapper>
      {isPureContent ? (
        // پاس دادن props صحیح به کامپوننت
        <Component 
            {...(message.payload || {})} 
            items={message.payload?.items || message.images} // هندل کردن هر دو حالت دیتا
            content={message.content} 
        />
      ) : (
        <Bubble>
          <Component content={message.content} />
        </Bubble>
      )}
    </Wrapper>
  );
}
