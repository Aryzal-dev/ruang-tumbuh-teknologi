import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.resolve(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'database.sqlite');
export const db = new DatabaseSync(dbPath);

export function initDatabase() {
  // Pragmas
  db.exec('PRAGMA foreign_keys = ON;');

  // Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      avatar TEXT,
      role TEXT NOT NULL DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Ensure role column exists in older database schemas
  const userColumns = db.prepare('PRAGMA table_info(users)').all();
  const hasRoleCol = userColumns.some((col) => col.name === 'role');
  if (!hasRoleCol) {
    db.exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user';");
  }

  // Prompts Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS prompts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      prompt_text TEXT NOT NULL,
      negative_prompt TEXT,
      media_type TEXT NOT NULL DEFAULT 'image' CHECK(media_type IN ('image', 'video')),
      media_url TEXT NOT NULL,
      thumbnail_url TEXT,
      ai_model TEXT,
      aspect_ratio TEXT,
      seed TEXT,
      cfg_scale TEXT,
      steps TEXT,
      sampler TEXT,
      tags TEXT,
      is_favorite INTEGER DEFAULT 0,
      is_public INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Ensure is_public column exists in prompts table
  const promptColumns = db.prepare('PRAGMA table_info(prompts)').all();
  const hasIsPublic = promptColumns.some((col) => col.name === 'is_public');
  if (!hasIsPublic) {
    db.exec("ALTER TABLE prompts ADD COLUMN is_public INTEGER DEFAULT 1;");
  }

  // Ensure superadmin exists with role 'superadmin'
  const superadminExists = db.prepare('SELECT id, role FROM users WHERE username = ?').get('superadmin');
  let superadminId = superadminExists ? superadminExists.id : null;

  if (!superadminExists) {
    const saltAdmin = bcrypt.genSaltSync(10);
    const hashedAdmin = bcrypt.hashSync('qwerty', saltAdmin);
    const adminResult = db.prepare(`
      INSERT INTO users (username, email, password, avatar, role)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      'superadmin',
      'superadmin@promptvault.ai',
      hashedAdmin,
      'https://api.dicebear.com/7.x/bottts/svg?seed=superadmin',
      'superadmin'
    );
    superadminId = Number(adminResult.lastInsertRowid);
  } else {
    db.prepare("UPDATE users SET role = 'superadmin' WHERE id = ?").run(superadminId);
  }

  // Seed sample prompts for users who don't have prompts
  const ensurePromptsForUser = (userId) => {
    const count = db.prepare('SELECT COUNT(*) as count FROM prompts WHERE user_id = ?').get(userId).count;
    if (count > 0) return;

    const insertPrompt = db.prepare(`
      INSERT INTO prompts (
        user_id, title, prompt_text, negative_prompt, media_type, media_url,
        ai_model, aspect_ratio, seed, cfg_scale, steps, sampler, tags, is_favorite
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Sample 1: Cyberpunk Neon Samurai (Image)
    insertPrompt.run(
      userId,
      'Cyberpunk Ronin in Neo-Tokyo',
      'A cinematic portrait of a cybernetic ronin standing in a rain-drenched Neo-Tokyo alleyway, glowing holographic neon signs, reflective wet pavement, sharp volumetric lighting, 8k resolution, photorealistic Unreal Engine 5 render, cinematic color grading, blade reflecting cyan and magenta light.',
      'blurry, low quality, cartoon, extra limbs, distorted face, oversaturated, watermark, signature',
      'image',
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80',
      'Midjourney v6',
      '16:9',
      '84920412',
      '7.0',
      '30',
      'DPM++ 2M Karras',
      'Cyberpunk, Portrait, Cinematic, Neon, Sci-Fi',
      1
    );

    // Sample 2: Ethereal Aurora Drone (Video)
    insertPrompt.run(
      userId,
      'Majestic Aurora Borealis Fjord Drone Flythrough',
      'FPV drone sweeping gracefully over a tranquil snow-covered fjord in Tromso Norway, vibrant emerald green and purple aurora borealis dancing across the starlit sky, glassy water reflecting the auroras, ultra-smooth 60fps cinematic movement, pristine winter atmosphere.',
      'jitter, stutter, low resolution, artifacts, overexposed',
      'video',
      'https://assets.mixkit.co/videos/42224/42224-720.mp4',
      'Kling AI 1.5',
      '16:9',
      '3921820',
      '6.5',
      '50',
      'Euler a',
      'Video, Landscape, Nature, Aurora, Drone, Cinematic',
      1
    );

    // Sample 3: Mystical Bioluminescent Forest (Image)
    insertPrompt.run(
      userId,
      'Enchanted Bioluminescent Forest Spirit',
      'Close up macro shot of an ancient spirit deer made of celestial stardust grazing in a glowing bioluminescent mossy forest, glowing mushrooms, floating spirit orbs, soft bokeh, deep emerald and teal tones, hyper-detailed fantasy illustration.',
      'ugly, deformed, disfigured, poor details, bad anatomy',
      'image',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
      'Stable Diffusion XL',
      '4:5',
      '7710294',
      '8.0',
      '40',
      'DPM++ SDE Karras',
      'Fantasy, Nature, Glowing, Macro, Creature',
      0
    );

    // Sample 4: Futuristic Supercar Cinematic (Video)
    insertPrompt.run(
      userId,
      'Autonomous Hypercar Speeding on Coastal Highway',
      'Dynamic tracking shot following a sleek matte-black aerodynamic electric hypercar accelerating through coastal cliffs during golden hour sunset, tire smoke drifting, light trails from aerodynamic rear tailfins, 4k cinematic lens flare, hyper-realistic physics.',
      'bad physics, frame drops, blurry, low frame rate, artificial look',
      'video',
      'https://assets.mixkit.co/videos/41639/41639-720.mp4',
      'Runway Gen-3 Alpha',
      '16:9',
      '4920194',
      '7.0',
      '35',
      'Default',
      'Video, Automotive, Golden Hour, Sci-Fi, Action',
      1
    );

    // Sample 5: Editorial Studio Portrait (Image)
    insertPrompt.run(
      userId,
      'Avant-Garde Glass Fashion Portrait',
      'High fashion editorial studio photograph of a woman wearing an intricate sculpted iridescent glass headpiece, soft rim lighting, minimalist clean beige background, shot on Hasselblad H6D-100c, 85mm lens, f/2.8, magazine cover aesthetic, delicate skin texture.',
      'plastic skin, airbrushed, cartoon, oversaturated, amateur',
      'image',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&auto=format&fit=crop&q=80',
      'Flux.1 Dev',
      '1:1',
      '1029384',
      '3.5',
      '28',
      'Euler',
      'Fashion, Portrait, Studio, Editorial, Minimalism',
      0
    );
  };

  // Seed demo user if no users exist
  const demoExists = db.prepare('SELECT id FROM users WHERE username = ?').get('demo_creator');
  if (!demoExists) {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync('demo123', salt);

    const insertUser = db.prepare(`
      INSERT INTO users (username, email, password, avatar)
      VALUES (?, ?, ?, ?)
    `);
    const userResult = insertUser.run(
      'demo_creator',
      'demo@promptvault.ai',
      hashedPassword,
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    );
    ensurePromptsForUser(Number(userResult.lastInsertRowid));
  } else {
    ensurePromptsForUser(demoExists.id);
  }

  if (superadminId) {
    ensurePromptsForUser(superadminId);
  }
}
