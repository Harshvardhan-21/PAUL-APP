import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { withWebSafeNativeDriver } from '@/shared/animations/nativeDriver';
import { usePreferenceContext } from '@/shared/preferences';
import { createShadow } from '@/shared/theme/shadows';

const WEBSITE_URL = 'https://srvelectricals.com';

function GlobeIcon({ color = '#FFFFFF', size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="8.5" stroke={color} strokeWidth={1.8} />
      <Path
        d="M3.8 12h16.4M12 3.5c2 2.1 3.2 5.2 3.2 8.5 0 3.3-1.2 6.4-3.2 8.5-2-2.1-3.2-5.2-3.2-8.5 0-3.3 1.2-6.4 3.2-8.5z"
        stroke={color}
        strokeWidth={1.8}
      />
    </Svg>
  );
}

function ArrowIcon({ color = '#FFFFFF', size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M3.5 8h8.5M8.5 4.5L12 8l-3.5 3.5"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function WebsitePromoSection({ darkMode }: { darkMode: boolean }) {
  const { tx, language } = usePreferenceContext();
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;
  const websiteCopy =
    language === 'Hindi'
      ? {
          eyebrow: 'हमारी वेबसाइट देखें',
          title: 'SRV की पूरी प्रोडक्ट रेंज ऑनलाइन देखें',
          subtitle:
            'कैटेगरी, प्रोडक्ट डिटेल्स और लेटेस्ट अपडेट सीधे SRV Electricals की आधिकारिक वेबसाइट पर देखें।',
          officialChip: 'आधिकारिक वेबसाइट',
          latestChip: 'लेटेस्ट प्रोडक्ट्स',
          cta: 'वेबसाइट खोलें',
        }
      : language === 'Punjabi'
        ? {
            eyebrow: 'ਸਾਡੀ ਵੈਬਸਾਈਟ ਵੇਖੋ',
            title: 'SRV ਦੀ ਪੂਰੀ ਪ੍ਰੋਡਕਟ ਰੇਂਜ ਆਨਲਾਈਨ ਵੇਖੋ',
            subtitle:
              'ਕੈਟੇਗਰੀਆਂ, ਪ੍ਰੋਡਕਟ ਡੀਟੇਲ ਅਤੇ ਤਾਜ਼ਾ ਅਪਡੇਟ ਸਿੱਧੇ SRV Electricals ਦੀ ਅਧਿਕਾਰਿਕ ਵੈਬਸਾਈਟ ਉੱਤੇ ਵੇਖੋ।',
            officialChip: 'ਅਧਿਕਾਰਿਕ ਵੈਬਸਾਈਟ',
            latestChip: 'ਤਾਜ਼ਾ ਪ੍ਰੋਡਕਟ',
            cta: 'ਵੈਬਸਾਈਟ ਖੋਲ੍ਹੋ',
          }
        : {
            eyebrow: 'Visit Our Website',
            title: 'Explore the full SRV product range online',
            subtitle:
              'Discover categories, product details, and the latest updates directly on the official SRV Electricals website.',
            officialChip: tx('Official website'),
            latestChip: tx('Latest products'),
            cta: tx('Open Website'),
          };

  useEffect(() => {
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(
          floatAnim,
          withWebSafeNativeDriver({
            toValue: 1,
            duration: 2400,
            easing: Easing.inOut(Easing.sin),
          })
        ),
        Animated.timing(
          floatAnim,
          withWebSafeNativeDriver({
            toValue: 0,
            duration: 2400,
            easing: Easing.inOut(Easing.sin),
          })
        ),
      ])
    );
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(
          pulseAnim,
          withWebSafeNativeDriver({
            toValue: 1,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        Animated.timing(
          pulseAnim,
          withWebSafeNativeDriver({
            toValue: 0,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
          })
        ),
      ])
    );

    floatLoop.start();
    pulseLoop.start();

    return () => {
      floatLoop.stop();
      pulseLoop.stop();
    };
  }, [floatAnim, pulseAnim]);

  const floatTranslateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  return (
    <LinearGradient
      colors={darkMode ? ['#0F172A', '#16243D', '#1E3A5F'] : ['#FFF5EF', '#FFE1CF', '#DCEFFF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, darkMode ? styles.cardDark : null]}
    >
      <Animated.View style={[styles.glowOne, { transform: [{ scale: pulseScale }] }]} />
      <Animated.View style={[styles.glowTwo, { transform: [{ translateY: floatTranslateY }] }]} />

      <View style={styles.headerRow}>
        <Animated.View style={[styles.iconShell, { transform: [{ translateY: floatTranslateY }] }]}>
          <View style={styles.iconCore}>
            <GlobeIcon />
          </View>
        </Animated.View>
        <View style={styles.copyWrap}>
          <Text style={[styles.eyebrow, darkMode ? styles.eyebrowDark : null]}>
            {websiteCopy.eyebrow}
          </Text>
          <Text style={[styles.title, darkMode ? styles.titleDark : null]}>
            {websiteCopy.title}
          </Text>
        </View>
      </View>

      <Text style={[styles.subtitle, darkMode ? styles.subtitleDark : null]}>
        {websiteCopy.subtitle}
      </Text>

      <View style={styles.chipsRow}>
        <View style={[styles.chip, darkMode ? styles.chipDark : null]}>
          <Text style={[styles.chipText, darkMode ? styles.chipTextDark : null]}>
            {websiteCopy.officialChip}
          </Text>
        </View>
        <View style={[styles.chip, darkMode ? styles.chipDark : null]}>
          <Text style={[styles.chipText, darkMode ? styles.chipTextDark : null]}>
            {websiteCopy.latestChip}
          </Text>
        </View>
      </View>

      <Pressable
        onPress={() => Linking.openURL(WEBSITE_URL)}
        onPressIn={() => {
          Animated.spring(
            btnScale,
            withWebSafeNativeDriver({
              toValue: 0.97,
              tension: 120,
              friction: 8,
            })
          ).start();
        }}
        onPressOut={() => {
          Animated.spring(
            btnScale,
            withWebSafeNativeDriver({
              toValue: 1,
              tension: 120,
              friction: 8,
            })
          ).start();
        }}
      >
        <Animated.View style={{ transform: [{ scale: btnScale }] }}>
          <LinearGradient
            colors={darkMode ? ['#E8453C', '#F97316'] : ['#173E80', '#2D6CDF']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.ctaBtn}
          >
            <Text style={styles.ctaText}>{websiteCopy.cta}</Text>
            <ArrowIcon />
          </LinearGradient>
        </Animated.View>
      </Pressable>

      <Text style={[styles.urlText, darkMode ? styles.urlTextDark : null]}>{WEBSITE_URL}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 22,
    borderRadius: 28,
    padding: 20,
    overflow: 'hidden',
    position: 'relative',
    ...createShadow({ color: '#0F172A', offsetY: 12, blur: 22, opacity: 0.1, elevation: 6 }),
  },
  cardDark: {
    ...createShadow({ color: '#020617', offsetY: 12, blur: 22, opacity: 0.24, elevation: 6 }),
  },
  glowOne: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(232,69,60,0.16)',
    top: -46,
    right: -22,
  },
  glowTwo: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(37,99,235,0.16)',
    bottom: -34,
    left: -16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  iconShell: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCore: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#173E80',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyWrap: { flex: 1 },
  eyebrow: {
    color: '#173E80',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  eyebrowDark: { color: '#BFDBFE' },
  title: {
    color: '#14213D',
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '900',
  },
  titleDark: { color: '#F8FAFC' },
  subtitle: {
    color: '#5C6F91',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 14,
  },
  subtitleDark: { color: '#CBD5E1' },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.76)',
  },
  chipDark: { backgroundColor: 'rgba(255,255,255,0.08)' },
  chipText: { color: '#173E80', fontSize: 12, fontWeight: '700' },
  chipTextDark: { color: '#E2E8F0' },
  ctaBtn: {
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  ctaText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  urlText: {
    marginTop: 12,
    color: '#5C6F91',
    fontSize: 11.5,
    fontWeight: '700',
  },
  urlTextDark: { color: '#94A3B8' },
});
