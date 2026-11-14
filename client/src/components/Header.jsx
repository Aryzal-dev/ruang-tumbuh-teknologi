import React from 'react';
import { Search, Plus, Menu, ArrowUpDown, X, SlidersHorizontal, Globe, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  onOpenNewModal,
  onOpenMobileMenu,
  currentView,
  selectedModel,
  setSelectedModel,
  selectedTag,
  setSelectedTag,
}) {
  const { user } = useAuth();
  const hasActiveFilters = Boolean(selectedTag);

  return (
    <header className="sticky top-0 z-30 bg-[#101C32]/90 backdrop-blur-md border-b border-[#22375D] px-4 lg:px-8 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Search bar */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <button
            onClick={onOpenMobileMenu}
            className="p-2 rounded-xl text-[#9EACBF] hover:text-white hover:bg-[#15233D] lg:hidden shrink-0 transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          {currentView !== 'users' ? (
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#9EACBF] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari di koleksi studio Anda..."
                className="w-full bg-[#15233D] border border-[#22375D] rounded-xl pl-10 pr-9 py-2 text-sm text-[#E8ECF1] placeholder-[#9EACBF] focus:outline-none focus:border-[#B7F36B] focus:ring-1 focus:ring-[#B7F36B] transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9EACBF] hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-white text-sm font-bold font-['Plus_Jakarta_Sans']">
              <span>Panel Manajemen Pengguna & Hak Akses</span>
            </div>
          )}
        </div>

        {/* Right: Sort & Actions */}
        <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
          {currentView !== 'users' && (
            <div className="relative flex items-center">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#9EACBF] absolute left-3 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#15233D] border border-[#22375D] rounded-xl pl-8 pr-7 py-2 text-xs font-medium text-[#E8ECF1] focus:outline-none focus:border-[#B7F36B] cursor-pointer appearance-none"
              >
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
                <option value="title">Judul (A-Z)</option>
              </select>
            </div>
          )}

          {user && (
            <>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                title="Buka Halaman Galeri Publik di Tab Baru"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#15233D] hover:bg-[#182845] text-[#B7F36B] hover:text-white border border-[#22375D] hover:border-[#B7F36B]/40 transition-all cursor-pointer shrink-0 shadow-xs"
              >
                <Globe className="w-3.5 h-3.5 text-[#B7F36B]" />
                <span className="hidden sm:inline">Halaman Publik</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#9EACBF]" />
              </a>

              <button
                onClick={onOpenNewModal}
                className="flex items-center gap-2 bg-[#B7F36B] hover:bg-[#a2e852] text-[#101C32] px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-[#B7F36B]/20 hover:shadow-[#B7F36B]/35 transition-all transform active:scale-95 cursor-pointer shrink-0 font-['Plus_Jakarta_Sans']"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Simpan Prompt</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter Badges Strip */}
      {currentView !== 'users' && hasActiveFilters && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#22375D] flex-wrap text-xs">
          <span className="text-[#9EACBF] flex items-center gap-1 font-semibold">
            <SlidersHorizontal className="w-3 h-3 text-[#B7F36B]" />
            Filter aktif:
          </span>

          {selectedTag && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#15233D] text-[#E8ECF1] border border-[#22375D] font-medium">
              Tag: #{selectedTag}
              <button
                onClick={() => setSelectedTag('')}
                className="hover:text-white cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </header>
  );
}
