import { useEffect, useState } from 'react';
import { Camera, Check, Link2, SlidersHorizontal } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { SurpriseCurtain } from './components/SurpriseCurtain';
import { PhotoGallery } from './components/PhotoGallery';
import { WishesBoard } from './components/WishesBoard';
import { MainLetterAndCandles } from './components/MainLetterAndCandles';
import { ProfileSettingsModal } from './components/ProfileSettingsModal';
import { BackgroundMusicPlayer } from './components/BackgroundMusicPlayer';
import type {
  BirthdayWish,
  MemoryPhoto,
  PhotoCategory,
  SurpriseData,
  SurpriseProfile,
  WishTheme,
} from './types/surprise';

const LOCAL_CACHE_KEY = 'birthday_surprise_cache_v1';

const FALLBACK_DATA: SurpriseData = {
  profile: {
    recipientName: 'Nadia Putri',
    age: 24,
    dateDisplay: '19 November 2026',
    heroTitle: 'Selamat Ulang Tahun, Nadia',
    heroIntro:
      'Sebuah ruang kecil untuk menyimpan tawa, potongan perjalanan, dan doa-doa hangat dari orang-orang yang selalu menyayangimu.',
    heroPhotoUrl: '/src/assets/images/hero_birthday_portrait_1795087667397.jpg',
    senderName: 'Raka & Sahabat',
    mainLetterTitle: 'Untukmu di Usia yang Baru',
    mainLetterBody:
      'Terima kasih sudah menjadi pribadi yang selalu membawa kehangatan ke mana pun kamu melangkah. Di usia 24 ini, semoga setiap rencana baik yang sedang kamu susun diam-diam menemukan jalannya dengan tenang.\n\nJangan pernah ragu merayakan hal-hal kecil dalam hidup, dan ingatlah bahwa selalu ada orang-orang yang berdiri di barisan terdepan mendukungmu.',
    secretGiftTitle: 'Kejutan Makan Malam Akhir Pekan Ini',
    secretGiftBody:
      'Satu meja khusus sudah dipesan untuk Sabtu malam pukul 19.00 di restoran taman favoritmu, lengkap dengan kue vanila dan album foto cetak yang sedang kita siapkan.',
    musicPreset: 'musicbox',
    musicTitle: 'Selamat Ulang Tahun (Kotak Musik)',
    musicUrl: '',
  },
  photos: [
    {
      id: 'photo-1',
      imageUrl: '/src/assets/images/memory_garden_dinner_1795087668054.jpg',
      caption: 'Makan malam hangat di halaman belakang bersama orang-orang terdekat',
      dateLabel: 'November 2025',
      category: 'Keluarga & Teman',
      featured: true,
      createdAt: '2026-11-18T10:00:00.000Z',
    },
    {
      id: 'photo-2',
      imageUrl: '/src/assets/images/memory_cafe_toast_1795087667705.jpg',
      caption: 'Kue kecil dan kopi sore untuk merayakan pencapaian pertamamu tahun ini',
      dateLabel: 'Juni 2026',
      category: 'Favorit',
      featured: false,
      createdAt: '2026-11-18T10:05:00.000Z',
    },
    {
      id: 'photo-3',
      imageUrl: '/src/assets/images/memory_sunset_beach_1795087668484.jpg',
      caption: 'Menunggu matahari terbenam di pesisir selatan setelah perjalanan panjang',
      dateLabel: 'Agustus 2026',
      category: 'Perjalanan',
      featured: false,
      createdAt: '2026-11-18T10:10:00.000Z',
    },
    {
      id: 'photo-4',
      imageUrl: '/src/assets/images/memory_picnic_keepsake_1795087668199.jpg',
      caption: 'Piknik tenang di taman kota dengan kamera film dan surat tulisan tangan',
      dateLabel: 'September 2026',
      category: 'Favorit',
      featured: false,
      createdAt: '2026-11-18T10:15:00.000Z',
    },
  ],
  wishes: [
    {
      id: 'wish-1',
      senderName: 'Raka Pratama',
      relation: 'Pasangan',
      message:
        'Selamat ulang tahun, Nad. Semoga hatimu selalu lapang, langkahmu selalu ringan, dan tawa ini tidak pernah hilang dari hari-harimu.',
      theme: 'rose',
      pinned: true,
      createdAt: '2026-11-19T00:01:00.000Z',
    },
    {
      id: 'wish-2',
      senderName: 'Ibu & Ayah',
      relation: 'Keluarga',
      message:
        'Sehat selalu ya Nak. Doa Ibu dan Ayah selalu menyertai setiap usaha, impian, dan perjalananmu di mana pun berada.',
      theme: 'ivory',
      pinned: true,
      createdAt: '2026-11-19T00:05:00.000Z',
    },
    {
      id: 'wish-3',
      senderName: 'Dina Maharani',
      relation: 'Sahabat Kuliah',
      message:
        'Happy 24th! Terima kasih selalu jadi pendengar terbaik sejak zaman skripsi sampai sekarang. Yuk segera atur liburan bareng lagi!',
      theme: 'ivory',
      pinned: false,
      createdAt: '2026-11-19T01:10:00.000Z',
    },
  ],
};

