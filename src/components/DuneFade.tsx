import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export const DuneFade = ({ children, style }: Props) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.timing(translate, { toValue: 0, duration: 260, useNativeDriver: true }),
    ]).start();
  }, [opacity, translate]);

  return (
    <Animated.View style={[{ flex: 1, opacity, transform: [{ translateY: translate }] }, style]}>
      {children}
    </Animated.View>
  );
};
