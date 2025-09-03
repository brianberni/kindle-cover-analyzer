import CoverAnalyzer from './cover-analyzer.js';
import sharp from 'sharp';

class EnhancedCoverAnalyzer extends CoverAnalyzer {
  constructor() {
    super();
    
    // Initialize Google Vision AI client if credentials are available
    this.visionClient = null;
    this.initializeVisionAPI();
    
    // Genre-specific element patterns
    this.genreElements = {
      'romance': ['person', 'couple', 'heart', 'flower', 'rose', 'embrace', 'kiss', 'wedding', 'dress'],
      'mystery': ['shadow', 'silhouette', 'weapon', 'blood', 'dark', 'alley', 'detective', 'magnifying glass'],
      'thriller': ['gun', 'knife', 'explosion', 'car', 'chase', 'city', 'urban', 'danger'],
      'fantasy': ['castle', 'sword', 'dragon', 'magic', 'crown', 'forest', 'mountain', 'mythical'],
      'sci-fi': ['space', 'robot', 'technology', 'futuristic', 'alien', 'planet', 'spaceship'],
      'historical': ['period costume', 'vintage', 'carriage', 'manor', 'historical building'],
      'horror': ['skull', 'blood', 'gothic', 'cemetery', 'ghost', 'supernatural', 'darkness']
    };
    
    // Typography patterns for analysis
    this.typographyFeatures = {
      'serif': ['times', 'georgia', 'book', 'elegant'],
      'sans-serif': ['helvetica', 'arial', 'modern', 'clean'],
      'script': ['cursive', 'handwriting', 'signature', 'flowing'],
      'decorative': ['ornate', 'display', 'artistic', 'unique'],
      'bold': ['thick', 'heavy', 'strong', 'impact'],
      'light': ['thin', 'delicate', 'refined', 'minimal']
    };
  }

  async initializeVisionAPI() {
    try {
      // Only initialize if Google Cloud credentials are available and package is installed
      if (process.env.GOOGLE_CLOUD_CREDENTIALS || process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        const { ImageAnnotatorClient } = await import('@google-cloud/vision');
        this.visionClient = new ImageAnnotatorClient();
        console.log('Google Vision API initialized successfully');
      } else {
        console.log('Google Cloud credentials not found, using alternative analysis methods');
        this.visionClient = null;
      }
    } catch (error) {
      console.log('Google Vision API not available:', error.message);
      console.log('Enhanced analysis will use alternative methods');
      this.visionClient = null;
    }
  }

  async analyzeSingleCover(book) {
    // Start with the base analysis from parent class
    const baseAnalysis = await super.analyzeSingleCover(book);
    
    // Add enhanced AI analysis
    const enhancedData = await this.performEnhancedAnalysis(book.coverUrl, baseAnalysis);
    
    // Merge base and enhanced analysis
    return {
      ...baseAnalysis,
      analysis: {
        ...baseAnalysis.analysis,
        ...enhancedData
      }
    };
  }

  async performEnhancedAnalysis(imageUrl, baseAnalysis) {
    const imageBuffer = await this.downloadImage(imageUrl);
    
    const analysis = {};
    
    // Object detection and scene analysis
    analysis.objectDetection = await this.analyzeObjects(imageBuffer);
    
    // Enhanced text analysis
    analysis.typography = await this.analyzeTypography(imageBuffer, baseAnalysis);
    
    // Composition analysis
    analysis.advancedComposition = await this.analyzeAdvancedComposition(imageBuffer);
    
    // Genre-specific element detection
    analysis.genreElements = await this.detectGenreElements(imageBuffer, analysis.objectDetection);
    
    // Artistic style analysis
    analysis.artisticStyle = await this.analyzeArtisticStyle(imageBuffer);
    
    // Emotional tone analysis
    analysis.emotionalTone = await this.analyzeEmotionalTone(baseAnalysis, analysis);
    
    // Market positioning analysis
    analysis.marketPositioning = await this.analyzeMarketPositioning(baseAnalysis, analysis);
    
    // Thumbnail effectiveness scoring
    analysis.thumbnailEffectiveness = await this.calculateThumbnailEffectiveness(imageBuffer, baseAnalysis, analysis);
    
    return analysis;
  }

  async analyzeObjects(imageBuffer) {
    if (this.visionClient) {
      return await this.analyzeObjectsWithVision(imageBuffer);
    } else {
      return await this.analyzeObjectsAlternative(imageBuffer);
    }
  }

