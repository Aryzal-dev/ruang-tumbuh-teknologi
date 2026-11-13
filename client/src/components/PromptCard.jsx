import React, { useState } from 'react';
import {
  Copy,
  Check,
  Star,
  Play,
  Image as ImageIcon,
  Video as VideoIcon,
  Cpu,
  Layers,
  Clock,
  CheckCircle,
  XCircle,
  Globe,
  Lock,
} from 'lucide-react';

export default function PromptCard({
  prompt,
  onSelect,
  onToggleFavorite,
  onTogglePublish,
  onApprove,
  onReject,
  isAdmin = false,
}) {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(prompt.prompt_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFavorite = (e) => {
    e.stopPropagation();
    onToggleFavorite(prompt.id);
  };

  const handlePublish = (e) => {
    e.stopPropagation();
    if (onTogglePublish) {
      onTogglePublish(prompt.id);
    }
  };

  const tags = prompt.tags
    ? prompt.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  return (
    <div
      onClick={() => onSelect(prompt)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-[#15233D] hover:bg-[#182845] border border-[#22375D] hover:border-[#B7F36B]/60 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-[#B7F36B]/10 flex flex-col cursor-pointer"
    >
      {/* Media Container */}
      <div className="relative aspect-video w-full bg-[#101C32] overflow-hidden">
        {prompt.media_type === 'video' ? (
          <div className="w-full h-full relative">
            <video
              src={prompt.media_url}
              className="w-full h-full object-cover"
              muted
              loop
              playsInline
              ref={(el) => {
                if (el) {
                  if (isHovered) {
                    el.play().catch(() => {});
                  } else {
                    el.pause();
                    el.currentTime = 0;
                  }
                }
              }}
            />
            {/* Play Badge */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-transparent transition-colors pointer-events-none">
              <div className="w-10 h-10 rounded-full bg-[#101C32]/80 backdrop-blur-xs border border-[#B7F36B]/40 flex items-center justify-center text-[#B7F36B] shadow-lg group-hover:scale-110 transition-transform">
                <Play className="w-4 h-4 fill-[#B7F36B] translate-x-0.5" />
              </div>
            </div>
          </div>
        ) : (
          <img
            src={prompt.media_url}
            alt={prompt.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.target.src =
                'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80';
            }}
          />
        )}

        {/* Top Floating Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
          <span
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md shadow-xs ${
              prompt.media_type === 'video'
                ? 'bg-[#101C32]/90 text-[#B7F36B] border border-[#B7F36B]/40'
                : 'bg-[#101C32]/90 text-white border border-white/20'
            }`}
          >
            {prompt.media_type === 'video' ? (
              <VideoIcon className="w-3 h-3 text-[#B7F36B]" />
            ) : (
              <ImageIcon className="w-3 h-3 text-white" />
            )}
            <span>{prompt.media_type === 'video' ? 'Video' : 'Gambar'}</span>
          </span>

          {prompt.aspect_ratio && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-black/60 text-[#E8ECF1]/90 backdrop-blur-md border border-white/10">
              {prompt.aspect_ratio}
            </span>
          )}

          {prompt.is_public !== undefined && (
            <button
              type="button"
              onClick={handlePublish}
              title={
                prompt.publish_status === 'pending'
                  ? isAdmin
                    ? 'Menunggu Persetujuan Admin'
                    : 'Pengajuan sedang menunggu persetujuan Admin (Klik untuk batalkan pengajuan)'
                  : prompt.publish_status === 'rejected'
                  ? 'Pengajuan ditolak oleh Admin (Klik untuk ajukan ulang)'
                  : prompt.is_public === 1
                  ? 'Status: Publik (Klik untuk jadikan Privat)'
                  : 'Status: Privat (Klik untuk publikasikan)'
              }
              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold backdrop-blur-md border transition-all ${
                onTogglePublish ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
              } ${
                prompt.publish_status === 'pending'
                  ? 'bg-amber-500/25 text-amber-300 border-amber-500/50 animate-pulse'
                  : prompt.publish_status === 'rejected'
                  ? 'bg-rose-500/25 text-rose-300 border-rose-500/40'
                  : prompt.is_public === 1
                  ? 'bg-[#B7F36B]/20 text-[#B7F36B] border-[#B7F36B]/40 hover:bg-[#B7F36B]/30'
                  : 'bg-[#101C32]/85 text-[#E8ECF1]/70 border-[#22375D] hover:text-white'
              }`}
            >
              {prompt.publish_status === 'pending'
                ? '⏳ Menunggu Persetujuan'
                : prompt.publish_status === 'rejected'
                ? '❌ Ditolak'
                : prompt.is_public === 1
                ? '🌐 Publik'
                : '🔒 Privat'}
            </button>
          )}
        </div>

        {/* Favorite Star Button */}
        <button
          onClick={handleFavorite}
          title={prompt.is_favorite ? 'Hapus dari Favorit' : 'Simpan ke Favorit'}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all z-10 ${
            prompt.is_favorite
              ? 'bg-[#B7F36B] text-[#101C32] shadow-md shadow-[#B7F36B]/30'
              : 'bg-black/50 text-[#E8ECF1]/70 hover:text-white hover:bg-black/70'
          }`}
        >
          <Star
            className={`w-3.5 h-3.5 ${
              prompt.is_favorite ? 'fill-[#101C32]' : ''
            }`}
          />
        </button>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* AI Model Badge & Title */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#B7F36B] bg-[#B7F36B]/10 border border-[#B7F36B]/20 px-2 py-0.5 rounded-md">
              <Cpu className="w-3 h-3 text-[#B7F36B]" />
              {prompt.ai_model || 'Midjourney'}
            </span>
            {prompt.author_name ? (
              <span className="text-[10px] text-[#E8ECF1]/70 flex items-center gap-1 truncate max-w-[120px]">
                <img
                  src={prompt.author_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(prompt.author_name)}`}
                  alt={prompt.author_name}
                  className="w-3.5 h-3.5 rounded-full object-cover"
                />
                <span className="truncate">@{prompt.author_name}</span>
              </span>
            ) : prompt.seed ? (
              <span className="text-[10px] font-mono text-[#E8ECF1]/60 truncate">
                Seed: {prompt.seed}
              </span>
            ) : null}
          </div>

          <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-[#B7F36B] transition-colors font-['Plus_Jakarta_Sans']">
            {prompt.title}
          </h3>

          {/* Prompt Snippet */}
          <div className="relative mt-2 p-2.5 rounded-xl bg-[#101C32] border border-[#22375D]">
            <p className="text-xs text-[#E8ECF1]/80 line-clamp-2 font-mono leading-relaxed select-all">
              {prompt.prompt_text}
            </p>
          </div>

          {/* Quick Approval Action Bar (Superadmin & Admin) */}
          {isAdmin && prompt.publish_status === 'pending' && onApprove && onReject && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="mt-2.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-2"
            >
              <span className="text-[10px] font-semibold text-amber-300 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-300 animate-pulse" />
                <span>Persetujuan:</span>
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onApprove(prompt.id);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#B7F36B] hover:bg-[#a5e954] text-[#101C32] shadow-xs cursor-pointer transition-colors"
                  title="Setujui dan tayangkan di Galeri Publik"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Setujui</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReject(prompt.id);
                  }}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 cursor-pointer transition-colors"
                  title="Tolak permohonan publikasi"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Tolak</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions: One-Click Copy & Tags */}
        <div className="mt-3 pt-3 border-t border-[#22375D] flex items-center justify-between gap-2">
          {/* Tags */}
          <div className="flex items-center gap-1 overflow-hidden">
            {tags.slice(0, 2).map((t, idx) => (
              <span
                key={idx}
                className="text-[10px] text-[#E8ECF1]/70 bg-[#101C32] border border-[#22375D] px-1.5 py-0.5 rounded truncate max-w-[80px]"
              >
                #{t}
              </span>
            ))}
            {tags.length > 2 && (
              <span className="text-[10px] text-[#E8ECF1]/60">
                +{tags.length - 2}
              </span>
            )}
          </div>

          {/* One-Click Copy Button */}
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              copied
                ? 'bg-[#B7F36B] text-[#101C32] shadow-xs'
                : 'bg-[#B7F36B]/15 hover:bg-[#B7F36B] text-[#B7F36B] hover:text-[#101C32] border border-[#B7F36B]/30'
            }`}
            title="Salin Prompt ke Clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#101C32]" />
                <span>Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
