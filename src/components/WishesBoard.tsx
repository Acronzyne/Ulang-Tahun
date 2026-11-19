import { useState, type FormEvent } from 'react';
import { MessageSquarePlus, Pencil, Pin, Trash2, X } from 'lucide-react';
import type { BirthdayWish, WishTheme } from '../types/surprise';

interface WishesBoardProps {
  wishes: BirthdayWish[];
  onAddWish: (input: {
    senderName: string;
    relation: string;
    message: string;
    theme: WishTheme;
    pinned: boolean;
  }) => Promise<void>;
  onUpdateWish: (
    id: string,
    updates: Partial<Pick<BirthdayWish, 'senderName' | 'relation' | 'message' | 'theme' | 'pinned'>>
  ) => Promise<void>;
  onDeleteWish: (id: string) => Promise<void>;
}

const THEME_STYLES: Record<WishTheme, { card: string; meta: string; body: string }> = {
  ivory: {
    card: 'bg-white border border-[#E7E5E4] text-[#18181B]',
    meta: 'text-[#71717A]',
    body: 'text-[#27272A]',
  },
  rose: {
    card: 'bg-[#FFF1F2] border border-[#FECDD3] text-[#18181B]',
    meta: 'text-[#9F1239]',
    body: 'text-[#3F3F46]',
  },
  ink: {
    card: 'bg-[#18181B] border border-[#27272A] text-[#FAF9F6]',
    meta: 'text-[#A1A1AA]',
    body: 'text-[#E4E4E7]',
  },
};

