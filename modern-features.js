/**
 * Modern Features for Weather App
 * This file contains all the modern features added to the weather app
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize all modern features
  initDarkMode()
  initVoiceSearch()
  initLocalStorage()
  initWebShare()
  initPWA()
  initUnitToggle()
})

/**
 * Dark Mode Feature
 * Adds dark mode support with system preference detection
 */
function initDarkMode() {
  const themeToggle = document.getElementById("theme-toggle")
  const prefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches

  // Set initial theme based on system preference
  if (prefersDarkMode) {
    document.body.classList.add("dark-theme")
    themeToggle.querySelector(".theme-toggle-icon").textContent = "🌞"
  }

  // Toggle theme when button is clicked
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme")

    if (document.body.classList.contains("dark-theme")) {
      themeToggle.querySelector(".theme-toggle-icon").textContent = "🌞"
      localStorage.setItem("theme", "dark")
    } else {
      themeToggle.querySelector(".theme-toggle-icon").textContent = "🌓"
      localStorage.setItem("theme", "light")
    }
  })

  // Listen for system preference changes
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (!localStorage.getItem("theme")) {
      if (e.matches) {
        document.body.classList.add("dark-theme")
        themeToggle.querySelector(".theme-toggle-icon").textContent = "🌞"
      } else {
        document.body.classList.remove("dark-theme")
        themeToggle.querySelector(".theme-toggle-icon").textContent = "🌓"
      }
    }
  })

  // Check for saved theme preference
  const savedTheme = localStorage.getItem("theme")
  if (savedTheme === "dark") {
    document.body.classList.add("dark-theme")
    themeToggle.querySelector(".theme-toggle-icon").textContent = "🌞"
  } else if (savedTheme === "light") {
    document.body.classList.remove("dark-theme")
    themeToggle.querySelector(".theme-toggle-icon").textContent = "🌓"
  }
}

/**
 * Voice Search Feature
 * Adds speech recognition for hands-free weather queries
 */
function initVoiceSearch() {
  const voiceBtn = document.getElementById("voice-btn")
  const voiceModal = document.getElementById("voice-search-modal")
  const voiceText = document.getElementById("voice-search-text")
  const closeBtn = document.getElementById("voice-search-close")

  // Check if browser supports speech recognition
  if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
    voiceBtn.style.display = "none"
    return
  }

  // Initialize speech recognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  const recognition = new SpeechRecognition()
  recognition.continuous = false
  recognition.interimResults = true

  // Open voice search modal when button is clicked
  voiceBtn.addEventListener("click", () => {
    voiceModal.classList.add("active")
    voiceText.textContent = "Say a city name..."

    setTimeout(() => {
      recognition.start()
    }, 500)
  })

  // Close modal and stop recognition
  closeBtn.addEventListener("click", () => {
    voiceModal.classList.remove("active")
    recognition.stop()
  })

  // Handle recognition results
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript
    voiceText.textContent = transcript

    if (event.results[0].isFinal) {
      setTimeout(() => {
        voiceModal.classList.remove("active")
        document.getElementById("city-input").value = transcript
        document.getElementById("search-btn").click()
      }, 1000)
    }
  }

  // Handle recognition end
  recognition.onend = () => {
    if (voiceModal.classList.contains("active")) {
      recognition.start()
    }
  }

  // Handle recognition errors
  recognition.onerror = (event) => {
    voiceText.textContent = `Error: ${event.error}`
    setTimeout(() => {
      voiceModal.classList.remove("active")
    }, 2000)
  }
}

/**
 * Local Storage Feature
 * Saves recent searches and user preferences
 */
