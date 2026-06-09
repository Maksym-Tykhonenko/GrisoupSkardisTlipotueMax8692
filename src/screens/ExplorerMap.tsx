import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bookmark, BookmarkCheck, Compass, Share2, X } from 'lucide-react-native';
import { DuneCard } from '../components/DuneCard';
import { layout, palette, spacing, typography } from '../theme';
import { sanitizeCopy } from '../utils/textSafe';

export type FactItem = {
  id: string;
  name: string;
  region: string;
  description: string;
};

type Props = {
  data: FactItem[];
  saved: string[];
  onToggleSave: (id: string) => void;
  onShare: (title: string, body: string) => void;
};

const positions = [
  { x: 0.22, y: 0.12 },
  { x: 0.4, y: 0.16 },
  { x: 0.6, y: 0.2 },
  { x: 0.28, y: 0.28 },
  { x: 0.5, y: 0.32 },
  { x: 0.7, y: 0.35 },
  { x: 0.2, y: 0.42 },
  { x: 0.46, y: 0.45 },
  { x: 0.66, y: 0.48 },
  { x: 0.33, y: 0.55 },
  { x: 0.55, y: 0.58 },
  { x: 0.74, y: 0.6 },
  { x: 0.24, y: 0.66 },
  { x: 0.48, y: 0.69 },
  { x: 0.7, y: 0.72 },
  { x: 0.3, y: 0.78 },
  { x: 0.5, y: 0.82 },
  { x: 0.68, y: 0.86 },
  { x: 0.38, y: 0.9 },
  { x: 0.58, y: 0.92 },
];

type PinProps = {
  label: string;
  left: number;
  top: number;
  onPress: () => void;
};

const MapPin = ({ label, left, top, onPress }: PinProps) => {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, [pulse]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1.1] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });

  return (
    <Pressable onPress={onPress} style={[styles.pin, { left: `${left * 100}%`, top: `${top * 100}%` }]}>
      <Animated.View style={[styles.pinDot, { transform: [{ scale }], opacity }]} />
      <Text style={styles.pinLabel} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
};

export const ExplorerMap = ({ data, saved, onToggleSave, onShare }: Props) => {
  const [active, setActive] = useState<FactItem | null>(null);
  const [renderedActive, setRenderedActive] = useState<FactItem | null>(null);
  const sheetAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (active) {
      setRenderedActive(active);
      Animated.timing(sheetAnim, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }).start();
      return;
    }

    if (!renderedActive) return;

    Animated.timing(sheetAnim, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setRenderedActive(null);
    });
  }, [active, renderedActive, sheetAnim]);

  const sheetTranslate = sheetAnim.interpolate({ inputRange: [0, 1], outputRange: [28, 0] });
  const bottomOffset = layout.tabHeight + insets.bottom + spacing.lg;

  const items = useMemo(() => data.slice(0, positions.length), [data]);

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Explore Egypt</Text>
      <Text style={styles.subtitle}>Tap pins to reveal stories and facts.</Text>
      <View style={styles.mapWrap}>
        <ImageBackground
          source={require('../../thosiganems/mapImage.png')}
          style={styles.map}
          imageStyle={styles.mapImage}
        >
          {items.map((item, index) => {
            const pos = positions[index];
            return (
              <MapPin
                key={item.id}
                label={sanitizeCopy(item.name)}
                left={pos.x}
                top={pos.y}
                onPress={() => setActive(item)}
              />
            );
          })}
        </ImageBackground>
      </View>

      <Animated.View
        pointerEvents={renderedActive ? 'auto' : 'none'}
        style={[
          styles.sheet,
          { bottom: bottomOffset, opacity: sheetAnim, transform: [{ translateY: sheetTranslate }] },
        ]}
      >
        {renderedActive ? (
          <View style={styles.sheetCard}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View style={styles.sheetTitleBlock}>
                <View style={styles.sheetIconWrap}>
                  <Compass color={palette.goldGlow} size={16} />
                </View>
                <View style={styles.sheetTitleWrap}>
                  <Text style={styles.sheetTitle}>{sanitizeCopy(renderedActive.name)}</Text>
                  <Text style={styles.sheetRegion}>{sanitizeCopy(renderedActive.region)}</Text>
                </View>
              </View>
              <Pressable onPress={() => setActive(null)} style={styles.closeButton}>
                <X color={palette.sand} size={16} />
              </Pressable>
            </View>
            <View style={styles.sheetAccent} />
            <ScrollView style={styles.sheetBody} contentContainerStyle={styles.sheetBodyContent}>
              <Text style={styles.sheetText} numberOfLines={6}>
                {sanitizeCopy(renderedActive.description)}
              </Text>
            </ScrollView>
            <View style={styles.sheetActions}>
              <Pressable onPress={() => onToggleSave(renderedActive.id)} style={styles.actionButton}>
                {saved.includes(renderedActive.id) ? (
                  <BookmarkCheck color={palette.goldGlow} size={18} />
                ) : (
                  <Bookmark color={palette.sand} size={18} />
                )}
                <Text style={styles.actionText}>{saved.includes(renderedActive.id) ? 'Saved' : 'Save'}</Text>
              </Pressable>
              <Pressable
                onPress={() => onShare(renderedActive.name, renderedActive.description)}
                style={styles.actionButton}
              >
                <Share2 color={palette.sand} size={18} />
                <Text style={styles.actionText}>Share</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: spacing.lg,
    paddingBottom: 120,
  },
  title: {
    color: palette.cream,
    ...typography.title,
  },
  subtitle: {
    color: palette.sand,
    marginBottom: spacing.md,
    ...typography.body,
  },
  mapWrap: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: palette.mistStrong,
  },
  map: {
    flex: 1,
    padding: spacing.md,
  },
  mapImage: {
    opacity: 0.85,
  },
  pin: {
    position: 'absolute',
    alignItems: 'center',
    width: 90,
  },
  pinDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: palette.goldGlow,
    marginBottom: 4,
  },
  pinLabel: {
    color: palette.cream,
    fontSize: 10,
    textAlign: 'center',
  },
  sheet: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 20,
  },
  sheetCard: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderRadius: 22,
    backgroundColor: palette.dune,
    borderWidth: 1,
    borderColor: palette.mistStrong,
    overflow: 'hidden',
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 10,
    maxHeight: 280,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 999,
    backgroundColor: palette.mistStrong,
    marginBottom: spacing.sm,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  sheetTitleBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 10,
  },
  sheetIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: palette.duneLight,
    borderWidth: 1,
    borderColor: palette.mistStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitleWrap: {
    flex: 1,
    gap: 2,
  },
  sheetTitle: {
    color: palette.goldGlow,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
  },
  sheetRegion: {
    color: palette.sand,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: palette.duneLight,
    borderWidth: 1,
    borderColor: palette.mistStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetAccent: {
    height: 1,
    backgroundColor: palette.goldSoft,
    opacity: 0.6,
    marginVertical: spacing.sm,
  },
  sheetBody: {
    maxHeight: 110,
  },
  sheetBodyContent: {
    paddingBottom: spacing.sm,
  },
  sheetText: {
    color: palette.cream,
    fontSize: 14,
    lineHeight: 20,
  },
  sheetActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.mistStrong,
    backgroundColor: palette.duneLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionText: {
    color: palette.sand,
    fontSize: 12,
    fontWeight: '600',
  },
});
