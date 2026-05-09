import { ENCOURAGEMENT_PHRASES } from '../constants';

class VoiceService {
  private synth: SpeechSynthesis | null = null;
  private voice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.synth = window.speechSynthesis;
      this.loadVoice();
    }
  }

  private loadVoice() {
    const voices = this.synth?.getVoices() || [];
    // Prefer a clear Chinese/English voice depending on content, but keep it simple
    this.voice = voices.find(v => v.lang.includes('zh') || v.lang.includes('en')) || voices[0];
  }

  speak(text: string) {
    if (!this.synth) return;
    this.synth.cancel(); // Stop current speech
    const utterance = new SpeechSynthesisUtterance(text);
    if (this.voice) utterance.voice = this.voice;
    utterance.rate = 1.1;
    utterance.pitch = 1.0;
    this.synth.speak(utterance);
  }

  announceStart(name: string) {
    this.speak(`准备，${name}，开始！`);
  }

  announceRest(seconds: number, nextName?: string) {
    const nextText = nextName ? `下一个动作：${nextName}` : '准备结束';
    this.speak(`休息 ${seconds} 秒。${nextText}`);
  }

  announcePhase(phaseName: string) {
    this.speak(`${phaseName}结束，准备进入下一阶段。`);
  }

  announceEncouragement() {
    const phrase = ENCOURAGEMENT_PHRASES[Math.floor(Math.random() * ENCOURAGEMENT_PHRASES.length)];
    this.speak(`时间过半，${phrase}`);
  }

  announceCountdown(num: number) {
    this.speak(num.toString());
  }
}

export const voiceService = new VoiceService();
