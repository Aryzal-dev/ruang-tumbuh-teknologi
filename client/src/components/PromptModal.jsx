import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Link as LinkIcon,
  Sparkles,
  Cpu,
  Image as ImageIcon,
  Video as VideoIcon,
  ChevronDown,
  ChevronUp,
  Loader2,
  Globe,
  Lock,
} from 'lucide-react';

const COMMON_MODELS = [
  'Midjourney v6',
  'Flux.1 Dev',
  'Flux.1 Schnell',
  'Stable Diffusion XL',
  'Kling AI 1.5',
  'Runway Gen-3',
  'Luma Dream Machine',
  'OpenAI Sora',
  'DALL-E 3',
];

const ASPECT_RATIOS = ['16:9', '9:16', '1:1', '4:5', '21:9', '3:2'];

export default function PromptModal({ isOpen, onClose, onSave, editingPrompt }) {
  const [mediaTab, setMediaTab] = useState('upload'); // 'upload' | 'url'
  const [title, setTitle] = useState('');
  const [promptText, setPromptText] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [mediaType, setMediaType] = useState('image');
  const [externalUrl, setExternalUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [aiModel, setAiModel] = useState('Midjourney v6');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [seed, setSeed] = useState('');
  const [cfgScale, setCfgScale] = useState('');
  const [steps, setSteps] = useState('');
  const [sampler, setSampler] = useState('');
  const [tags, setTags] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingPrompt) {
      setTitle(editingPrompt.title || '');
      setPromptText(editingPrompt.prompt_text || '');
      setNegativePrompt(editingPrompt.negative_prompt || '');
      setMediaType(editingPrompt.media_type || 'image');
      setAiModel(editingPrompt.ai_model || 'Midjourney v6');
      setAspectRatio(editingPrompt.aspect_ratio || '16:9');
      setSeed(editingPrompt.seed || '');
      setCfgScale(editingPrompt.cfg_scale || '');
      setSteps(editingPrompt.steps || '');
      setSampler(editingPrompt.sampler || '');
      setTags(editingPrompt.tags || '');
      setIsPublic(editingPrompt.is_public !== 0);

      if (editingPrompt.media_url?.startsWith('/uploads/')) {
        setMediaTab('upload');
        setPreviewUrl(editingPrompt.media_url);
      } else {
        setMediaTab('url');
        setExternalUrl(editingPrompt.media_url || '');
        setPreviewUrl(editingPrompt.media_url || '');
      }
    } else {
      // Reset defaults
      setTitle('');
      setPromptText('');
      setNegativePrompt('');
      setMediaType('image');
      setExternalUrl('');
      setSelectedFile(null);
      setPreviewUrl('');
      setAiModel('Midjourney v6');
      setAspectRatio('16:9');
      setSeed('');
      setCfgScale('');
      setSteps('');
      setSampler('');
      setTags('');
      setIsPublic(true);
      setMediaTab('upload');
      setShowAdvanced(false);
    }
    setError('');
  }, [editingPrompt, isOpen]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    if (file.type.startsWith('video/')) {
      setMediaType('video');
    } else {
      setMediaType('image');
    }
  };

  const handleUrlChange = (val) => {
    setExternalUrl(val);
    setPreviewUrl(val);
    const lower = val.toLowerCase();
    if (lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov')) {
      setMediaType('video');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !promptText.trim()) {
      setError('Judul dan Prompt Utama wajib diisi!');
      return;
    }

    if (mediaTab === 'upload' && !selectedFile && !previewUrl) {
      setError('Harap pilih file gambar atau video untuk diunggah.');
      return;
    }

    if (mediaTab === 'url' && !externalUrl.trim()) {
      setError('Harap masukkan URL gambar atau video.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('prompt_text', promptText.trim());
      formData.append('negative_prompt', negativePrompt.trim());
      formData.append('media_type', mediaType);
      formData.append('ai_model', aiModel);
      formData.append('aspect_ratio', aspectRatio);
      formData.append('seed', seed.trim());
      formData.append('cfg_scale', cfgScale.trim());
      formData.append('steps', steps.trim());
      formData.append('sampler', sampler.trim());
      formData.append('tags', tags.trim());
      formData.append('is_public', isPublic ? '1' : '0');

      if (mediaTab === 'upload' && selectedFile) {
        formData.append('media_file', selectedFile);
      } else if (mediaTab === 'url') {
        formData.append('media_url', externalUrl.trim());
      } else if (editingPrompt && previewUrl) {
        formData.append('media_url', previewUrl);
      }

      await onSave(formData, editingPrompt?.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Gagal menyimpan prompt.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#101C32] border border-[#22375D] rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-[#22375D] flex items-center justify-between bg-[#15233D]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#B7F36B]/15 border border-[#B7F36B]/30 flex items-center justify-center text-[#B7F36B]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base font-['Plus_Jakarta_Sans']">
                {editingPrompt ? 'Edit Data Prompt' : 'Simpan Prompt Baru'}
              </h2>
              <p className="text-xs text-[#E8ECF1]/70">
                Simpan teks prompt, parameter AI, serta file gambar atau videonya.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#E8ECF1]/70 hover:text-white hover:bg-[#182845] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Media Input Tabs */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#E8ECF1]/80">
              Hasil Media (Gambar / Video) <span className="text-[#B7F36B]">*</span>
            </label>

            <div className="flex rounded-xl bg-[#15233D] p-1 border border-[#22375D]">
              <button
                type="button"
                onClick={() => setMediaTab('upload')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                  mediaTab === 'upload'
                    ? 'bg-[#B7F36B] text-[#101C32] shadow-xs'
                    : 'text-[#E8ECF1]/70 hover:text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload File dari Komputer</span>
              </button>
              <button
                type="button"
                onClick={() => setMediaTab('url')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                  mediaTab === 'url'
                    ? 'bg-[#B7F36B] text-[#101C32] shadow-xs'
                    : 'text-[#E8ECF1]/70 hover:text-white'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Masukkan URL Media</span>
              </button>
            </div>

            {mediaTab === 'upload' ? (
              <div className="mt-2">
                <label className="border-2 border-dashed border-[#22375D] hover:border-[#B7F36B] rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#15233D]/70 hover:bg-[#15233D]">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {previewUrl ? (
                    <div className="w-full flex flex-col items-center gap-2">
                      {mediaType === 'video' ? (
                        <video
                          src={previewUrl}
                          className="max-h-48 rounded-xl object-contain"
                          controls
                        />
                      ) : (
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="max-h-48 rounded-xl object-contain"
                        />
                      )}
                      <p className="text-xs text-[#B7F36B] font-semibold">
                        Klik untuk mengganti file
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-4 text-center">
                      <div className="w-12 h-12 rounded-full bg-[#B7F36B]/10 text-[#B7F36B] border border-[#B7F36B]/20 flex items-center justify-center mb-2">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-white">
                        Klik untuk memilih gambar atau video
                      </p>
                      <p className="text-xs text-[#E8ECF1]/60 mt-1">
                        PNG, JPG, WEBP, MP4, WEBM (Maks 100MB)
                      </p>
                    </div>
                  )}
                </label>
              </div>
            ) : (
              <div className="mt-2 space-y-2">
                <input
                  type="url"
                  value={externalUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://example.com/generated-image.png atau video.mp4"
                  className="w-full bg-[#15233D] border border-[#22375D] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#E8ECF1]/40 focus:outline-none focus:border-[#B7F36B]"
                />
                {previewUrl && (
                  <div className="p-2 bg-[#15233D] rounded-xl border border-[#22375D] flex justify-center">
                    {mediaType === 'video' ? (
                      <video
                        src={previewUrl}
                        className="max-h-40 rounded-lg object-contain"
                        controls
                      />
                    ) : (
                      <img
                        src={previewUrl}
                        alt="URL Preview"
                        className="max-h-40 rounded-lg object-contain"
                      />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Media Type Selector */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#E8ECF1]/70">
              Tipe Media:
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMediaType('image')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  mediaType === 'image'
                    ? 'bg-[#B7F36B] text-[#101C32]'
                    : 'bg-[#15233D] text-[#E8ECF1]/70 border border-[#22375D]'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Gambar</span>
              </button>
              <button
                type="button"
                onClick={() => setMediaType('video')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  mediaType === 'video'
                    ? 'bg-[#B7F36B] text-[#101C32]'
                    : 'bg-[#15233D] text-[#E8ECF1]/70 border border-[#22375D]'
                }`}
              >
                <VideoIcon className="w-3.5 h-3.5" />
                <span>Video AI</span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#E8ECF1]/80">
              Judul Karya <span className="text-[#B7F36B]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Cyberpunk Ronin in Neo-Tokyo"
              className="w-full bg-[#15233D] border border-[#22375D] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#E8ECF1]/40 focus:outline-none focus:border-[#B7F36B]"
            />
          </div>

          {/* Main Prompt */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#E8ECF1]/80">
              Prompt Utama <span className="text-[#B7F36B]">*</span>
            </label>
            <textarea
              rows={4}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Tuliskan prompt AI Anda di sini..."
              className="w-full bg-[#15233D] border border-[#22375D] rounded-xl p-3.5 text-sm font-mono text-white placeholder-[#E8ECF1]/40 focus:outline-none focus:border-[#B7F36B] leading-relaxed"
            />
          </div>

          {/* Negative Prompt */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#E8ECF1]/60">
              Negative Prompt (Opsional)
            </label>
            <textarea
              rows={2}
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="blurry, distorted, low quality, extra fingers..."
              className="w-full bg-[#15233D] border border-[#22375D] rounded-xl p-3 text-xs font-mono text-[#E8ECF1] placeholder-[#E8ECF1]/40 focus:outline-none focus:border-[#B7F36B]"
            />
          </div>

          {/* AI Model & Aspect Ratio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#E8ECF1]/80">
                Model AI
              </label>
              <div className="relative">
                <input
                  type="text"
                  list="models-list"
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  placeholder="Pilih atau ketik nama model"
                  className="w-full bg-[#15233D] border border-[#22375D] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#E8ECF1]/40 focus:outline-none focus:border-[#B7F36B]"
                />
                <datalist id="models-list">
                  {COMMON_MODELS.map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#E8ECF1]/80">
                Aspek Rasio
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ASPECT_RATIOS.map((ar) => (
                  <button
                    key={ar}
                    type="button"
                    onClick={() => setAspectRatio(ar)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                      aspectRatio === ar
                        ? 'bg-[#B7F36B] text-[#101C32]'
                        : 'bg-[#15233D] text-[#E8ECF1]/70 border border-[#22375D] hover:text-white'
                    }`}
                  >
                    {ar}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#E8ECF1]/80">
              Tags (Pisahkan dengan koma)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Cyberpunk, Neon, Portrait, Sci-Fi"
              className="w-full bg-[#15233D] border border-[#22375D] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#E8ECF1]/40 focus:outline-none focus:border-[#B7F36B]"
            />
          </div>

          {/* Advanced Parameters Accordion */}
          <div className="border border-[#22375D] rounded-2xl overflow-hidden bg-[#15233D]/60">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full p-3.5 flex items-center justify-between text-xs font-semibold text-[#E8ECF1] hover:text-[#B7F36B] transition-colors cursor-pointer"
            >
              <span>Parameter Generator Tambahan (Seed, CFG, Steps, Sampler)</span>
              {showAdvanced ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {showAdvanced && (
              <div className="p-4 border-t border-[#22375D] grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#101C32]">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-[#E8ECF1]/60">
                    Seed
                  </label>
                  <input
                    type="text"
                    value={seed}
                    onChange={(e) => setSeed(e.target.value)}
                    placeholder="849204"
                    className="w-full bg-[#15233D] border border-[#22375D] rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-[#E8ECF1]/60">
                    CFG Scale
                  </label>
                  <input
                    type="text"
                    value={cfgScale}
                    onChange={(e) => setCfgScale(e.target.value)}
                    placeholder="7.0"
                    className="w-full bg-[#15233D] border border-[#22375D] rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-[#E8ECF1]/60">
                    Steps
                  </label>
                  <input
                    type="text"
                    value={steps}
                    onChange={(e) => setSteps(e.target.value)}
                    placeholder="30"
                    className="w-full bg-[#15233D] border border-[#22375D] rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-[#E8ECF1]/60">
                    Sampler
                  </label>
                  <input
                    type="text"
                    value={sampler}
                    onChange={(e) => setSampler(e.target.value)}
                    placeholder="Euler a"
                    className="w-full bg-[#15233D] border border-[#22375D] rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Fitur Publikasi ke Galeri Publik */}
          <div className="p-4 rounded-2xl bg-[#15233D] border border-[#22375D] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  isPublic
                    ? 'bg-[#B7F36B]/15 text-[#B7F36B] border border-[#B7F36B]/30'
                    : 'bg-[#101C32] text-[#E8ECF1]/60 border border-[#22375D]'
                }`}
              >
                {isPublic ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white font-['Plus_Jakarta_Sans']">
                    Publikasikan ke Galeri Publik
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isPublic
                        ? 'bg-[#B7F36B]/20 text-[#B7F36B] border border-[#B7F36B]/40'
                        : 'bg-[#101C32] text-[#E8ECF1]/60 border border-[#22375D]'
                    }`}
                  >
                    {isPublic ? 'Publik' : 'Privat'}
                  </span>
                </div>
                <p className="text-xs text-[#E8ECF1]/70 mt-0.5">
                  {isPublic
                    ? 'Karya & prompt ini akan tampil di halaman publik untuk semua pengunjung.'
                    : 'Hanya tersimpan di Studio Pribadi Anda (disembunyikan dari halaman publik).'}
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-[#101C32] border border-[#22375D] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#B7F36B] shadow-inner"></div>
            </label>
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-[#22375D] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#E8ECF1]/70 hover:text-white hover:bg-[#182845] transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-[#B7F36B] hover:bg-[#a2e852] text-[#101C32] font-bold px-5 py-2.5 rounded-xl text-xs shadow-lg shadow-[#B7F36B]/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#101C32]" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>{editingPrompt ? 'Perbarui Prompt' : 'Simpan Sekarang'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
