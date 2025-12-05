import { useQuery } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { LocationData, WeatherData } from '@/types/weather';

const OPENWEATHER_API_KEY = 'bd5e378503939ddaee76f12ad7a97608';

async function getCurrentLocation(): Promise<LocationData> {
  if (Platform.OS === 'web') {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        { enableHighAccuracy: true }
      );
    });
  } else {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission not granted');
    }
    
    const location = await Location.getCurrentPositionAsync({});
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  }
}

async function fetchWeatherData(location: LocationData): Promise<WeatherData> {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&units=metric&appid=${OPENWEATHER_API_KEY}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch weather data');
  }
  
  const data = await response.json();
  
  return {
    temp: Math.round(data.main.temp),
    feelsLike: Math.round(data.main.feels_like),
    condition: data.weather[0].main,
    description: data.weather[0].description,
    humidity: data.main.humidity,
    windSpeed: data.wind.speed,
    icon: data.weather[0].icon,
  };
}

async function fetchCityName(location: LocationData): Promise<string> {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${location.latitude}&lon=${location.longitude}&limit=1&appid=${OPENWEATHER_API_KEY}`
    );
    
    if (!response.ok) {
      return '未知位置';
    }
    
    const data = await response.json();
    if (data && data.length > 0) {
      return data[0].name || data[0].local_names?.zh || '未知位置';
    }
    return '未知位置';
  } catch (error) {
    console.error('Failed to fetch city name:', error);
    return '未知位置';
  }
}

export function useLocation() {
  return useQuery({
    queryKey: ['location'],
    queryFn: getCurrentLocation,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}

export function useWeather(location: LocationData | undefined) {
  return useQuery({
    queryKey: ['weather', location],
    queryFn: () => fetchWeatherData(location!),
    enabled: !!location,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCityName(location: LocationData | undefined) {
  return useQuery({
    queryKey: ['cityName', location],
    queryFn: () => fetchCityName(location!),
    enabled: !!location,
    staleTime: 60 * 60 * 1000,
  });
}
