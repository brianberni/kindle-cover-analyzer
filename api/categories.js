export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Simple categories list for now
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}