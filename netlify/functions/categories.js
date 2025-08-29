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
    console.log('Categories function called - using hardcoded categories for now');
    
    // Just return hardcoded categories until we resolve the import issue
    const categories = [
      'romance', 'mystery-thriller', 'science-fiction', 'fantasy',
      'young-adult', 'literary-fiction', 'contemporary-fiction',
      'historical-fiction', 'horror', 'business'
    ];
    
    console.log('Returning categories:', categories);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ categories })
    };
    
  } catch (error) {
    console.error('Categories function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
}