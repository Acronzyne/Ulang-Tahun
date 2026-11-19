import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Music,
  Pause,
  Pencil,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import type { MemoryPhoto, PhotoCategory } from '../types/surprise';
import { compressImageFile } from '../utils/image';

interface PhotoGalleryProps {
  photos: MemoryPhoto[];
  defaultDate: string;
  onAddPhotos: (
    items: Array<{
      imageUrl: string;
      caption: string;
      dateLabel: string;
      category: PhotoCategory;
      featured: boolean;
    }>
  ) => Promise<void>;
  onUpdatePhoto: (
    id: string,
    updates: Partial<Pick<MemoryPhoto, 'caption' | 'dateLabel' | 'category' | 'featured'>>
  ) => Promise<void>;
  onDeletePhoto: (id: string) => Promise<void>;
  isMusicPlaying?: boolean;
  onToggleMusic?: () => void;
}

const CATEGORIES: Array<'Semua' | PhotoCategory> = [
  'Semua',
  'Favorit',
  'Perjalanan',
  'Keluarga & Teman',
];

interface DraftPhotoItem {
  id: string;
  previewUrl: string;
  caption: string;
}

function ResilientPhoto({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-[#F4F4F5] to-[#E7E5E4] flex flex-col items-center justify-center p-6 text-center text-[#71717A]">
        <Camera className="w-7 h-7 mb-2 stroke-[1.5]" />
        <span className="text-xs font-medium line-clamp-2 max-w-[180px]">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

export function PhotoGallery({
  photos,
  defaultDate,
  onAddPhotos,
  onUpdatePhoto,
  onDeletePhoto,
  isMusicPlaying = false,
  onToggleMusic,
}: PhotoGalleryProps) {
  const [activeCategory, setActiveCategory] = useState<'Semua' | PhotoCategory>('Semua');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<MemoryPhoto | null>(null);

  // Add modal state
  const [draftPhotos, setDraftPhotos] = useState<DraftPhotoItem[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [singleCaption, setSingleCaption] = useState('');
  const [dateLabel, setDateLabel] = useState(defaultDate);
  const [category, setCategory] = useState<PhotoCategory>('Favorit');
  const [featured, setFeatured] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Edit modal state
  const [editCaption, setEditCaption] = useState('');
  const [editDateLabel, setEditDateLabel] = useState('');
  const [editCategory, setEditCategory] = useState<PhotoCategory>('Favorit');
  const [editFeatured, setEditFeatured] = useState(false);

  const filteredPhotos =
    activeCategory === 'Semua'
      ? photos
      : photos.filter((photo) => photo.category === activeCategory);

  useEffect(() => {
    if (lightboxIndex === null) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) =>
          prev === null ? null : (prev + 1) % filteredPhotos.length
        );
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) =>
          prev === null
            ? null
            : (prev - 1 + filteredPhotos.length) % filteredPhotos.length
        );
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, filteredPhotos.length]);

  function openAddModal() {
    setDraftPhotos([]);
    setImageUrlInput('');
    setSingleCaption('');
    setDateLabel(defaultDate);
    setCategory('Favorit');
    setFeatured(false);
    setFormError('');
    setIsAddOpen(true);
  }

  function openEditModal(photo: MemoryPhoto) {
    setEditingPhoto(photo);
    setEditCaption(photo.caption);
    setEditDateLabel(photo.dateLabel);
    setEditCategory(photo.category);
    setEditFeatured(photo.featured);
    setFormError('');
  }

  async function handleFileSelection(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setFormError('');

    const processed: DraftPhotoItem[] = [];
    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      try {
        const compressed = await compressImageFile(file, 1600, 0.84);
        processed.push({
          id: `${Date.now()}-${i}`,
          previewUrl: compressed,
          caption: '',
        });
      } catch {
        setFormError('Sebagian gambar gagal diproses. Coba format JPG atau PNG.');
      }
    }
    setDraftPhotos((prev) => [...prev, ...processed]);
    e.target.value = '';
  }

  async function handleAddSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');

    const itemsToSave: Array<{
      imageUrl: string;
      caption: string;
      dateLabel: string;
      category: PhotoCategory;
      featured: boolean;
    }> = [];

    for (const draft of draftPhotos) {
      itemsToSave.push({
        imageUrl: draft.previewUrl,
        caption:
          draft.caption.trim() ||
          singleCaption.trim() ||
          'Momen berharga yang diabadikan',
        dateLabel: dateLabel.trim() || defaultDate,
        category,
        featured: featured && itemsToSave.length === 0,
      });
    }

    if (imageUrlInput.trim()) {
      itemsToSave.push({
        imageUrl: imageUrlInput.trim(),
        caption: singleCaption.trim() || 'Momen berharga yang diabadikan',
        dateLabel: dateLabel.trim() || defaultDate,
        category,
        featured: featured && itemsToSave.length === 0,
      });
    }

    if (itemsToSave.length === 0) {
      setFormError('Pilih minimal satu foto dari perangkat atau masukkan tautan gambar.');
      return;
    }

    setIsSaving(true);
    try {
      await onAddPhotos(itemsToSave);
      setIsAddOpen(false);
    } catch {
      setFormError('Gagal menyimpan foto. Silakan coba lagi.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleEditSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editingPhoto) return;
    setIsSaving(true);
    try {
      await onUpdatePhoto(editingPhoto.id, {
        caption: editCaption.trim() || editingPhoto.caption,
        dateLabel: editDateLabel.trim() || editingPhoto.dateLabel,
        category: editCategory,
        featured: editFeatured,
      });
      setEditingPhoto(null);
    } catch {
      setFormError('Gagal memperbarui keterangan foto.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await onDeletePhoto(id);
    if (lightboxIndex !== null) {
      setLightboxIndex(null);
    }
  }

  const activeLightboxPhoto =
    lightboxIndex !== null && filteredPhotos[lightboxIndex]
      ? filteredPhotos[lightboxIndex]
      : null;

  return (
    <section id="galeri" className="py-20 border-b border-[#E7E5E4]">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-xl">
            <p className="text-xs font-medium text-[#71717A] mb-2">
              Koleksi Visual · <span className="tabular-nums">{photos.length}</span> Foto Tersimpan
            </p>
            <h2 className="font-editorial text-3xl sm:text-4xl font-medium tracking-tight text-[#18181B] text-balance">
              Galeri Momen &amp; Kenangan
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 p-1 bg-[#F4F4F5] rounded-lg">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat);
                    setLightboxIndex(null);
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-white text-[#18181B] shadow-sm'
                      : 'text-[#52525B] hover:text-[#18181B]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {onToggleMusic && (
              <button
                type="button"
                onClick={onToggleMusic}
                className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isMusicPlaying
                    ? 'bg-[#FFF1F2] border-[#FECDD3] text-[#9F1239]'
                    : 'bg-white border-[#E7E5E4] text-[#18181B] hover:border-[#18181B]'
                }`}
              >
                {isMusicPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Jeda Lagu</span>
                  </>
                ) : (
                  <>
                    <Music className="w-3.5 h-3.5" />
                    <span>Putar Lagu</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#18181B] hover:bg-[#27272A] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18181B]"
            >
              <ImagePlus className="w-4 h-4" />
              <span>Tambah Foto</span>
            </button>
          </div>
        </div>

        {/* Bento Gallery Grid */}
        {filteredPhotos.length === 0 ? (
          <div className="rounded-2xl border border-[#E7E5E4] bg-white p-12 text-center">
            <Camera className="w-8 h-8 text-[#A1A1AA] mx-auto mb-3 stroke-[1.5]" />
            <p className="text-base font-medium text-[#18181B] mb-1">
              Belum ada foto di kategori ini
            </p>
            <p className="text-sm text-[#71717A] mb-6">
              Unggah foto kenangan bersama untuk memperkaya halaman kejutan ini.
            </p>
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#E11D48] hover:bg-[#BE123C] rounded-lg transition-colors cursor-pointer"
            >
              <ImagePlus className="w-4 h-4" />
              <span>Tambah Foto Pertama</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[280px]">
            {filteredPhotos.map((photo, index) => {
              const isHeroTile = photo.featured || (index === 0 && activeCategory === 'Semua');
              return (
                <article
                  key={photo.id}
                  className={`group relative rounded-2xl overflow-hidden border border-[#E7E5E4] bg-white ${
                    isHeroTile ? 'md:col-span-2 md:row-span-2' : 'col-span-1 row-span-1'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setLightboxIndex(index)}
                    className="w-full h-full block text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#E11D48]"
                    aria-label={`Lihat foto: ${photo.caption}`}
                  >
                    <ResilientPhoto
                      src={photo.imageUrl}
                      alt={photo.caption}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-90 transition-opacity" />
                    <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 text-white">
                      <div className="flex items-center gap-2 text-xs text-white/80 mb-1.5">
                        <span>{photo.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{photo.dateLabel}</span>
                      </div>
                      <p
                        className={`font-medium text-white leading-snug line-clamp-2 ${
                          isHeroTile ? 'text-lg sm:text-xl max-w-xl' : 'text-sm sm:text-base'
                        }`}
                      >
                        {photo.caption}
                      </p>
                    </div>
                  </button>

                  {/* Hover / Focus Action Controls */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => openEditModal(photo)}
                      className="p-2 rounded-lg bg-white/95 text-[#18181B] hover:bg-white shadow-sm cursor-pointer"
                      aria-label="Edit keterangan foto"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(photo.id)}
                      className="p-2 rounded-lg bg-white/95 text-[#E11D48] hover:bg-white shadow-sm cursor-pointer"
                      aria-label="Hapus foto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox */}
      {activeLightboxPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeLightboxPhoto.caption}
          className="fixed inset-0 z-50 bg-[#09090B]/95 text-white flex flex-col justify-between p-4 sm:p-8"
        >
          <div className="flex items-center justify-between gap-4 max-w-[1280px] w-full mx-auto">
            <div className="text-xs text-[#A1A1AA] flex items-center gap-2">
              <span className="tabular-nums">
                {(lightboxIndex ?? 0) + 1} / {filteredPhotos.length}
              </span>
              <span aria-hidden="true">·</span>
              <span>{activeLightboxPhoto.category}</span>
              <span aria-hidden="true">·</span>
              <span>{activeLightboxPhoto.dateLabel}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const target = activeLightboxPhoto;
                  setLightboxIndex(null);
                  openEditModal(target);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#E4E4E7] hover:text-white border border-[#3F3F46] rounded-lg cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                className="p-2 text-[#D4D4D8] hover:text-white rounded-lg cursor-pointer"
                aria-label="Tutup pratinjau foto"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="relative flex-1 flex items-center justify-center my-4 min-h-0">
            {filteredPhotos.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setLightboxIndex(
                    ((lightboxIndex ?? 0) - 1 + filteredPhotos.length) %
                      filteredPhotos.length
                  )
                }
                className="absolute left-2 sm:left-4 z-10 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white cursor-pointer"
                aria-label="Foto sebelumnya"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            <div className="max-w-5xl max-h-[75vh] w-full h-full flex items-center justify-center">
              <ResilientPhoto
                src={activeLightboxPhoto.imageUrl}
                alt={activeLightboxPhoto.caption}
                className="max-w-full max-h-[75vh] object-contain rounded-xl"
              />
            </div>

            {filteredPhotos.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setLightboxIndex(((lightboxIndex ?? 0) + 1) % filteredPhotos.length)
                }
                className="absolute right-2 sm:right-4 z-10 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white cursor-pointer"
                aria-label="Foto berikutnya"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="max-w-2xl mx-auto text-center">
            <p className="text-base sm:text-lg font-medium text-white">
              {activeLightboxPhoto.caption}
            </p>
          </div>
        </div>
      )}

      {/* Add Photo Modal */}
      {isAddOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Tambah Foto Kenangan"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white border border-[#E7E5E4] rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-xl my-auto">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-editorial text-2xl font-medium text-[#18181B]">
                  Tambah Foto Kenangan
                </h3>
                <p className="text-sm text-[#71717A] mt-0.5">
                  Unggah satu atau beberapa foto sekaligus beserta ceritanya.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="p-2 text-[#71717A] hover:text-[#18181B] rounded-lg cursor-pointer"
                aria-label="Tutup jendela tambah foto"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-5">
              <div>
                <label className="block border border-dashed border-[#D4D4D8] hover:border-[#18181B] rounded-xl p-6 text-center cursor-pointer transition-colors bg-[#FAF9F6]">
                  <Upload className="w-6 h-6 text-[#52525B] mx-auto mb-2" />
                  <span className="block text-sm font-medium text-[#18181B]">
                    Pilih Foto dari Perangkat
                  </span>
                  <span className="block text-xs text-[#71717A] mt-1">
                    JPG, PNG, atau WebP · Bisa pilih banyak foto sekaligus
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelection}
                    className="sr-only"
                  />
                </label>

                {draftPhotos.length > 0 && (
                  <div className="mt-4 space-y-3 max-h-56 overflow-y-auto pr-1">
                    {draftPhotos.map((item, idx) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-2 border border-[#E7E5E4] rounded-xl bg-white"
                      >
                        <img
                          src={item.previewUrl}
                          alt={`Pratinjau foto ${idx + 1}`}
                          className="w-16 h-16 object-cover rounded-lg shrink-0"
                        />
                        <input
                          type="text"
                          value={item.caption}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDraftPhotos((prev) =>
                              prev.map((d) =>
                                d.id === item.id ? { ...d, caption: val } : d
                              )
                            );
                          }}
                          placeholder="Tulis keterangan foto ini (opsional)..."
                          className="flex-1 min-w-0 text-sm px-3 py-2 border border-[#E7E5E4] rounded-lg focus:outline-none focus:border-[#18181B]"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setDraftPhotos((prev) =>
                              prev.filter((d) => d.id !== item.id)
                            )
                          }
                          className="p-2 text-[#71717A] hover:text-[#E11D48] cursor-pointer"
                          aria-label="Hapus foto dari antrean"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#52525B] mb-1.5">
                  Atau Tempel Tautan Foto (Opsional)
                </label>
                <input
                  type="url"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="https://..."
                  className="w-full text-sm px-3.5 py-2.5 border border-[#E7E5E4] rounded-lg focus:outline-none focus:border-[#18181B]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#52525B] mb-1.5">
                  Cerita atau Keterangan Foto
                </label>
                <input
                  type="text"
                  value={singleCaption}
                  onChange={(e) => setSingleCaption(e.target.value)}
                  placeholder="Misal: Liburan pertama kita ke pantai selatan"
                  className="w-full text-sm px-3.5 py-2.5 border border-[#E7E5E4] rounded-lg focus:outline-none focus:border-[#18181B]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#52525B] mb-1.5">
                    Tanggal / Momen
                  </label>
                  <input
                    type="text"
                    value={dateLabel}
                    onChange={(e) => setDateLabel(e.target.value)}
                    placeholder="Contoh: Oktober 2026"
                    className="w-full text-sm px-3.5 py-2.5 border border-[#E7E5E4] rounded-lg focus:outline-none focus:border-[#18181B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#52525B] mb-1.5">
                    Kategori
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as PhotoCategory)}
                    className="w-full text-sm px-3.5 py-2.5 border border-[#E7E5E4] rounded-lg bg-white focus:outline-none focus:border-[#18181B]"
                  >
                    <option value="Favorit">Favorit</option>
                    <option value="Perjalanan">Perjalanan</option>
                    <option value="Keluarga & Teman">Keluarga &amp; Teman</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2.5 text-sm text-[#3F3F46] cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 accent-[#E11D48] rounded"
                />
                <span>Sorot sebagai bingkai besar di galeri</span>
              </label>

              {formError && (
                <p className="text-xs font-medium text-[#E11D48]">{formError}</p>
              )}

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E7E5E4]">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#52525B] hover:text-[#18181B] rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-[#E11D48] hover:bg-[#BE123C] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan ke Galeri'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Photo Modal */}
      {editingPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Edit Foto"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white border border-[#E7E5E4] rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between gap-4 mb-5">
              <h3 className="font-editorial text-xl font-medium text-[#18181B]">
                Edit Keterangan Foto
              </h3>
              <button
                type="button"
                onClick={() => setEditingPhoto(null)}
                className="p-2 text-[#71717A] hover:text-[#18181B] rounded-lg cursor-pointer"
                aria-label="Tutup jendela edit foto"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#52525B] mb-1.5">
                  Cerita atau Keterangan
                </label>
                <textarea
                  rows={3}
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 border border-[#E7E5E4] rounded-lg focus:outline-none focus:border-[#18181B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#52525B] mb-1.5">
                    Tanggal / Momen
                  </label>
                  <input
                    type="text"
                    value={editDateLabel}
                    onChange={(e) => setEditDateLabel(e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-[#E7E5E4] rounded-lg focus:outline-none focus:border-[#18181B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#52525B] mb-1.5">
                    Kategori
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as PhotoCategory)}
                    className="w-full text-sm px-3 py-2 border border-[#E7E5E4] rounded-lg bg-white focus:outline-none focus:border-[#18181B]"
                  >
                    <option value="Favorit">Favorit</option>
                    <option value="Perjalanan">Perjalanan</option>
                    <option value="Keluarga & Teman">Keluarga &amp; Teman</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2.5 text-sm text-[#3F3F46] cursor-pointer">
                <input
                  type="checkbox"
                  checked={editFeatured}
                  onChange={(e) => setEditFeatured(e.target.checked)}
                  className="w-4 h-4 accent-[#E11D48] rounded"
                />
                <span>Sorot sebagai bingkai besar di galeri</span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E7E5E4]">
                <button
                  type="button"
                  onClick={() => setEditingPhoto(null)}
                  className="px-4 py-2 text-xs font-medium text-[#52525B] hover:text-[#18181B] rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#18181B] hover:bg-[#27272A] rounded-lg cursor-pointer"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
