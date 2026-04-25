import { api } from './client';
import { storage } from './storage';

// ── Auth ─────────────────────────────────────────────────────────────

export const authApi = {
  sendOtp: (phone: string, role: 'electrician' | 'dealer') =>
    api.post<{ success: boolean; message: string; devOtp?: string }>(
      '/mobile/auth/send-otp',
      { phone, role }
    ),

  verifyOtp: async (phone: string, role: 'electrician' | 'dealer', otp: string) => {
    const res = await api.post<{
      accessToken: string;
      refreshToken: string;
      user: UserProfile;
    }>('/mobile/auth/verify-otp', { phone, role, otp });

    await storage.setTokens(res.accessToken, res.refreshToken);
    await storage.setUserProfile(res.user);
    await storage.setUserRole(role);
    return res;
  },

  getProfile: () =>
    api.get<UserProfile>('/mobile/auth/profile', undefined, true),

  updateProfile: (data: Partial<UserProfile>) =>
    api.patch<UserProfile>('/mobile/auth/profile', data, true),

  logout: async () => {
    await storage.clearAll();
  },
};

// ── Products ─────────────────────────────────────────────────────────

export const productsApi = {
  getAll: (category?: string) =>
    api.get<{ data: Product[] }>('/mobile/products', category ? { category } : undefined),
};

// ── Banners ──────────────────────────────────────────────────────────

export const bannersApi = {
  getAll: (role?: string) =>
    api.get<{ data: Banner[] }>('/mobile/banners', role ? { role } : undefined),
};

// ── Notifications ─────────────────────────────────────────────────────

export const notificationsApi = {
  getAll: (role?: string, userId?: string) => {
    const params: Record<string, string> = {};
    if (role) params.role = role;
    if (userId) params.userId = userId;
    return api.get<{ data: AppNotification[] }>('/mobile/notifications', Object.keys(params).length ? params : undefined);
  },
  delete: (id: string) =>
    api.delete<{ message: string }>(`/mobile/notifications/${id}`, true),
};

// ── Settings ────────────────────────────────────────────────────────────────

export const settingsApi = {
  getMaintenance: () =>
    api.get<{ maintenanceMode: boolean; message?: string }>('/mobile/settings/maintenance'),
};

// ── Offers / Rewards ─────────────────────────────────────────────────

export const offersApi = {
  getAll: (role?: string) =>
    api.get<{ data: Offer[] }>('/mobile/offers', role ? { role } : undefined),
};

// ── Testimonials ─────────────────────────────────────────────────────

export const testimonialsApi = {
  getAll: () =>
    api.get<{ data: Testimonial[] }>('/mobile/testimonials'),
};

// ── Dealer lookup ─────────────────────────────────────────────────────

export const dealerApi = {
  getByPhone: (phone: string) =>
    api.get<DealerInfo>('/mobile/dealer/by-phone', { phone }),
};

// ── Scan ─────────────────────────────────────────────────────────────

export const scanApi = {
  submit: (qrCode: string, mode: 'single' | 'multi') =>
    api.post<ScanResult>('/mobile/scan', { qrCode, mode }, true),
};

// ── Wallet ───────────────────────────────────────────────────────────

export const walletApi = {
  get: (page = 1, limit = 20) =>
    api.get<WalletData>('/mobile/wallet', { page, limit }, true),

  getScanHistory: (page = 1, limit = 20) =>
    api.get<PaginatedScans>('/mobile/scan-history', { page, limit }, true),
};

// ── Electricians (for dealer) ─────────────────────────────────────────

export const electriciansApi = {
  getAll: (page = 1, limit = 50, search?: string) =>
    api.get<PaginatedElectricians>('/mobile/electricians', { page, limit, search }, true),

  add: (data: { name: string; phone: string; city?: string; state?: string }) =>
    api.post<{ message: string; electrician: ElectricianProfile }>('/mobile/electricians', data, true),
};

// ── Redemptions ───────────────────────────────────────────────────────

export const redemptionsApi = {
  getHistory: (page = 1, limit = 20) =>
    api.get<{ data: RedemptionRecord[]; total: number; page: number; totalPages: number }>(
      '/mobile/redemptions',
      { page, limit },
      true
    ),
};

// ── Types ─────────────────────────────────────────────────────────────

export type UserProfile = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'electrician' | 'dealer';
  profileImage?: string | null;
  // Electrician fields
  electricianCode?: string;
  city?: string;
  state?: string;
  district?: string;
  pincode?: string;
  address?: string;
  tier?: string;
  subCategory?: string;
  totalPoints?: number;
  totalScans?: number;
  walletBalance?: number;
  totalRedemptions?: number;
  dealerId?: string;
  dealerName?: string;
  dealerPhone?: string;
  dealerTown?: string;
  dealerCode?: string;
  // Dealer fields
  town?: string;
  electricianCount?: number;
  gstNumber?: string;
  // Common
  status?: string;
  kycStatus?: string;
  bankLinked?: boolean;
  upiId?: string;
  bankAccount?: string;
  ifsc?: string;
  bankName?: string;
  accountHolderName?: string;
};

export type ElectricianProfile = {
  id: string;
  name: string;
  phone: string;
  electricianCode: string;
  city: string;
  state: string;
  tier: string;
  totalPoints: number;
  status: string;
};

export type Product = {
  id: string;
  name: string;
  sub: string;
  category: string;
  image?: string;
  points: number;
  badge?: string;
  price: number;
  isActive: boolean;
};

export type Banner = {
  id: string;
  title: string;
  imageUrl?: string;
  bgColor?: string;
  resizeMode?: string;
  isActive: boolean;
  displayOrder: number;
  targetRole?: string[];
};

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  targetRole?: string;
  status: string;
  sentAt?: string;
  imageUrl?: string;
};

export type Offer = {
  id: string;
  title: string;
  description: string;
  discount?: string;
  validFrom: string;
  validTo: string;
  targetRole?: string;
  bonusPoints: number;
  imageUrl?: string;
};

export type Testimonial = {
  id: string;
  personName: string;
  initials?: string;
  location?: string;
  tier?: string;
  yearsConnected: number;
  quote: string;
  highlight?: string;
  gradientColors: string[];
  ringColor?: string;
  isActive: boolean;
};

export type DealerInfo = {
  id: string;
  name: string;
  phone: string;
  dealerCode: string;
  town: string;
  district: string;
  state: string;
};

export type ScanResult = {
  success: boolean;
  scan: {
    id: string;
    productName: string;
    points: number;
    mode: string;
    scannedAt: string;
  };
  pointsEarned: number;
};

export type WalletData = {
  balance: number;
  totalPoints: number;
  totalScans: number;
  transactions: {
    data: WalletTransaction[];
    total: number;
    page: number;
    totalPages: number;
  };
};

export type WalletTransaction = {
  id: string;
  type: 'credit' | 'debit';
  source: string;
  amount: number;
  description?: string;
  createdAt: string;
};

export type PaginatedScans = {
  data: ScanRecord[];
  total: number;
  page: number;
  totalPages: number;
};

export type ScanRecord = {
  id: string;
  productName: string;
  points: number;
  mode: string;
  scannedAt: string;
};

export type PaginatedElectricians = {
  data: ElectricianProfile[];
  total: number;
  page: number;
  totalPages: number;
};

export type RedemptionRecord = {
  id: string;
  type: string;
  points: number;
  amount: number;
  status: string;
  upiId?: string;
  bankAccount?: string;
  transactionId?: string;
  requestedAt: string;
  processedAt?: string;
};
