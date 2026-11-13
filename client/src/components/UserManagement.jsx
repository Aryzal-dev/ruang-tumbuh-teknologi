import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Crown,
  User,
  Key,
  Edit2,
  Trash2,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Mail,
  Calendar,
} from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function UserManagement({ onClose }) {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message || 'Gagal memuat data pengguna.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openCreateModal = () => {
    setEditingUser(null);
    setUsername('');
    setEmail('');
    setPassword('');
    setRole('user');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setUsername(u.username);
    setEmail(u.email);
    setPassword(''); // leave blank if no change
    setRole(u.role || 'user');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      if (!editingUser) {
        // Create new
        if (!username.trim() || !email.trim() || !password) {
          throw new Error('Username, email, dan password wajib diisi.');
        }
        await api.createUser({
          username: username.trim(),
          email: email.trim(),
          password,
          role,
        });
        setSuccessMsg(`User "${username}" berhasil ditambahkan!`);
      } else {
        // Update existing
        await api.updateUser(editingUser.id, {
          username: username.trim(),
          email: email.trim(),
          password: password.trim() ? password.trim() : undefined,
          role,
        });
        setSuccessMsg(`User "${username}" berhasil diperbarui!`);
      }

      setIsModalOpen(false);
      loadUsers();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setFormError(err.message || 'Terjadi kesalahan saat menyimpan user.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (u) => {
    if (u.id === currentUser?.id) {
      alert('Anda tidak dapat menghapus akun Anda sendiri.');
      return;
    }
    if (window.confirm(`Yakin ingin menghapus user "${u.username}" beserta seluruh prompt miliknya?`)) {
      try {
        await api.deleteUser(u.id);
        setSuccessMsg(`User "${u.username}" berhasil dihapus.`);
        loadUsers();
        setTimeout(() => setSuccessMsg(''), 4000);
      } catch (err) {
        alert(err.message || 'Gagal menghapus user.');
      }
    }
  };

  const getRoleBadge = (userRole) => {
    switch (userRole) {
      case 'superadmin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#B7F36B]/15 text-[#B7F36B] border border-[#B7F36B]/40">
            <Crown className="w-3.5 h-3.5 text-[#B7F36B]" />
            <span>Superadmin</span>
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#15233D] text-[#E8ECF1] border border-[#22375D]">
            <Shield className="w-3.5 h-3.5 text-[#B7F36B]" />
            <span>Admin</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#15233D] text-[#E8ECF1]/70 border border-[#22375D]">
            <User className="w-3.5 h-3.5 text-[#E8ECF1]/60" />
            <span>User Biasa</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-[#15233D] border border-[#22375D] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-[#B7F36B]/15 border border-[#B7F36B]/30 flex items-center justify-center text-[#B7F36B]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight font-['Plus_Jakarta_Sans']">
                Manajemen Pengguna & Hak Akses
              </h2>
              <p className="text-xs text-[#E8ECF1]/70">
                Kelola akun anggota, tetapkan hak akses (Role), dan reset password.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-[#B7F36B] hover:bg-[#a2e852] text-[#101C32] px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-[#B7F36B]/20 transition-all cursor-pointer self-start sm:self-auto shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah User Baru</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-[#B7F36B]/15 border border-[#B7F36B]/30 text-[#B7F36B] text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-[#B7F36B] shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-[#15233D] border border-[#22375D] rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#E8ECF1]">
            <thead className="text-xs uppercase bg-[#101C32] text-[#E8ECF1]/70 border-b border-[#22375D]">
              <tr>
                <th className="px-6 py-4 font-semibold">Pengguna</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Hak Akses (Role)</th>
                <th className="px-6 py-4 font-semibold text-center">Total Prompt</th>
                <th className="px-6 py-4 font-semibold">Terdaftar</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#22375D]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-[#E8ECF1]/60">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#B7F36B]" />
                    <span>Memuat data pengguna...</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-[#E8ECF1]/60 text-xs">
                    Belum ada pengguna terdaftar.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isCurrent = u.id === currentUser?.id;
                  const isSuperadmin = u.role === 'superadmin';

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-[#182845] transition-colors"
                    >
                      {/* User Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              u.avatar ||
                              `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                                u.username
                              )}`
                            }
                            alt={u.username}
                            className="w-10 h-10 rounded-full object-cover border border-[#22375D] bg-[#101C32]"
                          />
                          <div>
                            <div className="font-semibold text-white flex items-center gap-1.5">
                              <span>{u.username}</span>
                              {isCurrent && (
                                <span className="text-[10px] bg-[#B7F36B]/20 text-[#B7F36B] border border-[#B7F36B]/40 px-1.5 py-0.2 rounded font-bold">
                                  Anda
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-[#E8ECF1]/50 font-mono">
                              ID: #{u.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 text-xs font-mono text-[#E8ECF1]/80">
                        {u.email}
                      </td>

                      {/* Role Badge */}
                      <td className="px-6 py-4">
                        {getRoleBadge(u.role)}
                      </td>

                      {/* Prompts Count */}
                      <td className="px-6 py-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#101C32] text-[#B7F36B] border border-[#22375D]">
                          {u.prompts_count ?? 0}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-xs text-[#E8ECF1]/60">
                        {new Date(u.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-2 rounded-xl text-[#E8ECF1]/70 hover:text-white hover:bg-[#182845] transition-colors cursor-pointer"
                            title="Edit User & Hak Akses"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {!isCurrent && !isSuperadmin && (
                            <button
                              onClick={() => handleDelete(u)}
                              className="p-2 rounded-xl text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Hapus User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah / Edit User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#101C32] border border-[#22375D] rounded-3xl p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-[#E8ECF1]/70 hover:text-white hover:bg-[#182845] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#B7F36B]/15 border border-[#B7F36B]/30 flex items-center justify-center text-[#B7F36B]">
                {editingUser ? <Edit2 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-['Plus_Jakarta_Sans']">
                  {editingUser ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}
                </h3>
                <p className="text-xs text-[#E8ECF1]/70">
                  {editingUser
                    ? 'Ubah username, email, hak akses, atau reset password.'
                    : 'Buat akun pengguna baru dengan hak akses yang ditentukan.'}
                </p>
              </div>
            </div>

            {formError && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#E8ECF1]/80">
                  Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#E8ECF1]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="nama_user"
                    className="w-full bg-[#15233D] border border-[#22375D] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#E8ECF1]/40 focus:outline-none focus:border-[#B7F36B]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#E8ECF1]/80">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#E8ECF1]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full bg-[#15233D] border border-[#22375D] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#E8ECF1]/40 focus:outline-none focus:border-[#B7F36B]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#E8ECF1]/80">
                  {editingUser ? 'Password Baru (Kosongkan jika tidak diubah)' : 'Password'}
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-[#E8ECF1]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required={!editingUser}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={editingUser ? 'Biarkan kosong untuk password lama' : 'Minimal 6 karakter'}
                    className="w-full bg-[#15233D] border border-[#22375D] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#E8ECF1]/40 focus:outline-none focus:border-[#B7F36B]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#E8ECF1]/80">
                  Hak Akses (Role)
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[#15233D] border border-[#22375D] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#B7F36B] cursor-pointer"
                >
                  <option value="user" className="bg-[#15233D] text-white">User Biasa (Hanya dapat mengelola prompt miliknya sendiri)</option>
                  <option value="admin" className="bg-[#15233D] text-white">Admin (Dapat mengelola user dan melihat semua prompt)</option>
                  {currentUser?.role === 'superadmin' && (
                    <option value="superadmin" className="bg-[#15233D] text-white">Superadmin (Hak akses tertinggi sistem)</option>
                  )}
                </select>
              </div>

              <div className="pt-4 border-t border-[#22375D] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#E8ECF1]/70 hover:text-white hover:bg-[#182845] transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 bg-[#B7F36B] hover:bg-[#a2e852] text-[#101C32] px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-[#B7F36B]/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#101C32]" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>{editingUser ? 'Perbarui User' : 'Simpan User'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
