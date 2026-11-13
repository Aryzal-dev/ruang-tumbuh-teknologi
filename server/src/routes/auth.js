import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { authMiddleware, generateToken } from '../middleware/auth.js';

const router = express.Router();

// Login
router.post('/login', (req, res) => {
  try {
    const { login, password } = req.body; // login can be email or username

    if (!login || !password) {
      return res.status(400).json({ error: 'Silakan isi username/email dan password.' });
    }

    const user = db.prepare(`
      SELECT * FROM users WHERE email = ? OR username = ?
    `).get(login.trim(), login.trim());

    if (!user) {
      return res.status(401).json({ error: 'Kredensial tidak valid. Periksa kembali username atau password Anda.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Kredensial tidak valid. Periksa kembali username atau password Anda.' });
    }

    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      role: user.role || 'user',
    };

    const token = generateToken(userData);
    res.json({ message: 'Login berhasil!', user: userData, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Terjadi kesalahan pada server saat login.' });
  }
});

// Current User profile
router.get('/me', authMiddleware, (req, res) => {
  try {
    const user = db.prepare('SELECT id, username, email, avatar, role, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
    }
    res.json({ user });
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ error: 'Gagal mengambil data pengguna.' });
  }
});

export default router;
