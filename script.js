/*
  Outfit Recommender - script.js
  Purpose: All production-ready logic for the single-page Outfit Recommender.

  What it does:
  - Accepts a city name or lat/lon and a temperature preference (cold/normal/hot).
  - Uses Open-Meteo's geocoding API to convert city -> lat/lon when needed.
  - Fetches hourly forecast (temperature_2m, precipitation_probability, windspeed_10m) for the location.
  - Computes today's high/low temperature, max precipitation probability, and max wind speed.
  - Applies deterministic rules to produce a concise outfit suggestion with an icon and a short reason.

  Change location: type a city and press Enter, or switch to Lat/Lon mode and provide numeric values.

  Tests: call runTests() from the console to run included unit-style checks.
*/

(function(){
  'use strict';

  // DOM elements
  const form = document.getElementById('location-form');
  const cityInput = document.getElementById('city');
  const latInput = document.getElementById('lat');
  const lonInput = document.getElementById('lon');
  const cityInputs = document.getElementById('city-inputs');
  const latlonInputs = document.getElementById('latlon-inputs');
  const prefSelect = document.getElementById('pref');
  const placeEl = document.getElementById('place');
  const tempsEl = document.getElementById('temps');
  const precipEl = document.getElementById('precip');
  const windEl = document.getElementById('wind');
  const outfitIcon = document.getElementById('outfit-icon');
  const outfitText = document.getElementById('outfit-text');
  const outfitReason = document.getElementById('outfit-reason');

  // Preference adjustments (degrees Celsius): cold -> user needs warmer clothes => treat temps as colder
  const PREF_ADJUST = { cold: -3, normal: 0, hot: +3 };

  // Helper: simple fetch wrapper with basic error handling
  async function safeFetch(url){
    const res = await fetch(url);
    if(!res.ok) throw new Error(`Network error: ${res.status}`);
    return res.json();
  }

  // Geocode a city name using Open-Meteo geocoding API. Returns {name, latitude, longitude, country}
  async function geocodeCity(name){
    const q = encodeURIComponent(name.trim());
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${q}&count=5`;
    const data = await safeFetch(url);
    if(!data || !data.results || data.results.length === 0) throw new Error('No geocoding results');
    // Choose the top result
    const top = data.results[0];
    return { name: top.name + (top.admin1 ? ', ' + top.admin1 : '') + (top.country ? ', ' + top.country : ''), latitude: top.latitude, longitude: top.longitude };
  }

  // Fetch hourly forecast for a location using Open-Meteo
  async function fetchForecast(lat, lon){
    // Request temperature, precipitation probability, and wind speed; timezone=auto returns local times
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation_probability,windspeed_10m&timezone=auto`;
    return safeFetch(url);
  }

  // Parse hourly arrays and extract today's stats using local dates from API times
  function computeDailyStats(forecast){
    const { hourly } = forecast;
    const times = hourly.time; // array of ISO datetimes in local timezone (because timezone=auto)
    const temps = hourly.temperature_2m;
    const precips = hourly.precipitation_probability;
    const winds = hourly.windspeed_10m;

    if(!times || !temps) throw new Error('Incomplete forecast data');

    // Determine today's date in the forecast timezone by using the first timestamp's local date
    const firstDate = new Date(times[0]);
    const tzYear = firstDate.getFullYear();
    const tzMonth = firstDate.getMonth();
    const tzDate = firstDate.getDate();

    // Collect values belonging to the same local date
    const dayTemps = [];
    const dayPrecip = [];
    const dayWinds = [];

    for(let i=0;i<times.length;i++){
      const d = new Date(times[i]);
      if(d.getFullYear()===tzYear && d.getMonth()===tzMonth && d.getDate()===tzDate){
        dayTemps.push(temps[i]);
        if(precips && precips[i] != null) dayPrecip.push(precips[i]);
        if(winds && winds[i] != null) dayWinds.push(winds[i]);
      }
    }

    if(dayTemps.length===0) throw new Error('No hourly data for today in forecast');

    const high = Math.max(...dayTemps);
    const low = Math.min(...dayTemps);
    const maxPrecip = dayPrecip.length? Math.max(...dayPrecip):0;
    const maxWind = dayWinds.length? Math.max(...dayWinds):0;

    return { high, low, maxPrecip, maxWind };
  }

  // Deterministic outfit mapping rules.
  // Assumptions (sensible defaults):
  // - Temperature bands (Celsius) for 'normal' preference:
  //   <=10: heavy coat; 11-17: coat/jacket; 18-23: light jacket/long sleeve; >=24: t-shirt/shorts
  // - Precipitation probability: >=50% -> bring umbrella/rain jacket
  // - Wind: >=15 m/s -> add windproof layer
  // User preference shifts temperature by PREF_ADJUST (cold -> -3, hot -> +3), making system recommend warmer/lighter accordingly.
  function recommendOutfit(stats, pref){
    // Apply preference adjustment to temperatures (we adjust temps so "cold" users get heavier suggestions)
    const adj = PREF_ADJUST[pref] || 0;
    const effectiveHigh = stats.high + adj;
    const effectiveLow = stats.low + adj;

    // Base clothing by effectiveHigh
    let clothing = 'T-shirt & shorts';
    let icon = '👕';

    if(effectiveHigh <= 10) { clothing = 'Heavy coat / warm layers'; icon = '🧥'; }
    else if(effectiveHigh <= 17) { clothing = 'Jacket / sweater'; icon = '🧥'; }
    else if(effectiveHigh <= 23) { clothing = 'Light jacket or long sleeve'; icon = '🧣'; }
    else { clothing = 'Light clothes (T-shirt)'; icon = '👕'; }

    // Modifiers
    const modifiers = [];
    if(stats.maxPrecip >= 50) modifiers.push({text:'Bring umbrella or rain jacket', icon:'☔'});
    if(stats.maxWind >= 15) modifiers.push({text:'Windproof layer recommended', icon:'💨'});
    // If low is much colder than high, suggest layers
    if(effectiveLow + 4 <= effectiveHigh) modifiers.push({text:'Layer up — mornings/evenings will be cooler', icon:'🧣'});

    // Compose short reasoning
    const reasonParts = [`Day high ${Math.round(stats.high)}°C, low ${Math.round(stats.low)}°C.`];
    if(modifiers.length) reasonParts.push(modifiers.map(m=>m.text).join('; '));
    else reasonParts.push('No strong rain or wind expected.');

    // Final label with brief explanation
    const label = `${clothing}${modifiers.length? ' + ' + modifiers.map(m=>m.icon).join('') : ''}`;
    const reasoning = reasonParts.join(' ');

    return { icon, label, reasoning, details: { clothing, modifiers } };
  }

  // Update DOM with result
  function showResult(placeName, stats, pref, rec){
    placeEl.textContent = placeName || 'Selected location';
    tempsEl.textContent = `High: ${Math.round(stats.high)}°C  Low: ${Math.round(stats.low)}°C`;
    precipEl.textContent = `Precipitation chance (max hourly): ${Math.round(stats.maxPrecip)}%`;
    windEl.textContent = `Max wind: ${Math.round(stats.maxWind)} m/s`;

    outfitIcon.textContent = rec.icon;
    outfitText.textContent = rec.label;
    outfitReason.textContent = rec.reasoning + ` (preference: ${pref})`;
  }

  // Orchestrator: resolve input, fetch, compute, and render
  async function handleRequest(event){
    if(event) event.preventDefault();

    const mode = form.mode.value; // 'city' or 'latlon'
    const pref = prefSelect.value;
    placeEl.textContent = 'Loading…';
    outfitText.textContent = 'Working…';
    outfitReason.textContent = '';

    try{
      let lat, lon, placeName;
      if(mode === 'city'){
        const city = cityInput.value.trim();
        if(!city) throw new Error('Please enter a city name');
        const geo = await geocodeCity(city);
        lat = geo.latitude; lon = geo.longitude; placeName = geo.name;
      } else {
        lat = parseFloat(latInput.value); lon = parseFloat(lonInput.value);
        if(Number.isNaN(lat) || Number.isNaN(lon)) throw new Error('Please provide numeric latitude and longitude');
        placeName = `Lat ${lat.toFixed(3)}, Lon ${lon.toFixed(3)}`;
      }

      const forecast = await fetchForecast(lat, lon);
      const stats = computeDailyStats(forecast);
      const rec = recommendOutfit(stats, pref);
      showResult(placeName, stats, pref, rec);
    }catch(err){
      placeEl.textContent = 'Error';
      outfitText.textContent = err.message || 'Unknown error';
      outfitReason.textContent = '';
      tempsEl.textContent = '—';
      precipEl.textContent = '—';
      windEl.textContent = '—';
      console.error(err);
    }
  }

  // Toggle input method display
  function handleModeChange(){
    const mode = form.mode.value;
    if(mode === 'city'){
      cityInputs.hidden = false;
      latlonInputs.hidden = true;
    } else {
      cityInputs.hidden = true;
      latlonInputs.hidden = false;
    }
  }

  // Attach listeners
  form.addEventListener('submit', handleRequest);
  form.addEventListener('change', (e)=>{
    if(e.target && e.target.name === 'mode') handleModeChange();
  });

  // Initial UI state
  handleModeChange();

  // Expose small test runner for developer verification
  window.runTests = function(){
    // Basic unit-like tests for recommendOutfit logic using mocked stats
    const tests = [];

    tests.push({ name:'Cold, rainy, windy', stats:{high:8, low:2, maxPrecip:80, maxWind:18}, pref:'normal', expect:'Heavy coat' });
    tests.push({ name:'Warm, dry', stats:{high:26, low:18, maxPrecip:5, maxWind:3}, pref:'normal', expect:'Light clothes' });
    tests.push({ name:'Feels cold pref', stats:{high:16, low:8, maxPrecip:10, maxWind:4}, pref:'cold', expect:'Heavy' });
    tests.push({ name:'Feels hot pref', stats:{high:20, low:12, maxPrecip:10, maxWind:4}, pref:'hot', expect:'Light' });

    const results = tests.map(t=>{
      const r = recommendOutfit(t.stats, t.pref);
      return {name:t.name, expected:t.expect, got:r.label};
    });

    console.table(results);
    return results;
  };

})();
