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
    const requestBody = JSON.parse(event.body || '{}');
    const { books } = requestBody;
    
    if (!books || !Array.isArray(books)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Books array is required' })
      };
    }

    // Sample analysis data
    const analyses = books.map(book => ({
      book: book,
      analysis: {
        colorTheme: ['romantic', 'dark', 'modern', 'warm'][Math.floor(Math.random() * 4)],
        dominantColors: ['#ff69b4', '#1a1a1a', '#0066cc'][Math.floor(Math.random() * 3)],
        brightness: Math.random() * 255,
        contrast: Math.random() * 5,
        textDetection: { hasText: Math.random() > 0.3 },
        dimensions: { aspectRatio: '0.67' }
      }
    }));

    const trends = {
      colorThemes: { romantic: 3, dark: 2, modern: 2, warm: 1 },
      averageBrightness: 150,
      averageContrast: 3.2,
      aspectRatios: { '0.67': 8 },
      textPresence: 75
    };
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        analyses,
        trends,
        totalAnalyzed: analyses.length
      })
    };
    
  } catch (error) {
    console.error('Analysis function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
}