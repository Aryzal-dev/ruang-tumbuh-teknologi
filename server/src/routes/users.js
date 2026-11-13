import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Require superadmin or admin for all user management endpoints
router.use(authMiddleware);
router.use(requireRole(['superadmin', 'admin']));

// GET /api/users - List all users with prompt count
router.get('/', (req, res) => {
  try {
    const users = db.prepare(`
      SELECT 
        u.id, 
        u.username, 
        u.email, 
        u.avatar, 
        u.role, 
        u.created_at,
        (SELECT COUNT(*) FROM prompts WHERE prompts.user_id = u.id) as prompts_count
      FROM users u
      ORDER BY 
        CASE u.role 
          WHEN 'superadmin' THEN 1 
          WHEN 'admin' THEN 2 
          ELSE 3 
        END,
        u.created_at DESC
    `).all();

    res.json({ users });
  } catch (err) {
    console.error('List users error:', err);
    res.status(500).json({ error: 'Gagal mengambil daftar pengguna.' });
  }
});

// POST /api/users - Create new user
router.post('/', (req, res) => {
  try {
    const { username, email, password, role = 'user' } = req.body;
    const currentUserRole = req.user.role;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, dan password wajib diisi.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password minimal 6 karakter.' });
    }

    // Role privilege check: only superadmin can assign admin or superadmin
    if ((role === 'superadmin' || role === 'admin') && currentUserRole !== 'superadmin') {
      return res.status(403).json({ error: 'Hanya superadmin yang dapat membuat user admin atau superadmin.' });
    }

    const cleanUsername = username.trim();
    const cleanEmail = email.trim();

    // Check unique
    const existing = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(cleanEmail, cleanUsername);
    if (existing) {
      return res.status(400).json({ error: 'Username atau email sudah digunakan.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanUsername)}`;

    const stmt = db.prepare(`
      INSERT INTO users (username, email, password, avatar, role)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(cleanUsername, cleanEmail, hashedPassword, avatar, role);
    const newUserId = Number(result.lastInsertRowid);

    const newUser = db.prepare('SELECT id, username, email, avatar, role, created_at FROM users WHERE id = ?').get(newUserId);
    res.status(201).json({ message: 'User berhasil dibuat!', user: newUser });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ error: 'Gagal membuat pengguna baru.' });
  }
});

// PUT /api/users/:id - Edit user
router.put('/:id', (req, res) => {
  try {
    const targetId = Number(req.params.id);
    const { username, email, password, role } = req.body;
    const currentUser = req.user;

    const targetUser = db.prepare('SELECT * FROM users WHERE id = ?').get(targetId);
    if (!targetUser) {
      return res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
    }

    // Protection: only superadmin can modify superadmin
    if (targetUser.role === 'superadmin' && currentUser.role !== 'superadmin') {
      return res.status(403).json({ error: 'Anda tidak memiliki hak untuk mengubah akun superadmin.' });
    }

    // If changing role to superadmin or admin, must be superadmin
    if (role && role !== targetUser.role) {
      if ((role === 'superadmin' || role === 'admin') && currentUser.role !== 'superadmin') {
        return res.status(403).json({ error: 'Hanya superadmin yang dapat mengubah hak akses menjadi admin atau superadmin.' });
      }
      // Cannot demote own self if current user is superadmin
      if (targetId === currentUser.id && currentUser.role === 'superadmin' && role !== 'superadmin') {
        return res.status(400).json({ error: 'Superadmin tidak dapat menurunkan role dirinya sendiri.' });
      }
    }

    // Check unique username or email if changed
    const cleanUsername = username ? username.trim() : targetUser.username;
    const cleanEmail = email ? email.trim() : targetUser.email;

    const conflict = db.prepare('SELECT id FROM users WHERE (email = ? OR username = ?) AND id != ?').get(cleanEmail, cleanUsername, targetId);
    if (conflict) {
      return res.status(400).json({ error: 'Username atau email sudah digunakan oleh pengguna lain.' });
    }

    let hashedPassword = targetUser.password;
    if (password && password.trim()) {
      if (password.trim().length < 6) {
        return res.status(400).json({ error: 'Password baru minimal 6 karakter.' });
      }
      hashedPassword = bcrypt.hashSync(password.trim(), bcrypt.genSaltSync(10));
    }

    const newRole = role || targetUser.role;

    db.prepare(`
      UPDATE users SET
        username = ?,
        email = ?,
        password = ?,
        role = ?
      WHERE id = ?
    `).run(cleanUsername, cleanEmail, hashedPassword, newRole, targetId);

    const updated = db.prepare(`
      SELECT 
        u.id, u.username, u.email, u.avatar, u.role, u.created_at,
        (SELECT COUNT(*) FROM prompts WHERE prompts.user_id = u.id) as prompts_count
      FROM users u WHERE u.id = ?
    `).get(targetId);

    res.json({ message: 'Data pengguna berhasil diperbarui!', user: updated });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Gagal memperbarui pengguna.' });
  }
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', (req, res) => {
  try {
    const targetId = Number(req.params.id);
    const currentUser = req.user;

    if (targetId === currentUser.id) {
      return res.status(400).json({ error: 'Anda tidak dapat menghapus akun Anda sendiri saat sedang login.' });
    }

    const targetUser = db.prepare('SELECT * FROM users WHERE id = ?').get(targetId);
    if (!targetUser) {
      return res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
    }

    if (targetUser.role === 'superadmin') {
      return res.status(403).json({ error: 'Akun superadmin tidak dapat dihapus.' });
    }

    if (targetUser.role === 'admin' && currentUser.role !== 'superadmin') {
      return res.status(403).json({ error: 'Hanya superadmin yang dapat menghapus akun admin.' });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(targetId);
    res.json({ message: `Pengguna "${targetUser.username}" berhasil dihapus.` });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Gagal menghapus pengguna.' });
  }
});

export default router;
