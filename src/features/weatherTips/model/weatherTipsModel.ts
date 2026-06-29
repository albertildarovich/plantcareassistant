import { makeAutoObservable, runInAction } from 'mobx';
import { WeatherData, WeatherCareTip, UserLocation } from '@shared/types';
import { fetchWeatherByLocation, getWeatherCareTips } from '@shared/api/weather';
import { KEYS, storeData, getData } from '@shared/lib/storage';

class WeatherTipsModel {
  weatherData: WeatherData | null = null;
  careTips: WeatherCareTip[] = [];
  loading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async loadWeather(location: UserLocation): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      const data = await fetchWeatherByLocation(location.latitude, location.longitude);

      if (data) {
        const tips = getWeatherCareTips(data);

        runInAction(() => {
          this.weatherData = data;
          this.careTips = tips;
          this.loading = false;
        });

        await storeData('@cached_weather', { weatherData: data, careTips: tips });
      } else {
        // Try loading cached data
        const cached = await getData<{ weatherData: WeatherData; careTips: WeatherCareTip[] }>(
          '@cached_weather',
        );

        runInAction(() => {
          if (cached) {
            this.weatherData = cached.weatherData;
            this.careTips = cached.careTips;
          }
          this.error = 'Could not fetch live weather data';
          this.loading = false;
        });
      }
    } catch (err) {
      runInAction(() => {
        this.error = 'Failed to load weather data';
        this.loading = false;
      });
    }
  }

  clear(): void {
    this.weatherData = null;
    this.careTips = [];
    this.error = null;
  }
}

export const weatherTipsModel = new WeatherTipsModel();
