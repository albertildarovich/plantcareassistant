import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { Button, Card } from '@shared/ui';
import { colors, typography } from '@shared/ui/theme';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import { userStore } from '@entities/user';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@shared/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const SettingsPage: React.FC = observer(() => {
  const navigation = useNavigation<NavigationProp>();
  const { currentUser } = userStore;

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await userStore.signOut();
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Coming Soon',
      'Account deletion will be available in a future update.',
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Profile Section */}
        <Card variant="outlined" style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>👤 Profile</Text>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>🌿</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {currentUser?.displayName || 'Plant Parent'}
              </Text>
              <Text style={styles.profileEmail}>{currentUser?.email}</Text>
            </View>
          </View>
        </Card>

        {/* Account */}
        <Card variant="outlined" style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>🔐 Account</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Email Notifications</Text>
            <Switch
              value={currentUser?.notificationEnabled ?? true}
              onValueChange={value =>
                userStore.updateNotificationPreference(value)
              }
              trackColor={{
                false: colors.gray300,
                true: colors.primaryLight,
              }}
              thumbColor={
                currentUser?.notificationEnabled
                  ? colors.primary
                  : colors.gray400
              }
            />
          </View>
          <View style={styles.divider} />
          <Button
            title="Sign Out"
            variant="outline"
            onPress={handleSignOut}
            style={styles.signOutButton}
          />
          <Button
            title="Delete Account"
            variant="danger"
            onPress={handleDeleteAccount}
            style={styles.deleteButton}
          />
        </Card>

        {/* About */}
        <Card variant="outlined" style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>ℹ️ About</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Version</Text>
            <Text style={styles.settingValue}>1.0.0</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Made with ❤️</Text>
            <Text style={styles.settingValue}>Plant Care Assistant</Text>
          </View>
        </Card>

        {/* App Info */}
        <Text style={styles.footerText}>
          Plant Care Assistant helps you track and care for your houseplants.
        </Text>
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
    marginBottom: 16,
  },
  title: {
    ...typography.h2,
    color: colors.gray900,
  },
  sectionCard: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.gray900,
    marginBottom: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarEmoji: {
    fontSize: 28,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...typography.h4,
    color: colors.gray900,
  },
  profileEmail: {
    ...typography.body,
    color: colors.gray500,
    marginTop: 2,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLabel: {
    ...typography.body,
    color: colors.gray700,
  },
  settingValue: {
    ...typography.body,
    color: colors.gray500,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray200,
    marginVertical: 8,
  },
  signOutButton: {
    marginTop: 8,
  },
  deleteButton: {
    marginTop: 8,
  },
  footerText: {
    ...typography.caption,
    color: colors.gray400,
    textAlign: 'center',
    paddingHorizontal: 40,
    marginTop: 24,
  },
});
