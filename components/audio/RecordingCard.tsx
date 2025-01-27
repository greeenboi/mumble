import React from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card';
import { useVoiceRecorder } from '~/hooks/useVoiceRecorder';
import { Microphone } from '~/lib/icons/Microphone';
import { MicrophoneOff } from '~/lib/icons/Microphone-Off';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const RecordingCard = () => {
  const { startRecording, stopRecording, isRecording } = useVoiceRecorder();
  const scale = useSharedValue(1);
  const rippleScale = useSharedValue(1);
  const rippleOpacity = useSharedValue(0);

  const handlePress = () => {
    if (isRecording) {
      stopRecording();
      scale.value = withSpring(1);
      rippleOpacity.value = withTiming(0);
    } else {
      startRecording();
      scale.value = withRepeat(withSequence(withSpring(1.1), withSpring(1)), -1, true);
      rippleScale.value = 1;
      rippleOpacity.value = 0.5;
      startRippleAnimation();
    }
  };

  const startRippleAnimation = () => {
    rippleScale.value = withRepeat(
      withTiming(1.5, {
        duration: 1000,
        easing: Easing.out(Easing.ease),
      }),
      -1,
      false
    );
    rippleOpacity.value = withRepeat(
      withTiming(0, {
        duration: 1000,
        easing: Easing.out(Easing.ease),
      }),
      -1,
      false
    );
  };

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader>
        <CardTitle>Voice Recorder</CardTitle>
        <CardDescription>
          {isRecording ? 'Recording in progress...' : 'Tap to start recording'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center py-12">
        <View className="relative">
          <Animated.View
            className="absolute h-16 w-16 rounded-full bg-primary/30"
            style={[
              {
                transform: [{ scale: 1.5 }],
                left: 0,
                top: 0,
              },
              rippleStyle,
            ]}
          />
          <AnimatedPressable
            onPress={handlePress}
            className="h-16 w-16 items-center justify-center rounded-full bg-primary"
            style={buttonStyle}>
            {isRecording ? (
              <MicrophoneOff className="h-8 w-8 text-white" />
            ) : (
              <Microphone className="h-8 w-8 text-white" />
            )}
          </AnimatedPressable>
        </View>
      </CardContent>
    </Card>
  );
};
