import { LinearGradient } from 'expo-linear-gradient';
import { Cloud, MapPin, Wind, Droplets, Shirt } from 'lucide-react-native';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { getClothingRecommendation, getWeatherEmoji } from '@/utils/clothingRecommendations';
import { useLocation, useWeather, useCityName } from '@/utils/weatherApi';

function getBackgroundColors(condition: string, temp: number): [string, string, string] {
  const lowerCondition = condition.toLowerCase();
  
  if (lowerCondition.includes('clear') || lowerCondition.includes('sunny')) {
    if (temp > 25) {
      return ['#FF6B6B', '#FFA500', '#FFD700'] as [string, string, string];
    }
    return ['#4A90E2', '#87CEEB', '#FFD700'] as [string, string, string];
  } else if (lowerCondition.includes('cloud')) {
    return ['#667EEA', '#764BA2', '#B0B8D4'] as [string, string, string];
  } else if (lowerCondition.includes('rain')) {
    return ['#2C3E50', '#3498DB', '#5DADE2'] as [string, string, string];
  } else if (lowerCondition.includes('snow')) {
    return ['#E0F7FA', '#B2EBF2', '#80DEEA'] as [string, string, string];
  }
  
  return ['#667EEA', '#764BA2', '#B0B8D4'] as [string, string, string];
}

export default function HomeScreen() {
  const locationQuery = useLocation();
  const weatherQuery = useWeather(locationQuery.data);
  const cityQuery = useCityName(locationQuery.data);

  const isLoading = locationQuery.isLoading || weatherQuery.isLoading;
  const error = locationQuery.error || weatherQuery.error;

  const weather = weatherQuery.data;
  const location = locationQuery.data;
  const cityName = cityQuery.data || '加载中...';

  const backgroundColors: [string, string, string] = weather 
    ? getBackgroundColors(weather.condition, weather.temp)
    : ['#667EEA', '#764BA2', '#B0B8D4'];

  const recommendation = weather ? getClothingRecommendation(weather.temp) : null;
  const weatherEmoji = weather ? getWeatherEmoji(weather.condition) : '';

  if (error) {
    return (
      <LinearGradient colors={['#FF6B6B', '#FF8E53']} style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>😕</Text>
          <Text style={styles.errorTitle}>无法获取位置</Text>
          <Text style={styles.errorText}>
            请确保已允许访问位置权限
          </Text>
        </View>
      </LinearGradient>
    );
  }

  if (isLoading) {
    return (
      <LinearGradient colors={backgroundColors} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>正在获取天气信息...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={backgroundColors} style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.locationRow}>
            <MapPin color="#FFFFFF" size={20} />
            <Text style={styles.cityName}>{cityName}</Text>
          </View>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('zh-CN', { 
              month: 'long', 
              day: 'numeric',
              weekday: 'short'
            })}
          </Text>
        </View>

        {location && (
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
              pitchEnabled={false}
              rotateEnabled={false}
            >
              <Marker
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
              />
            </MapView>
          </View>
        )}

        {weather && (
          <>
            <View style={styles.weatherMain}>
              <Text style={styles.weatherEmoji}>{weatherEmoji}</Text>
              <Text style={styles.temperature}>{weather.temp}°C</Text>
              <Text style={styles.weatherDescription}>{weather.description}</Text>
              <Text style={styles.feelsLike}>体感温度 {weather.feelsLike}°C</Text>
            </View>

            <View style={styles.weatherDetails}>
              <View style={styles.detailItem}>
                <Wind color="#FFFFFF" size={24} />
                <Text style={styles.detailValue}>{weather.windSpeed} m/s</Text>
                <Text style={styles.detailLabel}>风速</Text>
              </View>
              <View style={styles.detailItem}>
                <Droplets color="#FFFFFF" size={24} />
                <Text style={styles.detailValue}>{weather.humidity}%</Text>
                <Text style={styles.detailLabel}>湿度</Text>
              </View>
              <View style={styles.detailItem}>
                <Cloud color="#FFFFFF" size={24} />
                <Text style={styles.detailValue}>{weather.condition}</Text>
                <Text style={styles.detailLabel}>天气</Text>
              </View>
            </View>

            {recommendation && (
              <View style={styles.recommendationCard}>
                <View style={styles.recommendationHeader}>
                  <Shirt color="#667EEA" size={28} />
                  <Text style={styles.recommendationTitle}>穿衣建议</Text>
                </View>
                
                <View style={styles.recommendationBadge}>
                  <Text style={styles.recommendationBadgeText}>
                    {recommendation.title}
                  </Text>
                </View>

                <View style={styles.clothingItems}>
                  {recommendation.items.map((item, index) => (
                    <View key={index} style={styles.clothingItem}>
                      <Text style={styles.clothingItemText}>{item}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.tipsContainer}>
                  <Text style={styles.tipsIcon}>💡</Text>
                  <Text style={styles.tipsText}>{recommendation.tips}</Text>
                </View>
              </View>
            )}
          </>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>数据来自 OpenWeather</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500' as const,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold' as const,
    marginBottom: 12,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.9,
  },
  header: {
    marginBottom: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cityName: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold' as const,
  },
  date: {
    color: '#FFFFFF',
    fontSize: 16,
    opacity: 0.9,
    marginLeft: 28,
  },
  mapContainer: {
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  map: {
    width: '100%',
    height: '100%',
  },
  weatherMain: {
    alignItems: 'center',
    marginBottom: 32,
  },
  weatherEmoji: {
    fontSize: 80,
    marginBottom: 12,
  },
  temperature: {
    color: '#FFFFFF',
    fontSize: 72,
    fontWeight: 'bold' as const,
    letterSpacing: -2,
  },
  weatherDescription: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '500' as const,
    marginTop: 8,
    textTransform: 'capitalize',
  },
  feelsLike: {
    color: '#FFFFFF',
    fontSize: 16,
    opacity: 0.8,
    marginTop: 4,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 20,
  },
  detailItem: {
    alignItems: 'center',
    gap: 8,
  },
  detailValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold' as const,
  },
  detailLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.8,
  },
  recommendationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  recommendationTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#2C3E50',
  },
  recommendationBadge: {
    backgroundColor: '#E8F4FD',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  recommendationBadgeText: {
    color: '#667EEA',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  clothingItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  clothingItem: {
    backgroundColor: '#F7F9FC',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  clothingItemText: {
    color: '#2C3E50',
    fontSize: 15,
    fontWeight: '500' as const,
  },
  tipsContainer: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  tipsIcon: {
    fontSize: 20,
  },
  tipsText: {
    flex: 1,
    color: '#F57C00',
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  footerText: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.6,
  },
});
