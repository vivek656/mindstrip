'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface VoiceDictationButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
  size?: 'sm' | 'md';
  title?: string;
}

export function VoiceDictationButton({
  onTranscript,
  className = '',
  size = 'md',
  title = 'Speak your story or brain dump (Voice-to-Text)'
}: VoiceDictationButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript.trim()) {
            onTranscript(currentTranscript.trim());
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition event:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscript, isListening]);

  const toggleListening = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSupported || !recognitionRef.current) {
      alert('Speech-to-text is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Could not start speech recognition:', err);
        setIsListening(false);
      }
    }
  };

  if (!isSupported) return null;

  const btnSizeClasses =
    size === 'sm'
      ? 'w-7 h-7 p-1 text-xs'
      : 'w-9 h-9 p-2 text-sm';

  return (
    <button
      type="button"
      onClick={toggleListening}
      title={isListening ? 'Stop listening' : title}
      className={`relative inline-flex items-center justify-center rounded-xl transition-all cursor-pointer focus:outline-hidden ${
        isListening
          ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/30 scale-105'
          : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
      } ${btnSizeClasses} ${className}`}
    >
      {isListening && (
        <span className="absolute -inset-1 rounded-xl bg-rose-500/30 animate-ping pointer-events-none" />
      )}
      {isListening ? (
        <Mic className="w-4 h-4 animate-pulse text-white" />
      ) : (
        <Mic className="w-4 h-4" />
      )}
    </button>
  );
}
