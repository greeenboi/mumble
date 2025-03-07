import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { useAudioRecorder, RecordingPresets, AudioModule, useAudioPlayer } from 'expo-audio';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';

import { Container } from '~/components/Container';
import { H1 } from '~/components/ui/typography';

interface VoiceNote {
  id: string;
  uri: string;
  createdAt: Date;
  duration: number;
}

export default function Notes() {
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [recordingState, setRecordingState] = useState('idle');
  const [error, setError] = useState<string | null>(null);
  const [isRecordingActive, setIsRecordingActive] = useState(false);

  // Store recorder status in a ref to avoid recreation issues
  const recorderRef = useRef(null);

  // We'll initialize the recorder only once and keep it throughout the component's lifecycle
  // Using useMemo to ensure the recorder is only created once
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  // Same for the player - create it once and keep the reference stable
  const audioPlayer = useAudioPlayer();

  // Store permitted state to avoid checking permissions multiple times
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Debug recorder state changes
  useEffect(() => {
    console.log('[DEBUG] Recorder state:', {
      isRecording: audioRecorder?.isRecording,
      uri: audioRecorder?.uri,
      currentTime: audioRecorder?.currentTime,
    });
  }, [audioRecorder?.isRecording, audioRecorder?.uri, audioRecorder?.currentTime]);

  // Request microphone permissions only once
  useEffect(() => {
    let isMounted = true;

    const requestPermissions = async () => {
      try {
        console.log('[DEBUG] Requesting microphone permissions...');
        const status = await AudioModule.requestRecordingPermissionsAsync();
        console.log('[DEBUG] Permission result:', status);

        if (!isMounted) return;

        if (status.granted) {
          setPermissionGranted(true);
        } else {
          Alert.alert(
            'Permission denied',
            'Access to microphone is required to record voice notes.'
          );
        }
      } catch (err) {
        console.error('[ERROR] Permission error:', err);
        if (isMounted) {
          setError('Failed to request microphone permissions');
          Alert.alert('Error', 'Failed to request microphone permissions');
        }
      }
    };

    requestPermissions();

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle playback ended
  useEffect(() => {
    if (!audioPlayer) return;

    const handlePlaybackEnded = () => {
      if (!audioPlayer.playing && activeNote) {
        setActiveNote(null);
      }
    };

    // Poll for playback status instead of using potentially problematic event listeners
    const intervalId = setInterval(() => {
      handlePlaybackEnded();
    }, 500);

    return () => {
      clearInterval(intervalId);
    };
  }, [audioPlayer, activeNote]);

  // Handle recording with debug logs and error protection
  const startRecording = useCallback(async () => {
    if (!audioRecorder || !permissionGranted) {
      console.error('[ERROR] Cannot record: recorder not initialized or permissions not granted');
      return;
    }

    try {
      console.log('[DEBUG] Starting recording...');
      setRecordingState('preparing');
      setIsRecordingActive(true);
      setError(null);

      // Initialize the recorder with proper error handling
      try {
        await audioRecorder.prepareToRecordAsync();
        console.log('[DEBUG] Recorder prepared successfully');
      } catch (prepareError) {
        console.error('[ERROR] Failed to prepare recorder:', prepareError);
        throw new Error('Failed to prepare recorder');
      }

      setRecordingState('recording');

      try {
        await audioRecorder.record();
        console.log('[DEBUG] Recording started successfully');
      } catch (recordError) {
        console.error('[ERROR] Failed to start recording:', recordError);
        throw new Error('Failed to start recording');
      }
    } catch (error) {
      console.error('[ERROR] Recording process failed:', error);
      setRecordingState('error');
      setIsRecordingActive(false);
      setError(`Recording error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      Alert.alert('Recording Error', 'Could not start recording.');
    }
  }, [audioRecorder, permissionGranted]);

  const stopRecording = useCallback(async () => {
    if (!audioRecorder) {
      console.error('[ERROR] Cannot stop recording: recorder not initialized');
      setIsRecordingActive(false);
      return;
    }

    try {
      console.log('[DEBUG] Stopping recording...');
      setRecordingState('stopping');

      await audioRecorder.stop();
      console.log('[DEBUG] Recording stopped');

      setRecordingState('idle');
      setIsRecordingActive(false);

      if (audioRecorder.uri) {
        console.log('[DEBUG] Recording URI:', audioRecorder.uri);
        console.log('[DEBUG] Recording duration:', audioRecorder.currentTime);

        const newNote = {
          id: Date.now().toString(),
          uri: audioRecorder.uri,
          createdAt: new Date(),
          duration: audioRecorder.currentTime || 0,
        };

        setVoiceNotes((prev) => [newNote, ...prev]);
      } else {
        console.warn('[WARNING] No URI returned after recording stopped');
      }
    } catch (error) {
      console.error('[ERROR] Failed to stop recording:', error);
      setRecordingState('error');
      setIsRecordingActive(false);
      setError(`Stop recording error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      Alert.alert('Recording Error', 'Could not save recording.');
    }
  }, [audioRecorder]);

  // Safer playback implementation
  const playVoiceNote = useCallback(
    async (uri: string, id: string) => {
      if (!audioPlayer) {
        console.error('[ERROR] Cannot play: player not initialized');
        return;
      }

      try {
        console.log('[DEBUG] Playing audio:', uri);

        // First pause any currently playing audio
        try {
          if (audioPlayer.playing) {
            await audioPlayer.pause();
          }
        } catch (pauseError) {
          console.warn('[WARNING] Error pausing previous playback:', pauseError);
          // Continue even if pause fails
        }

        // Then load and play new audio
        try {
          await audioPlayer.replace(uri);
          await audioPlayer.play();
          setActiveNote(id);
          console.log('[DEBUG] Playback started successfully');
        } catch (playError) {
          console.error('[ERROR] Failed to play audio:', playError);
          throw new Error('Failed to play audio');
        }
      } catch (error) {
        console.error('[ERROR] Playback process failed:', error);
        Alert.alert('Playback Error', 'Could not play the recording.');
      }
    },
    [audioPlayer]
  );

  const stopPlayback = useCallback(async () => {
    if (!audioPlayer) return;

    try {
      await audioPlayer.pause();
      setActiveNote(null);
      console.log('[DEBUG] Playback stopped successfully');
    } catch (error) {
      console.error('[ERROR] Failed to stop playback:', error);
    }
  }, [audioPlayer]);

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Format date without date-fns
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    } else {
      // Format as MM/DD/YYYY, HH:MM AM/PM
      return date.toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
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

      {/* Debug info section */}
      {__DEV__ && (
        <View className="mb-4 rounded-md bg-gray-800 p-2">
          <Text className="text-xs text-white">Debug Info:</Text>
          <Text className="text-xs text-gray-300">Recording State: {recordingState}</Text>
          <Text className="text-xs text-gray-300">
            Recorder Status: {isRecordingActive ? 'Active' : 'Inactive'}
          </Text>
          <Text className="text-xs text-gray-300">
            Permissions: {permissionGranted ? 'Granted' : 'Not granted'}
          </Text>
          {error && <Text className="text-xs text-red-400">Error: {error}</Text>}
        </View>
      )}

      <View className="w-full flex-1">
        {/* Recording interface */}
        <View className="mb-8 items-center">
          <TouchableOpacity
            disabled={!permissionGranted}
            onPress={() => {
              console.log('[DEBUG] Record button pressed', {
                currentState: isRecordingActive ? 'recording' : 'not recording',
              });
              if (isRecordingActive) {
                stopRecording();
              } else {
                startRecording();
              }
            }}
            className={`flex h-16 w-16 items-center justify-center rounded-full ${
              !permissionGranted
                ? 'bg-gray-600'
                : isRecordingActive || recordingState === 'recording'
                  ? 'animate-pulse bg-red-600'
                  : 'bg-indigo-600'
            }`}>
            <Ionicons
              name={isRecordingActive || recordingState === 'recording' ? 'stop' : 'mic'}
              size={24}
              color="white"
            />
          </TouchableOpacity>
          <Text className="mt-2 text-gray-400">
            {!permissionGranted
              ? 'Microphone access required'
              : isRecordingActive || recordingState === 'recording'
                ? 'Recording...'
                : recordingState === 'preparing'
                  ? 'Preparing...'
                  : 'Tap to Record'}
          </Text>

          {(isRecordingActive || recordingState === 'recording') && (
            <View className="mt-2 h-1 w-32 overflow-hidden rounded-full bg-gray-800">
              <View className="h-full animate-pulse bg-red-500" style={{ width: '60%' }} />
            </View>
          )}
        </View>

        {/* Voice notes list */}
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