export function WishesBoard({
  wishes,
  onAddWish,
  onUpdateWish,
  onDeleteWish,
}: WishesBoardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWish, setEditingWish] = useState<BirthdayWish | null>(null);

  const [senderName, setSenderName] = useState('');
  const [relation, setRelation] = useState('Sahabat');
  const [message, setMessage] = useState('');
  const [theme, setTheme] = useState<WishTheme>('ivory');
  const [pinned, setPinned] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const sortedWishes = [...wishes].sort((a, b) => Number(b.pinned) - Number(a.pinned));

  function openNewModal() {
    setEditingWish(null);
    setSenderName('');
    setRelation('Sahabat');
    setMessage('');
    setTheme('ivory');
    setPinned(false);
    setFormError('');
    setIsModalOpen(true);
  }

  function openEditModal(wish: BirthdayWish) {
    setEditingWish(wish);
    setSenderName(wish.senderName);
    setRelation(wish.relation);
    setMessage(wish.message);
    setTheme(wish.theme);
    setPinned(wish.pinned);
    setFormError('');
    setIsModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');
    if (!senderName.trim() || !message.trim()) {
      setFormError('Nama pengirim dan isi ucapan wajib diisi.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingWish) {
        await onUpdateWish(editingWish.id, {
          senderName: senderName.trim(),
          relation: relation.trim() || 'Teman',
          message: message.trim(),
          theme,
          pinned,
        });
      } else {
        await onAddWish({
          senderName: senderName.trim(),
          relation: relation.trim() || 'Teman',
          message: message.trim(),
          theme,
          pinned,
        });
      }
      setIsModalOpen(false);
    } catch {
      setFormError('Gagal menyimpan ucapan. Silakan coba lagi.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section id="ucapan" className="py-20 border-b border-[#E7E5E4]">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-xl">
            <p className="text-xs font-medium text-[#71717A] mb-2">
              Kumpulan Doa · <span className="tabular-nums">{wishes.length}</span> Ucapan Hangat
            </p>
            <h2 className="font-editorial text-3xl sm:text-4xl font-medium tracking-tight text-[#18181B] text-balance">
              Ucapan &amp; Doa Ulang Tahun
            </h2>
          </div>

          <button
            type="button"
            onClick={openNewModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#E11D48] hover:bg-[#BE123C] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E11D48]"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Tulis Ucapan</span>
          </button>
        </div>

        {sortedWishes.length === 0 ? (
          <div className="rounded-2xl border border-[#E7E5E4] bg-white p-12 text-center">
            <p className="text-base font-medium text-[#18181B] mb-1">
              Belum ada ucapan tertulis
            </p>
            <p className="text-sm text-[#71717A] mb-6">
              Jadilah yang pertama menuliskan doa dan pesan manis untuk hari spesialnya.
            </p>
            <button
              type="button"
              onClick={openNewModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#E11D48] hover:bg-[#BE123C] rounded-lg cursor-pointer"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Tulis Ucapan Pertama</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedWishes.map((wish) => {
              const style = THEME_STYLES[wish.theme] ?? THEME_STYLES.ivory;
              return (
                <article
                  key={wish.id}
                  className={`group rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5 ${style.card}`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-5">
                      <div className={`text-xs flex flex-wrap items-center gap-1.5 ${style.meta}`}>
                        <span className="font-semibold">{wish.senderName}</span>
                        <span aria-hidden="true">·</span>
                        <span>{wish.relation}</span>
                        {wish.pinned && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>Disematkan</span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity shrink-0">
                        <button
                          type="button"
                          onClick={() => onUpdateWish(wish.id, { pinned: !wish.pinned })}
                          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                            wish.theme === 'ink'
                              ? 'hover:bg-white/10 text-[#D4D4D8]'
                              : 'hover:bg-black/5 text-[#52525B]'
                          }`}
                          aria-label={wish.pinned ? 'Lepas sematan ucapan' : 'Sematkan ucapan'}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(wish)}
                          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                            wish.theme === 'ink'
                              ? 'hover:bg-white/10 text-[#D4D4D8]'
                              : 'hover:bg-black/5 text-[#52525B]'
                          }`}
                          aria-label="Edit ucapan"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteWish(wish.id)}
                          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                            wish.theme === 'ink'
                              ? 'hover:bg-white/10 text-[#FDA4AF]'
                              : 'hover:bg-black/5 text-[#E11D48]'
                          }`}
                          aria-label="Hapus ucapan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className={`text-[15px] leading-relaxed whitespace-pre-line ${style.body}`}>
                      “{wish.message}”
                    </p>
                  </div>

                  <div className={`mt-6 pt-4 border-t ${wish.theme === 'ink' ? 'border-[#27272A]' : 'border-black/5'} text-xs ${style.meta}`}>
                    <span className="tabular-nums">
                      {new Date(wish.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Wish Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={editingWish ? 'Edit Ucapan' : 'Tulis Ucapan Baru'}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white border border-[#E7E5E4] rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-editorial text-2xl font-medium text-[#18181B]">
                  {editingWish ? 'Edit Ucapan' : 'Tulis Ucapan Ulang Tahun'}
                </h3>
                <p className="text-sm text-[#71717A] mt-0.5">
                  Sampaikan doa terbaik atau pesan berkesan untuk hari ulang tahunnya.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-[#71717A] hover:text-[#18181B] rounded-lg cursor-pointer"
                aria-label="Tutup jendela tulis ucapan"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#52525B] mb-1.5">
                    Nama Pengirim
                  </label>
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Contoh: Raka Pratama"
                    className="w-full text-sm px-3.5 py-2.5 border border-[#E7E5E4] rounded-lg focus:outline-none focus:border-[#18181B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#52525B] mb-1.5">
                    Hubungan / Peran
                  </label>
                  <input
                    type="text"
                    value={relation}
                    onChange={(e) => setRelation(e.target.value)}
                    placeholder="Contoh: Sahabat, Adik, Pasangan"
                    className="w-full text-sm px-3.5 py-2.5 border border-[#E7E5E4] rounded-lg focus:outline-none focus:border-[#18181B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#52525B] mb-1.5">
                  Teks Ucapan &amp; Doa
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tuliskan doa, harapan, atau kenangan terbaikmu di sini..."
                  className="w-full text-sm px-3.5 py-2.5 border border-[#E7E5E4] rounded-lg focus:outline-none focus:border-[#18181B]"
                />
              </div>

              <div>
                <span className="block text-xs font-medium text-[#52525B] mb-2">
                  Gaya Kartu Ucapan
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'ivory', label: 'Kertas Gading' },
                      { id: 'rose', label: 'Mawar Lembut' },
                      { id: 'ink', label: 'Tinta Gelap' },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setTheme(opt.id)}
                      className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                        theme === opt.id
                          ? 'border-[#E11D48] bg-[#FFF1F2] text-[#9F1239]'
                          : 'border-[#E7E5E4] bg-white text-[#52525B] hover:border-[#18181B]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2.5 text-sm text-[#3F3F46] cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={pinned}
                  onChange={(e) => setPinned(e.target.checked)}
                  className="w-4 h-4 accent-[#E11D48] rounded"
                />
                <span>Sematkan di barisan teratas</span>
              </label>

              {formError && (
                <p className="text-xs font-medium text-[#E11D48]">{formError}</p>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E7E5E4]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#52525B] hover:text-[#18181B] rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-[#E11D48] hover:bg-[#BE123C] disabled:opacity-60 rounded-lg cursor-pointer"
                >
                  {isSaving ? 'Menyimpan...' : editingWish ? 'Simpan Perubahan' : 'Kirim Ucapan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
