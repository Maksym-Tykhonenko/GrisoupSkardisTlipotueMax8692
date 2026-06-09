import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Image,
  ImageBackground,
  Modal,
  PermissionsAndroid,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Download, Lock, Share2, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import RNFS from 'react-native-fs';
import { GildedButton } from '../components/GildedButton';
import { palette, spacing, typography } from '../theme';

type WallItem = {
  id: string;
  image: any;
  cost: number;
  title: string;
  subtitle: string;
  description: string;
};

type Props = {
  balance: number;
  unlocked: string[];
  onUnlock: (id: string, cost: number) => void;
};

const walls: WallItem[] = [
  {
    id: 'wall-1',
    image: require('../../thosiganems/walls/image 38.png'),
    cost: 15,
    title: 'Sunlit Pyramids',
    subtitle: 'Giza Horizon',
    description: 'Warm desert light over the great pyramids with a calm blue sky and deep gold sand.',
  },
  {
    id: 'wall-2',
    image: require('../../thosiganems/walls/image 39.png'),
    cost: 12,
    title: 'Desert Watch',
    subtitle: 'Ancient Guardians',
    description: 'A dramatic Egypt scene for a refined lock-screen look with rich dusk tones.',
  },
  {
    id: 'wall-3',
    image: require('../../thosiganems/walls/image 40.png'),
    cost: 10,
    title: 'Nile Sails',
    subtitle: 'River Journey',
    description: 'A calm sailboat silhouette against the river and sky for a peaceful wallpaper.',
  },
  {
    id: 'wall-4',
    image: require('../../thosiganems/walls/image 41.png'),
    cost: 20,
    title: 'Temple of Gold',
    subtitle: 'Pharaonic Light',
    description: 'A cinematic temple detail with glowing bronze columns and deep shadow contrast.',
  },
  {
    id: 'wall-5',
    image: require('../../thosiganems/walls/image 42.png'),
    cost: 15,
    title: 'Sacred Passage',
    subtitle: 'Temple Walls',
    description: 'A warm stone corridor from ancient Egypt framed for a premium art wallpaper.',
  },
  {
    id: 'wall-6',
    image: require('../../thosiganems/walls/image 43.png'),
    cost: 8,
    title: 'Camel Road',
    subtitle: 'Desert Travel',
    description: 'A classic desert travel view with pyramids on the horizon and soft evening light.',
  },
];

