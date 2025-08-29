export async function handler(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Get Oxylabs credentials
    const oxylabsAuth = {
      username: process.env.OXYLABS_USERNAME,
      password: process.env.OXYLABS_PASSWORD
    };

    console.log('Testing Oxylabs connection...');
    console.log('Has username:', !!oxylabsAuth.username);
    console.log('Has password:', !!oxylabsAuth.password);

    if (!oxylabsAuth.username || !oxylabsAuth.password) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Oxylabs credentials not configured',
          debug: {
            hasUsername: !!oxylabsAuth.username,
            hasPassword: !!oxylabsAuth.password
          }
        })
      };
    }

    // Simple test payload - just get Google
    const payload = {
      source: 'google',
      url: 'https://www.google.com',
      geo_location: 'United States'
    };

    console.log('Making test request to Oxylabs...');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout for test

    const response = await fetch('https://realtime.oxylabs.io/v1/queries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${oxylabsAuth.username}:${oxylabsAuth.password}`)
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Error response body:', errorText);
      throw new Error(`Oxylabs API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Oxylabs response keys:', Object.keys(result));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Oxylabs connection successful',
        debug: {
          responseStatus: response.status,
          hasContent: !!result.content,
          contentLength: result.content ? result.content.length : 0,
          responseKeys: Object.keys(result)
        }
      })
    };

  } catch (error) {
    console.error('Test error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message,
        errorType: error.name,
        debug: {
          isAbortError: error.name === 'AbortError',
          timestamp: new Date().toISOString()
        }
      })
    };
  }
}