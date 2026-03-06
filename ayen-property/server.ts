import express from 'express';
import { createServer as createViteServer } from 'vite';
import mongoose from 'mongoose';

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ayentanu_property';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Property Schema
const propertySchema = new mongoose.Schema({
  judul: String,
  tipe: String,
  status: String,
  lokasi: String,
  harga: Number,
  deskripsi: String,
  gambar: String,
  galeri: String,
  luas_tanah: Number,
  label: String
}, { timestamps: true });

// Ensure frontend gets 'id' instead of '_id'
propertySchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

const Property = mongoose.model('Property', propertySchema);

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

app.get('/api/properties', async (req, res) => {
  try {
    const properties = await Property.find().sort({ createdAt: -1 });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

app.post('/api/properties', requireAuth, async (req, res) => {
  try {
    const { judul, tipe, status, lokasi, harga, deskripsi, gambar, galeri, luas_tanah, label } = req.body;
    const galeriStr = galeri ? JSON.stringify(galeri) : '[]';
    
    const newProperty = await Property.create({
      judul, tipe, status, lokasi, harga, deskripsi, gambar, galeri: galeriStr, luas_tanah: luas_tanah || null, label: label || null
    });
    
    res.json({ id: newProperty._id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create property' });
  }
});

app.put('/api/properties/:id', requireAuth, async (req, res) => {
  try {
    const { judul, tipe, status, lokasi, harga, deskripsi, gambar, galeri, luas_tanah, label } = req.body;
    const galeriStr = galeri ? JSON.stringify(galeri) : '[]';
    
    await Property.findByIdAndUpdate(req.params.id, {
      judul, tipe, status, lokasi, harga, deskripsi, gambar, galeri: galeriStr, luas_tanah: luas_tanah || null, label: label || null
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update property' });
  }
});

app.delete('/api/properties/:id', requireAuth, async (req, res) => {
  try {
    const deleted = await Property.findByIdAndDelete(req.params.id);
    if (deleted) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Property not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete property' });
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

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
