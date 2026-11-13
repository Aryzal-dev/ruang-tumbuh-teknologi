import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import PromptCard from '../components/PromptCard';
import LightboxModal from '../components/LightboxModal';
import PromptModal from '../components/PromptModal';
import UserManagement from '../components/UserManagement';
import { Sparkles, Plus, ImageOff, Loader2, ExternalLink, Globe, Layers, Star, Video, Image as ImageIcon } from 'lucide-react';

export default function DashboardView({ onNavigate }) {
  const { user, logout } = useAuth();

  // Navigation View inside Dashboard: 'studio' | 'users'
  const [currentView, setCurrentView] = useState('studio');

  const [prompts, setPrompts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filters & Search
  const [activeFilter, setActiveFilter] = useState('all'); // all, image, video, favorite
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Modals
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Fetch prompts
  const loadPrompts = useCallback(async () => {
    if (!user || currentView === 'users') return;

    setLoading(true);
    try {
      const params = {
        sort: sortBy,
      };

      if (activeFilter === 'image') params.media_type = 'image';
      if (activeFilter === 'video') params.media_type = 'video';
      if (activeFilter === 'favorite') params.favorite = '1';

      if (selectedModel) params.ai_model = selectedModel;
      if (searchQuery.trim()) params.q = searchQuery.trim();

      const data = await api.getPrompts(params);
      let list = data.prompts || [];

      // If backend returned stats with prompts, update stats state immediately
      if (data.stats) {
        setStats((prev) => ({
          ...prev,
          stats: { ...(prev?.stats || {}), ...data.stats },
        }));
      }

      // Filter by tag in memory if selectedTag
      if (selectedTag) {
        list = list.filter((p) => {
          if (!p.tags) return false;
          const tagsArr = p.tags.split(',').map((t) => t.trim().toLowerCase());
          return tagsArr.includes(selectedTag.toLowerCase());
        });
      }

      setPrompts(list);
    } catch (err) {
      console.error('Failed to load prompts:', err);
    } finally {
      setLoading(false);
    }
  }, [user, currentView, activeFilter, selectedModel, selectedTag, searchQuery, sortBy]);

  // Fetch stats
  const loadStats = useCallback(async () => {
    if (!user) return;
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadPrompts();
      loadStats();
    }
  }, [user, loadPrompts, loadStats]);

  // Handle Save (Create / Update)
  const handleSavePrompt = async (formData, id) => {
    if (id) {
      await api.updatePrompt(id, formData);
      showToast('Prompt berhasil diperbarui!');
    } else {
      await api.createPrompt(formData);
      showToast('Prompt baru berhasil disimpan!');
    }
    loadPrompts();
    loadStats();
  };

  // Handle Delete
  const handleDeletePrompt = async (id) => {
    try {
      await api.deletePrompt(id);
      setSelectedPrompt(null);
      showToast('Prompt berhasil dihapus.');
      loadPrompts();
      loadStats();
    } catch (err) {
      alert(err.message || 'Gagal menghapus prompt.');
    }
  };

  // Handle Favorite Toggle
  const handleToggleFavorite = async (id) => {
    try {
      const res = await api.toggleFavorite(id);
      setPrompts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_favorite: res.is_favorite } : p))
      );
      if (selectedPrompt && selectedPrompt.id === id) {
        setSelectedPrompt((prev) => ({ ...prev, is_favorite: res.is_favorite }));
      }
      loadStats();
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  // Handle Publish Toggle
  const handleTogglePublish = async (id) => {
    try {
      const res = await api.togglePublish(id);
      setPrompts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_public: res.is_public } : p))
      );
      if (selectedPrompt && selectedPrompt.id === id) {
        setSelectedPrompt((prev) => ({ ...prev, is_public: res.is_public }));
      }
      showToast(res.message);
      loadStats();
    } catch (err) {
      alert(err.message || 'Gagal mengubah status publikasi.');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    logout();
    onNavigate('/login');
  };

  // Lightbox Navigation
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

  // Derive robust stats that are ALWAYS synchronized with current prompts collection
  const statsTotal = stats?.stats?.total && stats.stats.total > 0 ? stats.stats.total : prompts.length;
  const statsImages = stats?.stats?.images !== undefined && stats.stats.images > 0
    ? stats.stats.images
    : prompts.filter((p) => p.media_type === 'image').length;
  const statsVideos = stats?.stats?.videos !== undefined && stats.stats.videos > 0
    ? stats.stats.videos
    : prompts.filter((p) => p.media_type === 'video').length;
  const statsFavorites = stats?.stats?.favorites !== undefined
    ? stats.stats.favorites
    : prompts.filter((p) => p.is_favorite === 1).length;
  const statsPublished = stats?.stats?.published !== undefined
    ? stats.stats.published
    : prompts.filter((p) => p.is_public === 1).length;

  const currentStats = {
    stats: {
      total: statsTotal,
      images: statsImages,
      videos: statsVideos,
      favorites: statsFavorites,
      published: statsPublished,
    },
    models: stats?.models || [],
    tags: stats?.tags || [],
  };

  return (
    <div className="min-h-screen bg-[#101C32] text-[#E8ECF1] flex flex-col lg:flex-row selection:bg-[#B7F36B] selection:text-[#101C32]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-60 bg-[#B7F36B] text-[#101C32] px-4 py-2.5 rounded-xl shadow-xl shadow-[#B7F36B]/25 text-xs font-bold animate-bounce flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#101C32]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Dashboard Sidebar */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        activeFilter={activeFilter}
        setActiveFilter={(val) => {
          setActiveFilter(val);
          setSelectedModel('');
          setSelectedTag('');
        }}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        selectedTag={selectedTag}
        setSelectedTag={setSelectedTag}
        stats={currentStats}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-72 min-h-screen">
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onOpenNewModal={() => {
            setEditingPrompt(null);
            setIsPromptModalOpen(true);
          }}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          currentView={currentView}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
        />

        {/* Content Body */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {currentView === 'users' ? (
            /* User Management View (Only for logged in superadmin/admin) */
            <UserManagement onClose={() => setCurrentView('studio')} />
          ) : (
            /* Studio Saya Dashboard */
            <>
              {/* Top Banner with Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[#15233D] border border-[#22375D] rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#E8ECF1]/60 block">
                      Total Prompt
                    </span>
                    <span className="text-2xl font-bold text-white mt-1 block font-['Plus_Jakarta_Sans']">
                      {statsTotal}
                    </span>
                    <span className="text-[10px] text-[#B7F36B] block mt-0.5 font-medium">
                      {statsPublished} dipublikasikan
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#B7F36B]/10 border border-[#B7F36B]/20 flex items-center justify-center text-[#B7F36B]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-[#15233D] border border-[#22375D] rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#E8ECF1]/60 block">
                      Gambar AI
                    </span>
                    <span className="text-2xl font-bold text-white mt-1 block font-['Plus_Jakarta_Sans']">
                      {statsImages}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#B7F36B]/10 border border-[#B7F36B]/20 flex items-center justify-center text-[#B7F36B]">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-[#15233D] border border-[#22375D] rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#E8ECF1]/60 block">
                      Video AI
                    </span>
                    <span className="text-2xl font-bold text-white mt-1 block font-['Plus_Jakarta_Sans']">
                      {statsVideos}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#B7F36B]/10 border border-[#B7F36B]/20 flex items-center justify-center text-[#B7F36B]">
                    <Video className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-[#15233D] border border-[#22375D] rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#E8ECF1]/60 block">
                      Favorit
                    </span>
                    <span className="text-2xl font-bold text-white mt-1 block font-['Plus_Jakarta_Sans']">
                      {statsFavorites}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#B7F36B]/10 border border-[#B7F36B]/20 flex items-center justify-center text-[#B7F36B]">
                    <Star className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 text-xs font-semibold bg-[#B7F36B]/15 text-[#B7F36B] border border-[#B7F36B]/30 px-2.5 py-0.5 rounded-full">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Studio Dashboard Pengelola</span>
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-white mt-1.5 flex items-center gap-2 font-['Plus_Jakarta_Sans']">
                    <span>
                      {activeFilter === 'all'
                        ? 'Semua Koleksi Prompt'
                        : activeFilter === 'image'
                        ? 'Koleksi Gambar (Images)'
                        : activeFilter === 'video'
                        ? 'Koleksi Video AI'
                        : 'Prompt Favorit'}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#15233D] text-[#B7F36B] font-bold border border-[#22375D]">
                      {prompts.length} item
                    </span>
                  </h2>

                  <p className="text-xs text-[#E8ECF1]/70 mt-0.5">
                    Kelola koleksi prompt, atur status publikasi, dan salin parameter generasi.
                  </p>
                </div>
              </div>

              {/* Prompt Cards Grid */}
              {loading ? (
                <div className="py-24 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 text-[#B7F36B] animate-spin" />
                  <p className="text-xs text-[#E8ECF1]/60">Memuat koleksi prompt studio...</p>
                </div>
              ) : prompts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                  {prompts.map((prompt) => (
                    <PromptCard
                      key={prompt.id}
                      prompt={prompt}
                      onSelect={(p) => setSelectedPrompt(p)}
                      onToggleFavorite={handleToggleFavorite}
                      onTogglePublish={handleTogglePublish}
                    />
                  ))}
                </div>
              ) : (
                /* Empty State */
                <div className="py-20 px-4 text-center border-2 border-dashed border-[#22375D] rounded-3xl bg-[#15233D]/40 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#B7F36B]/10 text-[#B7F36B] border border-[#B7F36B]/20 flex items-center justify-center mb-4">
                    <ImageOff className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1 font-['Plus_Jakarta_Sans']">
                    Tidak ada prompt ditemukan
                  </h3>
                  <p className="text-xs text-[#E8ECF1]/70 max-w-sm mb-6">
                    {searchQuery || selectedModel || selectedTag
                      ? 'Tidak ada prompt yang cocok dengan kriteria filter atau pencarian Anda. Coba reset filter.'
                      : 'Anda belum menyimpan prompt pada koleksi ini. Mulai simpan sekarang!'}
                  </p>

                  <button
                    onClick={() => {
                      setEditingPrompt(null);
                      setIsPromptModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-[#B7F36B] hover:bg-[#a2e852] text-[#101C32] px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-[#B7F36B]/20 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Simpan Prompt Pertama</span>
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Lightbox / Detail Modal */}
      {selectedPrompt && (
        <LightboxModal
          prompt={selectedPrompt}
          onClose={() => setSelectedPrompt(null)}
          onEdit={(promptToEdit) => {
            setEditingPrompt(promptToEdit);
            setSelectedPrompt(null);
            setIsPromptModalOpen(true);
          }}
          onDelete={handleDeletePrompt}
          onToggleFavorite={handleToggleFavorite}
          onTogglePublish={handleTogglePublish}
          onNavigate={handleNavigateLightbox}
          hasPrev={hasPrev}
          hasNext={hasNext}
        />
      )}

      {/* Add / Edit Prompt Modal */}
      <PromptModal
        isOpen={isPromptModalOpen}
        onClose={() => {
          setIsPromptModalOpen(false);
          setEditingPrompt(null);
        }}
        onSave={handleSavePrompt}
        editingPrompt={editingPrompt}
      />
    </div>
  );
}
