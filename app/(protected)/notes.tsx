import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { Audio } from 'expo-av';
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';

import { Container } from '@/components/Container';
import { H1 } from '@/components/ui/typography';

interface VoiceNote {
  id: string;
  uri: string;
  createdAt: Date;
  duration: number;
}

export default function Notes() {
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [recording, setRecording] = useState<Audio.Recording>();
  const [sound, setSound] = useState<Audio.Sound>();
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [isRecordingActive, setIsRecordingActive] = useState(false);

  useEffect(() => {
    return sound
      ? () => {
          console.log('[DEBUG] Unloading Sound');
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const startRecording = useCallback(async () => {
    try {
      if (permissionResponse?.status !== 'granted') {
        console.log('[DEBUG] Requesting permission..');
        await requestPermission();
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('[DEBUG] Starting recording..');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecordingActive(true);
      console.log('[DEBUG] Recording started');
    } catch (err) {
      console.error('[ERROR] Failed to start recording:', err);
      Alert.alert('Recording Error', 'Could not start recording.');
    }
  }, [permissionResponse?.status, requestPermission]);

  const stopRecording = useCallback(async () => {
    if (!recording) return;

    try {
      console.log('[DEBUG] Stopping recording..');
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      const uri = recording.getURI();
      const status = await recording.getStatusAsync();
      console.log('[DEBUG] Recording stopped and stored at', uri);

      if (uri) {
        const newNote = {
          id: Date.now().toString(),
          uri,
          createdAt: new Date(),
          duration: status.durationMillis || 0,
        };
        setVoiceNotes((prev) => [newNote, ...prev]);
      }
    } catch (error) {
      console.error('[ERROR] Failed to stop recording:', error);
      Alert.alert('Recording Error', 'Could not save recording.');
    } finally {
      setRecording(undefined);
      setIsRecordingActive(false);
    }
  }, [recording]);

  const playVoiceNote = useCallback(
    async (uri: string, id: string) => {
      try {
        // Stop any existing playback
        if (sound) {
          await sound.unloadAsync();
        }

        console.log('[DEBUG] Loading Sound');
        const { sound: newSound } = await Audio.Sound.createAsync({ uri });
        setSound(newSound);
        setActiveNote(id);

        console.log('[DEBUG] Playing Sound');
        await newSound.playAsync();
        
        // Handle playback finished with proper type checking
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setActiveNote(null);
          }
        });
      } catch (error) {
        console.error('[ERROR] Failed to play sound:', error);
        Alert.alert('Playback Error', 'Could not play the recording.');
      }
    },
    [sound]
  );

  const stopPlayback = useCallback(async () => {
    if (!sound) return;

    try {
      await sound.stopAsync();
      setActiveNote(null);
    } catch (error) {
      console.error('[ERROR] Failed to stop playback:', error);
    }
  }, [sound]);

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) {
      return 'Just now';
    }if (diffMins < 60) {
      return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    }if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    }if (diffDays < 7) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    }
      return date.toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
  };

  const renderVoiceNote = ({ item }: { item: VoiceNote }) => {
    const isPlaying = activeNote === item.id;

    return (
      <View className="mb-3 rounded-xl border border-indigo-900/50 bg-gray-900/70 p-4 backdrop-blur-lg">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-lg font-semibold text-white">Voice Note</Text>
            <Text className="mt-1 text-xs text-gray-400">{formatTimestamp(item.createdAt)}</Text>
            <View className="mt-2 flex-row items-center">
              <Ionicons name="time-outline" size={14} color="#a5a5a5" />
              <Text className="ml-1 text-xs text-gray-400">{formatDuration(item.duration)}</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => (isPlaying ? stopPlayback() : playVoiceNote(item.uri, item.id))}
            className={`flex h-12 w-12 items-center justify-center rounded-full ${
              isPlaying ? 'bg-red-600' : 'bg-indigo-600'
            }`}>
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={20} color="white" />
          </TouchableOpacity>
        </View>

        {isPlaying && (
          <View className="mt-3 h-1 overflow-hidden rounded-full bg-gray-800">
            <View className="h-full w-1/2 animate-pulse bg-indigo-500" />
          </View>
        )}
      </View>
    );
  };

  return (
    <Container>
      <H1 className="mb-6">Voice Notes</H1>

      {__DEV__ && (
        <View className="mb-4 rounded-md bg-gray-800 p-2">
          <Text className="text-xs text-white">Debug Info:</Text>
          <Text className="text-xs text-gray-300">Recording State: {isRecordingActive ? 'Active' : 'Inactive'}</Text>
          <Text className="text-xs text-gray-300">
            Permissions: {permissionResponse?.status === 'granted' ? 'Granted' : 'Not granted'}
          </Text>
        </View>
      )}

      <View className="w-full flex-1">
        <View className="mb-8 items-center">
          <TouchableOpacity
            disabled={permissionResponse?.status !== 'granted'}
            onPress={() => {
              if (isRecordingActive) {
                stopRecording();
              } else {
                startRecording();
              }
            }}
            className={`flex h-16 w-16 items-center justify-center rounded-full ${
              permissionResponse?.status !== 'granted'
                ? 'bg-gray-600'
                : isRecordingActive
                ? 'animate-pulse bg-red-600'
                : 'bg-indigo-600'
            }`}>
            <Ionicons
              name={isRecordingActive ? 'stop' : 'mic'}
              size={24}
              color="white"
            />
          </TouchableOpacity>
          <Text className="mt-2 text-gray-400">
            {permissionResponse?.status !== 'granted'
              ? 'Microphone access required'
              : isRecordingActive
                ? 'Recording...'
                : 'Tap to Record'}
          </Text>

          {isRecordingActive && (
            <View className="mt-2 h-1 w-32 overflow-hidden rounded-full bg-gray-800">
              <View className="h-full animate-pulse bg-red-500" style={{ width: '60%' }} />
            </View>
          )}
        </View>

        {voiceNotes.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Ionicons name="mic-off-outline" size={48} color="#6366f1" />
            <Text className="mt-4 text-center text-gray-400">
              No voice notes yet. Tap the microphone button to start recording.
            </Text>
          </View>
        ) : (
          <View className="flex-1">
            <Text className="mb-2 text-xs text-gray-400">
              {voiceNotes.length} {voiceNotes.length === 1 ? 'RECORDING' : 'RECORDINGS'}
            </Text>
            <FlashList
              data={voiceNotes}
              renderItem={renderVoiceNote}
              estimatedItemSize={100}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          </View>
        )}
      </View>
    </Container>
  );
}
