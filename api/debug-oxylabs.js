// Debug endpoint to check Oxylabs response format
async function loadKindleScraper() {
  const { default: KindleScraper } = await import('../src/scrapers/kindle-scraper.js');
  return KindleScraper;
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { category = 'romance' } = req.query;
    
    console.log('=== OXYLABS DEBUG ===');
    console.log('Environment check:');
    console.log('OXYLABS_USERNAME:', process.env.OXYLABS_USERNAME ? `SET (${process.env.OXYLABS_USERNAME.substring(0, 4)}***)` : 'NOT SET');
    console.log('OXYLABS_PASSWORD:', process.env.OXYLABS_PASSWORD ? `SET (${process.env.OXYLABS_PASSWORD.length} chars)` : 'NOT SET');
    
    // Test credentials first with a simple request
    if (!process.env.OXYLABS_USERNAME || !process.env.OXYLABS_PASSWORD) {
      return res.json({
        error: 'Oxylabs credentials not configured',
        hasUsername: !!process.env.OXYLABS_USERNAME,
        hasPassword: !!process.env.OXYLABS_PASSWORD,
        message: 'Please set OXYLABS_USERNAME and OXYLABS_PASSWORD environment variables in Vercel'
      });
    }
    
    const KindleScraper = await loadKindleScraper();
    const scraper = new KindleScraper();
    
    // Get the category info
    const categoryInfo = scraper.categories[category];
    console.log('Category info:', categoryInfo);
    
    // Try to make a simple Oxylabs request
    const payload = {
      source: 'amazon_bestsellers',
      domain: 'com',
      query: categoryInfo.id,
      parse: true,
      pages: 1
    };
    
    console.log('Payload:', JSON.stringify(payload, null, 2));
    
    let response;
    try {
      response = await scraper.makeHttpRequest(payload);
      console.log('Response received!');
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.keys(response.headers || {}));
      
      if (response.data) {
        console.log('Response data keys:', Object.keys(response.data));
        
        if (response.data.results && response.data.results[0]) {
          const result = response.data.results[0];
          console.log('First result keys:', Object.keys(result));
          
          if (result.content) {
            console.log('Content keys:', Object.keys(result.content));
            console.log('Content type:', typeof result.content);
            
            // Log the results array specifically
            if (result.content.results) {
              console.log('Results array length:', result.content.results.length);
              if (result.content.results.length > 0) {
                console.log('First result sample:', JSON.stringify(result.content.results[0], null, 2));
              }
            }
            
            // Log a sample of the content
            if (typeof result.content === 'string') {
              console.log('Content sample (first 500 chars):', result.content.substring(0, 500));
            } else {
              console.log('Content structure (limited):', JSON.stringify({
                ...result.content,
                results: result.content.results ? `Array(${result.content.results.length})` : 'none'
              }, null, 2));
            }
          }
        }
      }
    } catch (oxylabsError) {
      console.error('Oxylabs request failed:', oxylabsError.message);
      if (oxylabsError.response) {
        console.error('Error status:', oxylabsError.response.status);
        console.error('Error data:', JSON.stringify(oxylabsError.response.data, null, 2));
      }
      
      return res.json({
        error: 'Oxylabs request failed',
        details: oxylabsError.message,
        status: oxylabsError.response?.status,
        data: oxylabsError.response?.data
      });
    }
    
    // Return debug info
    res.json({
      success: true,
      category,
      categoryInfo,
      payload,
      hasResponse: !!response,
      responseStatus: response?.status,
      hasData: !!response?.data,
      hasResults: !!(response?.data?.results),
      resultCount: response?.data?.results?.length || 0,
      firstResultKeys: response?.data?.results?.[0] ? Object.keys(response.data.results[0]) : [],
      contentType: response?.data?.results?.[0]?.content ? typeof response.data.results[0].content : 'none',
      contentKeys: response?.data?.results?.[0]?.content && typeof response.data.results[0].content === 'object' 
        ? Object.keys(response.data.results[0].content) : []
    });
    
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ 
      error: 'Debug failed',
      message: error.message,
      stack: error.stack
    });
  }
}