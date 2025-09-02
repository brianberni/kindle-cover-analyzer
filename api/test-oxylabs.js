export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: {
        OXYLABS_USERNAME: process.env.OXYLABS_USERNAME ? 'SET ✓' : 'NOT SET ✗',
        OXYLABS_PASSWORD: process.env.OXYLABS_PASSWORD ? 'SET ✓' : 'NOT SET ✗',
        NODE_ENV: process.env.NODE_ENV || 'unknown'
      },
      oxylabsTest: null,
      error: null
    };

    // Test Oxylabs connection if credentials are available
    if (process.env.OXYLABS_USERNAME && process.env.OXYLABS_PASSWORD) {
      try {
        const axios = (await import('axios')).default;
        
        const payload = {
          source: 'amazon_search',
          query: 'kindle romance bestsellers',
          domain: 'com',
          start_page: 1,
          pages: 1,
          parse: true,
          context: [
            {
              key: 'sort_by',
              value: 'featured'
            },
            {
              key: 'currency', 
              value: 'USD'
            }
          ]
        };

        console.log('Testing Oxylabs with payload:', payload);

        const response = await axios({
          method: 'post',
          url: 'https://realtime.oxylabs.io/v1/queries',
          auth: {
            username: process.env.OXYLABS_USERNAME,
            password: process.env.OXYLABS_PASSWORD
          },
          headers: {
            'Content-Type': 'application/json'
          },
          data: payload,
          timeout: 20000
        });

        debugInfo.oxylabsTest = {
          status: response.status,
          hasResults: !!response.data?.results,
          resultsCount: response.data?.results?.length || 0,
          hasContent: !!(response.data?.results?.[0]?.content),
          jobId: response.data?.job_id || null
        };

        // If we have results, let's examine the structure for images
        if (response.data?.results?.[0]?.content) {
          const content = response.data.results[0].content;
          debugInfo.contentStructure = {
            keys: Object.keys(content),
            hasResults: !!content.results,
            resultsKeys: content.results ? Object.keys(content.results) : null
          };

          if (content.results?.organic && content.results.organic.length > 0) {
            const firstOrganic = content.results.organic[0];
            debugInfo.sampleOrganic = {
              keys: Object.keys(firstOrganic),
              title: firstOrganic.title?.substring(0, 50) + '...' || 'No title',
              hasImage: !!firstOrganic.url_image || !!firstOrganic.image || !!firstOrganic.thumbnail,
              imageFields: {
                url_image: firstOrganic.url_image ? 'FOUND' : 'missing',
                image: firstOrganic.image ? 'FOUND' : 'missing', 
                thumbnail: firstOrganic.thumbnail ? 'FOUND' : 'missing',
                img_url: firstOrganic.img_url ? 'FOUND' : 'missing'
              }
            };
          }
        }

        console.log('Oxylabs response:', debugInfo.oxylabsTest);

      } catch (oxylabsError) {
        console.error('Oxylabs test failed:', oxylabsError.message);
        debugInfo.error = {
          message: oxylabsError.message,
          code: oxylabsError.code || null,
          status: oxylabsError.response?.status || null,
          data: oxylabsError.response?.data || null
        };
      }
    } else {
      debugInfo.error = 'Missing Oxylabs credentials in environment variables';
    }

    res.json(debugInfo);

  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}