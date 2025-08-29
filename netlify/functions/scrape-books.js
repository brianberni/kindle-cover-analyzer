// Use fetch with proper authentication like the working local version

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
    
    console.log(`Scraping Amazon Kindle ${category} category with limit ${limit}... (using working local implementation)`);
    
    // Check credentials first
    const hasCredentials = !!(process.env.OXYLABS_USERNAME && process.env.OXYLABS_PASSWORD);
    console.log('Credentials available:', hasCredentials);
    console.log('OXYLABS_USERNAME:', process.env.OXYLABS_USERNAME);
    console.log('OXYLABS_PASSWORD:', process.env.OXYLABS_PASSWORD ? '***HIDDEN***' : 'undefined');
    
    if (!hasCredentials) {
      throw new Error('Oxylabs credentials not configured in environment variables');
    }
    
    // Use the exact working local implementation
    const books = await scrapeCategory(category, limit);
    
    console.log(`Successfully scraped ${books.length} real books`);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        category,
        count: books.length,
        books: books.map(book => ({
          title: book.title,
          author: book.author,
          image: book.coverUrl,
          price: book.price,
          rating: book.rating,
          reviews: book.reviewsCount,
          rank: book.rank,
          url: book.amazonUrl
        })),
        note: 'Real Amazon data via Oxylabs (using working local implementation)'
      })
    };
    
  } catch (error) {
    const category = event.queryStringParameters?.category || 'romance';
    const limit = parseInt(event.queryStringParameters?.limit) || 20;
    
    console.error('Scraping failed:', error.message);
    console.error('Full error details:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message,
        category: category,
        debug: {
          timestamp: new Date().toISOString(),
          hasCredentials: !!(process.env.OXYLABS_USERNAME && process.env.OXYLABS_PASSWORD),
          usernamePresent: !!process.env.OXYLABS_USERNAME,
          passwordPresent: !!process.env.OXYLABS_PASSWORD,
          usernameLength: process.env.OXYLABS_USERNAME?.length || 0,
          errorType: error.constructor.name
        }
      })
    };
  }
}

// Copy the exact working implementation from local KindleScraper
async function scrapeCategory(category, limit = 20) {
  const categories = getAllCategories();
  if (!categories[category]) {
    throw new Error(`Unknown category: ${category}`);
  }

  const categoryInfo = categories[category];
  
  console.log(`Scraping Amazon Kindle ${category} category...`);
  console.log(`Query: ${getCategoryQuery(category)}`);

  const oxylabsAuth = {
    username: process.env.OXYLABS_USERNAME,
    password: process.env.OXYLABS_PASSWORD
  };

  try {
    const response = await makeOxylabsRequest(category, oxylabsAuth);
    
    console.log('Oxylabs response status:', response.status);
    console.log('Oxylabs response structure:', Object.keys(response.data || {}));
    
    // Log job ID for support if present
    if (response.data?.job_id) {
      console.log(`Oxylabs Job ID: ${response.data.job_id}`);
    }
    
    if (response.data && response.data.results && response.data.results[0]) {
      const result = response.data.results[0];
      console.log('Result keys:', Object.keys(result));
      
      // Handle structured data from parse: true
      let books = [];
      
      if (result.content && result.content.results && result.content.results.organic) {
        // Structured response format from amazon_search with parse: true
        console.log('Using parsed results from amazon_search');
        console.log(`Found ${result.content.results.organic.length} organic results`);
        books = parseAmazonSearchResults(result.content.results.organic, limit);
      } else {
        console.log('Unexpected response format from amazon_search');
        console.log('Response content keys:', Object.keys(result.content || {}));
      }
      
      if (books.length > 0) {
        console.log(`Successfully scraped ${books.length} books from ${category}`);
        return books;
      } else {
        throw new Error(`No books found in Oxylabs response`);
      }
    } else {
      console.log(`Invalid response structure`);
      console.log('Response data:', JSON.stringify(response.data, null, 2));
      throw new Error(`Invalid response structure from Oxylabs`);
    }
  } catch (error) {
    console.error(`Scraping failed:`, error.response?.data || error.message);
    
    // Log job ID if available for Oxylabs support
    if (error.response?.data?.job_id) {
      console.error(`Oxylabs Job ID: ${error.response.data.job_id}`);
      console.error(`Use this Job ID when contacting Oxylabs support about Amazon URL restrictions`);
    }
    
    throw error;
  }
}

