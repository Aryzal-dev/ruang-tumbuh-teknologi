import React from 'react';
import {
  Sparkles,
  Image as ImageIcon,
  Video,
  Star,
  Layers,
  Tag,
  LogOut,
  X,
  Cpu,
  Globe,
  Users,
  Shield,
  Crown,
  LayoutGrid,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({
  currentView,
  setCurrentView,
  activeFilter,
  setActiveFilter,
  selectedModel,
  setSelectedModel,
  selectedTag,
  setSelectedTag,
  stats,
  isOpen,
  onClose,
  onLogout,
}) {
  const { user, logout } = useAuth();
  const isAdminOrSuper = user?.role === 'superadmin' || user?.role === 'admin';

  const studioNavItems = [
    { id: 'all', label: 'Semua Prompt', icon: Sparkles, count: stats?.stats?.total ?? 0, color: 'text-[#B7F36B]' },
    { id: 'image', label: 'Gambar (Images)', icon: ImageIcon, count: stats?.stats?.images ?? 0, color: 'text-[#E8ECF1]' },
    { id: 'video', label: 'Video AI', icon: Video, count: stats?.stats?.videos ?? 0, color: 'text-[#B7F36B]' },
    { id: 'favorite', label: 'Favorit Saya', icon: Star, count: stats?.stats?.favorites ?? 0, color: 'text-amber-400' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0B1322] border-r border-[#22375D] backdrop-blur-xl flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#22375D]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#15233D] border border-[#22375D] p-1 flex items-center justify-center shadow-md shrink-0">
              <img
                src="/logo.png"
                alt="Ruang Tumbuh Teknologi"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-sm text-white font-['Plus_Jakarta_Sans'] tracking-tight truncate leading-tight">
                Ruang Tumbuh Teknologi
              </h1>
              <p className="text-[11px] text-[#B7F36B] font-medium truncate">
                AI Prompt Studio
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9EACBF] hover:text-white hover:bg-[#15233D] lg:hidden transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {/* Main Navigation: Studio & User Management */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9EACBF] px-3 mb-2 font-['Plus_Jakarta_Sans']">
              Menu Utama
            </div>
            <div className="space-y-1">
              {/* Studio Saya */}
              <button
                onClick={() => {
                  setCurrentView('studio');
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  currentView === 'studio'
                    ? 'bg-[#B7F36B]/15 text-[#B7F36B] border border-[#B7F36B]/40 shadow-sm'
                    : 'text-[#E8ECF1] hover:text-white hover:bg-[#15233D]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-[#B7F36B]" />
                  <span>Studio Saya</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  currentView === 'studio'
                    ? 'bg-[#B7F36B] text-[#101C32]'
                    : 'bg-[#15233D] text-[#E8ECF1]'
                }`}>
                  {stats?.stats?.total ?? 0}
                </span>
              </button>

              {/* User Management for Admin/Superadmin */}
              {user && isAdminOrSuper && (
                <button
                  onClick={() => {
                    setCurrentView('users');
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    currentView === 'users'
                      ? 'bg-[#B7F36B]/15 text-[#B7F36B] border border-[#B7F36B]/40 shadow-sm'
                      : 'text-[#E8ECF1] hover:text-white hover:bg-[#15233D]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {user.role === 'superadmin' ? (
                      <Crown className="w-4 h-4 text-[#B7F36B]" />
                    ) : (
                      <Shield className="w-4 h-4 text-[#B7F36B]" />
                    )}
                    <span>Manajemen User</span>
                  </div>
                  <span className="text-[10px] bg-[#15233D] text-[#B7F36B] border border-[#B7F36B]/30 px-1.5 py-0.5 rounded font-mono uppercase">
                    {user.role}
                  </span>
                </button>
              )}

              {/* Link to Public Showcase */}
              <div className="pt-2">
                <a
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold bg-[#15233D] hover:bg-[#182845] text-[#B7F36B] border border-[#22375D] hover:border-[#B7F36B]/40 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Lihat Halaman Publik</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-[#9EACBF] group-hover:text-[#B7F36B]" />
                </a>
              </div>
            </div>
          </div>

          {/* Sub Filters for Studio */}
          {currentView === 'studio' && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9EACBF] px-3 mb-2 flex items-center gap-2 font-['Plus_Jakarta_Sans']">
                <Layers className="w-3.5 h-3.5 text-[#B7F36B]" />
                <span>Koleksi Studio</span>
              </div>
              <nav className="space-y-1">
                {studioNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeFilter === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveFilter(item.id);
                        if (window.innerWidth < 1024) onClose();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#15233D] text-[#B7F36B] border border-[#B7F36B]/40 font-bold'
                          : 'text-[#E8ECF1] hover:text-white hover:bg-[#15233D]/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                        <span>{item.label}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-[#B7F36B] text-[#101C32]'
                          : 'bg-[#101C32] text-[#9EACBF]'
                      }`}>
                        {item.count}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>
          )}

          {/* AI Model Filters */}
          {currentView === 'studio' && stats?.models && stats.models.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9EACBF] px-3 mb-2 flex items-center justify-between font-['Plus_Jakarta_Sans']">
                <div className="flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-[#B7F36B]" />
                  <span>Model AI</span>
                </div>
                {selectedModel && (
                  <button
                    onClick={() => setSelectedModel('')}
                    className="text-[10px] text-[#B7F36B] hover:underline cursor-pointer lowercase"
                  >
                    reset
                  </button>
                )}
              </div>
              <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                {stats.models.map((m) => {
                  const isSelected = selectedModel === m.ai_model;
                  return (
                    <button
                      key={m.ai_model}
                      onClick={() => {
                        setSelectedModel(isSelected ? '' : m.ai_model);
                        if (window.innerWidth < 1024) onClose();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#B7F36B]/20 text-[#B7F36B] border border-[#B7F36B]/40 font-bold'
                          : 'text-[#E8ECF1]/80 hover:text-white hover:bg-[#15233D]'
                      }`}
                    >
                      <span className="truncate">{m.ai_model}</span>
                      <span className="text-[10px] bg-[#101C32] px-1.5 py-0.5 rounded text-[#9EACBF]">
                        {m.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Popular Tags */}
          {currentView === 'studio' && stats?.tags && stats.tags.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9EACBF] px-3 mb-2 flex items-center justify-between font-['Plus_Jakarta_Sans']">
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-[#B7F36B]" />
                  <span>Tags</span>
                </div>
                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag('')}
                    className="text-[10px] text-[#B7F36B] hover:underline cursor-pointer lowercase"
                  >
                    reset
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1 px-1 max-h-32 overflow-y-auto">
                {stats.tags.map((tag) => {
                  const isSelected = selectedTag === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => {
                        setSelectedTag(isSelected ? '' : tag);
                        if (window.innerWidth < 1024) onClose();
                      }}
                      className={`text-[11px] px-2 py-0.5 rounded-md transition-all cursor-pointer font-medium ${
                        isSelected
                          ? 'bg-[#B7F36B] text-[#101C32] font-bold shadow-xs'
                          : 'bg-[#15233D] text-[#E8ECF1] hover:text-white hover:bg-[#182845] border border-[#22375D]'
                      }`}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* User Card at Bottom */}
        <div className="p-4 border-t border-[#22375D] bg-[#0A1220]">
          {user ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={
                    user.avatar ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                      user.username || 'user'
                    )}`
                  }
                  alt={user.username}
                  className="w-10 h-10 rounded-full object-cover border border-[#B7F36B]/40 bg-[#15233D] shrink-0"
                  onError={(e) => {
                    e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=creator`;
                  }}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-white truncate font-['Plus_Jakarta_Sans']">
                      {user.username}
                    </p>
                    {user.role === 'superadmin' && (
                      <Crown className="w-3.5 h-3.5 text-[#B7F36B] shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-[#B7F36B] capitalize font-medium">
                    {user.role || 'user'}
                  </p>
                </div>
              </div>

              <button
                onClick={onLogout || logout}
                title="Keluar / Logout"
                className="p-2 text-[#9EACBF] hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="py-2 text-center">
              <p className="text-[11px] text-[#9EACBF]">© Ruang Tumbuh Teknologi</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
