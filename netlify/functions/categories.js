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
    console.log('Categories function called - returning full category tree');
    
    // Full category tree from KindleScraper
    const categories = getKindleCategories();
    
    console.log(`Returning ${categories.length} categories`);
    
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

function getKindleCategories() {
  const categories = {
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

  return Object.keys(categories);
}