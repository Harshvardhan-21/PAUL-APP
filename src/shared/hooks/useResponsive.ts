import { useMemo } from 'react';
import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

export function useResponsive() {
  return useMemo(() => {
    const horizontalScale = (size: number) => (SCREEN_WIDTH / guidelineBaseWidth) * size;
    const verticalScale = (size: number) => (SCREEN_HEIGHT / guidelineBaseHeight) * size;
    const moderateScale = (size: number, factor = 0.5) =>
      size + (horizontalScale(size) - size) * factor;

    const fontScale = PixelRatio.getFontScale();

    return {
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
      isSmallDevice: SCREEN_WIDTH < 360,
      isMediumDevice: SCREEN_WIDTH >= 360 && SCREEN_WIDTH < 414,
      isLargeDevice: SCREEN_WIDTH >= 414,
      isShortDevice: SCREEN_HEIGHT < 700,
      isMediumHeight: SCREEN_HEIGHT >= 700 && SCREEN_HEIGHT < 800,
      isTallDevice: SCREEN_HEIGHT >= 800,
      horizontalScale,
      verticalScale,
      moderateScale,
      wp: horizontalScale,
      hp: verticalScale,
      ms: moderateScale,
      fs: (size: number) => {
        const scaled = moderateScale(size);
        return scaled * fontScale;
      },
      paddingHorizontal: horizontalScale(16),
      paddingVertical: verticalScale(16),
      gap: verticalScale(12),
    };
  }, []);
}

export function getResponsiveValues() {
  return {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    isSmallDevice: SCREEN_WIDTH < 360,
    isMediumDevice: SCREEN_WIDTH >= 360 && SCREEN_WIDTH < 414,
    isLargeDevice: SCREEN_WIDTH >= 414,
    isShortDevice: SCREEN_HEIGHT < 700,
    isMediumHeight: SCREEN_HEIGHT >= 700 && SCREEN_HEIGHT < 800,
    isTallDevice: SCREEN_HEIGHT >= 800,
    horizontalScale: (size: number) => (SCREEN_WIDTH / guidelineBaseWidth) * size,
    verticalScale: (size: number) => (SCREEN_HEIGHT / guidelineBaseHeight) * size,
    moderateScale: (size: number, factor = 0.5) =>
      size + ((SCREEN_WIDTH / guidelineBaseWidth) * size - size) * factor,
  };
}

export const SCREEN = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
};