async function makeOxylabsRequest(category, oxylabsAuth) {
  // Use correct amazon_search source - ONLY query, domain, parse per Oxylabs instruction
  const payload = {
    source: 'amazon_search',
    query: getCategoryQuery(category),
    domain: 'com',
    parse: true,
    sort_by: 'relevance'  // Try to get most relevant bestsellers
  };

  console.log('Oxylabs request payload:', JSON.stringify(payload, null, 2));

  // Create proper Basic Auth header like axios does internally
  const credentials = `${oxylabsAuth.username}:${oxylabsAuth.password}`;
  const encodedCredentials = btoa(credentials);

  const response = await fetch('https://realtime.oxylabs.io/v1/queries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${encodedCredentials}`  // Proper Basic Auth
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.log('Oxylabs error response:', errorText);
    throw new Error(`Oxylabs API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  // Return in axios-like format for compatibility
  return {
    status: response.status,
    data: data
  };
}

function getCategoryQuery(category) {
  // Map categories to bestseller search queries for better results
  const queries = {
    // Romance Categories
    'romance': 'kindle romance bestsellers',
    'contemporary-romance': 'kindle contemporary romance bestsellers',
    'paranormal-romance': 'kindle paranormal romance bestsellers',
    'historical-romance': 'kindle historical romance bestsellers',
    'regency-romance': 'kindle regency romance bestsellers',
    'regency-fiction': 'kindle regency fiction bestsellers',
    'victorian-romance': 'kindle victorian romance bestsellers',
    'medieval-romance': 'kindle medieval romance bestsellers',
    'scottish-romance': 'kindle scottish romance bestsellers',
    'viking-romance': 'kindle viking romance bestsellers',
    'american-historical-romance': 'kindle american historical romance bestsellers',
    'romantic-suspense': 'kindle romantic suspense bestsellers',
    'sports-romance': 'kindle sports romance bestsellers',
    'new-adult-romance': 'kindle new adult romance bestsellers',
    'holiday-romance': 'kindle holiday romance bestsellers',
    'western-romance': 'kindle western romance bestsellers',
    'military-romance': 'kindle military romance bestsellers',
    'clean-wholesome-romance': 'kindle clean wholesome romance bestsellers',
    
    // Mystery, Thriller & Suspense
    'mystery-thriller': 'kindle mystery thriller bestsellers',
    'mystery': 'kindle mystery bestsellers',
    'thriller': 'kindle thriller bestsellers',
    'psychological-thrillers': 'kindle psychological thriller bestsellers',
    'crime-thrillers': 'kindle crime thriller bestsellers',
    'domestic-thriller': 'kindle domestic thriller bestsellers',
    'womens-mystery-thriller': 'kindle womens mystery thriller bestsellers',
    'cozy-mystery': 'kindle cozy mystery bestsellers',
    'cozy-animal-mystery': 'kindle cozy animal mystery bestsellers',
    'cozy-crafts-mystery': 'kindle cozy crafts mystery bestsellers',
    'police-procedurals': 'kindle police procedural bestsellers',
    'short-mystery-thriller': 'kindle short mystery thriller bestsellers',
    
    // Science Fiction & Fantasy
    'science-fiction': 'kindle science fiction bestsellers',
    'fantasy': 'kindle fantasy bestsellers',
    'science-fiction-fantasy': 'kindle sci-fi fantasy bestsellers',
    'paranormal-fantasy': 'kindle paranormal urban fantasy bestsellers',
    'epic-fantasy': 'kindle epic fantasy bestsellers',
    'urban-fantasy': 'kindle urban fantasy bestsellers',
    'dystopian': 'kindle dystopian bestsellers',
    'space-opera': 'kindle space opera bestsellers',
    'time-travel': 'kindle time travel bestsellers',
    'sword-sorcery': 'kindle sword sorcery bestsellers',
    'alternate-history': 'kindle alternate history bestsellers',
    'military-sci-fi': 'kindle military science fiction bestsellers',
    'steampunk': 'kindle steampunk bestsellers',
    'cyberpunk': 'kindle cyberpunk bestsellers',
    'apocalyptic-sci-fi': 'kindle apocalyptic post apocalyptic bestsellers'
  };
  
  return queries[category] || `kindle ${category.replace(/-/g, ' ')} bestsellers`;
}

function parseAmazonSearchResults(organicResults, limit) {
  const books = [];
  
  organicResults.slice(0, limit).forEach((item, index) => {
    try {
      // Extract data from amazon_search structured response
      const title = item.title || '';
      const author = item.manufacturer || item.author || item.author_name || '';
      const price = item.price ? `$${item.price}` : '';
      const rating = item.rating || '';
      const imageUrl = item.url_image || item.image || item.image_url || '';
      const url = item.url || '';
      const asin = item.asin || '';
      const reviewsCount = item.reviews_count || 0;
      const salesVolume = item.sales_volume || '';
      const isBestSeller = item.best_seller || false;
      const isAmazonsChoice = item.is_amazons_choice || false;
      const pricingCount = item.pricing_count || 0;
      
      // Calculate trending score for better ranking
      const trendingScore = calculateTrendingScore({
        rating,
        reviewsCount,
        isBestSeller,
        isAmazonsChoice,
        salesVolume,
        searchPosition: index + 1
      });

      // Try to extract ABSR (Amazon Best Sellers Rank) if available
      const absr = item.best_sellers_rank || item.sales_rank || item.rank || null;
      
      console.log(`Parsing item ${index + 1}:`, {
        title: title.substring(0, 50),
        author,
        price,
        hasImage: !!imageUrl,
        reviewsCount,
        rating,
        isBestSeller,
        isAmazonsChoice,
        absr,
        trendingScore
      });
      
      // Accept books even without images for now - we'll use placeholders
      if (title) {
        books.push({
          rank: index + 1,
          title: title ? title.trim() : '',
          author: author ? author.trim() : '',
          coverUrl: imageUrl ? getHighResImage(imageUrl) : `https://picsum.photos/300/400?random=${index + 1}`,
          price: price,
          rating: rating ? `${rating} out of 5 stars` : '',
          amazonUrl: url,
          // Amazon metadata for trending analysis
          reviewsCount,
          salesVolume,
          isBestSeller,
          isAmazonsChoice,
          absr,
          trendingScore
        });
      }
    } catch (error) {
      console.error('Error parsing search result item:', error);
    }
  });
  
  // Sort books by trending score (highest first) to show most trending covers
  books.sort((a, b) => b.trendingScore - a.trendingScore);
  
  // Re-rank after sorting
  books.forEach((book, index) => {
    book.rank = index + 1;
  });
  
  return books;
}

