import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { colors } from '../theme';

type Props = {
  message: string | null;
  color?: string;
};

export function Toast({ message, color = colors.green }: Props) {
  const top = useRef(new Animated.Value(-80)).current;

  useEffect(() => {
    if (!message) {
      Animated.timing(top, { toValue: -80, duration: 220, useNativeDriver: false }).start();
      return;
    }
    Animated.sequence([
      Animated.timing(top, { toValue: 14, duration: 320, useNativeDriver: false }),
      Animated.delay(2000),
      Animated.timing(top, { toValue: -80, duration: 220, useNativeDriver: false }),
    ]).start();
  }, [message, top]);

  if (!message) return null;

  return (
    <Animated.View style={[styles.toast, { top, backgroundColor: color }]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 999,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 99,
    maxWidth: '92%',
  },
  text: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
  },
});
