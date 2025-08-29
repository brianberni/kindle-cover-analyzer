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
    // Simple hardcoded categories for now
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