function calculateTrendingScore(data) {
  let score = 0;
  
  // Base score from search position (earlier = better)
  score += Math.max(0, 20 - data.searchPosition);
  
  // Rating boost (0-5 scale)
  if (data.rating && data.rating > 0) {
    score += data.rating * 5;  // Up to 25 points
  }
  
  // Reviews count boost (logarithmic scale)
  if (data.reviewsCount && data.reviewsCount > 0) {
    score += Math.log10(Math.max(1, data.reviewsCount)) * 3;  // Up to ~12 points for 1000+ reviews
  }
  
  // Bestseller flags
  if (data.isBestSeller) {
    score += 15;  // Major boost for bestseller badge
  }
  
  if (data.isAmazonsChoice) {
    score += 10;  // Good boost for Amazon's Choice
  }
  
  // Sales volume (if available as text like "1000+ bought")
  if (data.salesVolume && typeof data.salesVolume === 'string') {
    const salesMatch = data.salesVolume.match(/(\d+)/);
    if (salesMatch) {
      const salesNum = parseInt(salesMatch[1]);
      score += Math.log10(Math.max(1, salesNum)) * 2;
    }
  }
  
  return Math.round(score * 100) / 100;  // Round to 2 decimal places
}

function getHighResImage(imageUrl) {
  if (!imageUrl) return null;
  
  // Convert Amazon image URL to higher resolution
  return imageUrl
    .replace(/\._[A-Z0-9,_]+_\./, '._SL500_.')
    .replace(/\._[A-Z0-9,_]+\./, '._SL500_.');
}

