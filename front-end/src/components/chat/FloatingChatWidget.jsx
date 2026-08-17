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
  ChevronLeft,
  Calendar,
  Stethoscope,
  Activity,
  HeartPulse,
  HelpCircle
} from 'lucide-react';

const QUICK_PROMPTS = [
  { text: 'درد شدید یا خونریزی ناگهانی دارم', icon: AlertTriangle, isUrgent: true },
  { text: 'توده جدیدی در سینه لمس کرده‌ام', icon: Activity },
  { text: 'مشاوره جراحی ماموپلاستی و زیبایی', icon: Sparkles },
  { text: 'بررسی جواب ماموگرافی یا سونوگرافی', icon: Stethoscope },
  { text: 'مراقبت‌ها و ویزیت پس از جراحی', icon: HeartPulse },
  { text: 'نحوه دریافت نوبت حضوری مطب', icon: Calendar },
];

const FloatingChatWidget = ({ isOpen, onToggle, onOpenAppointment }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'سلام! من دستیار هوشمند تریاژ مطب دکتر معشوری هستم. لطفاً دلیل مراجعه، علائم یا سوال خود را بنویسید یا از گزینه‌های سریع زیر استفاده کنید.',
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
        lower.includes('تب بالا') ||
        lower.includes('ترشح خونی')
      ) {
        const emergencyCode = `EMG-${Math.floor(1000 + Math.random() * 9000)}`;
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'bot',
            text: 'بر اساس علائم ثبت‌شده، وضعیت شما فوریتی و نیازمند بررسی سریع ارزیابی شد. لطفاً بدون فوت وقت با خط مستقیم اورژانس مطب تماس گرفته و کد تریاژ زیر را به پرسنل اعلام فرمایید:',
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
            text: 'ضایعات و توده‌های پستان نیازمند معاینه بالینی دقیق و بررسی پرونده توسط سرکار خانم دکتر معشوری هستند. لطفاً وقت ویزیت حضوری رزرو نموده و تمامی گرافی‌ها و مدارک قبلی را همراه داشته باشید.',
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
            text: 'در جراحی‌های زیبایی و ماموپلاستی، بررسی آناتومی و تقارن در جلسه ویزیت اولیه حضوری انجام می‌شود تا بهترین متد جراحی تعیین گردد.',
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
            text: 'پیام شما دریافت شد. در صورت نیاز به راهنمایی بیشتر می‌توانید با شماره تلفن مطب تماس گرفته یا نوبت حضوری دریافت نمایید.',
            showBookingAction: true,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    }, 1100);
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
          className="bg-primary hover:bg-primary-dark text-white rounded-full py-3 px-6 md:py-3.5 md:px-8 shadow-2xl shadow-primary/40 transition-all duration-300 hover:-translate-y-1 font-bold flex items-center gap-2.5 border border-white/30 backdrop-blur-md cursor-pointer group"
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

      {/* Full-Width / Full-Screen Popup Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-0 md:p-6 animate-fadeSlide">
          {/* Main Modal Box (Takes Full Screen on Mobile, Wide Container on Desktop) */}
          <div className="w-full h-full md:h-[86vh] md:max-w-5xl md:rounded-[2.5rem] bg-gradient-to-br from-bgLight/95 via-white/95 to-bgDark/95 backdrop-blur-2xl border border-primary/30 flex flex-col shadow-2xl overflow-hidden relative">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-5 py-4 bg-white/70 backdrop-blur-xl border-b border-primary/20 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white shadow-md">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-black text-textDark flex items-center gap-2">
                    دستیار هوشمند تریاژ و مشاوره مطب
                    <Sparkles className="w-4 h-4 text-primary" />
                  </h3>
                  <p className="text-xs text-primary font-bold flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    پاسخگویی آنلاین و فوری به علائم بالینی
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="tel:09121234567"
                  className="hidden sm:flex items-center gap-1.5 text-xs font-bold bg-red-500/10 border border-red-500/25 text-red-600 px-3 py-1.5 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  اورژانس ۲۴ ساعته
                </a>
                <button
                  onClick={onToggle}
                  className="text-textDark/60 hover:text-primary transition-colors p-2 rounded-full hover:bg-white/80"
                  aria-label="بستن پنجره"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body: 2-Column on Desktop (Sidebar Quick Topics + Chat Window) */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              
              {/* Left/Sidebar: Quick Topics and Guide (Hidden on mobile or top slider) */}
              <div className="hidden md:flex flex-col w-72 bg-white/40 border-l border-primary/15 p-5 shrink-0 overflow-y-auto chat-scroll">
                <h4 className="text-xs font-black text-primary uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4" />
                  موضوعات پرتکرار و تریاژ
                </h4>
                <p className="text-xs text-textDark/70 mb-4 font-medium leading-relaxed">
                  روی هر یک از گزینه‌ها کلیک کنید تا راهنمایی اولیه دریافت نمایید:
                </p>

                <div className="flex flex-col gap-2">
                  {QUICK_PROMPTS.map((prompt, i) => {
                    const Icon = prompt.icon;
                    return (
                      <button
                        key={i}
                        onClick={() => handleSend(prompt.text)}
                        className={`text-right p-3 rounded-2xl text-xs font-bold border transition-all flex items-start gap-2.5 ${
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
                    className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md shadow-primary/25 transition-all"
                  >
                    <Calendar className="w-4 h-4" />
                    رزرو مستقیم نوبت ویزیت
                  </button>
                </div>
              </div>

              {/* Main Chat Area */}
              <div className="flex-1 flex flex-col justify-between overflow-hidden bg-white/20">
                
                {/* Mobile Quick Tap Chips (Horizontal Slider) */}
                <div className="md:hidden flex gap-2 p-3 overflow-x-auto border-b border-primary/10 bg-white/40 shrink-0 chat-scroll">
                  {QUICK_PROMPTS.slice(0, 4).map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(prompt.text)}
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

                {/* Messages Container */}
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

                        {/* Emergency Box inside Message */}
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

                        {/* Booking Action Button inside Message */}
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

                {/* Input Bar */}
                <div className="p-3.5 md:p-4 bg-white/70 border-t border-primary/20 backdrop-blur-xl shrink-0">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSend();
                    }}
                    className="flex gap-2.5 max-w-4xl mx-auto"
                  >
                    <input
                      type="text"
                      placeholder="علائم، پرسش پزشکی یا دلیل مراجعه خود را بنویسید..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="flex-1 bg-white border border-primary/30 shadow-inner rounded-2xl px-4 py-3 text-sm md:text-base text-textDark focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder-textDark/45 font-medium"
                    />
                    <button
                      type="submit"
                      className="bg-primary hover:bg-primary-dark text-white rounded-2xl w-12 h-12 md:w-14 md:h-12 flex items-center justify-center transition-transform hover:scale-105 shrink-0 shadow-lg shadow-primary/30 cursor-pointer"
                    >
                      <Send className="w-5 h-5 rotate-180" />
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
