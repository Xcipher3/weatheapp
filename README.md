# Weather App

A beautiful, interactive weather application with animations and geolocation support.

## Features

- Current weather information for any city
- Automatic location detection
- Weather-specific animations
- Responsive design for all devices
- Redis caching for improved performance

## Preview the App

To preview the complete app (frontend + backend), follow these steps:

1. Make sure you have all dependencies installed:
   \`\`\`
   pip install fastapi upstash-redis uvicorn[standard] requests python-dotenv
   \`\`\`

2. Run the preview server:
   \`\`\`
   python preview_server.py
   \`\`\`

3. Open your browser and navigate to:
   \`\`\`
   http://localhost:8000
   \`\`\`

## API Credentials

The app uses the following APIs:
- WeatherAPI.com for weather data
- Upstash Redis for caching

Your API credentials are stored in the `.env` file.

## Files Structure

- `index.html` - Main HTML file
- `styles.css` - Main styles
- `animations.css` - Weather animations styles
- `script.js` - Main JavaScript file
- `weather-animations.js` - Weather animations logic
- `preview_server.py` - Combined server for previewing the app
- `weather_app.py` - Original FastAPI backend
- `.env` - Environment variables and API keys

## Development

For development, you can run the preview server with auto-reload:
\`\`\`
python preview_server.py
\`\`\`

Any changes to the files will automatically reload the server.
\`\`\`

Let's create a simple startup script to make it even easier to preview the app:
