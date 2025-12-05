export interface WeatherData {
  temp: number;
  feelsLike: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
}

export interface ClothingRecommendation {
  title: string;
  items: string[];
  tips: string;
}
