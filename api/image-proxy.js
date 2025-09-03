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
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL parameter required' });
    }

    // Validate it's an Amazon image URL for security
    if (!url.includes('amazon.com') && !url.includes('amazonaws.com') && !url.includes('m.media-amazon')) {
      return res.status(403).json({ error: 'Only Amazon image URLs allowed' });
    }

    console.log('Proxying image:', url);

    // Try multiple user agents and retry logic
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15'
    ];

    let response;
    let lastError;

    // Try up to 3 different user agents
    for (let i = 0; i < Math.min(3, userAgents.length); i++) {
      try {
        const userAgent = userAgents[i];
        console.log(`Attempt ${i + 1} with user agent: ${userAgent.substring(0, 50)}...`);
        
        response = await fetch(url, {
          headers: {
            'User-Agent': userAgent,
            'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Sec-Fetch-Dest': 'image',
            'Sec-Fetch-Mode': 'no-cors',
            'Sec-Fetch-Site': 'cross-site',
            'Referer': 'https://www.amazon.com/'
          },
          timeout: 10000 // 10 second timeout
        });

        if (response.ok) {
          console.log(`✅ Success with attempt ${i + 1}`);
          break;
        } else {
          lastError = `HTTP ${response.status}: ${response.statusText}`;
          console.log(`❌ Attempt ${i + 1} failed: ${lastError}`);
        }
      } catch (error) {
        lastError = error.message;
        console.log(`❌ Attempt ${i + 1} error: ${lastError}`);
        
        // Add delay between retries
        if (i < 2) {
          await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        }
      }
    }

    if (!response || !response.ok) {
      console.error(`All attempts failed. Last error: ${lastError}`);
      return res.status(404).json({ error: 'Failed to fetch image after multiple attempts', details: lastError });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const imageBuffer = await response.arrayBuffer();

    // Set appropriate headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.setHeader('Content-Length', imageBuffer.byteLength);

    // Send the image
    res.send(Buffer.from(imageBuffer));

  } catch (error) {
    console.error('Image proxy error:', error);
    res.status(500).json({ 
      error: 'Failed to proxy image',
      details: error.message 
    });
  }
}