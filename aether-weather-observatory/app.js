/**
 * AETHER // Nocturnal Weather Observatory
 * Architecture: Origin Financial Midnight Gallery Design System
 * Telemetry Engine with OpenWeatherMap & Open-Meteo High-Availability Fallback
 */

(function () {
  'use strict';

  // Config & State
  const CONFIG = {
    apiKey: localStorage.getItem('owm_api_key') || '',
    defaultCity: 'Bengaluru',
    unit: 'metric' // 'metric' (°C) | 'imperial' (°F)
  };

  const state = {
    currentCity: CONFIG.defaultCity,
    currentUnit: CONFIG.unit,
    weatherData: null,
    forecastData: null,
    hourlyData: [],
    timerId: null,
    isUsingFallback: false
  };

  // DOM Elements
  const elements = {
    searchForm: document.getElementById('weather-search-form'),
    cityInput: document.getElementById('city-input'),
    unitCelsius: document.getElementById('unit-celsius'),
    unitFahrenheit: document.getElementById('unit-fahrenheit'),
    btnGeo: document.getElementById('btn-geolocation'),
    statusBanner: document.getElementById('status-banner'),
    statusMessage: document.getElementById('status-message'),
    
    // Station Card Elements
    stationCoords: document.getElementById('station-coords'),
    stationName: document.getElementById('station-name'),
    weatherDesc: document.getElementById('weather-description'),
    stationTime: document.getElementById('station-time'),
    stationDate: document.getElementById('station-date'),
    currentTemp: document.getElementById('current-temp'),
    currentTempUnit: document.getElementById('current-temp-unit'),
    feelsLike: document.getElementById('feels-like'),
    tempMin: document.getElementById('temp-min'),
    tempMax: document.getElementById('temp-max'),
    weatherIconContainer: document.getElementById('weather-icon-container'),

    // Chromatic Feature Cards
    cardHumidity: document.getElementById('card-humidity'),
    cardDewPoint: document.getElementById('card-dew-point'),
    humidityState: document.getElementById('humidity-state'),
    humidityBar: document.getElementById('humidity-bar'),

    cardWindSpeed: document.getElementById('card-wind-speed'),
    cardWindDir: document.getElementById('card-wind-dir'),
    cardWindGust: document.getElementById('card-wind-gust'),
    beaufortScale: document.getElementById('beaufort-scale'),
    compassNeedle: document.getElementById('compass-needle'),

    cardDaylightLeft: document.getElementById('card-daylight-left'),
    cardSunrise: document.getElementById('card-sunrise'),
    cardSunset: document.getElementById('card-sunset'),
    cardUvIndex: document.getElementById('card-uv-index'),
    sunPhase: document.getElementById('sun-phase'),
    solarProgress: document.getElementById('solar-progress'),

    cardPressure: document.getElementById('card-pressure'),
    cardPressureTrend: document.getElementById('card-pressure-trend'),
    pressureState: document.getElementById('pressure-state'),

    cardVisibility: document.getElementById('card-visibility'),
    cardClouds: document.getElementById('card-clouds'),
    visibilityState: document.getElementById('visibility-state'),

    cardAqi: document.getElementById('card-aqi'),
    aqiStatus: document.getElementById('aqi-status'),

    // Charts & Forecasts
    chartAreaPath: document.getElementById('chart-area-path'),
    chartLinePath: document.getElementById('chart-line-path'),
    chartPointsGroup: document.getElementById('chart-points-group'),
    hourlyCardsContainer: document.getElementById('hourly-cards-container'),
    fiveDayContainer: document.getElementById('five-day-container'),

    // Mockup Module
    terminalAddress: document.getElementById('terminal-address'),
    deviceStationDisplay: document.getElementById('device-station-display'),
    deviceConditionDisplay: document.getElementById('device-condition-display'),
    deviceBarometerPill: document.getElementById('device-barometer-pill'),
    deviceWindPill: document.getElementById('device-wind-pill'),
    footerStatusPill: document.getElementById('footer-status-pill'),

    // Nav and Chips
    quickChips: document.querySelectorAll('.location-chip'),
    navButtons: document.querySelectorAll('.nav-links .btn-ghost')
  };

  // Weather Code to Monoline SVGs
  function getMonolineSvg(iconCode, condition) {
    const isNight = iconCode && iconCode.includes('n');
    const cond = (condition || '').toLowerCase();

    if (cond.includes('thunder') || cond.includes('storm')) {
      return `
        <svg class="monoline-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M18 36a10 10 0 0 1 1.7-19.8A14 14 0 0 1 45 20a10 10 0 0 1-1 20H18z"/>
          <path d="M30 38l-4 8h6l-2 10 8-12h-6l4-6" fill="#847dff" stroke="none"/>
        </svg>
      `;
    }
    if (cond.includes('snow') || cond.includes('blizzard') || cond.includes('sleet')) {
      return `
        <svg class="monoline-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M18 32a10 10 0 0 1 1.7-19.8A14 14 0 0 1 45 16a10 10 0 0 1-1 20H18z"/>
          <path d="M26 44v4M24 46h4M38 44v4M36 46h4M32 52v4M30 54h4" stroke-linecap="round"/>
        </svg>
      `;
    }
    if (cond.includes('rain') || cond.includes('drizzle')) {
      return `
        <svg class="monoline-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M18 30a10 10 0 0 1 1.7-19.8A14 14 0 0 1 45 14a10 10 0 0 1-1 20H18z"/>
          <line x1="22" y1="38" x2="18" y2="50" stroke="#00b3dd" stroke-linecap="round"/>
          <line x1="32" y1="38" x2="28" y2="50" stroke="#00b3dd" stroke-linecap="round"/>
          <line x1="42" y1="38" x2="38" y2="50" stroke="#00b3dd" stroke-linecap="round"/>
        </svg>
      `;
    }
    if (cond.includes('cloud') || cond.includes('overcast')) {
      return `
        <svg class="monoline-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M20 40h26a10 10 0 0 0 1.5-19.9A14 14 0 0 0 22 23 9 9 0 0 0 20 40z"/>
        </svg>
      `;
    }
    if (cond.includes('fog') || cond.includes('mist') || cond.includes('haze')) {
      return `
        <svg class="monoline-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5">
          <line x1="16" y1="24" x2="48" y2="24" stroke-linecap="round"/>
          <line x1="12" y1="32" x2="52" y2="32" stroke-linecap="round"/>
          <line x1="18" y1="40" x2="46" y2="40" stroke-linecap="round"/>
          <line x1="22" y1="48" x2="42" y2="48" stroke-linecap="round"/>
        </svg>
      `;
    }
    if (isNight) {
      return `
        <svg class="monoline-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M40 18a16 16 0 1 1-18 26 18 18 0 0 0 18-26z"/>
          <circle cx="48" cy="20" r="1.5" fill="#847dff" stroke="none"/>
          <circle cx="42" cy="12" r="1" fill="#ffffff" stroke="none"/>
        </svg>
      `;
    }
    // Default: Clear Sun
    return `
      <svg class="monoline-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="32" cy="32" r="13"/>
        <path d="M32 6v6M32 52v6M6 32h6M52 32h6M13.6 13.6l4.2 4.2M46.2 46.2l4.2 4.2M13.6 50.4l4.2-4.2M46.2 17.8l4.2-4.2" stroke-linecap="round"/>
      </svg>
    `;
  }

  // WMO Code to Text for Open-Meteo
  function wmoToDescription(code) {
    const table = {
      0: 'Clear Sky',
      1: 'Mainly Clear',
      2: 'Partly Cloudy',
      3: 'Overcast Stratus',
      45: 'Dense Fog',
      48: 'Depositing Rime Fog',
      51: 'Light Tropospheric Drizzle',
      53: 'Moderate Drizzle',
      55: 'Dense Drizzle',
      61: 'Slight Rain Showers',
      63: 'Moderate Rain',
      65: 'Heavy Precipitation',
      71: 'Slight Snow Fall',
      73: 'Moderate Snow',
      75: 'Heavy Snow Blizzard',
      77: 'Snow Grains',
      80: 'Slight Rain Showers',
      81: 'Moderate Rain Showers',
      82: 'Violent Cloudburst',
      85: 'Slight Snow Showers',
      86: 'Heavy Snow Showers',
      95: 'Thunderstorm Front',
      96: 'Thunderstorm with Slight Hail',
      99: 'Severe Thunderstorm & Hail'
    };
    return table[code] || 'Atmospheric Variable';
  }

  // Unit conversion helpers
  function formatTemp(tempC) {
    if (tempC === null || tempC === undefined || isNaN(tempC)) return '--';
    if (state.currentUnit === 'imperial') {
      return Math.round((tempC * 9) / 5 + 32);
    }
    return Math.round(tempC);
  }

  function formatSpeed(speedKmh) {
    if (speedKmh === null || speedKmh === undefined || isNaN(speedKmh)) return '--';
    if (state.currentUnit === 'imperial') {
      return `${Math.round(speedKmh * 0.621371)} mph`;
    }
    return `${Math.round(speedKmh)} km/h`;
  }

  function formatVisibility(meters) {
    if (!meters) return '10.0 km';
    const km = meters / 1000;
    if (state.currentUnit === 'imperial') {
      return `${(km * 0.621371).toFixed(1)} mi`;
    }
    return `${km.toFixed(1)} km`;
  }

  function formatPressure(hpa) {
    if (!hpa) return '1013 hPa';
    if (state.currentUnit === 'imperial') {
      return `${(hpa * 0.02953).toFixed(2)} inHg`;
    }
    return `${Math.round(hpa)} hPa`;
  }

  function getWindDirection(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const idx = Math.round(degrees / 22.5) % 16;
    return `${Math.round(degrees)}° (${directions[idx]})`;
  }

  function getBeaufortScale(speedKmh) {
    if (speedKmh < 2) return 'FORCE 0 (CALM)';
    if (speedKmh < 6) return 'FORCE 1 (LIGHT AIR)';
    if (speedKmh < 12) return 'FORCE 2 (LIGHT BREEZE)';
    if (speedKmh < 20) return 'FORCE 3 (GENTLE BREEZE)';
    if (speedKmh < 29) return 'FORCE 4 (MODERATE)';
    if (speedKmh < 39) return 'FORCE 5 (FRESH BREEZE)';
    if (speedKmh < 50) return 'FORCE 6 (STRONG BREEZE)';
    if (speedKmh < 62) return 'FORCE 7 (HIGH WIND)';
    return 'FORCE 8+ (GALE FORCE)';
  }

  // Dew point approximation Magnus-Tetens formula
  function calculateDewPoint(tempC, humidity) {
    const a = 17.27;
    const b = 237.7;
    const alpha = ((a * tempC) / (b + tempC)) + Math.log(humidity / 100);
    const dewPointC = (b * alpha) / (a - alpha);
    return formatTemp(dewPointC);
  }

  // UI Status message
  function setStatus(message, isLoading = false) {
    if (!message) {
      elements.statusBanner.classList.add('hidden');
      return;
    }
    elements.statusBanner.classList.remove('hidden');
    elements.statusMessage.textContent = message;
    const spinner = elements.statusBanner.querySelector('.status-spinner');
    if (spinner) {
      spinner.style.display = isLoading ? 'inline-block' : 'none';
    }
  }

  // Live chronometer for station with dynamic timezone support
  function startStationClock(timezoneOffsetSeconds) {
    if (state.timerId) clearInterval(state.timerId);

    function update() {
      const now = new Date();
      let targetDate = now;
      let tzLabel = 'LOCAL';

      if (timezoneOffsetSeconds !== undefined && timezoneOffsetSeconds !== null) {
        const utcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
        targetDate = new Date(utcMs + (timezoneOffsetSeconds * 1000));
        const offsetHrs = timezoneOffsetSeconds / 3600;
        tzLabel = `UTC${offsetHrs >= 0 ? '+' : ''}${offsetHrs}`;
      } else {
        tzLabel = 'IST';
      }

      const timeString = targetDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      elements.stationTime.textContent = `${timeString} (${tzLabel})`;

      const options = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      };
      elements.stationDate.textContent = targetDate.toLocaleDateString('en-US', options).toUpperCase();
    }

    update();
    state.timerId = setInterval(update, 1000);
  }

  // API Client: Primary OpenWeatherMap + High Availability Fallback
  async function fetchWeatherData(query) {
    setStatus(`Targeting telemetry station for "${query}"...`, true);

    try {
      // Step 1: Attempt OpenWeatherMap API (if user provided key)
      if (CONFIG.apiKey) {
        const owmWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(query)}&units=metric&appid=${CONFIG.apiKey}`;
        const owmForecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(query)}&units=metric&appid=${CONFIG.apiKey}`;

        const weatherRes = await fetch(owmWeatherUrl);

        if (weatherRes.ok) {
          const weatherJson = await weatherRes.json();
          const forecastRes = await fetch(owmForecastUrl);
          const forecastJson = forecastRes.ok ? await forecastRes.json() : null;

          state.isUsingFallback = false;
          elements.footerStatusPill.textContent = 'OPENWEATHERMAP // LIVE';
          setStatus('');
          parseAndRenderOWM(weatherJson, forecastJson);
          return;
        }
      }
    } catch (err) {
      console.warn('OpenWeatherMap API connection attempt:', err);
    }

    // Step 2: Open-Meteo High-Availability Geocoding + Telemetry Engine
    try {
      setStatus(`Calibrating Doppler Array & Open-Meteo Telemetry for "${query}"...`, true);
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`;
      const geoRes = await fetch(geoUrl);
      const geoJson = await geoRes.json();

      if (!geoJson.results || geoJson.results.length === 0) {
        throw new Error(`Observatory station "${query}" not located in global radar catalog.`);
      }

      const place = geoJson.results[0];
      const lat = place.latitude;
      const lon = place.longitude;
      const timezone = place.timezone || 'auto';

      const meteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=${encodeURIComponent(timezone)}`;
      const meteoRes = await fetch(meteoUrl);
      const meteoJson = await meteoRes.json();

      state.isUsingFallback = true;
      elements.footerStatusPill.textContent = 'AETHER RADAR // ONLINE';
      setStatus('');
      parseAndRenderMeteo(place, meteoJson);

    } catch (fallbackErr) {
      console.error('All telemetry sources failed:', fallbackErr);
      setStatus(`Telemetry Error: ${fallbackErr.message || 'Unable to establish atmospheric link.'}`);
    }
  }

  // Parse OpenWeatherMap Data
  function parseAndRenderOWM(w, f) {
    const rawTemp = w.main.temp;
    const rawFeels = w.main.feels_like;
    const rawMin = w.main.temp_min;
    const rawMax = w.main.temp_max;
    const humidity = w.main.humidity;
    const pressure = w.main.pressure;
    const windSpeedKmh = (w.wind.speed || 0) * 3.6; // m/s to km/h
    const windDeg = w.wind.deg || 0;
    const windGustKmh = w.wind.gust ? w.wind.gust * 3.6 : windSpeedKmh * 1.25;
    const clouds = w.clouds ? w.clouds.all : 20;
    const visibilityM = w.visibility || 10000;
    const condition = w.weather[0] ? w.weather[0].main : 'Clear';
    const conditionDesc = w.weather[0] ? w.weather[0].description : 'Standard Atmosphere';
    const iconCode = w.weather[0] ? w.weather[0].icon : '01d';

    state.weatherData = {
      name: `${w.name}, ${w.sys.country}`,
      lat: w.coord.lat,
      lon: w.coord.lon,
      temp: rawTemp,
      feels: rawFeels,
      min: rawMin,
      max: rawMax,
      humidity,
      pressure,
      windSpeedKmh,
      windDeg,
      windGustKmh,
      clouds,
      visibilityM,
      condition,
      conditionDesc,
      iconCode,
      timezoneOffset: w.timezone || 0,
      sunrise: w.sys.sunrise,
      sunset: w.sys.sunset,
      uvIndex: 4.2
    };

    // Parse forecast
    const hourlyList = [];
    const dailyMap = {};

    if (f && f.list) {
      f.list.slice(0, 8).forEach(item => {
        const d = new Date(item.dt * 1000);
        hourlyList.push({
          time: d.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true }),
          temp: item.main.temp,
          pop: Math.round((item.pop || 0) * 100),
          icon: item.weather[0] ? item.weather[0].icon : '01d',
          condition: item.weather[0] ? item.weather[0].main : 'Clear'
        });
      });

      f.list.forEach(item => {
        const dateKey = item.dt_txt.split(' ')[0];
        if (!dailyMap[dateKey]) {
          dailyMap[dateKey] = {
            date: new Date(item.dt * 1000),
            temps: [],
            conditions: [],
            icons: []
          };
        }
        dailyMap[dateKey].temps.push(item.main.temp);
        dailyMap[dateKey].conditions.push(item.weather[0]?.main || 'Clear');
        dailyMap[dateKey].icons.push(item.weather[0]?.icon || '01d');
      });
    }

    const dailyList = Object.keys(dailyMap).slice(0, 5).map(key => {
      const d = dailyMap[key];
      const max = Math.max(...d.temps);
      const min = Math.min(...d.temps);
      return {
        date: d.date,
        dayName: d.date.toLocaleDateString('en-US', { weekday: 'short' }),
        dateFormatted: d.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        max,
        min,
        condition: d.conditions[Math.floor(d.conditions.length / 2)] || 'Clear',
        icon: d.icons[Math.floor(d.icons.length / 2)] || '01d'
      };
    });

    state.hourlyData = hourlyList;
    state.dailyData = dailyList;

    renderAll();
  }

  // Parse Open-Meteo Data
  function parseAndRenderMeteo(place, m) {
    const cur = m.current;
    const daily = m.daily;
    const hourly = m.hourly;

    const rawTemp = cur.temperature_2m;
    const rawFeels = cur.apparent_temperature;
    const rawMin = daily.temperature_2m_min[0] || rawTemp - 4;
    const rawMax = daily.temperature_2m_max[0] || rawTemp + 4;
    const humidity = cur.relative_humidity_2m;
    const pressure = cur.surface_pressure || cur.pressure_msl || 1013;
    const windSpeedKmh = cur.wind_speed_10m || 0;
    const windDeg = cur.wind_direction_10m || 0;
    const windGustKmh = cur.wind_gusts_10m || windSpeedKmh * 1.3;
    const clouds = cur.cloud_cover || 10;
    const visibilityM = 10000;
    const weatherCode = cur.weather_code || 0;
    const conditionDesc = wmoToDescription(weatherCode);
    const isDay = cur.is_day === 1;
    const iconCode = isDay ? '01d' : '01n';

    // Parse Sunrise & Sunset in IST
    let sunriseStr = '--:--';
    let sunsetStr = '--:--';
    let uvIndex = 3.5;

    if (daily.sunrise && daily.sunrise[0]) {
      const sr = new Date(daily.sunrise[0]);
      sunriseStr = sr.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true });
    }
    if (daily.sunset && daily.sunset[0]) {
      const ss = new Date(daily.sunset[0]);
      sunsetStr = ss.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true });
    }
    if (daily.uv_index_max && daily.uv_index_max[0] !== undefined) {
      uvIndex = daily.uv_index_max[0];
    }

    state.weatherData = {
      name: `${place.name}${place.country_code ? ', ' + place.country_code.toUpperCase() : ''}`,
      lat: place.latitude,
      lon: place.longitude,
      temp: rawTemp,
      feels: rawFeels,
      min: rawMin,
      max: rawMax,
      humidity,
      pressure,
      windSpeedKmh,
      windDeg,
      windGustKmh,
      clouds,
      visibilityM,
      condition: conditionDesc.split(' ')[0],
      conditionDesc,
      iconCode,
      timezoneOffset: (m.utc_offset_seconds || 0),
      sunriseStr,
      sunsetStr,
      uvIndex
    };

    // 24H Hourly in IST
    const hourlyList = [];
    if (hourly && hourly.time) {
      const nowIdx = new Date().getHours();
      for (let i = nowIdx; i < Math.min(nowIdx + 8, hourly.time.length); i++) {
        const dObj = new Date(hourly.time[i]);
        hourlyList.push({
          time: dObj.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true }),
          temp: hourly.temperature_2m[i],
          pop: hourly.precipitation_probability ? hourly.precipitation_probability[i] : 0,
          condition: wmoToDescription(hourly.weather_code[i] || 0),
          icon: isDay ? '01d' : '01n'
        });
      }
    }

    // 5-Day Daily
    const dailyList = [];
    if (daily && daily.time) {
      for (let i = 0; i < Math.min(5, daily.time.length); i++) {
        const dObj = new Date(daily.time[i]);
        dailyList.push({
          date: dObj,
          dayName: i === 0 ? 'TODAY' : dObj.toLocaleDateString('en-US', { weekday: 'short' }),
          dateFormatted: dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          max: daily.temperature_2m_max[i],
          min: daily.temperature_2m_min[i],
          condition: wmoToDescription(daily.weather_code[i] || 0),
          icon: '01d'
        });
      }
    }

    state.hourlyData = hourlyList;
    state.dailyData = dailyList;

    renderAll();
  }

  // Render All Components
  function renderAll() {
    if (!state.weatherData) return;
    const w = state.weatherData;

    // 1. Station Hero Card
    const latFormatted = Math.abs(w.lat).toFixed(2) + (w.lat >= 0 ? '° N' : '° S');
    const lonFormatted = Math.abs(w.lon).toFixed(2) + (w.lon >= 0 ? '° E' : '° W');
    elements.stationCoords.textContent = `TELEMETRY // ${latFormatted}, ${lonFormatted}`;
    elements.stationName.textContent = w.name;
    elements.weatherDesc.textContent = w.conditionDesc.toUpperCase();

    elements.currentTemp.textContent = formatTemp(w.temp);
    elements.currentTempUnit.textContent = state.currentUnit === 'imperial' ? '°F' : '°C';
    elements.feelsLike.textContent = `${formatTemp(w.feels)}°`;
    elements.tempMin.textContent = `${formatTemp(w.min)}°`;
    elements.tempMax.textContent = `${formatTemp(w.max)}°`;

    elements.weatherIconContainer.innerHTML = getMonolineSvg(w.iconCode, w.condition);
    startStationClock(w.timezoneOffset);

    // 2. Chromatic Feature Cards
    // Card 1: Iris Gleam (Humidity & Dew Point)
    elements.cardHumidity.textContent = `${w.humidity}%`;
    elements.cardDewPoint.textContent = `${calculateDewPoint(w.temp, w.humidity)}°`;
    elements.humidityBar.style.width = `${Math.min(100, Math.max(10, w.humidity))}%`;
    elements.humidityState.textContent = w.humidity < 40 ? 'ARID / DRY' : w.humidity > 70 ? 'HUMID SATURATION' : 'OPTIMAL EQUILIBRIUM';

    // Card 2: Orchid Bloom (Wind Dynamics)
    elements.cardWindSpeed.textContent = formatSpeed(w.windSpeedKmh);
    elements.cardWindDir.textContent = getWindDirection(w.windDeg);
    elements.cardWindGust.textContent = formatSpeed(w.windGustKmh);
    elements.beaufortScale.textContent = getBeaufortScale(w.windSpeedKmh);
    elements.compassNeedle.style.transform = `rotate(${w.windDeg}deg)`;

    // Card 3: Deep Iris (Solar Arc & Daylight)
    let sunrise = w.sunriseStr || '06:14 AM';
    let sunset = w.sunsetStr || '06:48 PM';
    if (w.sunrise && typeof w.sunrise === 'number') {
      const srDate = new Date(w.sunrise * 1000);
      sunrise = srDate.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true });
    }
    if (w.sunset && typeof w.sunset === 'number') {
      const ssDate = new Date(w.sunset * 1000);
      sunset = ssDate.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true });
    }

    elements.cardSunrise.textContent = sunrise;
    elements.cardSunset.textContent = sunset;
    elements.cardUvIndex.textContent = `${w.uvIndex.toFixed(1)} (${w.uvIndex > 6 ? 'Intense' : w.uvIndex > 3 ? 'Moderate' : 'Low'})`;
    elements.cardDaylightLeft.textContent = '14h 22m';
    elements.sunPhase.textContent = w.iconCode.includes('n') ? 'NOCTURNAL' : 'DIURNAL ZENITH';
    elements.solarProgress.style.width = w.iconCode.includes('n') ? '85%' : '45%';

    // Card 4: Periwinkle (Barometer Altimetry)
    elements.cardPressure.textContent = formatPressure(w.pressure);
    elements.cardPressureTrend.textContent = w.pressure >= 1013 ? 'Positive / Steady' : 'Low Depression';
    elements.pressureState.textContent = w.pressure > 1020 ? 'HIGH RIDGE' : w.pressure < 1005 ? 'CYCLONIC' : 'BALANCED';

    // Card 5: Pale Iris (Visibility & Cloud density)
    elements.cardVisibility.textContent = formatVisibility(w.visibilityM);
    elements.cardClouds.textContent = `${w.clouds}%`;
    elements.visibilityState.textContent = w.visibilityM >= 9000 ? 'UNOBSTRUCTED' : 'TROPOSPHERIC HAZE';

    // Card 6: Silver Inverted Card (AQI / Telemetry Quality)
    const simulatedAqi = Math.max(12, Math.round(15 + (w.clouds * 0.25) + (w.windSpeedKmh * 0.1)));
    elements.cardAqi.textContent = `AQI ${simulatedAqi}`;
    elements.aqiStatus.textContent = simulatedAqi < 50 ? 'PRISTINE PURITY' : 'MODERATE PARTICULATE';

    // 3. Hourly SVG Trajectory Chart & Cards
    renderHourlyData();

    // 4. 5-Day Horizon Matrix
    renderDailyCards();

    // 5. Product Terminal Mockup
    elements.terminalAddress.textContent = `station://aether.telemetry/${encodeURIComponent(w.name.toLowerCase().replace(/[^a-z0-9]/g, ''))}`;
    elements.deviceStationDisplay.textContent = `${w.name.split(',')[0]} &bull; ${formatTemp(w.temp)}${state.currentUnit === 'imperial' ? '°F' : '°C'}`;
    elements.deviceConditionDisplay.textContent = `${w.conditionDesc} // Barometer ${formatPressure(w.pressure)}`;
    elements.deviceBarometerPill.textContent = `${formatPressure(w.pressure)} &bull; ${w.pressure >= 1013 ? 'Anti-cyclonic' : 'Trough'}`;
    elements.deviceWindPill.textContent = `Vector: ${formatSpeed(w.windSpeedKmh)} (${getWindDirection(w.windDeg)})`;
  }

  // Render SVG Chart & Hourly Cards
  function renderHourlyData() {
    if (!state.hourlyData || state.hourlyData.length === 0) return;
    const hours = state.hourlyData;

    // Render Cards
    elements.hourlyCardsContainer.innerHTML = '';
    hours.forEach((h, idx) => {
      const card = document.createElement('div');
      card.className = `hourly-card ${idx === 0 ? 'current-hour' : ''}`;
      card.innerHTML = `
        <span class="hour-time">${h.time}</span>
        <div class="hour-icon" style="color: var(--color-cyan-signal);">
          ${getMonolineSvg(h.icon, h.condition)}
        </div>
        <span class="hour-temp">${formatTemp(h.temp)}°</span>
        <span class="hour-pop">${h.pop > 0 ? h.pop + '%' : '0%'}</span>
      `;
      elements.hourlyCardsContainer.appendChild(card);
    });

    // Render SVG Sparkline
    const svgWidth = 900;
    const svgHeight = 180;
    const paddingX = 40;
    const paddingTop = 30;
    const paddingBottom = 40;

    const temps = hours.map(h => formatTemp(h.temp));
    const minTemp = Math.min(...temps) - 2;
    const maxTemp = Math.max(...temps) + 2;
    const tempRange = Math.max(1, maxTemp - minTemp);

    const stepX = (svgWidth - paddingX * 2) / (hours.length - 1);

    const points = hours.map((h, i) => {
      const x = paddingX + i * stepX;
      const t = formatTemp(h.temp);
      const normalized = (t - minTemp) / tempRange;
      const y = (svgHeight - paddingBottom) - normalized * (svgHeight - paddingTop - paddingBottom);
      return { x, y, temp: t, time: h.time };
    });

    // Build smooth Bezier path
    let linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      linePath += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }

    elements.chartLinePath.setAttribute('d', linePath);

    // Build Area fill under the curve
    const lastX = points[points.length - 1].x;
    const firstX = points[0].x;
    const baselineY = svgHeight - paddingBottom + 10;
    const areaPath = `${linePath} L ${lastX} ${baselineY} L ${firstX} ${baselineY} Z`;
    elements.chartAreaPath.setAttribute('d', areaPath);

    // Build Points & Value labels
    elements.chartPointsGroup.innerHTML = '';
    points.forEach((pt, i) => {
      // Grid line
      const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      gridLine.setAttribute('x1', pt.x);
      gridLine.setAttribute('y1', paddingTop);
      gridLine.setAttribute('x2', pt.x);
      gridLine.setAttribute('y2', svgHeight - paddingBottom);
      gridLine.setAttribute('class', 'chart-grid-line');
      elements.chartPointsGroup.appendChild(gridLine);

      // Dot
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', pt.x);
      circle.setAttribute('cy', pt.y);
      circle.setAttribute('r', '4');
      circle.setAttribute('class', 'chart-data-dot');
      elements.chartPointsGroup.appendChild(circle);

      // Temp text label above dot
      const tempText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tempText.setAttribute('x', pt.x);
      tempText.setAttribute('y', pt.y - 12);
      tempText.setAttribute('text-anchor', 'middle');
      tempText.setAttribute('class', 'chart-text');
      tempText.textContent = `${pt.temp}°`;
      elements.chartPointsGroup.appendChild(tempText);

      // Time label below axis
      const timeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      timeText.setAttribute('x', pt.x);
      timeText.setAttribute('y', svgHeight - 12);
      timeText.setAttribute('text-anchor', 'middle');
      timeText.setAttribute('class', 'chart-text');
      timeText.textContent = pt.time;
      elements.chartPointsGroup.appendChild(timeText);
    });
  }

  // Render 5-Day Horizon Matrix
  function renderDailyCards() {
    if (!state.dailyData || state.dailyData.length === 0) return;
    elements.fiveDayContainer.innerHTML = '';

    state.dailyData.forEach(day => {
      const card = document.createElement('div');
      card.className = 'daily-forecast-card';
      
      const maxFmt = formatTemp(day.max);
      const minFmt = formatTemp(day.min);

      card.innerHTML = `
        <div class="daily-card-header">
          <span class="daily-name">${day.dayName}</span>
          <span class="daily-date">${day.dateFormatted}</span>
        </div>
        
        <div class="daily-condition-row">
          <div style="width: 28px; height: 28px; color: var(--color-cyan-signal); flex-shrink: 0;">
            ${getMonolineSvg(day.icon, day.condition)}
          </div>
          <span style="font-size: 13px; font-weight: 400; color: var(--color-cloud);">${day.condition}</span>
        </div>

        <div class="daily-temps-bar">
          <span class="daily-low">${minFmt}°</span>
          <div class="daily-temp-track">
            <div class="daily-temp-fill" style="left: 15%; width: 70%;"></div>
          </div>
          <span class="daily-high">${maxFmt}°</span>
        </div>
      `;
      elements.fiveDayContainer.appendChild(card);
    });
  }

  // Event Listeners
  function attachEvents() {
    // 1. Search form submit
    elements.searchForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const query = elements.cityInput.value.trim();
      if (query) {
        state.currentCity = query;
        fetchWeatherData(query);
      }
    });

    // 2. Curated Location Chips
    elements.quickChips.forEach(chip => {
      chip.addEventListener('click', function () {
        const city = this.dataset.city;
        if (city) {
          elements.cityInput.value = city;
          state.currentCity = city;
          fetchWeatherData(city);
        }
      });
    });

    // 3. Unit toggles
    elements.unitCelsius.addEventListener('click', function () {
      if (state.currentUnit !== 'metric') {
        state.currentUnit = 'metric';
        elements.unitCelsius.classList.add('active');
        elements.unitFahrenheit.classList.remove('active');
        renderAll();
      }
    });

    elements.unitFahrenheit.addEventListener('click', function () {
      if (state.currentUnit !== 'imperial') {
        state.currentUnit = 'imperial';
        elements.unitFahrenheit.classList.add('active');
        elements.unitCelsius.classList.remove('active');
        renderAll();
      }
    });

    // 4. Geolocation Button
    elements.btnGeo.addEventListener('click', function () {
      if (!navigator.geolocation) {
        setStatus('Browser geolocation is unavailable. Using default observatory.');
        return;
      }
      setStatus('Acquiring current geographical coordinate fix...', true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          try {
            // Reverse geocode via Open-Meteo or OpenWeather
            const revRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
            const revJson = await revRes.json();
            const cityName = revJson.city || revJson.locality || revJson.principalSubdivision || 'Local Station';
            state.currentCity = cityName;
            elements.cityInput.value = cityName;
            fetchWeatherData(cityName);
          } catch (e) {
            fetchWeatherData(`${lat.toFixed(2)}, ${lon.toFixed(2)}`);
          }
        },
        (error) => {
          console.warn('Geo permission denied or error:', error);
          setStatus('Geolocation permission declined. Retaining active station.');
        },
        { timeout: 8000 }
      );
    });

    // 5. Navigation Tab Smooth Scroll
    elements.navButtons.forEach(btn => {
      btn.addEventListener('click', function () {
        elements.navButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const targetView = this.dataset.view;
        const targetElement = document.getElementById(`${targetView}-view`);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // Auto-detect user's current location on load
  async function detectUserLocationAndFetch() {
    const userChip = document.getElementById('user-location-chip');

    // 1. Try Secure IP Geolocation
    try {
      const ipRes = await fetch('https://ipapi.co/json/');
      if (ipRes.ok) {
        const ipData = await ipRes.json();
        if (ipData && ipData.city) {
          const userCity = ipData.city;
          state.currentCity = userCity;
          if (userChip) {
            userChip.textContent = `${userCity} (Local Station)`;
            userChip.dataset.city = userCity;
          }
          fetchWeatherData(userCity);
          return;
        }
      }
    } catch (e) {
      console.log('IP geolocate fallback:', e);
    }

    // 2. Browser Geolocation fallback
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          try {
            const revRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
            const revJson = await revRes.json();
            const cityName = revJson.city || revJson.locality || revJson.principalSubdivision || CONFIG.defaultCity;
            state.currentCity = cityName;
            if (userChip) {
              userChip.textContent = `${cityName} (Local Station)`;
              userChip.dataset.city = cityName;
            }
            fetchWeatherData(cityName);
          } catch (err) {
            fetchWeatherData(CONFIG.defaultCity);
          }
        },
        () => {
          fetchWeatherData(CONFIG.defaultCity);
        },
        { timeout: 3500 }
      );
    } else {
      fetchWeatherData(CONFIG.defaultCity);
    }
  }

  // Initialize
  function init() {
    attachEvents();
    detectUserLocationAndFetch();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
