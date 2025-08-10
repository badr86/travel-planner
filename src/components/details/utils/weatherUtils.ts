export const getWeatherIcon = (iconCode: string) => {
  const iconMap: Record<string, string> = {
    '01d': '☀️', '01n': '🌙',
    '02d': '⛅', '02n': '☁️',
    '03d': '☁️', '03n': '☁️',
    '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️',
    '10d': '🌦️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️',
    '13d': '❄️', '13n': '❄️',
    '50d': '🌫️', '50n': '🌫️',
  };
  return iconMap[iconCode] || '🌤️';
};

export const getWeatherConditionColor = (condition: string) => {
  const conditionColors: Record<string, string> = {
    'clear': 'text-yellow-600',
    'sunny': 'text-yellow-600',
    'cloudy': 'text-gray-600',
    'overcast': 'text-gray-700',
    'rain': 'text-blue-600',
    'drizzle': 'text-blue-500',
    'thunderstorm': 'text-purple-600',
    'snow': 'text-blue-200',
    'fog': 'text-gray-500',
    'mist': 'text-gray-400',
  };
  
  const lowerCondition = condition.toLowerCase();
  for (const [key, color] of Object.entries(conditionColors)) {
    if (lowerCondition.includes(key)) {
      return color;
    }
  }
  return 'text-gray-600';
};

export const getTemperatureColor = (temp: number) => {
  if (temp >= 30) return 'text-red-600';
  if (temp >= 25) return 'text-orange-500';
  if (temp >= 20) return 'text-yellow-600';
  if (temp >= 15) return 'text-green-600';
  if (temp >= 10) return 'text-blue-500';
  return 'text-blue-700';
};
