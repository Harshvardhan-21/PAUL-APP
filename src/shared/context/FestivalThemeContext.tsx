import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { festivalApi, type ActiveFestival } from '../api';

type FestivalThemeContextValue = {
  festival: ActiveFestival | null;
  loading: boolean;
  refreshFestival: () => Promise<void>;
};

const FestivalThemeContext = createContext<FestivalThemeContextValue | null>(null);

const CACHE_TTL = 5 * 1000;
let cachedFestival: ActiveFestival | null | undefined;
let cacheTime = 0;

export function FestivalThemeProvider({ children }: { children: React.ReactNode }) {
  const [festival, setFestival] = useState<ActiveFestival | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const refreshFestival = async () => {
    setLoading(true);
    try {
      if (cachedFestival !== undefined && Date.now() - cacheTime < CACHE_TTL) {
        if (mountedRef.current) { setFestival(cachedFestival); setLoading(false); }
        return;
      }
      const data = await festivalApi.getTheme();
      cachedFestival = data;
      cacheTime = Date.now();
      if (mountedRef.current) setFestival(data);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  useEffect(() => { void refreshFestival(); }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const previousState = appStateRef.current;
      appStateRef.current = nextState;
      if (/inactive|background/.test(previousState) && nextState === 'active') {
        void refreshFestival();
      }
    });
    const interval = setInterval(() => {
      if (appStateRef.current === 'active') void refreshFestival();
    }, 5000);
    return () => { subscription.remove(); clearInterval(interval); };
  }, []);

  const value = useMemo(() => ({ festival, loading, refreshFestival }), [festival, loading]);

  return <FestivalThemeContext.Provider value={value}>{children}</FestivalThemeContext.Provider>;
}

export function useFestivalThemeContext() {
  const value = useContext(FestivalThemeContext);
  if (!value) throw new Error('FestivalThemeContext missing');
  return value;
}
