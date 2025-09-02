export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { books } = req.body;
    
    if (!books || !Array.isArray(books)) {
      return res.status(400).json({ error: 'Books array is required' });
    }

    // For now, return mock analysis data
    const analyses = books.map(book => ({
      title: book.title,
      author: book.author,
      imageUrl: book.imageUrl,
      analysis: {
        colorTheme: ['dark', 'warm', 'cool', 'romantic', 'mysterious'][Math.floor(Math.random() * 5)],
        brightness: Math.floor(Math.random() * 255),
        contrast: Math.random() * 5,
        dominantColors: [
          { color: '#1a237e', percentage: 35 },
          { color: '#ffffff', percentage: 25 },
          { color: '#ffb74d', percentage: 20 }
        ],
        textDetection: {
          hasText: Math.random() > 0.2,
          confidence: Math.random()
        },
        dimensions: {
          aspectRatio: '0.67'
        }
      }
    }));
    
    res.json({
      analyses,
      totalAnalyzed: analyses.length
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: error.message });
  }
}