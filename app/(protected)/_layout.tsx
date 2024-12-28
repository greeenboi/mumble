import { useRouter, Tabs } from 'expo-router';
import { View } from 'react-native';

import { Button } from '~/components/ui/button';
import { NAV_THEME } from '~/lib/constants';
import { MoonStar } from '~/lib/icons/Moon';
import { Settings } from '~/lib/icons/Settings';
import { Sun } from '~/lib/icons/Sun';
import { useColorScheme } from '~/lib/useColorScheme';

export default function ProtectedLayout() {
  const { isDarkColorScheme, toggleColorScheme } = useColorScheme();
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: isDarkColorScheme
            ? NAV_THEME.dark.background
            : NAV_THEME.light.background,
        },
        headerTintColor: isDarkColorScheme ? NAV_THEME.dark.secondary : NAV_THEME.light.secondary,
        headerShown: true,
        headerTitle: '',
        headerRight: () => (
          <View className="mr-4 flex flex-row items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onPress={toggleColorScheme}
              className="h-9 w-9 rounded-md">
              {isDarkColorScheme ? (
                <MoonStar className="h-4 w-4 text-foreground" />
              ) : (
                <Sun className="h-4 w-4 text-foreground" />
              )}
            </Button>
            <Button
              variant="link"
              size="icon"
              onPress={() => router.push('/settings')}
              className="h-9 w-9 rounded-md">
              <Settings className="h-4 w-4 text-foreground" />
            </Button>
          </View>
        ),
      }}>
      <Tabs.Screen name="notes" />
      <Tabs.Screen name="settings" options={{ animation: 'fade', href: null }} />
    </Tabs>
  );
}
