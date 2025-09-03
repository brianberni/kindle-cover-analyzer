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
    
    // This will use direct Amazon scraping with Zyte proxy or fall back to curated data if scraping fails
    const books = await scraper.scrapeCategory(category, parseInt(limit));
    
    console.log('Scraping result - first book:', books[0]);
    console.log('Is this real Amazon data?', books[0]?.amazonUrl ? 'YES' : 'NO (demo data)');
    
    // Transform the data to match expected frontend format
    const transformedBooks = books.map((book, index) => {
      let imageUrl = book.coverUrl;
      
      // For fallback data, accept the curated books as they have been pre-validated
      const isFallbackData = book.amazonUrl?.includes('fallback');
      
      if (isFallbackData) {
        console.log(`✅ Using fallback book with curated image: ${book.title}`);
      } else {
        // For real Amazon data, validate image URLs
        if (imageUrl && (imageUrl.includes('amazon.com') || imageUrl.includes('amazonaws.com') || imageUrl.includes('m.media-amazon'))) {
          console.log(`✅ Using direct Amazon image: ${imageUrl.substring(0, 60)}...`);
        } else {
          console.error(`❌ Book has no valid Amazon image: ${book.title}`);
          // Don't include books without real Amazon images
          return null;
        }
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
    }).filter(book => book !== null); // Remove books without valid images (except fallback data)
    
    console.log('Sample transformed book:', transformedBooks[0]);
    console.log(`✅ Returning ${transformedBooks.length} books with validated images`);
    
    if (transformedBooks.length === 0) {
      throw new Error(`No books found for ${category} category. This could be due to Amazon blocking the request or an issue with image validation.`);
    }
    
    console.log(`Successfully scraped ${transformedBooks.length} books from ${category}`);
    
    res.json({
      category,
      count: transformedBooks.length,
      books: transformedBooks,
      dataSource: transformedBooks.length > 0 && transformedBooks[0].amazonUrl?.includes('fallback') 
        ? 'curated-popular-titles' 
        : 'live-amazon-scraping',
      note: transformedBooks.length > 0 && transformedBooks[0].amazonUrl?.includes('fallback')
        ? `Using curated popular ${category} titles due to Amazon scraping timeout constraints`
        : 'Live data from Amazon bestsellers page'
    });
  } catch (error) {
    console.error('Scrape books error:', error);
    res.status(500).json({ 
      error: error.message,
      category: req.query.category || 'unknown'
    });
  }
}