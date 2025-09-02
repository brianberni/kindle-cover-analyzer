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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}