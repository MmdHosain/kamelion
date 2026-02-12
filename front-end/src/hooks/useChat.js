import { useState } from 'react';

export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [heroInput, setHeroInput] = useState('');
  const [chatState, setChatState] = useState('minimized'); // 'minimized' | 'maximized'

  const handleSendMessage = (text) => {
    if (!text.trim()) return;
    const userMessage = { role: 'user', type: 'text', content: text };
    
    // AI Response Logic
    let aiMessage;
    if (text.includes('خدمات') || text.includes('نمونه') || text.includes('service') || text.includes('slider')) {
      aiMessage = { 
        role: 'ai', 
        type: 'slider',
        content: 'این‌ها برخی از محبوب‌ترین خدمات تخصصی ما هستند که با جدیدترین متدهای روز دنیا ارائه می‌شوند:',
        payload: [
          {
            title: 'تزریق ژل لب روسی',
            desc: 'فرم‌دهی طبیعی و حجم‌دهی با بهترین برندهای اروپایی',
            img_path: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=2070&auto=format&fit=crop     ',
            price: 'تخفیف ویژه'
          },
          {
            title: 'هایفوتراپی صورت',
            desc: 'لیفتینگ و جوانسازی بدون جراحی در یک جلسه',
            img_path: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=2070&auto=format&fit=crop     ',
            price: 'محبوب'
          },
          {
            title: 'لیزر موهای زائد',
            desc: 'دستگاه الکساندرایت کندلا 2024 بدون درد',
            img_path: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?q=80&w=2070&auto=format&fit=crop     ',
            price: 'جشنواره'
          },
          {
            title: 'کاشت مو طبیعی',
            desc: 'تراکم بالا با خط رویش طبیعی و ضمانت نامه',
            img_path: 'https://images.unsplash.com/photo-1552693673-1bf958298935?q=80&w=2073&auto=format&fit=crop     ',
            price: 'مشاوره رایگان'
          }
        ]
      };
    } else if (text.includes('form') || text.includes('نوبت')) {
      aiMessage = { 
        role: 'ai', 
        type: 'form', 
        payload: { 
          fields: [
            {type:'text', name:'نام و نام خانوادگی'}, 
            {type:'text', name:'شماره تماس'}
          ], 
          submitLabel: 'درخواست مشاوره' 
        }
      };
    } else if (text.toLowerCase().includes('button')) {
      aiMessage = {
        role: 'ai',
        type: 'cta',
        content: 'اگه میخوای بهتر کمک کنم و به مکالمه ادامه بدیم لطفا ثبت نام کن',
        payload: {
          action: 'open_signup',
          buttonLabel: 'ثبت نام'
        }
      };
    } else {
      aiMessage = {
        role: 'ai', 
        type: 'text',
        content: 'درخواست شما دریافت شد. برای مشاهده خدمات ما کلمه "خدمات" را تایپ کنید.'
      };
    }

    setMessages(prev => [...prev, userMessage, aiMessage]);
    setInputValue('');
  };

  const handleHeroSubmit = ({ heroInput, setHeroInput, setChatState }) => {
    if (!heroInput.trim()) return;
    setMessages([]); // Clear previous conversation
    handleSendMessage(heroInput);
    setChatState('maximized');
    setHeroInput('');
  };

  const handleCtaAction = (payload, onOpenSignup) => {
    if (payload.action === 'open_signup') {
      onOpenSignup();
    }
  };

  return {
    messages,
    setMessages,
    inputValue,
    setInputValue,
    heroInput,
    setHeroInput,
    chatState,
    setChatState,
    handleSendMessage,
    handleHeroSubmit,
    handleCtaAction
  };
};