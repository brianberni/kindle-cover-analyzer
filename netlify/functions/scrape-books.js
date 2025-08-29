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
    
    console.log(`Real scraping for ${category} with limit ${limit}`);
    
    // Get category info
    const categoryInfo = getCategoryInfo(category);
    if (!categoryInfo) {
      throw new Error(`Unknown category: ${category}`);
    }
    
    // Make Oxylabs request
    const books = await scrapeWithOxylabs(category, categoryInfo, limit);
    
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
    console.error('Real scraping error:', error);
    // Fall back to sample data if scraping fails
    const sampleBooks = generateSampleBooks(
      event.queryStringParameters?.category || 'romance',
      parseInt(event.queryStringParameters?.limit) || 20
    );
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        category: event.queryStringParameters?.category || 'romance',
        count: sampleBooks.length,
        books: sampleBooks,
        note: 'Fallback to sample data due to scraping error'
      })
    };
  }
}

async function scrapeWithOxylabs(category, categoryInfo, limit) {
  const oxylabsAuth = {
    username: process.env.OXYLABS_USERNAME,
    password: process.env.OXYLABS_PASSWORD
  };

  if (!oxylabsAuth.username || !oxylabsAuth.password) {
    throw new Error('Oxylabs credentials not configured');
  }

  // Create Oxylabs request payload
  const payload = {
    source: 'amazon_search',
    domain: 'com',
    query: `kindle books ${category} bestsellers`,
    parse: true,
    context: [
      { key: 'category_id', value: categoryInfo.id },
      { key: 'sort_by', value: 'popularity-rank' }
    ]
  };

  console.log('Oxylabs request payload:', JSON.stringify(payload, null, 2));

  // Make request to Oxylabs
  const response = await fetch('https://realtime.oxylabs.io/v1/queries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa(`${oxylabsAuth.username}:${oxylabsAuth.password}`)
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  console.log('Oxylabs response:', JSON.stringify(data, null, 2));

  if (data.results && data.results[0] && data.results[0].content) {
    const content = data.results[0].content;
    if (content.results && content.results.organic) {
      return parseAmazonResults(content.results.organic, limit);
    }
  }

  throw new Error('No valid results from Oxylabs');
}

function parseAmazonResults(organic, limit) {
  const books = [];
  
  for (let i = 0; i < Math.min(organic.length, limit); i++) {
    const item = organic[i];
    
    if (item.title && item.url) {
      books.push({
        title: item.title,
        author: item.author || 'Unknown Author',
        image: item.image || `https://via.placeholder.com/300x400/cccccc/000000?text=${encodeURIComponent(item.title.substring(0, 20))}`,
        price: item.price || 'N/A',
        rating: item.rating || 0,
        reviews: item.reviews_count || 0,
        rank: i + 1,
        url: item.url
      });
    }
  }
  
  return books;
}

function getCategoryInfo(category) {
  const categories = {
    'romance': { id: '158566011', name: 'Romance' },
    'contemporary-romance': { id: '158568011', name: 'Contemporary-Romance' },
    'paranormal-romance': { id: '6190484011', name: 'Paranormal-Romance' },
    'historical-romance': { id: '158571011', name: 'Historical-Romance' },
    'mystery-thriller': { id: '18623156011', name: 'Crime-Mystery-Science-Fiction' },
    'mystery': { id: '157058011', name: 'Mystery' },
    'thriller': { id: '157319011', name: 'Thrillers' },
    'science-fiction': { id: '158591011', name: 'Science-Fiction' },
    'fantasy': { id: '158576011', name: 'Fantasy' },
    'horror': { id: '158568011', name: 'Horror' },
    'business': { id: '154606011', name: 'Business-Money' },
    'self-help': { id: '154539011', name: 'Self-Help' },
    'biography': { id: '154390011', name: 'Biographies-Memoirs' }
    // Add more as needed
  };
  
  return categories[category];
}

function generateSampleBooks(category, limit) {
  // Same fallback function as before
  const baseBooks = {
    'romance': [
      { title: "Heart's Desire", author: "Sarah Johnson", image: "https://via.placeholder.com/300x400/ff69b4/ffffff?text=Romance+1", price: "$3.99", rank: 1 },
      { title: "Love's Promise", author: "Emma Wilson", image: "https://via.placeholder.com/300x400/ff1493/ffffff?text=Romance+2", price: "$2.99", rank: 2 },
      { title: "Passionate Nights", author: "Lisa Brown", image: "https://via.placeholder.com/300x400/dc143c/ffffff?text=Romance+3", price: "$4.99", rank: 3 }
    ]
    // Add more categories as needed
  };
  
  const books = baseBooks[category] || baseBooks['romance'];
  return books.slice(0, Math.min(limit, books.length));
}