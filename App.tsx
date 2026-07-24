import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SplashScreen } from './src/modules/cocina/screens/SplashScreen';
import { GameScreen } from './src/modules/cocina/screens/GameScreen';
import { EndScreen } from './src/modules/cocina/screens/EndScreen';
import { beginGame, createInitialSession } from './src/modules/cocina/lib/game';
import { colors } from './src/modules/cocina/theme';
import type { GameSession, Screen } from './src/modules/cocina/types';

export default function App() {
  const [screen, setScreen] = useState<Screen>('splash');
  const [session, setSession] = useState<GameSession>(createInitialSession());
  const [loading, setLoading] = useState(false);

  const handleStart = async (cats: string[]) => {
    setLoading(true);
    try {
      const s = await beginGame(cats);
      setSession(s);
      setScreen('game');
    } finally {
      setLoading(false);
    }
  };

  const handleEnd = (s: GameSession) => {
    setSession(s);
    setScreen('end');
  };

  const handleRestart = () => {
    setSession(createInitialSession());
    setScreen('splash');
  };

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <StatusBar style="dark" />
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : null}
        {screen === 'splash' ? <SplashScreen onStart={handleStart} /> : null}
        {screen === 'game' ? (
          <GameScreen
            session={session}
            onSessionChange={setSession}
            onEnd={handleEnd}
          />
        ) : null}
        {screen === 'end' ? (
          <EndScreen session={session} onRestart={handleRestart} />
        ) : null}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  loading: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(254,246,232,0.7)',
    zIndex: 10,
  },
});
