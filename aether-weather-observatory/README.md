# 🌌 Aether // Nocturnal Weather Observatory

> A nocturnal meteorological observatory and tropospheric telemetry dashboard engineered with Origin Financial Midnight Gallery design principles. Built using semantic HTML5, modern CSS custom properties, and Vanilla JavaScript (ES6+).

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Open-Meteo](https://img.shields.io/badge/Open--Meteo-Free_API-00b3dd?style=for-the-badge)

---

## ✨ Features

- **Origin Midnight Design System:** Nocturnal aesthetic featuring deep midnight backdrops, atmospheric radial halos, monoline vector glyphs, and chromatic metric cards (Iris Gleam, Orchid Bloom, Deep Iris, Periwinkle, and Silver Inverted).
- **Dual Telemetry Architecture:**
  - **Open-Meteo High-Availability Engine:** Out-of-the-box, keyless global weather telemetry and geocoding without third-party rate limits.
  - **OpenWeatherMap Integration:** Optional high-precision fallback when custom credentials are provided.
- **Meteorological Physics Calculations:**
  - **Dew Point:** Dynamic approximation using the Magnus-Tetens formula.
  - **Wind Vectoring:** Directional compass tracking with Beaufort scale grading (Force 0 to Force 8+).
  - **Solar Arc Ephemeris:** Dynamic sunrise/sunset tracking and daylight progress calculation.
  - **Barometric Altimetry:** Sea-level pressure variance gradient monitoring.
- **Responsive 24-Hour SVG Trajectory Chart:** Handcrafted SVG sparkline displaying smooth cubic Bezier temperature curves.
- **Dynamic Chronometer & Timezone Intelligence:** Automatically synchronizes and displays the exact local time and date of the targeted global station.
- **Secure Geolocation:** Automated coordinate detection with reverse-geocoding fallback.
- **Dual Units:** Seamless one-click metric (°C / km/h) and imperial (°F / mph) conversions.

---

## 🛠️ Tech Stack

- **Frontend:** Semantic HTML5, CSS Grid & Flexbox, SVG manipulation via JavaScript.
- **Scripting:** Pure Vanilla JavaScript (ES6+ `async`/`await`, Canvas/SVG path math, Geolocation API).
- **APIs:** [Open-Meteo](https://open-meteo.com/) (primary zero-config telemetry) & [OpenWeatherMap](https://openweathermap.org/).

---

## 🚀 Getting Started

### Local Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/aether-weather-observatory.git
   cd aether-weather-observatory
   ```
2. Open `index.html` in any modern web browser or start a local server:
   ```bash
   npx serve .
   ```

### Connecting OpenWeatherMap (Optional)
The observatory works immediately worldwide via Open-Meteo. If you wish to enable the secondary OpenWeatherMap telemetry engine:
1. Obtain an API key from [OpenWeatherMap](https://openweathermap.org/api).
2. Save it in your browser console:
   ```javascript
   localStorage.setItem('owm_api_key', 'YOUR_KEY_HERE');
   ```

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
