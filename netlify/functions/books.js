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
    const category = event.queryStringParameters?.category || 'romance';
    const limit = parseInt(event.queryStringParameters?.limit) || 20;
    
    console.log(`Scraping ${category} with limit ${limit}`);
    
    const scraper = new KindleScraper();
    const books = await scraper.scrapeCategory(category, limit);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        category,
        count: books.length,
        books: books 
      })
    };
    
  } catch (error) {
    console.error('Books function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
}