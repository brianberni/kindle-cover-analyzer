import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configure dotenv before importing other modules
dotenv.config();

// Debug: Log if credentials are loaded
console.log('Environment check:');
console.log('OXYLABS_USERNAME:', process.env.OXYLABS_USERNAME ? 'Loaded' : 'Missing');
console.log('OXYLABS_PASSWORD:', process.env.OXYLABS_PASSWORD ? 'Loaded' : 'Missing');

import scraperRoutes from './src/routes/scraper.js';
import analysisRoutes from './src/routes/analysis.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use('/api/scraper', scraperRoutes);
app.use('/api/analysis', analysisRoutes);

// Categories endpoint
app.get('/api/categories', (req, res) => {
  const categories = [
    'romance',
    'mystery-thriller', 
    'science-fiction',
    'fantasy',
    'young-adult',
    'literary-fiction',
    'contemporary-fiction',
    'historical-fiction',
    'horror',
    'business'
  ];
  
  res.json({ categories });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server (works for both local and production)
app.listen(PORT, () => {
  console.log(`🚀 Kindle Cover Analyzer running on port ${PORT}`);
});

// Export for Vercel
export default app;