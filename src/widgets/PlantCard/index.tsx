import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Card, Badge } from '@shared/ui';
import { colors, typography } from '@shared/ui/theme';
import { Plant } from '@shared/types';
import { formatRelativeDate, getDaysDifference } from '@shared/lib/helpers';

interface PlantCardProps {
  plant: Plant;
  onPress: () => void;
  onWaterPress?: () => void;
}

export const PlantCard: React.FC<PlantCardProps> = ({
  plant,
  onPress,
  onWaterPress,
}) => {
  const daysUntilWatering = getDaysDifference(plant.nextWateringAt || '');
  const isOverdue = daysUntilWatering < 0;
  const isDueToday = daysUntilWatering === 0;

  const getWateringBadge = () => {
    if (isOverdue) return <Badge label={`${Math.abs(daysUntilWatering)}d overdue`} variant="error" />;
    if (isDueToday) return <Badge label="Due today" variant="warning" />;
    if (daysUntilWatering <= 2) return <Badge label={`In ${daysUntilWatering}d`} variant="info" />;
    return null;
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <Card style={styles.card} variant="elevated">
        <View style={styles.row}>
          {/* Plant Image Placeholder */}
          <View style={styles.imageContainer}>
            {plant.imageUri ? (
              <Image source={{ uri: plant.imageUri }} style={styles.image} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.placeholderEmoji}>🪴</Text>
              </View>
            )}
          </View>

          {/* Plant Info */}
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>
              {plant.name}
            </Text>
            {plant.scientificName && (
              <Text style={styles.scientificName} numberOfLines={1}>
                {plant.scientificName}
              </Text>
            )}
            <View style={styles.badgeRow}>
              {getWateringBadge()}
              {plant.sunlightRequirement === 'low' && (
                <Badge label="Low light" variant="default" />
              )}
              {plant.sunlightRequirement === 'direct' && (
                <Badge label="Full sun" variant="info" />
              )}
            </View>
          </View>

          {/* Water Button */}
          {onWaterPress && (
            <TouchableOpacity
              style={[styles.waterButton, isOverdue && styles.waterButtonOverdue]}
              onPress={onWaterPress}
            >
              <Text style={styles.waterEmoji}>💧</Text>
              <Text style={styles.waterLabel}>
                {isOverdue
                  ? `${Math.abs(daysUntilWatering)}d`
                  : isDueToday
                  ? 'Now'
                  : `${daysUntilWatering}d`}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 28,
  },
  info: {
    flex: 1,
    marginLeft: 14,
  },
  name: {
    ...typography.bodyBold,
    color: colors.gray900,
  },
  scientificName: {
    ...typography.caption,
    color: colors.gray500,
    fontStyle: 'italic',
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    gap: 4,
  },
  waterButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.infoLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginLeft: 8,
  },
  waterButtonOverdue: {
    backgroundColor: colors.errorLight,
  },
  waterEmoji: {
    fontSize: 20,
  },
  waterLabel: {
    ...typography.small,
    color: colors.gray700,
    fontWeight: '600',
    marginTop: 2,
  },
});
