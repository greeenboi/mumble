import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';

import BearLogo from './logos/bear-logo';

import { useColorScheme } from '~/lib/useColorScheme';
import { cn } from '~/lib/utils';

export function AuthBackground() {
  const { theme } = useColorScheme();

  return (
    <View className={cn('absolute inset-0', theme.className)}>
      <LinearGradient
        colors={['#3f6426', '#304224', '#53522d', '#17260d']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute h-full w-full"
      />
      <View className="absolute inset-0 flex items-center justify-center opacity-20">
        <BearLogo />
      </View>
    </View>
  );
}