  async analyzeObjectsWithVision(imageBuffer) {
    try {
      const [result] = await this.visionClient.objectLocalization(imageBuffer);
      const objects = result.localizedObjectAnnotations || [];
      
      const [labelResult] = await this.visionClient.labelDetection(imageBuffer);
      const labels = labelResult.labelAnnotations || [];
      
      // Detect faces
      const [faceResult] = await this.visionClient.faceDetection(imageBuffer);
      const faces = faceResult.faceAnnotations || [];
      
      return {
        objects: objects.map(obj => ({
          name: obj.name,
          confidence: obj.score,
          boundingBox: obj.boundingPoly
        })),
        labels: labels.map(label => ({
          description: label.description,
          confidence: label.score,
          topicality: label.topicality
        })),
        faces: {
          count: faces.length,
          details: faces.map(face => ({
            confidence: face.detectionConfidence,
            emotions: {
              joy: face.joyLikelihood,
              sorrow: face.sorrowLikelihood,
              anger: face.angerLikelihood,
              surprise: face.surpriseLikelihood
            },
            boundingBox: face.boundingPoly
          }))
        },
        hasHumanFigures: faces.length > 0 || objects.some(obj => obj.name.toLowerCase().includes('person')),
        primarySubject: this.identifyPrimarySubject(objects, labels)
      };
    } catch (error) {
      console.error('Vision API object detection failed:', error);
      return await this.analyzeObjectsAlternative(imageBuffer);
    }
  }

  async analyzeObjectsAlternative(imageBuffer) {
    // Alternative object detection using image analysis techniques
    // This is a simplified version that uses color and composition patterns
    
    const stats = await sharp(imageBuffer).stats();
    const metadata = await sharp(imageBuffer).metadata();
    
    return {
      objects: [],
      labels: [],
      faces: {
        count: 0,
        details: []
      },
      hasHumanFigures: this.detectHumanFiguresAlternative(stats, metadata),
      primarySubject: 'unknown',
      analysisMethod: 'alternative'
    };
  }

  detectHumanFiguresAlternative(stats, metadata) {
    // Simple heuristic based on image characteristics
    // Human figures often create certain color and contrast patterns
    const aspectRatio = metadata.width / metadata.height;
    const hasVariedColors = stats.channels.some(channel => channel.stdev > 30);
    
    // Portrait orientation with varied colors might indicate human subjects
    return aspectRatio < 1 && hasVariedColors;
  }

  identifyPrimarySubject(objects, labels) {
    // Identify the most prominent subject in the image
    const allItems = [...objects, ...labels];
    
    if (allItems.length === 0) return 'unknown';
    
    // Sort by confidence and return the highest confidence item
    allItems.sort((a, b) => (b.confidence || b.score) - (a.confidence || a.score));
    
    return allItems[0].name || allItems[0].description || 'unknown';
  }

  async analyzeTypography(imageBuffer, baseAnalysis) {
    if (this.visionClient) {
      return await this.analyzeTypographyWithVision(imageBuffer);
    } else {
      return await this.analyzeTypographyAlternative(imageBuffer, baseAnalysis);
    }
  }

  async analyzeTypographyWithVision(imageBuffer) {
    try {
      const [result] = await this.visionClient.textDetection(imageBuffer);
      const textAnnotations = result.textAnnotations || [];
      
      if (textAnnotations.length === 0) {
        return {
          hasText: false,
          textElements: [],
          fontAnalysis: {},
          textPlacement: 'none',
          readability: 0
        };
      }

      const fullText = textAnnotations[0];
      const individualWords = textAnnotations.slice(1);
      
      return {
        hasText: true,
        extractedText: fullText.description,
        textElements: individualWords.map(word => ({
          text: word.description,
          boundingBox: word.boundingPoly,
          position: this.calculateTextPosition(word.boundingPoly)
        })),
        fontAnalysis: this.analyzeFontCharacteristics(individualWords),
        textPlacement: this.analyzeTextPlacement(individualWords),
        readability: this.calculateReadabilityScore(individualWords),
        textHierarchy: this.analyzeTextHierarchy(individualWords)
      };
    } catch (error) {
      console.error('Vision API text detection failed:', error);
      return await this.analyzeTypographyAlternative(imageBuffer);
    }
  }

