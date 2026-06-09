import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { palette, layout, radius, spacing, typography } from '../theme';

type TabItem = {
  key: string;
  label: string;
  icon: (active: boolean) => React.ReactNode;
};

type Props = {
  tabs: TabItem[];
  active: string;
  onChange: (key: string) => void;
};

export const GlowTabs = ({ tabs, active, onChange }: Props) => {
  const activeIndex = Math.max(0, tabs.findIndex((tab) => tab.key === active));
  const slide = useRef(new Animated.Value(0)).current;
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const itemWidth = width / tabs.length || 0;
    Animated.spring(slide, { toValue: itemWidth * activeIndex, useNativeDriver: true }).start();
  }, [activeIndex, slide, width, tabs.length]);

  return (
    <View style={styles.wrap}>
      <View style={styles.glass} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
        <Animated.View
          style={[
            styles.activeGlow,
            {
              width: width / tabs.length || 0,
              transform: [{ translateX: slide }],
            },
          ]}
        />
        {tabs.map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={({ pressed }) => [styles.item, pressed && styles.pressed]}
          >
            <View style={styles.icon}>{tab.icon(active === tab.key)}</View>
            <Text style={[styles.label, active === tab.key && styles.labelActive]}>{tab.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  glass: {
    flexDirection: 'row',
    height: layout.tabHeight,
    backgroundColor: palette.dune,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.mistStrong,
    overflow: 'hidden',
  },
  activeGlow: {
    position: 'absolute',
    top: 8,
    bottom: 8,
    left: 0,
    backgroundColor: palette.goldSoft,
    opacity: 0.18,
    borderRadius: radius.xl,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  icon: {
    height: 22,
  },
  label: {
    color: palette.sand,
    ...typography.caption,
  },
  labelActive: {
    color: palette.goldGlow,
  },
  pressed: {
    opacity: 0.7,
  },
});
