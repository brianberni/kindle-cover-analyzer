import KindleScraper from '../../src/scrapers/kindle-scraper.js';

export async function handler(event, context) {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    console.log('Categories function called');
    const scraper = new KindleScraper();
    console.log('Scraper created, getting categories');
    const categories = scraper.getAvailableCategories();
    console.log('Categories retrieved:', categories);
    
    // Ensure we have categories
    if (!categories || categories.length === 0) {
      const fallbackCategories = [
        'romance', 'mystery-thriller', 'science-fiction', 'fantasy',
        'young-adult', 'literary-fiction', 'contemporary-fiction',
        'historical-fiction', 'horror', 'business'
      ];
      console.log('Using fallback categories');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ categories: fallbackCategories })
      };
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ categories })
    };
    
  } catch (error) {
    console.error('Categories function error:', error);
    // Return fallback categories on error
    const fallbackCategories = [
      'romance', 'mystery-thriller', 'science-fiction', 'fantasy',
      'young-adult', 'literary-fiction', 'contemporary-fiction',
      'historical-fiction', 'horror', 'business'
    ];
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ categories: fallbackCategories })
    };
  }
}