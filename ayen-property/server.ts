import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';

const db = new Database('properties.db');

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    judul TEXT,
    tipe TEXT,
    status TEXT,
    lokasi TEXT,
    harga INTEGER,
    deskripsi TEXT,
    gambar TEXT
  )
`);

// Add galeri column if it doesn't exist
try {
  db.exec('ALTER TABLE properties ADD COLUMN galeri TEXT');
} catch (e) {
  // Column already exists
}

// Add luas_tanah column if it doesn't exist
try {
  db.exec('ALTER TABLE properties ADD COLUMN luas_tanah INTEGER');
} catch (e) {
  // Column already exists
}

// Add label column if it doesn't exist
try {
  db.exec('ALTER TABLE properties ADD COLUMN label TEXT');
} catch (e) {
  // Column already exists
}

// Seed data if empty
const count = db.prepare('SELECT COUNT(*) as count FROM properties').get() as { count: number };
if (count.count === 0) {
  const insert = db.prepare('INSERT INTO properties (judul, tipe, status, lokasi, harga, deskripsi, gambar, galeri, luas_tanah, label) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
}

const app = express();
app.use(express.json());

const ADMIN_TOKEN = 'admin-token-123';

// Auth middleware
const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token === ADMIN_TOKEN) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// API Routes
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    res.json({ token: ADMIN_TOKEN });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.get('/api/properties', (req, res) => {
  const properties = db.prepare('SELECT * FROM properties ORDER BY id DESC').all();
  res.json(properties);
});

app.post('/api/properties', requireAuth, (req, res) => {
  const { judul, tipe, status, lokasi, harga, deskripsi, gambar, galeri, luas_tanah, label } = req.body;
  const galeriStr = galeri ? JSON.stringify(galeri) : '[]';
  const insert = db.prepare('INSERT INTO properties (judul, tipe, status, lokasi, harga, deskripsi, gambar, galeri, luas_tanah, label) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  const info = insert.run(judul, tipe, status, lokasi, harga, deskripsi, gambar, galeriStr, luas_tanah || null, label || null);
  res.json({ id: info.lastInsertRowid });
});

app.put('/api/properties/:id', requireAuth, (req, res) => {
  const { judul, tipe, status, lokasi, harga, deskripsi, gambar, galeri, luas_tanah, label } = req.body;
  const galeriStr = galeri ? JSON.stringify(galeri) : '[]';
  const update = db.prepare('UPDATE properties SET judul = ?, tipe = ?, status = ?, lokasi = ?, harga = ?, deskripsi = ?, gambar = ?, galeri = ?, luas_tanah = ?, label = ? WHERE id = ?');
  update.run(judul, tipe, status, lokasi, harga, deskripsi, gambar, galeriStr, luas_tanah || null, label || null, req.params.id);
  res.json({ success: true });
});

app.delete('/api/properties/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const del = db.prepare('DELETE FROM properties WHERE id = ?');
  const info = del.run(id);
  if (info.changes > 0) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Property not found' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
