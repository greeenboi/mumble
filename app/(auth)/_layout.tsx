import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';

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
          animation: 'none',
          title: 'Sign In',
          tabBarIcon: ({ color }) => <Ionicons name="log-in" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="sign-up"
        options={{
          headerShown: false,
          animation: 'none',
          title: 'Sign Up',
          tabBarIcon: ({ color }) => <Ionicons name="person-add" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
