import React, { useRef, useState, useEffect } from 'react';
import {
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon, C } from '@/features/profile/components/ProfileShared';
import {
  supportsNativeAnimatedDriver,
  withWebSafeNativeDriver,
} from '@/shared/animations/nativeDriver';
import { usePreferenceContext } from '@/shared/preferences';
import { createShadow } from '@/shared/theme/shadows';

interface GetStartedScreenProps {
  onComplete: () => void;
}

export function GetStartedScreen({ onComplete }: GetStartedScreenProps) {
  const { tx, theme, darkMode } = usePreferenceContext();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const isSmallScreen = screenWidth <= 360;
  const isMediumScreen = screenWidth > 360 && screenWidth <= 768;
  const isCompactScreen = screenWidth <= 380;
  const topBarPaddingTop = isSmallScreen ? 28 : isMediumScreen ? 40 : 48;
  const slidePaddingTop = isSmallScreen ? 0 : isMediumScreen ? 2 : 4;
  const slideBottomGap = isSmallScreen ? 16 : isMediumScreen ? 14 : 12;
  const bottomSectionPaddingTop = isSmallScreen ? 10 : isMediumScreen ? 12 : 16;
  const bottomSectionPaddingBottom = isSmallScreen ? 18 : isMediumScreen ? 24 : 28;
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [baseCardHeight, setBaseCardHeight] = useState<number | null>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const cardWidth = Math.min(screenWidth - 48, 460);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  // Individual sparkle animations (from file 1)
  const sparkle1 = useRef(new Animated.Value(0)).current;
  const sparkle2 = useRef(new Animated.Value(0)).current;
  const sparkle3 = useRef(new Animated.Value(0)).current;
  const sparkle4 = useRef(new Animated.Value(0)).current;
  const sparkle5 = useRef(new Animated.Value(0)).current;
  const sparkle6 = useRef(new Animated.Value(0)).current;
  const sparkle7 = useRef(new Animated.Value(0)).current;
  const sparkle8 = useRef(new Animated.Value(0)).current;
  const sparkleRotate = useRef(new Animated.Value(0)).current;

  const totalSlides = 3;

  // One-time entry animation
  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(24);
    logoScale.setValue(0.8);
    logoOpacity.setValue(0);

    const animations: Animated.CompositeAnimation[] = [
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 320,
        useNativeDriver: supportsNativeAnimatedDriver,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: supportsNativeAnimatedDriver,
        tension: 55,
        friction: 9,
      }),
    ];

    animations.push(
      Animated.spring(logoScale, {
        toValue: 1,
        useNativeDriver: supportsNativeAnimatedDriver,
        tension: 50,
        friction: 7,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: supportsNativeAnimatedDriver,
      })
    );

    Animated.parallel(animations).start();
  }, [fadeAnim, logoOpacity, logoScale, slideAnim]);

  // Individual sparkle animations (from file 1)
  useEffect(() => {
    let rotateAnimLoop: Animated.CompositeAnimation | null = null;
    const sparkleAnims: Animated.CompositeAnimation[] = [];

    if (currentIndex === 0) {
      sparkleRotate.setValue(0);
      rotateAnimLoop = Animated.loop(
        Animated.timing(
          sparkleRotate,
          withWebSafeNativeDriver({
            toValue: 1,
            duration: 4000,
          })
        )
      );
      rotateAnimLoop.start();

      const makeSparkleAnim = (
        sparkle: Animated.Value,
        delay: number,
        duration: number = 1200
      ): Animated.CompositeAnimation => {
        sparkle.setValue(0);
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(
              sparkle,
              withWebSafeNativeDriver({
                toValue: 1,
                duration: duration * 0.5,
              })
            ),
            Animated.timing(
              sparkle,
              withWebSafeNativeDriver({
                toValue: 0,
                duration: duration * 0.5,
              })
            ),
          ])
        );
      };

      sparkleAnims.push(makeSparkleAnim(sparkle1, 0, 1200));
      sparkleAnims.push(makeSparkleAnim(sparkle2, 150, 1000));
      sparkleAnims.push(makeSparkleAnim(sparkle3, 300, 1100));
      sparkleAnims.push(makeSparkleAnim(sparkle4, 450, 900));
      sparkleAnims.push(makeSparkleAnim(sparkle5, 200, 1300));
      sparkleAnims.push(makeSparkleAnim(sparkle6, 350, 1400));
      sparkleAnims.push(makeSparkleAnim(sparkle7, 100, 800));
      sparkleAnims.push(makeSparkleAnim(sparkle8, 400, 1100));

      sparkleAnims.forEach((anim) => anim.start());
    }

    return () => {
      if (rotateAnimLoop) rotateAnimLoop.stop();
      sparkleAnims.forEach((anim) => anim.stop());
    };
  }, [
    currentIndex,
    sparkle1,
    sparkle2,
    sparkle3,
    sparkle4,
    sparkle5,
    sparkle6,
    sparkle7,
    sparkle8,
    sparkleRotate,
  ]);

  const handleMomentumScrollEnd = (event: any) => {
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / screenWidth);
    if (index !== currentIndex && index >= 0 && index < totalSlides) {
      setCurrentIndex(index);
    }
  };

  const goToSlide = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * screenWidth, animated: true });
  };

  const handleNext = () => {
    if (currentIndex < totalSlides - 1) {
      goToSlide(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const slideGradients = [
    { start: '#E8453C', end: '#FF6B6B', icon: 'star' as const },
    { start: '#7C3AED', end: '#A78BFA', icon: 'refer' as const },
    { start: '#059669', end: '#34D399', icon: 'redeem' as const },
  ];

  const currentGradient = slideGradients[currentIndex];

  // --- Slide 1: Individual animated sparkles from file 1, content from file 2 ---
  const Slide1 = () => {
    const rotate = sparkleRotate.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    const sparkleValues = [
      sparkle1,
      sparkle2,
      sparkle3,
      sparkle4,
      sparkle5,
      sparkle6,
      sparkle7,
      sparkle8,
    ];

    const dotSparkleData = [
      { size: 12, color: C.gold, pos: styles.sparkleTopLeft },
      { size: 8, color: C.primary, pos: styles.sparkleTopRight },
      { size: 10, color: C.teal, pos: styles.sparkleBottomLeft },
      { size: 6, color: C.gold, pos: styles.sparkleBottomRight },
      { size: 9, color: C.primary, pos: styles.sparkleLeft },
      { size: 7, color: C.teal, pos: styles.sparkleRight },
      { size: 8, color: C.gold, pos: styles.sparkleTop },
      { size: 6, color: C.primary, pos: styles.sparkleBottom },
    ];

    const starSparkleData = [
      { color: C.gold, pos: styles.starTopLeft, sparkleIdx: 0 },
      { color: C.primary, pos: styles.starTopRight, sparkleIdx: 1 },
      { color: C.teal, pos: styles.starBottomLeft, sparkleIdx: 2 },
      { color: C.gold, pos: styles.starBottomRight, sparkleIdx: 3 },
    ];

    return (
      <View>
        <View style={[styles.cardHeader, { backgroundColor: '#FFFFFF' }]}>
          <Animated.View
            style={{
              transform: [{ scale: logoScale }],
              opacity: logoOpacity,
            }}
          >
            <Animated.View style={styles.logoGlow}>
              <Image
                source={require('../../../assets/srv-login-logo.png')}
                style={styles.cardLogo}
                resizeMode="contain"
              />
            </Animated.View>
          </Animated.View>

          {/* Dot sparkles */}
          {dotSparkleData.map((item, i) => {
            const scale = sparkleValues[i];
            return (
              <Animated.View
                key={`dot-sparkle-${i}`}
                style={[
                  {
                    position: 'absolute',
                    width: item.size,
                    height: item.size,
                    borderRadius: item.size / 2,
                    backgroundColor: item.color,
                  },
                  item.pos,
                  {
                    opacity: scale,
                    transform: [{ rotate }, { scale }],
                  },
                ]}
              />
            );
          })}

          {/* Star sparkles */}
          {starSparkleData.map((item, i) => {
            const scale = sparkleValues[item.sparkleIdx];
            return (
              <Animated.View
                key={`star-sparkle-${i}`}
                style={[
                  { position: 'absolute' },
                  item.pos,
                  {
                    opacity: scale,
                    transform: [{ rotate }, { scale }],
                  },
                ]}
              >
                <Text style={[styles.starText, { color: item.color }]}>✦</Text>
              </Animated.View>
            );
          })}
        </View>

        {/* Content from file 2 */}
        <View style={styles.cardBody}>
          <View style={styles.tricolorWrapper}>
            <View style={styles.tricolorContainer}>
              <View style={[styles.tricolorBar, { backgroundColor: '#FF9933' }]} />
              <View style={[styles.tricolorBar, { backgroundColor: '#FFFFFF' }]} />
              <View style={[styles.tricolorBar, { backgroundColor: '#138808' }]} />
            </View>
          </View>

          <Text style={[styles.welcomeText, { color: C.primary }]}>{tx('Welcome to SRV')}</Text>
          <Text style={[styles.sinceText, { color: theme.textPrimary }]}>
            {tx('North India Largest')}
          </Text>

          <View style={styles.statsHighlightRow}>
            <View style={[styles.statsHighlightCard, { backgroundColor: C.primaryLight }]}>
              <Text style={[styles.statsHighlightNum, { color: C.primary }]}>25+</Text>
              <Text style={[styles.statsHighlightLabel, { color: C.primary }]}>{tx('Years')}</Text>
            </View>
            <View style={[styles.statsHighlightCard, { backgroundColor: C.goldLight }]}>
              <Text style={[styles.statsHighlightNum, { color: C.gold }]}>250+</Text>
              <Text style={[styles.statsHighlightLabel, { color: C.gold }]}>{tx('Products')}</Text>
            </View>
            <View style={[styles.statsHighlightCard, { backgroundColor: C.tealLight }]}>
              <Text style={[styles.statsHighlightNum, { color: C.teal }]}>100%</Text>
              <Text style={[styles.statsHighlightLabel, { color: C.teal }]}>
                {tx('Made in India')}
              </Text>
            </View>
          </View>

          <View style={styles.features}>
            <View style={[styles.featureItem, { backgroundColor: theme.bg }]}>
              <View style={[styles.featureIcon, { backgroundColor: C.primaryLight }]}>
                <AppIcon name="building" size={20} color={C.primary} />
              </View>
              <View style={styles.featureText}>
                <Text style={[styles.featureTitle, { color: theme.textPrimary }]}>
                  {tx('Manufacturing')}
                </Text>
                <Text style={[styles.featureSub, { color: theme.textMuted }]}>
                  {tx('Premium quality products')}
                </Text>
              </View>
            </View>
            <View style={[styles.featureItem, { backgroundColor: theme.bg }]}>
              <View style={[styles.featureIcon, { backgroundColor: C.tealLight }]}>
                <AppIcon name="offer" size={20} color={C.teal} />
              </View>
              <View style={styles.featureText}>
                <Text style={[styles.featureTitle, { color: theme.textPrimary }]}>
                  {tx('Smart Product Range')}
                </Text>
                <Text style={[styles.featureSub, { color: theme.textMuted }]}>
                  {tx('Innovative designs for modern homes')}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.pills}>
            <View style={[styles.pill, { backgroundColor: C.primaryLight }]}>
              <AppIcon name="star" size={12} color={C.primary} />
              <Text style={[styles.pillText, { color: C.primary }]}>{tx('ISO Certified')}</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: C.goldLight }]}>
              <AppIcon name="location" size={12} color={C.gold} />
              <Text style={[styles.pillText, { color: C.gold }]}>{tx('Pan India Delivery')}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // --- Slide 2: From file 2 ---
  const Slide2 = ({
    gradient,
  }: {
    gradient: { start: string; end: string; icon: 'star' | 'refer' | 'redeem' };
  }) => (
    <View>
      <View style={styles.bannerHeader}>
        <Image
          source={require('../../../assets/dealer_banner.png')}
          style={[styles.headerBannerImage, isCompactScreen && styles.headerBannerImageCompact]}
          resizeMode="cover"
        />
        <View style={styles.roleBadge}>
          <AppIcon name="building" size={16} color={gradient.start} />
        </View>
      </View>

      <View style={[styles.cardBody, isCompactScreen && styles.cardBodyCompact]}>
        <Text style={[styles.centeredChip, { color: gradient.start }]}>
          {tx('For OUR VALUABLE Dealers')}
        </Text>
        <Text
          style={[
            styles.cardTitle,
            isCompactScreen && styles.cardTitleCompact,
            { color: theme.textPrimary },
          ]}
        >
          {tx('Grow your business with SRV')}
        </Text>
        <Text
          style={[
            styles.cardDesc,
            isCompactScreen && styles.cardDescCompact,
            { color: theme.textSecondary },
          ]}
        >
          {tx('Connect with electricians Track sales')}
        </Text>

        <View style={[styles.statsRow, isCompactScreen && styles.statsRowCompact]}>
          <View style={[styles.statCard, { backgroundColor: theme.bg, borderColor: theme.border }]}>
            <Text
              style={[
                styles.statNum,
                isCompactScreen && styles.statNumCompact,
                { color: gradient.start },
              ]}
            >
              1000+
            </Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>{tx('Dealers')}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.bg, borderColor: theme.border }]}>
            <Text
              style={[
                styles.statNum,
                isCompactScreen && styles.statNumCompact,
                { color: C.primary },
              ]}
            >
              20K+
            </Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>{tx('Electricians')}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.bg, borderColor: theme.border }]}>
            <Text
              style={[styles.statNum, isCompactScreen && styles.statNumCompact, { color: C.teal }]}
            >
              8+
            </Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>{tx('States')}</Text>
          </View>
        </View>

        <View style={[styles.features, isCompactScreen && styles.featuresCompact]}>
          <View
            style={[
              styles.featureItem,
              isCompactScreen && styles.featureItemCompact,
              { backgroundColor: theme.bg },
            ]}
          >
            <View
              style={[
                styles.featureIcon,
                isCompactScreen && styles.featureIconCompact,
                { backgroundColor: '#DDD6FE' },
              ]}
            >
              <AppIcon name="refer" size={18} color={gradient.start} />
            </View>
            <View style={styles.featureText}>
              <Text
                style={[
                  styles.featureTitle,
                  isCompactScreen && styles.featureTitleCompact,
                  { color: theme.textPrimary },
                ]}
              >
                {tx('Manage Network')}
              </Text>
              <Text
                style={[
                  styles.featureSub,
                  isCompactScreen && styles.featureSubCompact,
                  { color: theme.textMuted },
                ]}
              >
                {tx('Connect with your all Electrician')}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.featureItem,
              isCompactScreen && styles.featureItemCompact,
              { backgroundColor: theme.bg },
            ]}
          >
            <View
              style={[
                styles.featureIcon,
                isCompactScreen && styles.featureIconCompact,
                { backgroundColor: C.primaryLight },
              ]}
            >
              <AppIcon name="redeem" size={18} color={C.primary} />
            </View>
            <View style={styles.featureText}>
              <Text
                style={[
                  styles.featureTitle,
                  isCompactScreen && styles.featureTitleCompact,
                  { color: theme.textPrimary },
                ]}
              >
                {tx('Grow Revenue')}
              </Text>
              <Text
                style={[
                  styles.featureSub,
                  isCompactScreen && styles.featureSubCompact,
                  { color: theme.textMuted },
                ]}
              >
                {tx('Cash out')}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.featureItem,
              isCompactScreen && styles.featureItemCompact,
              { backgroundColor: theme.bg },
            ]}
          >
            <View
              style={[
                styles.featureIcon,
                isCompactScreen && styles.featureIconCompact,
                { backgroundColor: C.goldLight },
              ]}
            >
              <AppIcon name="offer" size={18} color={C.gold} />
            </View>
            <View style={styles.featureText}>
              <Text
                style={[
                  styles.featureTitle,
                  isCompactScreen && styles.featureTitleCompact,
                  { color: theme.textPrimary },
                ]}
              >
                {tx('Dealer Bonus')}
              </Text>
              <Text
                style={[
                  styles.featureSub,
                  isCompactScreen && styles.featureSubCompact,
                  { color: theme.textMuted },
                ]}
              >
                {tx('Exclusive offers for steady growth')}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.pills, styles.rolePills]}>
          <View style={[styles.pill, { backgroundColor: C.goldLight }]}>
            <Text style={[styles.pillText, { color: C.gold }]}>{tx('Vouchers')}</Text>
          </View>
          <View style={[styles.pill, { backgroundColor: C.tealLight }]}>
            <Text style={[styles.pillText, { color: C.teal }]}>{tx('No expiry')}</Text>
          </View>
          <View style={[styles.pill, { backgroundColor: '#DDD6FE' }]}>
            <Text style={[styles.pillText, { color: gradient.start }]}>{tx('Partner')}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  // --- Slide 3: From file 2 ---
  const Slide3 = ({
    gradient,
  }: {
    gradient: { start: string; end: string; icon: 'star' | 'refer' | 'redeem' };
  }) => (
    <View>
      <View style={styles.bannerHeader}>
        <Image
          source={require('../../../assets/electrician_banner1.jpg')}
          style={[
            styles.electricianBannerImage,
            isCompactScreen && styles.electricianBannerImageCompact,
          ]}
          resizeMode="cover"
        />
        <View style={styles.roleBadge}>
          <AppIcon name="scan" size={16} color={gradient.start} />
        </View>
      </View>

      <View style={[styles.cardBody, isCompactScreen && styles.cardBodyCompact]}>
        <Text style={[styles.centeredChip, { color: C.teal }]}>{tx('For OUR Electricians')}</Text>
        <Text
          style={[
            styles.cardTitle,
            isCompactScreen && styles.cardTitleCompact,
            { color: theme.textPrimary },
          ]}
        >
          {tx('Scan Earn Redeem')}
        </Text>
        <Text
          style={[
            styles.cardDesc,
            isCompactScreen && styles.cardDescCompact,
            { color: theme.textSecondary },
          ]}
        >
          {tx('QR scan instant points redeem')}
        </Text>

        <View style={[styles.statsRow, isCompactScreen && styles.statsRowCompact]}>
          <View style={[styles.statCard, { backgroundColor: theme.bg, borderColor: theme.border }]}>
            <Text
              style={[styles.statNum, isCompactScreen && styles.statNumCompact, { color: C.teal }]}
            >
              100k+
            </Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>{tx('Rewards Paid')}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.bg, borderColor: theme.border }]}>
            <Text
              style={[
                styles.statNum,
                isCompactScreen && styles.statNumCompact,
                { color: C.primary },
              ]}
            >
              20K+
            </Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>{tx('Electricians')}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.bg, borderColor: theme.border }]}>
            <Text
              style={[styles.statNum, isCompactScreen && styles.statNumCompact, { color: C.gold }]}
            >
              8+
            </Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>{tx('States')}</Text>
          </View>
        </View>

        <View style={[styles.features, isCompactScreen && styles.featuresCompact]}>
          <View
            style={[
              styles.featureItem,
              isCompactScreen && styles.featureItemCompact,
              { backgroundColor: theme.bg },
            ]}
          >
            <View
              style={[
                styles.featureIcon,
                isCompactScreen && styles.featureIconCompact,
                { backgroundColor: C.tealLight },
              ]}
            >
              <AppIcon name="scan" size={18} color={C.teal} />
            </View>
            <View style={styles.featureText}>
              <Text
                style={[
                  styles.featureTitle,
                  isCompactScreen && styles.featureTitleCompact,
                  { color: theme.textPrimary },
                ]}
              >
                {tx('Scan Earn')}
              </Text>
              <Text
                style={[
                  styles.featureSub,
                  isCompactScreen && styles.featureSubCompact,
                  { color: theme.textMuted },
                ]}
              >
                {tx('QR scan rewards')}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.featureItem,
              isCompactScreen && styles.featureItemCompact,
              { backgroundColor: theme.bg },
            ]}
          >
            <View
              style={[
                styles.featureIcon,
                isCompactScreen && styles.featureIconCompact,
                { backgroundColor: C.goldLight },
              ]}
            >
              <AppIcon name="redeem" size={18} color={C.gold} />
            </View>
            <View style={styles.featureText}>
              <Text
                style={[
                  styles.featureTitle,
                  isCompactScreen && styles.featureTitleCompact,
                  { color: theme.textPrimary },
                ]}
              >
                {tx('Redeem Rewards')}
              </Text>
              <Text
                style={[
                  styles.featureSub,
                  isCompactScreen && styles.featureSubCompact,
                  { color: theme.textMuted },
                ]}
              >
                {tx('Cash vouchers')}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.featureItem,
              isCompactScreen && styles.featureItemCompact,
              { backgroundColor: theme.bg },
            ]}
          >
            <View
              style={[
                styles.featureIcon,
                isCompactScreen && styles.featureIconCompact,
                { backgroundColor: C.primaryLight },
              ]}
            >
              <AppIcon name="star" size={18} color={C.primary} />
            </View>
            <View style={styles.featureText}>
              <Text
                style={[
                  styles.featureTitle,
                  isCompactScreen && styles.featureTitleCompact,
                  { color: theme.textPrimary },
                ]}
              >
                {tx('Level Up Rewards')}
              </Text>
              <Text
                style={[
                  styles.featureSub,
                  isCompactScreen && styles.featureSubCompact,
                  { color: theme.textMuted },
                ]}
              >
                {tx('Unlock better benefits as you scan')}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.pills, styles.rolePills]}>
          <View style={[styles.pill, { backgroundColor: C.goldLight }]}>
            <Text style={[styles.pillText, { color: C.gold }]}>{tx('Vouchers')}</Text>
          </View>
          <View style={[styles.pill, { backgroundColor: C.tealLight }]}>
            <Text style={[styles.pillText, { color: C.teal }]}>{tx('No expiry')}</Text>
          </View>
          <View style={[styles.pill, { backgroundColor: C.primaryLight }]}>
            <Text style={[styles.pillText, { color: C.primary }]}>{tx('Free to join')}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: darkMode ? '#0F172A' : '#F8FAFC', paddingTop: insets.top },
      ]}
    >
      <View style={[styles.topBar, { paddingTop: topBarPaddingTop }]}>
        <View style={{ width: 60 }} />
      </View>

      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        snapToInterval={screenWidth}
        snapToAlignment="start"
        disableIntervalMomentum
        showsHorizontalScrollIndicator={false}
        bounces={false}
        directionalLockEnabled
        overScrollMode="never"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          withWebSafeNativeDriver({})
        )}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        decelerationRate="normal"
        style={styles.slider}
        contentContainerStyle={{ width: screenWidth * totalSlides, paddingBottom: slideBottomGap }}
      >
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.slide, { width: screenWidth, paddingTop: slidePaddingTop }]}>
            {(() => {
              const inputRange = [(i - 1) * screenWidth, i * screenWidth, (i + 1) * screenWidth];
              const cardOpacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.7, 1, 0.7],
                extrapolate: 'clamp',
              });
              const cardScale = scrollX.interpolate({
                inputRange,
                outputRange: [0.92, 1, 0.92],
                extrapolate: 'clamp',
              });
              const cardTranslateY = scrollX.interpolate({
                inputRange,
                outputRange: [16, 0, 16],
                extrapolate: 'clamp',
              });
              const cardTranslateX = scrollX.interpolate({
                inputRange,
                outputRange: [20, 0, -20],
                extrapolate: 'clamp',
              });
              const cardRotate = scrollX.interpolate({
                inputRange,
                outputRange: ['3deg', '0deg', '-3deg'],
                extrapolate: 'clamp',
              });
              const cardSheenOpacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.08, 0.2, 0.08],
                extrapolate: 'clamp',
              });
              const cardSheenTranslate = scrollX.interpolate({
                inputRange,
                outputRange: [-28, 0, 28],
                extrapolate: 'clamp',
              });
              const contentParallax = scrollX.interpolate({
                inputRange,
                outputRange: [18, 0, -18],
                extrapolate: 'clamp',
              });

              return (
                <Animated.View
                  onLayout={
                    i === 0
                      ? (event) => {
                          const measuredHeight = event.nativeEvent.layout.height;
                          if (measuredHeight > 0 && measuredHeight !== baseCardHeight) {
                            setBaseCardHeight(measuredHeight);
                          }
                        }
                      : undefined
                  }
                  style={[
                    styles.card,
                    { width: cardWidth },
                    baseCardHeight ? { height: baseCardHeight } : null,
                    {
                      backgroundColor: theme.surface,
                      opacity: Animated.multiply(fadeAnim, cardOpacity),
                      transform: [
                        { translateX: cardTranslateX },
                        { translateY: Animated.add(slideAnim, cardTranslateY) },
                        { scale: cardScale },
                        { rotate: cardRotate },
                      ],
                    },
                  ]}
                >
                  <Animated.View
                    style={[
                      styles.cardSheen,
                      { pointerEvents: 'none' },
                      {
                        opacity: cardSheenOpacity,
                        transform: [{ translateX: cardSheenTranslate }],
                      },
                    ]}
                  />
                  <Animated.View style={{ transform: [{ translateX: contentParallax }] }}>
                    {i === 0 && <Slide1 />}
                    {i === 1 && <Slide2 gradient={slideGradients[1]} />}
                    {i === 2 && <Slide3 gradient={slideGradients[2]} />}
                  </Animated.View>
                </Animated.View>
              );
            })()}
          </View>
        ))}
      </Animated.ScrollView>

      <View
        style={[
          styles.bottomSection,
          { paddingTop: bottomSectionPaddingTop, paddingBottom: bottomSectionPaddingBottom },
        ]}
      >
        <View style={styles.dots}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[
                styles.dot,
                currentIndex === i
                  ? { backgroundColor: currentGradient.start, width: 24 }
                  : { backgroundColor: theme.border, width: 8 },
              ]}
            />
          ))}
        </View>

        <Pressable
          style={styles.nextBtn}
          onPress={handleNext}
          testID="get-started-next"
          accessible
          accessibilityRole="button"
          accessibilityLabel="Get started next"
        >
          <View style={[styles.nextBtnGradient, { backgroundColor: currentGradient.start }]}>
            {slideGradients.map((gradient, i) => (
              <Animated.View
                key={`next-gradient-${i}`}
                style={[
                  styles.nextBtnGradientLayer,
                  {
                    opacity: scrollX.interpolate({
                      inputRange: [(i - 1) * screenWidth, i * screenWidth, (i + 1) * screenWidth],
                      outputRange: [0, 1, 0],
                      extrapolate: 'clamp',
                    }),
                  },
                ]}
              >
                <LinearGradient
                  colors={[gradient.start, gradient.end]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.nextBtnGradientFill}
                />
              </Animated.View>
            ))}
            <View style={styles.nextBtnContent}>
              <Text style={styles.nextBtnText}>
                {currentIndex === totalSlides - 1 ? tx('Get Started') : tx('Next')}
              </Text>
              <AppIcon name="chevronRight" size={20} color="#fff" />
            </View>
          </View>
        </Pressable>

        <Pressable
          onPress={handleSkip}
          style={styles.skipBtn}
          testID="get-started-skip"
          accessible
          accessibilityRole="button"
          accessibilityLabel="Get started skip"
        >
          <Text style={[styles.skipBtnText, { color: theme.textMuted }]}>{tx('Skip for now')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 8,
  },
  skipBtnText: { fontSize: 14, fontWeight: '600' },
  slider: { flex: 1 },
  slide: { alignItems: 'center', paddingTop: 4 },
  card: {
    borderRadius: 28,
    overflow: 'hidden',
    ...createShadow({ color: '#000', offsetY: 6, blur: 16, opacity: 0.1, elevation: 6 }),
    position: 'relative',
  },
  cardSheen: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 110,
    backgroundColor: '#FFFFFF',
    opacity: 0.12,
    transform: [{ skewX: '-14deg' }],
  },
  cardHeader: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cardLogo: { width: 150, height: 65 },
  logoGlow: {
    ...createShadow({ color: '#fff', offsetY: 0, blur: 20, opacity: 0.5, elevation: 10 }),
  },
  // Dot sparkle positions
  sparkleTopLeft: { top: 15, left: 30 },
  sparkleTopRight: { top: 20, right: 35 },
  sparkleBottomLeft: { bottom: 25, left: 40 },
  sparkleBottomRight: { bottom: 20, right: 45 },
  sparkleLeft: { left: 15, top: 70 },
  sparkleRight: { right: 20, top: 63 },
  sparkleTop: { top: 8, left: '50%' as any },
  sparkleBottom: { bottom: 8, left: '50%' as any },
  // Star sparkle positions
  starText: { fontSize: 14 },
  starTopLeft: { top: 25, left: 55 },
  starTopRight: { top: 30, right: 55 },
  starBottomLeft: { bottom: 35, left: 60 },
  starBottomRight: { bottom: 30, right: 60 },
  // Header (slides 2 & 3)
  headerContent: { alignItems: 'center', gap: 12 },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleHeroWrap: {
    width: 106,
    height: 106,
    borderRadius: 53,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  roleHeroImage: {
    width: 92,
    height: 92,
  },
  bannerHeader: {
    height: 140,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  headerBannerImage: {
    width: '100%',
    height: '100%',
  },
  headerBannerImageCompact: {
    width: '100%',
    height: '100%',
  },
  electricianBannerImage: {
    width: '112%',
    height: '118%',
    marginLeft: '-6%',
    marginTop: -4,
    transform: [{ translateY: 8 }, { scale: 1.18 }],
  },
  electricianBannerImageCompact: {
    width: '118%',
    height: '122%',
    marginLeft: '-9%',
    marginTop: -2,
    transform: [{ translateY: 8 }, { scale: 1.14 }],
  },
  roleHeroImageCompact: {
    width: 82,
    height: 82,
  },
  dealerHeroImage: {
    width: 102,
    height: 102,
  },
  dealerHeroImageCompact: {
    width: 92,
    height: 92,
  },
  roleBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Card body
  cardBody: { padding: 18 },
  cardBodyCompact: { padding: 14 },
  // Slide 1 content styles
  tricolorWrapper: { marginBottom: 14 },
  tricolorContainer: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
  },
  tricolorBar: { flex: 1, height: '100%' },
  welcomeText: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 1,
  },
  sinceText: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 14,
    letterSpacing: 0.5,
  },
  statsHighlightRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statsHighlightCard: { flex: 1, padding: 14, borderRadius: 16, alignItems: 'center' },
  statsHighlightNum: { fontSize: 22, fontWeight: '900', marginBottom: 2 },
  statsHighlightLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  // Slides 2 & 3 content styles
  centeredChip: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 6,
    lineHeight: 26,
    textAlign: 'center',
  },
  cardTitleCompact: {
    fontSize: 18,
    lineHeight: 22,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
    textAlign: 'center',
  },
  cardDescCompact: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 10,
  },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statsRowCompact: { gap: 6, marginBottom: 10 },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  statNum: { fontSize: 16, fontWeight: '900', textAlign: 'center' },
  statNumCompact: { fontSize: 14 },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 2,
    textAlign: 'center',
  },
  // Shared feature styles
  features: { gap: 8, marginBottom: 12 },
  featuresCompact: { gap: 6, marginBottom: 10 },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    minHeight: 64,
    borderRadius: 14,
  },
  featureItemCompact: {
    gap: 10,
    padding: 10,
    minHeight: 56,
  },
  featureIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIconCompact: {
    width: 34,
    height: 34,
  },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 14, fontWeight: '800' },
  featureTitleCompact: { fontSize: 13 },
  featureSub: { fontSize: 11, marginTop: 2 },
  featureSubCompact: { fontSize: 10, marginTop: 1 },
  // Pills
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  rolePills: {
    marginTop: 'auto',
    marginBottom: 4,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  pillText: { fontSize: 10, fontWeight: '700' },
  // Bottom navigation
  bottomSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    alignItems: 'center',
    gap: 12,
  },
  skipBtn: { paddingVertical: 4 },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { height: 8, borderRadius: 4 },
  nextBtn: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    ...createShadow({ color: '#000', offsetY: 3, blur: 6, opacity: 0.12, elevation: 3 }),
  },
  nextBtnGradient: {
    height: 52,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 16,
  },
  nextBtnGradientLayer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    overflow: 'hidden',
  },
  nextBtnGradientFill: {
    flex: 1,
    borderRadius: 16,
  },
  nextBtnContent: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