  async analyzeTypographyAlternative(imageBuffer, baseAnalysis) {
    // Alternative typography analysis without Vision API
    return {
      hasText: baseAnalysis?.analysis?.textDetection?.hasText || false,
      textElements: [],
      fontAnalysis: {
        estimatedStyle: 'unknown',
        confidence: 0.3
      },
      textPlacement: 'unknown',
      readability: baseAnalysis?.analysis?.textDetection?.hasText ? 0.6 : 0,
      analysisMethod: 'alternative'
    };
  }

  calculateTextPosition(boundingPoly) {
    const vertices = boundingPoly.vertices;
    const centerX = vertices.reduce((sum, v) => sum + v.x, 0) / vertices.length;
    const centerY = vertices.reduce((sum, v) => sum + v.y, 0) / vertices.length;
    
    // Classify position (top, middle, bottom, left, center, right)
    // This would need image dimensions for accurate classification
    return { x: centerX, y: centerY };
  }

  analyzeFontCharacteristics(textElements) {
    // Analyze font characteristics from bounding boxes and text
    // This is a simplified analysis - real implementation would be more sophisticated
    return {
      estimatedStyle: 'serif', // Would analyze actual font characteristics
      weight: 'medium',
      size: 'medium',
      confidence: 0.7
    };
  }

  analyzeTextPlacement(textElements) {
    // Analyze how text is positioned on the cover
    if (textElements.length === 0) return 'none';
    
    // Simplified analysis based on positioning patterns
    return 'top-center'; // Would analyze actual positions
  }

  calculateReadabilityScore(textElements) {
    // Calculate how readable the text is at thumbnail size
    if (textElements.length === 0) return 0;
    
    // Factors: contrast, size, spacing, complexity
    // This is a simplified score - real implementation would analyze actual metrics
    return 0.75;
  }

  analyzeTextHierarchy(textElements) {
    // Analyze title vs author name vs other text hierarchy
    return {
      titleElements: [],
      authorElements: [],
      otherElements: [],
      hierarchyScore: 0.6
    };
  }

  async analyzeAdvancedComposition(imageBuffer) {
    // Advanced composition analysis
    const metadata = await sharp(imageBuffer).metadata();
    const { width, height } = metadata;
    
    return {
      ruleOfThirds: this.analyzeRuleOfThirds(imageBuffer, width, height),
      symmetry: await this.analyzeSymmetry(imageBuffer),
      focusPoints: await this.identifyFocusPoints(imageBuffer),
      visualBalance: await this.analyzeVisualBalance(imageBuffer),
      depthAnalysis: await this.analyzeDepth(imageBuffer)
    };
  }

  analyzeRuleOfThirds(imageBuffer, width, height) {
    // Analyze adherence to rule of thirds
    const thirdW = width / 3;
    const thirdH = height / 3;
    
    // This would analyze where key elements are positioned relative to the thirds lines
    return {
      adherence: 0.6,
      keyElementPositions: [],
      score: 0.6
    };
  }

  async analyzeSymmetry(imageBuffer) {
    // Analyze symmetrical vs asymmetrical composition
    // This would involve comparing left/right or top/bottom halves
    return {
      type: 'asymmetrical',
      score: 0.3,
      axis: 'vertical'
    };
  }

  async identifyFocusPoints(imageBuffer) {
    // Identify main focal points in the composition
    return {
      primary: { x: 0.5, y: 0.4 },
      secondary: [],
      strength: 0.7
    };
  }

  async analyzeVisualBalance(imageBuffer) {
    // Analyze visual weight distribution
    return {
      balance: 0.6,
      weightDistribution: 'bottom-heavy',
      stability: 0.7
    };
  }

  async analyzeDepth(imageBuffer) {
    // Analyze depth perception and layering
    return {
      hasDepth: true,
      layers: 2,
      technique: 'overlap',
      effectiveness: 0.6
    };
  }

  async detectGenreElements(imageBuffer, objectDetection) {
    // Detect genre-specific visual elements
    const detectedElements = {};
    
    // If we have object detection results, use them
    if (objectDetection.labels && objectDetection.labels.length > 0) {
      for (const [genre, elements] of Object.entries(this.genreElements)) {
        detectedElements[genre] = this.matchGenreElements(objectDetection.labels, elements);
      }
    }
    
    return {
      byGenre: detectedElements,
      dominantGenre: this.identifyDominantGenre(detectedElements),
      confidence: this.calculateGenreConfidence(detectedElements)
    };
  }

