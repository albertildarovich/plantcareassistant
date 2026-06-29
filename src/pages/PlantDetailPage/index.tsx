import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { Button, Card, Badge, EmptyState, ProgressBar } from '@shared/ui';
import { colors, typography } from '@shared/ui/theme';
import { observer } from 'mobx-react-lite';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { plantStore } from '@entities/plant';
import { PhotoTimeline } from '@widgets/PhotoTimeline';
import { RootStackParamList } from '@shared/types';
import { formatDate, getDaysDifference } from '@shared/lib/helpers';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type DetailRouteProp = RouteProp<RootStackParamList, 'PlantDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SCREEN_WIDTH = Dimensions.get('window').width;

export const PlantDetailPage: React.FC = observer(() => {
  const route = useRoute<DetailRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { plantId } = route.params;

  const plant = plantStore.getPlantById(plantId);

  useEffect(() => {
    if (!plant) {
      navigation.goBack();
    }
  }, [plant, navigation]);

  if (!plant) {
    return (
      <View style={styles.container}>
        <EmptyState title="Plant not found" icon="😢" />
      </View>
    );
  }

  const daysSinceWatered = plant.lastWateredAt
    ? Math.abs(getDaysDifference(plant.lastWateredAt))
    : 0;

  const handleTakePhoto = async () => {
    Alert.alert('Add Photo', 'Choose a method', [
      {
        text: 'Camera',
        onPress: async () => {
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 0.8,
          });
          if (result.assets?.[0]?.uri) {
            await plantStore.addGrowthPhoto(plantId, result.assets[0].uri);
          }
        },
      },
      {
        text: 'Gallery',
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.8,
          });
          if (result.assets?.[0]?.uri) {
            await plantStore.addGrowthPhoto(plantId, result.assets[0].uri);
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Plant',
      `Are you sure you want to delete ${plant.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await plantStore.deletePlant(plantId);
            navigation.goBack();
          },
        },
      ],
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Plant Hero Image */}
      <View style={styles.heroContainer}>
        {plant.imageUri ? (
          <Image source={{ uri: plant.imageUri }} style={styles.heroImage} />
        ) : (
          <View style={styles.heroPlaceholder}>
            <Text style={styles.heroEmoji}>🪴</Text>
          </View>
        )}
      </View>

      {/* Basic Info */}
      <View style={styles.infoSection}>
        <Text style={styles.plantName}>{plant.name}</Text>
        {plant.scientificName && (
          <Text style={styles.scientificName}>{plant.scientificName}</Text>
        )}
        {plant.description && (
          <Text style={styles.description}>{plant.description}</Text>
        )}

        <View style={styles.badges}>
          <Badge
            label={plant.isIndoor ? 'Indoor' : 'Outdoor'}
            variant="info"
          />
          <Badge
            label={
              plant.sunlightRequirement === 'low'
                ? 'Low Light'
                : plant.sunlightRequirement === 'medium'
                ? 'Medium Light'
                : plant.sunlightRequirement === 'bright_indirect'
                ? 'Bright Indirect'
                : 'Direct Sun'
            }
            variant="warning"
          />
        </View>
      </View>

      {/* Care Schedule Card */}
      <Card variant="outlined" style={styles.careCard}>
        <Text style={styles.cardTitle}>💧 Care Schedule</Text>

        <View style={styles.careRow}>
          <View style={styles.careItem}>
            <Text style={styles.careLabel}>Watering</Text>
            <Text style={styles.careValue}>
              Every {plant.wateringFrequencyDays} days
            </Text>
            <ProgressBar
              progress={Math.min(1, daysSinceWatered / plant.wateringFrequencyDays)}
              color={colors.waterBlue}
              label="Progress"
            />
            <View style={styles.careActions}>
              <Button
                title="💧 Watered"
                variant="outline"
                onPress={() => plantStore.markWatered(plant.id)}
                style={styles.careButton}
              />
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.careItem}>
            <Text style={styles.careLabel}>Fertilizing</Text>
            <Text style={styles.careValue}>
              Every {plant.fertilizingFrequencyDays} days
            </Text>
            <View style={styles.careActions}>
              <Button
                title="🌿 Fertilized"
                variant="outline"
                onPress={() => plantStore.markFertilized(plant.id)}
                style={styles.careButton}
              />
            </View>
          </View>
        </View>
      </Card>

      {/* Growth Photos */}
      <PhotoTimeline
        photos={plant.growthProgressPhotos}
        onTakePhoto={handleTakePhoto}
      />

      {/* Additional Info */}
      <Card variant="outlined" style={styles.detailsCard}>
        <Text style={styles.cardTitle}>📋 Details</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Added on</Text>
          <Text style={styles.detailValue}>{formatDate(plant.createdAt)}</Text>
        </View>
        {plant.temperatureRange && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Temperature</Text>
            <Text style={styles.detailValue}>{plant.temperatureRange}</Text>
          </View>
        )}
        {plant.humidityPreference && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Humidity</Text>
            <Text style={styles.detailValue}>{plant.humidityPreference}</Text>
          </View>
        )}
        {plant.notes && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Notes</Text>
            <Text style={styles.detailValue}>{plant.notes}</Text>
          </View>
        )}
      </Card>

      {/* Delete Button */}
      <Button
        title="Delete Plant"
        variant="danger"
        onPress={handleDelete}
        style={styles.deleteButton}
      />
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroContainer: {
    width: SCREEN_WIDTH,
    height: 280,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroEmoji: {
    fontSize: 80,
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: colors.white,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 8,
  },
  plantName: {
    ...typography.h1,
    color: colors.gray900,
  },
  scientificName: {
    ...typography.body,
    color: colors.gray500,
    fontStyle: 'italic',
    marginTop: 4,
  },
  description: {
    ...typography.body,
    color: colors.gray600,
    marginTop: 12,
    lineHeight: 24,
  },
  badges: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  careCard: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  cardTitle: {
    ...typography.h4,
    color: colors.gray900,
    marginBottom: 12,
  },
  careRow: {
    flexDirection: 'row',
    gap: 16,
  },
  careItem: {
    flex: 1,
  },
  careLabel: {
    ...typography.label,
    color: colors.gray500,
    marginBottom: 4,
  },
  careValue: {
    ...typography.bodyBold,
    color: colors.gray800,
    marginBottom: 12,
  },
  divider: {
    width: 1,
    backgroundColor: colors.gray200,
  },
  careActions: {
    marginTop: 8,
  },
  careButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  detailsCard: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  detailLabel: {
    ...typography.body,
    color: colors.gray500,
  },
  detailValue: {
    ...typography.body,
    color: colors.gray800,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  deleteButton: {
    marginHorizontal: 16,
    marginTop: 24,
  },
});
