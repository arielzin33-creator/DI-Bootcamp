# ==============================================================================
# weather_app.py
# ==============================================================================

import pyowm
from pyowm.utils import config
from pyowm.utils import timestamps
from datetime import datetime
import pytz
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np

API_KEY = "your_api_key_here"  # Replace with your OpenWeatherMap API key


# ==============================================================================
# Helper: format unix timestamp to readable time
# ==============================================================================

def format_time(unix_ts, timezone="UTC"):
    tz  = pytz.timezone(timezone)
    dt  = datetime.fromtimestamp(unix_ts, tz=tz)
    return dt.strftime("%H:%M %Z")


def format_datetime(unix_ts, timezone="UTC"):
    tz  = pytz.timezone(timezone)
    dt  = datetime.fromtimestamp(unix_ts, tz=tz)
    return dt.strftime("%A %d %b %Y — %H:%M %Z")


# ==============================================================================
# Part 1–4: Current weather for Paris
# ==============================================================================

def get_current_weather(owm, location_name="Paris,FR"):
    mgr         = owm.weather_manager()
    observation = mgr.weather_at_place(location_name)
    weather     = observation.weather
    location    = observation.location

    print("\n" + "=" * 50)
    print(f"  📍 Current Weather — {location.name}, {location.country}")
    print("=" * 50)

    # Temperature
    temp      = weather.temperature("celsius")
    print(f"  🌡  Temperature    : {temp['temp']:.1f} °C")
    print(f"      Feels like    : {temp['feels_like']:.1f} °C")
    print(f"      Min / Max     : {temp['temp_min']:.1f} °C / {temp['temp_max']:.1f} °C")

    # General conditions
    print(f"  🌤  Status         : {weather.detailed_status.capitalize()}")
    print(f"  💧 Humidity        : {weather.humidity} %")
    print(f"  ☁️  Cloud coverage : {weather.clouds} %")
    print(f"  👁  Visibility     : {weather.visibility_distance} m")

    # Wind
    wind = weather.wind()
    print(f"\n  💨 Wind")
    print(f"      Speed         : {wind.get('speed', 'N/A')} m/s")
    print(f"      Direction     : {wind.get('deg', 'N/A')}°")
    print(f"      Gust          : {wind.get('gust', 'N/A')} m/s")

    # Sunrise / Sunset
    sunrise = weather.sunrise_time()
    sunset  = weather.sunset_time()
    print(f"\n  🌅 Sunrise         : {format_time(sunrise, 'Europe/Paris')}")
    print(f"  🌇 Sunset          : {format_time(sunset,  'Europe/Paris')}")
    print()

    return weather, location


# ==============================================================================
# Part 5: User-specified city via city ID
# ==============================================================================

def get_weather_by_city_id(owm):
    city_name = input("Enter a city name (e.g. London,GB): ").strip()
    mgr       = owm.weather_manager()

    try:
        reg         = owm.city_id_registry()
        locations   = reg.locations_for(city_name.split(",")[0].strip(),
                                         country=city_name.split(",")[1].strip() if "," in city_name else None)
        if not locations:
            print(f"  ✗ City '{city_name}' not found.")
            return

        loc     = locations[0]
        city_id = loc.id
        print(f"\n  ✓ Found city: {loc.name}, {loc.country} (ID: {city_id})")

        observation = mgr.weather_at_id(city_id)
        weather     = observation.weather
        location    = observation.location

        print("\n" + "=" * 50)
        print(f"  📍 Weather — {location.name}, {location.country} (ID: {city_id})")
        print("=" * 50)

        temp = weather.temperature("celsius")
        wind = weather.wind()
        print(f"  🌡  Temperature    : {temp['temp']:.1f} °C (feels like {temp['feels_like']:.1f} °C)")
        print(f"  🌤  Status         : {weather.detailed_status.capitalize()}")
        print(f"  💧 Humidity        : {weather.humidity} %")
        print(f"  💨 Wind speed      : {wind.get('speed', 'N/A')} m/s")
        sunrise = weather.sunrise_time()
        sunset  = weather.sunset_time()
        print(f"  🌅 Sunrise         : {format_time(sunrise)}")
        print(f"  🌇 Sunset          : {format_time(sunset)}")
        print()

        return weather, location, city_id

    except Exception as e:
        print(f"  ✗ Error: {e}")


# ==============================================================================
# Part 6: 5-day / 3-hour forecast
# ==============================================================================

def get_forecast(owm, location_name="Paris,FR"):
    mgr      = owm.weather_manager()
    forecast = mgr.forecast_at_place(location_name, "3h")

    print("\n" + "=" * 50)
    print(f"  📅 5-Day Forecast (3h intervals) — {location_name}")
    print("=" * 50)

    weathers = forecast.forecast.weathers[:16]   # first 48h
    for w in weathers:
        dt   = format_datetime(w.reference_time(), "Europe/Paris")
        temp = w.temperature("celsius")["temp"]
        desc = w.detailed_status.capitalize()
        hum  = w.humidity
        print(f"  {dt:<35} {temp:>5.1f} °C   {desc:<25}  💧{hum}%")
    print()

    return forecast


