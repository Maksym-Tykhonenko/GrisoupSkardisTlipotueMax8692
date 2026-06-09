import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { palette } from '../theme';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  edges?: Array<'top' | 'bottom' | 'left' | 'right'>;
};

export const SandsShell = ({ children, style, edges = ['top', 'left', 'right'] }: Props) => {
  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      <LinearGradient colors={[palette.nightDeep, palette.dune]} style={styles.root}>
        <View style={[styles.inner, style]}>{children}</View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.nightDeep,
  },
  root: {
    flex: 1,
  },
  inner: {
    flex: 1,
  },
});
