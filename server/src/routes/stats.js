import express from 'express';
import { db } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const isSuperOrAdmin = req.user.role === 'superadmin' || req.user.role === 'admin';

    let totalPrompts, totalImages, totalVideos, totalFavorites, totalPublished, totalPending;

    if (isSuperOrAdmin) {
      totalPrompts = (await db.prepare('SELECT COUNT(*) as count FROM prompts').get())?.count || 0;
      totalImages = (await db.prepare("SELECT COUNT(*) as count FROM prompts WHERE media_type = 'image'").get())?.count || 0;
      totalVideos = (await db.prepare("SELECT COUNT(*) as count FROM prompts WHERE media_type = 'video'").get())?.count || 0;
      totalFavorites = (await db.prepare('SELECT COUNT(*) as count FROM prompts WHERE user_id = ? AND is_favorite = 1').get(userId))?.count || 0;
      totalPublished = (await db.prepare("SELECT COUNT(*) as count FROM prompts WHERE is_public = 1 AND (publish_status = 'approved' OR publish_status IS NULL)").get())?.count || 0;
      totalPending = (await db.prepare("SELECT COUNT(*) as count FROM prompts WHERE publish_status = 'pending'").get())?.count || 0;
    } else {
      totalPrompts = (await db.prepare('SELECT COUNT(*) as count FROM prompts WHERE user_id = ?').get(userId))?.count || 0;
      totalImages = (await db.prepare("SELECT COUNT(*) as count FROM prompts WHERE user_id = ? AND media_type = 'image'").get(userId))?.count || 0;
      totalVideos = (await db.prepare("SELECT COUNT(*) as count FROM prompts WHERE user_id = ? AND media_type = 'video'").get(userId))?.count || 0;
      totalFavorites = (await db.prepare('SELECT COUNT(*) as count FROM prompts WHERE user_id = ? AND is_favorite = 1').get(userId))?.count || 0;
      totalPublished = (await db.prepare("SELECT COUNT(*) as count FROM prompts WHERE user_id = ? AND is_public = 1 AND (publish_status = 'approved' OR publish_status IS NULL)").get(userId))?.count || 0;
      totalPending = (await db.prepare("SELECT COUNT(*) as count FROM prompts WHERE user_id = ? AND publish_status = 'pending'").get(userId))?.count || 0;
    }

    const modelsQuery = isSuperOrAdmin
      ? `SELECT ai_model, COUNT(*) as count FROM prompts WHERE ai_model IS NOT NULL AND ai_model != '' GROUP BY ai_model ORDER BY count DESC`
      : `SELECT ai_model, COUNT(*) as count FROM prompts WHERE user_id = ? AND ai_model IS NOT NULL AND ai_model != '' GROUP BY ai_model ORDER BY count DESC`;
    const models = isSuperOrAdmin ? await db.prepare(modelsQuery).all() : await db.prepare(modelsQuery).all(userId);

    // Get unique tags
    const tagsQuery = isSuperOrAdmin
      ? `SELECT tags FROM prompts WHERE tags IS NOT NULL AND tags != ''`
      : `SELECT tags FROM prompts WHERE user_id = ? AND tags IS NOT NULL AND tags != ''`;
    const allTagsRows = isSuperOrAdmin ? await db.prepare(tagsQuery).all() : await db.prepare(tagsQuery).all(userId);

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
        pending: totalPending,
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
