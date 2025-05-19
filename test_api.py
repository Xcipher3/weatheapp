import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_weather_api():
    """Test the Weather API connection"""
    api_key = os.getenv("WEATHER_API_KEY")
    url = f"https://api.weatherapi.com/v1/current.json?key={api_key}&q=London"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        print("✅ Weather API connection successful!")
        print(f"Current temperature in London: {data['current']['temp_c']}°C")
        return True
    except Exception as e:
        print(f"❌ Weather API connection failed: {str(e)}")
        return False

def test_redis_connection():
    """Test the Upstash Redis connection"""
    from upstash_redis import Redis
    
    redis_url = os.getenv("UPSTASH_REDIS_REST_URL")
    redis_token = os.getenv("UPSTASH_REDIS_REST_TOKEN")
    
    try:
        redis = Redis(url=redis_url, token=redis_token)
        # Try to set and get a test value
        redis.set("test_key", "test_value")
        value = redis.get("test_key")
        
        if value == "test_value":
            print("✅ Upstash Redis connection successful!")
            return True
        else:
            print("❌ Upstash Redis connection failed: Unexpected value returned")
            return False
    except Exception as e:
        print(f"❌ Upstash Redis connection failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("Testing API connections...")
    weather_ok = test_weather_api()
    redis_ok = test_redis_connection()
    
    if weather_ok and redis_ok:
        print("\n🎉 All API connections are working correctly! Your app is ready to go.")
    else:
        print("\n⚠️ Some API connections failed. Please check your credentials and try again.")