export const Walls = ({ balance, unlocked, onUnlock }: Props) => {
  const [active, setActive] = useState<WallItem | null>(null);
  const [renderedActive, setRenderedActive] = useState<WallItem | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const detailAnim = useRef(new Animated.Value(0)).current;

  const handleUnlock = (item: WallItem) => {
    if (unlocked.includes(item.id)) {
      setActive(item);
      return;
    }
    if (balance < item.cost) {
      setMessage('Not enough pyramids yet. Complete the quiz to earn more.');
      return;
    }
    onUnlock(item.id, item.cost);
    setActive(item);
  };

  useEffect(() => {
    if (active) {
      setRenderedActive(active);
      Animated.parallel([
        Animated.timing(detailAnim, { toValue: 1, duration: 260, useNativeDriver: true }),
      ]).start();
      return;
    }

    if (!renderedActive) return;

    Animated.timing(detailAnim, { toValue: 0, duration: 220, useNativeDriver: true }).start(
      ({ finished }) => {
        if (finished) setRenderedActive(null);
      }
    );
  }, [active, detailAnim, renderedActive]);

  const detailTranslate = detailAnim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });

  const closeDetail = () => setActive(null);

  const ensureLocalWallpaperUri = async (sourceUri: string) => {
    if (sourceUri.startsWith('file://')) {
      return sourceUri;
    }

    const fileName = `wallpaper-${Date.now()}.png`;
    const targetPath = `${RNFS.CachesDirectoryPath}/${fileName}`;

    if (sourceUri.startsWith('http://') || sourceUri.startsWith('https://')) {
      const result = await RNFS.downloadFile({ fromUrl: sourceUri, toFile: targetPath }).promise;
      if (result.statusCode && result.statusCode >= 400) {
        throw new Error(`download failed (${result.statusCode})`);
      }
      return `file://${targetPath}`;
    }

    const response = await fetch(sourceUri);
    if (!response.ok) {
      throw new Error(`fetch failed (${response.status})`);
    }

    const blob = await response.blob();
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('blob read failed'));
      reader.onload = () => {
        const result = reader.result;
        if (typeof result !== 'string') {
          reject(new Error('blob read produced unexpected result'));
          return;
        }
        resolve(result.split(',')[1] ?? '');
      };
      reader.readAsDataURL(blob);
    });

    if (!base64) {
      throw new Error('empty base64 payload');
    }

    await RNFS.writeFile(targetPath, base64, 'base64');
    return `file://${targetPath}`;
  };

  const handleSave = async (image: any) => {
    try {
      if (Platform.OS === 'android') {
        const permission =
          Platform.Version >= 33
            ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
            : PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
        const hasPermission = await PermissionsAndroid.request(permission);
        if (hasPermission !== PermissionsAndroid.RESULTS.GRANTED) {
          setMessage('Gallery permission is required to save wallpapers.');
          return;
        }
      }
      const sourceUri = Image.resolveAssetSource(image).uri;
      const localUri = await ensureLocalWallpaperUri(sourceUri);
      await CameraRoll.save(localUri, { type: 'photo' });
      showSaveSuccess();
    } catch (error) {
      console.warn('Wallpaper save failed:', error);
      setMessage('Unable to save wallpaper. Please try again.');
    }
  };

  const handleShare = async (image: any) => {
    try {
      const sourceUri = Image.resolveAssetSource(image).uri;
      const localUri = await ensureLocalWallpaperUri(sourceUri);
      await Share.share({ url: localUri, message: 'Wallpaper from Gorus Sands Througt.' });
    } catch {
      setMessage('Unable to share wallpaper right now.');
    }
  };

  // --- Save success animated modal state & helpers
  const [saveSuccessVisible, setSaveSuccessVisible] = useState(false);
  const saveAnim = useRef(new Animated.Value(0)).current; // 0..1

  const showSaveSuccess = () => {
    setSaveSuccessVisible(true);
    saveAnim.setValue(0);
    Animated.timing(saveAnim, { toValue: 1, duration: 380, useNativeDriver: true }).start(() => {
      setTimeout(() => {
        Animated.timing(saveAnim, { toValue: 0, duration: 260, useNativeDriver: true }).start(() => {
          setSaveSuccessVisible(false);
        });
      }, 1200);
    });
  };

  return (
    <View style={styles.root}>
      <FlatList
        data={walls}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.list}
        ListHeaderComponent={() => (
          <View style={styles.hero}>
            <Text style={styles.kicker}>GUIDE HORUS</Text>
            <View style={styles.heroRow}>
              <View style={styles.heroCopy}>
                <Text style={styles.title}>Wallpapers</Text>
                <Text style={styles.subtitle}>Exchange pyramids for exclusive art</Text>
              </View>
              <View style={styles.balancePill}>
                <Text style={styles.balanceIcon}>▲</Text>
                <Text style={styles.balanceText}>{balance}</Text>
              </View>
            </View>
            <View style={styles.tipCard}>
              <Text style={styles.tipText}>
                Play the Oracle&apos;s Quiz to earn ▲ Pyramids. Use them to unlock these exclusive Egyptian wallpapers.
              </Text>
            </View>
          </View>
        )}
        renderItem={({ item }) => {
          const isUnlocked = unlocked.includes(item.id);
          return (
            <Pressable onPress={() => handleUnlock(item)} style={styles.wallCard}>
              <ImageBackground source={item.image} style={styles.wallImage} imageStyle={styles.wallImageRadius}>
                <View style={styles.wallShade} />
                <View style={styles.wallTopBadge}>
                  {isUnlocked ? null : <Lock color={palette.sand} size={14} />}
                </View>
                <View style={styles.wallBottomBadge}>
                  <Text style={styles.costIcon}>▲</Text>
                  <Text style={styles.cost}>{item.cost}</Text>
                </View>
              </ImageBackground>
            </Pressable>
          );
        }}
      />

      {renderedActive ? (
        <Modal visible transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <Pressable style={StyleSheet.absoluteFill} onPress={closeDetail} />
            <Animated.View
              style={[
                styles.modalCard,
                {
                  opacity: detailAnim,
                  transform: [{ translateY: detailTranslate }],
                  marginTop: insets.top > 0 ? insets.top * 0.35 : 24,
                  marginBottom: insets.bottom > 0 ? insets.bottom * 0.6 : 24,
                },
              ]}
            >
              <Pressable onPress={closeDetail} style={styles.closeIcon}>
                <X color={palette.sand} size={16} />
              </Pressable>

              <ImageBackground source={renderedActive.image} style={styles.preview} imageStyle={styles.previewImage}>
                {!unlocked.includes(renderedActive.id) ? (
                  <View style={styles.lockOverlay}>
                    <View style={styles.lockCircle}>
                      <Lock color={palette.goldGlow} size={28} />
                    </View>
                    <Text style={styles.lockedLabel}>Locked</Text>
                  </View>
                ) : null}
              </ImageBackground>

              <View style={styles.detailBody}>
                <Text style={styles.detailKicker}>GUIDE HORUS</Text>
                <Text style={styles.detailTitle}>{renderedActive.title}</Text>
                <Text style={styles.detailSubtitle}>{renderedActive.subtitle}</Text>
                <View style={styles.accentLine} />
                <Text style={styles.detailDescription}>{renderedActive.description}</Text>

                {!unlocked.includes(renderedActive.id) ? (
                  <>
                    <View style={styles.statsRow}>
                      <Text style={styles.statText}>▲ {renderedActive.cost} pyramids</Text>
                      <Text style={styles.statText}>You have: {balance}</Text>
                    </View>
                    <GildedButton
                      label={`Unlock for ${renderedActive.cost} ▲`}
                      onPress={() => handleUnlock(renderedActive)}
                      icon={<Lock color={palette.ink} size={18} />}
                    />
                  </>
                ) : (
                  <>
                    <View style={styles.actionRow}>
                      <GildedButton
                        label="Save to Gallery"
                        onPress={() => handleSave(renderedActive.image)}
                        icon={<Download color={palette.ink} size={18} />}
                      />
                      <Pressable onPress={() => handleShare(renderedActive.image)} style={styles.secondaryButton}>
                        <Share2 color={palette.goldSoft} size={18} />
                        <Text style={styles.secondaryText}>Share</Text>
                      </Pressable>
                    </View>
                  </>
                )}
              </View>
            </Animated.View>
          </View>
        </Modal>
      ) : null}

      {/* Animated save-success modal */}
      <Modal visible={saveSuccessVisible} transparent animationType="none">
        <View style={styles.saveModalContainer} pointerEvents="box-none">
          <Animated.View
            style={[
              styles.saveModalCard,
              {
                opacity: saveAnim,
                transform: [
                  {
                    scale: saveAnim.interpolate({ inputRange: [0, 1], outputRange: [0.86, 1] }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.saveModalText}>Wallpaper saved to your gallery</Text>
          </Animated.View>
        </View>
      </Modal>

      <Modal visible={!!message} transparent animationType="fade">
        <Pressable style={styles.messageBackdrop} onPress={() => setMessage(null)}>
          <View style={styles.messageCard}>
            <Text style={styles.messageText}>{message}</Text>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 108,
  },
  hero: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  kicker: {
    color: 'rgba(220, 180, 70, 0.65)',
    fontSize: 12,
    letterSpacing: 2.4,
    fontWeight: '700',
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  heroCopy: {
    flex: 1,
  },
  title: {
    color: palette.cream,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.2,
    lineHeight: 34,
  },
  subtitle: {
    color: palette.sand,
    ...typography.body,
    marginTop: 2,
  },
  balancePill: {
    minWidth: 66,
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(220, 180, 70, 0.45)',
    backgroundColor: 'rgba(42, 30, 17, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  balanceIcon: {
    color: '#E94820',
    fontSize: 12,
    fontWeight: '800',
  },
  balanceText: {
    color: palette.goldGlow,
    fontSize: 16,
    fontWeight: '700',
  },
  tipCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(220, 180, 70, 0.2)',
    backgroundColor: 'rgba(41, 30, 15, 0.82)',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  tipText: {
    color: 'rgba(227, 201, 142, 0.88)',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  gridRow: {
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  list: {
    gap: spacing.md,
    paddingBottom: 120,
  },
  wallCard: {
    flex: 1,
    aspectRatio: 0.82,
  },
  wallImage: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 219, 150, 0.12)',
    justifyContent: 'space-between',
  },
  wallImageRadius: {
    borderRadius: 18,
  },
  wallShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  wallTopBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(19, 16, 13, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 219, 150, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockedBadge: {
    color: palette.goldGlow,
    fontSize: 9,
    fontWeight: '700',
  },
  wallBottomBadge: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(19, 16, 13, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255, 219, 150, 0.12)',
  },
  costIcon: {
    color: '#E94820',
    fontSize: 10,
    fontWeight: '800',
  },
  cost: {
    color: palette.goldGlow,
    fontSize: 10,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.68)',
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  modalCard: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 430,
    borderRadius: 24,
    backgroundColor: palette.dune,
    borderWidth: 1,
    borderColor: 'rgba(255, 219, 150, 0.12)',
    overflow: 'hidden',
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.36,
    shadowRadius: 22,
    elevation: 12,
  },
  closeIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(31, 24, 18, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 219, 150, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  preview: {
    height: 320,
    backgroundColor: '#0E0B08',
  },
  previewImage: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  lockOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(12, 9, 7, 0.22)',
    gap: 10,
  },
  lockCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1,
    borderColor: 'rgba(255, 219, 150, 0.25)',
    backgroundColor: 'rgba(26, 18, 11, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedLabel: {
    color: palette.goldGlow,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  detailBody: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.xs,
  },
  detailKicker: {
    color: 'rgba(220, 180, 70, 0.72)',
    fontSize: 12,
    letterSpacing: 2.1,
    fontWeight: '700',
  },
  detailTitle: {
    color: palette.cream,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
  },
  detailSubtitle: {
    color: palette.sand,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  accentLine: {
    height: 1,
    backgroundColor: 'rgba(220, 180, 70, 0.52)',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  detailDescription: {
    color: palette.cream,
    ...typography.body,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  statText: {
    color: palette.sand,
    fontSize: 12,
    fontWeight: '600',
  },
  actionRow: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  secondaryButton: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.goldSoft,
    backgroundColor: 'rgba(26,18,11,0.55)',
  },
  secondaryText: {
    color: palette.goldSoft,
    ...typography.h3,
  },
  messageBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  messageCard: {
    padding: spacing.lg,
    backgroundColor: palette.dune,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 219, 150, 0.1)',
    maxWidth: 340,
  },
  messageText: {
    color: palette.cream,
    ...typography.body,
    textAlign: 'center',
  },
  saveModalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  saveModalCard: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(31,24,18,0.96)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,219,150,0.12)',
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 8,
  },
  saveModalText: {
    color: palette.goldGlow,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
});
