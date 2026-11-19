export type MusicPreset = 'musicbox' | 'piano' | 'custom';

interface MelodyNote {
  freq: number;
  bass?: number;
  chord?: number[];
  duration: number; // in beats
}

// Complete "Happy Birthday / Selamat Ulang Tahun" in F major (3/4 time)
const F_MAJOR_BIRTHDAY_SONG: MelodyNote[] = [
  // Phrase 1: C4 C4 | D4 C4 F4 | E4 -
  { freq: 261.63, duration: 0.72 },
  { freq: 261.63, duration: 0.28 },
  { freq: 293.66, bass: 174.61, chord: [220.0, 261.63], duration: 1.0 }, // F major
  { freq: 261.63, duration: 1.0 },
  { freq: 349.23, duration: 1.0 },
  { freq: 329.63, bass: 130.81, chord: [196.0, 233.08], duration: 2.0 }, // C7

  // Phrase 2: C4 C4 | D4 C4 G4 | F4 -
  { freq: 261.63, duration: 0.72 },
  { freq: 261.63, duration: 0.28 },
  { freq: 293.66, bass: 130.81, chord: [196.0, 233.08], duration: 1.0 }, // C7
  { freq: 261.63, duration: 1.0 },
  { freq: 392.0, duration: 1.0 },
  { freq: 349.23, bass: 174.61, chord: [220.0, 261.63], duration: 2.0 }, // F major

  // Phrase 3: C4 C4 | C5 A4 F4 | E4 D4
  { freq: 261.63, duration: 0.72 },
  { freq: 261.63, duration: 0.28 },
  { freq: 523.25, bass: 174.61, chord: [220.0, 261.63], duration: 1.0 }, // F major
  { freq: 440.0, duration: 1.0 },
  { freq: 349.23, bass: 116.54, chord: [174.61, 233.08], duration: 1.0 }, // Bb major
  { freq: 329.63, duration: 1.0 },
  { freq: 293.66, duration: 2.0 },

  // Phrase 4: Bb4 Bb4 | A4 F4 G4 | F4 -
  { freq: 466.16, duration: 0.72 },
  { freq: 466.16, duration: 0.28 },
  { freq: 440.0, bass: 174.61, chord: [220.0, 261.63], duration: 1.0 }, // F major
  { freq: 349.23, duration: 1.0 },
  { freq: 392.0, bass: 130.81, chord: [196.0, 233.08], duration: 1.0 }, // C7
  { freq: 349.23, bass: 174.61, chord: [220.0, 261.63], duration: 2.5 }, // F major resolve
];

