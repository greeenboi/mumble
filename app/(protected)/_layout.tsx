import { Tabs } from 'expo-router';
import { View } from 'react-native';

import { NAV_THEME } from '../../lib/constants';
import { MoonStar } from '../../lib/icons/Moon';
import { Sun } from '../../lib/icons/Sun';
import { useColorScheme } from '../../lib/useColorScheme';

import { Button } from '~/components/ui/button';

export default function ProtectedLayout() {
  const { isDarkColorScheme, toggleColorScheme } = useColorScheme();

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
          <View className="mr-4">
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
          </View>
        ),
      }}>
      <Tabs.Screen name="notes" />
    </Tabs>
  );
}
