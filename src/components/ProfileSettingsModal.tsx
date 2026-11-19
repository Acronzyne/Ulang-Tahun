import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Upload, X } from 'lucide-react';
import type { SurpriseProfile } from '../types/surprise';
import { compressImageFile } from '../utils/image';

interface ProfileSettingsModalProps {
  profile: SurpriseProfile;
  onClose: () => void;
  onSave: (updates: Partial<SurpriseProfile>) => Promise<void>;
}

export function ProfileSettingsModal({
  profile,
  onClose,
  onSave,
}: ProfileSettingsModalProps) {
  const [recipientName, setRecipientName] = useState(profile.recipientName);
  const [age, setAge] = useState(String(profile.age));
  const [dateDisplay, setDateDisplay] = useState(profile.dateDisplay);
  const [heroTitle, setHeroTitle] = useState(profile.heroTitle);
  const [heroIntro, setHeroIntro] = useState(profile.heroIntro);
  const [heroPhotoUrl, setHeroPhotoUrl] = useState(profile.heroPhotoUrl);
  const [senderName, setSenderName] = useState(profile.senderName);
  const [isSaving, setIsSaving] = useState(false);

  async function handleHeroPhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 1600, 0.86);
      setHeroPhotoUrl(compressed);
    } catch {
      // Ignore invalid files
    }
    e.target.value = '';
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const parsedAge = Number.parseInt(age, 10);
      await onSave({
        recipientName: recipientName.trim() || profile.recipientName,
        age: Number.isFinite(parsedAge) && parsedAge > 0 ? parsedAge : profile.age,
        dateDisplay: dateDisplay.trim() || profile.dateDisplay,
        heroTitle: heroTitle.trim() || profile.heroTitle,
        heroIntro: heroIntro.trim() || profile.heroIntro,
        heroPhotoUrl: heroPhotoUrl.trim() || profile.heroPhotoUrl,
        senderName: senderName.trim() || profile.senderName,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Atur Detail Halaman Kejutan"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white border border-[#E7E5E4] rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-xl my-auto">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-editorial text-2xl font-medium text-[#18181B]">
              Atur Detail Perayaan
            </h3>
            <p className="text-sm text-[#71717A] mt-0.5">
              Sesuaikan nama penerima, foto sampul, usia, dan kalimat pembuka.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#71717A] hover:text-[#18181B] rounded-lg cursor-pointer"
            aria-label="Tutup pengaturan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#52525B] mb-1.5">
                Nama Penerima Kejutan
              </label>
              <input
                type="text"
                required
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 border border-[#E7E5E4] rounded-lg focus:outline-none focus:border-[#18181B]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#52525B] mb-1.5">
                Usia ke-
              </label>
              <input
                type="number"
                min={1}
                max={120}
                required
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 border border-[#E7E5E4] rounded-lg focus:outline-none focus:border-[#18181B] tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#52525B] mb-1.5">
                Tanggal Ulang Tahun
              </label>
              <input
                type="text"
                value={dateDisplay}
                onChange={(e) => setDateDisplay(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 border border-[#E7E5E4] rounded-lg focus:outline-none focus:border-[#18181B]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#52525B] mb-1.5">
                Nama Pengirim Utama
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 border border-[#E7E5E4] rounded-lg focus:outline-none focus:border-[#18181B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#52525B] mb-1.5">
              Judul Besar Halaman
            </label>
            <input
              type="text"
              required
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 border border-[#E7E5E4] rounded-lg focus:outline-none focus:border-[#18181B]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#52525B] mb-1.5">
              Kalimat Pembuka
            </label>
            <textarea
              rows={3}
              required
              value={heroIntro}
              onChange={(e) => setHeroIntro(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 border border-[#E7E5E4] rounded-lg focus:outline-none focus:border-[#18181B]"
            />
          </div>

          <div>
            <span className="block text-xs font-medium text-[#52525B] mb-2">
              Foto Utama Sampul
            </span>
            <div className="flex items-center gap-4">
              <img
                src={heroPhotoUrl}
                alt="Pratinjau foto utama"
                className="w-16 h-20 object-cover rounded-lg border border-[#E7E5E4] shrink-0"
              />
              <div className="flex-1 space-y-2">
                <label className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-[#18181B] bg-[#F4F4F5] hover:bg-[#E4E4E7] rounded-lg cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Ganti Foto dari Perangkat</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleHeroPhotoChange}
                    className="sr-only"
                  />
                </label>
                <input
                  type="url"
                  value={heroPhotoUrl.startsWith('data:') ? '' : heroPhotoUrl}
                  onChange={(e) => setHeroPhotoUrl(e.target.value)}
                  placeholder="Atau tempel tautan foto..."
                  className="w-full text-xs px-3 py-2 border border-[#E7E5E4] rounded-lg focus:outline-none focus:border-[#18181B]"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E7E5E4]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#52525B] hover:text-[#18181B] rounded-lg cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-[#E11D48] hover:bg-[#BE123C] rounded-lg cursor-pointer"
            >
              {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