function initLocalStorage() {
  const recentSearchesContainer = document.getElementById("recent-searches")
  const cityInput = document.getElementById("city-input")
  const searchBtn = document.getElementById("search-btn")

  // Load recent searches from local storage
  function loadRecentSearches() {
    const recentSearches = JSON.parse(localStorage.getItem("recentSearches") || "[]")
    recentSearchesContainer.innerHTML = ""

    recentSearches.forEach((city) => {
      const searchItem = document.createElement("div")
      searchItem.className = "recent-search-item"
      searchItem.textContent = city
      searchItem.addEventListener("click", () => {
        cityInput.value = city
        searchBtn.click()
      })

      recentSearchesContainer.appendChild(searchItem)
    })
  }

  // Save a new search to local storage
  function saveRecentSearch(city) {
    let recentSearches = JSON.parse(localStorage.getItem("recentSearches") || "[]")

    // Remove the city if it already exists
    recentSearches = recentSearches.filter((item) => item.toLowerCase() !== city.toLowerCase())

    // Add the city to the beginning of the array
    recentSearches.unshift(city)

    // Keep only the 5 most recent searches
    recentSearches = recentSearches.slice(0, 5)

    // Save to local storage
    localStorage.setItem("recentSearches", JSON.stringify(recentSearches))

    // Update the UI
    loadRecentSearches()
  }

  // Listen for search button clicks
  searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim()
    if (city) {
      saveRecentSearch(city)
    }
  })

  // Listen for Enter key in the input field
  cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const city = cityInput.value.trim()
      if (city) {
        saveRecentSearch(city)
      }
    }
  })

  // Load recent searches on page load
  loadRecentSearches()

  // Expose functions to global scope for use in other scripts
  window.saveRecentSearch = saveRecentSearch
}

/**
 * Web Share API Feature
 * Allows users to share weather information
 */
function initWebShare() {
  const shareBtn = document.getElementById("share-btn")

  // Check if browser supports Web Share API
  if (!navigator.share) {
    shareBtn.style.display = "none"
    return
  }

  shareBtn.addEventListener("click", async () => {
    const cityName = document.getElementById("city-name").textContent
    const temperature = document.getElementById("temperature").textContent
    const condition = document.getElementById("condition-text").textContent

    try {
      await navigator.share({
        title: `Weather in ${cityName}`,
        text: `It's currently ${temperature} in ${cityName}. ${condition}.`,
        url: window.location.href,
      })
    } catch (err) {
      console.error("Share failed:", err)
    }
  })
}

/**
 * Progressive Web App (PWA) Feature
 * Makes the app installable with offline capabilities
 */
function initPWA() {
  const installBtn = document.getElementById("install-btn")
  let deferredPrompt

  // Check if the app can be installed
  window.addEventListener("beforeinstallprompt", (e) => {
    // Prevent the default prompt
    e.preventDefault()

    // Save the event for later
    deferredPrompt = e

    // Show the install button
    installBtn.classList.remove("hidden")
  })

  // Handle install button click
  installBtn.addEventListener("click", () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt")
      } else {
        console.log("User dismissed the install prompt")
      }

      // Clear the saved prompt
      deferredPrompt = null

      // Hide the install button
      installBtn.classList.add("hidden")
    })
  })

  // Register service worker for PWA
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((registration) => {
          console.log("Service Worker registered:", registration)
        })
        .catch((error) => {
          console.log("Service Worker registration failed:", error)
        })
    })
  }
}

/**
 * Unit Toggle Feature
 * Allows switching between Celsius and Fahrenheit
 */
