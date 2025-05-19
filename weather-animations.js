class WeatherAnimations {
  constructor() {
    this.animationContainer = document.getElementById("weather-animation-container")
    this.rainContainer = document.getElementById("rain-container")
    this.snowContainer = document.getElementById("snow-container")
    this.cloudContainer = document.getElementById("cloud-container")
    this.sunContainer = document.getElementById("sun-container")
    this.lightningContainer = document.getElementById("lightning-container")
    this.fogContainer = document.getElementById("fog-container")
    this.animationToggle = document.getElementById("animation-toggle")

    this.backgrounds = {
      sunny: document.getElementById("bg-sunny"),
      clearNight: document.getElementById("bg-clear-night"),
      cloudy: document.getElementById("bg-cloudy"),
      rainy: document.getElementById("bg-rainy"),
      snowy: document.getElementById("bg-snowy"),
      stormy: document.getElementById("bg-stormy"),
      foggy: document.getElementById("bg-foggy"),
    }

    this.animationsEnabled = true
    this.currentWeather = null

    // Initialize animations
    this.createRaindrops(100)
    this.createSnowflakes(50)
    this.createClouds(5)
    this.createSun()
    this.createFog(3)

    // Set up animation toggle
    this.setupAnimationToggle()

    // Check user's motion preference
    this.checkReducedMotionPreference()
  }

  setupAnimationToggle() {
    this.animationToggle.addEventListener("click", () => {
      this.animationsEnabled = !this.animationsEnabled

      if (this.animationsEnabled) {
        this.animationToggle.textContent = "✨"
        this.animationToggle.setAttribute("aria-label", "Disable animations")
        if (this.currentWeather) {
          this.setWeatherAnimation(this.currentWeather)
        }
      } else {
        this.animationToggle.textContent = "✖"
        this.animationToggle.setAttribute("aria-label", "Enable animations")
        this.resetAllAnimations()
      }
    })
  }

  checkReducedMotionPreference() {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReducedMotion) {
      this.animationsEnabled = false
      this.animationToggle.textContent = "✖"
      this.animationToggle.setAttribute("aria-label", "Enable animations")
    }
  }

  createRaindrops(count) {
    for (let i = 0; i < count; i++) {
      const raindrop = document.createElement("div")
      raindrop.className = "raindrop"
      raindrop.style.left = `${Math.random() * 100}%`
      raindrop.style.animationDuration = `${Math.random() * 0.5 + 0.5}s`
      raindrop.style.animationDelay = `${Math.random() * 2}s`
      this.rainContainer.appendChild(raindrop)
    }
  }

  createSnowflakes(count) {
    for (let i = 0; i < count; i++) {
      const snowflake = document.createElement("div")
      snowflake.className = "snowflake"
      snowflake.style.left = `${Math.random() * 100}%`
      snowflake.style.opacity = Math.random() * 0.7 + 0.3
      snowflake.style.width = snowflake.style.height = `${Math.random() * 5 + 3}px`

      // Set animation properties
      const fallDuration = Math.random() * 5 + 10
      const swayDuration = Math.random() * 3 + 2
      const swayDelay = Math.random() * 1

      snowflake.style.animationDuration = `${fallDuration}s, ${swayDuration}s`
      snowflake.style.animationDelay = `${Math.random() * 10}s, ${swayDelay}s`

      this.snowContainer.appendChild(snowflake)
    }
  }

  createClouds(count) {
    for (let i = 0; i < count; i++) {
      const cloud = document.createElement("div")
      cloud.className = "cloud"

      // Create random cloud shape
      const width = Math.random() * 100 + 100
      const height = width * 0.6
      cloud.style.width = `${width}px`
      cloud.style.height = `${height}px`

      // Position cloud
      cloud.style.top = `${Math.random() * 50}%`

      // Set animation properties
      const duration = Math.random() * 60 + 60
      cloud.style.animationDuration = `${duration}s`
      cloud.style.animationDelay = `${Math.random() * -duration}s`

      this.cloudContainer.appendChild(cloud)
    }
  }

  createSun() {
    const sun = document.createElement("div")
    sun.className = "sun"
    this.sunContainer.appendChild(sun)

    // Create sun rays
    for (let i = 0; i < 12; i++) {
      const ray = document.createElement("div")
      ray.className = "sun-ray"

      const angle = (i * 30 * Math.PI) / 180
      const length = 40

      ray.style.width = `${length}px`
      ray.style.height = "2px"
      ray.style.transform = `rotate(${angle}rad) translateX(40px)`

      sun.appendChild(ray)
    }
  }

  createFog(count) {
    for (let i = 0; i < count; i++) {
      const fog = document.createElement("div")
      fog.className = "fog"

      // Position fog
      fog.style.top = `${i * 30 + 10}%`

      // Set animation properties
      const duration = Math.random() * 20 + 30
      fog.style.animationDuration = `${duration}s`
      fog.style.animationDelay = `${Math.random() * -duration}s`

      this.fogContainer.appendChild(fog)
    }
  }

  resetAllAnimations() {
    // Hide all backgrounds
    Object.values(this.backgrounds).forEach((bg) => {
      bg.classList.remove("active")
    })

    // Hide all animation containers
    ;[
      this.rainContainer,
      this.snowContainer,
      this.cloudContainer,
      this.sunContainer,
      this.lightningContainer,
      this.fogContainer,
    ].forEach((container) => {
      container.classList.remove("active")
    })
  }

  setWeatherAnimation(condition) {
    if (!this.animationsEnabled) return

    this.currentWeather = condition
    this.resetAllAnimations()

    // Determine if it's day or night
    const isDay = this.isDay()

    // Set appropriate background and animations based on weather condition
    if (condition.includes("rain") || condition.includes("drizzle")) {
      this.backgrounds.rainy.classList.add("active")
      this.rainContainer.classList.add("active")
      this.cloudContainer.classList.add("active")
    } else if (condition.includes("snow") || condition.includes("sleet") || condition.includes("ice")) {
      this.backgrounds.snowy.classList.add("active")
      this.snowContainer.classList.add("active")
    } else if (condition.includes("thunder") || condition.includes("storm")) {
      this.backgrounds.stormy.classList.add("active")
      this.rainContainer.classList.add("active")
      this.cloudContainer.classList.add("active")
      this.lightningContainer.classList.add("active")
    } else if (condition.includes("fog") || condition.includes("mist")) {
      this.backgrounds.foggy.classList.add("active")
      this.fogContainer.classList.add("active")
    } else if (condition.includes("cloud") || condition.includes("overcast")) {
      this.backgrounds.cloudy.classList.add("active")
      this.cloudContainer.classList.add("active")
    } else if (condition === "Sunny" || condition === "Clear") {
      if (isDay) {
        this.backgrounds.sunny.classList.add("active")
        this.sunContainer.classList.add("active")
      } else {
        this.backgrounds.clearNight.classList.add("active")
      }
    } else {
      // Default to sunny/clear
      if (isDay) {
        this.backgrounds.sunny.classList.add("active")
        this.sunContainer.classList.add("active")
      } else {
        this.backgrounds.clearNight.classList.add("active")
      }
    }
  }

  isDay() {
    // Simple check if it's day or night based on current hour
    const hour = new Date().getHours()
    return hour >= 6 && hour < 20
  }
}

// Export the class
window.WeatherAnimations = WeatherAnimations
