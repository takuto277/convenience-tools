// VOICEVOX (ローカル) + Web Speech API 両対応の TTS ユーティリティ
// クライアントサイド専用 — サーバーでは呼ばないこと

export interface VoicevoxSpeaker {
  name: string;
  speaker_uuid: string;
  styles: { name: string; id: number }[];
}

export async function checkVoicevox(baseUrl: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${baseUrl}/version`, { signal: controller.signal });
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchVoicevoxSpeakers(baseUrl: string): Promise<VoicevoxSpeaker[]> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const data = await fetch(`${baseUrl}/speakers`, { signal: controller.signal }).then((r) =>
      r.json()
    );
    clearTimeout(timer);
    return data as VoicevoxSpeaker[];
  } catch {
    return [];
  }
}

/** VOICEVOX でテキストを読み上げる。stop() したい場合は AbortController を渡す */
export async function voicevoxSpeak(
  text: string,
  speakerId: number,
  baseUrl: string,
  signal: AbortSignal
): Promise<void> {
  // Step1: audio_query
  const query = await fetch(
    `${baseUrl}/audio_query?text=${encodeURIComponent(text)}&speaker=${speakerId}`,
    { method: 'POST', signal }
  ).then((r) => r.json());

  // speedScale で読み上げ速度を調整（設定値は呼び出し元で適用済みにできるが、ここで上書きも可）
  // query.speedScale = 1.1;

  // Step2: synthesis → WAV blob
  const blob = await fetch(`${baseUrl}/synthesis?speaker=${speakerId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query),
    signal,
  }).then((r) => r.blob());

  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);

  return new Promise<void>((resolve) => {
    const cleanup = () => {
      URL.revokeObjectURL(url);
      resolve();
    };
    audio.onended = cleanup;
    audio.onerror = cleanup;
    signal.addEventListener('abort', () => { audio.pause(); cleanup(); }, { once: true });
    audio.play().catch(cleanup);
  });
}

/** macOS Kyoko など最適な日本語ボイスを返す */
export function getBestJapaneseVoice(preferredName: string | null): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (preferredName) {
    const found = voices.find((v) => v.name === preferredName);
    if (found) return found;
  }
  // 優先順位: Kyoko > O-ren > その他 ja-JP
  return (
    voices.find((v) => v.lang === 'ja-JP' && v.name === 'Kyoko') ||
    voices.find((v) => v.lang === 'ja-JP' && v.name === 'O-ren') ||
    voices.find((v) => v.lang === 'ja-JP') ||
    null
  );
}

export function getJapaneseVoiceNames(): string[] {
  if (typeof window === 'undefined' || !window.speechSynthesis) return [];
  return window.speechSynthesis.getVoices()
    .filter((v) => v.lang.startsWith('ja'))
    .map((v) => v.name);
}

/** Web Speech API でテキストを読み上げる */
export function webSpeechSpeak(
  text: string,
  voiceName: string | null,
  rate: number,
  onEnd: () => void
): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    onEnd();
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  utterance.rate = rate;
  const voice = getBestJapaneseVoice(voiceName);
  if (voice) utterance.voice = voice;
  utterance.onend = onEnd;
  utterance.onerror = onEnd;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}
