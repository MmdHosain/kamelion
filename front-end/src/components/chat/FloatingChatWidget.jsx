import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  X,
  PhoneCall,
  Copy,
  Check,
  AlertTriangle,
  Sparkles,
  MessageSquare,
  Calendar,
  Stethoscope,
  Activity,
  HeartPulse,
  HelpCircle,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { chatService } from '../../api/chatService';

const QUICK_PROMPTS = [
  { text: 'درد یا خونریزی شدید دارم', icon: AlertTriangle, isUrgent: true },
  { text: 'توده جدید در سینه لمس کرده‌ام', icon: Activity },
  { text: 'مشاوره جراحی ماموپلاستی و زیبایی', icon: Sparkles },
  { text: 'بررسی جواب ماموگرافی و سونوگرافی', icon: Stethoscope },
  { text: 'مراقبت‌های بعد از جراحی', icon: HeartPulse },
  { text: 'رزرو نوبت ویزیت با پزشک', icon: Calendar },
];

const ROTATING_PLACEHOLDERS = [
  'علائم خود را بنویسید (مثلاً: درد سینه، لمس توده)...',
  'سوال درباره جراحی ماموپلاستی، پروتز یا لیفت...',
  'بررسی جواب سونوگرافی یا ماموگرافی...',
  'علت ترشحات یا تغییر شکل سینه...',
];

const INITIAL_BOT_MESSAGES = [
  {
    id: 1,
    sender: 'bot',
    text: 'سلام! من دستیار هوشمند تریاژ مطب دکتر معشوری هستم. لطفاً دلیل مراجعه، علائم یا سوال خود را بنویسید تا شما را راهنمایی کنم.',
    time: 'اکنون',
  },
];

