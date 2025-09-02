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
    console.log('Environment variables check:');
    console.log('OXYLABS_USERNAME:', process.env.OXYLABS_USERNAME ? 'SET' : 'NOT SET');
    console.log('OXYLABS_PASSWORD:', process.env.OXYLABS_PASSWORD ? 'SET' : 'NOT SET');
    
    // Load and use the real Kindle scraper
    const KindleScraper = await loadKindleScraper();
    const scraper = new KindleScraper();
    
    // This will use real Oxylabs scraping or fall back to demo data if scraping fails
    const books = await scraper.scrapeCategory(category, parseInt(limit));
    
    console.log('Scraping result - first book:', books[0]);
    console.log('Is this real Amazon data?', books[0]?.amazonUrl ? 'YES' : 'NO (demo data)');
    
    // Transform the data to match expected frontend format
    const transformedBooks = books.map((book, index) => {
      let imageUrl = book.coverUrl;
      
      // If we have a real Amazon image URL, proxy it to avoid CORS issues
      if (imageUrl && (imageUrl.includes('amazon.com') || imageUrl.includes('amazonaws.com'))) {
        imageUrl = `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;
      } else if (!imageUrl) {
        // Fallback to placeholder only if no image at all
        imageUrl = `https://via.placeholder.com/300x400/666666/ffffff?text=${encodeURIComponent(book.title?.substring(0, 20) || 'Book')}`;
      }
      
      return {
        title: book.title,
        author: book.author,
        imageUrl,
        coverUrl: imageUrl, // Frontend expects coverUrl
        rank: book.rank,
        price: book.price,
        rating: book.rating,
        category: category,
        // Additional metadata for analysis
        amazonUrl: book.amazonUrl,
        reviewsCount: book.reviewsCount,
        isBestSeller: book.isBestSeller,
        trendingScore: book.trendingScore
      };
    });
    
    console.log('Sample transformed book:', transformedBooks[0]);
    
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