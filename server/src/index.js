import express from 'express';
import http from 'node:http';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { initDatabase, db, dbStatus } from './db.js';
import authRoutes from './routes/auth.js';
import promptRoutes from './routes/prompts.js';
import statsRoutes from './routes/stats.js';
import userRoutes from './routes/users.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads serving
const uploadsPath = path.resolve(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/prompts', promptRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Database diagnostics check (MySQL vs SQLite status)
app.get('/api/db-status', async (req, res) => {
  let userCount = 0;
  let promptCount = 0;
  try {
    const userRes = await db.prepare('SELECT COUNT(*) as count FROM users').get();
    userCount = userRes?.count || 0;
    const promptRes = await db.prepare('SELECT COUNT(*) as count FROM prompts').get();
    promptCount = promptRes?.count || 0;
  } catch (e) {
    // ignore
  }

  res.json({
    ...dbStatus,
    data_counts: {
      users: userCount,
      prompts: promptCount,
    },
    timestamp: new Date().toISOString(),
  });
});

// Serve built frontend if client/dist exists
const clientDistPath = path.resolve(__dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: err.message || 'Terjadi kesalahan pada server.' });
});

// Start listening immediately on primary port and fallback port
const isSocket = typeof PORT === 'string' && (PORT.includes('/') || PORT.startsWith('\\\\.\\pipe'));
const primaryPort = isSocket ? PORT : (Number(PORT) || 5000);

const mainServer = http.createServer(app);

mainServer.on('error', (err) => {
  console.error('Main server listen error:', err.message);
});

if (isSocket) {
  mainServer.listen(primaryPort, () => {
    console.log(`🚀 Ruang Tumbuh Server is LIVE on socket: ${primaryPort}`);
    initDatabase().catch(e => console.error('[DB] Background init error:', e));
  });
} else {
  mainServer.listen(primaryPort, '0.0.0.0', () => {
    console.log(`🚀 Ruang Tumbuh Server is LIVE on 0.0.0.0:${primaryPort}`);
    initDatabase().catch(e => console.error('[DB] Background init error:', e));
  });

  // If primary port is not 3000, also bind to 3000 for LiteSpeed/Hostinger default routing
  if (primaryPort !== 3000) {
    try {
      const secondaryServer = http.createServer(app);
      secondaryServer.on('error', () => { /* ignore if port 3000 is occupied */ });
      secondaryServer.listen(3000, '0.0.0.0', () => {
        console.log(`🚀 Also listening on secondary port 0.0.0.0:3000`);
      });
    } catch (e) {
      // ignore
    }
  }
}
