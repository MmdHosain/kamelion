// src/hooks/useChat.js
import { useState, useEffect } from 'react';

export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [heroInput, setHeroInput] = useState('');
  const [chatState, setChatState] = useState('minimized');
  const [isPlayingScenario, setIsPlayingScenario] = useState(false);

  // ✅ تابع جدید: اجرای سناریو با تأخیر
  const playScenario = (scenarioMessages) => {
    setIsPlayingScenario(true);
    setMessages(prev => [...prev, ...scenarioMessages.slice(0, 1)]); // اولین پیام AI
    
    let index = 1;
    const interval = setInterval(() => {
      if (index < scenarioMessages.length) {
        setMessages(prev => [...prev, scenarioMessages[index]]);
        index++;
      } else {
        clearInterval(interval);
        setIsPlayingScenario(false);
      }
    }, 500); // 0.5 ثانیه تأخیر بین هر پیام

    return () => clearInterval(interval);
  };

  const handleSendMessage = (text) => {
    if (!text.trim()) return;
    
    // اگه داریم سناریو اجرا می‌کنیم، پیام جدید اضافه نکن
    if (isPlayingScenario) return;

    const userMessage = { role: 'user', type: 'text', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setHeroInput('');
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
    if (payload.action === 'open_appointment') {
      // اینجا می‌تونی مودال نوبت‌دهی رو باز کنی
      console.log('Open appointment modal');
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
    handleCtaAction,
    playScenario, // ✅ تابع جدید
    isPlayingScenario
  };
};