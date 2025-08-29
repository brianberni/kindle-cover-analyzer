# Kindle Cover Analyzer

Analyze trending book covers from Amazon Kindle bestsellers to identify winning design patterns and color schemes.

## Features

- ✅ Real-time scraping of Amazon Kindle bestsellers by genre
- ✅ Advanced color analysis (dominant colors, themes, brightness, contrast)
- ✅ Cover composition analysis (aspect ratios, text detection)
- ✅ Trending pattern identification
- ✅ Beautiful web interface with visualizations

## Setup Instructions

### 1. Install Dependencies

```bash
cd kindle-cover-analyzer
npm install
```

### 2. Configure Your API Keys

Copy the environment template:
```bash
cp .env.example .env
```

Edit `.env` file with your credentials:
```
OXYLABS_USERNAME=your_oxylabs_username
OXYLABS_PASSWORD=your_oxylabs_password
APIFY_TOKEN=your_apify_token
PORT=3000
```

### 3. Run the Application

```bash
npm run dev
```

Visit: `http://localhost:3000`

## How It Works

### 1. Web Scraping
- Uses Oxylabs proxy network to bypass Amazon's anti-bot protection
- Fetches real-time bestseller data from specific Kindle categories
- Extracts book metadata and high-resolution cover images

### 2. Image Analysis
- **Color Analysis**: Extracts dominant colors using node-vibrant
- **Theme Detection**: Classifies covers into themes (dark, romantic, mysterious, etc.)
- **Brightness & Contrast**: Calculates visual metrics for readability
- **Composition**: Analyzes aspect ratios and layout patterns

### 3. Trend Analysis
- Aggregates patterns across all analyzed covers
- Identifies the most popular color themes
- Calculates average brightness and contrast ratios
- Reports text presence statistics

## Supported Genres

- Romance
- Mystery & Thriller  
- Science Fiction
- Fantasy
- Young Adult
- Literary Fiction
- Contemporary Fiction
- Historical Fiction
- Horror
- Business

## API Endpoints

### Get Categories
```
GET /api/scraper/categories
```

### Scrape Books
```
GET /api/scraper/books/:category?limit=20
```

### Analyze Covers
```
POST /api/analysis/analyze
Body: { "books": [...] }
```

## Troubleshooting

### Common Issues

1. **Scraping fails**: Check your Oxylabs credentials in `.env`
2. **Image analysis errors**: Ensure images are accessible and valid
3. **Slow performance**: Reduce the number of books to analyze

### Rate Limits

- Amazon may rate limit requests - the app handles this gracefully
- Oxylabs has usage limits based on your subscription
- Consider implementing caching for production use

## Technical Architecture

```
├── server.js              # Express server
├── src/
│   ├── scrapers/
│   │   └── kindle-scraper.js    # Amazon Kindle scraping logic
│   ├── analysis/
│   │   └── cover-analyzer.js    # Image analysis engine  
│   └── routes/
│       ├── scraper.js           # Scraping API routes
│       └── analysis.js          # Analysis API routes
├── public/
│   ├── index.html              # Web interface
│   ├── css/style.css           # Styling
│   └── js/app.js              # Frontend JavaScript
```

## Next Steps for Production

1. **Database Integration**: Store results for faster repeated queries
2. **Caching**: Implement Redis for API responses
3. **Font Detection**: Add OCR for font analysis
4. **Advanced ML**: Train models on successful vs unsuccessful covers
5. **Export Features**: PDF reports, CSV data exports
6. **User Accounts**: Save analyses and create watchlists

## License

MIT License - see LICENSE file for details