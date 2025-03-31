import '@/global.css';
import 'expo-dev-client';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { PortalHost } from '@rn-primitives/portal';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { Platform } from 'react-native';

import { AuthProvider } from '../providers/AuthProvider';

import { NAV_THEME } from '@/lib/constants';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { type Theme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/lib/useColorScheme';

const LIGHT_THEME: Theme = {
  dark: false,
  colors: {
    background: NAV_THEME.light.background,
    border: NAV_THEME.light.border,
    card: NAV_THEME.light.card,
    notification: NAV_THEME.light.accent,
    primary: NAV_THEME.light.primary,
    text: NAV_THEME.light.foreground,
  },
};
const DARK_THEME: Theme = {
  dark: true,
  colors: {
    background: NAV_THEME.dark.background,
    border: NAV_THEME.dark.border,
    card: NAV_THEME.dark.card,
    notification: NAV_THEME.dark.accent,
    primary: NAV_THEME.dark.primary,
    text: NAV_THEME.dark.foreground,
  },
};

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(auth)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
  const { colorScheme, setColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);

  // Effect for handling errors
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // Effect for handling theme loading
  useEffect(() => {
    (async () => {
      const theme = await AsyncStorage.getItem('theme');
      if (Platform.OS === 'web') {
        document.documentElement.classList.add('bg-background');
      }
      if (!theme) {
        AsyncStorage.setItem('theme', colorScheme);
        setIsColorSchemeLoaded(true);
        return;
      }
      const colorTheme = theme === 'dark' ? 'dark' : 'light';
      if (colorTheme !== colorScheme) {
        setColorScheme(colorTheme);
      }
      setIsColorSchemeLoaded(true);
    })().finally(() => {
      SplashScreen.hideAsync();
    });
  }, [colorScheme, setColorScheme]);

  // Effect for handling font loading
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Combined loading check
  if (!loaded || !isColorSchemeLoaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const { colorScheme } = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DARK_THEME : LIGHT_THEME}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Stack initialRouteName="(auth)">
          <Stack.Screen
            name="(auth)"
            options={{ headerShown: false, presentation: 'containedModal' }}
          />
          <Stack.Screen name="(protected)" options={{ headerShown: false }} />
        </Stack>
        <PortalHost />
      </ThemeProvider>
    </AuthProvider>
  );
}

