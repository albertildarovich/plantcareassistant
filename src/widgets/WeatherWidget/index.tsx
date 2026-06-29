import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Card } from '@shared/ui';
import { colors, typography } from '@shared/ui/theme';
import { observer } from 'mobx-react-lite';
import { weatherTipsModel } from '@features/weatherTips/model';
import { UserLocation } from '@shared/types';

interface WeatherWidgetProps {
  location: UserLocation | null;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = observer(
  ({ location }) => {
    useEffect(() => {
      if (location) {
        weatherTipsModel.loadWeather(location);
      }
    }, [location]);

    if (weatherTipsModel.loading) {
      return (
        <Card variant="outlined" style={styles.container}>
          <ActivityIndicator color={colors.primary} />
        </Card>
      );
    }

    if (!weatherTipsModel.weatherData) {
      return null;
    }

    const { weatherData, careTips } = weatherTipsModel;

    return (
      <Card variant="outlined" style={styles.container}>
        {/* Current Weather */}
        <View style={styles.weatherRow}>
          <View>
            <Text style={styles.cityName}>{weatherData.cityName}</Text>
            <Text style={styles.temperature}>
              {Math.round(weatherData.temperature)}°C
            </Text>
            <Text style={styles.condition}>{weatherData.condition}</Text>
          </View>
          <View style={styles.weatherRight}>
            <Text style={styles.weatherEmoji}>
              {getWeatherEmoji(weatherData.condition)}
            </Text>
            <Text style={styles.humidity}>
              Humidity: {weatherData.humidity}%
            </Text>
          </View>
        </View>

        {/* Care Tips */}
        {careTips.length > 0 && (
          <View style={styles.tipsSection}>
            <Text style={styles.tipsTitle}>🌱 Plant Care Tips</Text>
            {careTips.map((tip, index) => (
              <View key={index} style={styles.tipRow}>
                <Text style={styles.tipText}>• {tip.tip}</Text>
              </View>
            ))}
          </View>
        )}
      </Card>
    );
  },
);

function getWeatherEmoji(condition: string): string {
  switch (condition.toLowerCase()) {
    case 'clear':
    case 'sunny':
      return '☀️';
    case 'clouds':
    case 'cloudy':
      return '☁️';
    case 'rain':
    case 'drizzle':
      return '🌧️';
    case 'thunderstorm':
      return '⛈️';
    case 'snow':
      return '❄️';
    case 'mist':
    case 'fog':
    case 'haze':
      return '🌫️';
    default:
      return '🌤️';
  }
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  weatherRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cityName: {
    ...typography.caption,
    color: colors.gray500,
  },
  temperature: {
    ...typography.h2,
    color: colors.gray900,
  },
  condition: {
    ...typography.body,
    color: colors.gray600,
  },
  weatherRight: {
    alignItems: 'center',
  },
  weatherEmoji: {
    fontSize: 48,
  },
  humidity: {
    ...typography.caption,
    color: colors.gray500,
    marginTop: 4,
  },
  tipsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  tipsTitle: {
    ...typography.bodyBold,
    color: colors.gray900,
    marginBottom: 8,
  },
  tipRow: {
    marginBottom: 6,
  },
  tipText: {
    ...typography.body,
    color: colors.gray700,
    lineHeight: 22,
  },
});
