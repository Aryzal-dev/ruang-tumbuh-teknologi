import React, { useState } from 'react';
import { Lock, User, ArrowRight, ArrowLeft, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage({ onLoginSuccess, onBack }) {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!loginId.trim() || !password) {
        throw new Error('Username/email dan password wajib diisi.');
      }
      await login(loginId.trim(), password);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Kredensial tidak valid. Periksa kembali username atau password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#101C32] relative overflow-hidden selection:bg-[#B7F36B] selection:text-[#101C32]">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#B7F36B]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#15233D] rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-[#15233D] border border-[#22375D] rounded-3xl p-8 backdrop-blur-2xl shadow-2xl shadow-black/40">
        {/* Back Link */}
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-[#9EACBF] hover:text-[#B7F36B] transition-colors mb-6 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Galeri Publik</span>
          </button>
        )}

        {/* App Branding with User Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#101C32] border border-[#22375D] p-2.5 mb-4 shadow-xl shadow-black/20">
            <img
              src="/logo.png"
              alt="Ruang Tumbuh Teknologi Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-white font-['Plus_Jakarta_Sans'] tracking-tight">
            Ruang Tumbuh Teknologi
          </h1>
          <p className="text-xs text-[#B7F36B] font-medium mt-1">
            Portal Masuk Studio Prompt AI
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#E8ECF1] font-['Plus_Jakarta_Sans']">
              Username atau Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#9EACBF] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="Masukkan username atau email"
                className="w-full bg-[#101C32] border border-[#22375D] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#E8ECF1] placeholder-[#9EACBF] focus:outline-none focus:border-[#B7F36B] focus:ring-1 focus:ring-[#B7F36B]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#E8ECF1] font-['Plus_Jakarta_Sans']">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#9EACBF] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full bg-[#101C32] border border-[#22375D] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#E8ECF1] placeholder-[#9EACBF] focus:outline-none focus:border-[#B7F36B] focus:ring-1 focus:ring-[#B7F36B]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 flex items-center justify-center gap-2 bg-[#B7F36B] hover:bg-[#a2e852] text-[#101C32] py-3 rounded-xl text-sm font-bold shadow-lg shadow-[#B7F36B]/20 transition-all cursor-pointer disabled:opacity-50 font-['Plus_Jakarta_Sans']"
          >
            <span>{loading ? 'Memverifikasi...' : 'Masuk ke Studio'}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>

        <div className="mt-8 pt-5 border-t border-[#22375D] text-center">
          <p className="text-[11px] text-[#9EACBF] flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#B7F36B]" />
            <span>Akses dibatasi hanya untuk kreator & pengelola terdaftar.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
