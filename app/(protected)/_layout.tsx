import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter, Tabs } from 'expo-router';
import { View } from 'react-native';

import { Button } from '~/components/ui/button';
import { NAV_THEME } from '~/lib/constants';
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
                <Ionicons name="moon" className="h-4 w-4 text-foreground" />
              ) : (
                <Ionicons name="sunny" className="h-4 w-4 text-foreground" />
              )}
            </Button>
            <Button
              variant="link"
              size="icon"
              onPress={() => router.push('/settings')}
              className="h-9 w-9 rounded-md">
              <Ionicons name="settings" className="h-4 w-4 text-foreground" />
            </Button>
          </View>
        ),
      }}>
      <Tabs.Screen name="notes" options={{ href: '/notes' }}/>
      <Tabs.Screen name="settings" options={{ href: '/settings', animation: 'fade' }}/>
    </Tabs>
  );
}
