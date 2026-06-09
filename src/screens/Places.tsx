import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ArrowLeft, Bookmark, BookmarkCheck, Share2 } from 'lucide-react-native';
import { DuneCard } from '../components/DuneCard';
import { DuneSwitch } from '../components/DuneSwitch';
import { VistaHeader } from '../components/VistaHeader';
import { palette, spacing, typography } from '../theme';
import { sanitizeCopy } from '../utils/textSafe';

export type PlaceItem = {
  id: string;
  name: string;
  category: string;
  coords: { lat: number; lng: number };
  description: string;
  image: any;
};

type Props = {
  data: PlaceItem[];
  saved: string[];
  onToggleSave: (id: string) => void;
  onShare: (title: string, body: string) => void;
};

const categoryLabels: Record<string, string> = {
  'Ancient Temples': 'Historic Temples',
  'Pharaoh Tombs': 'Royal Tombs',
  'Desert Ruins': 'Desert Sites',
};

export const Places = ({ data, saved, onToggleSave, onShare }: Props) => {
  const [category, setCategory] = useState('all');
  const [active, setActive] = useState<PlaceItem | null>(null);
  const [renderedActive, setRenderedActive] = useState<PlaceItem | null>(null);
  const detailAnim = useRef(new Animated.Value(0)).current;

  const filtered = useMemo(() => {
    if (category === 'all') return data;
    return data.filter((place) => place.category === category);
  }, [category, data]);

  const options = [
    { key: 'all', label: 'All' },
    { key: 'Ancient Temples', label: categoryLabels['Ancient Temples'] },
    { key: 'Pharaoh Tombs', label: categoryLabels['Pharaoh Tombs'] },
    { key: 'Desert Ruins', label: categoryLabels['Desert Ruins'] },
  ];

  useEffect(() => {
    if (active) {
      setRenderedActive(active);
      Animated.timing(detailAnim, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }).start();
      return;
    }

    if (!renderedActive) return;

    Animated.timing(detailAnim, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setRenderedActive(null);
    });
  }, [active, detailAnim, renderedActive]);

  const detailTranslate = detailAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  return (
    <View style={styles.root}>
      {renderedActive ? (
        <Animated.View
          style={[
            styles.detailScreen,
            {
              opacity: detailAnim,
              transform: [{ translateY: detailTranslate }],
            },
          ]}
        >
          <View style={styles.detailHeaderRow}>
            <Pressable onPress={() => setActive(null)} style={styles.backButton}>
              <ArrowLeft color={palette.goldGlow} size={18} />
              <Text style={styles.backText}>Back</Text>
            </Pressable>
            <View style={styles.backSpacer} />
          </View>
          <VistaHeader
            image={renderedActive.image}
            title={sanitizeCopy(renderedActive.name)}
            subtitle={categoryLabels[renderedActive.category] || renderedActive.category}
          />
          <ScrollView
            style={styles.detailScroll}
            contentContainerStyle={styles.detailContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.detailMetaRow}>
              <Text style={styles.detailMeta}>Region: {categoryLabels[renderedActive.category] || renderedActive.category}</Text>
              <Text style={styles.detailMeta}>Category: {sanitizeCopy(renderedActive.category)}</Text>
              <Text style={styles.detailMeta}>
                Coordinates: {renderedActive.coords.lat.toFixed(4)}, {renderedActive.coords.lng.toFixed(4)}
              </Text>
            </View>
            <View style={styles.accentLine} />
            <Text style={styles.detailDesc}>{sanitizeCopy(renderedActive.description)}</Text>
            <View style={styles.detailActions}>
              <Pressable
                onPress={() => onToggleSave(renderedActive.id)}
                style={styles.actionButton}
              >
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
          </ScrollView>
        </Animated.View>
      ) : (
        <>
          <Text style={styles.title}>Historic Places</Text>
          <Text style={styles.subtitle}>Browse key locations across Egypt.</Text>
          <DuneSwitch options={options} value={category} onChange={setCategory} />
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const isSaved = saved.includes(item.id);
              return (
                <DuneCard onPress={() => setActive(item)} style={styles.card}>
                  <Image source={item.image} style={styles.image} />
                  <View style={styles.cardBody}>
                    <Text style={styles.cardTitle}>{sanitizeCopy(item.name)}</Text>
                    <Text style={styles.cardMeta}>{categoryLabels[item.category] || item.category}</Text>
                    <Text style={styles.cardDesc} numberOfLines={3}>
                      {sanitizeCopy(item.description)}
                    </Text>
                  </View>
                  <View style={styles.cardActions}>
                    <Pressable onPress={() => onToggleSave(item.id)} style={styles.iconButton}>
                      {isSaved ? (
                        <BookmarkCheck color={palette.goldGlow} size={20} />
                      ) : (
                        <Bookmark color={palette.sand} size={20} />
                      )}
                    </Pressable>
                    <Pressable
                      onPress={() => onShare(item.name, item.description)}
                      style={styles.iconButton}
                    >
                      <Share2 color={palette.sand} size={20} />
                    </Pressable>
                  </View>
                </DuneCard>
              );
            }}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: spacing.lg,
    paddingBottom: 120,
    gap: spacing.md,
  },
  detailScreen: {
    flex: 1,
    gap: spacing.md,
  },
  detailHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: palette.duneLight,
    borderWidth: 1,
    borderColor: palette.mistStrong,
  },
  backText: {
    color: palette.goldGlow,
    ...typography.caption,
  },
  backSpacer: {
    width: 32,
  },
  detailScroll: {
    flex: 1,
  },
  detailContent: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  detailMetaRow: {
    gap: 6,
  },
  detailMeta: {
    color: palette.sand,
    ...typography.caption,
  },
  accentLine: {
    height: 1,
    backgroundColor: palette.goldSoft,
    opacity: 0.6,
  },
  detailDesc: {
    color: palette.cream,
    ...typography.body,
  },
  detailActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 16,
    backgroundColor: palette.duneLight,
    borderWidth: 1,
    borderColor: palette.mistStrong,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionText: {
    color: palette.sand,
    ...typography.caption,
  },
  title: {
    color: palette.cream,
    ...typography.title,
  },
  subtitle: {
    color: palette.sand,
    ...typography.body,
  },
  list: {
    gap: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: 120,
  },
  card: {
    gap: spacing.sm,
  },
  image: {
    width: '100%',
    height: 160,
    borderRadius: 16,
  },
  cardBody: {
    gap: 6,
  },
  cardTitle: {
    color: palette.goldGlow,
    ...typography.h3,
  },
  cardMeta: {
    color: palette.goldSoft,
    ...typography.caption,
  },
  cardDesc: {
    color: palette.cream,
    ...typography.body,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  iconButton: {
    padding: spacing.sm,
    backgroundColor: palette.duneLight,
    borderRadius: 14,
  },
});
