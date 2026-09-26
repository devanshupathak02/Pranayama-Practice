import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated, Easing } from 'react-native';
import { theme } from '../../constants/theme';

interface Props {
  onFinish: () => void;
}

export const AnimatedSplashScreen: React.FC<Props> = ({ onFinish }) => {
  const circleScale = useRef(new Animated.Value(0.35)).current;
  const circleOpacity = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 0.0s - 1.0s: Circle expands & fades in with rich amber/gold colors
    // 0.2s - 1.0s: Still Mountain mark fades in (opacity 0 -> 1, scale 0.85 -> 1.0)
    // 1.0s - 1.5s: Hold at full expansion & radiance (500ms)
    // 1.5s - 1.8s: Smooth screen fade out (300ms)
    Animated.sequence([
      Animated.parallel([
        Animated.timing(circleScale, {
          toValue: 1.0,
          duration: 1000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(circleOpacity, {
          toValue: 1.0,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(200),
          Animated.parallel([
            Animated.timing(logoOpacity, {
              toValue: 1.0,
              duration: 800,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(logoScale, {
              toValue: 1.0,
              duration: 800,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]),
      Animated.delay(500),
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 300,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      onFinish();
    });
  }, [circleScale, circleOpacity, logoOpacity, logoScale, screenOpacity, onFinish]);

  return (
    <Animated.View style={[styles.overlay, { opacity: screenOpacity }]} pointerEvents="none">
      <View style={styles.centerContainer}>
        {/* Outer radiant Ice Cream Blue glow ring */}
        <Animated.View
          style={[
            styles.outerGlowRing,
            {
              opacity: circleOpacity,
              transform: [{ scale: circleScale }],
            },
          ]}
        />

        {/* Breathing Circle outer ring using Atomic Orange & Ice Blue */}
        <Animated.View
          style={[
            styles.outerRing,
            {
              opacity: circleOpacity,
              transform: [{ scale: circleScale }],
            },
          ]}
        />

        {/* Inner circle with crisp Ice Cream Blue core and Atomic Orange border */}
        <Animated.View
          style={[
            styles.innerCircle,
            {
              opacity: circleOpacity,
              transform: [{ scale: circleScale }],
            },
          ]}
        />

        {/* High-contrast Still Mountain Mark (140px) at center */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Image
            source={require('../../../assets/images/still-mountain-mark.png')}
            style={styles.logoMark}
            resizeMode="contain"
          />
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.background,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
    elevation: 99999,
  },
  centerContainer: {
    width: 340,
    height: 340,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerGlowRing: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(200, 243, 255, 0.45)', // Ice Cream Blue radiant glow
  },
  outerRing: {
    position: 'absolute',
    width: 270,
    height: 270,
    borderRadius: 135,
    backgroundColor: 'rgba(255, 92, 35, 0.12)', // Atomic Orange halo
    borderWidth: 2,
    borderColor: theme.borderAccent, // Ice Blue accent
  },
  innerCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: theme.surfaceTinted, // Ice Cream Blue core
    borderWidth: 3,
    borderColor: theme.accent, // Atomic Orange rim
    shadowColor: theme.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
  },
  logoContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 150,
    height: 150,
  },
  logoMark: {
    width: 140,
    height: 140,
  },
});
