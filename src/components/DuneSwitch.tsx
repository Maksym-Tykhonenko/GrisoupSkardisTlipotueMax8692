import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { palette, radius, spacing, typography } from '../theme';

type Option = { key: string; label: string };

type Props = {
  options: Option[];
  value: string;
  onChange: (key: string) => void;
};

export const DuneSwitch = ({ options, value, onChange }: Props) => {
  const activeIndex = Math.max(0, options.findIndex((opt) => opt.key === value));
  const slide = useRef(new Animated.Value(0)).current;
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const itemWidth = width / options.length || 0;
    Animated.spring(slide, { toValue: itemWidth * activeIndex, useNativeDriver: true }).start();
  }, [activeIndex, slide, width, options.length]);

  return (
    <View style={styles.wrapper} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      <Animated.View
        style={[
          styles.activePill,
          {
            width: width / options.length || 0,
            transform: [{ translateX: slide }],
          },
        ]}
      />
      {options.map((opt) => (
        <Pressable key={opt.key} style={styles.item} onPress={() => onChange(opt.key)}>
          <Text
            numberOfLines={2}
            ellipsizeMode="tail"
            style={[styles.label, value === opt.key && styles.labelActive]}
          >
            {opt.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    backgroundColor: palette.duneLight,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.mistStrong,
    overflow: 'hidden',
    minHeight: 60,
  },
  activePill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: palette.goldSoft,
    opacity: 0.25,
  },
  item: {
    flex: 1,
    minHeight: 60,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: palette.cream,
    ...typography.caption,
    textAlign: 'center',
    includeFontPadding: false,
    lineHeight: 18,
  },
  labelActive: {
    color: palette.goldGlow,
    fontWeight: '700',
  },
});
