import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Search,
  ArrowUpDown,
  X,
  Image as ImageIcon,
  Video as VideoIcon,
  Tag,
  Loader2,
  ImageOff,
  LayoutDashboard,
} from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import PromptCard from '../components/PromptCard';
import LightboxModal from '../components/LightboxModal';

export default function PublicGalleryView({ onNavigate }) {
  const { user } = useAuth();

  const [prompts, setPrompts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [mediaType, setMediaType] = useState('all'); // all, image, video
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Lightbox
  const [selectedPrompt, setSelectedPrompt] = useState(null);

  // Toast
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const loadPublicPrompts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        sort: sortBy,
      };

      if (mediaType !== 'all') params.media_type = mediaType;
      if (selectedModel) params.ai_model = selectedModel;
      if (searchQuery.trim()) params.q = searchQuery.trim();

      const data = await api.getPublicPrompts(params);
      setStats({
        stats: data.stats,
        models: data.models,
        tags: data.tags,
      });

      let list = data.prompts || [];

      if (selectedTag) {
        list = list.filter((p) => {
          if (!p.tags) return false;
          const tagsArr = p.tags.split(',').map((t) => t.trim().toLowerCase());
          return tagsArr.includes(selectedTag.toLowerCase());
        });
      }

      setPrompts(list);
    } catch (err) {
      console.error('Failed to load public prompts:', err);
    } finally {
      setLoading(false);
    }
  }, [mediaType, selectedModel, selectedTag, searchQuery, sortBy]);

  useEffect(() => {
    loadPublicPrompts();
  }, [loadPublicPrompts]);

  const currentIndex = selectedPrompt
    ? prompts.findIndex((p) => p.id === selectedPrompt.id)
    : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < prompts.length - 1;

  const handleNavigateLightbox = (direction) => {
    const nextIdx = currentIndex + direction;
    if (nextIdx >= 0 && nextIdx < prompts.length) {
      setSelectedPrompt(prompts[nextIdx]);
    }
  };

  return (
    <div className="min-h-screen bg-[#101C32] text-[#E8ECF1] flex flex-col selection:bg-[#B7F36B] selection:text-[#101C32]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-60 bg-[#B7F36B] text-[#101C32] px-4 py-2.5 rounded-xl shadow-xl shadow-[#B7F36B]/25 text-xs font-bold animate-bounce flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#101C32]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Public Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#101C32]/90 backdrop-blur-xl border-b border-[#22375D] px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand with User Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#15233D] border border-[#22375D] p-1 flex items-center justify-center shadow-md">
              <img
                src="/logo.png"
                alt="Ruang Tumbuh Teknologi Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-bold text-lg text-white font-['Plus_Jakarta_Sans'] tracking-tight block leading-tight">
                Ruang Tumbuh Teknologi
              </span>
              <span className="text-[11px] text-[#B7F36B] font-medium tracking-wide">
                AI Prompt & Media Studio
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-2">
            <div className="relative">
              <Search className="w-4 h-4 text-[#9EACBF] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari prompt gambar, video, style, atau nama kreator..."
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
          </div>

          {/* Quick jump to Dashboard for logged in users */}
          {user && (
            <button
              onClick={() => onNavigate('/dashboard')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#B7F36B] text-[#101C32] hover:bg-[#a2e852] transition-all cursor-pointer shrink-0 shadow-md shadow-[#B7F36B]/20"
              title="Buka Dashboard Studio"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Buka Dashboard Studio</span>
            </button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-10 px-4 sm:px-8 border-b border-[#22375D]/60 bg-gradient-to-b from-[#15233D]/60 to-[#101C32]">
        {/* Ambient Lime & Navy Glow */}
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-[#B7F36B]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-1/4 w-80 h-80 bg-[#15233D] rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#15233D] border border-[#B7F36B]/40 text-[#B7F36B] text-xs font-semibold backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#B7F36B] animate-pulse" />
            <span>Koleksi Terkurasi • Ruang Tumbuh Teknologi</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight font-['Plus_Jakarta_Sans']">
            Temukan, Jelajahi & Salin <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#B7F36B] via-[#E8ECF1] to-[#B7F36B] bg-clip-text text-transparent">
              Prompt AI Terbaik
            </span>
          </h1>

          <p className="text-sm sm:text-base text-[#E8ECF1]/80 max-w-2xl mx-auto leading-relaxed">
            Platform Ruang Tumbuh Teknologi untuk mengeksplorasi prompt gambar dan video AI berkualitas tinggi yang siap disalin dalam satu klik lengkap dengan parameter generasi.
          </p>

          {/* Quick Stats Strip */}
          {stats?.stats && (
            <div className="pt-2 flex items-center justify-center gap-4 sm:gap-8 text-xs text-[#E8ECF1]/70 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#B7F36B]" />
                <strong className="text-white">{stats.stats.total}</strong> Prompt Publik
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#E8ECF1]" />
                <strong className="text-white">{stats.stats.images}</strong> Gambar AI
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#B7F36B]" />
                <strong className="text-white">{stats.stats.videos}</strong> Video AI
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#E8ECF1]" />
                <strong className="text-white">{stats.stats.creators}</strong> Kreator
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Main Showcase Feed */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-6">
        {/* Filter Controls Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#15233D]/80 p-3 sm:p-4 rounded-2xl border border-[#22375D] backdrop-blur-md">
          {/* Media Type Tabs */}
          <div className="flex rounded-xl bg-[#101C32] p-1 border border-[#22375D] self-start sm:self-auto">
            <button
              onClick={() => setMediaType('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mediaType === 'all'
                  ? 'bg-[#B7F36B] text-[#101C32] shadow-sm'
                  : 'text-[#E8ECF1] hover:text-white'
              }`}
            >
              Semua Karya
            </button>
            <button
              onClick={() => setMediaType('image')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mediaType === 'image'
                  ? 'bg-[#B7F36B] text-[#101C32] shadow-sm'
                  : 'text-[#E8ECF1] hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Gambar</span>
            </button>
            <button
              onClick={() => setMediaType('video')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mediaType === 'video'
                  ? 'bg-[#B7F36B] text-[#101C32] shadow-sm'
                  : 'text-[#E8ECF1] hover:text-white'
              }`}
            >
              <VideoIcon className="w-3.5 h-3.5" />
              <span>Video AI</span>
            </button>
          </div>

          {/* Sort Control */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#101C32] border border-[#22375D] rounded-xl px-3 py-2 text-xs font-medium text-[#E8ECF1] focus:outline-none focus:border-[#B7F36B] cursor-pointer appearance-none pr-8"
              >
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
                <option value="title">Judul (A-Z)</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-[#9EACBF] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {(selectedModel || selectedTag) && (
              <button
                onClick={() => {
                  setSelectedModel('');
                  setSelectedTag('');
                }}
                className="text-xs text-[#B7F36B] hover:underline cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* Popular Tags Strip */}
        {stats?.tags && stats.tags.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-[#9EACBF] flex items-center gap-1 font-semibold shrink-0">
              <Tag className="w-3 h-3 text-[#B7F36B]" />
              Tags:
            </span>
            {stats.tags.map((tag) => {
              const isSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(isSelected ? '' : tag)}
                  className={`px-3 py-1 rounded-full text-xs transition-all cursor-pointer shrink-0 font-medium ${
                    isSelected
                      ? 'bg-[#B7F36B] text-[#101C32] font-bold shadow-sm'
                      : 'bg-[#15233D] hover:bg-[#182845] text-[#E8ECF1] border border-[#22375D]'
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        )}

        {/* Public Cards Grid */}
        {loading ? (
          <div className="py-28 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#B7F36B] animate-spin" />
            <p className="text-xs text-[#E8ECF1]/70">Memuat galeri karya publik...</p>
          </div>
        ) : prompts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {prompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onSelect={(p) => setSelectedPrompt(p)}
                onToggleFavorite={() => {
                  showToast('Prompt berhasil disalin ke clipboard!');
                }}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="py-24 px-4 text-center border-2 border-dashed border-[#22375D] rounded-3xl bg-[#15233D]/40 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-[#B7F36B]/10 text-[#B7F36B] border border-[#B7F36B]/20 flex items-center justify-center mb-4">
              <ImageOff className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h3 className="text-base font-bold text-white mb-1 font-['Plus_Jakarta_Sans']">
              Tidak ada karya publik ditemukan
            </h3>
            <p className="text-xs text-[#E8ECF1]/70 max-w-sm mb-4">
              {searchQuery || selectedModel || selectedTag
                ? 'Tidak ada prompt yang cocok dengan kata kunci atau filter Anda. Coba kata kunci lain atau reset filter.'
                : 'Belum ada prompt yang dipublikasikan.'}
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#22375D] bg-[#0A1220] py-8 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9EACBF]">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Logo" className="w-5 h-5 object-contain" />
            <span className="font-bold text-white font-['Plus_Jakarta_Sans']">
              Ruang Tumbuh Teknologi
            </span>
            <span>— AI Prompt & Media Studio</span>
          </div>
          <p>© 2026 Ruang Tumbuh Teknologi. All rights reserved.</p>
        </div>
      </footer>

      {/* Lightbox Modal */}
      {selectedPrompt && (
        <LightboxModal
          prompt={selectedPrompt}
          onClose={() => setSelectedPrompt(null)}
          onEdit={() => {}}
          onDelete={() => {}}
          onToggleFavorite={() => {}}
          onNavigate={handleNavigateLightbox}
          hasPrev={hasPrev}
          hasNext={hasNext}
        />
      )}
    </div>
  );
}
