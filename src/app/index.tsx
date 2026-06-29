import React, { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProviders } from './providers';
import { initDatabase } from '@shared/api/database';
import { setupFirebaseMessaging, requestNotificationPermission } from '@shared/lib';

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const App: React.FC = () => {
  useEffect(() => {
    const setup = async () => {
      try {
        await initDatabase();
        await requestNotificationPermission();
        await setupFirebaseMessaging();
        console.log('App initialized successfully');
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };
    setup();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <AppProviders />
    </SafeAreaProvider>
  );
};

export default App;
