import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Linking,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { withWebSafeNativeDriver } from '@/shared/animations/nativeDriver';
import type { Screen } from '@/shared/types/navigation';
import { formatCountText, usePreferenceContext } from '@/shared/preferences';
import ProfileFlipCard from '@/shared/components/ProfileFlipCard';
import { createShadow } from '@/shared/theme/shadows';
import { TestimonialShowcase, type TestimonialItem } from '@/shared/components/TestimonialShowcase';
import { WebsitePromoSection } from '@/shared/components/WebsitePromoSection';
import { ElectricianTierIcon, getElectricianTier } from './ElectricianTierScreen';
import { productsApi, testimonialsApi, bannersApi } from '@/shared/api';
import { useAuth } from '@/shared/context/AuthContext';

const logoImage = require('../../../../assets/banners/srv-logo.jpeg');

const BANNER_SLIDES = [
  {
    image: require('../../../../assets/banners/aco.jpg.jpeg'),
    resizeMode: 'cover' as const,
    backgroundColor: '#192F67',
  },
  {
    image: require('../../../../assets/banners/appliances.jpg.jpeg'),
    resizeMode: 'cover' as const,
    backgroundColor: '#E8C973',
  },
  {
    image: require('../../../../assets/banners/co.jpg.jpeg'),
    resizeMode: 'cover' as const,
    backgroundColor: '#4153C8',
  },
  {
    image: require('../../../../assets/banners/light.jpg.jpeg'),
    resizeMode: 'cover' as const,
    backgroundColor: '#8A20B4',
  },
  {
    image: require('../../../../assets/banners/mcb-box.jpg.jpeg'),
    resizeMode: 'cover' as const,
    backgroundColor: '#7C8BD7',
  },
  {
    image: require('../../../../assets/banners/vs-poster.jpg.jpeg'),
    resizeMode: 'contain' as const,
    backgroundColor: '#19211F',
  },
];

const PRODUCTS = [
  {
    name: 'Fan Box 3" Range',
    description: 'F8 / FC / FDB 18-40 PC',
    img: 'https://srvelectricals.com/cdn/shop/files/F8_3_18-40.png?v=1757426631&width=300',
    category: 'fanbox',
    price: 'Rs 89',
    points: 10,
    colors: ['#FFF8EF', '#F2DEC1', '#E7B879'] as const,
  },
  {
    name: 'Concealed Box 3"',
    description: 'CRD PL precision series',
    img: 'https://srvelectricals.com/cdn/shop/files/CRD_PL_3.png?v=1757426566&width=300',
    category: 'concealedbox',
    price: 'Rs 120',
    points: 15,
    colors: ['#F3F8FF', '#D7E5FF', '#94B6EA'] as const,
  },
  {
    name: 'LED Flood Light Sleek',
    description: 'Outdoor focus beam lighting',
    img: 'https://srvelectricals.com/cdn/shop/files/FloodLightSleek.png?v=1757426471&width=300',
    category: 'led',
    price: 'Rs 699',
    points: 30,
    colors: ['#FFFCEE', '#F5E9C5', '#DABB67'] as const,
  },
  {
    name: 'MCB Box GI 4 Way',
    description: 'Reliable DB box for sites',
    img: 'https://srvelectricals.com/cdn/shop/files/MCB_Box_4_Way_GI.png?v=1757426418&width=300',
    category: 'mcb',
    price: 'Rs 830',
    points: 40,
    colors: ['#F9FBFD', '#E2E9F0', '#A7B7C8'] as const,
  },
] as const;

const DUMMY_PROFILE = {
  name: 'Harshvardhan',
  phone: '9162038214',
  electrician_code: 'PB03900-001',
  dealer_code: 'PB-03-900017-001',
  dealer_name: 'Bansal Chauke',
  dealer_town: 'Chauke',
  dealer_phone: '9465258788',
  town: 'Chauke',
  district: 'Mansa',
  state: 'Punjab',
};

const FEATURED_CARD_COLORS: Record<
  string,
  {
    gradient: readonly [string, string, string];
    scanBg: string;
    scanText: string;
    cardGradient: readonly [string, string, string];
  }