function getAllCategories() {
  return {
    // Romance Categories  
    'romance': { id: '158566011', name: 'Romance' },
    'contemporary-romance': { id: '158568011', name: 'Contemporary-Romance' },
    'paranormal-romance': { id: '6190484011', name: 'Paranormal-Romance' },
    'historical-romance': { id: '158571011', name: 'Historical-Romance' },
    'regency-romance': { id: '158573011', name: 'Regency-Historical-Romance' },
    'regency-fiction': { id: '7588801011', name: 'Historical-Regency-Fiction' },
    'victorian-romance': { id: '158572011', name: 'Victorian-Romance' },
    'medieval-romance': { id: '158574011', name: 'Medieval-Romance' },
    'scottish-romance': { id: '158575011', name: 'Scottish-Romance' },
    'viking-romance': { id: '158576011', name: 'Viking-Romance' },
    'american-historical-romance': { id: '158577011', name: 'American-Historical-Romance' },
    'romantic-suspense': { id: '6487841011', name: 'Romantic-Suspense' },
    'sports-romance': { id: '6487842011', name: 'Sports-Romance' },
    'new-adult-romance': { id: '6487838011', name: 'New-Adult-College-Romance' },
    'holiday-romance': { id: '6487839011', name: 'Holiday-Romance' },
    'western-romance': { id: '158574011', name: 'Western-Romance' },
    'military-romance': { id: '6487840011', name: 'Military-Romance' },
    'clean-wholesome-romance': { id: '11764652011', name: 'Clean-Wholesome-Romance' },
    
    // Mystery, Thriller & Suspense
    'mystery-thriller': { id: '18623156011', name: 'Crime-Mystery-Science-Fiction' },
    'mystery': { id: '157058011', name: 'Mystery' },
    'thriller': { id: '157319011', name: 'Thrillers' },
    'psychological-thrillers': { id: '10491', name: 'Psychological-Thrillers' },
    'crime-thrillers': { id: '7538392011', name: 'Crime-Thrillers' },
    'domestic-thriller': { id: '7588851011', name: 'Mystery-Thriller-Suspense-Literary-Fiction' },
    'womens-mystery-thriller': { id: '7588892011', name: 'Women-Mystery-Thriller-Suspense-Fiction' },
    'cozy-mystery': { id: '6190476011', name: 'Cozy-Mystery' },
    'cozy-animal-mystery': { id: '7130629011', name: 'Cozy-Animal-Mystery' },
    'cozy-crafts-mystery': { id: '7130630011', name: 'Cozy-Crafts-Hobbies-Mystery' },
    'police-procedurals': { id: '6362396011', name: 'Police-Procedurals' },
    'short-mystery-thriller': { id: '8624241011', name: 'Two-Hour-Mystery-Thriller-Suspense-Short-Reads' },
    
    // Science Fiction & Fantasy
    'science-fiction': { id: '158591011', name: 'Science-Fiction' },
    'fantasy': { id: '158576011', name: 'Fantasy' },
    'science-fiction-fantasy': { id: '668010011', name: 'Science-Fiction-Fantasy' },
    'paranormal-fantasy': { id: '6157853011', name: 'Paranormal-Urban-Fantasy' },
    'epic-fantasy': { id: '6157854011', name: 'Epic-Fantasy' },
    'urban-fantasy': { id: '6157853011', name: 'Paranormal-Urban-Fantasy' },
    'dystopian': { id: '6422453011', name: 'Dystopian' },
    'space-opera': { id: '6422454011', name: 'Space-Opera' },
    'time-travel': { id: '6422455011', name: 'Time-Travel' },
    'sword-sorcery': { id: '6157855011', name: 'Sword-Sorcery' },
    'alternate-history': { id: '6422456011', name: 'Alternate-History' },
    'military-sci-fi': { id: '6422457011', name: 'Military-Science-Fiction' },
    'steampunk': { id: '6422458011', name: 'Steampunk' },
    'cyberpunk': { id: '6422459011', name: 'Cyberpunk' },
    'apocalyptic-sci-fi': { id: '6422460011', name: 'Apocalyptic-Post-Apocalyptic' },
    
    // Teen & Young Adult
    'teen-young-adult': { id: '157005011', name: 'Teen-Young-Adult' },
    'ya-fantasy': { id: '10368598011', name: 'Teen-Young-Adult-Fantasy-Supernatural-Mysteries-Thrillers' },
    'ya-romance': { id: '10368597011', name: 'Teen-Young-Adult-Romantic-Mysteries-Thrillers' },
    'ya-science-fiction': { id: '3653225031', name: 'Teen-Young-Adult-Science-Fiction-Fantasy' },
    'ya-dystopian': { id: '157010011', name: 'Teen-Young-Adult-Dystopian' },
    'ya-paranormal': { id: '157011011', name: 'Teen-Young-Adult-Paranormal-Urban' },
    'ya-contemporary': { id: '157012011', name: 'Teen-Young-Adult-Contemporary' },
    
    // Literary & General Fiction
    'literary-fiction': { id: '157028011', name: 'Literature-Fiction' },
    'contemporary-fiction': { id: '157290011', name: 'Contemporary-Fiction' },
    'historical-fiction': { id: '157058011', name: 'Historical-Fiction' },
    'women-fiction': { id: '157303011', name: 'Women-Fiction' },
    'family-saga': { id: '157304011', name: 'Family-Saga' },
    'psychological-fiction': { id: '18289231011', name: 'Psychological-Fiction' },
    'upmarket-fiction': { id: '157305011', name: 'Upmarket-Fiction' },
    
    // Horror & Supernatural
    'horror': { id: '158568011', name: 'Horror' },
    'paranormal': { id: '15195309011', name: 'Paranormal' },
    'supernatural': { id: '6422456011', name: 'Supernatural' },
    'gothic': { id: '6422457011', name: 'Gothic' },
    'occult-horror': { id: '158569011', name: 'Occult-Horror' },
    'vampire': { id: '158570011', name: 'Vampire' },
    'werewolves-shapeshifters': { id: '158571011', name: 'Werewolves-Shapeshifters' },
    
    // Action & Adventure
    'action-adventure': { id: '158310011', name: 'Action-Adventure' },
    'war-military': { id: '158312011', name: 'War-Military' },
    'sea-adventures': { id: '158313011', name: 'Sea-Adventures' },
    'spy-thrillers': { id: '158314011', name: 'Spy-Stories-Tales-Intrigue' },
    'adventure-fiction': { id: '7588730011', name: 'Men-Adventure-Fiction' },
    
    // Non-Fiction Categories  
    'business': { id: '154606011', name: 'Business-Money' },
    'self-help': { id: '154539011', name: 'Self-Help' },
    'biography': { id: '154390011', name: 'Biographies-Memoirs' },
    'health-fitness': { id: '154355011', name: 'Health-Fitness-Dieting' },
    'cooking': { id: '154348011', name: 'Cookbooks-Food-Wine' },
    'history': { id: '154368011', name: 'History' },
    'politics': { id: '154372011', name: 'Politics-Social-Sciences' }
  };
}