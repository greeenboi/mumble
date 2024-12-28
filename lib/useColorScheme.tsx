import { useColorScheme as useNativewindColorScheme } from 'nativewind';

const lightColors = {
  primary: 'hsl(96, 45%, 27%)',
  secondary: 'hsl(96, 30%, 70%)',
  accent: 'hsl(58, 30%, 80%)',
  background: 'hsl(96, 100%, 95%)',
};

const darkColors = {
  primary: 'hsl(96, 45%, 27%)',
  secondary: 'hsl(96, 30%, 20%)',
  accent: 'hsl(58, 30%, 25%)',
  background: 'hsl(96, 50%, 10%)',
};

export function useColorScheme() {
  const { colorScheme, setColorScheme, toggleColorScheme } = useNativewindColorScheme();
  const isDarkColorScheme = colorScheme === 'dark';

  return {
    colorScheme: colorScheme ?? 'dark',
    isDarkColorScheme,
    setColorScheme,
    toggleColorScheme,
    theme: {
      colors: isDarkColorScheme ? darkColors : lightColors,
      className: isDarkColorScheme ? 'dark' : 'light',
    },
  };
}