const FloatingChatWidget = ({ isOpen, onToggle, onOpenAppointment }) => {
  const [messages, setMessages] = useState(INITIAL_BOT_MESSAGES);
  const [floatingInput, setFloatingInput] = useState('');
  const [modalInput, setModalInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  const messagesEndRef = useRef(null);

  // Rotate placeholder text smoothly
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % ROTATING_PLACEHOLDERS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen]);

  const handleSendMessage = React.useCallback(
    async (textToSend) => {
      const text = (textToSend || floatingInput || modalInput).trim();
      if (!text) return;

      const currentTime = new Intl.DateTimeFormat('fa-IR', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date());

      // Add user message
      const userMsg = {
        id: performance.now(),
        sender: 'user',
        text,
        time: currentTime,
      };

      setMessages((prev) => [...prev, userMsg]);
      setFloatingInput('');
      setModalInput('');

      // Ensure modal opens immediately
      if (!isOpen && onToggle) {
        onToggle();
      }

      setIsTyping(true);

      try {
        // 1. Attempt live API response
        const apiResponse = await chatService.sendMessage(text);
        if (apiResponse?.reply) {
          setIsTyping(false);
          setMessages((prev) => [
            ...prev,
            {
              id: performance.now() + 1,
              sender: 'bot',
              text: apiResponse.reply,
              isEmergency: apiResponse.isEmergency,
              emergencyCode: apiResponse.emergencyCode,
              showBookingAction: apiResponse.showBookingAction,
              time: currentTime,
            },
          ]);
          return;
        }
      } catch {
        // API call failed or offline — continue to local rule engine fallback
      }

      // 2. Local heuristic rule engine fallback
      setTimeout(() => {
        setIsTyping(false);
        const lower = text.toLowerCase();

        if (
          lower.includes('خونریزی') ||
          lower.includes('درد شدید') ||
          lower.includes('اورژانس') ||
          lower.includes('عفونت حاد') ||
          lower.includes('تب بالا') ||
          lower.includes('ترشح خونی')
        ) {
          const emergencyCode = `EMG-${Math.floor(1000 + Math.random() * 9000)}`;
          setMessages((prev) => [
            ...prev,
            {
              id: performance.now() + 1,
              sender: 'bot',
              text: 'بر اساس علائم وارد شده، وضعیت شما فوریتی و نیازمند بررسی سریع ارزیابی شد. لطفاً بدون اتلاف وقت با خط اورژانس مطب تماس گرفته و کد تریاژ زیر را اعلام فرمایید:',
              isEmergency: true,
              emergencyCode,
              time: currentTime,
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
              id: performance.now() + 1,
              sender: 'bot',
              text: 'بررسی ضایعات و توده‌های پستان نیازمند معاینه بالینی دقیق و مشاهده گرافی‌ها توسط سرکار خانم دکتر معشوری است. پیشنهاد می‌شود وقت ویزیت رزرو فرموده و تمامی مدارک قبلی را همراه داشته باشید.',
              showBookingAction: true,
              time: currentTime,
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
              id: performance.now() + 1,
              sender: 'bot',
              text: 'در جراحی‌های زیبایی و ماموپلاستی، بررسی بافت سینه و تقارن در جلسه مشاوره اولیه حضوری انجام می‌پذیرد تا مناسب‌ترین متد جراحی تعیین شود.',
              showBookingAction: true,
              time: currentTime,
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: performance.now() + 1,
              sender: 'bot',
              text: 'پیام شما دریافت شد. در صورت نیاز به راهنمایی بیشتر می‌توانید با شماره تلفن مطب تماس گرفته یا نوبت حضوری دریافت فرمایید.',
              showBookingAction: true,
              time: currentTime,
            },
          ]);
        }
      }, 800);
    },
    [floatingInput, modalInput, isOpen, onToggle]
  );

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <>
      {/* ── 1. Floating Slim Chat Capsule at Bottom Center (Fixed & Perfectly Centered in Viewport) ── */}
      {!isOpen && (
        <div className="fixed bottom-4 sm:bottom-6 left-0 right-0 z-[90] pointer-events-none px-4 flex justify-center">
          <div className="w-full max-w-xl md:max-w-2xl pointer-events-auto transition-all duration-300">
            
            {isMinimized ? (
              /* Minimized Pill */
              <div className="flex justify-center">
                <button
                  onClick={() => setIsMinimized(false)}
                  className="bg-white/95 backdrop-blur-xl border-2 border-primary/30 text-primary hover:bg-primary hover:text-white px-5 py-2.5 rounded-full text-xs font-black shadow-2xl flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
                >
                  <Sparkles size={15} />
                  <span>دستیار هوشمند تریاژ</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                
                {/* Quick Suggestion Chips (Compact & Perfectly Centered) */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 px-1 chat-scroll justify-start sm:justify-center">
                  {QUICK_PROMPTS.slice(0, 3).map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(prompt.text)}
                      className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-[11px] font-bold border backdrop-blur-md shadow-sm transition-all duration-200 hover:scale-102 shrink-0 cursor-pointer ${
                        prompt.isUrgent
                          ? 'bg-red-500/15 border-red-500/35 text-red-700 hover:bg-red-500 hover:text-white'
                          : 'bg-white/90 border-primary/25 text-textDark/85 hover:bg-primary hover:text-white hover:border-transparent'
                      }`}
                    >
                      {prompt.text}
                    </button>
                  ))}
                  
                  {/* Minimize Button */}
                  <button
                    onClick={() => setIsMinimized(true)}
                    className="p-1 rounded-full text-textDark/40 hover:text-textDark hover:bg-white/80 transition-colors shrink-0 cursor-pointer"
                    title="کوچک کردن"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Main Slim Capsule Input Bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="bg-white/95 backdrop-blur-2xl border-2 border-primary/35 rounded-full p-1.5 pr-4 pl-1.5 shadow-2xl shadow-primary/25 flex items-center gap-2 transition-all hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/25"
                >
                  <div className="text-primary shrink-0 animate-pulse flex items-center">
                    <Sparkles size={20} />
                  </div>

                  <input
                    type="text"
                    value={floatingInput}
                    onChange={(e) => setFloatingInput(e.target.value)}
                    placeholder={ROTATING_PLACEHOLDERS[placeholderIndex]}
                    className="flex-1 bg-transparent border-none outline-none text-xs md:text-sm text-textDark placeholder:text-textDark/45 font-medium min-w-0"
                  />

                  <button
                    type="submit"
                    aria-label="ارسال و شروع چت"
                    className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center transition-all hover:scale-105 shrink-0 shadow-md shadow-primary/30 cursor-pointer"
                  >
                    <Send size={15} className="rotate-180 ml-0.5" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 2. Full-Width / Full-Screen Popup Chat Modal (Opens on submit or click) ── */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-0 md:p-6 animate-fadeSlide">
          
          <div className="w-full h-full md:h-[86vh] md:max-w-5xl md:rounded-[2.5rem] bg-gradient-to-br from-bgLight/95 via-white/95 to-bgDark/95 backdrop-blur-2xl border border-primary/30 flex flex-col shadow-2xl overflow-hidden relative">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-5 py-3.5 md:py-4 bg-white/75 backdrop-blur-xl border-b border-primary/20 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white shadow-md">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm md:text-base font-black text-textDark flex items-center gap-2">
                    دستیار هوشمند تریاژ و مشاوره آنلاین
                    <Sparkles className="w-4 h-4 text-primary" />
                  </h3>
                  <p className="text-[11px] md:text-xs text-primary font-bold flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    پاسخگویی سریع به علائم بالینی و مشاوره
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="tel:09121234567"
                  className="hidden sm:flex items-center gap-1.5 text-xs font-bold bg-red-500/10 border border-red-500/25 text-red-600 px-3 py-1.5 rounded-xl hover:bg-red-500 hover:text-white transition-all no-underline"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  اورژانس ۲۴ ساعته
                </a>
                <button
                  onClick={onToggle}
                  className="text-textDark/60 hover:text-primary transition-colors p-2 rounded-full hover:bg-white/80 cursor-pointer"
                  aria-label="بستن"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body: 2-Column Desktop, 1-Column Mobile */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              
              {/* Left/Sidebar Quick Topics on Desktop */}
              <div className="hidden md:flex flex-col w-72 bg-white/40 border-l border-primary/15 p-5 shrink-0 overflow-y-auto chat-scroll">
                <h4 className="text-xs font-black text-primary uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4" />
                  موضوعات پرتکرار تریاژ
                </h4>
                <p className="text-xs text-textDark/70 mb-4 font-medium leading-relaxed">
                  روی هر یک از گزینه‌ها کلیک کنید تا پاسخ مرتبط را فوراً دریافت نمایید:
                </p>

                <div className="flex flex-col gap-2">
                  {QUICK_PROMPTS.map((prompt, i) => {
                    const Icon = prompt.icon;
                    return (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(prompt.text)}
                        className={`text-right p-3 rounded-2xl text-xs font-bold border transition-all flex items-start gap-2.5 cursor-pointer ${
                          prompt.isUrgent
                            ? 'bg-red-500/10 border-red-500/30 text-red-700 hover:bg-red-500/20'
                            : 'bg-white/70 border-primary/20 text-textDark hover:bg-white hover:border-primary hover:text-primary shadow-sm'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{prompt.text}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-auto pt-4 border-t border-primary/15">
                  <button
                    onClick={() => {
                      onToggle();
                      if (onOpenAppointment) onOpenAppointment();
                    }}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md shadow-primary/25 transition-all cursor-pointer"
                  >
                    <Calendar className="w-4 h-4" />
                    رزرو نوبت ویزیت حضوری
                  </button>
                </div>
              </div>

              {/* Main Chat Area */}
              <div className="flex-1 flex flex-col justify-between overflow-hidden bg-white/20">
                
                {/* Mobile Quick Chips */}
                <div className="md:hidden flex gap-1.5 p-2.5 overflow-x-auto border-b border-primary/10 bg-white/40 shrink-0 chat-scroll">
                  {QUICK_PROMPTS.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(prompt.text)}
                      className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold border shrink-0 transition-all ${
                        prompt.isUrgent
                          ? 'bg-red-500/10 border-red-500/30 text-red-600'
                          : 'bg-white/80 border-primary/20 text-textDark'
                      }`}
                    >
                      {prompt.text}
                    </button>
                  ))}
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-4 chat-scroll">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        msg.sender === 'user' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`p-4 md:p-5 rounded-3xl max-w-[92%] sm:max-w-[80%] text-sm md:text-base leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-primary text-white rounded-tl-sm shadow-md font-medium'
                            : 'bg-white/85 border border-primary/20 text-textDark rounded-tr-sm shadow-sm font-medium'
                        }`}
                      >
                        {msg.text}

                        {/* Emergency Code Box */}
                        {msg.isEmergency && (
                          <div className="bg-red-500/15 border border-red-500/30 p-4 md:p-5 rounded-2xl mt-4 text-center backdrop-blur-md">
                            <div className="flex items-center justify-center gap-1.5 text-red-600 font-black text-sm md:text-base mb-2">
                              <AlertTriangle className="w-5 h-5" />
                              کد تریاژ اورژانس صادر شد
                            </div>
                            <div className="text-2xl md:text-3xl font-mono font-black text-red-600 bg-white py-2 rounded-2xl shadow-inner mb-3 tracking-widest">
                              {msg.emergencyCode}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => copyCode(msg.emergencyCode)}
                                className="flex-1 bg-white hover:bg-red-50 border border-red-200 text-red-600 py-2.5 rounded-xl transition-all text-xs md:text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                {copiedCode === msg.emergencyCode ? (
                                  <>
                                    <Check className="w-4 h-4" />
                                    کپی شد!
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-4 h-4" />
                                    کپی کد
                                  </>
                                )}
                              </button>
                              <a
                                href="tel:09121234567"
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl transition-all text-xs md:text-sm font-bold flex items-center justify-center gap-1.5 shadow-md shadow-red-500/30 no-underline"
                              >
                                <PhoneCall className="w-4 h-4" />
                                تماس فوری با مطب
                              </a>
                            </div>
                          </div>
                        )}

                        {/* Booking CTA Button */}
                        {msg.showBookingAction && (
                          <button
                            onClick={() => {
                              onToggle();
                              if (onOpenAppointment) onOpenAppointment();
                            }}
                            className="mt-3 w-full bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-4 rounded-xl text-xs md:text-sm flex items-center justify-center gap-2 shadow-md shadow-primary/20 transition-all cursor-pointer"
                          >
                            <Calendar className="w-4 h-4" />
                            مشاهده تقویم و رزرو وقت ویزیت با دکتر معشوری
                          </button>
                        )}
                      </div>
                      <span className="text-[11px] text-textDark/45 px-2 mt-1 font-mono">
                        {msg.time}
                      </span>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="bg-white/85 border border-primary/20 p-3.5 rounded-2xl rounded-tr-sm self-start shadow-sm flex items-center justify-center gap-1.5 w-16 h-11">
                      <span className="w-2.5 h-2.5 bg-primary/60 rounded-full animate-bounce"></span>
                      <span
                        className="w-2.5 h-2.5 bg-primary/60 rounded-full animate-bounce"
                        style={{ animationDelay: '0.15s' }}
                      ></span>
                      <span
                        className="w-2.5 h-2.5 bg-primary/60 rounded-full animate-bounce"
                        style={{ animationDelay: '0.3s' }}
                      ></span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Modal Input Bar */}
                <div className="p-3.5 md:p-4 bg-white/75 border-t border-primary/20 backdrop-blur-xl shrink-0">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex gap-2.5 max-w-4xl mx-auto"
                  >
                    <input
                      type="text"
                      placeholder="علائم، پرسش پزشکی یا دلیل مراجعه خود را بنویسید..."
                      value={modalInput}
                      onChange={(e) => setModalInput(e.target.value)}
                      className="flex-1 bg-white border border-primary/30 shadow-inner rounded-2xl px-4 py-3 text-xs md:text-sm text-textDark focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder-textDark/45 font-medium"
                    />
                    <button
                      type="submit"
                      className="bg-primary hover:bg-primary-dark text-white rounded-2xl w-11 h-11 md:w-12 md:h-12 flex items-center justify-center transition-transform hover:scale-105 shrink-0 shadow-lg shadow-primary/30 cursor-pointer"
                    >
                      <Send className="w-4 h-4 rotate-180" />
                    </button>
                  </form>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChatWidget;
