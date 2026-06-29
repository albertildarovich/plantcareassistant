export interface Plant {
  id: string;
  name: string;
  scientificName?: string;
  description?: string;
  imageUri?: string;
  category: PlantCategory;
  wateringFrequencyDays: number;
  fertilizingFrequencyDays: number;
  lastWateredAt?: string;
  lastFertilizedAt?: string;
  nextWateringAt?: string;
  nextFertilizingAt?: string;
  sunlightRequirement: SunlightRequirement;
  humidityPreference?: string;
  temperatureRange?: string;
  isIndoor: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  growthProgressPhotos: GrowthPhoto[];
}

export interface GrowthPhoto {
  id: string;
  uri: string;
  takenAt: string;
  notes?: string;
}

export interface PlantCategory {
  id: string;
  name: string;
  icon: string;
}

export type SunlightRequirement = 'low' | 'medium' | 'bright_indirect' | 'direct';

export interface PlantCareSchedule {
  plantId: string;
  type: 'watering' | 'fertilizing';
  lastDoneAt?: string;
  nextDueAt: string;
  frequencyDays: number;
}

export interface User {
  id: string;
  email: string;
  displayName?: string;
  avatarUri?: string;
  location?: UserLocation;
  notificationEnabled: boolean;
  createdAt: string;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  cityName?: string;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  condition: string;
  icon: string;
  cityName: string;
  forecast: WeatherForecast[];
}

export interface WeatherForecast {
  date: string;
  tempMax: number;
  tempMin: number;
  humidity: number;
  condition: string;
  icon: string;
}

export interface WeatherCareTip {
  condition: string;
  tip: string;
  priority: 'low' | 'medium' | 'high';
}

export interface PlantSearchResult {
  id: string;
  name: string;
  scientificName: string;
  imageUrl?: string;
  description?: string;
  difficulty?: 'easy' | 'moderate' | 'hard';
}

export interface IdentificationResult {
  plantName: string;
  scientificName: string;
  confidence: number;
  description?: string;
  careInstructions?: string;
}

export type RootStackParamList = {
  Auth: undefined;
  MainTabs: undefined;
  PlantDetail: { plantId: string };
  AddPlant: { identificationResult?: IdentificationResult };
  Identify: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Schedule: undefined;
  Search: undefined;
  Settings: undefined;
};

export type Database = {
  plants: Plant[];
  schedules: PlantCareSchedule[];
  users: User[];
};
