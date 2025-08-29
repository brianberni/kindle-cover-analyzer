import express from 'express';
import KindleScraper from '../scrapers/kindle-scraper.js';

const router = express.Router();
// Don't create scraper here - create it when needed

// Get available categories
router.get('/categories', (req, res) => {
  try {
    const scraper = new KindleScraper();
    const categories = scraper.getAvailableCategories();
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Scrape books by category
router.get('/books/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    
    const scraper = new KindleScraper();
    const books = await scraper.scrapeCategory(category, limit);
    
    res.json({
      category,
      count: books.length,
      books
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      category: req.params.category 
    });
  }
});

export default router;