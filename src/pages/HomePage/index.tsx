import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Button, EmptyState } from '@shared/ui';
import { colors, typography } from '@shared/ui/theme';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import { plantStore } from '@entities/plant';
import { userStore } from '@entities/user';
import { PlantCard } from '@widgets/PlantCard';
import { WeatherWidget } from '@widgets/WeatherWidget';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@shared/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomePage: React.FC = observer(() => {
  const navigation = useNavigation<NavigationProp>();
  const { plants, loading } = plantStore;
  const { currentUser } = userStore;

  useEffect(() => {
    if (currentUser) {
      plantStore.loadPlants(currentUser.id);
    }
  }, [currentUser]);

  const onRefresh = useCallback(() => {
    if (currentUser) {
      plantStore.loadPlants(currentUser.id);
    }
  }, [currentUser]);

  const totalPlants = plants.length;
  const dueToday = plantStore.dueSchedules.length;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hello, {currentUser?.displayName || 'Plant Parent'}! 🌱
            </Text>
            <Text style={styles.subtitle}>How are your plants today?</Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.primaryLight }]}>
            <Text style={styles.statNumber}>{totalPlants}</Text>
            <Text style={styles.statLabel}>Plants</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.infoLight }]}>
            <Text style={styles.statNumber}>{dueToday}</Text>
            <Text style={styles.statLabel}>Due Today</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.warningLight }]}>
            <Text style={styles.statNumber}>
              {plants.filter(p => p.growthProgressPhotos.length > 0).length}
            </Text>
            <Text style={styles.statLabel}>With Photos</Text>
          </View>
        </View>

        {/* Weather Widget */}
        {currentUser?.location && (
          <WeatherWidget location={currentUser.location} />
        )}

        {/* Plants List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Plants</Text>
          <Button
            title="+ Add"
            variant="outline"
            onPress={() => navigation.navigate('AddPlant', {})}
            style={styles.addButton}
          />
        </View>

        {plants.length === 0 ? (
          <EmptyState
            title="No plants yet!"
            description="Add your first plant to start tracking its care journey."
            icon="🪴"
            action={
              <Button
                title="Add Your First Plant"
                onPress={() => navigation.navigate('AddPlant', {})}
              />
            }
          />
        ) : (
          plants.map(plant => (
            <PlantCard
              key={plant.id}
              plant={plant}
              onPress={() => navigation.navigate('PlantDetail', { plantId: plant.id })}
              onWaterPress={() => plantStore.markWatered(plant.id)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingVertical: 20,
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  greeting: {
    ...typography.h2,
    color: colors.gray900,
  },
  subtitle: {
    ...typography.body,
    color: colors.gray500,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    ...typography.h2,
    color: colors.gray900,
  },
  statLabel: {
    ...typography.caption,
    color: colors.gray600,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.gray900,
  },
  addButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
});
