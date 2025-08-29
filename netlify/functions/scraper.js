import KindleScraper from '../../src/scrapers/kindle-scraper.js';

const scraper = new KindleScraper();

export async function handler(event, context) {
  const { httpMethod, path, queryStringParameters, body } = event;
  
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
    if (path.endsWith('/categories')) {
      const categories = scraper.getAvailableCategories();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ categories })
      };
    }
    
    if (path.includes('/books/')) {
      const category = path.split('/books/')[1];
      const limit = parseInt(queryStringParameters?.limit) || 20;
      
      const books = await scraper.scrapeCategory(category, limit);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ category, count: books.length, books })
      };
    }
    
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' })
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
}