import express from 'express';
import { db } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', (req, res) => {
  try {
    const userId = req.user.id;

    const totalPrompts = db.prepare('SELECT COUNT(*) as count FROM prompts WHERE user_id = ?').get(userId).count;
    const totalImages = db.prepare("SELECT COUNT(*) as count FROM prompts WHERE user_id = ? AND media_type = 'image'").get(userId).count;
    const totalVideos = db.prepare("SELECT COUNT(*) as count FROM prompts WHERE user_id = ? AND media_type = 'video'").get(userId).count;
    const totalFavorites = db.prepare('SELECT COUNT(*) as count FROM prompts WHERE user_id = ? AND is_favorite = 1').get(userId).count;
    const totalPublished = db.prepare('SELECT COUNT(*) as count FROM prompts WHERE user_id = ? AND is_public = 1').get(userId).count;

    const isSuperOrAdmin = req.user.role === 'superadmin' || req.user.role === 'admin';
    const systemTotal = isSuperOrAdmin ? db.prepare('SELECT COUNT(*) as count FROM prompts').get().count : totalPrompts;
    const systemPublished = isSuperOrAdmin ? db.prepare('SELECT COUNT(*) as count FROM prompts WHERE is_public = 1').get().count : totalPublished;

    const models = db.prepare(`
      SELECT ai_model, COUNT(*) as count
      FROM prompts
      WHERE user_id = ? AND ai_model IS NOT NULL AND ai_model != ''
      GROUP BY ai_model
      ORDER BY count DESC
    `).all(userId);

    // Get unique tags
    const allTagsRows = db.prepare('SELECT tags FROM prompts WHERE user_id = ? AND tags IS NOT NULL AND tags != ""').all(userId);
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
      stats: {
        total: totalPrompts,
        images: totalImages,
        videos: totalVideos,
        favorites: totalFavorites,
        published: totalPublished,
        system_total: systemTotal,
        system_published: systemPublished,
      },
      models,
      tags: Array.from(tagSet).sort(),
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Gagal mengambil data statistik.' });
  }
});

export default router;
