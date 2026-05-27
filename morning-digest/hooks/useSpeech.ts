'use client';

import { useRef, useState } from 'react';
import { Article } from '@/lib/types';
import { voicevoxSpeak, webSpeechSpeak } from '@/lib/tts';

export interface SpeechConfig {
  engine: 'voicevox' | 'webspeech';
  voicevoxSpeakerId: number;   // 3 = ずんだもん ノーマル
  voicevoxBaseUrl: string;
  webSpeechVoiceName: string | null;
  rate: number;
}

export const DEFAULT_SPEECH_CONFIG: SpeechConfig = {
  engine: 'webspeech',
  voicevoxSpeakerId: 3,
  voicevoxBaseUrl: 'http://localhost:50021',
  webSpeechVoiceName: null, // null = 自動選択 (Kyoko優先)
  rate: 1.1,
};

function buildText(article: Article): string {
  return [article.title, article.summary].filter(Boolean).join('。');
}

export interface SpeechControls {
  isPlaying: boolean;
  isPaused: boolean;
  readingId: string | null;
  currentIndex: number;
  total: number;
  currentTitle: string | null;
  play: (articles: Article[]) => void;
  playSingle: (article: Article) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

export function useSpeech(config: SpeechConfig): SpeechControls {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [readingId, setReadingId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const queueRef = useRef<Article[]>([]);
  const idxRef = useRef(0);
  const playingRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const configRef = useRef(config);
  configRef.current = config;

  // speakNextRef パターン: stale closure 対策
  const speakNextRef = useRef<() => void>(() => undefined);
  speakNextRef.current = async () => {
    if (!playingRef.current) return;
    const article = queueRef.current[idxRef.current];
    if (!article) {
      playingRef.current = false;
      setIsPlaying(false);
      setReadingId(null);
      return;
    }

    setReadingId(article.id);
    setCurrentIndex(idxRef.current);
    const text = buildText(article);
    const cfg = configRef.current;

    const advance = () => {
      idxRef.current += 1;
      speakNextRef.current();
    };

    if (cfg.engine === 'voicevox') {
      abortRef.current = new AbortController();
      try {
        await voicevoxSpeak(
          text,
          cfg.voicevoxSpeakerId,
          cfg.voicevoxBaseUrl,
          abortRef.current.signal
        );
      } catch {
        // AbortError or network error — gracefully continue
      }
      if (playingRef.current) advance();
    } else {
      webSpeechSpeak(text, cfg.webSpeechVoiceName, cfg.rate, () => {
        if (playingRef.current) advance();
      });
    }
  };

  const stop = () => {
    playingRef.current = false;
    abortRef.current?.abort();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setReadingId(null);
  };

  const play = (articles: Article[]) => {
    stop(); // 既存の再生を確実に止めてから開始
    queueRef.current = articles;
    idxRef.current = 0;
    playingRef.current = true;
    setIsPlaying(true);
    setIsPaused(false);
    setCurrentIndex(0);
    // stop()の cancel が反映される1フレーム待ってから開始
    setTimeout(() => speakNextRef.current(), 80);
  };

  const playSingle = (article: Article) => play([article]);

  const pause = () => {
    if (configRef.current.engine === 'webspeech' && typeof window !== 'undefined') {
      window.speechSynthesis.pause();
    }
    setIsPaused(true);
  };

  const resume = () => {
    if (configRef.current.engine === 'webspeech' && typeof window !== 'undefined') {
      window.speechSynthesis.resume();
    }
    setIsPaused(false);
  };

  return {
    isPlaying,
    isPaused,
    readingId,
    currentIndex,
    total: queueRef.current.length,
    currentTitle: queueRef.current[currentIndex]?.title ?? null,
    play,
    playSingle,
    pause,
    resume,
    stop,
  };
}
