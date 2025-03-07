import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { useAudioRecorder, RecordingPresets, AudioModule, useAudioPlayer } from 'expo-audio';
import React, { useState, useEffect, useCallback } from 'react';
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
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  // Create a single audio player instance at the component level
  const audioPlayer = useAudioPlayer();

  // Request microphone permissions
  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert('Permission denied', 'Access to microphone is required to record voice notes.');
      }
    })();
  }, []);

  // Clean up player when component unmounts
  useEffect(() => {
    return () => {
      if (audioPlayer) {
        audioPlayer.remove();
      }
    };
  }, [audioPlayer]);

  // Setup playback ended listener
  useEffect(() => {
    const onPlaybackEnded = () => {
      if (activeNote) {
        setActiveNote(null);
      }
    };

    audioPlayer.addListener('playbackStatusUpdate', onPlaybackEnded);

    return () => {
      audioPlayer.removeListener('playbackStatusUpdate', onPlaybackEnded);
    };
  }, [audioPlayer, activeNote]);

  // Handle recording
  const startRecording = async () => {
    try {
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Recording Error', 'Could not start recording.');
    }
  };

  const stopRecording = async () => {
    try {
      await audioRecorder.stop();

      if (audioRecorder.uri) {
        const newNote: VoiceNote = {
          id: Date.now().toString(),
          uri: audioRecorder.uri,
          createdAt: new Date(),
          duration: audioRecorder.currentTime || 0,
        };

        setVoiceNotes((prev) => [newNote, ...prev]);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Recording Error', 'Could not save recording.');
    }
  };

  // Handle playback with the AudioPlayer
  const playVoiceNote = useCallback(
    async (uri: string, id: string) => {
      try {
        await audioPlayer.remove();
        await audioPlayer.replace(uri);
        await audioPlayer.play();
        setActiveNote(id);
      } catch (error) {
        console.error('Failed to play audio:', error);
        Alert.alert('Playback Error', 'Could not play the recording.');
      }
    },
    [audioPlayer]
  );

  const stopPlayback = useCallback(async () => {
    try {
      await audioPlayer.pause();
      setActiveNote(null);
    } catch (error) {
      console.error('Failed to stop playback:', error);
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

      <View className="w-full flex-1">
        {/* Recording interface */}
        <View className="mb-8 items-center">
          <TouchableOpacity
            onPress={audioRecorder.isRecording ? stopRecording : startRecording}
            className={`flex h-16 w-16 items-center justify-center rounded-full ${
              audioRecorder.isRecording ? 'animate-pulse bg-red-600' : 'bg-indigo-600'
            }`}>
            <Ionicons name={audioRecorder.isRecording ? 'stop' : 'mic'} size={24} color="white" />
          </TouchableOpacity>
          <Text className="mt-2 text-gray-400">
            {audioRecorder.isRecording ? 'Recording...' : 'Tap to Record'}
          </Text>

          {audioRecorder.isRecording && (
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
