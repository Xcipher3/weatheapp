import os
import uvicorn
from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from upstash_redis import Redis
import requests
from dotenv import load_dotenv
from typing import Optional

load_dotenv()
app = FastAPI(title="Weather App Preview")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect to Redis using the provided credentials
redis = Redis(
    url=os.getenv("UPSTASH_REDIS_REST_URL"),
    token=os.getenv("UPSTASH_REDIS_REST_TOKEN")
)

# Weather API configuration with your API key
WEATHER_API_URL = "https://api.weatherapi.com/v1/forecast.json"
API_KEY = os.getenv("WEATHER_API_KEY")

# API Routes
@app.get("/api")
def read_root():
    return {"message": "Welcome to the Weather App API"}

@app.get("/api/weather/{city}")
def get_weather(city: str, forecast: Optional[int] = None):
    """
    Get weather data for a specific city.
    The data is cached in Redis for 10 minutes to improve performance.
    """
    # Create a unique cache key for this city and forecast days
    cache_key = f"weather:{city}:{forecast or 0}"

    # Check if the data exists in cache
    cached_data = redis.get(cache_key)
    if cached_data:
        return {"source": "cache", "data": cached_data}

    # If not in cache, fetch from the weather API
    try:
        url = f"{WEATHER_API_URL}?key={API_KEY}&q={city}"
        if forecast:
            url += f"&days={forecast}"
            
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for HTTP errors
        weather_data = response.json()
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Error fetching weather data: {str(e)}")

    # Store the data in Redis cache with a 10-minute expiration
    redis.setex(cache_key, 600, weather_data)

    return {"source": "api", "data": weather_data}

@app.get("/api/weather/coordinates")
def get_weather_by_coordinates(lat: float, lon: float, forecast: Optional[int] = None):
    """
    Get weather data for specific coordinates (latitude and longitude).
    The data is cached in Redis for 10 minutes to improve performance.
    """
    # Create a unique cache key for these coordinates and forecast days
    cache_key = f"weather:coords:{lat},{lon}:{forecast or 0}"

    # Check if the data exists in cache
    cached_data = redis.get(cache_key)
    if cached_data:
        return {"source": "cache", "data": cached_data}

    # If not in cache, fetch from the weather API
    try:
        url = f"{WEATHER_API_URL}?key={API_KEY}&q={lat},{lon}"
        if forecast:
            url += f"&days={forecast}"
            
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for HTTP errors
        weather_data = response.json()
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Error fetching weather data: {str(e)}")

    # Store the data in Redis cache with a 10-minute expiration
    redis.setex(cache_key, 600, weather_data)

    return {"source": "api", "data": weather_data}

# Mount static files
app.mount("/static", StaticFiles(directory="."), name="static")

# Serve index.html at the root
@app.get("/", response_class=HTMLResponse)
async def serve_index():
    with open("index.html", "r") as f:
        html_content = f.read()
    return html_content

# Serve other files at the root level
@app.get("/{filename}")
async def serve_file(filename: str):
    if os.path.exists(filename):
        return FileResponse(filename)
    raise HTTPException(status_code=404, detail="File not found")

if __name__ == "__main__":
    print("Starting Weather App Preview Server...")
    print("Open your browser and navigate to http://localhost:8000")
    print("Press Ctrl+C to stop the server")
    uvicorn.run("preview_server:app", host="0.0.0.0", port=8000, reload=True)