> = {
  fanbox: {
    gradient: ['#6F879F', '#93A8BE', '#D9E1EA'],
    scanBg: '#F5F8FB',
    scanText: '#4A637B',
    cardGradient: ['#FAFBFD', '#E9EEF5', '#D5DEE9'],
  },
  concealedbox: {
    gradient: ['#6F879F', '#93A8BE', '#D9E1EA'],
    scanBg: '#F5F8FB',
    scanText: '#4A637B',
    cardGradient: ['#FAFBFD', '#E9EEF5', '#D5DEE9'],
  },
  led: {
    gradient: ['#6F879F', '#93A8BE', '#D9E1EA'],
    scanBg: '#F5F8FB',
    scanText: '#4A637B',
    cardGradient: ['#FAFBFD', '#E9EEF5', '#D5DEE9'],
  },
  mcb: {
    gradient: ['#6F879F', '#93A8BE', '#D9E1EA'],
    scanBg: '#F5F8FB',
    scanText: '#4A637B',
    cardGradient: ['#FAFBFD', '#E9EEF5', '#D5DEE9'],
  },
};
function FeaturedProductImage({ uri, size }: { uri: string; size: number }) {
  const floatY = useRef(new Animated.Value(0)).current;
  const imgScale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(
          floatY,
          withWebSafeNativeDriver({
            toValue: -8,
            duration: 1600,
            easing: Easing.inOut(Easing.sin),
          })
        ),
        Animated.timing(
          floatY,
          withWebSafeNativeDriver({
            toValue: 0,
            duration: 1600,
            easing: Easing.inOut(Easing.sin),
          })
        ),
      ])
    );
    const scaleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(
          imgScale,
          withWebSafeNativeDriver({
            toValue: 1.05,
            duration: 2200,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        Animated.timing(
          imgScale,
          withWebSafeNativeDriver({
            toValue: 1,
            duration: 2200,
            easing: Easing.inOut(Easing.ease),
          })
        ),
      ])
    );
    floatLoop.start();
    scaleLoop.start();
    return () => {
      floatLoop.stop();
      scaleLoop.stop();
    };
  }, [floatY, imgScale]);
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{ transform: [{ translateY: floatY }, { scale: imgScale }] }}>
        <Image source={{ uri }} style={{ width: size, height: size }} resizeMode="contain" />
      </Animated.View>
    </View>
  );
}
function FeaturedProductCard({
  product,
  width,
  onOpenCategory,
  onScan,
}: {
  product: (typeof PRODUCTS)[number];
  width: number;
  onOpenCategory: (category: string) => void;
  onScan: () => void;
}) {
  const { darkMode, tx } = usePreferenceContext();
  const palette = FEATURED_CARD_COLORS[product.category] ?? FEATURED_CARD_COLORS.fanbox;
  const pressScale = useRef(new Animated.Value(1)).current;
  const tilt = useRef(new Animated.Value(0)).current;
  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(
        pressScale,
        withWebSafeNativeDriver({
          toValue: 0.965,
          tension: 110,
          friction: 7,
        })
      ),
      Animated.spring(tilt, withWebSafeNativeDriver({ toValue: 1, tension: 110, friction: 7 })),
    ]).start();
  };
  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(
        pressScale,
        withWebSafeNativeDriver({ toValue: 1, tension: 110, friction: 7 })
      ),
      Animated.spring(tilt, withWebSafeNativeDriver({ toValue: 0, tension: 110, friction: 7 })),
    ]).start();
  };
  const rotateY = tilt.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '4deg'] });
  const badgeText = tx(product.points >= 25 ? 'Top Pick' : 'Popular');
  return (
    <Pressable
      onPress={() => onOpenCategory(product.category)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.productCard,
          darkMode ? styles.productCardDark : null,
          {
            width,
            transform: [{ scale: pressScale }, { perspective: 900 }, { rotateY }],
          },
        ]}
      >
        <LinearGradient
          colors={palette.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.productImageZone}
        >
          <LinearGradient
            colors={palette.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.productBadge}
          >
            <Text style={styles.productBadgeText}>{badgeText}</Text>
          </LinearGradient>
          <View
            style={[
              styles.pointsPill,
              styles.pointsPillFloating,
              { borderColor: palette.scanText + '33' },
            ]}
          >
            <Text style={[styles.pointsPillText, { color: palette.scanText }]}>
              +{product.points} pts
            </Text>
          </View>
          <FeaturedProductImage uri={product.img} size={width + 6} />
        </LinearGradient>
        <View style={styles.productInfo}>
          <Text
            style={[styles.productName, darkMode ? styles.productNameDark : null]}
            numberOfLines={1}
          >
            {tx(product.name)}
          </Text>
          <Text
            style={[styles.productDesc, darkMode ? styles.productDescDark : null]}
            numberOfLines={2}
          >
            {tx(product.description)}
          </Text>
          <View style={styles.productFooter}>
            <Text style={[styles.productPrice, darkMode ? styles.productPriceDark : null]}>
              {product.price}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => onScan()}
            style={[styles.productScanBtn, { backgroundColor: palette.scanBg }]}
            activeOpacity={0.85}
          >
            <ScanIcon color={palette.scanText} size={15} />
            <Text style={[styles.productScanBtnText, { color: palette.scanText }]}>
              {tx('Scan to Earn')}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Pressable>
  );
}
function WalletIcon({ color = '#10254A', size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="6" width="18" height="13" rx="2.4" stroke={color} strokeWidth={1.8} />
      <Path d="M15.5 11.5H21V16h-5.5a2.25 2.25 0 010-4.5z" stroke={color} strokeWidth={1.8} />
      <Circle cx="16.8" cy="13.75" r="1.05" fill={color} />
      <Path
        d="M7 6V4.8A1.8 1.8 0 018.8 3h7.7"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function BellIcon({ color = '#10254A', size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 16.5V11a6 6 0 1112 0v5.5l1.2 1.2a.8.8 0 01-.57 1.36H5.37a.8.8 0 01-.57-1.36L6 16.5z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Path d="M10 20a2 2 0 004 0" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function ScanIcon({ color = '#10254A', size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="4" y="4" width="6" height="6" rx="1.2" stroke={color} strokeWidth={1.8} />
      <Rect x="14" y="4" width="6" height="6" rx="1.2" stroke={color} strokeWidth={1.8} />
      <Rect x="4" y="14" width="6" height="6" rx="1.2" stroke={color} strokeWidth={1.8} />
      <Path d="M14 14h2v2h-2zM18 14h2v6h-6v-2h4v-4z" fill={color} />
    </Svg>
  );
}

function GiftIcon({ color = '#10254A', size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="8" width="18" height="4" rx="1.2" stroke={color} strokeWidth={1.8} />
      <Path d="M19 12v7a2 2 0 01-2 2H7a2 2 0 01-2-2v-7" stroke={color} strokeWidth={1.8} />
      <Path
        d="M12 8v13M12 8C12 8 9 6 9 4.5a3 3 0 016 0C15 6 12 8 12 8z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function WhatsAppIcon({ color = '#10254A', size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 4.25A7.75 7.75 0 005.21 15.7L4 19.75l4.17-1.1A7.75 7.75 0 1012 4.25z"
        stroke={color}
        strokeWidth={1.9}
        strokeLinejoin="round"
      />
      <Path
        d="M9.15 8.95c.18-.4.39-.42.57-.42h.49c.15 0 .36.06.54.46.18.4.6 1.45.66 1.56.06.11.1.24.02.38-.08.15-.13.25-.25.38-.11.13-.24.29-.34.39-.11.11-.22.22-.09.42.13.2.58.95 1.25 1.54.86.76 1.58 1 1.8 1.1.22.1.35.09.48-.07.13-.16.54-.64.68-.86.14-.22.29-.18.48-.11.2.07 1.24.59 1.45.7.21.1.35.16.4.25.05.09.05.54-.13 1.04-.18.51-1.02.98-1.42 1.03-.37.06-.85.09-1.36-.07-.31-.1-.71-.23-1.23-.46-2.15-.94-3.56-3.16-3.67-3.32-.11-.16-.89-1.18-.89-2.25 0-1.07.56-1.6.76-1.82z"
        fill={color}
      />
    </Svg>
  );
}

function ChevronRight({ color = '#10254A', size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M6 3.5L10.5 8 6 12.5"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function FilterIcon({ color = '#173E80', size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 7h16M7 12h10M10 17h4" stroke={color} strokeWidth={1.9} strokeLinecap="round" />
      <Circle cx="9" cy="7" r="2" fill="#FFFFFF" stroke={color} strokeWidth={1.7} />
      <Circle cx="15" cy="12" r="2" fill="#FFFFFF" stroke={color} strokeWidth={1.7} />
      <Circle cx="12" cy="17" r="2" fill="#FFFFFF" stroke={color} strokeWidth={1.7} />
    </Svg>
  );
}

export function HomeScreen({
  onNavigate,
  onOpenProductCategory,
  profilePhotoUri,
  totalPoints,
  totalScans,
  hasUnreadNotif = false,
}: {
  onNavigate: (screen: Screen) => void;
  onOpenProductCategory: (category: string) => void;
  profilePhotoUri?: string | null;
  totalPoints: number;
  totalScans: number;
  hasUnreadNotif?: boolean;
}) {
  const { darkMode, tx, language } = usePreferenceContext();
  const { user: authUser } = useAuth();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [slide, setSlide] = useState(0);
  const productFilters = ['All', 'Boxes', 'Fans'] as const;
  const [selectedFilter, setSelectedFilter] = useState<(typeof productFilters)[number]>('All');
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const statsPulse = useRef(new Animated.Value(1)).current;
  const autoSlideRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cardW = (width - 28 - 12) / 2;
  const heroImageHeight = Math.round((width - 28) * 0.56);
  const tier = useMemo(() => getElectricianTier(totalPoints), [totalPoints]);

  // Real API data
  const [apiProducts, setApiProducts] = useState<typeof PRODUCTS | null>(null);
  const [apiBannerSlides, setApiBannerSlides] = useState<typeof BANNER_SLIDES | null>(null);
  const [loadedBannerUris, setLoadedBannerUris] = useState<Set<string>>(new Set());

  useEffect(() => {
    bannersApi.getAll('electrician').then((res) => {
      if (res.data?.length) {
        const mapped = res.data
          .filter((b: any) => b.isActive !== false && b.status !== 'inactive')
          .map((b: any) => ({
            image: b.imageUrl ? { uri: b.imageUrl } : require('../../../../assets/banners/aco.jpg.jpeg'),
            resizeMode: (b.resizeMode ?? 'cover') as 'cover' | 'contain',
            backgroundColor: b.bgColor ?? '#192F67',
          }));
        if (mapped.length > 0) {
          // Prefetch all network images first, then swap with fade
          const uriImages = mapped.filter((b: any) => b.image?.uri).map((b: any) => b.image.uri as string);
          const doSwap = () => {
            Animated.timing(fadeAnim, withWebSafeNativeDriver({ toValue: 0, duration: 150 })).start(() => {
              setSlide(0);
              setApiBannerSlides(mapped as any);
              Animated.timing(fadeAnim, withWebSafeNativeDriver({ toValue: 1, duration: 250 })).start();
            });
          };
          if (uriImages.length > 0) {
            Promise.all(uriImages.map((uri) => Image.prefetch(uri).catch(() => null)))
              .then(() => {
                setLoadedBannerUris(new Set(uriImages));
                doSwap();
              });
          } else {
            doSwap();
          }
        }
      }
    }).catch(() => {});

    productsApi.getAll().then((res) => {
      if (res.data?.length) {
        const mapped = res.data.slice(0, 4).map((p: any) => ({
          name: p.name,
          description: p.sub ?? p.description ?? '',
          img: p.image ?? '',
          category: p.category ?? 'fanbox',
          price: `Rs ${p.price ?? 0}`,
          points: p.points ?? 0,
          colors: ['#FFF8EF', '#F2DEC1', '#E7B879'] as const,
        }));
        setApiProducts(mapped as any);
      }
    }).catch(() => {});
  }, []);

  const activeProducts = apiProducts ?? PRODUCTS;
  const activeBannerSlides = apiBannerSlides ?? BANNER_SLIDES;

  const filteredProducts = useMemo(() => {
    if (selectedFilter === 'Boxes') {
      return activeProducts.filter((product: any) => {
        const source = `${product.name} ${product.description}`.toLowerCase();
        return source.includes('box');
      });
    }
    if (selectedFilter === 'Fans') {
      return activeProducts.filter((product: any) => {
        const source = `${product.name} ${product.description}`.toLowerCase();
        return source.includes('fan');
      });
    }
    return activeProducts;
  }, [selectedFilter, activeProducts]);
  const electricianTestimonials = useMemo<TestimonialItem[]>(() => {
    if (language === 'Hindi') {
      return [
        {
          initials: 'GS',
          name: 'Gurpreet Singh',
          location: tx('Amritsar'),
          tier: tx('Diamond'),
          yearsWithUs: tx('4 years connected'),
          quote: tx('T1 quote'),
          highlight: tx('Reliable performance on real job sites'),
          colors: ['#EEF2FF', '#D9D6FE', '#C4B5FD'],
          ring: '#7C3AED',
          glow: '#DDD6FE',
        },
        {
          initials: 'AV',
          name: 'Amit Verma',
          location: tx('Panchkula'),
          tier: tx('Platinum'),
          yearsWithUs: tx('3 years connected'),
          quote: tx('T2 quote'),
          highlight: tx('Fast scan flow with clear rewards'),
          colors: ['#ECFEFF', '#CFFAFE', '#A5F3FC'],
          ring: '#0F766E',
          glow: '#CCFBF1',
        },
        {
          initials: 'HK',
          name: 'Harpal Kaur',
          location: tx('Jalandhar'),
          tier: tx('Platinum'),
          yearsWithUs: tx('2 years connected'),
          quote: tx('T3 quote'),
          highlight: tx('Built for day-to-day field work'),
          colors: ['#F7FEE7', '#DCFCE7', '#BEF264'],
          ring: '#65A30D',
          glow: '#ECFCCB',
        },
        {
          initials: 'RS',
          name: 'Ravi Sharma',
          location: tx('Mohali'),
          tier: tx('Gold'),
          yearsWithUs: tx('3 years connected'),
          quote: tx('T4 quote'),
          highlight: tx('Transparent rewards and timely payments'),
          colors: ['#FFF7E6', '#FDE6B4', '#F6C96E'],
          ring: '#D97706',
          glow: '#FFE7BA',
        },
        {
          initials: 'NK',
          name: 'Naveen Kumar',
          location: tx('Ludhiana'),
          tier: tx('Silver'),
          yearsWithUs: tx('1 year connected'),
          quote: tx('T5 quote'),
          highlight: tx('Good start and easy learning curve'),
          colors: ['#FFF1EC', '#FFD8CC', '#F6B9A4'],
          ring: '#C2410C',
          glow: '#FFD8CC',
        },
      ];
    }
    if (language === 'Punjabi') {
      return [
        {
          initials: 'GS',
          name: 'Gurpreet Singh',
          location: tx('Amritsar'),
          tier: tx('Diamond'),
          yearsWithUs: tx('4 years connected'),
          quote: tx('T1 quote'),
          highlight: tx('Reliable performance on real job sites'),
          colors: ['#EEF2FF', '#D9D6FE', '#C4B5FD'],
          ring: '#7C3AED',
          glow: '#DDD6FE',
        },
        {
          initials: 'AV',
          name: 'Amit Verma',
          location: tx('Panchkula'),
          tier: tx('Platinum'),
          yearsWithUs: tx('3 years connected'),
          quote: tx('T2 quote'),
          highlight: tx('Fast scan flow with clear rewards'),
          colors: ['#ECFEFF', '#CFFAFE', '#A5F3FC'],
          ring: '#0F766E',
          glow: '#CCFBF1',
        },
        {
          initials: 'HK',
          name: 'Harpal Kaur',
          location: tx('Jalandhar'),
          tier: tx('Platinum'),
          yearsWithUs: tx('2 years connected'),
          quote: tx('T3 quote'),
          highlight: tx('Built for day-to-day field work'),
          colors: ['#F7FEE7', '#DCFCE7', '#BEF264'],
          ring: '#65A30D',
          glow: '#ECFCCB',
        },
        {
          initials: 'RS',
          name: 'Ravi Sharma',
          location: tx('Mohali'),
          tier: tx('Gold'),
          yearsWithUs: tx('3 years connected'),
          quote: tx('T4 quote'),
          highlight: tx('Transparent rewards and timely payments'),
          colors: ['#FFF7E6', '#FDE6B4', '#F6C96E'],
          ring: '#D97706',
          glow: '#FFE7BA',
        },
        {
          initials: 'NK',
          name: 'Naveen Kumar',
          location: tx('Ludhiana'),
          tier: tx('Silver'),
          yearsWithUs: tx('1 year connected'),
          quote: tx('T5 quote'),
          highlight: tx('Good start and easy learning curve'),
          colors: ['#FFF1EC', '#FFD8CC', '#F6B9A4'],
          ring: '#C2410C',
          glow: '#FFD8CC',
        },
      ];
    }
    return [
      {
        initials: 'GS',
        name: 'Gurpreet Singh',
        location: 'Amritsar',
        tier: 'Diamond',
        yearsWithUs: 'Connected for 4 years',
        quote:
          'Whether it is a big installation or a quick site visit, SRV feels dependable both in product quality and app flow.',
        highlight: 'Reliable performance on real job sites',
        colors: ['#EEF2FF', '#D9D6FE', '#C4B5FD'],
        ring: '#7C3AED',
        glow: '#DDD6FE',
      },
      {
        initials: 'AV',
        name: 'Amit Verma',
        location: 'Panchkula',
        tier: 'Platinum',
        yearsWithUs: 'Connected for 3 years',
        quote:
          'Points get added fast after scanning, and reward tracking is much cleaner than before.',
        highlight: 'Fast scan flow with clear rewards',
        colors: ['#ECFEFF', '#CFFAFE', '#A5F3FC'],
        ring: '#0F766E',
        glow: '#CCFBF1',
      },
      {
        initials: 'HK',
        name: 'Harpal Kaur',
        location: 'Jalandhar',
        tier: 'Platinum',
        yearsWithUs: 'Connected for 2 years',
        quote:
          'Dealer support feels available whenever needed, and the whole experience stays smooth while working in the field.',
        highlight: 'Built for day-to-day field work',
        colors: ['#F7FEE7', '#DCFCE7', '#BEF264'],
        ring: '#65A30D',
        glow: '#ECFCCB',
      },
      {
        initials: 'RS',
        name: 'Ravi Sharma',
        location: 'Mohali',
        tier: 'Gold',
        yearsWithUs: 'Connected for 3 years',
        quote: 'Rewards come on time and the points calculation is completely transparent.',
        highlight: 'Transparent rewards and timely payments',
        colors: ['#FFF7E6', '#FDE6B4', '#F6C96E'],
        ring: '#D97706',
        glow: '#FFE7BA',
      },
      {
        initials: 'NK',
        name: 'Naveen Kumar',
        location: 'Ludhiana',
        tier: 'Silver',
        yearsWithUs: 'Connected for 1 year',
        quote: 'Even though I am new, I got great support. The app is easy to learn and use.',
        highlight: 'Good start and easy learning curve',
        colors: ['#FFF1EC', '#FFD8CC', '#F6B9A4'],
        ring: '#C2410C',
        glow: '#FFD8CC',
      },
    ];
  }, [language, tx]);

  const goToSlide = (next: number) => {
    Animated.sequence([
      Animated.timing(fadeAnim, withWebSafeNativeDriver({ toValue: 0.45, duration: 140 })),
      Animated.timing(fadeAnim, withWebSafeNativeDriver({ toValue: 1, duration: 220 })),
    ]).start();
  };

  const resetAutoSlide = () => {
    if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current);
    }
    autoSlideRef.current = setInterval(() => {
      setSlide((prev) => (prev + 1) % activeBannerSlides.length);
    }, 4200);
  };

  useEffect(() => {
    resetAutoSlide();
    return () => {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current);
      }
    };
  }, [activeBannerSlides.length]);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(statsPulse, withWebSafeNativeDriver({ toValue: 1.03, duration: 1300 })),
        Animated.timing(statsPulse, withWebSafeNativeDriver({ toValue: 1, duration: 1300 })),
      ])
    );

    pulse.start();
    return () => pulse.stop();
  }, [statsPulse]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 12 && Math.abs(gs.dx) > Math.abs(gs.dy),
      onPanResponderRelease: (_, gs) => {
        if (gs.dx < -40) {
          setSlide((prev) => {
            const next = (prev + 1) % activeBannerSlides.length;
            goToSlide(next);
            return next;
          });
          resetAutoSlide();
        } else if (gs.dx > 40) {
          setSlide((prev) => {
            const next = (prev - 1 + activeBannerSlides.length) % activeBannerSlides.length;
            goToSlide(next);
            return next;
          });
          resetAutoSlide();
        }
      },
    })
  ).current;

  const quickActions = [
    {
      testID: 'electrician-home-action-scan',
      accessibilityLabel: 'Electrician home quick action scan',
      title: tx('Scan & Earn'),
      sub: tx('Instant points'),
      icon: ScanIcon,
      iconColors: ['#E0F2FE', '#BAE6FD'] as const,
      iconTint: '#0369A1',
      onPress: () => onNavigate('scan'),
    },
    {
      testID: 'electrician-home-action-wallet',
      accessibilityLabel: 'Electrician home quick action wallet',
      title: tx('Wallet'),
      sub: tx('Balance & history'),
      icon: WalletIcon,
      iconColors: ['#FEF3C7', '#FDE68A'] as const,
      iconTint: '#B45309',
      onPress: () => onNavigate('wallet'),
    },
    {
      testID: 'electrician-home-action-rewards',
      accessibilityLabel: 'Electrician home quick action gift store',
      title: tx('Gift Store'),
      sub: tx('Redeem rewards'),
      icon: GiftIcon,
      iconColors: ['#F3E8FF', '#DDD6FE'] as const,
      iconTint: '#7C3AED',
      onPress: () => onNavigate('rewards'),
    },
    {
      testID: 'electrician-home-action-whatsapp',
      accessibilityLabel: 'Electrician home quick action WhatsApp support',
      title: tx('WhatsApp'),
      sub: tx('Premium support'),
      icon: WhatsAppIcon,
      iconColors: ['#DCFCE7', '#BBF7D0'] as const,
      iconTint: '#16A34A',
      onPress: () =>
        Linking.openURL(
          'https://wa.me/918837684004?text=Hello%20SRV%20Electricals%2C%20I%20need%20support'
        ),
    },
  ];

  return (
    <ScrollView
      style={[styles.container, darkMode ? styles.containerDark : null]}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={darkMode ? ['#0B1220', '#101A2F', '#18263E'] : ['#EAF3FF', '#DDEEFF', '#F6EEFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.heroShell, { marginTop: -insets.top, paddingTop: 26 + insets.top }]}
      >
        <View style={styles.heroGlowOne} />
        <View style={styles.heroGlowTwo} />
        <View style={styles.heroGlowThree} />

        <View style={styles.topRow}>
          <View style={styles.brandLockup}>
            <View style={[styles.logoWrap, darkMode ? styles.logoWrapDark : null]}>
              <Image source={logoImage} style={styles.logoImage} resizeMode="contain" />
            </View>
          </View>

          <View style={styles.topActions}>
              <TouchableOpacity
                onPress={() => onNavigate('notification')}
                style={[styles.topActionBtn, darkMode ? styles.topActionBtnDark : null]}
                activeOpacity={0.85}
              >
                <View
                  style={[
                    styles.topIconCore,
                    styles.notificationCore,
                    darkMode ? styles.notificationCoreDark : null,
                  ]}
                >
                  <BellIcon color={darkMode ? '#FDBA74' : '#C2410C'} />
                  {hasUnreadNotif && (
                    <View style={styles.redDot} />
                  )}
                </View>
              </TouchableOpacity>
            </View>
        </View>

        <ProfileFlipCard profile={{
          name: authUser?.name ?? DUMMY_PROFILE.name,
          phone: authUser?.phone ?? DUMMY_PROFILE.phone,
          electrician_code: authUser?.electricianCode ?? DUMMY_PROFILE.electrician_code,
          dealer_code: authUser?.dealerCode ?? DUMMY_PROFILE.dealer_code,
          dealer_name: authUser?.dealerName ?? DUMMY_PROFILE.dealer_name,
          dealer_town: authUser?.dealerTown ?? DUMMY_PROFILE.dealer_town,
          dealer_phone: authUser?.dealerPhone ?? DUMMY_PROFILE.dealer_phone,
          town: authUser?.city ?? DUMMY_PROFILE.town,
          district: authUser?.district ?? DUMMY_PROFILE.district,
          state: authUser?.state ?? DUMMY_PROFILE.state,
        }} role="electrician" photoUri={profilePhotoUri} apiPhotoUri={authUser?.profileImage ?? null} />

        <View style={styles.statRow}>
          <Animated.View
            style={[
              styles.statCardWrap,
              darkMode ? styles.statCardWrapDark : null,
              { transform: [{ scale: statsPulse }] },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => onNavigate('wallet')}
              testID="electrician-home-stat-wallet"
              accessible
              accessibilityRole="button"
              accessibilityLabel="Electrician home total points wallet"
            >
              <LinearGradient
                colors={
                  darkMode ? ['#0F172A', '#132238', '#1E293B'] : ['#E0F2FE', '#DBEAFE', '#EDE9FE']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.statCard, darkMode ? styles.statCardDark : null]}
              >
                <Animated.View
                  style={[styles.statGlow, styles.statGlowBlue, { opacity: statsPulse }]}
                />
                <Text style={[styles.statLabel, darkMode ? styles.statLabelDark : null]}>
                  {tx('Total Points')}
                </Text>
                <Text style={[styles.statValue, darkMode ? styles.statValueDark : null]}>
                  {totalPoints.toLocaleString()}
                </Text>
                <Text style={[styles.statHint, darkMode ? styles.statHintDark : null]}>
                  {`${totalScans} ${tx('scans')}`}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
          <Animated.View
            style={[
              styles.statCardWrap,
              darkMode ? styles.statCardWrapDark : null,
              { transform: [{ scale: statsPulse }] },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => onNavigate('electrician_tier')}
              testID="electrician-home-stat-member-tier"
              accessible
              accessibilityRole="button"
              accessibilityLabel="Electrician home member tier"
            >
              <LinearGradient
                colors={darkMode ? ['#111827', '#18263A', '#243B53'] : tier.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.statCard, darkMode ? styles.statCardDark : null]}
              >
                <Animated.View
                  style={[styles.statGlow, styles.statGlowWarm, { opacity: statsPulse }]}
                />
                <View
                  style={[
                    styles.tierIconChip,
                    { backgroundColor: darkMode ? 'rgba(255,255,255,0.12)' : '#FFFFFFB8' },
                  ]}
                >
                  <ElectricianTierIcon tier={tier.tier} size={20} />
                </View>
                <Text style={[styles.statLabel, darkMode ? styles.statLabelDark : null]}>
                  {tx('Member Tier')}
                </Text>
                <Text style={[styles.statValue, darkMode ? styles.statValueDark : null]}>
                  {tier.tier}
                </Text>
                <Text style={[styles.statHint, darkMode ? styles.statHintDark : null]}>
                  {tier.tier === 'Diamond'
                    ? tx('Top reward level unlocked')
                    : formatCountText(
                        language,
                        tier.tier === 'Silver'
                          ? 1001 - totalPoints
                          : tier.tier === 'Gold'
                            ? 5001 - totalPoints
                            : 10001 - totalPoints,
                        'to next tier',
                        'अगले टियर तक',
                        'ਅਗਲੇ ਟੀਅਰ ਤੱਕ'
                      )}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        <Animated.View style={{ opacity: fadeAnim }} {...panResponder.panHandlers}>
          <View
            style={[
              styles.bannerCard,
              { height: heroImageHeight, backgroundColor: activeBannerSlides[slide]?.backgroundColor ?? '#192F67' },
            ]}
          >
            <Image
              source={activeBannerSlides[slide]?.image}
              style={styles.bannerImage}
              resizeMode={activeBannerSlides[slide]?.resizeMode ?? 'cover'}
              onLoad={() => {
                const uri = (activeBannerSlides[slide]?.image as any)?.uri;
                if (uri) setLoadedBannerUris(prev => new Set([...prev, uri]));
              }}
            />
            {/* Hide background flash while network image loads */}
            {(() => {
              const uri = (activeBannerSlides[slide]?.image as any)?.uri;
              const isLoaded = !uri || loadedBannerUris.has(uri);
              return !isLoaded ? (
                <View style={[styles.bannerImage, { position: 'absolute', backgroundColor: '#f0f0f0' }]} />
              ) : null;
            })()}
          </View>
        </Animated.View>

        <View style={styles.dotsRow}>
          {activeBannerSlides.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                goToSlide(index);
                setSlide(index);
                resetAutoSlide();
              }}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.dot,
                  darkMode ? styles.dotDark : null,
                  index === slide && (darkMode ? styles.dotActiveDark : styles.dotActive),
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.quickGrid}>
          {quickActions.map((item) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.title}
                style={[styles.quickCard, darkMode ? styles.quickCardDark : null, { width: cardW }]}
                onPress={item.onPress}
                activeOpacity={0.9}
                testID={item.testID}
                accessible
                accessibilityRole="button"
                accessibilityLabel={item.accessibilityLabel}
              >
                <LinearGradient colors={item.iconColors} style={styles.quickIconBox}>
                  <Icon color={item.iconTint} size={24} />
                </LinearGradient>
                <Text style={[styles.quickTitle, darkMode ? styles.quickTitleDark : null]}>
                  {item.title}
                </Text>
                <Text style={[styles.quickSub, darkMode ? styles.quickSubDark : null]}>
                  {item.sub}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionEyebrow, darkMode ? styles.sectionEyebrowDark : null]}>
              {tx('Top Picks')}
            </Text>
            <Text style={[styles.sectionTitle, darkMode ? styles.sectionTitleDark : null]}>
              {tx('Featured products')}
            </Text>
          </View>
        </View>

        <View style={styles.productsTopBar}>
          <View style={styles.filterRow}>
            {productFilters.map((filter) => {
              const active = selectedFilter === filter;
              return (
                <TouchableOpacity
                  key={filter}
                  onPress={() => setSelectedFilter(filter)}
                  style={[
                    styles.filterChip,
                    darkMode ? styles.filterChipDark : null,
                    active && styles.filterChipActive,
                  ]}
                  activeOpacity={0.86}
                >
                  {filter === 'All' ? (
                    <FilterIcon
                      color={active ? '#FFFFFF' : darkMode ? '#CBD5E1' : '#173E80'}
                      size={15}
                    />
                  ) : null}
                  <Text
                    style={[
                      styles.filterChipText,
                      darkMode ? styles.filterChipTextDark : null,
                      active && styles.filterChipTextActive,
                    ]}
                  >
                    {tx(filter)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            onPress={() => onNavigate('product')}
            style={styles.inlineAction}
            activeOpacity={0.85}
          >
            <Text style={styles.viewAllText}>{tx('View all')}</Text>
            <ChevronRight color="#E8453C" />
          </TouchableOpacity>
        </View>

        <View style={styles.productsGrid}>
          {filteredProducts.map((product) => (
            <FeaturedProductCard
              key={product.name}
              product={product}
              width={cardW}
              onOpenCategory={onOpenProductCategory}
              onScan={() => onNavigate('scan')}
            />
          ))}
        </View>

        <TestimonialShowcase
          eyebrow={tx('Electrician Testimonials')}
          title={tx('What Electricians Say')}
          subtitle={tx('Testimonial subtitle')}
          items={electricianTestimonials}
          darkMode={darkMode}
        />

        <WebsitePromoSection darkMode={darkMode} />

        <View style={{ height: Math.max(30, insets.bottom + 18) }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EEF3F8' },
  containerDark: { backgroundColor: '#08111F' },
  heroShell: {
    paddingTop: 26,
    paddingHorizontal: 14,
    paddingBottom: 10,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  heroGlowOne: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(59,130,246,0.18)',
    top: -60,
    right: -35,
  },
  heroGlowTwo: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(236,72,153,0.14)',
    bottom: 18,
    left: -28,
  },
  heroGlowThree: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(34,197,94,0.1)',
    top: 72,
    left: '34%',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  brandLockup: { flexDirection: 'row', flex: 1, alignItems: 'center' },
  logoWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    overflow: 'hidden',
  },
  logoWrapDark: {
    backgroundColor: 'rgba(15,23,42,0.78)',
    borderColor: 'rgba(148,163,184,0.2)',
  },
  logoImage: { width: 64, height: 64 },
  topActions: { flexDirection: 'row', gap: 8 },
  topActionBtn: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.24)',
    alignItems: 'center',
    justifyContent: 'center',
    ...createShadow({ color: '#0F172A', offsetY: 8, blur: 14, opacity: 0.12, elevation: 4 }),
  },
  topActionBtnDark: {
    backgroundColor: '#0F172A',
    borderColor: 'rgba(148,163,184,0.24)',
    ...createShadow({ color: '#020617', offsetY: 8, blur: 14, opacity: 0.12, elevation: 4 }),
  },

  topIconCore: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletCore: {
    backgroundColor: '#FEF3C7',
  },
  notificationCore: {
    backgroundColor: '#FFEDD5',
  },
  notificationCoreDark: {
    backgroundColor: 'rgba(194,65,12,0.18)',
  },
  redDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E8453C',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  statRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  statCardWrap: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    ...createShadow({ color: '#94A3B8', offsetY: 8, blur: 16, opacity: 0.12, elevation: 4 }),
  },
  statCardWrapDark: {
    ...createShadow({ color: '#020617', offsetY: 8, blur: 16, opacity: 0.26, elevation: 4 }),
  },
  statCard: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  statCardDark: {
    borderColor: 'rgba(148,163,184,0.16)',
  },
  statGlow: {
    position: 'absolute',
    width: 82,
    height: 82,
    borderRadius: 41,
    top: -18,
    right: -12,
  },
  statGlowBlue: {
    backgroundColor: 'rgba(59,130,246,0.22)',
  },
  statGlowWarm: {
    backgroundColor: 'rgba(244,114,182,0.2)',
  },
  statLabel: { color: '#5C6F91', fontSize: 9.5, fontWeight: '700', marginBottom: 4 },
  statLabelDark: { color: '#BFDBFE' },
  statValue: { color: '#13294B', fontSize: 16, fontWeight: '900' },
  statValueDark: { color: '#F8FAFC' },
  statHint: { color: '#7A8CAA', fontSize: 9.5, marginTop: 2 },
  statHintDark: { color: '#CBD5E1' },
  tapHintBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(59,130,246,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  tapHintText: { color: '#3B82F6', fontSize: 9, fontWeight: '700' },
  tierIconChip: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { paddingHorizontal: 14, paddingTop: 18, paddingBottom: 18 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  sectionEyebrow: {
    color: '#7D8AA5',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    marginBottom: 5,
  },
  sectionEyebrowDark: { color: '#94A3B8' },
  sectionTitle: { color: '#14213D', fontSize: 21, fontWeight: '900' },
  sectionTitleDark: { color: '#F8FAFC' },
  bannerCard: {
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#D9E3F2',
    ...createShadow({ color: '#0F172A', offsetY: 10, blur: 22, opacity: 0.16, elevation: 9 }),
  },
  bannerImage: { width: '100%', height: '100%' },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
    marginBottom: 22,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#C7D2E3' },
  dotDark: { backgroundColor: '#334155' },
  dotActive: { width: 28, backgroundColor: '#0F172A' },
  dotActiveDark: { width: 28, backgroundColor: '#E2E8F0' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 22 },
  quickCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 14,
    ...createShadow({ color: '#0F172A', offsetY: 8, blur: 18, opacity: 0.07, elevation: 4 }),
  },
  quickCardDark: {
    backgroundColor: '#111827',
    ...createShadow({ color: '#020617', offsetY: 8, blur: 18, opacity: 0.07, elevation: 4 }),
  },
  quickIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  quickTitle: { color: '#152238', fontSize: 14, fontWeight: '800' },
  quickTitleDark: { color: '#F8FAFC' },
  quickSub: { color: '#74829D', fontSize: 11.5, marginTop: 3 },
  quickSubDark: { color: '#CBD5E1' },
  inlineAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewAllText: { color: '#E8453C', fontSize: 13, fontWeight: '800' },
  productsTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, flex: 1 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9E3F0',
  },
  filterChipDark: {
    backgroundColor: '#111827',
    borderColor: '#243043',
  },
  filterChipActive: {
    backgroundColor: '#173E80',
    borderColor: '#173E80',
  },
  filterChipText: { color: '#173E80', fontSize: 11.5, fontWeight: '800' },
  filterChipTextDark: { color: '#CBD5E1' },
  filterChipTextActive: { color: '#FFFFFF' },
  productsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E6ECF5',
    ...createShadow({ color: '#0F172A', offsetY: 10, blur: 18, opacity: 0.08, elevation: 5 }),
  },
  productCardDark: {
    backgroundColor: '#111827',
    borderColor: '#243043',
    ...createShadow({ color: '#020617', offsetY: 10, blur: 18, opacity: 0.08, elevation: 5 }),
  },
  productImageZone: {
    height: 168,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  productBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 2,
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  productBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  productImage: { width: 112, height: 112 },
  productInfo: { padding: 13, paddingTop: 11 },
  productName: { color: '#152238', fontSize: 13, fontWeight: '800', textTransform: 'uppercase' },
  productNameDark: { color: '#F8FAFC' },
  productDesc: { color: '#70819C', fontSize: 11, lineHeight: 16, marginTop: 4, minHeight: 32 },
  productDescDark: { color: '#CBD5E1' },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  productPrice: { color: '#152238', fontSize: 15, fontWeight: '900' },
  productPriceDark: { color: '#F8FAFC' },
  pointsPill: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
  },
  pointsPillFloating: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 2,
  },
  pointsPillText: { fontSize: 10.5, fontWeight: '800' },
  productScanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderRadius: 12,
    paddingVertical: 9,
  },
  productScanBtnText: { fontSize: 11.5, fontWeight: '800' },
});
