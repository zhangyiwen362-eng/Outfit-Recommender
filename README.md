# Outfit Recommender

A lightweight, client-side web app that suggests what to wear based on today's weather forecast. Uses Open-Meteo APIs (no key required) to fetch weather data and provides clothing recommendations using deterministic rules.

## Features

- 🌍 Enter a city name or lat/lon coordinates
- 🌡️ Shows today's high/low temperatures, precipitation chance, and wind speed
- 👕 Provides outfit recommendations based on weather conditions
- 🔧 Adjusts suggestions based on personal temperature preference (cold/normal/hot)
- 🌐 No backend required - runs entirely in the browser
- ♿ Accessible UI with screen reader support
- 📱 Responsive design for mobile and desktop

## Quick Start

1. Clone this repository:
```bash
git clone https://github.com/zhangyiwen362-eng/Outfit-Recommender.git
cd Outfit-Recommender
```

2. Open `index.html` in your browser:
- Double-click the file
- Or serve it locally using Python:
  ```bash
  python3 -m http.server 8000
  ```
  Then visit http://localhost:8000

## How It Works

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