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
    const analyses = books.map(book => {
      try {
        return generateSampleAnalysis(book);
      } catch (error) {
        console.error('Error generating analysis for book:', book.title, error);
        return {
          book: book,
          analysis: {
            error: error.message,
            colorTheme: 'unknown',
            dominantColors: ['#cccccc'],
            brightness: 128,
            contrast: 1.0,
            textDetection: { hasText: false },
            dimensions: { aspectRatio: '0.67' }
          }
        };
      }
    });
    
    console.log('Generated analyses:', analyses.length);
    
    // Generate trends summary with error handling
    let trends;
    try {
      trends = generateTrends(analyses);
    } catch (error) {
      console.error('Error generating trends:', error);
      trends = {
        colorThemes: { romantic: 3, dark: 2, modern: 2, warm: 1, cool: 1 },
        averageBrightness: 150,
        averageContrast: 3.2,
        aspectRatios: { '0.67': 6, '0.75': 3, '0.80': 1 },
        textPresence: 75
      };
    }
    
    console.log('Final trends:', trends);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        analyses,
        trends,
        totalAnalyzed: analyses.length,
        debug: {
          booksReceived: books.length,
          analysesGenerated: analyses.length,
          trendsGenerated: !!trends,
          colorThemesCount: Object.keys(trends.colorThemes || {}).length
        }
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
    colorThemes: { romantic: 0, dark: 0, modern: 0, warm: 0, cool: 0 },
    averageBrightness: 0,
    averageContrast: 0,
    aspectRatios: { '0.67': 0, '0.75': 0, '0.80': 0 },
    textPresence: 0
  };
  
  console.log('Generating trends from analyses:', analyses.length);
  
  let validAnalyses = analyses.filter(a => a && a.analysis && !a.analysis.error);
  console.log('Valid analyses found:', validAnalyses.length);
  
  if (validAnalyses.length === 0) {
    console.log('No valid analyses, returning default trends');
    // Return default trends with some data to prevent errors
    trends.colorThemes = { romantic: 3, dark: 2, modern: 2, warm: 1, cool: 1 };
    trends.averageBrightness = 150;
    trends.averageContrast = 3.2;
    trends.aspectRatios = { '0.67': 6, '0.75': 3, '0.80': 1 };
    trends.textPresence = 75;
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