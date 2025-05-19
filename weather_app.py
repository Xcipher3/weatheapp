from fastapi import FastAPI, HTTPException
from upstash_redis import Redis
import requests
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from typing import Optional

# Load environment variables
load_dotenv()

app = FastAPI(title="Weather App")

# Add CORS middleware
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
WEATHER_API_URL = "https://api.weatherapi.com/v1/current.json"
API_KEY = os.getenv("WEATHER_API_KEY")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Weather App API"}

@app.get("/weather/{city}")
def get_weather(city: str):
    """
    Get weather data for a specific city.
    The data is cached in Redis for 10 minutes to improve performance.
    """
    # Create a unique cache key for this city
    cache_key = f"weather:{city}"

    # Check if the data exists in cache
    cached_data = redis.get(cache_key)
    if cached_data:
        return {"source": "cache", "data": cached_data}

    # If not in cache, fetch from the weather API
    try:
        response = requests.get(f"{WEATHER_API_URL}?key={API_KEY}&q={city}")
        response.raise_for_status()  # Raise an exception for HTTP errors
        weather_data = response.json()
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Error fetching weather data: {str(e)}")

    # Store the data in Redis cache with a 10-minute expiration
    redis.setex(cache_key, 600, weather_data)

    return {"source": "api", "data": weather_data}

@app.get("/weather/coordinates")
def get_weather_by_coordinates(lat: float, lon: float):
    """
    Get weather data for specific coordinates (latitude and longitude).
    The data is cached in Redis for 10 minutes to improve performance.
    """
    # Create a unique cache key for these coordinates
    cache_key = f"weather:coords:{lat},{lon}"

    # Check if the data exists in cache
    cached_data = redis.get(cache_key)
    if cached_data:
        return {"source": "cache", "data": cached_data}

    # If not in cache, fetch from the weather API
    try:
        response = requests.get(f"{WEATHER_API_URL}?key={API_KEY}&q={lat},{lon}")
        response.raise_for_status()  # Raise an exception for HTTP errors
        weather_data = response.json()
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Error fetching weather data: {str(e)}")

    # Store the data in Redis cache with a 10-minute expiration
    redis.setex(cache_key, 600, weather_data)

    return {"source": "api", "data": weather_data}

if __name__ == "__main__":
    uvicorn.run("weather_app:app", host="0.0.0.0", port=8000, reload=True)
