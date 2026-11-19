interface NavbarProps {
  brandTitle: string;
  onOpenCurtain: () => void;
}

export function Navbar({ brandTitle, onOpenCurtain }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 bg-[#FAF9F6]/90 backdrop-blur-md border-b border-[#E7E5E4]">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 h-14 flex items-center justify-between gap-8">
        <a
          href="#beranda"
          className="font-editorial text-xl font-semibold tracking-tight text-[#18181B] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E11D48]"
        >
          {brandTitle}
        </a>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#52525B]">
          <a
            href="#beranda"
            className="hover:text-[#18181B] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Beranda
          </a>
          <a
            href="#galeri"
            className="hover:text-[#18181B] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Galeri Foto
          </a>
          <a
            href="#ucapan"
            className="hover:text-[#18181B] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Ucapan
          </a>
          <a
            href="#surat"
            className="hover:text-[#18181B] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Surat Utama
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenCurtain}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#E11D48] rounded-lg hover:bg-[#BE123C] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E11D48]"
          >
            Layar Kejutan
          </button>
        </div>
      </div>
    </header>
  );
}
