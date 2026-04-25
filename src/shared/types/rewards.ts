export type ScanMode = 'single' | 'multi';

export type RewardHistoryItem = {
  id: string;
  code: string;
  label: string;
  points: number;
  time: string;
  mode: ScanMode;
};
