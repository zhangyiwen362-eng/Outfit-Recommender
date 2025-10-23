# 🌤️ Outfit Recommender

A smart, easy-to-use web app that helps you decide what to wear based on today's weather. No account needed, no API keys required!

![Outfit Recommender Demo](./docs/demo.png)

## 📑 Table of Contents
- [Quick Start Guide](#-quick-start-guide)
- [Detailed Features](#-detailed-features)
- [Step-by-Step Usage](#-step-by-step-usage)
- [How It Makes Recommendations](#-how-it-makes-recommendations)
- [Technical Details](#-technical-details)
- [Customization Guide](#-customization-guide)
- [Troubleshooting](#-troubleshooting)
- [Development Guide](#-development-guide)

### Core Features
- **Location Input**
  - City name (e.g., "London", "New York")
  - Coordinates (e.g., "51.5072,-0.1276")
  - Automatic city completion and validation
  
- **Weather Information**
  - Today's high and low temperatures
  - Precipitation probability
  - Wind speed
  
- **Smart Recommendations**
  - Clothing suggestions based on temperature
  - Rain gear recommendations
  - Wind protection advice
  
- **Personalization**
  - Temperature preference adjustment
  - "Feels like" temperature consideration
  
### Technical Features
- ✨ No installation required
- 🔒 No API keys needed
- 📱 Works on mobile and desktop
- ♿ Screen reader friendly
- � No external dependencies
- 💨 Fast loading (<100KB total)

### Method 1: Direct Browser Opening
1. Download this project:
   ```bash
   git clone https://github.com/zhangyiwen362-eng/Outfit-Recommender.git
   ```
2. Open the folder
3. Double-click `index.html`
4. That's it! The app will open in your default browser

### Method 2: Using a Local Server
1. Open your terminal
2. Navigate to the project folder:
   ```bash
   cd path/to/Outfit-Recommender
   ```
3. Start a simple server (choose one):
   ```bash
   # If you have Python 3:
   python3 -m http.server 8000

   # If you have Python 2:
   python -m SimpleHTTPServer 8000

   # If you have Node.js:
   npx http-server
   ```
4. Open your browser and go to:
   - Python server: http://localhost:8000
   - Node.js server: http://localhost:8080

## 📝 Step-by-Step Usage

1. Enter a location:
   - Type a city name (e.g., "London", "New York")
   - Or enter coordinates as "lat,lon" (e.g., "51.5072,-0.1276")
2. Choose your temperature preference:
   - "I feel cold" - suggests warmer clothing
   - "Normal" - standard recommendations
   - "I feel hot" - suggests lighter clothing
3. Click "Get Recommendation" to see:
   - Location name and weather stats
   - Clothing recommendation with explanation
   - Weather-specific advice (umbrella, wind protection)

## Weather Rules

The app uses these deterministic rules to make recommendations:

- Temperature ranges (Fahrenheit, for "Normal" preference):
  - > 75°F: T-shirt + shorts
  - 66-75°F: T-shirt + light pants
  - 56-65°F: Long sleeve + light jacket
  - 46-55°F: Sweater + jacket
  - ≤ 45°F: Warm coat + layers

- Precipitation:
  - > 40%: Suggests umbrella/rain jacket
  - > 80%: Recommends waterproof shoes and raincoat

- Wind:
  - > 20 mph: Suggests windproof layer

User preference adjusts these thresholds by ±5°F.

## APIs Used

- [Open-Meteo Weather Forecast API](https://api.open-meteo.com/v1/forecast)
- [Open-Meteo Geocoding API](https://geocoding-api.open-meteo.com/v1/search)

No API keys required. Free for non-commercial use.

## Project Structure

- `index.html` - Single-page UI with form and results display
- `style.css` - Minimal styling using system fonts
- `script.js` - All logic (geocoding, API calls, outfit rules)

## Development

To modify the recommendation rules or thresholds:
1. Open `script.js`
2. Look for the `CONFIG` object at the top
3. Adjust temperature thresholds, precipitation levels, or wind speeds

## License

MIT License - feel free to use and modify as needed.

## Contributing

Pull requests welcome! Please ensure you maintain the minimal, dependency-free nature of the project.