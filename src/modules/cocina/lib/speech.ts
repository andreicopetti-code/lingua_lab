import * as Speech from 'expo-speech';

export function speakES(text: string, voiceOn: boolean, force = false): void {
  if ((!voiceOn && !force) || !text) return;
  Speech.stop();
  Speech.speak(text, {
    language: 'es-ES',
    rate: 0.92,
    pitch: 1,
  });
}

export function stopSpeech(): void {
  Speech.stop();
}
