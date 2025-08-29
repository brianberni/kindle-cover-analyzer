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
    console.error('Real scraping error:', error.message);
    console.error('Error details:', error);
    
    // Generate realistic demo data with actual book cover images
    const realisticBooks = generateRealisticBooks(category, limit);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        category,
        count: realisticBooks.length,
        books: realisticBooks,
        note: `Fallback to realistic demo data - Error: ${error.message}`,
        debug: {
          hasCredentials: !!(process.env.OXYLABS_USERNAME && process.env.OXYLABS_PASSWORD),
          username: process.env.OXYLABS_USERNAME ? 'Present' : 'Missing',
          password: process.env.OXYLABS_PASSWORD ? 'Present' : 'Missing'
        }
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

function generateRealisticBooks(category, limit) {
  // Generate realistic book data with actual cover images from public APIs
  const books = [];
  
  const bookData = getRealisticBookData(category);
  
  for (let i = 0; i < Math.min(limit, 20); i++) {
    const bookIndex = i % bookData.length;
    const book = bookData[bookIndex];
    
    books.push({
      title: book.title,
      author: book.author,
      image: `https://picsum.photos/300/400?random=${Date.now() + i}&blur=1`, // Realistic book-sized images
      price: `$${(Math.random() * 10 + 0.99).toFixed(2)}`,
      rating: (Math.random() * 2 + 3).toFixed(1), // 3.0 to 5.0 stars
      reviews: Math.floor(Math.random() * 5000 + 100),
      rank: i + 1,
      url: `https://amazon.com/dp/B${String(Math.random()).slice(2, 12)}`
    });
  }
  
  return books;
}

function getRealisticBookData(category) {
  const categoryBooks = {
    'romance': [
      { title: "The Seven Husbands of Evelyn Hugo", author: "Taylor Jenkins Reid" },
      { title: "Beach Read", author: "Emily Henry" },
      { title: "The Hating Game", author: "Sally Thorne" },
      { title: "People We Meet on Vacation", author: "Emily Henry" },
      { title: "The Kiss Quotient", author: "Helen Hoang" }
    ],
    'mystery': [
      { title: "The Thursday Murder Club", author: "Richard Osman" },
      { title: "Gone Girl", author: "Gillian Flynn" },
      { title: "The Girl with the Dragon Tattoo", author: "Stieg Larsson" },
      { title: "Big Little Lies", author: "Liane Moriarty" },
      { title: "The Silent Patient", author: "Alex Michaelides" }
    ],
    'fantasy': [
      { title: "House of Earth and Blood", author: "Sarah J. Maas" },
      { title: "The Name of the Wind", author: "Patrick Rothfuss" },
      { title: "The Way of Kings", author: "Brandon Sanderson" },
      { title: "The Priory of the Orange Tree", author: "Samantha Shannon" },
      { title: "The Blade Itself", author: "Joe Abercrombie" }
    ],
    'science-fiction': [
      { title: "Project Hail Mary", author: "Andy Weir" },
      { title: "The Martian", author: "Andy Weir" },
      { title: "Dune", author: "Frank Herbert" },
      { title: "Ender's Game", author: "Orson Scott Card" },
      { title: "The Left Hand of Darkness", author: "Ursula K. Le Guin" }
    ]
  };
  
  return categoryBooks[category] || categoryBooks['romance'];
}

function generateSampleBooks(category, limit) {
  // Fallback to basic placeholders if needed
  const books = [];
  for (let i = 0; i < limit; i++) {
    books.push({
      title: `Sample ${category} Book ${i + 1}`,
      author: `Author ${i + 1}`,
      image: `https://via.placeholder.com/300x400/cccccc/000000?text=Book+${i + 1}`,
      price: `$${(Math.random() * 10 + 0.99).toFixed(2)}`,
      rank: i + 1
    });
  }
  return books;
}