import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  Music,
  Pause,
  Play,
  SlidersHorizontal,
  Upload,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import type { SurpriseProfile } from '../types/surprise';
import { birthdayMusicEngine, type MusicPreset } from '../utils/musicPlayer';

interface BackgroundMusicPlayerProps {
  profile: SurpriseProfile;
  isPlaying: boolean;
  onPlayingChange: (playing: boolean) => void;
  onUpdateProfile: (updates: Partial<SurpriseProfile>) => Promise<void>;
}

const PRESET_LABELS: Record<'musicbox' | 'piano', string> = {
  musicbox: 'Selamat Ulang Tahun (Kotak Musik)',
  piano: 'Selamat Ulang Tahun (Piano Hangat)',
};

export function BackgroundMusicPlayer({
  profile,
  isPlaying,
  onPlayingChange,
  onUpdateProfile,
}: BackgroundMusicPlayerProps) {
  const activePreset: MusicPreset = profile.musicPreset ?? 'musicbox';
  const hasCustomAudio = activePreset === 'custom' && Boolean(profile.musicUrl);
  const trackLabel = hasCustomAudio
    ? profile.musicTitle || 'Lagu Pilihan Khusus'
    : activePreset === 'piano'
      ? PRESET_LABELS.piano
      : PRESET_LABELS.musicbox;

  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Settings form state
  const [draftPreset, setDraftPreset] = useState<MusicPreset>(activePreset);
  const [draftTitle, setDraftTitle] = useState(profile.musicTitle || '');
  const [draftUrl, setDraftUrl] = useState(profile.musicUrl || '');
  const [audioError, setAudioError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync preset & audio playback state
  useEffect(() => {
    if (activePreset === 'musicbox' || activePreset === 'piano') {
      birthdayMusicEngine.setPreset(activePreset);
    }
  }, [activePreset]);

  useEffect(() => {
    birthdayMusicEngine.setVolume(volume);
    birthdayMusicEngine.setMuted(isMuted);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (hasCustomAudio) {
      birthdayMusicEngine.stop();
      const audioEl = audioRef.current;
      if (!audioEl) return;
      if (isPlaying) {
        audioEl.play().catch(() => {
          onPlayingChange(false);
        });
      } else {
        audioEl.pause();
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (isPlaying) {
        const started = birthdayMusicEngine.start(false);
        if (!started) {
          onPlayingChange(false);
        }
      } else {
        birthdayMusicEngine.stop();
      }
    }
  }, [isPlaying, hasCustomAudio, profile.musicUrl, onPlayingChange]);

  useEffect(() => {
    return () => {
      birthdayMusicEngine.stop();
    };
  }, []);

  function openMusicModal() {
    setDraftPreset(activePreset);
    setDraftTitle(profile.musicTitle || '');
    setDraftUrl(profile.musicUrl || '');
    setAudioError('');
    setIsSettingsOpen(true);
  }

  function handleAudioFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAudioError('');

    if (file.size > 12 * 1024 * 1024) {
      setAudioError('Ukuran file audio maksimal 12 MB.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setDraftPreset('custom');
        setDraftUrl(reader.result);
        if (!draftTitle.trim()) {
          setDraftTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
      }
    };
    reader.onerror = () => {
      setAudioError('Gagal membaca file audio.');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  async function handleSaveMusicSettings(e: FormEvent) {
    e.preventDefault();
    setAudioError('');

    if (draftPreset === 'custom' && !draftUrl.trim()) {
      setAudioError('Unggah file lagu atau masukkan tautan audio MP3/WAV terlebih dahulu.');
      return;
    }

    setIsSaving(true);
    try {
      const nextTitle =
        draftPreset === 'custom'
          ? draftTitle.trim() || 'Lagu Ulang Tahun Pilihan'
          : PRESET_LABELS[draftPreset];

      await onUpdateProfile({
        musicPreset: draftPreset,
        musicTitle: nextTitle,
        musicUrl: draftPreset === 'custom' ? draftUrl.trim() : '',
      });
      setIsSettingsOpen(false);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      {hasCustomAudio && profile.musicUrl && (
        <audio
          ref={audioRef}
          src={profile.musicUrl}
          loop
          preload="auto"
          onError={() => onPlayingChange(false)}
        />
      )}

      {/* Compact Floating Music Bar — strictly single-row and under 44px height */}
      <div
        aria-label="Pemutar musik latar ulang tahun"
        className="fixed bottom-4 right-4 z-40 max-w-[calc(100vw-2rem)] sm:max-w-md bg-[#18181B] text-[#FAF9F6] border border-[#27272A] rounded-xl shadow-lg px-3 py-2 flex items-center gap-3"
      >
        <button
          type="button"
          onClick={() => onPlayingChange(!isPlaying)}
          className="w-8 h-8 rounded-lg bg-[#E11D48] hover:bg-[#BE123C] text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E11D48]"
          aria-label={isPlaying ? 'Jeda lagu latar' : 'Putar lagu ulang tahun'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>

        <div className="min-w-0 flex-1 pr-1">
          <p className="text-xs font-medium text-white truncate max-w-[170px] sm:max-w-[210px]">
            {trackLabel}
          </p>
          <p className="text-[11px] text-[#A1A1AA] truncate">
            {isPlaying ? 'Sedang diputar' : 'Musik latar siap diputar'}
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMuted((prev) => !prev)}
            className="p-1.5 text-[#D4D4D8] hover:text-white rounded-md transition-colors cursor-pointer"
            aria-label={isMuted ? 'Nyalakan suara musik' : 'Bisukan musik'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              const val = Number.parseFloat(e.target.value);
              setVolume(val);
              if (val > 0 && isMuted) setIsMuted(false);
            }}
            aria-label="Atur volume musik latar"
            className="w-16 accent-[#E11D48] cursor-pointer"
          />
        </div>

        <button
          type="button"
          onClick={() => setIsMuted((prev) => !prev)}
          className="sm:hidden p-1.5 text-[#D4D4D8] hover:text-white rounded-md transition-colors cursor-pointer"
          aria-label={isMuted ? 'Nyalakan suara musik' : 'Bisukan musik'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={openMusicModal}
          className="p-1.5 text-[#D4D4D8] hover:text-white rounded-md transition-colors cursor-pointer shrink-0"
          aria-label="Pilih atau unggah lagu latar"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Music Selection & Upload Modal */}
      {isSettingsOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Pengaturan Musik Latar"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white border border-[#E7E5E4] rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-xl my-auto">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-editorial text-2xl font-medium text-[#18181B]">
                  Pengaturan Musik Latar
                </h3>
                <p className="text-sm text-[#71717A] mt-0.5">
                  Pilih instrumen lagu ulang tahun bawaan atau unggah lagu favoritmu sendiri.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="p-2 text-[#71717A] hover:text-[#18181B] rounded-lg cursor-pointer"
                aria-label="Tutup pengaturan musik"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMusicSettings} className="space-y-4">
              <div className="space-y-2">
                <span className="block text-xs font-medium text-[#52525B]">
                  Pilihan Lagu
                </span>

                {(
                  [
                    {
                      id: 'musicbox' as const,
                      title: 'Selamat Ulang Tahun — Kotak Musik Klasik',
                      desc: 'Nada lembut melodi ulang tahun lengkap, langsung siap diputar.',
                    },
                    {
                      id: 'piano' as const,
                      title: 'Selamat Ulang Tahun — Piano Hangat',
                      desc: 'Aransemen piano dengan iringan akor hangat saat melihat galeri.',
                    },
                    {
                      id: 'custom' as const,
                      title: 'Lagu Sendiri (Unggah MP3 / Tautan Audio)',
                      desc: 'Gunakan lagu pilihan pribadi dari perangkat atau tautan audio.',
                    },
                  ]
                ).map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setDraftPreset(option.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-colors cursor-pointer ${
                      draftPreset === option.id
                        ? 'border-[#E11D48] bg-[#FFF1F2]'
                        : 'border-[#E7E5E4] bg-white hover:border-[#18181B]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Music
                        className={`w-4 h-4 shrink-0 ${
                          draftPreset === option.id ? 'text-[#E11D48]' : 'text-[#52525B]'
                        }`}
                      />
                      <span className="text-sm font-semibold text-[#18181B]">
                        {option.title}
                      </span>
                    </div>
                    <p className="text-xs text-[#71717A] mt-1 pl-6">{option.desc}</p>
                  </button>
                ))}
              </div>

              {draftPreset === 'custom' && (
                <div className="p-4 rounded-xl border border-[#E7E5E4] bg-[#FAF9F6] space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[#52525B] mb-1.5">
                      Judul Lagu
                    </label>
                    <input
                      type="text"
                      value={draftTitle}
                      onChange={(e) => setDraftTitle(e.target.value)}
                      placeholder="Contoh: Lagu Favorit Nadia"
                      className="w-full text-sm px-3.5 py-2 bg-white border border-[#E7E5E4] rounded-lg focus:outline-none focus:border-[#18181B]"
                    />
                  </div>

                  <div>
                    <label className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-[#18181B] bg-white border border-[#E7E5E4] hover:border-[#18181B] rounded-lg cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Unggah File Audio (MP3, WAV, M4A)</span>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleAudioFileSelect}
                        className="sr-only"
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#52525B] mb-1.5">
                      Atau Tautan File Audio (Opsional)
                    </label>
                    <input
                      type="text"
                      value={draftUrl.startsWith('data:') ? 'File audio siap disimpan' : draftUrl}
                      onChange={(e) => setDraftUrl(e.target.value)}
                      placeholder="https://.../lagu.mp3"
                      className="w-full text-xs px-3.5 py-2 bg-white border border-[#E7E5E4] rounded-lg focus:outline-none focus:border-[#18181B]"
                    />
                  </div>
                </div>
              )}

              {audioError && (
                <p className="text-xs font-medium text-[#E11D48]">{audioError}</p>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E7E5E4]">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#52525B] hover:text-[#18181B] rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-[#E11D48] hover:bg-[#BE123C] disabled:opacity-60 rounded-lg cursor-pointer"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan Musik'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
