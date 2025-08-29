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
    
    console.log(`Returning sample books for ${category} with limit ${limit}`);
    
    // Return varied sample data based on category
    const sampleBooks = generateSampleBooks(category, limit);
    
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

function generateSampleBooks(category, limit) {
  const baseBooks = {
    'romance': [
      { title: "Heart's Desire", author: "Sarah Johnson", image: "https://via.placeholder.com/300x400/ff69b4/ffffff?text=Romance+1", price: "$3.99", rank: 1 },
      { title: "Love's Promise", author: "Emma Wilson", image: "https://via.placeholder.com/300x400/ff1493/ffffff?text=Romance+2", price: "$2.99", rank: 2 },
      { title: "Passionate Nights", author: "Lisa Brown", image: "https://via.placeholder.com/300x400/dc143c/ffffff?text=Romance+3", price: "$4.99", rank: 3 }
    ],
    'mystery-thriller': [
      { title: "Dark Secrets", author: "John Smith", image: "https://via.placeholder.com/300x400/1a1a1a/ffffff?text=Mystery+1", price: "$4.99", rank: 1 },
      { title: "The Last Witness", author: "Mike Davis", image: "https://via.placeholder.com/300x400/2f2f2f/ffffff?text=Mystery+2", price: "$3.99", rank: 2 },
      { title: "Blood Trail", author: "Kate Miller", image: "https://via.placeholder.com/300x400/800000/ffffff?text=Mystery+3", price: "$5.99", rank: 3 }
    ],
    'science-fiction': [
      { title: "Galactic War", author: "Alex Chen", image: "https://via.placeholder.com/300x400/0066cc/ffffff?text=SciFi+1", price: "$2.99", rank: 1 },
      { title: "Time Paradox", author: "Dr. Kim Lee", image: "https://via.placeholder.com/300x400/4169e1/ffffff?text=SciFi+2", price: "$4.99", rank: 2 },
      { title: "Robot Revolution", author: "Tom Anderson", image: "https://via.placeholder.com/300x400/00ced1/000000?text=SciFi+3", price: "$3.99", rank: 3 }
    ]
  };
  
  const books = baseBooks[category] || baseBooks['romance'];
  return books.slice(0, Math.min(limit, books.length));
}