/**
 * BannerCarousel
 *
 * All slides are always mounted and stacked (absoluteFill).
 * Transitions are pure cross-fades — no translateX, no unmount.
 * This eliminates every source of white/blue flash.
 *
 * Swipe is detected on release (no live drag translation needed
 * because the cross-fade itself is fast enough to feel responsive).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  PanResponder,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

export type BannerSlide = {
  image: { uri: string } | number;
  resizeMode?: 'cover' | 'contain' | 'stretch';
  backgroundColor?: string;
};

type Props = {
  slides: BannerSlide[];
  height: number;
  darkMode?: boolean;
  autoPlayInterval?: number;
};

export function BannerCarousel({
  slides,
  height,
  darkMode = false,
  autoPlayInterval = 4000,
}: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Refs — always up-to-date inside closures
  const activeRef = useRef(0);
  const lenRef = useRef(slides.length);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // One Animated.Value per slide — created once, never recreated
  const opacities = useRef<Animated.Value[]>([]);
  while (opacities.current.length < slides.length) {
    opacities.current.push(
      new Animated.Value(opacities.current.length === 0 ? 1 : 0)
    );
  }

  useEffect(() => {
    lenRef.current = slides.length;
  }, [slides.length]);

  // Reset when slide list changes (API load)
  useEffect(() => {
    if (slides.length === 0) return;
    opacities.current.forEach((v, i) => v.setValue(i === 0 ? 1 : 0));
    activeRef.current = 0;
    setActiveIndex(0);
  }, [slides.length]);

  // ── Cross-fade ────────────────────────────────────────────────────────────
  const goTo = useCallback((next: number) => {
    const len = lenRef.current;
    if (len < 2) return;

    const prev = activeRef.current;
    const safeNext = ((next % len) + len) % len;
    if (safeNext === prev) return;

    const prevVal = opacities.current[prev];
    const nextVal = opacities.current[safeNext];
    if (!prevVal || !nextVal) return;

    activeRef.current = safeNext;
    setActiveIndex(safeNext);

    // Ensure next slide starts fully invisible before fading in
    nextVal.setValue(0);

    Animated.parallel([
      Animated.timing(nextVal, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(prevVal, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // ── Auto-play ─────────────────────────────────────────────────────────────
  const stopAuto = useCallback(() => {
    if (autoRef.current) {
      clearInterval(autoRef.current);
      autoRef.current = null;
    }
  }, []);

  const startAuto = useCallback(() => {
    stopAuto();
    if (lenRef.current < 2) return;
    autoRef.current = setInterval(() => {
      goTo(activeRef.current + 1);
    }, autoPlayInterval);
  }, [goTo, stopAuto, autoPlayInterval]);

  useEffect(() => {
    startAuto();
    return stopAuto;
  }, [slides.length, startAuto, stopAuto]);

  // ── Swipe gesture ─────────────────────────────────────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      // Claim gesture only for clear horizontal swipes
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 12 && Math.abs(gs.dx) > Math.abs(gs.dy) * 2,

      onPanResponderGrant: () => {
        stopAuto();
      },

      onPanResponderRelease: (_, gs) => {
        const len = lenRef.current;
        if (len < 2) { startAuto(); return; }

        if (gs.dx < -40) {
          goTo(activeRef.current + 1);
        } else if (gs.dx > 40) {
          goTo(activeRef.current - 1);
        }
        startAuto();
      },

      onPanResponderTerminate: () => {
        startAuto();
      },
    })
  ).current;

  if (slides.length === 0) return null;

  // Use a single dark background — never changes, so no color flash between slides.
  // Individual slide images cover it completely when loaded.
  const bgColor = '#111827';

  return (
    <View>
      {/* ── Banner card ── */}
      <View
        style={[styles.card, { height, backgroundColor: bgColor }]}
        {...panResponder.panHandlers}
      >
        {slides.map((slide, index) => {
          const opacity = opacities.current[index];
          if (!opacity) return null;
          return (
            <Animated.View
              key={index}
              style={[StyleSheet.absoluteFillObject, { opacity }]}
              pointerEvents={index === activeIndex ? 'auto' : 'none'}
            >
              <Image
                source={slide.image as any}
                style={StyleSheet.absoluteFillObject}
                resizeMode={slide.resizeMode ?? 'cover'}
                fadeDuration={0}
              />
            </Animated.View>
          );
        })}
      </View>

      {/* ── Dots ── */}
      {slides.length > 1 && (
        <View style={styles.dotsRow}>
          {slides.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                if (index === activeRef.current) return;
                stopAuto();
                goTo(index);
                startAuto();
              }}
              activeOpacity={0.8}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <View
                style={[
                  styles.dot,
                  darkMode ? styles.dotDark : null,
                  index === activeIndex
                    ? darkMode ? styles.dotActiveDark : styles.dotActive
                    : null,
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
    marginBottom: 22,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C7D2E3',
  },
  dotDark: { backgroundColor: '#334155' },
  dotActive: { width: 28, backgroundColor: '#0F172A' },
  dotActiveDark: { width: 28, backgroundColor: '#E2E8F0' },
});
