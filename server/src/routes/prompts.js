import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, '..', '..', 'uploads');

const router = express.Router();

// ==========================================
// PUBLIC ENDPOINTS (No authentication required)
// ==========================================

// GET /api/prompts/public - Public gallery of published prompts
router.get('/public', (req, res) => {
  try {
    const { media_type, ai_model, q, sort = 'newest' } = req.query;

    let sql = `
      SELECT 
        p.*,
        u.username as author_name,
        u.avatar as author_avatar,
        u.role as author_role
      FROM prompts p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE (p.is_public = 1 OR p.is_public = '1')
    `;
    const params = [];

    if (media_type && media_type !== 'all') {
      sql += ' AND p.media_type = ?';
      params.push(media_type);
    }

    if (ai_model && ai_model !== 'all') {
      sql += ' AND p.ai_model = ?';
      params.push(ai_model);
    }

    if (q && q.trim()) {
      const searchTerm = `%${q.trim()}%`;
      sql += ' AND (p.title LIKE ? OR p.prompt_text LIKE ? OR p.negative_prompt LIKE ? OR p.tags LIKE ? OR u.username LIKE ?)';
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (sort === 'oldest') {
      sql += ' ORDER BY p.created_at ASC';
    } else if (sort === 'title') {
      sql += ' ORDER BY p.title ASC';
    } else {
      sql += ' ORDER BY p.created_at DESC';
    }

    const rows = db.prepare(sql).all(...params);

    // Compute public stats for published items only
    const totalPrompts = db.prepare("SELECT COUNT(*) as count FROM prompts WHERE is_public = 1 OR is_public = '1'").get().count;
    const totalImages = db.prepare("SELECT COUNT(*) as count FROM prompts WHERE media_type = 'image' AND (is_public = 1 OR is_public = '1')").get().count;
    const totalVideos = db.prepare("SELECT COUNT(*) as count FROM prompts WHERE media_type = 'video' AND (is_public = 1 OR is_public = '1')").get().count;
    const totalCreators = db.prepare("SELECT COUNT(DISTINCT user_id) as count FROM prompts WHERE is_public = 1 OR is_public = '1'").get().count;

    const models = db.prepare(`
      SELECT ai_model, COUNT(*) as count
      FROM prompts
      WHERE (is_public = 1 OR is_public = '1') AND ai_model IS NOT NULL AND ai_model != ''
      GROUP BY ai_model
      ORDER BY count DESC
    `).all();

    const allTagsRows = db.prepare(`SELECT tags FROM prompts WHERE (is_public = 1 OR is_public = '1') AND tags IS NOT NULL AND tags != ''`).all();
    const tagSet = new Set();
    allTagsRows.forEach(row => {
      if (row.tags) {
        row.tags.split(',').forEach(t => {
          const trimmed = t.trim();
          if (trimmed) tagSet.add(trimmed);
        });
      }
    });

    res.json({
      prompts: rows,
      stats: {
        total: totalPrompts,
        images: totalImages,
        videos: totalVideos,
        creators: totalCreators,
      },
      models,
      tags: Array.from(tagSet).sort(),
    });
  } catch (err) {
    console.error('Fetch public prompts error:', err);
    res.status(500).json({ error: 'Gagal memuat galeri publik.' });
  }
});

// ==========================================
// AUTHENTICATED ENDPOINTS
// ==========================================
router.use(authMiddleware);

// GET /api/prompts - List user's prompts (or all if admin requested)
router.get('/', (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { media_type, favorite, ai_model, q, sort = 'newest', scope = 'mine', is_public } = req.query;

    let sql = `
      SELECT 
        p.*,
        u.username as author_name,
        u.avatar as author_avatar,
        u.role as author_role
      FROM prompts p
      JOIN users u ON p.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    // Scope: mine vs all (only superadmin/admin can view scope=all in private dashboard)
    if (scope === 'all' && (userRole === 'superadmin' || userRole === 'admin')) {
      // no user_id restriction
    } else {
      sql += ' AND p.user_id = ?';
      params.push(userId);
    }

    if (is_public !== undefined && is_public !== '') {
      sql += ' AND p.is_public = ?';
      params.push(is_public === '1' || is_public === 1 || is_public === 'true' ? 1 : 0);
    }

    if (media_type && media_type !== 'all') {
      sql += ' AND p.media_type = ?';
      params.push(media_type);
    }

    if (favorite === 'true' || favorite === '1') {
      sql += ' AND p.is_favorite = 1';
    }

    if (ai_model && ai_model !== 'all') {
      sql += ' AND p.ai_model = ?';
      params.push(ai_model);
    }

    if (q && q.trim()) {
      const searchTerm = `%${q.trim()}%`;
      sql += ' AND (p.title LIKE ? OR p.prompt_text LIKE ? OR p.negative_prompt LIKE ? OR p.tags LIKE ?)';
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (sort === 'oldest') {
      sql += ' ORDER BY p.created_at ASC';
    } else if (sort === 'title') {
      sql += ' ORDER BY p.title ASC';
    } else {
      sql += ' ORDER BY p.created_at DESC';
    }

    const rows = db.prepare(sql).all(...params);

    const totalPrompts = db.prepare('SELECT COUNT(*) as count FROM prompts WHERE user_id = ?').get(userId).count;
    const totalImages = db.prepare("SELECT COUNT(*) as count FROM prompts WHERE user_id = ? AND media_type = 'image'").get(userId).count;
    const totalVideos = db.prepare("SELECT COUNT(*) as count FROM prompts WHERE user_id = ? AND media_type = 'video'").get(userId).count;
    const totalFavorites = db.prepare('SELECT COUNT(*) as count FROM prompts WHERE user_id = ? AND is_favorite = 1').get(userId).count;
    const totalPublished = db.prepare('SELECT COUNT(*) as count FROM prompts WHERE user_id = ? AND is_public = 1').get(userId).count;

    res.json({
      prompts: rows,
      stats: {
        total: totalPrompts,
        images: totalImages,
        videos: totalVideos,
        favorites: totalFavorites,
        published: totalPublished,
      },
    });
  } catch (err) {
    console.error('Fetch prompts error:', err);
    res.status(500).json({ error: 'Gagal memuat daftar prompt.' });
  }
});

// GET /api/prompts/:id - Detail
router.get('/:id', (req, res) => {
  try {
    const row = db.prepare(`
      SELECT 
        p.*,
        u.username as author_name,
        u.avatar as author_avatar,
        u.role as author_role
      FROM prompts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `).get(req.params.id);

    if (!row) {
      return res.status(404).json({ error: 'Prompt tidak ditemukan.' });
    }
    res.json({ prompt: row });
  } catch (err) {
    console.error('Get prompt error:', err);
    res.status(500).json({ error: 'Gagal mengambil detail prompt.' });
  }
});

// POST /api/prompts - Create new prompt
router.post('/', upload.single('media_file'), (req, res) => {
  try {
    const userId = req.user.id;
    const {
      title,
      prompt_text,
      negative_prompt,
      media_url: externalMediaUrl,
      media_type: rawMediaType,
      ai_model,
      aspect_ratio,
      seed,
      cfg_scale,
      steps,
      sampler,
      tags,
      is_public,
    } = req.body;

    if (!title || !prompt_text) {
      return res.status(400).json({ error: 'Judul dan prompt teks wajib diisi.' });
    }

    let finalMediaUrl = externalMediaUrl ? externalMediaUrl.trim() : '';
    let finalMediaType = rawMediaType || 'image';

    if (req.file) {
      finalMediaUrl = `/uploads/${req.file.filename}`;
      finalMediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
    }

    if (!finalMediaUrl) {
      return res.status(400).json({ error: 'Harap lampirkan file media (gambar/video) atau masukkan URL media.' });
    }

    if (!req.file && externalMediaUrl) {
      const lower = externalMediaUrl.toLowerCase();
      if (lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov') || lower.includes('video')) {
        finalMediaType = 'video';
      }
    }

    // Default to published (1) unless explicitly set to 0 or false
    const finalIsPublic =
      is_public === false || is_public === 'false' || is_public === 0 || is_public === '0' ? 0 : 1;

    const stmt = db.prepare(`
      INSERT INTO prompts (
        user_id, title, prompt_text, negative_prompt, media_type, media_url,
        ai_model, aspect_ratio, seed, cfg_scale, steps, sampler, tags, is_favorite, is_public
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      userId,
      title.trim(),
      prompt_text.trim(),
      negative_prompt ? negative_prompt.trim() : null,
      finalMediaType,
      finalMediaUrl,
      ai_model || 'Midjourney v6',
      aspect_ratio || '16:9',
      seed || null,
      cfg_scale || null,
      steps || null,
      sampler || null,
      tags || '',
      0,
      finalIsPublic
    );

    const newPrompt = db.prepare(`
      SELECT 
        p.*,
        u.username as author_name,
        u.avatar as author_avatar,
        u.role as author_role
      FROM prompts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({ message: 'Prompt berhasil disimpan!', prompt: newPrompt });
  } catch (err) {
    console.error('Create prompt error:', err);
    res.status(500).json({ error: 'Gagal menyimpan prompt baru.' });
  }
});

// PUT /api/prompts/:id - Update prompt
router.put('/:id', upload.single('media_file'), (req, res) => {
  try {
    const promptId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Superadmin and admin can edit any prompt, normal user can only edit their own
    let existing;
    if (userRole === 'superadmin' || userRole === 'admin') {
      existing = db.prepare('SELECT * FROM prompts WHERE id = ?').get(promptId);
    } else {
      existing = db.prepare('SELECT * FROM prompts WHERE id = ? AND user_id = ?').get(promptId, userId);
    }

    if (!existing) {
      return res.status(404).json({ error: 'Prompt tidak ditemukan atau Anda tidak memiliki izin.' });
    }

    const {
      title,
      prompt_text,
      negative_prompt,
      media_url: externalMediaUrl,
      media_type: rawMediaType,
      ai_model,
      aspect_ratio,
      seed,
      cfg_scale,
      steps,
      sampler,
      tags,
      is_public,
    } = req.body;

    let finalMediaUrl = existing.media_url;
    let finalMediaType = rawMediaType || existing.media_type;

    if (req.file) {
      finalMediaUrl = `/uploads/${req.file.filename}`;
      finalMediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';

      if (existing.media_url && existing.media_url.startsWith('/uploads/')) {
        const oldFile = path.join(uploadDir, path.basename(existing.media_url));
        if (fs.existsSync(oldFile)) {
          try { fs.unlinkSync(oldFile); } catch (e) { /* ignore */ }
        }
      }
    } else if (externalMediaUrl && externalMediaUrl.trim()) {
      finalMediaUrl = externalMediaUrl.trim();
    }

    let finalIsPublic = existing.is_public ?? 1;
    if (is_public !== undefined) {
      finalIsPublic =
        is_public === false || is_public === 'false' || is_public === 0 || is_public === '0' ? 0 : 1;
    }

    const stmt = db.prepare(`
      UPDATE prompts SET
        title = ?,
        prompt_text = ?,
        negative_prompt = ?,
        media_type = ?,
        media_url = ?,
        ai_model = ?,
        aspect_ratio = ?,
        seed = ?,
        cfg_scale = ?,
        steps = ?,
        sampler = ?,
        tags = ?,
        is_public = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      title !== undefined ? title.trim() : existing.title,
      prompt_text !== undefined ? prompt_text.trim() : existing.prompt_text,
      negative_prompt !== undefined ? negative_prompt.trim() : existing.negative_prompt,
      finalMediaType,
      finalMediaUrl,
      ai_model !== undefined ? ai_model : existing.ai_model,
      aspect_ratio !== undefined ? aspect_ratio : existing.aspect_ratio,
      seed !== undefined ? seed : existing.seed,
      cfg_scale !== undefined ? cfg_scale : existing.cfg_scale,
      steps !== undefined ? steps : existing.steps,
      sampler !== undefined ? sampler : existing.sampler,
      tags !== undefined ? tags : existing.tags,
      finalIsPublic,
      promptId
    );

    const updated = db.prepare(`
      SELECT 
        p.*,
        u.username as author_name,
        u.avatar as author_avatar,
        u.role as author_role
      FROM prompts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `).get(promptId);

    res.json({ message: 'Prompt berhasil diperbarui!', prompt: updated });
  } catch (err) {
    console.error('Update prompt error:', err);
    res.status(500).json({ error: 'Gagal memperbarui prompt.' });
  }
});

