import { Tabs } from 'expo-router';

import { NAV_THEME } from '../../lib/constants';
import { useColorScheme } from '../../lib/useColorScheme';

export default function ProtectedLayout() {
  const { isDarkColorScheme } = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: isDarkColorScheme
            ? NAV_THEME.dark.background
            : NAV_THEME.light.background,
        },
        headerTintColor: isDarkColorScheme ? NAV_THEME.dark.text : NAV_THEME.light.text,
      }}>
      <Tabs.Screen name="notes" options={{ title: 'Notes' }} />
    </Tabs>
  );
}