# ==============================================================================
# Part 7: Air Pollution
# ==============================================================================

def get_air_pollution(owm, lat=48.8566, lon=2.3522, city="Paris"):
    mgr  = owm.air_quality_manager()
    air  = mgr.air_quality_at_coords(lat, lon)
    aqi  = air.air_quality_data["aqi"]

    aqi_labels = {1: "Good", 2: "Fair", 3: "Moderate", 4: "Poor", 5: "Very Poor"}
    label      = aqi_labels.get(aqi, "Unknown")

    print("\n" + "=" * 50)
    print(f"  🏭 Air Quality — {city}")
    print("=" * 50)
    print(f"  AQI (Air Quality Index) : {aqi} — {label}")

    components = air.air_quality_data.get("components", {})
    labels_map = {
        "co":    "Carbon Monoxide (CO)",
        "no":    "Nitric Oxide (NO)",
        "no2":   "Nitrogen Dioxide (NO2)",
        "o3":    "Ozone (O3)",
        "so2":   "Sulphur Dioxide (SO2)",
        "pm2_5": "PM2.5",
        "pm10":  "PM10",
        "nh3":   "Ammonia (NH3)",
    }
    for key, full_name in labels_map.items():
        val = components.get(key, "N/A")
        print(f"  {full_name:<30}: {val} μg/m³")
    print()


# ==============================================================================
# Bonus GUI: 3-Day Humidity Forecast Bar Chart
# ==============================================================================

def init_plot(ax, city_name):
    ax.set_ylabel("Humidity (%)", fontsize=12, fontweight="bold")
    ax.set_title(
        f"3-Day Humidity Forecast — {city_name}",
        fontsize=14, fontweight="bold", pad=15
    )
    ax.set_ylim(0, 110)
    ax.yaxis.grid(True, linestyle="--", alpha=0.7)
    ax.set_axisbelow(True)


def write_humidity_on_bar_chart(ax, bars, humidities):
    for bar, hum in zip(bars, humidities):
        ax.text(
            bar.get_x() + bar.get_width() / 2,
            bar.get_height() + 1.5,
            f"{hum}%",
            ha="center", va="bottom",
            fontsize=8, fontweight="bold", color="#2c3e50"
        )


def plot_temperatures(owm, city_name="Paris,FR"):
    mgr      = owm.weather_manager()
    forecast = mgr.forecast_at_place(city_name, "3h")
    weathers = forecast.forecast.weathers

    paris_tz  = pytz.timezone("Europe/Paris")
    labels    = []
    humidities = []

    # Take one reading per 3h slot for 3 days (24 slots)
    for w in weathers[:24]:
        dt  = datetime.fromtimestamp(w.reference_time(), tz=paris_tz)
        labels.append(dt.strftime("%d %b\n%H:%M"))
        humidities.append(w.humidity)

    x      = np.arange(len(labels))
    colors = plt.cm.Blues(np.linspace(0.35, 0.85, len(humidities)))

    fig, ax = plt.subplots(figsize=(14, 6))
    fig.patch.set_facecolor("#f0f4f8")
    ax.set_facecolor("#f0f4f8")

    init_plot(ax, city_name)

    bars = ax.bar(x, humidities, color=colors, width=0.65,
                  edgecolor="white", linewidth=0.8)

    write_humidity_on_bar_chart(ax, bars, humidities)

    ax.set_xticks(x)
    ax.set_xticklabels(labels, fontsize=7.5, rotation=45, ha="right")
    ax.tick_params(axis="y", labelsize=10)

    for spine in ["top", "right"]:
        ax.spines[spine].set_visible(False)

    patch = mpatches.Patch(color=colors[len(colors)//2], label="Humidity %")
    ax.legend(handles=[patch], loc="upper right", fontsize=10)

    plt.tight_layout()
    plt.savefig("humidity_forecast.png", dpi=150, bbox_inches="tight")
    print("  ✓ Chart saved as 'humidity_forecast.png'")
    plt.show()


# ==============================================================================
# Main
# ==============================================================================

def main():
    owm = pyowm.OWM(API_KEY)

    # Parts 1–4: Paris
    get_current_weather(owm, "Paris,FR")

    # Part 5: User city
    print("=" * 50)
    print("  Search weather by city")
    print("=" * 50)
    get_weather_by_city_id(owm)

    # Part 6: Forecast
    get_forecast(owm, "Paris,FR")

    # Part 7: Air pollution (Paris coords)
    get_air_pollution(owm, lat=48.8566, lon=2.3522, city="Paris")

    # Bonus: GUI
    print("=" * 50)
    print("  Generating humidity forecast chart...")
    print("=" * 50)
    plot_temperatures(owm, "Paris,FR")


if __name__ == "__main__":
    main()