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

    // For now, return mock data while we work on getting the scraper working
    const mockBooks = Array.from({ length: parseInt(limit) }, (_, i) => ({
      title: `Sample Book ${i + 1} - ${category}`,
      author: `Author ${i + 1}`,
      imageUrl: `https://via.placeholder.com/300x400/0066cc/ffffff?text=Book+${i + 1}`,
      rank: i + 1,
      category: category
    }));
    
    res.json({
      category,
      count: mockBooks.length,
      books: mockBooks
    });
  } catch (error) {
    console.error('Scrape books error:', error);
    res.status(500).json({ error: error.message });
  }
}