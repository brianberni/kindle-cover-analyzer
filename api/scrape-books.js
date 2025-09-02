// Import the Kindle scraper - need to handle ES modules in serverless
async function loadKindleScraper() {
  const { default: KindleScraper } = await import('../src/scrapers/kindle-scraper.js');
  return KindleScraper;
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { category, limit = 20 } = req.query;
    
    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }

    console.log(`Scraping ${limit} books for category: ${category}`);
    
    // Load and use the real Kindle scraper
    const KindleScraper = await loadKindleScraper();
    const scraper = new KindleScraper();
    
    // This will use real Oxylabs scraping or fall back to demo data if scraping fails
    const books = await scraper.scrapeCategory(category, parseInt(limit));
    
    // Transform the data to match expected frontend format
    const transformedBooks = books.map(book => ({
      title: book.title,
      author: book.author,
      imageUrl: book.coverUrl,
      rank: book.rank,
      price: book.price,
      rating: book.rating,
      category: category,
      // Additional metadata for analysis
      amazonUrl: book.amazonUrl,
      reviewsCount: book.reviewsCount,
      isBestSeller: book.isBestSeller,
      trendingScore: book.trendingScore
    }));
    
    console.log(`Successfully scraped ${transformedBooks.length} books from ${category}`);
    
    res.json({
      category,
      count: transformedBooks.length,
      books: transformedBooks
    });
  } catch (error) {
    console.error('Scrape books error:', error);
    res.status(500).json({ 
      error: error.message,
      category: req.query.category || 'unknown'
    });
  }
}