function initUnitToggle() {
  const unitToggle = document.getElementById("unit-toggle")
  let isCelsius = true

  // Load saved preference
  const savedUnit = localStorage.getItem("temperatureUnit")
  if (savedUnit === "F") {
    isCelsius = false
    unitToggle.querySelector(".action-icon").textContent = "°F"
  }

  unitToggle.addEventListener("click", () => {
    isCelsius = !isCelsius

    if (isCelsius) {
      unitToggle.querySelector(".action-icon").textContent = "°C"
      localStorage.setItem("temperatureUnit", "C")
    } else {
      unitToggle.querySelector(".action-icon").textContent = "°F"
      localStorage.setItem("temperatureUnit", "F")
    }

    // Convert temperatures if weather data is displayed
    convertTemperatures()
  })

  // Function to convert temperatures in the UI
  function convertTemperatures() {
    const temperatureElement = document.getElementById("temperature")
    const feelsLikeElement = document.getElementById("feels-like")

    if (temperatureElement.textContent.includes("°")) {
      const currentTemp = Number.parseFloat(temperatureElement.textContent)
      const feelsLikeTemp = Number.parseFloat(feelsLikeElement.textContent.replace("Feels like: ", ""))

      if (isCelsius) {
        // Convert from F to C
        if (temperatureElement.textContent.includes("°F")) {
          const celsiusTemp = ((currentTemp - 32) * 5) / 9
          const celsiusFeelsLike = ((feelsLikeTemp - 32) * 5) / 9

          temperatureElement.textContent = `${celsiusTemp.toFixed(1)}°C`
          feelsLikeElement.textContent = `Feels like: ${celsiusFeelsLike.toFixed(1)}°C`
        }
      } else {
        // Convert from C to F
        if (temperatureElement.textContent.includes("°C")) {
          const fahrenheitTemp = (currentTemp * 9) / 5 + 32
          const fahrenheitFeelsLike = (feelsLikeTemp * 9) / 5 + 32

          temperatureElement.textContent = `${fahrenheitTemp.toFixed(1)}°F`
          feelsLikeElement.textContent = `Feels like: ${fahrenheitFeelsLike.toFixed(1)}°F`
        }
      }
    }

    // Also convert hourly and forecast temperatures if they exist
    convertHourlyTemperatures()
    convertForecastTemperatures()
  }

  function convertHourlyTemperatures() {
    const hourlyItems = document.querySelectorAll(".hourly-temp")

    hourlyItems.forEach((item) => {
      if (item.textContent.includes("°")) {
        const temp = Number.parseFloat(item.textContent)

        if (isCelsius) {
          // Convert from F to C
          if (item.textContent.includes("°F")) {
            const celsiusTemp = ((temp - 32) * 5) / 9
            item.textContent = `${celsiusTemp.toFixed(1)}°C`
          }
        } else {
          // Convert from C to F
          if (item.textContent.includes("°C")) {
            const fahrenheitTemp = (temp * 9) / 5 + 32
            item.textContent = `${fahrenheitTemp.toFixed(1)}°F`
          }
        }
      }
    })
  }

  function convertForecastTemperatures() {
    const highTemps = document.querySelectorAll(".forecast-high")
    const lowTemps = document.querySelectorAll(".forecast-low")

    const convertElements = (elements) => {
      elements.forEach((element) => {
        if (element.textContent.includes("°")) {
          const temp = Number.parseFloat(element.textContent)

          if (isCelsius) {
            // Convert from F to C
            if (element.textContent.includes("°F")) {
              const celsiusTemp = ((temp - 32) * 5) / 9
              element.textContent = `${celsiusTemp.toFixed(1)}°C`
            }
          } else {
            // Convert from C to F
            if (element.textContent.includes("°C")) {
              const fahrenheitTemp = (temp * 9) / 5 + 32
              element.textContent = `${fahrenheitTemp.toFixed(1)}°F`
            }
          }
        }
      })
    }

    convertElements(highTemps)
    convertElements(lowTemps)
  }

  // Expose functions to global scope
  window.getTemperatureUnit = () => (isCelsius ? "C" : "F")
  window.convertTemperature = (temp, toUnit) => {
    if (toUnit === "F") {
      return (temp * 9) / 5 + 32
    } else {
      return ((temp - 32) * 5) / 9
    }
  }
}

/**
 * Weather Map Feature
 * Displays an interactive weather map
 */
function initWeatherMap(lat, lon) {
  const mapContainer = document.getElementById("weather-map-container")
  const map = document.getElementById("weather-map")

  // Show the map container
  mapContainer.classList.remove("hidden")

  // Initialize the map
  const weatherMap = L.map("weather-map").setView([lat, lon], 10)

  // Add the base map layer
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(weatherMap)

  // Add a marker for the location
  L.marker([lat, lon])
    .addTo(weatherMap)
    .bindPopup(
      `<b>${document.getElementById("city-name").textContent}</b><br>${document.getElementById("condition-text").textContent}`,
    )
    .openPopup()

  // Add weather tile layer if API key is available
  const weatherApiKey = "05708bb560ed44b998f211640251705" // Using the provided API key
  if (weatherApiKey) {
    // This is a placeholder - WeatherAPI doesn't provide map tiles
    // In a real app, you would use a service like OpenWeatherMap that provides weather tiles
    console.log("Weather map tiles would be added here with a compatible API")
  }

  // Fix map display issues
  setTimeout(() => {
    weatherMap.invalidateSize()
  }, 100)
}

/**
 * Hourly Forecast Feature
 * Displays hourly weather forecast
 */
function displayHourlyForecast(hourlyData, unit = "C") {
  const hourlyContainer = document.getElementById("hourly-forecast")
  hourlyContainer.innerHTML = ""

  hourlyData.forEach((hour) => {
    const hourlyItem = document.createElement("div")
    hourlyItem.className = "hourly-item"

    const time = new Date(hour.time)
    const formattedTime = time.getHours() + ":00"

    const temp = unit === "C" ? hour.temp_c : hour.temp_f

    hourlyItem.innerHTML = `
      <div class="hourly-time">${formattedTime}</div>
      <div class="hourly-icon">${getWeatherIconForCondition(hour.condition.text)}</div>
      <div class="hourly-temp">${temp.toFixed(1)}°${unit}</div>
    `

    hourlyContainer.appendChild(hourlyItem)
  })
}

