import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { observer } from 'mobx-react-lite';
import { userStore } from '@entities/user';
import { RootStackParamList, MainTabParamList } from '@shared/types';
import { colors, typography } from '@shared/ui/theme';

// Pages
import { AuthPage } from '@pages/AuthPage';
import { HomePage } from '@pages/HomePage';
import { PlantDetailPage } from '@pages/PlantDetailPage';
import { AddPlantPage } from '@pages/AddPlantPage';
import { IdentifyPage } from '@pages/IdentifyPage';
import { SchedulePage } from '@pages/SchedulePage';
import { SearchPage } from '@pages/SearchPage';
import { SettingsPage } from '@pages/SettingsPage';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<keyof MainTabParamList, string> = {
  Home: '🏠',
  Schedule: '📅',
  Search: '🔍',
  Settings: '⚙️',
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: () => {
          const icon = TAB_ICONS[route.name as keyof MainTabParamList];
          return (
            <View style={tabStyles.iconContainer}>
              <Text style={tabStyles.icon}>{icon}</Text>
            </View>
          );
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray400,
        tabBarStyle: tabStyles.tabBar,
        tabBarLabelStyle: tabStyles.tabBarLabel,
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomePage}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Schedule"
        component={SchedulePage}
        options={{ tabBarLabel: 'Schedule' }}
      />
      <Tab.Screen
        name="Search"
        component={SearchPage}
        options={{ tabBarLabel: 'Search' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsPage}
        options={{ tabBarLabel: 'Settings' }}
      />
    </Tab.Navigator>
  );
}

const tabStyles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    paddingTop: 6,
    paddingBottom: 20,
    height: 80,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabBarLabel: {
    ...typography.small,
    fontWeight: '600',
    marginTop: 2,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 22,
  },
});

export const AppRouter: React.FC = observer(() => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      await userStore.checkAuthState();
      setIsReady(true);
    };
    init();
  }, []);

  if (!isReady || userStore.loading) {
    return (
      <View style={stylesLoading.container}>
        <Text style={stylesLoading.icon}>🌿</Text>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={stylesLoading.text}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.white,
            },
            headerTintColor: colors.gray900,
            headerTitleStyle: {
              ...typography.h4,
            },
            headerShadowVisible: false,
            contentStyle: {
              backgroundColor: colors.background,
            },
          }}
        >
          {!userStore.isAuthenticated ? (
            <Stack.Screen
              name="Auth"
              component={AuthPage}
              options={{ headerShown: false }}
            />
          ) : (
            <>
              <Stack.Screen
                name="MainTabs"
                component={MainTabs}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="PlantDetail"
                component={PlantDetailPage}
                options={{ title: 'Plant Details' }}
              />
              <Stack.Screen
                name="AddPlant"
                component={AddPlantPage}
                options={{ title: 'Add Plant' }}
              />
              <Stack.Screen
                name="Identify"
                component={IdentifyPage}
                options={{ title: 'Identify Plant' }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
});

const stylesLoading = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    gap: 16,
  },
  icon: {
    fontSize: 64,
  },
  text: {
    ...typography.body,
    color: colors.gray500,
  },
});
