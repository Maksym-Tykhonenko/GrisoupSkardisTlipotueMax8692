import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { palette, spacing, typography } from '../theme';

type Props = {
  progress: number;
};

export const Loader = ({ progress }: Props) => {
  const spin = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 1300, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 1300, useNativeDriver: true }),
      ])
    ).start();
  }, [glow, spin]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const glowScale = glow.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.05] });
  const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0.85] });

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.glow, { opacity: glowOpacity, transform: [{ scale: glowScale }] }]}>
        <LinearGradient
          colors={['rgba(214,168,80,0.12)', 'rgba(214,168,80,0.45)']}
          style={styles.glow}
        />
      </Animated.View>
      <Animated.View style={[styles.pyramidWrap, { transform: [{ rotate }] }]}>
        <View style={styles.pyramid} />
      </Animated.View>
      <Text style={styles.title}>Gorus Sands Througt</Text>
      <Text style={styles.subtitle}>Loading dunes of history...</Text>
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.nightDeep,
    gap: spacing.lg,
  },
  glow: {
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  pyramidWrap: {
    position: 'absolute',
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pyramid: {
    width: 0,
    height: 0,
    borderLeftWidth: 42,
    borderRightWidth: 42,
    borderBottomWidth: 70,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: palette.goldGlow,
    opacity: 0.9,
  },
  title: {
    color: palette.goldGlow,
    ...typography.h2,
  },
  subtitle: {
    color: palette.cream,
    ...typography.body,
  },
  progressTrack: {
    width: 180,
    height: 6,
    borderRadius: 999,
    backgroundColor: palette.duneLight,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    backgroundColor: palette.goldSoft,
  },
});