/**
 * 5-Day Forecast Feature
 * Displays 5-day weather forecast
 */
function displayForecast(forecastData, unit = "C") {
  const forecastContainer = document.getElementById("forecast-container")
  const forecastCards = document.getElementById("forecast-cards")

  forecastContainer.classList.remove("hidden")
  forecastCards.innerHTML = ""

  forecastData.forEach((day) => {
    const forecastCard = document.createElement("div")
    forecastCard.className = "forecast-card"

    const date = new Date(day.date)
    const dayName = date.toLocaleDateString(undefined, { weekday: "short" })

    const highTemp = unit === "C" ? day.day.maxtemp_c : day.day.maxtemp_f
    const lowTemp = unit === "C" ? day.day.mintemp_c : day.day.mintemp_f

    forecastCard.innerHTML = `
      <div class="forecast-day">${dayName}</div>
      <div class="forecast-icon">${getWeatherIconForCondition(day.day.condition.text)}</div>
      <div class="forecast-temps">
        <span class="forecast-high">${highTemp.toFixed(1)}°${unit}</span>
        <span class="forecast-low">${lowTemp.toFixed(1)}°${unit}</span>
      </div>
    `

    forecastCards.appendChild(forecastCard)
  })
}

/**
 * Weather Recommendations Feature
 * Provides activity recommendations based on weather
 */
function displayRecommendations(weather) {
  const recommendationsContainer = document.getElementById("recommendations-container")
  const recommendationsList = document.getElementById("recommendations-list")

  const recommendations = getWeatherRecommendations(weather)

  if (recommendations.length > 0) {
    recommendationsContainer.classList.remove("hidden")
    recommendationsList.innerHTML = ""

    recommendations.forEach((recommendation) => {
      const listItem = document.createElement("li")
      listItem.textContent = recommendation
      recommendationsList.appendChild(listItem)
    })
  } else {
    recommendationsContainer.classList.add("hidden")
  }
}

function getWeatherRecommendations(weather) {
  const recommendations = []
  const condition = weather.condition.text.toLowerCase()
  const temp = weather.temp_c
  const isDay = weather.is_day === 1

  // Temperature-based recommendations
  if (temp > 30) {
    recommendations.push("Stay hydrated and seek shade when outdoors")
    recommendations.push("Consider indoor activities to avoid heat")
  } else if (temp > 25) {
    recommendations.push("Great weather for outdoor activities")
    recommendations.push("Perfect time for a picnic or beach visit")
  } else if (temp > 15) {
    recommendations.push("Comfortable temperature for most outdoor activities")
    recommendations.push("Good time for hiking or cycling")
  } else if (temp > 5) {
    recommendations.push("Wear a light jacket for outdoor activities")
    recommendations.push("Good weather for running or brisk walking")
  } else {
    recommendations.push("Dress warmly in layers if going outside")
    recommendations.push("Great day for indoor activities")
  }

  // Condition-based recommendations
  if (condition.includes("rain") || condition.includes("drizzle")) {
    recommendations.push("Don't forget your umbrella")
    recommendations.push("Indoor activities recommended")
  } else if (condition.includes("snow")) {
    recommendations.push("Drive carefully on potentially slippery roads")
    recommendations.push("Good day for winter sports if it's not too heavy")
  } else if (condition.includes("fog") || condition.includes("mist")) {
    recommendations.push("Drive with caution due to reduced visibility")
  } else if (condition.includes("thunder") || condition.includes("storm")) {
    recommendations.push("Stay indoors and away from windows during storms")
    recommendations.push("Avoid open areas and tall structures if outside")
  } else if (condition.includes("sunny") || condition.includes("clear")) {
    if (isDay) {
      recommendations.push("Don't forget sunscreen if you're outside")
      if (temp > 25) {
        recommendations.push("Great day for water activities")
      }
    } else {
      recommendations.push("Clear night - good for stargazing")
    }
  }

  // Limit to 3 recommendations
  return recommendations.slice(0, 3)
}

/**
 * Helper function to get weather icon for a condition
 */
function getWeatherIconForCondition(condition) {
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

  return weatherIcons[condition] || "🌡️"
}

// Expose functions to global scope
window.initWeatherMap = initWeatherMap
window.displayHourlyForecast = displayHourlyForecast
window.displayForecast = displayForecast
window.displayRecommendations = displayRecommendations
