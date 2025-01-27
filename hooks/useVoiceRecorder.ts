import { useAudioRecorder, RecordingPresets, AudioModule } from 'expo-audio';
import * as FileSystem from 'expo-file-system';
import { useState, useEffect, useCallback } from 'react';

export const useVoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const startRecording = useCallback(async () => {
    try {
      await audioRecorder.record();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  }, [audioRecorder]);

  const stopRecording = useCallback(async () => {
    try {
      await audioRecorder.stop();
      setIsRecording(false);

      if (audioRecorder.uri) {
        const timestamp = new Date().getTime();
        const audioDir = `${FileSystem.documentDirectory}audio`;
        const newPath = `${audioDir}/recording-${timestamp}.m4a`;

        await FileSystem.makeDirectoryAsync(audioDir, { intermediates: true });
        await FileSystem.moveAsync({
          from: audioRecorder.uri,
          to: newPath,
        });

        return newPath;
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  }, [audioRecorder]);

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        console.error('Permission to access microphone was denied');
      }
    })();
  }, []);

  return {
    startRecording,
    stopRecording,
    isRecording,
  };
};