// PATCH /api/prompts/:id/publish - Quick toggle publish status
router.patch('/:id/publish', (req, res) => {
  try {
    const promptId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    let existing;
    if (userRole === 'superadmin' || userRole === 'admin') {
      existing = db.prepare('SELECT id, is_public FROM prompts WHERE id = ?').get(promptId);
    } else {
      existing = db.prepare('SELECT id, is_public FROM prompts WHERE id = ? AND user_id = ?').get(promptId, userId);
    }

    if (!existing) {
      return res.status(404).json({ error: 'Prompt tidak ditemukan atau Anda tidak memiliki izin.' });
    }

    const newPublic = existing.is_public === 1 ? 0 : 1;
    db.prepare('UPDATE prompts SET is_public = ? WHERE id = ?').run(newPublic, promptId);

    res.json({
      message: newPublic ? 'Prompt berhasil dipublikasikan ke galeri publik!' : 'Prompt diubah menjadi privat (disembunyikan dari galeri publik).',
      is_public: newPublic,
    });
  } catch (err) {
    console.error('Toggle publish error:', err);
    res.status(500).json({ error: 'Gagal mengubah status publikasi prompt.' });
  }
});

// PATCH /api/prompts/:id/favorite - Toggle favorite
router.patch('/:id/favorite', (req, res) => {
  try {
    const promptId = req.params.id;
    const userId = req.user.id;

    const existing = db.prepare('SELECT id, is_favorite FROM prompts WHERE id = ? AND user_id = ?').get(promptId, userId);
    if (!existing) {
      return res.status(404).json({ error: 'Prompt tidak ditemukan.' });
    }

    const newFav = existing.is_favorite === 1 ? 0 : 1;
    db.prepare('UPDATE prompts SET is_favorite = ? WHERE id = ?').run(newFav, promptId);

    res.json({ message: newFav ? 'Ditambahkan ke favorit' : 'Dihapus dari favorit', is_favorite: newFav });
  } catch (err) {
    console.error('Toggle favorite error:', err);
    res.status(500).json({ error: 'Gagal mengubah status favorit.' });
  }
});

// DELETE /api/prompts/:id - Delete prompt
router.delete('/:id', (req, res) => {
  try {
    const promptId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Superadmin and admin can delete any prompt
    let existing;
    if (userRole === 'superadmin' || userRole === 'admin') {
      existing = db.prepare('SELECT * FROM prompts WHERE id = ?').get(promptId);
    } else {
      existing = db.prepare('SELECT * FROM prompts WHERE id = ? AND user_id = ?').get(promptId, userId);
    }

    if (!existing) {
      return res.status(404).json({ error: 'Prompt tidak ditemukan atau Anda tidak memiliki izin.' });
    }

    db.prepare('DELETE FROM prompts WHERE id = ?').run(promptId);

    if (existing.media_url && existing.media_url.startsWith('/uploads/')) {
      const filePath = path.join(uploadDir, path.basename(existing.media_url));
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
      }
    }

    res.json({ message: 'Prompt berhasil dihapus!' });
  } catch (err) {
    console.error('Delete prompt error:', err);
    res.status(500).json({ error: 'Gagal menghapus prompt.' });
  }
});

export default router;
