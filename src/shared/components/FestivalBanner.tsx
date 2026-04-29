import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import type { ActiveFestival } from '../api';

interface Props {
  festival: ActiveFestival;
  opacityAnim: Animated.Value;
}

function Particle({ emoji, delay, x, size }: { emoji: string; delay: number; x: number; size: number }) {
  const floatY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0.85, duration: 400, useNativeDriver: true }),
        Animated.loop(Animated.sequence([
          Animated.timing(floatY, { toValue: -18, duration: 1800 + delay * 200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(floatY, { toValue: 0, duration: 1800 + delay * 200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])),
        Animated.loop(Animated.sequence([
          Animated.timing(rotate, { toValue: 1, duration: 3000 + delay * 300, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(rotate, { toValue: -1, duration: 3000 + delay * 300, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])),
      ]).start();
    }, delay * 150);
    return () => clearTimeout(timeout);
  }, []);

  const spin = rotate.interpolate({ inputRange: [-1, 1], outputRange: ['-15deg', '15deg'] });

  return (
    <Animated.Text style={{ position: 'absolute', left: `${x}%` as any, bottom: 4, fontSize: size, opacity, transform: [{ translateY: floatY }, { rotate: spin }] }}>
      {emoji}
    </Animated.Text>
  );
}

export function FestivalBanner({ festival, opacityAnim }: Props) {
  if (!festival.active || !festival.greeting || !festival.name || !festival.emoji) return null;

  const { theme, greeting, subGreeting, emoji, bannerEmojis, particleEmojis } = festival;
  const bannerEmojiList = [...bannerEmojis].filter(c => c.trim());
  const particleEmojiList = [...particleEmojis].filter(c => c.trim());
  const particles = particleEmojiList.flatMap((e, i) =>
    [0, 1, 2].map(j => ({ key: `${i}-${j}`, emoji: e, x: 5 + (i * 30 + j * 10) % 90, delay: i * 3 + j, size: 14 + (j % 3) * 4 }))
  );

  return (
    <Animated.View style={[styles.wrapper, { opacity: opacityAnim }]}>
      <LinearGradient
        colors={[theme.primaryColor, theme.secondaryColor, theme.primaryColor + 'CC']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.banner}
      >
        <View style={styles.particleLayer} pointerEvents="none">
          {particles.map(p => <Particle key={p.key} emoji={p.emoji} x={p.x} delay={p.delay} size={p.size} />)}
        </View>
        <View style={styles.shimmer} />
        <View style={styles.content}>
          <View style={styles.emojiRow}>
            {bannerEmojiList.map((e, i) => <Text key={i} style={styles.bannerEmoji}>{e}</Text>)}
          </View>
          <Text style={[styles.greeting, { color: theme.accentColor }]} numberOfLines={1}>{greeting}</Text>
          {subGreeting ? <Text style={[styles.subGreeting, { color: theme.accentColor + 'CC' }]} numberOfLines={2}>{subGreeting}</Text> : null}
        </View>
        <View style={[styles.emojiBadge, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
          <Text style={styles.bigEmoji}>{emoji}</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginHorizontal: 14, marginBottom: 16, borderRadius: 20, overflow: 'hidden' },
  banner: { borderRadius: 20, padding: 16, paddingRight: 80, minHeight: 90, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  particleLayer: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  shimmer: { position: 'absolute', top: 0, left: 0, right: 0, height: '50%', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20 },
  content: { flex: 1, gap: 3 },
  emojiRow: { flexDirection: 'row', gap: 4, marginBottom: 2 },
  bannerEmoji: { fontSize: 18 },
  greeting: { fontSize: 16, fontWeight: '900', letterSpacing: 0.2 },
  subGreeting: { fontSize: 11.5, fontWeight: '600', lineHeight: 16 },
  emojiBadge: { position: 'absolute', right: 12, top: '50%', marginTop: -28, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  bigEmoji: { fontSize: 32 },
});
