import KindleScraper from '../../src/scrapers/kindle-scraper.js';

const scraper = new KindleScraper();

export async function handler(event, context) {
  const { httpMethod, queryStringParameters, body } = event;
  
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    console.log('Netlify function called:', event);
    
    // For now, just return categories since that's what's being requested
    const categories = scraper.getAvailableCategories();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ categories })
    };
    
  } catch (error) {
    console.error('Netlify function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
}