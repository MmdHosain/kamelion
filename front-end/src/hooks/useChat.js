// src/hooks/useChat.js
import { useState, useRef } from 'react';

export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [heroInput, setHeroInput] = useState('');
  const [chatState, setChatState] = useState('minimized');
  const [isPlayingScenario, setIsPlayingScenario] = useState(false);

  const scenarioIntervalRef = useRef(null);

  const playScenario = (scenarioMessages) => {
    if (!Array.isArray(scenarioMessages) || scenarioMessages.length === 0) return;

    if (scenarioIntervalRef.current) {
      clearInterval(scenarioIntervalRef.current);
      scenarioIntervalRef.current = null;
    }

    setIsPlayingScenario(true);

    setMessages((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      const firstScenarioMessage = scenarioMessages[0];

      const isDuplicate = lastMessage &&
        firstScenarioMessage &&
        lastMessage.role === firstScenarioMessage.role &&
        lastMessage.type === firstScenarioMessage.type &&
        lastMessage.content === firstScenarioMessage.content;

      return isDuplicate
        ? [...prevMessages]
        : [...prevMessages, firstScenarioMessage];
    });

    let currentIndex = 1;

    scenarioIntervalRef.current = setInterval(() => {
      setMessages((prevMessages) => {
        if (currentIndex >= scenarioMessages.length) {
          clearInterval(scenarioIntervalRef.current);
          scenarioIntervalRef.current = null;
          setIsPlayingScenario(false);
          return prevMessages;
        }

        const nextMessage = scenarioMessages[currentIndex];
        currentIndex += 1;
        return [...prevMessages, nextMessage];
      });
    }, 500);
  };

  const handleSendMessage = (text) => {
    if (!text.trim()) return;

    if (isPlayingScenario) return;

    const userMessage = { role: 'user', type: 'text', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setHeroInput('');
  };

  const handleHeroSubmit = ({ heroInput, setHeroInput, setChatState }) => {
    if (!heroInput.trim()) return;
    setMessages([]);
    handleSendMessage(heroInput);
    setChatState('maximized');
    setHeroInput('');
  };

  const handleCtaAction = (payload, onOpenSignup) => {
    if (payload.action === 'open_signup') {
      onOpenSignup();
    }
    if (payload.action === 'open_appointment') {
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
    playScenario,
    isPlayingScenario
  };
};
