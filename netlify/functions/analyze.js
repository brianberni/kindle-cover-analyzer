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
    const requestBody = JSON.parse(event.body || '{}');
    const { books } = requestBody;
    
    if (!books || !Array.isArray(books)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Books array is required' })
      };
    }

    console.log(`Analyzing ${books.length} book covers`);
    
    // Generate sample analyses for each book
    const analyses = books.map(book => generateSampleAnalysis(book));
    
    // Generate trends summary
    const trends = generateTrends(analyses);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        analyses,
        trends,
        totalAnalyzed: analyses.length
      })
    };
    
  } catch (error) {
    console.error('Analysis function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
}

function generateSampleAnalysis(book) {
  const themes = ['romantic', 'dark', 'modern', 'warm', 'cool', 'mysterious'];
  const colors = ['#ff69b4', '#1a1a1a', '#0066cc', '#dc143c', '#4169e1', '#800000'];
  
  return {
    book: book,
    analysis: {
      colorTheme: themes[Math.floor(Math.random() * themes.length)],
      dominantColors: [colors[Math.floor(Math.random() * colors.length)]],
      brightness: Math.floor(Math.random() * 255),
      contrast: Math.random() * 5,
      textDetection: { hasText: Math.random() > 0.3 },
      dimensions: { aspectRatio: ['0.67', '0.75', '0.80'][Math.floor(Math.random() * 3)] }
    }
  };
}

function generateTrends(analyses) {
  const trends = {
    colorThemes: {},
    averageBrightness: 0,
    averageContrast: 0,
    aspectRatios: {},
    textPresence: 0
  };
  
  let validAnalyses = analyses.filter(a => a.analysis && !a.analysis.error);
  
  if (validAnalyses.length === 0) {
    return trends;
  }
  
  // Count color themes
  validAnalyses.forEach(analysis => {
    const theme = analysis.analysis.colorTheme;
    trends.colorThemes[theme] = (trends.colorThemes[theme] || 0) + 1;
  });
  
  // Calculate averages
  const totalBrightness = validAnalyses.reduce((sum, a) => sum + (a.analysis.brightness || 0), 0);
  trends.averageBrightness = Math.round(totalBrightness / validAnalyses.length);
  
  const totalContrast = validAnalyses.reduce((sum, a) => sum + (a.analysis.contrast || 0), 0);
  trends.averageContrast = Math.round((totalContrast / validAnalyses.length) * 100) / 100;
  
  // Count aspect ratios
  validAnalyses.forEach(analysis => {
    const ratio = analysis.analysis.dimensions?.aspectRatio;
    if (ratio) {
      trends.aspectRatios[ratio] = (trends.aspectRatios[ratio] || 0) + 1;
    }
  });
  
  // Calculate text presence percentage
  const withText = validAnalyses.filter(a => a.analysis.textDetection?.hasText).length;
  trends.textPresence = Math.round((withText / validAnalyses.length) * 100);
  
  return trends;
}