  matchGenreElements(detectedLabels, genreElements) {
    const matches = [];
    
    detectedLabels.forEach(label => {
      genreElements.forEach(element => {
        if (label.description.toLowerCase().includes(element.toLowerCase()) ||
            element.toLowerCase().includes(label.description.toLowerCase())) {
          matches.push({
            element,
            detectedAs: label.description,
            confidence: label.confidence
          });
        }
      });
    });
    
    return matches;
  }

  identifyDominantGenre(detectedElements) {
    let maxMatches = 0;
    let dominantGenre = 'unknown';
    
    for (const [genre, matches] of Object.entries(detectedElements)) {
      if (matches.length > maxMatches) {
        maxMatches = matches.length;
        dominantGenre = genre;
      }
    }
    
    return dominantGenre;
  }

  calculateGenreConfidence(detectedElements) {
    const totalMatches = Object.values(detectedElements)
      .reduce((sum, matches) => sum + matches.length, 0);
    
    return Math.min(totalMatches * 0.2, 1.0); // Scale confidence
  }

  async analyzeArtisticStyle(imageBuffer) {
    // Analyze artistic style characteristics
    const stats = await sharp(imageBuffer).stats();
    
    return {
      medium: this.detectMedium(stats),
      style: this.detectArtStyle(stats),
      era: this.detectEra(stats),
      quality: this.assessQuality(stats),
      productionType: this.detectProductionType(stats)
    };
  }

  detectMedium(stats) {
    // Detect if it's photography, digital art, painting, etc.
    // This would analyze color patterns, texture, etc.
    return {
      type: 'photography',
      confidence: 0.7
    };
  }

  detectArtStyle(stats) {
    // Detect artistic style (realistic, stylized, minimalist, etc.)
    return {
      style: 'realistic',
      confidence: 0.6
    };
  }

  detectEra(stats) {
    // Detect temporal aesthetic (modern, vintage, retro, etc.)
    return {
      era: 'modern',
      confidence: 0.5
    };
  }

  assessQuality(stats) {
    // Assess production quality indicators
    const variance = stats.channels.reduce((sum, channel) => sum + channel.stdev, 0) / stats.channels.length;
    
    return {
      professional: variance > 20, // High variance often indicates professional quality
      score: Math.min(variance / 50, 1.0),
      indicators: ['color_variance', 'composition']
    };
  }

  detectProductionType(stats) {
    // Detect if it looks like professional vs amateur production
    return {
      type: 'professional',
      confidence: 0.6,
      indicators: []
    };
  }

  async analyzeEmotionalTone(baseAnalysis, enhancedAnalysis) {
    // Analyze emotional impact and mood
    const colors = baseAnalysis.analysis.colors;
    const composition = enhancedAnalysis.advancedComposition || {};
    
    return {
      mood: this.determineMood(colors, baseAnalysis.analysis.colorTheme),
      energy: this.calculateEnergyLevel(colors, composition),
      warmth: this.calculateWarmth(colors),
      approachability: this.calculateApproachability(enhancedAnalysis),
      targetDemographic: this.identifyTargetDemographic(baseAnalysis, enhancedAnalysis)
    };
  }

  determineMood(colors, colorTheme) {
    const moodMap = {
      'dark': 'mysterious',
      'light': 'optimistic',
      'warm': 'inviting',
      'cool': 'calm',
      'romantic': 'passionate',
      'mysterious': 'intriguing'
    };
    
    return {
      primary: moodMap[colorTheme] || 'neutral',
      confidence: 0.6,
      indicators: [colorTheme]
    };
  }

  calculateEnergyLevel(colors, composition) {
    // High contrast and vibrant colors = high energy
    const vibrantColor = colors.vibrant;
    const hasVibrant = !!vibrantColor;
    
    return {
      level: hasVibrant ? 'high' : 'low',
      score: hasVibrant ? 0.8 : 0.3,
      factors: ['color_vibrancy', 'composition']
    };
  }

  calculateWarmth(colors) {
    // Analyze warm vs cool temperature
    // This would analyze actual color temperatures
    return {
      temperature: 'warm',
      score: 0.6,
      dominantTones: ['orange', 'red', 'yellow']
    };
  }

