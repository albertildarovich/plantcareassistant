import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Button, Card } from '@shared/ui';
import { colors, typography } from '@shared/ui/theme';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import { identifyPlantModel } from '@features/identifyPlant/model';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@shared/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const IdentifyPage: React.FC = observer(() => {
  const navigation = useNavigation<NavigationProp>();
  const [showOptions, setShowOptions] = useState(true);

  const handleCamera = async () => {
    setShowOptions(false);
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (result.assets?.[0]?.uri) {
      identifyPlantModel.setCapturedImage(result.assets[0].uri);
      await identifyPlantModel.identifyPlant(result.assets[0].uri);
    }
  };

  const handleGallery = async () => {
    setShowOptions(false);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (result.assets?.[0]?.uri) {
      identifyPlantModel.setCapturedImage(result.assets[0].uri);
      await identifyPlantModel.identifyPlant(result.assets[0].uri);
    }
  };

  const handleAddToCollection = () => {
    if (identifyPlantModel.identificationResult) {
      navigation.navigate('AddPlant', {
        identificationResult: identifyPlantModel.identificationResult,
      });
      identifyPlantModel.clearIdentification();
    }
  };

  const handleRetake = () => {
    identifyPlantModel.clearIdentification();
    setShowOptions(true);
  };

  if (identifyPlantModel.isIdentifying) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.scanningEmoji}>🔍</Text>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.scanningText}>Identifying plant...</Text>
          <Text style={styles.scanningSubtext}>
            Analyzing leaf patterns and features
          </Text>
        </View>
      </View>
    );
  }

  if (identifyPlantModel.identificationResult) {
    const result = identifyPlantModel.identificationResult;
    return (
      <View style={styles.container}>
        <View style={styles.resultContent}>
          <Text style={styles.successEmoji}>🎉</Text>
          <Text style={styles.resultTitle}>Plant Identified!</Text>

          <Card variant="elevated" style={styles.resultCard}>
            <Text style={styles.plantName}>{result.plantName}</Text>
            <Text style={styles.scientificName}>{result.scientificName}</Text>

            <View style={styles.confidenceRow}>
              <Text style={styles.confidenceLabel}>Confidence</Text>
              <Text style={styles.confidenceValue}>
                {Math.round(result.confidence * 100)}%
              </Text>
            </View>

            {result.description && (
              <Text style={styles.description}>{result.description}</Text>
            )}

            {result.careInstructions && (
              <>
                <Text style={styles.careTitle}>💡 Care Tips</Text>
                <Text style={styles.careText}>{result.careInstructions}</Text>
              </>
            )}
          </Card>

          <View style={styles.actionButtons}>
            <Button
              title="Add to My Collection"
              onPress={handleAddToCollection}
            />
            <Button
              title="Identify Another"
              variant="outline"
              onPress={handleRetake}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>🌿</Text>
        <Text style={styles.title}>Identify a Plant</Text>
        <Text style={styles.subtitle}>
          Take a photo of any plant and we'll identify it for you
        </Text>

        {identifyPlantModel.error && (
          <Text style={styles.errorText}>{identifyPlantModel.error}</Text>
        )}

        <Card variant="outlined" style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>📸 Tips for best results:</Text>
          <Text style={styles.tipItem}>• Focus on a single leaf or flower</Text>
          <Text style={styles.tipItem}>• Use good, natural lighting</Text>
          <Text style={styles.tipItem}>• Avoid shadows on the plant</Text>
          <Text style={styles.tipItem}>• Hold camera steady</Text>
        </Card>

        <View style={styles.buttonGroup}>
          <Button
            title="Take Photo"
            onPress={handleCamera}
            style={styles.cameraButton}
          />
          <Button
            title="Choose from Gallery"
            variant="outline"
            onPress={handleGallery}
          />
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  icon: {
    fontSize: 80,
    textAlign: 'center',
    marginBottom: 20,
  },
  title: {
    ...typography.h2,
    color: colors.gray900,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.gray500,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  tipsCard: {
    marginBottom: 32,
    backgroundColor: colors.infoLight,
  },
  tipsTitle: {
    ...typography.bodyBold,
    color: colors.gray800,
    marginBottom: 8,
  },
  tipItem: {
    ...typography.body,
    color: colors.gray600,
    marginBottom: 4,
  },
  buttonGroup: {
    gap: 12,
  },
  cameraButton: {
    // primary
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  scanningEmoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  scanningText: {
    ...typography.h3,
    color: colors.gray900,
    marginTop: 24,
  },
  scanningSubtext: {
    ...typography.body,
    color: colors.gray500,
    marginTop: 8,
  },
  resultContent: {
    flex: 1,
    padding: 24,
  },
  successEmoji: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 12,
  },
  resultTitle: {
    ...typography.h2,
    color: colors.gray900,
    textAlign: 'center',
    marginBottom: 24,
  },
  resultCard: {
    marginBottom: 24,
  },
  plantName: {
    ...typography.h3,
    color: colors.gray900,
  },
  scientificName: {
    ...typography.body,
    color: colors.gray500,
    fontStyle: 'italic',
    marginTop: 4,
  },
  confidenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  confidenceLabel: {
    ...typography.body,
    color: colors.gray500,
  },
  confidenceValue: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  description: {
    ...typography.body,
    color: colors.gray600,
    marginTop: 16,
    lineHeight: 24,
  },
  careTitle: {
    ...typography.bodyBold,
    color: colors.gray800,
    marginTop: 16,
  },
  careText: {
    ...typography.body,
    color: colors.gray600,
    marginTop: 4,
    lineHeight: 24,
  },
  actionButtons: {
    gap: 12,
  },
});
