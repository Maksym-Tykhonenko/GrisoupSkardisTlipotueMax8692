import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { palette, radius, spacing, typography } from '../theme';

type Props = {
  title: string;
  description: string;
};

export const EmptyPanel = ({ title, description }: Props) => {
  return (
    <View style={styles.card}>
      <View style={styles.iconDot} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.duneLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: palette.mistStrong,
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconDot: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: palette.goldSoft,
    opacity: 0.6,
  },
  title: {
    color: palette.goldGlow,
    ...typography.h3,
  },
  body: {
    color: palette.cream,
    textAlign: 'center',
    ...typography.body,
  },
});
