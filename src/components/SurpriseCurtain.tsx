import { useState } from 'react';
import { Gift, Volume2, VolumeX, X } from 'lucide-react';
import type { SurpriseProfile } from '../types/surprise';
import { launchConfetti, playBirthdayChime } from '../utils/celebration';

interface SurpriseCurtainProps {
  profile: SurpriseProfile;
  onEnter: () => void;
  onStartMusic?: () => void;
}

export function SurpriseCurtain({ profile, onEnter, onStartMusic }: SurpriseCurtainProps) {
  const [withSound, setWithSound] = useState(true);
  const [isOpening, setIsOpening] = useState(false);

  function handleReveal() {
    if (isOpening) return;
    setIsOpening(true);
    launchConfetti();
    if (withSound) {
      if (onStartMusic) {
        onStartMusic();
      } else {
        playBirthdayChime();
      }
    }
    window.setTimeout(() => {
      onEnter();
    }, 450);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Layar pembuka kejutan ulang tahun"
      className={`fixed inset-0 z-50 bg-[#18181B] text-[#FAF9F6] flex flex-col justify-between p-6 md:p-12 transition-opacity duration-500 ${
        isOpening ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex items-center justify-between gap-4 max-w-[1200px] w-full mx-auto">
        <div className="text-xs tracking-wide text-[#A1A1AA] flex items-center gap-2">
          <span>Kejutan Ulang Tahun</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">{profile.dateDisplay}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setWithSound((prev) => !prev)}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#D4D4D8] hover:text-white border border-[#3F3F46] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            aria-label={withSound ? 'Matikan musik pembuka' : 'Aktifkan musik pembuka'}
          >
            {withSound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{withSound ? 'Musik Aktif' : 'Tanpa Suara'}</span>
          </button>

          <button
            type="button"
            onClick={onEnter}
            className="p-2 text-[#A1A1AA] hover:text-white rounded-lg transition-colors cursor-pointer"
            aria-label="Tutup layar kejutan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto text-center my-auto py-12">
        <p className="text-sm text-[#FDA4AF] font-medium mb-4">
          Khusus Untuk {profile.recipientName}
        </p>

        <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-white text-balance leading-[1.12] mb-6">
          Selamat Ulang Tahun ke-{profile.age}
        </h1>

        <p className="text-base sm:text-lg text-[#D4D4D8] leading-relaxed max-w-xl mx-auto mb-10">
          Ada kumpulan foto kenangan, ucapan hangat, dan satu surat spesial yang sudah disiapkan untuk hari istimewamu.
        </p>

        <button
          type="button"
          onClick={handleReveal}
          className="inline-flex items-center gap-3 px-8 py-4 text-sm font-semibold text-white bg-[#E11D48] hover:bg-[#BE123C] rounded-xl transition-transform duration-200 active:scale-[0.98] cursor-pointer whitespace-nowrap shadow-lg shadow-[#E11D48]/25 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E11D48]"
        >
          <Gift className="w-4 h-4" />
          <span>Buka Kejutan</span>
        </button>
      </div>

      <div className="max-w-[1200px] w-full mx-auto flex items-center justify-between text-xs text-[#A1A1AA] border-t border-[#27272A] pt-5">
        <span>Dari: {profile.senderName}</span>
        <button
          type="button"
          onClick={onEnter}
          className="hover:text-white underline underline-offset-4 transition-colors cursor-pointer"
        >
          Langsung ke Halaman
        </button>
      </div>
    </div>
  );
}
