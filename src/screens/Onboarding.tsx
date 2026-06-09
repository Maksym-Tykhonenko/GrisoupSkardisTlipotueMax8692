import React, { useRef } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { palette, radius, spacing, typography } from '../theme';
import { GildedButton } from '../components/GildedButton';

const { width } = Dimensions.get('window');

type Slide = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: any;
};

type Props = {
  slides: Slide[];
  onFinish: () => void;
  onSkip: () => void;
};

export const Onboarding = ({ slides, onFinish, onSkip }: Props) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const listRef = useRef<FlatList<Slide>>(null);

  return (
    <View style={styles.root}>
      <Animated.FlatList
        ref={listRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        onScrollToIndexFailed={() => {
          listRef.current?.scrollToOffset({ offset: 0, animated: true });
        }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        renderItem={({ item, index }) => (
          <ImageBackground source={item.image} style={styles.slide} resizeMode="cover">
            <LinearGradient
              colors={['rgba(8,6,4,0.05)', 'rgba(8,6,4,0.55)', 'rgba(8,6,4,0.92)']}
              locations={[0, 0.55, 1]}
              style={styles.overlay}
            />
            <SafeAreaView style={styles.safeLayer} edges={['top', 'bottom']}>
              <View style={styles.topBar}>
                <Pressable onPress={onSkip} style={styles.skip}>
                  <Text style={styles.skipText}>Skip</Text>
                </Pressable>
              </View>
              <View style={styles.bottomContent}>
                <View style={styles.copyBlock}>
                  <Text style={styles.brand}>Gorus Sands Througt</Text>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.subtitle}>{item.subtitle}</Text>
                  <Text style={styles.description}>{item.description}</Text>
                </View>
                <View style={styles.controls}>
                  <View style={styles.dots}>
                    {slides.map((_, dotIndex) => {
                      const opacity = scrollX.interpolate({
                        inputRange: [(dotIndex - 1) * width, dotIndex * width, (dotIndex + 1) * width],
                        outputRange: [0.3, 1, 0.3],
                        extrapolate: 'clamp',
                      });
                      return (
                        <Animated.View key={`${item.id}-dot-${dotIndex}`} style={[styles.dot, { opacity }]} />
                      );
                    })}
                  </View>
                  <GildedButton
                    label={index === slides.length - 1 ? 'Begin Your Journey' : 'Continue'}
                    onPress={() => {
                      if (index === slides.length - 1) {
                        onFinish();
                      } else {
                        listRef.current?.scrollToIndex({ index: index + 1, animated: true });
                      }
                    }}
                    style={styles.cta}
                  />
                </View>
              </View>
            </SafeAreaView>
          </ImageBackground>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.nightDeep,
  },
  slide: {
    width,
    height: '100%',
    flex: 1,
    justifyContent: 'flex-end',
  },
  safeLayer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  topBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    alignItems: 'flex-end',
  },
  skip: {
    padding: spacing.sm,
  },
  skipText: {
    color: palette.cream,
    ...typography.caption,
  },
  bottomContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    justifyContent: 'flex-end',
    gap: spacing.lg,
  },
  copyBlock: {
    gap: spacing.xs,
  },
  brand: {
    color: palette.goldGlow,
    ...typography.caption,
  },
  title: {
    color: palette.cream,
    ...typography.title,
    fontSize: 24,
  },
  subtitle: {
    color: palette.goldSoft,
    ...typography.h3,
  },
  description: {
    color: palette.cream,
    ...typography.body,
  },
  controls: {
    gap: spacing.md,
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dot: {
    width: 14,
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: palette.goldGlow,
  },
  cta: {
    alignSelf: 'stretch',
    marginBottom: spacing.sm,
  },
});
