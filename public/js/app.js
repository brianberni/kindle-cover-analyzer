class KindleCoverAnalyzer {
    constructor() {
        this.apiBase = '/api';
        this.currentView = 'dashboard';
        this.init();
    }

    init() {
        this.setupNavigation();
        this.loadCategories();
        this.bindEvents();
        this.initAnimations();
    }

    setupNavigation() {
        // Sidebar toggle functionality
        const sidebarToggle = document.getElementById('sidebarToggle');
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const sidebar = document.getElementById('sidebar');
        const dashboardContainer = document.querySelector('.dashboard-container');

        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                dashboardContainer.classList.toggle('collapsed');
                sidebar.classList.toggle('collapsed');
            });
        }

        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });
        }

        // Navigation item clicks
        const navItems = document.querySelectorAll('.nav-item[data-view]');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const view = item.getAttribute('data-view');
                this.switchView(view);
                
                // Update active state
                document.querySelectorAll('.nav-item').forEach(navItem => {
                    navItem.classList.remove('active');
                });
                item.classList.add('active');
            });
        });

        // Submenu functionality
        const submenuItems = document.querySelectorAll('.nav-has-submenu');
        submenuItems.forEach(item => {
            const link = item.querySelector('.nav-link');
            link.addEventListener('click', (e) => {
                e.preventDefault();
                item.classList.toggle('expanded');
            });
        });

        // Category quick links
        const categoryLinks = document.querySelectorAll('[data-category]');
        categoryLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const category = link.getAttribute('data-category');
                this.switchView('analyze');
                
                // Set the category and start analysis
                setTimeout(() => {
                    const categorySelect = document.getElementById('category');
                    if (categorySelect) {
                        categorySelect.value = category;
                        this.analyzeCovers();
                    }
                }, 100);
            });
        });

        // Quick analyze button
        const quickAnalyzeBtn = document.getElementById('quickAnalyzeBtn');
        if (quickAnalyzeBtn) {
            quickAnalyzeBtn.addEventListener('click', () => {
                this.switchView('analyze');
            });
        }
    }

    switchView(viewName) {
        // Hide all views
        document.querySelectorAll('.view-container').forEach(view => {
            view.classList.remove('active');
        });

        // Show selected view
        const targetView = document.getElementById(`${viewName}View`);
        if (targetView) {
            targetView.classList.add('active');
            this.currentView = viewName;
            
            // Update breadcrumb
            const breadcrumb = document.getElementById('breadcrumbCurrent');
            if (breadcrumb) {
                breadcrumb.textContent = this.formatViewName(viewName);
            }
        }
    }

    formatViewName(viewName) {
        const names = {
            'dashboard': 'Dashboard',
            'analyze': 'Cover Analysis',
            'analytics': 'Analytics',
            'settings': 'Settings'
        };
        return names[viewName] || viewName;
    }

    initAnimations() {
        // Staggered reveal animations for dashboard cards
        this.observeElements();
        this.addPageLoadAnimations();
    }

    observeElements() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('animate-in');
                    }, index * 100);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        // Observe elements that should animate in
        const animateElements = document.querySelectorAll('.stat-card, .dashboard-card, .metric-card, .ai-insight-card, .cover-card');
        animateElements.forEach(el => {
            el.classList.add('animate-element');
            observer.observe(el);
        });
    }

    addPageLoadAnimations() {
        // Add entrance animations for main sections
        const sections = ['.stats-cards', '.dashboard-cards', '.trends-dashboard'];
        sections.forEach((selector, index) => {
            const element = document.querySelector(selector);
            if (element) {
                element.style.opacity = '0';
                element.style.transform = 'translateY(20px)';
                element.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
                
                setTimeout(() => {
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }, index * 200);
            }
        });
    }

    async loadCategories() {
        try {
            const response = await fetch(`${this.apiBase}/categories`);
            const data = await response.json();
            
            const categorySelect = document.getElementById('category');
            if (!categorySelect) return;
            
            // Organize categories into groups with sub-categories
            const categoryGroups = {
                'Romance': [
                    'romance', 'contemporary-romance', 'paranormal-romance', 'romantic-suspense', 
                    'sports-romance', 'new-adult-romance', 'holiday-romance', 'western-romance', 
                    'military-romance', 'clean-wholesome-romance'
                ],
                'Historical Romance': [
                    'historical-romance', 'regency-romance', 'regency-fiction', 'victorian-romance',
                    'medieval-romance', 'scottish-romance', 'viking-romance', 'american-historical-romance'
                ],
                'Mystery & Thriller': [
                    'mystery-thriller', 'mystery', 'thriller', 'psychological-thrillers', 
                    'crime-thrillers', 'domestic-thriller', 'womens-mystery-thriller', 'police-procedurals',
                    'short-mystery-thriller'
                ],
                'Cozy Mystery': [
                    'cozy-mystery', 'cozy-animal-mystery', 'cozy-crafts-mystery'
                ],
                'Science Fiction': [
                    'science-fiction', 'dystopian', 'space-opera', 'time-travel', 'alternate-history',
                    'military-sci-fi', 'steampunk', 'cyberpunk', 'apocalyptic-sci-fi'
                ],
                'Fantasy': [
                    'fantasy', 'science-fiction-fantasy', 'paranormal-fantasy', 'epic-fantasy', 
                    'urban-fantasy', 'sword-sorcery'
                ],
                'Teen & Young Adult': [
                    'teen-young-adult', 'ya-fantasy', 'ya-romance', 'ya-science-fiction',
                    'ya-dystopian', 'ya-paranormal', 'ya-contemporary'
                ],
                'Literary Fiction': [
                    'literary-fiction', 'contemporary-fiction', 'historical-fiction', 
                    'women-fiction', 'family-saga', 'psychological-fiction', 'upmarket-fiction'
                ],
                'Horror & Supernatural': [
                    'horror', 'paranormal', 'supernatural', 'gothic', 'occult-horror',
                    'vampire', 'werewolves-shapeshifters'
                ],
                'Action & Adventure': [
                    'action-adventure', 'war-military', 'sea-adventures', 'spy-thrillers', 'adventure-fiction'
                ],
                'Non-Fiction': [
                    'business', 'self-help', 'biography', 'health-fitness', 'cooking', 'history', 'politics'
                ]
            };
            
            // Add grouped options to select
            Object.entries(categoryGroups).forEach(([groupName, categories]) => {
                // Add group header
                const optgroup = document.createElement('optgroup');
                optgroup.label = groupName;
                
                categories.forEach(category => {
                    if (data.categories.includes(category)) {
                        const option = document.createElement('option');
                        option.value = category;
                        option.textContent = this.formatCategoryName(category);
                        optgroup.appendChild(option);
                    }
                });
                
                if (optgroup.children.length > 0) {
                    categorySelect.appendChild(optgroup);
                }
            });
            
        } catch (error) {
            this.showError('Failed to load categories: ' + error.message);
        }
    }
    
    formatCategoryName(category) {
        return category
            .replace(/-/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
            .replace(/Ya /g, 'YA ')
            .replace(/Sci Fi/g, 'Sci-Fi');
    }

    bindEvents() {
        const analyzeBtn = document.getElementById('analyzeBtn');
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => {
                this.analyzeCovers();
            });
        }

        // View toggle buttons
        const viewToggles = document.querySelectorAll('.view-toggle');
        viewToggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                viewToggles.forEach(t => t.classList.remove('active'));
                toggle.classList.add('active');
                
                const viewType = toggle.getAttribute('data-view');
                const coversGrid = document.getElementById('coversGrid');
                if (coversGrid) {
                    coversGrid.className = `covers-${viewType}`;
                }
            });
        });
    }

    async analyzeCovers() {
        try {
            console.log('analyzeCovers called - start');
            const category = document.getElementById('category').value;
            const limit = document.getElementById('limit').value;

            if (!category) {
                this.showError('Please select a category');
                return;
            }
            
            console.log('About to show loading');
            this.showLoading();
            console.log('Loading shown, proceeding with analysis');

        try {
            // Step 1: Scrape books
            console.log(`Scraping books for category: ${category}`);
            const scrapeResponse = await fetch(`${this.apiBase}/books?category=${category}&limit=${limit}`);
            const scrapeData = await scrapeResponse.json();
            console.log('Scrape response:', scrapeData);

            if (!scrapeResponse.ok) {
                throw new Error(scrapeData.error || 'Failed to scrape books');
            }

            if (!scrapeData.books || scrapeData.books.length === 0) {
                throw new Error('No books found for this category');
            }

            // Step 2: Analyze covers
            const analysisResponse = await fetch(`${this.apiBase}/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ books: scrapeData.books })
            });

            const analysisData = await analysisResponse.json();

            if (!analysisResponse.ok) {
                throw new Error(analysisData.error || 'Failed to analyze covers');
            }

            console.log('Analysis data received:', analysisData); // Debug log
            
            if (!analysisData || !analysisData.trends || !analysisData.analyses) {
                throw new Error('Invalid analysis response format');
            }

            this.displayResults(analysisData, category);

        } catch (error) {
            console.error('Analysis failed:', error);
            this.showError(`Analysis failed: ${error.message}`);
        } finally {
            this.hideLoading();
        }
        } catch (outerError) {
            console.error('Outer error in analyzeCovers:', outerError);
            this.showError(`Analyze error: ${outerError.message}`);
            this.hideLoading();
        }
    }

    displayResults(data, category) {
        // Show results section
        document.getElementById('results').classList.remove('hidden');

        // Display trends
        this.displayTrends(data.trends);

        // Display individual covers
        this.displayCovers(data.analyses);

        // Trigger animation for results
        setTimeout(() => {
            this.observeElements();
        }, 100);
    }

    displayTrends(trends) {
        console.log('displayTrends called with:', trends); // Debug log
        
        if (!trends) {
            console.error('Trends is undefined - creating default trends');
            trends = {
                colorThemes: { romantic: 5, dark: 3, modern: 2 },
                averageBrightness: 120,
                averageContrast: 3.2,
                textPresence: 85
            };
        }
        
        // Original trends
        this.displayOriginalTrends(trends);
        
        // Enhanced AI analysis trends  
        this.displayEnhancedTrends(trends);
    }
    
    displayOriginalTrends(trends) {
        try {
            // Color themes
            const colorThemesEl = document.getElementById('colorThemes');
            if (colorThemesEl && trends && trends.colorThemes) {
                colorThemesEl.innerHTML = '';
                
                Object.entries(trends.colorThemes)
                    .sort(([,a], [,b]) => b - a)
                    .forEach(([theme, count]) => {
                        const div = document.createElement('div');
                        div.className = 'color-theme';
                        div.textContent = `${theme}: ${count}`;
                        colorThemesEl.appendChild(div);
                    });
            } else {
                console.log('colorThemes element or trends missing:', {
                    element: !!colorThemesEl,
                    trends: !!trends,
                    colorThemes: trends ? !!trends.colorThemes : 'trends is null'
                });
            }
        } catch (error) {
            console.error('Error in displayOriginalTrends:', error);
            console.error('Trends object:', trends);
        }

        // Metrics
        const brightnessEl = document.getElementById('brightness');
        if (brightnessEl) brightnessEl.textContent = trends.averageBrightness;
        
        const contrastEl = document.getElementById('contrast');
        if (contrastEl) contrastEl.textContent = trends.averageContrast + ':1';
        
        const textPresenceEl = document.getElementById('textPresence');
        if (textPresenceEl) textPresenceEl.textContent = trends.textPresence + '%';
    }
    
    displayEnhancedTrends(trends) {
        // Object Detection Trends
        if (trends.objectTrends) {
            this.displayObjectTrends(trends.objectTrends);
        }
        
        // Typography Trends
        if (trends.typographyTrends) {
            this.displayTypographyTrends(trends.typographyTrends);
        }
        
        // Composition Trends
        if (trends.compositionTrends) {
            this.displayCompositionTrends(trends.compositionTrends);
        }
        
        // Genre Trends
        if (trends.genreTrends) {
            this.displayGenreTrends(trends.genreTrends);
        }
        
        // Artistic Style Trends
        if (trends.artisticStyleTrends) {
            this.displayArtisticStyleTrends(trends.artisticStyleTrends);
        }
        
        // Emotional Trends
        if (trends.emotionalTrends) {
            this.displayEmotionalTrends(trends.emotionalTrends);
        }
        
        // Market Trends
        if (trends.marketTrends) {
            this.displayMarketTrends(trends.marketTrends);
        }
    }
    
    displayObjectTrends(objectTrends) {
        const container = document.getElementById('objectTrends');
        if (!container) return;
        
        container.innerHTML = `
            <h4>Visual Elements</h4>
            <div class="trend-metric">Human Presence: ${objectTrends.humanPresence}%</div>
            <div class="trend-metric">Average Faces: ${objectTrends.averageFaceCount}</div>
            <div class="common-objects">
                <strong>Common Objects:</strong>
                ${Object.entries(objectTrends.commonObjects)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([obj, count]) => `<span class="object-tag">${obj} (${count})</span>`)
                    .join(' ')}
            </div>
        `;
    }
    
    displayTypographyTrends(typographyTrends) {
        const container = document.getElementById('typographyTrends');
        if (!container) return;
        
        container.innerHTML = `
            <h4>Typography Trends</h4>
            <div class="trend-metric">Avg Readability: ${(typographyTrends.averageReadability * 100).toFixed(0)}%</div>
            <div class="font-styles">
                <strong>Font Styles:</strong>
                ${Object.entries(typographyTrends.fontStyles)
                    .sort(([,a], [,b]) => b - a)
                    .map(([style, count]) => `<span class="style-tag">${this.formatName(style)} (${count})</span>`)
                    .join(' ')}
            </div>
            <div class="text-placements">
                <strong>Text Placement:</strong>
                ${Object.entries(typographyTrends.textPlacements)
                    .sort(([,a], [,b]) => b - a)
                    .map(([placement, count]) => `<span class="placement-tag">${this.formatName(placement)} (${count})</span>`)
                    .join(' ')}
            </div>
        `;
    }
    
    displayCompositionTrends(compositionTrends) {
        const container = document.getElementById('compositionTrends');
        if (!container) return;
        
        container.innerHTML = `
            <h4>Composition Analysis</h4>
            <div class="trend-metric">Rule of Thirds: ${compositionTrends.ruleOfThirdsAdherence}%</div>
            <div class="symmetry-types">
                <strong>Symmetry:</strong>
                ${Object.entries(compositionTrends.symmetryTypes)
                    .sort(([,a], [,b]) => b - a)
                    .map(([type, count]) => `<span class="symmetry-tag">${this.formatName(type)} (${count})</span>`)
                    .join(' ')}
            </div>
            <div class="visual-balance">
                <strong>Visual Balance:</strong>
                ${Object.entries(compositionTrends.visualBalance)
                    .sort(([,a], [,b]) => b - a)
                    .map(([balance, count]) => `<span class="balance-tag">${this.formatName(balance)} (${count})</span>`)
                    .join(' ')}
            </div>
        `;
    }
    
    displayGenreTrends(genreTrends) {
        const container = document.getElementById('genreTrends');
        if (!container) return;
        
        container.innerHTML = `
            <h4>Genre Elements</h4>
            <div class="trend-metric">Crossover Potential: ${(genreTrends.crossoverPotential * 100).toFixed(0)}%</div>
            <div class="dominant-genres">
                <strong>Visual Genres:</strong>
                ${Object.entries(genreTrends.dominantGenres)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([genre, count]) => `<span class="genre-tag">${this.formatName(genre)} (${count})</span>`)
                    .join(' ')}
            </div>
        `;
    }
    
    displayArtisticStyleTrends(artisticStyleTrends) {
        const container = document.getElementById('artisticStyleTrends');
        if (!container) return;
        
        const avgQuality = artisticStyleTrends.qualityScores.length > 0 
            ? (artisticStyleTrends.qualityScores.reduce((sum, score) => sum + score, 0) / artisticStyleTrends.qualityScores.length * 100).toFixed(0)
            : 0;
        
        container.innerHTML = `
            <h4>Artistic Style</h4>
            <div class="trend-metric">Quality Score: ${avgQuality}%</div>
            <div class="mediums">
                <strong>Mediums:</strong>
                ${Object.entries(artisticStyleTrends.mediums)
                    .sort(([,a], [,b]) => b - a)
                    .map(([medium, count]) => `<span class="medium-tag">${this.formatName(medium)} (${count})</span>`)
                    .join(' ')}
            </div>
            <div class="styles">
                <strong>Styles:</strong>
                ${Object.entries(artisticStyleTrends.styles)
                    .sort(([,a], [,b]) => b - a)
                    .map(([style, count]) => `<span class="style-tag">${this.formatName(style)} (${count})</span>`)
                    .join(' ')}
            </div>
            <div class="eras">
                <strong>Eras:</strong>
                ${Object.entries(artisticStyleTrends.eras)
                    .sort(([,a], [,b]) => b - a)
                    .map(([era, count]) => `<span class="era-tag">${this.formatName(era)} (${count})</span>`)
                    .join(' ')}
            </div>
        `;
    }
    
    displayEmotionalTrends(emotionalTrends) {
        const container = document.getElementById('emotionalTrends');
        if (!container) return;
        
        const avgWarmth = emotionalTrends.warmthScores.length > 0 
            ? (emotionalTrends.warmthScores.reduce((sum, score) => sum + score, 0) / emotionalTrends.warmthScores.length * 100).toFixed(0)
            : 0;
        
        container.innerHTML = `
            <h4>Emotional Impact</h4>
            <div class="trend-metric">Warmth Score: ${avgWarmth}%</div>
            <div class="moods">
                <strong>Moods:</strong>
                ${Object.entries(emotionalTrends.moods)
                    .sort(([,a], [,b]) => b - a)
                    .map(([mood, count]) => `<span class="mood-tag">${this.formatName(mood)} (${count})</span>`)
                    .join(' ')}
            </div>
            <div class="energy-levels">
                <strong>Energy:</strong>
                ${Object.entries(emotionalTrends.energyLevels)
                    .sort(([,a], [,b]) => b - a)
                    .map(([energy, count]) => `<span class="energy-tag">${this.formatName(energy)} (${count})</span>`)
                    .join(' ')}
            </div>
        `;
    }
    
    displayMarketTrends(marketTrends) {
        const container = document.getElementById('marketTrends');
        if (!container) return;
        
        const avgThumbnailScore = marketTrends.thumbnailEffectiveness.length > 0 
            ? (marketTrends.thumbnailEffectiveness.reduce((sum, score) => sum + score, 0) / marketTrends.thumbnailEffectiveness.length * 100).toFixed(0)
            : 0;
        
        container.innerHTML = `
            <h4>Market Analysis</h4>
            <div class="trend-metric">Premium Indicators: ${marketTrends.premiumIndicators}%</div>
            <div class="trend-metric">Thumbnail Effectiveness: ${avgThumbnailScore}%</div>
        `;
    }
    
    formatName(name) {
        return name
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    }

    displayCovers(analyses) {
        const coversGrid = document.getElementById('coversGrid');
        if (!coversGrid) return;
        
        coversGrid.innerHTML = '';

        analyses.forEach(book => {
            const coverCard = this.createCoverCard(book);
            coversGrid.appendChild(coverCard);
        });
    }

    createCoverCard(book) {
        const card = document.createElement('div');
        card.className = 'cover-card';

        const analysis = book.analysis || {};
        const colors = analysis.colors || {};

        card.innerHTML = `
            <img src="${book.coverUrl}" alt="${book.title}" class="cover-image" onerror="this.style.display='none'">
            <div class="cover-info">
                <div class="cover-rank">Rank #${book.rank}</div>
                <div class="cover-title">${book.title}</div>
                <div class="cover-author">${book.author || 'Unknown Author'}</div>
                
                ${this.renderRatingAndReviews(book)}
                ${this.renderPriceAndABSR(book)}
                
                ${colors.dominant ? `
                <div class="color-palette">
                    ${colors.dominant ? `<div class="color-swatch" style="background-color: ${colors.dominant}" title="Dominant"></div>` : ''}
                    ${colors.vibrant ? `<div class="color-swatch" style="background-color: ${colors.vibrant}" title="Vibrant"></div>` : ''}
                    ${colors.muted ? `<div class="color-swatch" style="background-color: ${colors.muted}" title="Muted"></div>` : ''}
                </div>
                ` : ''}
                
                ${!analysis.error ? `
                <div class="analysis-stats">
                    <div>Theme: ${analysis.colorTheme || 'N/A'}</div>
                    <div>Brightness: ${analysis.brightness || 'N/A'}</div>
                    <div>Contrast: ${analysis.contrast || 'N/A'}</div>
                    <div>Text: ${analysis.textDetection?.hasText ? 'Yes' : 'No'}</div>
                    ${this.renderEnhancedAnalysis(analysis)}
                </div>
                ` : `<div style="color: var(--error); font-size: 0.85em;">Analysis failed</div>`}
            </div>
        `;

        return card;
    }
    
    renderRatingAndReviews(book) {
        if (!book.rating || !book.reviewsCount) {
            return '';
        }

        // Extract numeric rating from the rating string (e.g., "4.5 out of 5 stars" -> 4.5)
        const numericRating = parseFloat(book.rating.toString().match(/[\d.]+/)?.[0] || 0);
        const reviewCount = parseInt(book.reviewsCount) || 0;

        // Generate star display
        const stars = this.generateStarRating(numericRating);
        
        return `
            <div class="book-rating">
                <div class="stars">${stars}</div>
                <div class="rating-details">
                    <span class="rating-number">${numericRating}</span>
                    <span class="review-count">(${reviewCount.toLocaleString()} reviews)</span>
                </div>
            </div>
        `;
    }

    renderPriceAndABSR(book) {
        let html = '<div class="book-metadata">';
        
        // Price display
        if (book.price) {
            html += `<div class="book-price">${book.price}</div>`;
        }
        
        // ABSR display (if available)
        if (book.absr || book.bestSellerRank) {
            const rank = book.absr || book.bestSellerRank;
            html += `<div class="absr">ABSR: #${rank.toLocaleString()}</div>`;
        }
        
        // Trending score display
        if (book.trendingScore) {
            html += `<div class="trending-score">Trending: ${book.trendingScore}/100</div>`;
        }

        // Bestseller badge
        if (book.isBestSeller) {
            html += `<div class="bestseller-badge">📈 Bestseller</div>`;
        }
        
        html += '</div>';
        return html;
    }

    generateStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let stars = '';
        
        // Full stars
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        
        // Half star
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        
        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        
        return stars;
    }

    renderEnhancedAnalysis(analysis) {
        let html = '';
        
        // Object detection info
        if (analysis.objectDetection) {
            const objData = analysis.objectDetection;
            if (objData.hasHumanFigures) {
                html += `<div class="enhanced-stat">👤 Human figures detected</div>`;
            }
            if (objData.faces && objData.faces.count > 0) {
                html += `<div class="enhanced-stat">😊 ${objData.faces.count} face${objData.faces.count > 1 ? 's' : ''}</div>`;
            }
            if (objData.primarySubject && objData.primarySubject !== 'unknown') {
                html += `<div class="enhanced-stat">🎯 ${this.formatName(objData.primarySubject)}</div>`;
            }
        }
        
        // Typography info
        if (analysis.typography && analysis.typography.hasText) {
            if (analysis.typography.readability) {
                const readabilityPercent = Math.round(analysis.typography.readability * 100);
                html += `<div class="enhanced-stat">📖 Readability: ${readabilityPercent}%</div>`;
            }
            if (analysis.typography.fontAnalysis?.estimatedStyle) {
                html += `<div class="enhanced-stat">✍️ ${this.formatName(analysis.typography.fontAnalysis.estimatedStyle)}</div>`;
            }
        }
        
        // Genre elements
        if (analysis.genreElements && analysis.genreElements.dominantGenre !== 'unknown') {
            html += `<div class="enhanced-stat">🎭 ${this.formatName(analysis.genreElements.dominantGenre)} elements</div>`;
        }
        
        // Emotional tone
        if (analysis.emotionalTone && analysis.emotionalTone.mood?.primary) {
            html += `<div class="enhanced-stat">💫 ${this.formatName(analysis.emotionalTone.mood.primary)} mood</div>`;
        }
        
        // Artistic style
        if (analysis.artisticStyle) {
            if (analysis.artisticStyle.medium?.type) {
                html += `<div class="enhanced-stat">🎨 ${this.formatName(analysis.artisticStyle.medium.type)}</div>`;
            }
            if (analysis.artisticStyle.quality?.professional) {
                html += `<div class="enhanced-stat">⭐ Professional quality</div>`;
            }
        }
        
        // Thumbnail effectiveness
        if (analysis.thumbnailEffectiveness) {
            const score = Math.round(analysis.thumbnailEffectiveness.overallScore * 100);
            const emoji = score >= 80 ? '🔥' : score >= 60 ? '👍' : score >= 40 ? '👌' : '⚠️';
            html += `<div class="enhanced-stat">${emoji} Thumbnail: ${score}%</div>`;
        }
        
        // Market positioning
        if (analysis.marketPositioning?.premiumIndicators?.positioning === 'premium') {
            html += `<div class="enhanced-stat">💎 Premium positioning</div>`;
        }
        
        return html;
    }

    showLoading() {
        document.getElementById('loading').classList.remove('hidden');
        document.getElementById('results').classList.add('hidden');
        document.getElementById('error').classList.add('hidden');
    }

    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    }

    showError(message) {
        const errorEl = document.getElementById('error');
        const errorMessageEl = document.getElementById('errorMessage');
        
        if (errorEl && errorMessageEl) {
            errorMessageEl.textContent = message;
            errorEl.classList.remove('hidden');
            document.getElementById('results').classList.add('hidden');
        }
        console.error('App Error:', message);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new KindleCoverAnalyzer();
});