import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Button, Input } from '@shared/ui';
import { colors, typography } from '@shared/ui/theme';
import { observer } from 'mobx-react-lite';
import { userStore } from '@entities/user';

export const AuthPage: React.FC = observer(() => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!isLogin && !displayName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    try {
      if (isLogin) {
        await userStore.signIn(email.trim(), password);
      } else {
        await userStore.signUp(email.trim(), password, displayName.trim());
      }
    } catch (err) {
      // Error is handled in the store
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    userStore.clearError();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🌿</Text>
          <Text style={styles.title}>Plant Care</Text>
          <Text style={styles.subtitle}>Assistant</Text>
          <Text style={styles.tagline}>
            {isLogin ? 'Welcome back!' : 'Start your plant journey'}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {!isLogin && (
            <Input
              label="Your Name"
              placeholder="Enter your name"
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
            />
          )}

          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {userStore.error && (
            <Text style={styles.errorText}>{userStore.error}</Text>
          )}

          <Button
            title={isLogin ? 'Sign In' : 'Create Account'}
            onPress={handleSubmit}
            loading={userStore.loading}
            style={styles.submitButton}
          />

          <Button
            title={
              isLogin
                ? "Don't have an account? Sign Up"
                : 'Already have an account? Sign In'
            }
            onPress={toggleMode}
            variant="outline"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 80,
    marginBottom: 12,
  },
  title: {
    ...typography.h1,
    color: colors.gray900,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.h2,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  tagline: {
    ...typography.body,
    color: colors.gray500,
    textAlign: 'center',
    marginTop: 8,
  },
  form: {
    gap: 4,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 8,
  },
  submitButton: {
    marginTop: 8,
  },
});
