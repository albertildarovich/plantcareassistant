import { ENV } from '@shared/config';
import { WeatherData, WeatherCareTip } from '@shared/types';

export async function fetchWeatherByLocation(
  latitude: number,
  longitude: number,
): Promise<WeatherData | null> {
  try {
    const response = await fetch(
      `${ENV.WEATHER_API_BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${ENV.WEATHER_API_KEY}&units=metric&lang=en`,
    );
    const forecastResponse = await fetch(
      `${ENV.WEATHER_API_BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&appid=${ENV.WEATHER_API_KEY}&units=metric&lang=en&cnt=5`,
    );

    if (!response.ok || !forecastResponse.ok) {
      return null;
    }

    const currentData = await response.json();
    const forecastData = await forecastResponse.json();

    return {
      temperature: currentData.main.temp,
      humidity: currentData.main.humidity,
      condition: currentData.weather[0].main,
      icon: currentData.weather[0].icon,
      cityName: currentData.name,
      forecast: forecastData.list.slice(0, 5).map((item: any) => ({
        date: item.dt_txt,
        tempMax: item.main.temp_max,
        tempMin: item.main.temp_min,
        humidity: item.main.humidity,
        condition: item.weather[0].main,
        icon: item.weather[0].icon,
      })),
    };
  } catch {
    return null;
  }
}

export function getWeatherCareTips(weather: WeatherData): WeatherCareTip[] {
  const tips: WeatherCareTip[] = [];

  if (weather.humidity < 40) {
    tips.push({
      condition: 'low_humidity',
      tip: '💧 Air is dry! Mist your plants or use a humidifier near tropical plants.',
      priority: 'high',
    });
  }

  if (weather.humidity > 80) {
    tips.push({
      condition: 'high_humidity',
      tip: '💨 High humidity – reduce watering frequency to prevent root rot.',
      priority: 'high',
    });
  }

  if (weather.temperature > 35) {
    tips.push({
      condition: 'heatwave',
      tip: '☀️ Extreme heat! Move plants away from windows and increase watering slightly.',
      priority: 'high',
    });
  }

  if (weather.temperature < 10) {
    tips.push({
      condition: 'cold',
      tip: '❄️ Cold weather! Bring outdoor plants inside or protect from frost.',
      priority: 'high',
    });
  }

  if (weather.condition === 'Rain' || weather.condition === 'Drizzle') {
    tips.push({
      condition: 'rainy',
      tip: '🌧️ Rainy day – skip watering for outdoor plants today.',
      priority: 'medium',
    });
  }

  if (weather.condition === 'Clouds') {
    tips.push({
      condition: 'cloudy',
      tip: '☁️ Overcast – low light conditions, consider supplemental lighting for light-loving plants.',
      priority: 'low',
    });
  }

  return tips;
}
