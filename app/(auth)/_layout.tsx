import { Tabs } from 'expo-router';
import { LogIn, UserPlus } from 'lucide-react-native';

export default function AuthTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
        },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.5)',
      }}>
      <Tabs.Screen
        name="sign-in"
        options={{
          headerShown: false,
          title: 'Sign In',
          tabBarIcon: ({ color }) => <LogIn size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="sign-up"
        options={{
          headerShown: false,
          title: 'Sign Up',
          tabBarIcon: ({ color }) => <UserPlus size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
