'use client';

import { useEffect, useState } from 'react';
import { SpeechConfig } from '@/hooks/useSpeech';
import {
  VoicevoxSpeaker,
  checkVoicevox,
  fetchVoicevoxSpeakers,
  getJapaneseVoiceNames,
} from '@/lib/tts';

interface Props {
  config: SpeechConfig;
  onChange: (config: SpeechConfig) => void;
  onClose: () => void;
}

type VoicevoxStatus = 'checking' | 'connected' | 'disconnected';

export function VoiceSettingsModal({ config, onChange, onClose }: Props) {
  const [status, setStatus] = useState<VoicevoxStatus>('checking');
  const [speakers, setSpeakers] = useState<VoicevoxSpeaker[]>([]);
  const [webVoiceNames, setWebVoiceNames] = useState<string[]>([]);

  useEffect(() => {
    // VOICEVOX 接続チェック
    checkVoicevox(config.voicevoxBaseUrl).then((ok) => {
      setStatus(ok ? 'connected' : 'disconnected');
      if (ok) fetchVoicevoxSpeakers(config.voicevoxBaseUrl).then(setSpeakers);
    });

    // Web Speech ボイス一覧
    const loadVoices = () => setWebVoiceNames(getJapaneseVoiceNames());
    loadVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [config.voicevoxBaseUrl]);

  // VOICEVOX の全スタイルをフラットに展開
  const speakerStyles = speakers.flatMap((s) =>
    s.styles.map((style) => ({ label: `${s.name}（${style.name}）`, id: style.id }))
  );

  const statusColor =
    status === 'connected' ? 'text-green-600' : status === 'disconnected' ? 'text-red-400' : 'text-gray-400';
  const statusLabel =
    status === 'connected' ? '● 接続済み' : status === 'disconnected' ? '● 未接続' : '確認中...';

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-900">🎙️ 音声設定</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {/* エンジン選択 */}
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">エンジン</p>
        <div className="flex gap-3 mb-5">
          {(
            [
              {
                id: 'voicevox',
                name: 'VOICEVOX',
                sub: 'ずんだもん等',
                badge: statusLabel,
                badgeColor: statusColor,
              },
              {
                id: 'webspeech',
                name: 'Web Speech',
                sub: 'ブラウザ内蔵',
                badge: '● 常時利用可',
                badgeColor: 'text-green-600',
              },
            ] as const
          ).map((opt) => (
            <label
              key={opt.id}
              className={`flex-1 border-2 rounded-xl p-3 cursor-pointer text-center transition-colors ${
                config.engine === opt.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                className="hidden"
                checked={config.engine === opt.id}
                onChange={() => onChange({ ...config, engine: opt.id })}
              />
              <div className="font-semibold text-sm text-gray-800">{opt.name}</div>
              <div className="text-xs text-gray-400 mt-0.5">{opt.sub}</div>
              <div className={`text-xs mt-1 font-medium ${opt.badgeColor}`}>{opt.badge}</div>
            </label>
          ))}
        </div>

        {/* VOICEVOX 設定 */}
        {config.engine === 'voicevox' && (
          <div className="mb-5">
            {status === 'disconnected' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3 text-xs text-amber-700 leading-relaxed">
                VOICEVOXが起動していません。アプリを起動してから「更新」してください。
                <a
                  href="https://voicevox.hiroshiba.jp/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline ml-1"
                >
                  ダウンロード →
                </a>
              </div>
            )}
            {speakerStyles.length > 0 && (
              <>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  キャラクター
                </p>
                <select
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={config.voicevoxSpeakerId}
                  onChange={(e) =>
                    onChange({ ...config, voicevoxSpeakerId: Number(e.target.value) })
                  }
                >
                  {speakerStyles.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
        )}

        {/* Web Speech 音声選択 */}
        {config.engine === 'webspeech' && (
          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              日本語音声（macOS推奨: Kyoko）
            </p>
            <select
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={config.webSpeechVoiceName ?? ''}
              onChange={(e) =>
                onChange({ ...config, webSpeechVoiceName: e.target.value || null })
              }
            >
              <option value="">自動選択（Kyoko 優先）</option>
              {webVoiceNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 速度 */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            速度: {config.rate.toFixed(1)}×
          </p>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={config.rate}
            onChange={(e) => onChange({ ...config, rate: Number(e.target.value) })}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>遅い</span>
            <span>速い</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          閉じる
        </button>
      </div>
    </div>
  );
}
