import { useState, type FormEvent } from 'react';
import { Flame, Gift, Pencil, RotateCcw, X } from 'lucide-react';
import type { SurpriseProfile } from '../types/surprise';
import { launchConfetti, playBirthdayChime } from '../utils/celebration';

interface MainLetterAndCandlesProps {
  profile: SurpriseProfile;
  onUpdateProfile: (updates: Partial<SurpriseProfile>) => Promise<void>;
}

export function MainLetterAndCandles({
  profile,
  onUpdateProfile,
}: MainLetterAndCandlesProps) {
  const [candlesLit, setCandlesLit] = useState(true);
  const [giftRevealed, setGiftRevealed] = useState(false);

  const [isEditingLetter, setIsEditingLetter] = useState(false);
  const [letterTitle, setLetterTitle] = useState(profile.mainLetterTitle);
  const [letterBody, setLetterBody] = useState(profile.mainLetterBody);
  const [senderName, setSenderName] = useState(profile.senderName);
  const [giftTitle, setGiftTitle] = useState(profile.secretGiftTitle);
  const [giftBody, setGiftBody] = useState(profile.secretGiftBody);
  const [isSaving, setIsSaving] = useState(false);

  function openEditModal() {
    setLetterTitle(profile.mainLetterTitle);
    setLetterBody(profile.mainLetterBody);
    setSenderName(profile.senderName);
    setGiftTitle(profile.secretGiftTitle);
    setGiftBody(profile.secretGiftBody);
    setIsEditingLetter(true);
  }

  function handleBlowCandles() {
    if (!candlesLit) {
      setCandlesLit(true);
      setGiftRevealed(false);
      return;
    }
    setCandlesLit(false);
    setGiftRevealed(true);
    launchConfetti();
    playBirthdayChime();
  }

  async function handleSaveLetter(e: FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateProfile({
        mainLetterTitle: letterTitle.trim() || profile.mainLetterTitle,
        mainLetterBody: letterBody.trim() || profile.mainLetterBody,
        senderName: senderName.trim() || profile.senderName,
        secretGiftTitle: giftTitle.trim() || profile.secretGiftTitle,
        secretGiftBody: giftBody.trim() || profile.secretGiftBody,
      });
      setIsEditingLetter(false);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section id="surat" className="py-20">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Editorial Main Letter */}
          <div className="lg:col-span-7 bg-white border border-[#E7E5E4] rounded-2xl p-8 sm:p-10 lg:p-12">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-xs font-medium text-[#71717A] mb-2">
                  Surat Utama · Untuk {profile.recipientName}
                </p>
                <h2 className="font-editorial text-2xl sm:text-3xl font-medium tracking-tight text-[#18181B] text-balance">
                  {profile.mainLetterTitle}
                </h2>
              </div>

              <button
                type="button"
                onClick={openEditModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#52525B] hover:text-[#18181B] border border-[#E7E5E4] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Surat</span>
              </button>
            </div>

            <div className="text-base text-[#27272A] leading-[1.8] whitespace-pre-line">
              {profile.mainLetterBody}
            </div>

            <div className="mt-8 pt-6 border-t border-[#E7E5E4] flex items-center justify-between text-sm">
              <span className="text-[#71717A]">Dengan penuh kehangatan,</span>
              <span className="font-editorial text-lg font-medium text-[#18181B]">
                {profile.senderName}
              </span>
            </div>
          </div>

          {/* Interactive Birthday Candles & Secret Gift */}
          <div className="lg:col-span-5 bg-[#18181B] text-[#FAF9F6] border border-[#27272A] rounded-2xl p-8 sm:p-10">
            <p className="text-xs font-medium text-[#A1A1AA] mb-2">
              Momen Harapan · Usia ke-<span className="tabular-nums">{profile.age}</span>
            </p>
            <h3 className="font-editorial text-2xl font-medium text-white mb-3">
              {candlesLit ? 'Buat Permintaan & Tiup Lilin' : 'Selamat Ulang Tahun!'}
            </h3>
            <p className="text-sm text-[#D4D4D8] leading-relaxed mb-8">
              {candlesLit
                ? 'Pejamkan mata sejenak, panjatkan doa terbaikmu di usia yang baru, lalu tiup lilinnya.'
                : 'Semua lilin sudah ditiup. Semoga setiap harapan baikmu lekas terwujud.'}
            </p>

            {/* Custom Illustrated Birthday Cake SVG */}
            <div className="flex justify-center py-4 mb-6">
              <svg
                viewBox="0 0 220 170"
                className="w-52 h-40"
                role="img"
                aria-label={candlesLit ? 'Kue ulang tahun dengan tiga lilin menyala' : 'Kue ulang tahun dengan lilin padam'}
              >
                {/* Plate */}
                <ellipse cx="110" cy="152" rx="88" ry="10" fill="#27272A" />
                {/* Bottom Cake Layer */}
                <rect x="42" y="102" width="136" height="46" rx="10" fill="#F4F4F5" />
                <path
                  d="M42 112 Q65 124 88 112 T134 112 T178 112 L178 106 Q178 102 170 102 L50 102 Q42 102 42 106 Z"
                  fill="#FDA4AF"
                />
                {/* Top Cake Layer */}
                <rect x="60" y="64" width="100" height="40" rx="8" fill="#FFFFFF" />
                <path
                  d="M60 73 Q80 83 100 73 T140 73 T160 73 L160 68 Q160 64 152 64 L68 64 Q60 64 60 68 Z"
                  fill="#E11D48"
                />

                {/* 3 Candles */}
                {[82, 110, 138].map((cx, idx) => (
                  <g key={cx}>
                    <rect
                      x={cx - 4}
                      y="36"
                      width="8"
                      height="28"
                      rx="2"
                      fill={idx === 1 ? '#E11D48' : '#D4D4D8'}
                    />
                    <line
                      x1={cx}
                      y1="30"
                      x2={cx}
                      y2="36"
                      stroke="#A1A1AA"
                      strokeWidth="1.5"
                    />
                    {candlesLit ? (
                      <g className="animate-flicker" style={{ animationDelay: `${idx * 0.18}s` }}>
                        <path
                          d={`M${cx} 14 C${cx + 7} 22 ${cx + 6} 31 ${cx} 32 C${cx - 6} 31 ${cx - 7} 22 ${cx} 14 Z`}
                          fill="#F59E0B"
                        />
                        <path
                          d={`M${cx} 20 C${cx + 3.5} 24 ${cx + 3} 29 ${cx} 30 C${cx - 3} 29 ${cx - 3.5} 24 ${cx} 20 Z`}
                          fill="#FEF08A"
                        />
                      </g>
                    ) : (
                      <path
                        d={`M${cx} 28 Q${cx + 3} 22 ${cx - 1} 16`}
                        stroke="#71717A"
                        strokeWidth="1.5"
                        fill="none"
                        strokeLinecap="round"
                      />
                    )}
                  </g>
                ))}
              </svg>
            </div>

            <button
              type="button"
              onClick={handleBlowCandles}
              className="w-full inline-flex items-center justify-center gap-2.5 px-5 py-3 text-sm font-semibold text-white bg-[#E11D48] hover:bg-[#BE123C] rounded-xl transition-colors cursor-pointer"
            >
              {candlesLit ? (
                <>
                  <Flame className="w-4 h-4" />
                  <span>Tiup Lilin &amp; Buka Kado</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  <span>Nyalakan Lilin Lagi</span>
                </>
              )}
            </button>

            {giftRevealed && (
              <div className="mt-6 pt-6 border-t border-[#27272A]">
                <div className="flex items-center gap-2 text-xs font-medium text-[#FDA4AF] mb-2">
                  <Gift className="w-4 h-4" />
                  <span>Kejutan Tambahan</span>
                </div>
                <h4 className="font-editorial text-lg font-medium text-white mb-1.5">
                  {profile.secretGiftTitle}
                </h4>
                <p className="text-sm text-[#D4D4D8] leading-relaxed">
                  {profile.secretGiftBody}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Letter & Gift Modal */}
      {isEditingLetter && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Edit Surat Utama"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white border border-[#E7E5E4] rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-xl my-auto">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-editorial text-2xl font-medium text-[#18181B]">
                  Edit Surat &amp; Pesan Kado
                </h3>
                <p className="text-sm text-[#71717A] mt-0.5">
                  Ubah surat utama serta kejutan yang muncul setelah lilin ditiup.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingLetter(false)}
                className="p-2 text-[#71717A] hover:text-[#18181B] rounded-lg cursor-pointer"
                aria-label="Tutup editor surat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLetter} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#52525B] mb-1.5">
                  Judul Surat Utama
                </label>
                <input
                  type="text"
                  required
                  value={letterTitle}
                  onChange={(e) => setLetterTitle(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 border border-[#E7E5E4] rounded-lg focus:outline-none focus:border-[#18181B]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#52525B] mb-1.5">
                  Isi Surat
                </label>
                <textarea
                  rows={5}
                  required
                  value={letterBody}
                  onChange={(e) => setLetterBody(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 border border-[#E7E5E4] rounded-lg focus:outline-none focus:border-[#18181B]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#52525B] mb-1.5">
                  Tertanda / Pengirim
                </label>
                <input
                  type="text"
                  required
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 border border-[#E7E5E4] rounded-lg focus:outline-none focus:border-[#18181B]"
                />
              </div>

              <div className="pt-3 border-t border-[#E7E5E4]">
                <label className="block text-xs font-medium text-[#52525B] mb-1.5">
                  Judul Kejutan Setelah Tiup Lilin
                </label>
                <input
                  type="text"
                  value={giftTitle}
                  onChange={(e) => setGiftTitle(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 border border-[#E7E5E4] rounded-lg focus:outline-none focus:border-[#18181B] mb-3"
                />

                <label className="block text-xs font-medium text-[#52525B] mb-1.5">
                  Detail Kado / Rencana Kejutan
                </label>
                <textarea
                  rows={3}
                  value={giftBody}
                  onChange={(e) => setGiftBody(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 border border-[#E7E5E4] rounded-lg focus:outline-none focus:border-[#18181B]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E7E5E4]">
                <button
                  type="button"
                  onClick={() => setIsEditingLetter(false)}
                  className="px-4 py-2 text-xs font-medium text-[#52525B] hover:text-[#18181B] rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-[#18181B] hover:bg-[#27272A] rounded-lg cursor-pointer"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan Surat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