export default function App() {
  const [data, setData] = useState<SurpriseData>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_CACHE_KEY);
      if (cached) return JSON.parse(cached) as SurpriseData;
    } catch {
      // Ignore storage error
    }
    return FALLBACK_DATA;
  });

  const [isLoading, setIsLoading] = useState(true);
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [showCurtain, setShowCurtain] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.get('mode') === 'kejutan';
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch('/api/surprise');
        if (!res.ok) throw new Error('Fetch failed');
        const json = (await res.json()) as SurpriseData;
        if (active) {
          setData(json);
          localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(json));
        }
      } catch {
        // Keep cached or fallback data
      } finally {
        if (active) setIsLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setHeroImgFailed(false);
  }, [data.profile.heroPhotoUrl]);

  function syncCache(next: SurpriseData) {
    setData(next);
    try {
      localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage quota errors
    }
  }

  async function handleUpdateProfile(updates: Partial<SurpriseProfile>) {
    try {
      const res = await fetch('/api/surprise/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed');
      const next = (await res.json()) as SurpriseData;
      syncCache(next);
    } catch {
      syncCache({
        ...data,
        profile: { ...data.profile, ...updates },
      });
    }
  }

  async function handleAddPhotos(
    items: Array<{
      imageUrl: string;
      caption: string;
      dateLabel: string;
      category: PhotoCategory;
      featured: boolean;
    }>
  ) {
    try {
      const res = await fetch('/api/surprise/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) throw new Error('Failed');
      const json = (await res.json()) as { data: SurpriseData };
      syncCache(json.data);
    } catch {
      const created: MemoryPhoto[] = items.map((item, idx) => ({
        id: `local-photo-${Date.now()}-${idx}`,
        ...item,
        createdAt: new Date().toISOString(),
      }));
      syncCache({
        ...data,
        photos: [...created, ...data.photos],
      });
    }
  }

  async function handleUpdatePhoto(
    id: string,
    updates: Partial<Pick<MemoryPhoto, 'caption' | 'dateLabel' | 'category' | 'featured'>>
  ) {
    try {
      const res = await fetch(`/api/surprise/photos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed');
      const next = (await res.json()) as SurpriseData;
      syncCache(next);
    } catch {
      syncCache({
        ...data,
        photos: data.photos.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      });
    }
  }

  async function handleDeletePhoto(id: string) {
    try {
      const res = await fetch(`/api/surprise/photos/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed');
      const next = (await res.json()) as SurpriseData;
      syncCache(next);
    } catch {
      syncCache({
        ...data,
        photos: data.photos.filter((p) => p.id !== id),
      });
    }
  }

  async function handleAddWish(input: {
    senderName: string;
    relation: string;
    message: string;
    theme: WishTheme;
    pinned: boolean;
  }) {
    try {
      const res = await fetch('/api/surprise/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error('Failed');
      const json = (await res.json()) as { data: SurpriseData };
      syncCache(json.data);
    } catch {
      const created: BirthdayWish = {
        id: `local-wish-${Date.now()}`,
        ...input,
        createdAt: new Date().toISOString(),
      };
      syncCache({
        ...data,
        wishes: [created, ...data.wishes],
      });
    }
  }

  async function handleUpdateWish(
    id: string,
    updates: Partial<Pick<BirthdayWish, 'senderName' | 'relation' | 'message' | 'theme' | 'pinned'>>
  ) {
    try {
      const res = await fetch(`/api/surprise/wishes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed');
      const next = (await res.json()) as SurpriseData;
      syncCache(next);
    } catch {
      syncCache({
        ...data,
        wishes: data.wishes.map((w) => (w.id === id ? { ...w, ...updates } : w)),
      });
    }
  }

  async function handleDeleteWish(id: string) {
    try {
      const res = await fetch(`/api/surprise/wishes/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed');
      const next = (await res.json()) as SurpriseData;
      syncCache(next);
    } catch {
      syncCache({
        ...data,
        wishes: data.wishes.filter((w) => w.id !== id),
      });
    }
  }

  async function handleCopyShareLink() {
    const url = `${window.location.origin}/?mode=kejutan`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 2600);
    } catch {
      // Fallback for restricted clipboard contexts
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 2600);
    }
  }

  const { profile, photos, wishes } = data;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#18181B]">
      {showCurtain && (
        <SurpriseCurtain
          profile={profile}
          onEnter={() => setShowCurtain(false)}
          onStartMusic={() => setIsMusicPlaying(true)}
        />
      )}

      <Navbar
        brandTitle="Hari Istimewa"
        onOpenCurtain={() => setShowCurtain(true)}
      />

      <main>
        {/* Split-Screen Editorial Hero */}
        <section id="beranda" className="pt-10 pb-14 lg:pt-14 lg:pb-16 border-b border-[#E7E5E4]">
          <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
              {/* Left Column: Typographic Hierarchy */}
              <div className="lg:col-span-7 flex flex-col justify-between py-2 lg:py-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#71717A] mb-5">
                    <span>Perayaan Ulang Tahun</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{profile.dateDisplay}</span>
                    <span aria-hidden="true">·</span>
                    <span>Dari {profile.senderName}</span>
                  </div>

                  <h1 className="font-editorial text-4xl sm:text-5xl lg:text-[3.5rem] font-medium tracking-tight text-[#18181B] leading-[1.1] text-balance mb-6">
                    {profile.heroTitle}
                  </h1>

                  <p className="text-base sm:text-lg text-[#52525B] leading-relaxed max-w-xl mb-8">
                    {profile.heroIntro}
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href="#galeri"
                      className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-[#E11D48] hover:bg-[#BE123C] rounded-xl transition-colors whitespace-nowrap shrink-0"
                    >
                      Lihat Galeri &amp; Tambah Foto
                    </a>

                    <a
                      href="#ucapan"
                      className="inline-flex items-center justify-center px-5 py-3 text-sm font-semibold text-[#18181B] bg-white border border-[#E7E5E4] hover:border-[#18181B] rounded-xl transition-colors whitespace-nowrap shrink-0"
                    >
                      Tulis Ucapan
                    </a>
                  </div>
                </div>

                {/* Creator Quick Toolbar */}
                <div className="mt-10 pt-6 border-t border-[#E7E5E4] flex flex-wrap items-center gap-4 text-xs">
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(true)}
                    className="inline-flex items-center gap-2 font-medium text-[#3F3F46] hover:text-[#18181B] cursor-pointer whitespace-nowrap"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Atur Nama, Usia &amp; Foto Sampul</span>
                  </button>

                  <span className="text-[#D4D4D8]" aria-hidden="true">
                    |
                  </span>

                  <button
                    type="button"
                    onClick={handleCopyShareLink}
                    className="inline-flex items-center gap-2 font-medium text-[#3F3F46] hover:text-[#E11D48] cursor-pointer whitespace-nowrap"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#E11D48]" />
                        <span className="text-[#E11D48]">Tautan Kejutan Disalin</span>
                      </>
                    ) : (
                      <>
                        <Link2 className="w-3.5 h-3.5" />
                        <span>Salin Tautan Kejutan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Right Column: Full-Height Portrait Frame */}
              <div className="lg:col-span-5">
                <div className="relative h-full min-h-[360px] lg:min-h-[480px] rounded-2xl overflow-hidden border border-[#E7E5E4] bg-white">
                  {heroImgFailed || !profile.heroPhotoUrl ? (
                    <div className="w-full h-full bg-gradient-to-br from-[#F4F4F5] to-[#E7E5E4] flex flex-col items-center justify-center p-8 text-center text-[#71717A]">
                      <Camera className="w-8 h-8 mb-2 stroke-[1.5]" />
                      <span className="text-sm font-medium">{profile.recipientName}</span>
                    </div>
                  ) : (
                    <img
                      src={profile.heroPhotoUrl}
                      alt={`Potret ${profile.recipientName}`}
                      referrerPolicy="no-referrer"
                      onError={() => setHeroImgFailed(true)}
                      className="w-full h-full object-cover lg:h-full"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 text-white flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs text-white/80">Untuk</p>
                      <p className="font-editorial text-xl font-medium">
                        {profile.recipientName}
                      </p>
                    </div>
                    <span className="font-mono text-xs tabular-nums text-white/90">
                      Ke-{profile.age}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4-Column Tabular Summary Strip Directly Below Hero Split */}
            <div className="mt-10 pt-8 border-t border-[#E7E5E4] grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-xs text-[#71717A] mb-1">Penerima Kejutan</p>
                <p className="font-editorial text-xl font-medium text-[#18181B]">
                  {profile.recipientName}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#71717A] mb-1">Usia Baru</p>
                <p className="font-editorial text-xl font-medium text-[#18181B] tabular-nums">
                  {profile.age} Tahun
                </p>
              </div>
              <div>
                <p className="text-xs text-[#71717A] mb-1">Momen Tersimpan</p>
                <p className="font-editorial text-xl font-medium text-[#18181B] tabular-nums">
                  {isLoading ? '...' : `${photos.length} Foto`}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#71717A] mb-1">Doa &amp; Harapan</p>
                <p className="font-editorial text-xl font-medium text-[#18181B] tabular-nums">
                  {isLoading ? '...' : `${wishes.length} Ucapan`}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Subtle Editorial Marquee Divider */}
        <div className="border-b border-[#E7E5E4] bg-white py-3.5 overflow-hidden select-none">
          <div className="animate-marquee text-xs font-medium text-[#71717A] tracking-wide">
            {[0, 1].map((dup) => (
              <div key={dup} className="flex items-center gap-8 pr-8 whitespace-nowrap">
                <span>kenangan hangat</span>
                <span aria-hidden="true">·</span>
                <span>selamat ulang tahun {profile.recipientName}</span>
                <span aria-hidden="true">·</span>
                <span>doa terbaik untuk langkah baru</span>
                <span aria-hidden="true">·</span>
                <span>potongan cerita yang selalu diingat</span>
                <span aria-hidden="true">·</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 1: Photo Gallery with Upload */}
        <PhotoGallery
          photos={photos}
          defaultDate={profile.dateDisplay}
          onAddPhotos={handleAddPhotos}
          onUpdatePhoto={handleUpdatePhoto}
          onDeletePhoto={handleDeletePhoto}
          isMusicPlaying={isMusicPlaying}
          onToggleMusic={() => setIsMusicPlaying((prev) => !prev)}
        />

        {/* Section 2: Wishes & Greeting Text Board */}
        <WishesBoard
          wishes={wishes}
          onAddWish={handleAddWish}
          onUpdateWish={handleUpdateWish}
          onDeleteWish={handleDeleteWish}
        />

        {/* Section 3: Main Letter & Blow Candles */}
        <MainLetterAndCandles
          profile={profile}
          onUpdateProfile={handleUpdateProfile}
        />
      </main>

      {/* Clean Editorial Footer */}
      <footer className="border-t border-[#E7E5E4] bg-white py-8">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#71717A]">
          <p>
            Dibuat khusus untuk perayaan ulang tahun {profile.recipientName}
          </p>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-[#18181B] transition-colors cursor-pointer"
            >
              Atur Halaman
            </button>
            <button
              type="button"
              onClick={handleCopyShareLink}
              className="hover:text-[#18181B] transition-colors cursor-pointer"
            >
              {copiedLink ? 'Tautan Disalin' : 'Salin Tautan Kejutan'}
            </button>
            <button
              type="button"
              onClick={() => setShowCurtain(true)}
              className="hover:text-[#E11D48] font-medium text-[#18181B] transition-colors cursor-pointer"
            >
              Putar Layar Kejutan
            </button>
          </div>
        </div>
      </footer>

      {isSettingsOpen && (
        <ProfileSettingsModal
          profile={profile}
          onClose={() => setIsSettingsOpen(false)}
          onSave={handleUpdateProfile}
        />
      )}

      <BackgroundMusicPlayer
        profile={profile}
        isPlaying={isMusicPlaying}
        onPlayingChange={setIsMusicPlaying}
        onUpdateProfile={handleUpdateProfile}
      />
    </div>
  );
}
