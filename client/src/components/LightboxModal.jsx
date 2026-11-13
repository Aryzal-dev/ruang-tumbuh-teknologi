import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  Star,
  Trash2,
  Edit3,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Layers,
  Sparkles,
  Maximize2,
  Film,
  Image as ImageIcon,
  User,
  Globe,
  Lock,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LightboxModal({
  prompt,
  onClose,
  onEdit,
  onDelete,
  onToggleFavorite,
  onTogglePublish,
  onApprove,
  onReject,
  isAdmin = false,
  onNavigate,
  hasPrev,
  hasNext,
}) {
  const { user } = useAuth();
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedNeg, setCopiedNeg] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const canEditOrDelete = user && (user.id === prompt.user_id || user.role === 'superadmin' || user.role === 'admin');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) onNavigate(-1);
      if (e.key === 'ArrowRight' && hasNext) onNavigate(1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNavigate, hasPrev, hasNext]);

  if (!prompt) return null;

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'prompt') {
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } else {
      setCopiedNeg(true);
      setTimeout(() => setCopiedNeg(false), 2000);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(prompt.media_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const ext = prompt.media_type === 'video' ? 'mp4' : 'png';
      link.download = `${prompt.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      window.open(prompt.media_url, '_blank');
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Yakin ingin menghapus prompt "${prompt.title}"?`)) {
      setIsDeleting(true);
      onDelete(prompt.id);
    }
  };

  const tags = prompt.tags
    ? prompt.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      {/* Navigation Arrows */}
      {hasPrev && (
        <button
          onClick={() => onNavigate(-1)}
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-60 p-3 rounded-full bg-[#15233D]/90 hover:bg-[#182845] text-[#E8ECF1] hover:text-[#B7F36B] border border-[#22375D] shadow-xl transition-all cursor-pointer"
          title="Prompt Sebelumnya (Panah Kiri)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {hasNext && (
        <button
          onClick={() => onNavigate(1)}
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-60 p-3 rounded-full bg-[#15233D]/90 hover:bg-[#182845] text-[#E8ECF1] hover:text-[#B7F36B] border border-[#22375D] shadow-xl transition-all cursor-pointer"
          title="Prompt Berikutnya (Panah Kanan)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Main Modal Card */}
      <div className="relative w-full max-w-6xl max-h-[92vh] bg-[#15233D] border border-[#22375D] rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row">
        {/* Close Button Mobile/Desktop */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-[#101C32]/80 hover:bg-[#182845] text-[#E8ECF1] hover:text-[#B7F36B] border border-[#22375D] transition-all cursor-pointer"
          title="Tutup (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Media Stage */}
        <div className="relative flex-1 bg-[#0B1323] flex items-center justify-center min-h-[300px] lg:min-h-[580px] p-4 overflow-hidden border-b lg:border-b-0 lg:border-r border-[#22375D]">
          {prompt.media_type === 'video' ? (
            <video
              src={prompt.media_url}
              controls
              autoPlay
              loop
              playsInline
              className="max-h-[75vh] w-auto max-w-full rounded-xl shadow-2xl object-contain"
            />
          ) : (
            <img
              src={prompt.media_url}
              alt={prompt.title}
              className="max-h-[75vh] w-auto max-w-full rounded-xl shadow-2xl object-contain select-none"
              onError={(e) => {
                e.target.src =
                  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80';
              }}
            />
          )}

          {/* Quick Floating Overlay in Media Stage */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#101C32]/90 backdrop-blur-md border border-[#22375D] text-[#E8ECF1] flex items-center gap-1.5">
              {prompt.media_type === 'video' ? (
                <Film className="w-3.5 h-3.5 text-[#B7F36B]" />
              ) : (
                <ImageIcon className="w-3.5 h-3.5 text-[#B7F36B]" />
              )}
              {prompt.media_type === 'video' ? 'Video AI' : 'Gambar'}
            </span>
            {prompt.aspect_ratio && (
              <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-[#101C32]/90 backdrop-blur-md border border-[#22375D] text-[#E8ECF1]/80">
                {prompt.aspect_ratio}
              </span>
            )}
          </div>

          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-full bg-[#101C32]/90 hover:bg-[#182845] backdrop-blur-md border border-[#22375D] text-xs font-medium text-[#E8ECF1] hover:text-[#B7F36B] flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
              title="Unduh file media"
            >
              <Download className="w-3.5 h-3.5 text-[#B7F36B]" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Right Column: Prompt & Metadata Inspector */}
        <div className="w-full lg:w-[460px] flex flex-col justify-between overflow-y-auto max-h-[50vh] lg:max-h-[92vh] p-6 bg-[#15233D]">
          <div className="space-y-5">
            {/* Header / Title */}
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#B7F36B]/10 text-[#B7F36B] border border-[#B7F36B]/30">
                  <Cpu className="w-3.5 h-3.5" />
                  {prompt.ai_model || 'Midjourney'}
                </span>
                {prompt.is_public !== undefined && (
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold border ${
                      prompt.publish_status === 'pending'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                        : prompt.publish_status === 'rejected'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : prompt.is_public === 1
                        ? 'bg-[#B7F36B]/15 text-[#B7F36B] border-[#B7F36B]/40'
                        : 'bg-[#101C32] text-[#E8ECF1]/70 border-[#22375D]'
                    }`}
                  >
                    {prompt.publish_status === 'pending' ? (
                      <>
                        <Clock className="w-3 h-3 text-amber-300" />
                        <span>Menunggu Persetujuan</span>
                      </>
                    ) : prompt.publish_status === 'rejected' ? (
                      <>
                        <XCircle className="w-3 h-3 text-rose-400" />
                        <span>Ditolak Admin</span>
                      </>
                    ) : prompt.is_public === 1 ? (
                      <>
                        <Globe className="w-3 h-3" />
                        <span>Publik</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3" />
                        <span>Privat</span>
                      </>
                    )}
                  </span>
                )}
                {prompt.author_name && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#E8ECF1] bg-[#101C32] px-2.5 py-0.5 rounded-md border border-[#22375D]">
                    <img
                      src={prompt.author_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(prompt.author_name)}`}
                      alt={prompt.author_name}
                      className="w-3.5 h-3.5 rounded-full object-cover"
                    />
                    <span>@{prompt.author_name}</span>
                  </span>
                )}
                <span className="text-xs text-[#E8ECF1]/60">
                  {new Date(prompt.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight font-['Plus_Jakarta_Sans']">
                {prompt.title}
              </h2>
            </div>

            {/* Superadmin / Admin Approval Action Banner */}
            {isAdmin && prompt.publish_status === 'pending' && onApprove && onReject && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
                <div>
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 font-['Plus_Jakarta_Sans']">
                    <Clock className="w-4 h-4 text-amber-300 animate-pulse" />
                    <span>Menunggu Persetujuan Publikasi</span>
                  </span>
                  <p className="text-[11px] text-[#E8ECF1]/70 mt-0.5">
                    User mengajukan prompt ini untuk tampil di Galeri Publik.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onApprove(prompt.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#B7F36B] hover:bg-[#a2e852] text-[#101C32] text-xs font-bold shadow-md shadow-[#B7F36B]/20 transition-all cursor-pointer"
                    title="Setujui dan tayangkan di Galeri Publik"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Setujui</span>
                  </button>
                  <button
                    onClick={() => onReject(prompt.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold transition-all cursor-pointer"
                    title="Tolak permohonan publikasi"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Tolak</span>
                  </button>
                </div>
              </div>
            )}

            {/* Main Prompt Box with One-Click Copy */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[#E8ECF1]/70 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#B7F36B]" />
                  <span>Prompt Utama</span>
                </label>
                <button
                  onClick={() => copyToClipboard(prompt.prompt_text, 'prompt')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    copiedPrompt
                      ? 'bg-[#B7F36B] text-[#101C32]'
                      : 'bg-[#B7F36B]/15 hover:bg-[#B7F36B] text-[#B7F36B] hover:text-[#101C32] border border-[#B7F36B]/30'
                  }`}
                >
                  {copiedPrompt ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#101C32]" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Prompt</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-3.5 rounded-xl bg-[#101C32] border border-[#22375D] text-[#E8ECF1] text-sm font-mono leading-relaxed max-h-48 overflow-y-auto select-all selection:bg-[#B7F36B]/30">
                {prompt.prompt_text}
              </div>
            </div>

            {/* Negative Prompt (if available) */}
            {prompt.negative_prompt && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#E8ECF1]/70">
                    Negative Prompt
                  </label>
                  <button
                    onClick={() =>
                      copyToClipboard(prompt.negative_prompt, 'negative')
                    }
                    className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-all cursor-pointer ${
                      copiedNeg
                        ? 'bg-[#B7F36B] text-[#101C32] font-bold'
                        : 'bg-[#101C32] hover:bg-[#182845] text-[#E8ECF1] border border-[#22375D]'
                    }`}
                  >
                    {copiedNeg ? (
                      <Check className="w-3 h-3 text-[#101C32]" />
                    ) : (
                      <Copy className="w-3 h-3 text-[#B7F36B]" />
                    )}
                    <span>{copiedNeg ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
                <div className="p-2.5 rounded-xl bg-[#101C32] border border-[#22375D] text-[#E8ECF1]/70 text-xs font-mono leading-relaxed max-h-32 overflow-y-auto">
                  {prompt.negative_prompt}
                </div>
              </div>
            )}

            {/* Parameter Badges Grid */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#E8ECF1]/70">
                Parameter Detail
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[#101C32] border border-[#22375D]">
                  <span className="text-[#E8ECF1]/60 block text-[10px] uppercase font-semibold">
                    Rasio Aspek
                  </span>
                  <span className="font-mono text-white font-medium">
                    {prompt.aspect_ratio || '16:9'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#101C32] border border-[#22375D]">
                  <span className="text-[#E8ECF1]/60 block text-[10px] uppercase font-semibold">
                    Seed
                  </span>
                  <span className="font-mono text-white font-medium truncate block">
                    {prompt.seed || '-'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#101C32] border border-[#22375D]">
                  <span className="text-[#E8ECF1]/60 block text-[10px] uppercase font-semibold">
                    CFG Scale
                  </span>
                  <span className="font-mono text-white font-medium">
                    {prompt.cfg_scale || '-'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#101C32] border border-[#22375D]">
                  <span className="text-[#E8ECF1]/60 block text-[10px] uppercase font-semibold">
                    Steps & Sampler
                  </span>
                  <span className="font-mono text-white font-medium truncate block">
                    {prompt.steps ? `${prompt.steps} steps` : '-'}{' '}
                    {prompt.sampler ? `(${prompt.sampler})` : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#E8ECF1]/70">
                  Tags
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((t, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 rounded-lg bg-[#101C32] text-[#E8ECF1] font-medium border border-[#22375D]"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Toolbar */}
          <div className="pt-5 mt-5 border-t border-[#22375D] flex items-center justify-between gap-3">
            {user ? (
              <button
                onClick={() => onToggleFavorite(prompt.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  prompt.is_favorite
                    ? 'bg-[#B7F36B] text-[#101C32] font-bold shadow-md shadow-[#B7F36B]/20'
                    : 'bg-[#101C32] hover:bg-[#182845] text-[#E8ECF1] border border-[#22375D]'
                }`}
              >
                <Star
                  className={`w-4 h-4 ${
                    prompt.is_favorite ? 'fill-[#101C32] text-[#101C32]' : 'text-[#B7F36B]'
                  }`}
                />
                <span>{prompt.is_favorite ? 'Favorit' : 'Jadikan Favorit'}</span>
              </button>
            ) : <div />}

            {canEditOrDelete && (
              <div className="flex items-center gap-2">
                {onTogglePublish && (
                  <button
                    onClick={() => onTogglePublish(prompt.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                      prompt.publish_status === 'pending'
                        ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/40'
                        : prompt.is_public === 1
                        ? 'bg-[#B7F36B]/15 hover:bg-[#B7F36B]/25 text-[#B7F36B] border-[#B7F36B]/30'
                        : 'bg-[#101C32] hover:bg-[#182845] text-[#E8ECF1] border border-[#22375D]'
                    }`}
                    title={
                      prompt.publish_status === 'pending'
                        ? isAdmin
                          ? 'Prompt ini sedang menunggu persetujuan Admin'
                          : 'Klik untuk membatalkan pengajuan publikasi'
                        : prompt.is_public === 1
                        ? 'Klik untuk jadikan privat'
                        : isAdmin
                        ? 'Klik untuk publikasikan langsung ke galeri publik'
                        : 'Klik untuk mengajukan publikasi ke Admin'
                    }
                  >
                    {prompt.publish_status === 'pending' ? (
                      <Clock className="w-3.5 h-3.5 text-amber-300" />
                    ) : prompt.is_public === 1 ? (
                      <Globe className="w-3.5 h-3.5" />
                    ) : (
                      <Lock className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {prompt.publish_status === 'pending'
                        ? isAdmin
                          ? 'Pending'
                          : 'Batal Ajukan'
                        : prompt.is_public === 1
                        ? 'Publik'
                        : isAdmin
                        ? 'Jadikan Publik'
                        : 'Ajukan Publik'}
                    </span>
                  </button>
                )}

                <button
                  onClick={() => onEdit(prompt)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#101C32] hover:bg-[#B7F36B] text-[#E8ECF1] hover:text-[#101C32] text-xs font-bold border border-[#22375D] transition-all cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all cursor-pointer"
                  title="Hapus Prompt"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