  calculateApproachability(enhancedAnalysis) {
    // How approachable/friendly the cover appears
    const faces = enhancedAnalysis.objectDetection?.faces?.count || 0;
    
    return {
      score: faces > 0 ? 0.8 : 0.5,
      factors: faces > 0 ? ['human_presence'] : ['abstract']
    };
  }

  identifyTargetDemographic(baseAnalysis, enhancedAnalysis) {
    // Identify likely target audience based on visual elements
    return {
      ageGroup: 'adult',
      gender: 'neutral',
      lifestyle: 'mainstream',
      confidence: 0.5
    };
  }

  async analyzeMarketPositioning(baseAnalysis, enhancedAnalysis) {
    // Analyze market positioning indicators
    return {
      premiumIndicators: this.identifyPremiumIndicators(baseAnalysis, enhancedAnalysis),
      genreAlignment: this.assessGenreAlignment(enhancedAnalysis),
      competitivePosition: this.estimateCompetitivePosition(baseAnalysis, enhancedAnalysis),
      brandConsistency: this.analyzeBrandConsistency(baseAnalysis, enhancedAnalysis)
    };
  }

  identifyPremiumIndicators(baseAnalysis, enhancedAnalysis) {
    const quality = enhancedAnalysis.artisticStyle?.quality?.professional || false;
    const typography = enhancedAnalysis.typography?.readability || 0;
    
    return {
      score: (quality ? 0.5 : 0) + (typography * 0.5),
      indicators: quality ? ['professional_quality'] : ['amateur_quality'],
      positioning: quality && typography > 0.7 ? 'premium' : 'budget'
    };
  }

  assessGenreAlignment(enhancedAnalysis) {
    const genreElements = enhancedAnalysis.genreElements || {};
    const dominantGenre = genreElements.dominantGenre || 'unknown';
    
    return {
      primaryGenre: dominantGenre,
      alignment: genreElements.confidence || 0,
      crossoverPotential: this.calculateCrossoverPotential(genreElements)
    };
  }

  calculateCrossoverPotential(genreElements) {
    // How many different genres this cover could appeal to
    const genreMatches = Object.keys(genreElements.byGenre || {})
      .filter(genre => genreElements.byGenre[genre].length > 0);
    
    return {
      genres: genreMatches,
      versatility: genreMatches.length / Object.keys(this.genreElements).length
    };
  }

  estimateCompetitivePosition(baseAnalysis, enhancedAnalysis) {
    // Estimate how this cover compares to market standards
    return {
      uniqueness: 0.6,
      trendAlignment: 0.7,
      standoutPotential: 0.5,
      recommendations: []
    };
  }

  analyzeBrandConsistency(baseAnalysis, enhancedAnalysis) {
    // Analyze elements that indicate series/brand consistency
    return {
      seriesIndicators: [],
      consistencyScore: 0.5,
      brandElements: []
    };
  }

  async calculateThumbnailEffectiveness(imageBuffer, baseAnalysis, enhancedAnalysis) {
    // Calculate how effective this cover will be at thumbnail size
    const typography = enhancedAnalysis.typography || {};
    const contrast = baseAnalysis.analysis.contrast || 0;
    const composition = enhancedAnalysis.advancedComposition || {};
    
    const readabilityScore = typography.readability || 0;
    const contrastScore = Math.min(contrast / 10, 1); // Normalize contrast
    const compositionScore = composition.focusPoints?.strength || 0.5;
    
    const overallScore = (readabilityScore * 0.4 + contrastScore * 0.3 + compositionScore * 0.3);
    
    return {
      overallScore: Math.round(overallScore * 100) / 100,
      readability: {
        score: readabilityScore,
        issues: readabilityScore < 0.6 ? ['small_text', 'low_contrast'] : []
      },
      visualImpact: {
        score: compositionScore,
        factors: ['focal_points', 'composition']
      },
      recommendations: this.generateThumbnailRecommendations(overallScore, typography, contrast, composition)
    };
  }

  generateThumbnailRecommendations(score, typography, contrast, composition) {
    const recommendations = [];
    
    if (score < 0.6) {
      recommendations.push('Consider larger, bolder text for better readability');
    }
    
    if (contrast < 5) {
      recommendations.push('Increase color contrast for better visibility');
    }
    
    if (typography.readability && typography.readability < 0.5) {
      recommendations.push('Simplify text elements for thumbnail viewing');
    }
    
    return recommendations;
  }
}

export default EnhancedCoverAnalyzer;