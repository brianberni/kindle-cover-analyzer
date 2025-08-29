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
    // For now, return sample book data since scraping is complex to set up
    const category = event.queryStringParameters?.category || 'romance';
    const limit = parseInt(event.queryStringParameters?.limit) || 20;
    
    const sampleBooks = [
      {
        title: "Sample Romance Novel",
        author: "Jane Doe", 
        image: "https://via.placeholder.com/300x400/ff69b4/ffffff?text=Romance",
        price: "$3.99",
        rank: 1
      },
      {
        title: "Mystery Thriller Book",
        author: "John Smith",
        image: "https://via.placeholder.com/300x400/1a1a1a/ffffff?text=Mystery", 
        price: "$4.99",
        rank: 2
      },
      {
        title: "Sci-Fi Adventure",
        author: "Alex Johnson",
        image: "https://via.placeholder.com/300x400/0066cc/ffffff?text=SciFi",
        price: "$2.99", 
        rank: 3
      }
    ];
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        category,
        count: sampleBooks.length,
        books: sampleBooks 
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