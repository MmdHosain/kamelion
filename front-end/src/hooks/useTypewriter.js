// src/hooks/useTypewriter.js
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

/**
 * Splits text into tokens/chunks suitable for Persian, Arabic, and Latin text.
 * Preserves word ligatures, zero-width non-joiners (\u200c ZWNJ), punctuation, and newlines.
 */
export const tokenizeText = (text) => {
  if (!text || typeof text !== 'string') return [];

  // Match non-whitespace sequences (words + punctuation) and whitespace sequences (spaces, newlines)
  const tokens = text.match(/\S+|\s+/g) || [];
  const chunks = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (/\S/.test(token)) {
      // It's a word token
      const nextToken = tokens[i + 1];
      // If followed by regular horizontal whitespace (not a newline), group together so space isn't a standalone pause
      if (nextToken && /^[^\S\r\n]+$/.test(nextToken)) {
        chunks.push(token + nextToken);
        i++;
      } else {
        chunks.push(token);
      }
    } else {
      // Standalone newline or vertical space
      chunks.push(token);
    }
  }

  return chunks;
};

/**
 * Custom hook for smooth typewriter and fade-in text reveals.
 *
 * @param {Object} options
 * @param {string} options.text - Full text to reveal
 * @param {boolean} options.enabled - Whether typewriter effect should run (false = instant full reveal)
 * @param {Function} [options.onWordRevealed] - Callback invoked when a word/chunk appears
 * @param {Function} [options.onComplete] - Callback invoked once all text has been revealed
 */
export function useTypewriter({
  text = '',
  enabled = true,
  onWordRevealed,
  onComplete,
}) {
  const chunks = useMemo(() => tokenizeText(text), [text]);
  const [displayedCount, setDisplayedCount] = useState(() => (enabled ? 0 : chunks.length));
  const [isTyping, setIsTyping] = useState(() => Boolean(enabled && chunks.length > 0));

  const onWordRevealedRef = useRef(onWordRevealed);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onWordRevealedRef.current = onWordRevealed;
  }, [onWordRevealed]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!enabled || !text) {
      setDisplayedCount(chunks.length);
      setIsTyping(false);
      return;
    }

    setDisplayedCount(0);
    setIsTyping(true);

    if (chunks.length === 0) {
      setIsTyping(false);
      onCompleteRef.current?.();
      return;
    }

    // Adaptive typing interval: ensures short responses take ~0.6-0.8s
    // and longer responses finish comfortably within ~2.0-2.5s
    const intervalMs = Math.max(16, Math.min(42, Math.floor(2100 / chunks.length)));

    let currentIndex = 0;
    let timerId = null;

    const tick = () => {
      currentIndex += 1;
      setDisplayedCount(currentIndex);
      onWordRevealedRef.current?.(currentIndex, chunks.length);

      if (currentIndex < chunks.length) {
        timerId = setTimeout(tick, intervalMs);
      } else {
        setIsTyping(false);
        onCompleteRef.current?.();
      }
    };

    // Initial 90ms tick gives a seamless crossfade transition from the loading indicator
    timerId = setTimeout(tick, 90);

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [text, enabled, chunks]);

  // Skip / reveal instantly (e.g. if user clicks the message bubble)
  const revealAll = useCallback(() => {
    setDisplayedCount(chunks.length);
    setIsTyping(false);
    onCompleteRef.current?.();
  }, [chunks.length]);

  return {
    chunks,
    displayedCount,
    isTyping,
    revealAll,
    displayedText: useMemo(() => {
      return chunks.slice(0, displayedCount).join('');
    }, [chunks, displayedCount]),
  };
}

export default useTypewriter;
