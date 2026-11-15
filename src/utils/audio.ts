// Synthesized Web Audio FX + Spooky Ghost Audio Engine — zero external dependencies

class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private musicInterval: number | null = null;
  private musicStep: number = 0;
  private lastGhostWailAt: number = 0;

  private ensureContext(): AudioContext | null {
    if (this.muted) return null;
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    if (muted) {
      this.stopAmbient();
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'triangle',
    gainVal: number = 0.08,
    delay: number = 0,
    slideTo?: number
  ) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(20, slideTo),
        now + duration
      );
    }
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(gainVal, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playClick() {
    this.playTone(520, 0.07, 'sine', 0.06, 0, 680);
  }

  public playJump(isDouble: boolean = false) {
    if (isDouble) {
      this.playTone(440, 0.13, 'triangle', 0.08, 0, 880);
      this.playTone(660, 0.1, 'sine', 0.06, 0.05, 1120);
    } else {
      this.playTone(300, 0.14, 'triangle', 0.07, 0, 620);
    }
  }

  public playDash() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    // Filtered noise whoosh + synth sweep
    const bufferSize = Math.floor(ctx.sampleRate * 0.22);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(2200, ctx.currentTime + 0.2);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.09, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();

    this.playTone(260, 0.18, 'sine', 0.06, 0, 740);
  }

  public playZap() {
    this.playTone(1040, 0.14, 'sawtooth', 0.06, 0, 240);
    this.playTone(1480, 0.11, 'triangle', 0.06, 0.02, 520);
  }

  public playGhostWail() {
    const nowMs = Date.now();
    if (nowMs - this.lastGhostWailAt < 950) return;
    this.lastGhostWailAt = nowMs;

    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Eerie dual-oscillator wail with LFO vibrato ("WooooOooo!")
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const masterGain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    osc1.frequency.setValueAtTime(420, now);
    osc1.frequency.linearRampToValueAtTime(660, now + 0.22);
    osc1.frequency.exponentialRampToValueAtTime(250, now + 0.78);

    osc2.frequency.setValueAtTime(426, now);
    osc2.frequency.linearRampToValueAtTime(672, now + 0.22);
    osc2.frequency.exponentialRampToValueAtTime(255, now + 0.78);

    lfo.frequency.setValueAtTime(7.5, now);
    lfoGain.gain.setValueAtTime(22, now);
    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);
    lfoGain.connect(osc2.frequency);

    masterGain.gain.setValueAtTime(0.001, now);
    masterGain.gain.linearRampToValueAtTime(0.075, now + 0.12);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc1.connect(masterGain);
    osc2.connect(masterGain);
    masterGain.connect(ctx.destination);

    lfo.start(now);
    osc1.start(now);
    osc2.start(now);

    lfo.stop(now + 0.82);
    osc1.stop(now + 0.82);
    osc2.stop(now + 0.82);
  }

  public playGhostBanish() {
    this.playTone(760, 0.1, 'sine', 0.08, 0, 1220);
    this.playTone(980, 0.18, 'triangle', 0.08, 0.07, 420);
  }

  public playSmash() {
    this.playTone(180, 0.14, 'square', 0.06, 0, 75);
    this.playTone(420, 0.09, 'triangle', 0.07, 0.03, 680);
  }

  public playSpring() {
    this.playTone(220, 0.22, 'sine', 0.08, 0, 880);
    this.playTone(340, 0.16, 'triangle', 0.06, 0.04, 980);
  }

  public playBossHit() {
    this.playTone(140, 0.16, 'sawtooth', 0.07, 0, 420);
    this.playTone(580, 0.14, 'square', 0.05, 0.05, 220);
  }

  public playCoinBuy() {
    this.playTone(660, 0.08, 'triangle', 0.08, 0);
    this.playTone(990, 0.14, 'triangle', 0.09, 0.06);
  }

  public playSlam() {
    this.playTone(150, 0.18, 'sawtooth', 0.08, 0, 52);
    this.playTone(95, 0.22, 'triangle', 0.09, 0, 42);
  }

  public playLand() {
    this.playTone(130, 0.06, 'sine', 0.035, 0, 75);
  }

  public playSlowMo() {
    this.playTone(720, 0.35, 'sine', 0.07, 0, 220);
    this.playTone(540, 0.35, 'triangle', 0.05, 0.05, 180);
  }

  public playFever() {
    this.playTone(523.25, 0.09, 'triangle', 0.07, 0);
    this.playTone(659.25, 0.09, 'triangle', 0.07, 0.06);
    this.playTone(783.99, 0.09, 'triangle', 0.08, 0.12);
    this.playTone(1046.5, 0.22, 'triangle', 0.09, 0.18);
  }

  public playPowerup() {
    this.playTone(523.25, 0.08, 'triangle', 0.08, 0);
    this.playTone(659.25, 0.08, 'triangle', 0.08, 0.06);
    this.playTone(783.99, 0.09, 'triangle', 0.08, 0.12);
    this.playTone(1046.5, 0.2, 'sine', 0.09, 0.18);
  }

  public playShieldBlock() {
    this.playTone(320, 0.12, 'triangle', 0.08, 0, 640);
    this.playTone(640, 0.18, 'sine', 0.07, 0.08, 380);
  }

  public playPickup() {
    this.playTone(587.33, 0.08, 'triangle', 0.07, 0);
    this.playTone(880, 0.14, 'triangle', 0.08, 0.06);
  }

  public playUnlock() {
    this.playTone(440, 0.1, 'square', 0.05, 0);
    this.playTone(554.37, 0.1, 'square', 0.05, 0.09);
    this.playTone(659.25, 0.14, 'triangle', 0.08, 0.18);
    this.playTone(880, 0.24, 'triangle', 0.09, 0.28);
  }

  public playError() {
    this.playTone(210, 0.14, 'sawtooth', 0.05, 0, 145);
    this.playTone(165, 0.18, 'sawtooth', 0.05, 0.12, 120);
  }

  public playNoiseAlert() {
    this.playTone(340, 0.12, 'sawtooth', 0.06, 0, 480);
    this.playTone(480, 0.15, 'sawtooth', 0.06, 0.13, 300);
  }

  public playZombieGroan() {
    this.playTone(135, 0.35, 'sawtooth', 0.05, 0, 92);
  }

  public playHide() {
    this.playTone(320, 0.12, 'sine', 0.05, 0, 220);
  }

  public playVictory() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.25, 'triangle', 0.09, idx * 0.12);
    });
  }

  public playGameOver() {
    const notes = [392, 349.23, 311.13, 261.63];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.28, 'sawtooth', 0.05, idx * 0.16);
    });
  }

  public startAmbient() {
    if (this.muted || this.musicInterval !== null) return;
    // Spooky haunted arcade bassline + occasional eerie ghost chime/whisper
    const bassPattern = [146.83, 0, 174.61, 164.81, 146.83, 0, 196.0, 174.61];
    this.musicInterval = window.setInterval(() => {
      if (this.muted) return;
      const freq = bassPattern[this.musicStep % bassPattern.length];
      if (freq > 0) {
        this.playTone(freq, 0.18, 'triangle', 0.025);
      }
      // Every 12 steps play a subtle haunted ghost howl or owl chime
      if (this.musicStep % 16 === 6) {
        this.playTone(622.25, 0.45, 'sine', 0.02, 0, 466.16);
      } else if (this.musicStep % 16 === 14) {
        this.playTone(740, 0.38, 'sine', 0.018, 0, 554.37);
      }
      this.musicStep += 1;
    }, 440);
  }

  public stopAmbient() {
    if (this.musicInterval !== null) {
      window.clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const soundFX = new SoundEngine();