export class BirthdayMusicEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private timerId: number | null = null;
  private noteIndex = 0;
  private nextNoteTime = 0;
  private isPlaying = false;
  private preset: 'musicbox' | 'piano' = 'musicbox';
  private volume = 0.65;
  private muted = false;

  public getPlaying(): boolean {
    return this.isPlaying;
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      const target = this.muted ? 0 : this.volume * 0.45;
      this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.04);
    }
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.masterGain && this.ctx) {
      const target = this.muted ? 0 : this.volume * 0.45;
      this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.04);
    }
  }

  public setPreset(preset: 'musicbox' | 'piano'): void {
    this.preset = preset;
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;

    if (!this.ctx) {
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.muted ? 0 : this.volume * 0.45;
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private scheduleNote(note: MelodyNote, startTime: number, beatSec: number): void {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const master = this.masterGain;
    const durSec = note.duration * beatSec;

    if (this.preset === 'musicbox') {
      // Delicate bell / music-box tone (sine + soft 2nd harmonic)
      const freq = note.freq * 2; // octave higher for crystalline music box feel
      const osc = ctx.createOscillator();
      const overtone = ctx.createOscillator();
      const gain = ctx.createGain();
      const overtoneGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      overtone.type = 'sine';
      overtone.frequency.setValueAtTime(freq * 2, startTime);
      overtoneGain.gain.setValueAtTime(0.16, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.32, startTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + Math.max(0.45, durSec * 1.15));

      osc.connect(gain);
      overtone.connect(overtoneGain);
      overtoneGain.connect(gain);
      gain.connect(master);

      osc.start(startTime);
      overtone.start(startTime);
      osc.stop(startTime + Math.max(0.5, durSec * 1.2));
      overtone.stop(startTime + Math.max(0.5, durSec * 1.2));

      if (note.chord) {
        for (const cf of note.chord) {
          const cOsc = ctx.createOscillator();
          const cGain = ctx.createGain();
          cOsc.type = 'sine';
          cOsc.frequency.setValueAtTime(cf * 2, startTime);
          cGain.gain.setValueAtTime(0.0001, startTime);
          cGain.gain.exponentialRampToValueAtTime(0.08, startTime + 0.02);
          cGain.gain.exponentialRampToValueAtTime(0.0001, startTime + durSec * 1.3);
          cOsc.connect(cGain);
          cGain.connect(master);
          cOsc.start(startTime);
          cOsc.stop(startTime + durSec * 1.35);
        }
      }
    } else {
      // Warm soft piano arrangement (triangle + lowpass filter + warm bass)
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.freq, startTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, startTime);
      filter.frequency.exponentialRampToValueAtTime(480, startTime + durSec);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.38, startTime + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + Math.max(0.5, durSec * 1.25));

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(master);

      osc.start(startTime);
      osc.stop(startTime + Math.max(0.55, durSec * 1.3));

      if (note.bass) {
        const bOsc = ctx.createOscillator();
        const bGain = ctx.createGain();
        bOsc.type = 'sine';
        bOsc.frequency.setValueAtTime(note.bass, startTime);
        bGain.gain.setValueAtTime(0.0001, startTime);
        bGain.gain.exponentialRampToValueAtTime(0.24, startTime + 0.04);
        bGain.gain.exponentialRampToValueAtTime(0.0001, startTime + durSec * 1.8);
        bOsc.connect(bGain);
        bGain.connect(master);
        bOsc.start(startTime);
        bOsc.stop(startTime + durSec * 1.85);
      }

      if (note.chord) {
        for (const cf of note.chord) {
          const cOsc = ctx.createOscillator();
          const cGain = ctx.createGain();
          cOsc.type = 'sine';
          cOsc.frequency.setValueAtTime(cf, startTime);
          cGain.gain.setValueAtTime(0.0001, startTime);
          cGain.gain.exponentialRampToValueAtTime(0.11, startTime + 0.03);
          cGain.gain.exponentialRampToValueAtTime(0.0001, startTime + durSec * 1.5);
          cOsc.connect(cGain);
          cGain.connect(master);
          cOsc.start(startTime);
          cOsc.stop(startTime + durSec * 1.55);
        }
      }
    }
  }

  private schedulerTick = (): void => {
    if (!this.isPlaying || !this.ctx) return;
    const beatSec = this.preset === 'musicbox' ? 0.56 : 0.62;
    const lookaheadSec = 0.25;

    while (this.nextNoteTime < this.ctx.currentTime + lookaheadSec) {
      const note = F_MAJOR_BIRTHDAY_SONG[this.noteIndex];
      this.scheduleNote(note, this.nextNoteTime, beatSec);
      this.nextNoteTime += note.duration * beatSec;
      this.noteIndex = (this.noteIndex + 1) % F_MAJOR_BIRTHDAY_SONG.length;
    }

    this.timerId = window.setTimeout(this.schedulerTick, 80);
  };

  public start(fromBeginning = false): boolean {
    const ctx = this.ensureContext();
    if (!ctx) return false;

    if (fromBeginning) {
      this.noteIndex = 0;
    }
    if (this.isPlaying) return true;

    this.isPlaying = true;
    this.nextNoteTime = ctx.currentTime + 0.06;
    this.schedulerTick();
    return true;
  }

  public stop(): void {
    this.isPlaying = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  public dispose(): void {
    this.stop();
    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
      this.masterGain = null;
    }
  }
}

export const birthdayMusicEngine = new BirthdayMusicEngine();
