import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { palette, spacing, typography } from '../theme';

type Props = {
  image: any;
  title: string;
  subtitle?: string;
};

export const VistaHeader = ({ image, title, subtitle }: Props) => {
  return (
    <ImageBackground source={image} style={styles.image} imageStyle={styles.imageRadius}>
      <LinearGradient
        colors={['rgba(0,0,0,0.05)', palette.nightDeep]}
        style={styles.overlay}
      />
      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  image: {
    height: 220,
    justifyContent: 'flex-end',
  },
  imageRadius: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  textWrap: {
    padding: spacing.lg,
  },
  title: {
    color: palette.cream,
    ...typography.h2,
  },
  subtitle: {
    marginTop: spacing.xs,
    color: palette.sand,
    ...typography.body,
  },
});
