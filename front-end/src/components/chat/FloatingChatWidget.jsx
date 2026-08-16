import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, PhoneCall, Copy, Check, AlertTriangle, Sparkles, MessageSquare } from 'lucide-react';

const FloatingChatWidget = ({ isOpen, onToggle, onOpenAppointment }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'سلام! من دستیار هوشمند تریاژ مطب دکتر معشوری هستم. لطفاً دلیل مراجعه، علائم یا سوال پزشکی خود را بنویسید تا شما را راهنمایی کنم.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = (textToSend) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const lower = text.toLowerCase();

      if (
        lower.includes('خونریزی') ||
        lower.includes('درد شدید') ||
        lower.includes('اورژانس') ||
        lower.includes('عفونت حاد') ||
        lower.includes('تب بالا')
      ) {
        const emergencyCode = `EMG-${Math.floor(1000 + Math.random() * 9000)}`;
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'bot',
            text: 'بر اساس علائم وارد شده، وضعیت شما فوریتی ارزیابی شد. لطفاً سریعاً با خط اورژانس مطب تماس گرفته و کد تریاژ زیر را اعلام فرمایید:',
            isEmergency: true,
            emergencyCode,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else if (
        lower.includes('توده') ||
        lower.includes('سونوگرافی') ||
        lower.includes('ماموگرافی') ||
        lower.includes('درد') ||
        lower.includes('چکاپ')
      ) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'bot',
            text: 'مورد شما نیازمند بررسی دقیق و معاینه بالینی توسط سرکار خانم دکتر معشوری است. پیشنهاد می‌شود از طریق سیستم نوبت‌دهی آنلاین وقت ویزیت رزرو نموده و تمامی مدارک قبلی (سونوگرافی یا ماموگرافی) را همراه داشته باشید.',
            showBookingAction: true,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else if (
        lower.includes('پروتز') ||
        lower.includes('لیفت') ||
        lower.includes('ماموپلاستی') ||
        lower.includes('زیبایی') ||
        lower.includes('هزینه')
      ) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'bot',
            text: 'برای مشاوره‌های زیبایی پستان، ویزیت اولیه جهت بررسی آناتومی و انتخاب بهترین تکنیک جراحی ضروری است. شما می‌توانید جهت تعیین وقت مشاوره حضوری اقدام فرمایید.',
            showBookingAction: true,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'bot',
            text: 'پیام شما دریافت شد. در صورت نیاز به راهنمایی بیشتر می‌توانید با شماره تلفن مطب تماس بگیرید یا نوبت حضوری دریافت نمایید.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    }, 1200);
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <>
      {/* Floating Center-Bottom FAB Button */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[90]">
        <button
          onClick={onToggle}
          aria-label="دستیار هوشمند"
          className="bg-primary hover:bg-primary-dark text-white rounded-full py-3.5 px-7 shadow-2xl shadow-primary/40 transition-all duration-300 hover:-translate-y-1 font-bold flex items-center gap-2.5 border border-white/30 backdrop-blur-md cursor-pointer group"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
          <Bot className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="text-sm md:text-base font-extrabold tracking-tight">
            دستیار هوشمند تریاژ
          </span>
        </button>
      </div>

      {/* Popup Glass Chat Modal */}
      {isOpen && (
        <div className="fixed inset-4 sm:inset-auto sm:bottom-24 sm:left-1/2 sm:-translate-x-1/2 sm:w-[420px] sm:h-[580px] z-[100] bg-gradient-to-br from-bgLight/95 to-bgDark/95 backdrop-blur-2xl border border-primary/30 rounded-3xl flex flex-col shadow-2xl overflow-hidden animate-fadeSlide">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-primary/20 px-5 py-4 bg-white/50 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white shadow-md">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-textDark flex items-center gap-1.5">
                  دستیار هوشمند تریاژ
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                </h3>
                <p className="text-xs font-bold text-primary flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                  آماده پاسخگویی آنلاین
                </p>
              </div>
            </div>

            <button
              onClick={onToggle}
              className="text-textDark/60 hover:text-primary transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-3.5 p-4 chat-scroll">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`p-3.5 md:p-4 rounded-2xl max-w-[88%] text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-primary text-white rounded-tl-sm shadow-md font-medium'
                      : 'bg-white/80 border border-primary/15 text-textDark rounded-tr-sm shadow-sm font-medium'
                  }`}
                >
                  {msg.text}

                  {/* Emergency Box inside Message */}
                  {msg.isEmergency && (
                    <div className="bg-red-500/15 border border-red-500/30 p-4 rounded-2xl mt-3 text-center backdrop-blur-md">
                      <div className="flex items-center justify-center gap-1.5 text-red-600 font-bold text-sm mb-2">
                        <AlertTriangle className="w-4 h-4" />
                        کد تریاژ اورژانس صادر شد
                      </div>
                      <div className="text-2xl font-mono font-black text-red-600 bg-white py-1.5 rounded-xl shadow-inner mb-3">
                        {msg.emergencyCode}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyCode(msg.emergencyCode)}
                          className="flex-1 bg-white hover:bg-red-50 border border-red-200 text-red-600 py-2 rounded-xl transition-all text-xs font-bold flex items-center justify-center gap-1"
                        >
                          {copiedCode === msg.emergencyCode ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              کپی شد
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              کپی کد
                            </>
                          )}
                        </button>
                        <a
                          href="tel:09121234567"
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl transition-all text-xs font-bold flex items-center justify-center gap-1 shadow-md shadow-red-500/30 no-underline"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          تماس فوری
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Booking Action Button inside Message */}
                  {msg.showBookingAction && (
                    <button
                      onClick={() => {
                        onToggle();
                        if (onOpenAppointment) onOpenAppointment();
                      }}
                      className="mt-3 w-full bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      رزرو نوبت ویزیت با پزشک
                    </button>
                  )}
                </div>
                <span className="text-[10px] text-textDark/40 px-1 mt-1 font-mono">
                  {msg.time}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="bg-white/80 border border-primary/15 p-3 rounded-2xl rounded-tr-sm self-start shadow-sm flex items-center justify-center gap-1.5 w-16 h-10">
                <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></span>
                <span
                  className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                  style={{ animationDelay: '0.15s' }}
                ></span>
                <span
                  className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                  style={{ animationDelay: '0.3s' }}
                ></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3.5 bg-white/50 border-t border-primary/20 backdrop-blur-md">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                placeholder="علائم یا سوال خود را بنویسید..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 bg-white/90 border border-primary/25 shadow-inner rounded-2xl px-4 py-2.5 text-sm text-textDark focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder-textDark/45"
              />
              <button
                type="submit"
                className="bg-primary hover:bg-primary-dark text-white rounded-2xl w-11 h-11 flex items-center justify-center transition-transform hover:scale-105 shrink-0 shadow-md shadow-primary/30"
              >
                <Send className="w-4 h-4 rotate-180" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChatWidget;
