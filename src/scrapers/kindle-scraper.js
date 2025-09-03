import axios from 'axios';
import * as cheerio from 'cheerio';

class KindleScraper {
  constructor() {
    console.log('KindleScraper constructor - checking env vars:');
    console.log('OXYLABS_USERNAME:', process.env.OXYLABS_USERNAME);
    console.log('OXYLABS_PASSWORD:', process.env.OXYLABS_PASSWORD ? '***HIDDEN***' : 'undefined');
    
    this.oxylabsAuth = {
      username: process.env.OXYLABS_USERNAME,
      password: process.env.OXYLABS_PASSWORD
    };
    
    // Amazon Kindle Bestsellers category URLs with sub-categories
    this.categories = {
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

  async scrapeCategory(category, limit = 20) {
    if (!this.categories[category]) {
      throw new Error(`Unknown category: ${category}`);
    }

    const categoryInfo = this.categories[category];
    
    console.log(`Scraping Amazon Kindle ${category} category...`);
    console.log(`Query: ${this.getCategoryQuery(category)}`);

    try {
      const response = await this.makeOxylabsRequest(category);
      
      console.log('Oxylabs response status:', response.status);
      console.log('Oxylabs response structure:', Object.keys(response.data || {}));
      
      // Log job ID for support if present
      if (response.data?.job_id) {
        console.log(`Oxylabs Job ID: ${response.data.job_id}`);
      }
      
      if (response.data && response.data.results && response.data.results[0]) {
        const result = response.data.results[0];
        console.log('Result keys:', Object.keys(result));
        
        // Handle parsed bestseller data from Oxylabs
        let books = [];
        
        if (result.content && result.content.bestsellers) {
          // Amazon bestsellers parsed response
          console.log('Using parsed bestsellers from amazon_bestsellers');
          console.log(`Found ${result.content.bestsellers.length} bestseller items`);
          books = this.parseAmazonBestsellerResults(result.content.bestsellers, limit);
        } else if (result.content && typeof result.content === 'string') {
          // Raw HTML from bestseller page (fallback)
          console.log('Parsing raw HTML from bestseller page');
          console.log(`HTML length: ${result.content.length} characters`);
          books = this.parseBooks(result.content, limit);
        } else if (result.content && result.content.results && result.content.results.organic) {
          // Amazon search response format (fallback)
          console.log('Using parsed results from amazon_search (bestsellers sorted)');
          console.log(`Found ${result.content.results.organic.length} search results`);
          books = this.parseAmazonSearchResults(result.content.results.organic, limit);
        } else if (result.content && result.content.bestsellers) {
          // Amazon bestsellers response format (fallback)
          console.log('Using parsed results from amazon_bestsellers');
          console.log(`Found ${result.content.bestsellers.length} bestseller items`);
          books = this.parseAmazonBestsellerResults(result.content.bestsellers, limit);
        } else if (result.content && result.content.products) {
          // Alternative products array format
          console.log('Found products array, parsing as search results');
          books = this.parseAmazonSearchResults(result.content.products, limit);
        } else {
          console.log('Unexpected response format');
          console.log('Response content keys:', Object.keys(result.content || {}));
          console.log('Response content sample:', JSON.stringify(result.content, null, 2).substring(0, 500));
        }
        
        if (books.length > 0) {
          console.log(`✅ Successfully scraped ${books.length} REAL Amazon books from ${category}`);
          return books;
        } else {
          console.log(`❌ No real Amazon books found - Oxylabs may not be working properly`);
          throw new Error(`No real Amazon books found for ${category}. Check Oxylabs connection.`);
        }
      } else {
        console.log(`❌ Invalid response structure from Oxylabs`);
        console.log('Response data:', JSON.stringify(response.data, null, 2));
        throw new Error(`Invalid Oxylabs response for ${category}. No real Amazon data available.`);
      }
    } catch (error) {
      console.error(`Scraping failed:`, error.response?.data || error.message);
      
      // Log job ID if available for Oxylabs support
      if (error.response?.data?.job_id) {
        console.error(`Oxylabs Job ID: ${error.response.data.job_id}`);
        console.error(`Use this Job ID when contacting Oxylabs support about Amazon URL restrictions`);
      }
      
      console.log(`❌ Oxylabs failed for ${category} - NO FALLBACK TO DEMO DATA`);
      throw error; // Re-throw - we want ONLY real Amazon data
    }
  }

  generateRealisticDemoBooks(category, limit) {
    // Enhanced demo books with better cover URLs and more categories
    const baseBooks = this.getGenericBooks(category);
    const books = [];
    
    for (let i = 0; i < Math.min(limit, 20); i++) {
      const baseIndex = i % baseBooks.length;
      const book = baseBooks[baseIndex];
      
      books.push({
        rank: i + 1,
        title: `${book.title}${i > baseBooks.length - 1 ? ` (${Math.floor(i/baseBooks.length) + 1})` : ''}`,
        author: book.author,
        coverUrl: `https://picsum.photos/300/400?random=${Date.now() + i}`, // Unique images
        price: book.price,
        rating: book.rating,
        reviewsCount: Math.floor(Math.random() * 10000) + 100,
        isBestSeller: i < 5, // Top 5 are bestsellers
        trendingScore: 100 - (i * 2) // Decreasing score by rank
      });
    }
    
    console.log(`Generated ${books.length} demo books for ${category}`);
    return books;
  }

  getGenericBooks(category) {
    const bookTemplates = {
      'romance': [
        { title: "Hearts Entwined", author: "Sarah Mitchell", price: "$14.99", rating: "4.5 out of 5 stars" },
        { title: "Love's Promise", author: "Emma Thompson", price: "$12.99", rating: "4.2 out of 5 stars" },
        { title: "Forever Yours", author: "Jessica Parker", price: "$13.99", rating: "4.4 out of 5 stars" },
        { title: "Passionate Dreams", author: "Rachel Stone", price: "$15.99", rating: "4.3 out of 5 stars" },
        { title: "Summer Romance", author: "Claire Davis", price: "$11.99", rating: "4.1 out of 5 stars" }
      ],
      'mystery-thriller': [
        { title: "The Silent Witness", author: "David Black", price: "$16.99", rating: "4.4 out of 5 stars" },
        { title: "Murder at Midnight", author: "Helen Cross", price: "$15.99", rating: "4.3 out of 5 stars" },
        { title: "The Last Clue", author: "Michael Grey", price: "$14.99", rating: "4.5 out of 5 stars" },
        { title: "Dark Secrets", author: "Anna White", price: "$13.99", rating: "4.2 out of 5 stars" },
        { title: "The Missing Hour", author: "Tom Rivers", price: "$17.99", rating: "4.6 out of 5 stars" }
      ],
      'science-fiction': [
        { title: "Galactic Empire", author: "Alex Nova", price: "$18.99", rating: "4.4 out of 5 stars" },
        { title: "Mars Colony Alpha", author: "Luna Sterling", price: "$16.99", rating: "4.3 out of 5 stars" },
        { title: "The Time Paradox", author: "Jack Cosmic", price: "$15.99", rating: "4.5 out of 5 stars" },
        { title: "Robot Revolution", author: "Cyra Tech", price: "$14.99", rating: "4.2 out of 5 stars" },
        { title: "Quantum Dreams", author: "Nova Star", price: "$17.99", rating: "4.6 out of 5 stars" }
      ],
      'fantasy': [
        { title: "Dragon's Crown", author: "Aria Mystical", price: "$16.99", rating: "4.5 out of 5 stars" },
        { title: "The Enchanted Realm", author: "Elven Moon", price: "$15.99", rating: "4.3 out of 5 stars" },
        { title: "Sword of Legends", author: "Magnus Storm", price: "$17.99", rating: "4.4 out of 5 stars" },
        { title: "The Magic Within", author: "Crystal Sage", price: "$14.99", rating: "4.2 out of 5 stars" },
        { title: "Kingdom of Shadows", author: "Dark Phoenix", price: "$18.99", rating: "4.6 out of 5 stars" }
      ]
    };
    
    // Return books for the category, or default to romance
    return bookTemplates[category] || bookTemplates['romance'];
  }

  generateDemoBooks(category, limit) {
    const sampleBooks = {
      'romance': [
        {
          rank: 1,
          title: "It Ends with Us",
          author: "Colleen Hoover",
          coverUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop&crop=center",
          price: "$16.99",
          rating: "4.4 out of 5 stars"
        },
        {
          rank: 2,
          title: "Book Lovers",
          author: "Emily Henry",
          coverUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop&crop=center",
          price: "$14.99",
          rating: "4.2 out of 5 stars"
        },
        {
          rank: 3,
          title: "The Seven Husbands of Evelyn Hugo",
          author: "Taylor Jenkins Reid",
          coverUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop&crop=center",
          price: "$15.99",
          rating: "4.6 out of 5 stars"
        }
      ],
      'mystery-thriller': [
        {
          rank: 1,
          title: "The Thursday Murder Club",
          author: "Richard Osman",
          coverUrl: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=300&h=400&fit=crop&crop=center",
          price: "$15.99",
          rating: "4.5 out of 5 stars"
        },
        {
          rank: 2,
          title: "Gone Girl",
          author: "Gillian Flynn",
          coverUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop&crop=center",
          price: "$14.99",
          rating: "4.0 out of 5 stars"
        }
      ]
    };

    const books = sampleBooks[category] || sampleBooks['romance'];
    return books.slice(0, Math.min(limit, books.length));
  }

  async makeOxylabsRequest(category) {
    // Check if we have valid credentials
    if (!this.oxylabsAuth.username || !this.oxylabsAuth.password) {
      console.log('Missing Oxylabs credentials, using demo data');
      throw new Error('Oxylabs credentials not configured');
    }

    const categoryInfo = this.categories[category];
    if (!categoryInfo) {
      throw new Error(`Unknown category: ${category}`);
    }
    
    // Use amazon_bestsellers source with category ID for reliable results
    const payload = {
      source: 'amazon_bestsellers',
      domain: 'com',
      query: categoryInfo.id,
      parse: true, // Let Oxylabs parse the bestsellers for us
      pages: 1
    };
    
    console.log(`Oxylabs bestseller request for ${category} (ID: ${categoryInfo.id})`);
    console.log('Oxylabs request:', JSON.stringify(payload, null, 2));
    
    return await this.makeHttpRequest(payload);
  }

  async makeHttpRequest(payload) {
    try {
      const config = {
        method: 'post',
        url: 'https://realtime.oxylabs.io/v1/queries',
        auth: this.oxylabsAuth,
        headers: {
          'Content-Type': 'application/json'
        },
        data: payload,
        timeout: 25000 // 25 second timeout for Vercel
      };
      
      return await axios(config);
    } catch (error) {
      console.error(`HTTP request failed:`, error.response?.data || error.message);
      throw error;
    }
  }
  
  getCategoryQuery(category) {
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
      'romantic-suspense': 'romantic suspense kindle books bestseller',
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
      'apocalyptic-sci-fi': 'kindle apocalyptic post apocalyptic bestsellers',
      
      // Teen & Young Adult
      'teen-young-adult': 'kindle teen young adult bestsellers',
      'ya-fantasy': 'kindle YA fantasy bestsellers',
      'ya-romance': 'kindle YA romance bestsellers',
      'ya-science-fiction': 'kindle YA science fiction bestsellers',
      'ya-dystopian': 'kindle YA dystopian bestsellers',
      'ya-paranormal': 'kindle YA paranormal bestsellers',
      'ya-contemporary': 'kindle YA contemporary bestsellers',
      
      // Literary & General Fiction
      'literary-fiction': 'kindle literary fiction bestsellers',
      'contemporary-fiction': 'kindle contemporary fiction bestsellers',
      'historical-fiction': 'kindle historical fiction bestsellers',
      'women-fiction': 'kindle women fiction bestsellers',
      'family-saga': 'kindle family saga bestsellers',
      'psychological-fiction': 'kindle psychological fiction bestsellers',
      'upmarket-fiction': 'kindle upmarket fiction bestsellers',
      
      // Horror & Supernatural
      'horror': 'kindle horror bestsellers',
      'paranormal': 'kindle paranormal bestsellers',
      'supernatural': 'kindle supernatural bestsellers',
      'gothic': 'kindle gothic bestsellers',
      'occult-horror': 'kindle occult horror bestsellers',
      'vampire': 'kindle vampire bestsellers',
      'werewolves-shapeshifters': 'kindle werewolf shapeshifter bestsellers',
      
      // Action & Adventure
      'action-adventure': 'kindle action adventure bestsellers',
      'war-military': 'kindle war military bestsellers',
      'sea-adventures': 'kindle sea adventure bestsellers',
      'spy-thrillers': 'kindle spy thriller bestsellers',
      'adventure-fiction': 'kindle adventure fiction bestsellers',
      
      // Non-Fiction
      'business': 'kindle business bestsellers',
      'self-help': 'kindle self help bestsellers',
      'biography': 'kindle biography bestsellers',
      'health-fitness': 'kindle health fitness bestsellers',
      'cooking': 'kindle cookbook bestsellers',
      'history': 'kindle history bestsellers',
      'politics': 'kindle politics bestsellers'
    };
    
    return queries[category] || `kindle ${category.replace(/-/g, ' ')} bestsellers`;
  }

  getBestsellerUrl(category) {
    const categoryInfo = this.categories[category];
    if (!categoryInfo) {
      throw new Error(`Unknown category: ${category}`);
    }
    
    // Generate direct Amazon bestseller page URL
    return `https://www.amazon.com/Best-Sellers-Kindle-Store/zgbs/digital-text/${categoryInfo.id}`;
  }


  parseAmazonBestsellerResults(bestsellerResults, limit) {
    const books = [];
    
    bestsellerResults.slice(0, limit).forEach((item, index) => {
      try {
        // Extract data from amazon_bestsellers structured response
        const title = item.title || '';
        const author = item.author || '';
        const price = item.price_str || (item.price ? `$${item.price}` : '');
        const rating = item.rating || '';
        const position = item.pos || (index + 1);
        
        // Try multiple possible image field names from Oxylabs bestseller results
        const imageUrl = item.image_url || 
                         item.image || 
                         item.thumbnail || 
                         item.img_url ||
                         item.cover_image ||
                         '';
        
        const url = item.url || '';
        const asin = item.asin || '';
        const reviewsCount = item.ratings_count || item.review_count || 0;
        const currency = item.currency || 'USD';
        const isPrime = item.is_prime || false;
        
        console.log(`Parsing bestseller ${position}:`, {
          title: title.substring(0, 50),
          author,
          price,
          hasImage: !!imageUrl,
          imageUrl: imageUrl ? imageUrl.substring(0, 60) + '...' : 'NO IMAGE',
          reviewsCount,
          rating,
          position
        });
        
        // ONLY accept books with real Amazon images - no placeholders!
        if (title && imageUrl && (imageUrl.includes('amazon') || imageUrl.includes('ssl-images-amazon') || imageUrl.includes('m.media-amazon'))) {
          books.push({
            rank: position, // Use Amazon's bestseller position directly
            title: title.trim(),
            author: author ? author.trim() : '',
            coverUrl: this.getHighResImage(imageUrl),
            price: price,
            rating: rating ? `${rating} out of 5 stars` : '',
            amazonUrl: url.includes('amazon.com') ? url : `https://amazon.com${url}`,
            reviewsCount: reviewsCount,
            isBestSeller: true, // All items from bestseller page are bestsellers
            trendingScore: Math.max(0, 100 - (position * 2)), // Higher score for better rank
            asin: asin,
            currency: currency,
            isPrime: isPrime
          });
          console.log(`✅ Added bestseller #${position} with real Amazon image: ${title}`);
        } else {
          console.log(`❌ Skipped bestseller - missing image or not Amazon: ${title}`);
        }
      } catch (error) {
        console.error('Error parsing bestseller result item:', error);
      }
    });
    
    // Keep Amazon's bestseller order - don't re-sort
    console.log(`✅ Keeping Amazon's exact bestseller order for ${books.length} books`);
    
    return books;
  }

  parseAmazonSearchResults(organicResults, limit) {
    const books = [];
    
    organicResults.slice(0, limit).forEach((item, index) => {
      try {
        // Extract data from amazon_search structured response
        const title = item.title || '';
        const author = item.manufacturer || item.author || item.author_name || item.brand || '';
        const price = item.price ? `$${item.price}` : item.price_str || '';
        const rating = item.rating || '';
        
        // Try multiple possible image field names from Oxylabs
        const imageUrl = item.url_image || 
                         item.image || 
                         item.image_url || 
                         item.thumbnail || 
                         item.img_url ||
                         item.cover_image ||
                         item.product_image ||
                         '';
        
        const url = item.url || item.link || '';
        const asin = item.asin || '';
        const reviewsCount = item.reviews_count || item.review_count || 0;
        const salesVolume = item.sales_volume || '';
        const isBestSeller = item.best_seller || item.is_bestseller || false;
        const isAmazonsChoice = item.is_amazons_choice || item.amazons_choice || false;
        const pricingCount = item.pricing_count || 0;
        
        // Calculate trending score for better ranking
        const trendingScore = this.calculateTrendingScore({
          rating,
          reviewsCount,
          isBestSeller,
          isAmazonsChoice,
          salesVolume,
          searchPosition: index + 1
        });
        
        // Boost score for items that appear early in search results (likely bestsellers)
        const bestsellerBoost = Math.max(0, 20 - (index * 2));

        // Try to extract ABSR (Amazon Best Sellers Rank) if available
        const absr = item.best_sellers_rank || item.sales_rank || item.rank || null;
        
        console.log(`Parsing item ${index + 1}:`, {
          title: title.substring(0, 50),
          author,
          price,
          hasImage: !!imageUrl,
          imageUrl: imageUrl ? imageUrl.substring(0, 60) + '...' : 'NO IMAGE',
          reviewsCount,
          rating,
          isBestSeller,
          isAmazonsChoice,
          absr,
          trendingScore
        });
        
        // ONLY accept books with real Amazon images - no placeholders!
        if (title && imageUrl && (imageUrl.includes('amazon') || imageUrl.includes('ssl-images-amazon') || imageUrl.includes('m.media-amazon'))) {
          books.push({
            rank: index + 1,
            title: title.trim(),
            author: author ? author.trim() : '',
            coverUrl: this.getHighResImage(imageUrl),
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
          console.log(`✅ Added book with real Amazon image: ${title}`);
        } else {
          console.log(`❌ Skipped book - missing image or not Amazon: ${title}`);
        }
      } catch (error) {
        console.error('Error parsing search result item:', error);
      }
    });
    
    // Keep Amazon's search result order for bestsellers - don't re-sort
    // Amazon's "featured" sort already gives us bestseller order
    console.log(`✅ Keeping Amazon's bestseller order for ${books.length} books`);
    
    return books;
  }
  
  calculateTrendingScore(data) {
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

  parseBooks(html, limit) {
    const $ = cheerio.load(html);
    const books = [];

    console.log('Looking for bestseller elements in HTML...');
    
    // Try multiple selectors for Amazon bestseller pages (they change structure frequently)
    const selectors = [
      '#gridItemRoot .zg_itemImmersion',
      '#gridItemRoot .zg-item-immersion', 
      '[data-testid="product-tile"]',
      '.s-result-item',
      '.zg-ordered-list .zg-item-immersion',
      '.zg_itemRow',
      '.a-carousel-card'
    ];
    
    let $elements = $();
    for (const selector of selectors) {
      $elements = $(selector);
      if ($elements.length > 0) {
        console.log(`Found ${$elements.length} elements with selector: ${selector}`);
        break;
      }
    }
    
    if ($elements.length === 0) {
      console.log('No bestseller elements found, trying fallback parsing...');
      // Log some of the HTML structure for debugging
      console.log('Page title:', $('title').text());
      console.log('Available selectors:', Object.keys($._root.children).slice(0, 10));
    }

    $elements.slice(0, limit).each((index, element) => {
      const $el = $(element);
      
      try {
        // Extract rank - try multiple approaches
        let rank = parseInt($el.find('.zg_rankNumber, .zg-rank, [data-testid="rank"]').text().replace(/[^\d]/g, '')) || (index + 1);
        
        // Extract title - try multiple selectors
        const title = $el.find('.p13n-sc-truncated, .a-size-mini .a-link-normal, .a-size-base-plus, h3 a, [data-testid="title"]').first().text().trim() ||
                     $el.find('a:not(:has(img))').first().text().trim();
        
        // Extract author - try multiple selectors
        const author = $el.find('.a-size-small .a-link-child, .a-row .a-size-small a, [data-testid="author"]').first().text().trim() ||
                      $el.find('span[class*="author"]').first().text().trim();
        
        // Extract cover image - try multiple approaches
        const coverUrl = $el.find('img').first().attr('src') || 
                         $el.find('img').first().attr('data-src') ||
                         $el.find('.imgTagWrapper img, .s-image').first().attr('src');
        
        // Extract price - try multiple selectors
        const priceElement = $el.find('.a-price .a-offscreen, .a-price-whole, [data-testid="price"]').first();
        const price = priceElement.length ? priceElement.text().trim() : 
                     $el.find('.a-color-price').first().text().trim();
        
        // Extract rating - try multiple selectors
        const rating = $el.find('.a-icon-alt, [data-testid="rating"]').first().text().trim();
        
        // Extract additional metadata
        const amazonUrl = $el.find('a[href]').first().attr('href') || '';

        console.log(`Parsing item ${index + 1}:`, {
          rank,
          title: title.substring(0, 50),
          author: author.substring(0, 30),
          hasImage: !!coverUrl,
          hasPrice: !!price,
          hasRating: !!rating
        });

        // Only include books with real Amazon images and titles
        if (title && coverUrl && (coverUrl.includes('amazon') || coverUrl.includes('ssl-images-amazon') || coverUrl.includes('m.media-amazon'))) {
          books.push({
            rank,
            title: title.trim(),
            author: author.trim() || 'Unknown Author',
            coverUrl: this.getHighResImage(coverUrl),
            price: price.trim() || 'Price not available',
            rating: rating.trim() || 'Rating not available',
            amazonUrl: amazonUrl,
            reviewsCount: 0, // Could be extracted if needed
            isBestSeller: true, // All items from bestseller page are bestsellers
            trendingScore: Math.max(0, 100 - (rank * 2)) // Higher score for better rank
          });
          
          console.log(`✅ Added bestseller #${rank}: ${title.substring(0, 50)} by ${author}`);
        } else {
          console.log(`❌ Skipped item - missing required data: title=${!!title}, image=${!!coverUrl}, isAmazonImage=${coverUrl ? coverUrl.includes('amazon') : false}`);
        }
      } catch (error) {
        console.error(`Error parsing book at index ${index}:`, error);
      }
    });

    console.log(`Parsed ${books.length} books from bestseller page`);
    return books;
  }

  getHighResImage(imageUrl) {
    if (!imageUrl) return null;
    
    // Convert Amazon image URL to higher resolution
    return imageUrl
      .replace(/\._[A-Z0-9,_]+_\./, '._SL500_.')
      .replace(/\._[A-Z0-9,_]+\./, '._SL500_.');
  }

  getAvailableCategories() {
    return Object.keys(this.categories);
  }
}

export default KindleScraper;