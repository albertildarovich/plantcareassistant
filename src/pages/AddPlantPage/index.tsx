import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Button, Input, Card, Chip } from '@shared/ui';
import { colors, typography } from '@shared/ui/theme';
import { observer } from 'mobx-react-lite';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { plantStore } from '@entities/plant';
import { userStore } from '@entities/user';
import { RootStackParamList, SunlightRequirement } from '@shared/types';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { identifyPlantModel } from '@features/identifyPlant/model';

type AddPlantRouteProp = RouteProp<RootStackParamList, 'AddPlant'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SUNLIGHT_OPTIONS: { label: string; value: SunlightRequirement }[] = [
  { label: 'Low Light', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'Bright Indirect', value: 'bright_indirect' },
  { label: 'Direct Sun', value: 'direct' },
];

export const AddPlantPage: React.FC = observer(() => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<AddPlantRouteProp>();
  const identificationResult = route.params?.identificationResult;

  const [name, setName] = useState(identificationResult?.plantName || '');
  const [scientificName, setScientificName] = useState(
    identificationResult?.scientificName || '',
  );
  const [description, setDescription] = useState(
    identificationResult?.description || '',
  );
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [wateringFrequency, setWateringFrequency] = useState('7');
  const [fertilizingFrequency, setFertilizingFrequency] = useState('30');
  const [sunlight, setSunlight] = useState<SunlightRequirement>('medium');
  const [isIndoor, setIsIndoor] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (result.assets?.[0]?.uri) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a plant name');
      return;
    }

    if (!userStore.currentUser) {
      Alert.alert('Error', 'You must be logged in');
      return;
    }

    setIsSubmitting(true);

    try {
      await plantStore.addPlant({
        name: name.trim(),
        scientificName: scientificName.trim() || undefined,
        description: description.trim() || undefined,
        imageUri: imageUri || undefined,
        category: { id: '1', name: 'General', icon: '🌿' },
        wateringFrequencyDays: parseInt(wateringFrequency, 10) || 7,
        fertilizingFrequencyDays: parseInt(fertilizingFrequency, 10) || 30,
        sunlightRequirement: sunlight,
        isIndoor,
        ownerId: userStore.currentUser.id,
        growthProgressPhotos: [] as any,
      } as any);

      navigation.navigate('MainTabs');
    } catch (err) {
      Alert.alert('Error', 'Failed to add plant. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      {/* Photo Section */}
      <TouchablePhotoArea imageUri={imageUri} onPress={handlePickImage} />

      {/* Form */}
      <View style={styles.form}>
        <Input
          label="Plant Name *"
          placeholder="e.g., Monstera Deliciosa"
          value={name}
          onChangeText={setName}
        />

        <Input
          label="Scientific Name"
          placeholder="e.g., Monstera deliciosa"
          value={scientificName}
          onChangeText={setScientificName}
        />

        <Input
          label="Description"
          placeholder="Brief description of your plant..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />

        {/* Sunlight Requirement */}
        <View style={styles.section}>
          <Text style={styles.label}>Sunlight Requirement</Text>
          <View style={styles.chipsRow}>
            {SUNLIGHT_OPTIONS.map(option => (
              <Chip
                key={option.value}
                label={option.label}
                selected={sunlight === option.value}
                onPress={() => setSunlight(option.value)}
              />
            ))}
          </View>
        </View>

        {/* Indoor/Outdoor */}
        <View style={styles.section}>
          <Text style={styles.label}>Environment</Text>
          <View style={styles.chipsRow}>
            <Chip
              label="Indoor"
              selected={isIndoor}
              onPress={() => setIsIndoor(true)}
            />
            <Chip
              label="Outdoor"
              selected={!isIndoor}
              onPress={() => setIsIndoor(false)}
            />
          </View>
        </View>

        {/* Care Frequencies */}
        <View style={styles.frequencyRow}>
          <View style={styles.frequencyItem}>
            <Input
              label="Water (days)"
              placeholder="7"
              value={wateringFrequency}
              onChangeText={setWateringFrequency}
              keyboardType="number-pad"
            />
          </View>
          <View style={styles.frequencyItem}>
            <Input
              label="Fertilize (days)"
              placeholder="30"
              value={fertilizingFrequency}
              onChangeText={setFertilizingFrequency}
              keyboardType="number-pad"
            />
          </View>
        </View>

        {/* Buttons */}
        <Button
          title="Add Plant"
          onPress={handleSubmit}
          loading={isSubmitting}
          style={styles.submitButton}
        />
        <Button
          title="Cancel"
          variant="outline"
          onPress={() => navigation.goBack()}
        />
      </View>
    </ScrollView>
  );
});

const TouchablePhotoArea: React.FC<{
  imageUri: string | null;
  onPress: () => void;
}> = ({ imageUri, onPress }) => (
  <TouchableOpacity style={styles.photoArea} onPress={onPress}>
    {imageUri ? (
      <Image source={{ uri: imageUri }} style={styles.photoImage} />
    ) : (
      <View style={styles.photoPlaceholder}>
        <Text style={styles.photoEmoji}>📷</Text>
        <Text style={styles.photoText}>Tap to add photo</Text>
      </View>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  photoArea: {
    width: '100%',
    height: 220,
    backgroundColor: colors.gray100,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  photoText: {
    ...typography.body,
    color: colors.gray500,
  },
  form: {
    padding: 20,
  },
  section: {
    marginBottom: 16,
  },
  label: {
    ...typography.label,
    color: colors.gray700,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  frequencyRow: {
    flexDirection: 'row',
    gap: 12,
  },
  frequencyItem: {
    flex: 1,
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 12,
  },
});
