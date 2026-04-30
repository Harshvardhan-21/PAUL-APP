import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { useFestivalThemeContext } from '../context/FestivalThemeContext';
import type { ActiveFestival } from '../api';

export type { ActiveFestival };

export function useFestivalTheme() {
  const { festival, loading } = useFestivalThemeContext();
  const floatAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!festival?.active) {
      opacityAnim.setValue(0);
      floatAnim.setValue(0);
      return;
    }
    Animated.timing(opacityAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(floatAnim, { toValue: -12, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(floatAnim, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [festival, floatAnim, opacityAnim]);

  return { festival, loaded: !loading, floatAnim, opacityAnim };
}
