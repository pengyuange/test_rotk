import { ClothingRecommendation } from '@/types/weather';

export function getClothingRecommendation(temp: number): ClothingRecommendation {
  if (temp < 0) {
    return {
      title: '极寒天气',
      items: ['羽绒服', '厚毛衣', '保暖内衣', '围巾手套', '厚裤子'],
      tips: '天气非常寒冷，请注意保暖，减少外出时间'
    };
  } else if (temp < 10) {
    return {
      title: '寒冷天气',
      items: ['厚外套', '毛衣', '长裤', '围巾'],
      tips: '天气较冷，建议多穿一层保暖'
    };
  } else if (temp < 15) {
    return {
      title: '凉爽天气',
      items: ['外套', '长袖衬衫', '薄毛衣', '长裤'],
      tips: '天气微凉，适合穿薄外套出门'
    };
  } else if (temp < 20) {
    return {
      title: '舒适天气',
      items: ['长袖T恤', '薄外套', '牛仔裤'],
      tips: '天气舒适，建议穿长袖和薄外套'
    };
  } else if (temp < 25) {
    return {
      title: '温暖天气',
      items: ['短袖T恤', '轻薄外套', '休闲裤'],
      tips: '天气温暖，可以穿短袖，早晚带件外套'
    };
  } else if (temp < 30) {
    return {
      title: '炎热天气',
      items: ['短袖', '短裤/裙子', '防晒衣', '太阳帽'],
      tips: '天气炎热，注意防晒和补水'
    };
  } else {
    return {
      title: '酷热天气',
      items: ['透气短袖', '短裤', '防晒霜', '太阳镜', '遮阳帽'],
      tips: '天气非常炎热，尽量避免长时间暴露在阳光下，多喝水'
    };
  }
}

export function getWeatherEmoji(condition: string): string {
  const lowerCondition = condition.toLowerCase();
  if (lowerCondition.includes('clear') || lowerCondition.includes('sunny')) {
    return '☀️';
  } else if (lowerCondition.includes('cloud')) {
    return '☁️';
  } else if (lowerCondition.includes('rain')) {
    return '🌧️';
  } else if (lowerCondition.includes('snow')) {
    return '❄️';
  } else if (lowerCondition.includes('thunder') || lowerCondition.includes('storm')) {
    return '⛈️';
  } else if (lowerCondition.includes('mist') || lowerCondition.includes('fog')) {
    return '🌫️';
  }
  return '🌤️';
}
