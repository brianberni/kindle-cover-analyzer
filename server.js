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

// Direct API endpoints that JavaScript expects
app.get('/api/scrape-books', async (req, res) => {
  try {
    const { category, limit = 20 } = req.query;
    
    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }
    
    // Import and use the scraper
    const { default: KindleScraper } = await import('./src/scrapers/kindle-scraper.js');
    const scraper = new KindleScraper();
    const books = await scraper.scrapeCategory(category, parseInt(limit));
    
    res.json({
      category,
      count: books.length,
      books
    });
  } catch (error) {
    console.error('Scrape books error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/analyze', async (req, res) => {
  try {
    const { books } = req.body;
    
    if (!books || !Array.isArray(books)) {
      return res.status(400).json({ error: 'Books array is required' });
    }
    
    // Import and use the analyzer
    const { default: EnhancedCoverAnalyzer } = await import('./src/analysis/enhanced-analyzer.js');
    const analyzer = new EnhancedCoverAnalyzer();
    const analyses = await analyzer.analyzeCovers(books);
    
    res.json({
      analyses,
      totalAnalyzed: analyses.length
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Categories endpoint
app.get('/api/categories', (req, res) => {
  const categories = [
    // Romance Categories
    'romance',
    'contemporary-romance',
    'paranormal-romance',
    'historical-romance',
    'regency-romance',
    'romantic-suspense',
    'sports-romance',
    'new-adult-romance',
    'holiday-romance',
    'western-romance',
    'military-romance',
    'clean-wholesome-romance',
    
    // Mystery, Thriller & Suspense
    'mystery-thriller',
    'mystery',
    'thriller',
    'psychological-thrillers',
    'crime-thrillers',
    'domestic-thriller',
    'cozy-mystery',
    'police-procedurals',
    
    // Science Fiction & Fantasy
    'science-fiction',
    'fantasy',
    'paranormal-fantasy',
    'epic-fantasy',
    'urban-fantasy',
    'dystopian',
    'space-opera',
    'time-travel',
    'steampunk',
    'cyberpunk',
    
    // Teen & Young Adult
    'teen-young-adult',
    'ya-fantasy',
    'ya-romance',
    'ya-science-fiction',
    'ya-dystopian',
    'ya-paranormal',
    'ya-contemporary',
    
    // Literary & General Fiction
    'literary-fiction',
    'contemporary-fiction',
    'historical-fiction',
    'women-fiction',
    'family-saga',
    'psychological-fiction',
    
    // Horror & Supernatural
    'horror',
    'paranormal',
    'supernatural',
    'gothic',
    'vampire',
    'werewolves-shapeshifters',
    
    // Action & Adventure
    'action-adventure',
    'war-military',
    'spy-thrillers',
    
    // Non-Fiction
    'business',
    'self-help',
    'biography',
    'health-fitness',
    'cooking',
    'history'
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