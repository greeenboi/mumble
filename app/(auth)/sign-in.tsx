import { BlurView } from 'expo-blur';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';

import { AuthBackground } from '../../components/AuthBackground';
import { useStore } from '../../store/store';

import { AuthAlert } from '~/components/auth/AuthAlert';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Text } from '~/components/ui/text';
import { useKeyboard } from '~/lib/Keyboard';
import { cn } from '~/lib/utils';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const signIn = useStore((state) => state.signIn);

  const { isKeyboardVisible } = useKeyboard();

  const handleSignIn = async () => {
    try {
      const result = await signIn(email, password);
      if (result.success) {
        router.replace('/(protected)/notes');
      }
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  return (
    <View className="flex-1">
      <AuthAlert />
      <AuthBackground />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <View className={cn(isKeyboardVisible === false && 'mb-12', 'flex-1 justify-end')}>
          <Animated.View
            key="signin-form" // Add this line
            entering={FadeInUp.springify().damping(15).delay(100)}
            exiting={FadeOutDown.springify().damping(15)}
            className="overflow-hidden rounded-t-[32px]">
            <BlurView intensity={60} tint="dark" className="bg-background/80">
              <View className="p-8 pt-12">
                <Text className="mb-6 text-2xl font-bold text-primary-foreground/65">
                  Welcome Back
                </Text>
                <Label nativeID="email" className="text-primary-foreground/65">
                  Email
                </Label>
                <Input
                  aria-label="Email"
                  value={email}
                  onChangeText={setEmail}
                  className="mb-3"
                  placeholder="Enter your email"
                />
                <Label nativeID="password" className="text-primary-foreground/65">
                  Password
                </Label>
                <Input
                  aria-label="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  className="mb-6"
                  placeholder="Enter your password"
                />
                <Button onPress={handleSignIn} className="mb-4">
                  <Text className="font-semibold text-white">Sign In</Text>
                </Button>
                <Link href="/(auth)/sign-up" className="self-center">
                  <Text className="text-muted-foreground">Don't have an account?</Text>
                </Link>
              </View>
            </BlurView>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
