import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Card } from '@shared/ui';
import { colors, typography } from '@shared/ui/theme';
import { GrowthPhoto } from '@shared/types';
import { formatDate } from '@shared/lib/helpers';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PHOTO_SIZE = (SCREEN_WIDTH - 64) / 3;

interface PhotoTimelineProps {
  photos: GrowthPhoto[];
  onTakePhoto: () => void;
}

export const PhotoTimeline: React.FC<PhotoTimelineProps> = ({
  photos,
  onTakePhoto,
}) => {
  return (
    <Card variant="outlined" style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Growth Progress</Text>
        <TouchableOpacity style={styles.addButton} onPress={onTakePhoto}>
          <Text style={styles.addButtonText}>+ Photo</Text>
        </TouchableOpacity>
      </View>

      {photos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📸</Text>
          <Text style={styles.emptyText}>
            No progress photos yet{'\n'}Take a photo to track growth
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.photosRow}
        >
          {photos.map((photo) => (
            <TouchableOpacity key={photo.id} style={styles.photoCard}>
              <Image source={{ uri: photo.uri }} style={styles.photo} />
              <Text style={styles.photoDate}>{formatDate(photo.takenAt)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    ...typography.h4,
    color: colors.gray900,
  },
  addButton: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    ...typography.body,
    color: colors.gray400,
    textAlign: 'center',
  },
  photosRow: {
    gap: 10,
  },
  photoCard: {
    width: PHOTO_SIZE,
  },
  photo: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: 12,
    backgroundColor: colors.gray100,
  },
  photoDate: {
    ...typography.small,
    color: colors.gray500,
    textAlign: 'center',
    marginTop: 4,
  },
});
