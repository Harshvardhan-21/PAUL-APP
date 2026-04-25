import { Platform, type ViewStyle } from 'react-native';

type ShadowOptions = {
  color: string;
  offsetX?: number;
  offsetY: number;
  blur: number;
  opacity: number;
  elevation?: number;
  spread?: number;
};

type ShadowStyle = ViewStyle & { boxShadow?: string };

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function toRgba(color: string, opacity: number) {
  const normalizedOpacity = clamp(opacity, 0, 1);
  const normalized = color.trim();

  if (normalized.startsWith('#')) {
    const hex = normalized.slice(1);
    if (hex.length === 3 || hex.length === 4) {
      const [red, green, blue, alpha = 'f'] = hex.split('');
      const resolvedAlpha = (parseInt(alpha + alpha, 16) / 255) * normalizedOpacity;
      return `rgba(${parseInt(red + red, 16)}, ${parseInt(green + green, 16)}, ${parseInt(blue + blue, 16)}, ${resolvedAlpha})`;
    }

    if (hex.length === 6 || hex.length === 8) {
      const red = parseInt(hex.slice(0, 2), 16);
      const green = parseInt(hex.slice(2, 4), 16);
      const blue = parseInt(hex.slice(4, 6), 16);
      const alpha = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
      return `rgba(${red}, ${green}, ${blue}, ${alpha * normalizedOpacity})`;
    }
  }

  const rgbMatch = normalized.match(/^rgba?\(([^)]+)\)$/i);
  if (rgbMatch) {
    const parts = rgbMatch[1].split(',').map((part) => part.trim());
    const [red = '0', green = '0', blue = '0', alpha = '1'] = parts;
    return `rgba(${Number(red)}, ${Number(green)}, ${Number(blue)}, ${Number(alpha) * normalizedOpacity})`;
  }

  return normalized;
}

export function createShadow({
  color,
  offsetX = 0,
  offsetY,
  blur,
  opacity,
  elevation = 0,
  spread = 0,
}: ShadowOptions): ShadowStyle {
  if (Platform.OS === 'web') {
    return {
      boxShadow: `${offsetX}px ${offsetY}px ${blur}px ${spread}px ${toRgba(color, opacity)}`,
    };
  }

  return {
    shadowColor: color,
    shadowOffset: { width: offsetX, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: blur,
    elevation,
  };
}

export function clearShadow(): ShadowStyle {
  if (Platform.OS === 'web') {
    return { boxShadow: 'none' };
  }

  return {
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  };
}
