import mysql from 'mysql2/promise';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration from environment variables
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME;
const DB_PORT = Number(process.env.DB_PORT) || 3306;

export let isMySQL = Boolean(DB_HOST && DB_NAME);
let pool = null;
let sqliteDb = null;

// Setup SQLite fallback if MySQL is not configured
function getSqliteInstance() {
  if (!sqliteDb) {
    const dataDir = path.resolve(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const dbPath = path.join(dataDir, 'database.sqlite');
    sqliteDb = new DatabaseSync(dbPath);
    sqliteDb.exec('PRAGMA foreign_keys = ON;');
  }
  return sqliteDb;
}

// Unified Database Adapter API
export const db = {
  get isMySQL() {
    return isMySQL;
  },

  prepare(sql) {
    return {
      async all(...params) {
        const flat = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
        if (isMySQL && pool) {
          const [rows] = await pool.query(sql, flat);
          return rows;
        } else {
          const sqlite = getSqliteInstance();
          return sqlite.prepare(sql).all(...flat);
        }
      },

      async get(...params) {
        const flat = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
        if (isMySQL && pool) {
          const [rows] = await pool.query(sql, flat);
          return rows[0] || null;
        } else {
          const sqlite = getSqliteInstance();
          return sqlite.prepare(sql).get(...flat) || null;
        }
      },

      async run(...params) {
        const flat = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
        if (isMySQL && pool) {
          const [result] = await pool.query(sql, flat);
          return {
            lastInsertRowid: result.insertId,
            changes: result.affectedRows,
          };
        } else {
          const sqlite = getSqliteInstance();
          const res = sqlite.prepare(sql).run(...flat);
          return {
            lastInsertRowid: Number(res.lastInsertRowid),
            changes: res.changes,
          };
        }
      },
    };
  },

  async exec(sql) {
    if (isMySQL && pool) {
      return pool.query(sql);
    } else {
      const sqlite = getSqliteInstance();
      return sqlite.exec(sql);
    }
  },

  async query(sql, params = []) {
    if (isMySQL && pool) {
      const [rows] = await pool.query(sql, params);
      return rows;
    } else {
      const sqlite = getSqliteInstance();
      return sqlite.prepare(sql).all(...params);
    }
  },
};

// Seed sample prompts for users who don't have prompts
async function ensurePromptsForUser(userId) {
  const countRow = await db.prepare('SELECT COUNT(*) as count FROM prompts WHERE user_id = ?').get(userId);
  if (countRow && countRow.count > 0) return;

  const insertStmt = db.prepare(`
    INSERT INTO prompts (
      user_id, title, prompt_text, negative_prompt, media_type, media_url,
      ai_model, aspect_ratio, seed, cfg_scale, steps, sampler, tags, is_favorite, is_public, publish_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'approved')
  `);

  // Sample 1: Cyberpunk Ronin (Image)
  await insertStmt.run(
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
  await insertStmt.run(
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
  await insertStmt.run(
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
  await insertStmt.run(
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
  await insertStmt.run(
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
}

// Initialize tables and seeds
export async function initDatabase() {
  if (DB_HOST && DB_NAME) {
    try {
      console.log(`🔌 [DB] Connecting to MySQL at ${DB_HOST}:${DB_PORT}/${DB_NAME}...`);
      pool = mysql.createPool({
        host: DB_HOST,
        user: DB_USER || 'root',
        password: DB_PASSWORD,
        database: DB_NAME,
        port: DB_PORT,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        charset: 'utf8mb4',
      });

      // Test connection
      await pool.query('SELECT 1 + 1 AS result');
      isMySQL = true;
      console.log(`✅ [DB] Successfully connected to MySQL database: ${DB_NAME}`);

      // Create Users Table in MySQL
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(191) UNIQUE NOT NULL,
          email VARCHAR(191) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          avatar TEXT,
          role VARCHAR(50) NOT NULL DEFAULT 'user',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // Create Prompts Table in MySQL
      await pool.query(`
        CREATE TABLE IF NOT EXISTS prompts (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          title VARCHAR(255) NOT NULL,
          prompt_text TEXT NOT NULL,
          negative_prompt TEXT,
          media_type VARCHAR(50) NOT NULL DEFAULT 'image',
          media_url TEXT NOT NULL,
          thumbnail_url TEXT,
          ai_model VARCHAR(100),
          aspect_ratio VARCHAR(50),
          seed VARCHAR(100),
          cfg_scale VARCHAR(50),
          steps VARCHAR(50),
          sampler VARCHAR(100),
          tags TEXT,
          is_favorite TINYINT(1) DEFAULT 0,
          is_public TINYINT(1) DEFAULT 1,
          publish_status VARCHAR(50) DEFAULT 'approved',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
    } catch (err) {
      console.warn(`⚠️ [DB] MySQL connection failed (${err.message}). Falling back to local SQLite database.`);
      isMySQL = false;
      pool = null;
    }
  }

  // If not MySQL, initialize SQLite
  if (!isMySQL) {
    console.log('📦 [DB] Initializing SQLite database...');
    const sqlite = getSqliteInstance();

    sqlite.exec(`
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

    sqlite.exec(`
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
        publish_status TEXT DEFAULT 'approved',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  // Seed default superadmin if not exists
  const superadminExists = await db.prepare('SELECT id, role FROM users WHERE username = ?').get('superadmin');
  let superadminId = superadminExists ? superadminExists.id : null;

  if (!superadminExists) {
    const saltAdmin = bcrypt.genSaltSync(10);
    const hashedAdmin = bcrypt.hashSync('qwerty', saltAdmin);
    const adminResult = await db.prepare(`
      INSERT INTO users (username, email, password, avatar, role)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      'superadmin',
      'superadmin@promptvault.ai',
      hashedAdmin,
      'https://api.dicebear.com/7.x/bottts/svg?seed=superadmin',
      'superadmin'
    );
    superadminId = adminResult.lastInsertRowid;
  } else {
    await db.prepare("UPDATE users SET role = 'superadmin' WHERE id = ?").run(superadminId);
  }

  // Seed default demo user if not exists
  const demoExists = await db.prepare('SELECT id FROM users WHERE username = ?').get('demo_creator');
  if (!demoExists) {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync('password123', salt);

    const userResult = await db.prepare(`
      INSERT INTO users (username, email, password, avatar, role)
      VALUES (?, ?, ?, ?, 'user')
    `).run(
      'demo_creator',
      'demo@promptvault.ai',
      hashedPassword,
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    );
    await ensurePromptsForUser(userResult.lastInsertRowid);
  } else {
    await ensurePromptsForUser(demoExists.id);
  }

  if (superadminId) {
    await ensurePromptsForUser(superadminId);
  }
}
