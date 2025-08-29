import express from 'express';
import EnhancedCoverAnalyzer from '../analysis/enhanced-analyzer.js';

const router = express.Router();
const analyzer = new EnhancedCoverAnalyzer();

// Analyze covers from scraped data
router.post('/analyze', async (req, res) => {
  try {
    const { books } = req.body;
    
    if (!books || !Array.isArray(books)) {
      return res.status(400).json({ error: 'Books array is required' });
    }
    
    const analyses = await analyzer.analyzeCovers(books);
    
    // Generate trends summary
    const trends = generateTrends(analyses);
    
    res.json({
      analyses,
      trends,
      totalAnalyzed: analyses.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get trending patterns for a category
router.get('/trends/:category', async (req, res) => {
  try {
    // This would typically fetch from a database
    // For now, return sample trending data
    const trends = {
      category: req.params.category,
      colorThemes: {
        'dark': 35,
        'romantic': 25,
        'mysterious': 20,
        'warm': 15,
        'cool': 5
      },
      averageBrightness: 120,
      averageContrast: 3.2,
      commonAspectRatios: ['0.67', '0.75', '0.80'],
      textPresence: 85 // percentage
    };
    
    res.json(trends);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function generateTrends(analyses) {
  const trends = {
    // Original trends
    colorThemes: {},
    averageBrightness: 0,
    averageContrast: 0,
    aspectRatios: {},
    textPresence: 0,
    
    // Enhanced AI analysis trends
    objectTrends: {
      humanPresence: 0,
      commonObjects: {},
      averageFaceCount: 0
    },
    typographyTrends: {
      fontStyles: {},
      textPlacements: {},
      averageReadability: 0
    },
    compositionTrends: {
      ruleOfThirdsAdherence: 0,
      symmetryTypes: {},
      visualBalance: {}
    },
    genreTrends: {
      dominantGenres: {},
      crossoverPotential: 0
    },
    artisticStyleTrends: {
      mediums: {},
      styles: {},
      eras: {},
      qualityScores: []
    },
    emotionalTrends: {
      moods: {},
      energyLevels: {},
      warmthScores: []
    },
    marketTrends: {
      premiumIndicators: 0,
      thumbnailEffectiveness: []
    }
  };
  
  let validAnalyses = analyses.filter(a => a.analysis && !a.analysis.error);
  
  if (validAnalyses.length === 0) {
    return trends;
  }
  
  // Original trends calculation
  calculateOriginalTrends(validAnalyses, trends);
  
  // Enhanced AI analysis trends
  calculateEnhancedTrends(validAnalyses, trends);
  
  return trends;
}

function calculateOriginalTrends(validAnalyses, trends) {
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
}

function calculateEnhancedTrends(validAnalyses, trends) {
  let totalFaces = 0;
  let totalReadability = 0;
  let readabilityCount = 0;
  let totalRuleOfThirds = 0;
  let ruleOfThirdsCount = 0;
  let totalCrossover = 0;
  let crossoverCount = 0;
  let premiumCount = 0;
  
  validAnalyses.forEach(analysis => {
    const enhanced = analysis.analysis;
    
    // Object detection trends
    if (enhanced.objectDetection) {
      if (enhanced.objectDetection.hasHumanFigures) {
        trends.objectTrends.humanPresence++;
      }
      
      totalFaces += enhanced.objectDetection.faces?.count || 0;
      
      // Count common objects
      if (enhanced.objectDetection.labels) {
        enhanced.objectDetection.labels.forEach(label => {
          const obj = label.description || label.name;
          trends.objectTrends.commonObjects[obj] = (trends.objectTrends.commonObjects[obj] || 0) + 1;
        });
      }
    }
    
    // Typography trends
    if (enhanced.typography) {
      if (enhanced.typography.fontAnalysis?.estimatedStyle) {
        const style = enhanced.typography.fontAnalysis.estimatedStyle;
        trends.typographyTrends.fontStyles[style] = (trends.typographyTrends.fontStyles[style] || 0) + 1;
      }
      
      if (enhanced.typography.textPlacement) {
        const placement = enhanced.typography.textPlacement;
        trends.typographyTrends.textPlacements[placement] = (trends.typographyTrends.textPlacements[placement] || 0) + 1;
      }
      
      if (enhanced.typography.readability) {
        totalReadability += enhanced.typography.readability;
        readabilityCount++;
      }
    }
    
    // Composition trends
    if (enhanced.advancedComposition) {
      if (enhanced.advancedComposition.ruleOfThirds?.adherence) {
        totalRuleOfThirds += enhanced.advancedComposition.ruleOfThirds.adherence;
        ruleOfThirdsCount++;
      }
      
      if (enhanced.advancedComposition.symmetry?.type) {
        const type = enhanced.advancedComposition.symmetry.type;
        trends.compositionTrends.symmetryTypes[type] = (trends.compositionTrends.symmetryTypes[type] || 0) + 1;
      }
      
      if (enhanced.advancedComposition.visualBalance?.balance) {
        const balance = enhanced.advancedComposition.visualBalance.weightDistribution;
        trends.compositionTrends.visualBalance[balance] = (trends.compositionTrends.visualBalance[balance] || 0) + 1;
      }
    }
    
    // Genre trends
    if (enhanced.genreElements) {
      if (enhanced.genreElements.dominantGenre && enhanced.genreElements.dominantGenre !== 'unknown') {
        const genre = enhanced.genreElements.dominantGenre;
        trends.genreTrends.dominantGenres[genre] = (trends.genreTrends.dominantGenres[genre] || 0) + 1;
      }
      
      if (enhanced.genreElements.confidence) {
        totalCrossover += enhanced.genreElements.confidence;
        crossoverCount++;
      }
    }
    
    // Artistic style trends
    if (enhanced.artisticStyle) {
      if (enhanced.artisticStyle.medium?.type) {
        const medium = enhanced.artisticStyle.medium.type;
        trends.artisticStyleTrends.mediums[medium] = (trends.artisticStyleTrends.mediums[medium] || 0) + 1;
      }
      
      if (enhanced.artisticStyle.style?.style) {
        const style = enhanced.artisticStyle.style.style;
        trends.artisticStyleTrends.styles[style] = (trends.artisticStyleTrends.styles[style] || 0) + 1;
      }
      
      if (enhanced.artisticStyle.era?.era) {
        const era = enhanced.artisticStyle.era.era;
        trends.artisticStyleTrends.eras[era] = (trends.artisticStyleTrends.eras[era] || 0) + 1;
      }
      
      if (enhanced.artisticStyle.quality?.score) {
        trends.artisticStyleTrends.qualityScores.push(enhanced.artisticStyle.quality.score);
      }
    }
    
    // Emotional trends
    if (enhanced.emotionalTone) {
      if (enhanced.emotionalTone.mood?.primary) {
        const mood = enhanced.emotionalTone.mood.primary;
        trends.emotionalTrends.moods[mood] = (trends.emotionalTrends.moods[mood] || 0) + 1;
      }
      
      if (enhanced.emotionalTone.energy?.level) {
        const energy = enhanced.emotionalTone.energy.level;
        trends.emotionalTrends.energyLevels[energy] = (trends.emotionalTrends.energyLevels[energy] || 0) + 1;
      }
      
      if (enhanced.emotionalTone.warmth?.score) {
        trends.emotionalTrends.warmthScores.push(enhanced.emotionalTone.warmth.score);
      }
    }
    
    // Market trends
    if (enhanced.marketPositioning) {
      if (enhanced.marketPositioning.premiumIndicators?.positioning === 'premium') {
        premiumCount++;
      }
    }
    
    if (enhanced.thumbnailEffectiveness?.overallScore) {
      trends.marketTrends.thumbnailEffectiveness.push(enhanced.thumbnailEffectiveness.overallScore);
    }
  });
  
  // Calculate averages and percentages
  trends.objectTrends.humanPresence = Math.round((trends.objectTrends.humanPresence / validAnalyses.length) * 100);
  trends.objectTrends.averageFaceCount = Math.round((totalFaces / validAnalyses.length) * 100) / 100;
  
  if (readabilityCount > 0) {
    trends.typographyTrends.averageReadability = Math.round((totalReadability / readabilityCount) * 100) / 100;
  }
  
  if (ruleOfThirdsCount > 0) {
    trends.compositionTrends.ruleOfThirdsAdherence = Math.round((totalRuleOfThirds / ruleOfThirdsCount) * 100);
  }
  
  if (crossoverCount > 0) {
    trends.genreTrends.crossoverPotential = Math.round((totalCrossover / crossoverCount) * 100) / 100;
  }
  
  trends.marketTrends.premiumIndicators = Math.round((premiumCount / validAnalyses.length) * 100);
}

export default router;