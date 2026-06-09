import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { Trash2 } from 'lucide-react-native';
import { DuneCard } from '../components/DuneCard';
import { DuneSwitch } from '../components/DuneSwitch';
import { EmptyPanel } from '../components/EmptyPanel';
import { palette, spacing, typography } from '../theme';
import { sanitizeCopy } from '../utils/textSafe';
import { FactItem } from './ExplorerMap';
import { PlaceItem } from './Places';

type Props = {
  facts: FactItem[];
  places: PlaceItem[];
  savedFacts: string[];
  savedPlaces: string[];
  onRemoveFact: (id: string) => void;
  onRemovePlace: (id: string) => void;
};

export const Collection = ({
  facts,
  places,
  savedFacts,
  savedPlaces,
  onRemoveFact,
  onRemovePlace,
}: Props) => {
  const [tab, setTab] = useState<'facts' | 'places'>('facts');
  const [activeFact, setActiveFact] = useState<FactItem | null>(null);
  const [activePlace, setActivePlace] = useState<PlaceItem | null>(null);
  const [renderedFact, setRenderedFact] = useState<FactItem | null>(null);
  const [renderedPlace, setRenderedPlace] = useState<PlaceItem | null>(null);
  const detailAnim = useRef(new Animated.Value(0)).current;

  const factItems = useMemo(() => facts.filter((item) => savedFacts.includes(item.id)), [facts, savedFacts]);
  const placeItems = useMemo(() => places.filter((item) => savedPlaces.includes(item.id)), [places, savedPlaces]);

  useEffect(() => {
    const activeItem = activeFact || activePlace;
    const renderedItem = renderedFact || renderedPlace;

    if (activeItem) {
      if (activeFact) setRenderedFact(activeFact);
      if (activePlace) setRenderedPlace(activePlace);
      Animated.timing(detailAnim, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }).start();
      return;
    }

    if (!renderedItem) return;

    Animated.timing(detailAnim, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setRenderedFact(null);
        setRenderedPlace(null);
      }
    });
  }, [activeFact, activePlace, detailAnim, renderedFact, renderedPlace]);

  const detailTranslate = detailAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [18, 0],
  });

  const closeDetail = () => {
    setActiveFact(null);
    setActivePlace(null);
  };

  return (
    <View style={styles.root}>
      {renderedFact ? (
        <Animated.View
          style={[
            styles.detailScreen,
            {
              opacity: detailAnim,
              transform: [{ translateY: detailTranslate }],
            },
          ]}
        >
          <Pressable onPress={closeDetail} style={styles.backButton}>
            <ArrowLeft color={palette.goldGlow} size={18} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <ScrollView contentContainerStyle={styles.detailContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.detailTitle}>{sanitizeCopy(renderedFact.name)}</Text>
            <Text style={styles.detailTag}>Saved Fact</Text>
            <View style={styles.accentLine} />
            <Text style={styles.detailBody}>{sanitizeCopy(renderedFact.description)}</Text>
            <Pressable onPress={() => onRemoveFact(renderedFact.id)} style={styles.removeDetailBtn}>
              <Trash2 color={palette.goldGlow} size={18} />
              <Text style={styles.removeText}>Remove from saved</Text>
            </Pressable>
          </ScrollView>
        </Animated.View>
      ) : renderedPlace ? (
        <Animated.View
          style={[
            styles.detailScreen,
            {
              opacity: detailAnim,
              transform: [{ translateY: detailTranslate }],
            },
          ]}
        >
          <Pressable onPress={closeDetail} style={styles.backButton}>
            <ArrowLeft color={palette.goldGlow} size={18} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <ScrollView contentContainerStyle={styles.detailContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.detailTitle}>{sanitizeCopy(renderedPlace.name)}</Text>
            <Text style={styles.detailTag}>Saved Place</Text>
            <View style={styles.accentLine} />
            <Text style={styles.detailBody}>{sanitizeCopy(renderedPlace.description)}</Text>
            <Pressable onPress={() => onRemovePlace(renderedPlace.id)} style={styles.removeDetailBtn}>
              <Trash2 color={palette.goldGlow} size={18} />
              <Text style={styles.removeText}>Remove from saved</Text>
            </Pressable>
          </ScrollView>
        </Animated.View>
      ) : (
        <>
          <Text style={styles.title}>Your Collection</Text>
          <DuneSwitch
            options={[
              { key: 'facts', label: `Facts (${factItems.length})` },
              { key: 'places', label: `Places (${placeItems.length})` },
            ]}
            value={tab}
            onChange={(value) => setTab(value as 'facts' | 'places')}
          />

          {tab === 'facts' ? (
            factItems.length === 0 ? (
              <EmptyPanel
                title="No saved facts"
                description="Explore the map and save fascinating highlights to build your collection."
              />
            ) : (
              <FlatList
                data={factItems}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                  <DuneCard onPress={() => setActiveFact(item)} style={styles.card}>
                    <Text style={styles.cardTitle}>{sanitizeCopy(item.name)}</Text>
                    <Text style={styles.cardBody} numberOfLines={2}>
                      {sanitizeCopy(item.description)}
                    </Text>
                    <Pressable onPress={() => onRemoveFact(item.id)} style={styles.removeBtn}>
                      <Trash2 color={palette.goldSoft} size={18} />
                    </Pressable>
                  </DuneCard>
                )}
              />
            )
          ) : null}

          {tab === 'places' ? (
            placeItems.length === 0 ? (
              <EmptyPanel
                title="No saved places"
                description="Save historic locations to return to them later."
              />
            ) : (
              <FlatList
                data={placeItems}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                  <DuneCard onPress={() => setActivePlace(item)} style={styles.card}>
                    <Text style={styles.cardTitle}>{sanitizeCopy(item.name)}</Text>
                    <Text style={styles.cardBody} numberOfLines={2}>
                      {sanitizeCopy(item.description)}
                    </Text>
                    <Pressable onPress={() => onRemovePlace(item.id)} style={styles.removeBtn}>
                      <Trash2 color={palette.goldSoft} size={18} />
                    </Pressable>
                  </DuneCard>
                )}
              />
            )
          ) : null}
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
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
  detailContent: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  detailTitle: {
    color: palette.goldGlow,
    ...typography.title,
  },
  detailTag: {
    color: palette.sand,
    ...typography.caption,
  },
  accentLine: {
    height: 1,
    backgroundColor: palette.goldSoft,
    opacity: 0.6,
  },
  detailBody: {
    color: palette.cream,
    ...typography.body,
  },
  removeDetailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 46,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.mistStrong,
    backgroundColor: palette.duneLight,
  },
  removeText: {
    color: palette.goldGlow,
    ...typography.caption,
  },
  title: {
    color: palette.cream,
    ...typography.title,
  },
  list: {
    gap: spacing.md,
    paddingBottom: 120,
  },
  card: {
    gap: spacing.sm,
  },
  cardTitle: {
    color: palette.goldGlow,
    ...typography.h3,
  },
  cardBody: {
    color: palette.cream,
    ...typography.body,
  },
  removeBtn: {
    alignSelf: 'flex-end',
    padding: spacing.sm,
    backgroundColor: palette.duneLight,
    borderRadius: 14,
  },
});
