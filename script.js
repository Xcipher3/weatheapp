document.addEventListener("DOMContentLoaded", () => {
  // Load the animations script
  const animationsScript = document.createElement("script")
  animationsScript.src = "weather-animations.js"
  document.head.appendChild(animationsScript)

  let weatherAnimations

  // Initialize animations after script is loaded
  animationsScript.onload = () => {
    weatherAnimations = new WeatherAnimations()
  }

  // DOM elements
  const cityInput = document.getElementById("city-input")
  const searchBtn = document.getElementById("search-btn")
  const weatherCard = document.getElementById("weather-card")
  const placeholderMessage = document.getElementById("placeholder-message")
  const errorMessage = document.getElementById("error-message")
  const loadingSpinner = document.getElementById("loading-spinner")
  const locationBtn = document.getElementById("location-btn")

  // Weather data elements
  const cityName = document.getElementById("city-name")
  const country = document.getElementById("country")
  const localTime = document.getElementById("local-time")
  const temperature = document.getElementById("temperature")
  const feelsLike = document.getElementById("feels-like")
  const weatherIcon = document.getElementById("weather-icon")
  const conditionText = document.getElementById("condition-text")
  const humidity = document.getElementById("humidity")
  const wind = document.getElementById("wind")
  const pressure = document.getElementById("pressure")
  const visibility = document.getElementById("visibility")
  const uvIndex = document.getElementById("uv-index")
  const precipitation = document.getElementById("precipitation")
  const dataSource = document.getElementById("data-source")

  // API URL - updated to use the preview server API endpoints
  const API_URL = "/api"

  // Weather icon mapping
  const weatherIcons = {
    Sunny: "☀️",
    Clear: "🌙",
    "Partly cloudy": "⛅",
    Cloudy: "☁️",
    Overcast: "☁️",
    Mist: "🌫️",
    "Patchy rain possible": "🌦️",
    "Patchy snow possible": "🌨️",
    "Patchy sleet possible": "🌨️",
    "Patchy freezing drizzle possible": "🌧️",
    "Thundery outbreaks possible": "⛈️",
    "Blowing snow": "❄️",
    Blizzard: "❄️",
    Fog: "🌫️",
    "Freezing fog": "🌫️",
    "Patchy light drizzle": "🌧️",
    "Light drizzle": "🌧️",
    "Freezing drizzle": "🌧️",
    "Heavy freezing drizzle": "🌧️",
    "Patchy light rain": "🌧️",
    "Light rain": "🌧️",
    "Moderate rain at times": "🌧️",
    "Moderate rain": "🌧️",
    "Heavy rain at times": "🌧️",
    "Heavy rain": "🌧️",
    "Light freezing rain": "🌧️",
    "Moderate or heavy freezing rain": "🌧️",
    "Light sleet": "🌨️",
    "Moderate or heavy sleet": "🌨️",
    "Patchy light snow": "🌨️",
    "Light snow": "🌨️",
    "Patchy moderate snow": "🌨️",
    "Moderate snow": "🌨️",
    "Patchy heavy snow": "❄️",
    "Heavy snow": "❄️",
    "Ice pellets": "🧊",
    "Light rain shower": "🌦️",
    "Moderate or heavy rain shower": "🌦️",
    "Torrential rain shower": "🌧️",
    "Light sleet showers": "🌨️",
    "Moderate or heavy sleet showers": "🌨️",
    "Light snow showers": "🌨️",
    "Moderate or heavy snow showers": "🌨️",
    "Light showers of ice pellets": "🧊",
    "Moderate or heavy showers of ice pellets": "🧊",
    "Patchy light rain with thunder": "⛈️",
    "Moderate or heavy rain with thunder": "⛈️",
    "Patchy light snow with thunder": "⛈️",
    "Moderate or heavy snow with thunder": "⛈️",
  }

  // Function to get default icon if condition not found
  const getWeatherIcon = (condition) => {
    return weatherIcons[condition] || "🌡️"
  }

  // Function to fetch weather data
  const fetchWeatherData = async (city) => {
    try {
      showLoading()

      // Update API endpoint to include forecast data
      const response = await fetch(`${API_URL}/weather/${city}?forecast=3`)

      if (!response.ok) {
        throw new Error("City not found")
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error fetching weather data:", error)
      throw error
    } finally {
      hideLoading()
    }
  }

  // Function to get weather by coordinates
  const fetchWeatherByCoords = async (lat, lon) => {
    try {
      showLoading()

      // Update API endpoint to include forecast data
      const response = await fetch(`${API_URL}/weather/coordinates?lat=${lat}&lon=${lon}&forecast=3`)

      if (!response.ok) {
        throw new Error("Location not found")
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error fetching weather data by coordinates:", error)
      throw error
    } finally {
      hideLoading()
    }
  }

  // Function to get user's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser")
      return
    }

    showLoading()

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const weatherData = await fetchWeatherByCoords(latitude, longitude)
          displayWeatherData(weatherData)

          // Update the input field with the city name for reference
          cityInput.value = weatherData.data.location.name

          // Save to recent searches
          if (window.saveRecentSearch) {
            window.saveRecentSearch(weatherData.data.location.name)
          }
        } catch (error) {
          showError()
        }
      },
      (error) => {
        hideLoading()
        handleGeolocationError(error)
      },
      { timeout: 10000 },
    )
  }

  // Function to handle geolocation errors
  const handleGeolocationError = (error) => {
    let message

    switch (error.code) {
      case error.PERMISSION_DENIED:
        message = "You denied the request for geolocation. Please enable location access or search manually."
        break
      case error.POSITION_UNAVAILABLE:
        message = "Location information is unavailable."
        break
      case error.TIMEOUT:
        message = "The request to get your location timed out."
        break
      case error.UNKNOWN_ERROR:
        message = "An unknown error occurred."
        break
    }

    // Create or update permission denied message
    let permissionDenied = document.querySelector(".permission-denied")

    if (!permissionDenied) {
      permissionDenied = document.createElement("div")
      permissionDenied.className = "permission-denied"
      document.querySelector(".weather-container").appendChild(permissionDenied)
    }

    permissionDenied.textContent = message
    permissionDenied.classList.remove("hidden")

    // Hide after 5 seconds
    setTimeout(() => {
      permissionDenied.classList.add("hidden")
    }, 5000)
  }

  // Function to display weather data
  const displayWeatherData = (data) => {
    const weatherData = data.data
    const source = data.source

    // Get preferred temperature unit
    const unit = window.getTemperatureUnit ? window.getTemperatureUnit() : "C"

    // Location information
    cityName.textContent = weatherData.location.name
    country.textContent = weatherData.location.country
    localTime.textContent = `Local time: ${weatherData.location.localtime}`

    // Current weather
    const tempValue = unit === "C" ? weatherData.current.temp_c : weatherData.current.temp_f
    const feelsLikeValue = unit === "C" ? weatherData.current.feelslike_c : weatherData.current.feelslike_f

    temperature.textContent = `${tempValue.toFixed(1)}°${unit}`
    feelsLike.textContent = `Feels like: ${feelsLikeValue.toFixed(1)}°${unit}`

    // Weather condition
    const condition = weatherData.current.condition.text
    conditionText.textContent = condition
    weatherIcon.textContent = getWeatherIcon(condition)

    // Set weather animation
    if (weatherAnimations) {
      weatherAnimations.setWeatherAnimation(condition)
    }

    // Weather details
    humidity.textContent = `${weatherData.current.humidity}%`
    wind.textContent = `${weatherData.current.wind_kph} km/h ${weatherData.current.wind_dir}`
    pressure.textContent = `${weatherData.current.pressure_mb} mb`
    visibility.textContent = `${weatherData.current.vis_km} km`

    // Additional weather details
    if (weatherData.current.uv) {
      uvIndex.textContent = weatherData.current.uv
    }

    if (weatherData.current.precip_mm !== undefined) {
      precipitation.textContent = `${weatherData.current.precip_mm} mm`
    }

    // Data source (API or Cache)
    dataSource.textContent = `Data source: ${source === "cache" ? "Cache" : "API"}`

    // Show weather card
    showWeatherCard()

    // Initialize weather map if available
    if (window.initWeatherMap && weatherData.location.lat && weatherData.location.lon) {
      window.initWeatherMap(weatherData.location.lat, weatherData.location.lon)
    }

    // Display hourly forecast if available
    if (window.displayHourlyForecast && weatherData.forecast && weatherData.forecast.forecastday) {
      const hourlyData = weatherData.forecast.forecastday[0].hour
      // Filter to show only future hours
      const currentHour = new Date().getHours()
      const futureHours = hourlyData
        .filter((hour) => {
          const hourTime = new Date(hour.time).getHours()
          return hourTime > currentHour
        })
        .slice(0, 12) // Show next 12 hours

      window.displayHourlyForecast(futureHours, unit)
    }

    // Display 3-day forecast if available
    if (window.displayForecast && weatherData.forecast && weatherData.forecast.forecastday) {
      window.displayForecast(weatherData.forecast.forecastday, unit)
    }

    // Display weather recommendations
    if (window.displayRecommendations) {
      window.displayRecommendations(weatherData.current)
    }
  }

  // Function to handle search
  const handleSearch = async () => {
    const city = cityInput.value.trim()

    if (!city) {
      return
    }

    try {
      const weatherData = await fetchWeatherData(city)
      displayWeatherData(weatherData)

      // Save to recent searches
      if (window.saveRecentSearch) {
        window.saveRecentSearch(city)
      }
    } catch (error) {
      showError()
    }
  }

  // UI state functions
  const showWeatherCard = () => {
    placeholderMessage.classList.add("hidden")
    errorMessage.classList.add("hidden")
    weatherCard.classList.remove("hidden")
  }

  const showError = () => {
    placeholderMessage.classList.add("hidden")
    weatherCard.classList.add("hidden")
    document.getElementById("weather-map-container").classList.add("hidden")
    document.getElementById("forecast-container").classList.add("hidden")
    errorMessage.classList.remove("hidden")
  }

  const showLoading = () => {
    loadingSpinner.classList.remove("hidden")
  }

  const hideLoading = () => {
    loadingSpinner.classList.add("hidden")
  }

  // Event listeners
  searchBtn.addEventListener("click", handleSearch)
  locationBtn.addEventListener("click", getCurrentLocation)

  cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  })

  // Check if there's a city in URL parameters and load it
  const urlParams = new URLSearchParams(window.location.search)
  const cityParam = urlParams.get("city")

  if (cityParam) {
    cityInput.value = cityParam
    handleSearch()
  }
})
