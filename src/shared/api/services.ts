import { api } from './client';
import { storage } from './storage';

// ─────────────────────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────────────────────
export const authApi = {
  sendOtp: (phone: string, role: 'electrician' | 'dealer') =>
    api.post<{ success: boolean; message: string; devOtp?: string }>(
      '/mobile/auth/send-otp', { phone, role }
    ),

  sendSignupOtp: (phone: string, role: 'electrician' | 'dealer') =>
    api.post<{ success: boolean; message: string; devOtp?: string }>(
      '/mobile/auth/signup/send-otp', { phone, role }
    ),

  verifyOtp: async (phone: string, role: 'electrician' | 'dealer', otp: string) => {
    const res = await api.post<{ accessToken: string; refreshToken: string; user: UserProfile }>(
      '/mobile/auth/verify-otp', { phone, role, otp }
    );
    await storage.setTokens(res.accessToken, res.refreshToken);
    await storage.setUserProfile(res.user);
    await storage.setUserRole(role);
    return res;
  },

  verifySignupOtp: (phone: string, role: 'electrician' | 'dealer', otp: string) =>
    api.post<{ success: boolean; message: string }>(
      '/mobile/auth/signup/verify-otp',
      { phone, role, otp }
    ),

  loginWithPassword: async (
    phone: string,
    role: 'electrician' | 'dealer',
    password: string
  ) => {
    const res = await api.post<{ accessToken: string; refreshToken: string; user: UserProfile }>(
      '/mobile/auth/password-login',
      { phone, role, password }
    );
    await storage.setTokens(res.accessToken, res.refreshToken);
    await storage.setUserProfile(res.user);
    await storage.setUserRole(role);
    return res;
  },

  registerDealer: async (data: {
    name: string;
    phone: string;
    email?: string;
    town: string;
    district: string;
    state: string;
    address: string;
    pincode?: string;
    gstNumber?: string;
    password?: string;
  }) => {
    const res = await api.post<{ accessToken: string; refreshToken: string; user: UserProfile }>(
      '/mobile/auth/signup/dealer',
      data
    );
    await storage.setTokens(res.accessToken, res.refreshToken);
    await storage.setUserProfile(res.user);
    await storage.setUserRole('dealer');
    return res;
  },

  registerElectrician: async (data: {
    name: string;
    phone: string;
    email?: string;
    city: string;
    district: string;
    state: string;
    address?: string;
    pincode?: string;
    dealerPhone: string;
    password?: string;
    subCategory?: string;
  }) => {
    const res = await api.post<{ accessToken: string; refreshToken: string; user: UserProfile }>(
      '/mobile/auth/signup/electrician',
      data
    );
    await storage.setTokens(res.accessToken, res.refreshToken);
    await storage.setUserProfile(res.user);
    await storage.setUserRole('electrician');
    return res;
  },

  getProfile: () => api.get<UserProfile>('/mobile/auth/profile', undefined, true),

  updateProfile: (data: Partial<UserProfile>) =>
    api.patch<UserProfile>('/mobile/auth/profile', data, true),

  logout: async () => {
    try {
      await api.post('/mobile/auth/logout', {}, true);
    } catch {
      // Silently ignore API errors — always clear local storage
    } finally {
      await storage.clearAll();
    }
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTS & CATALOG
// ─────────────────────────────────────────────────────────────────────────────
export const productsApi = {
  getAll: (category?: string) =>
    api.get<{ data: Product[] }>('/mobile/products', category ? { category } : undefined),
};

export const catalogApi = {
  getCategories: () =>
    api.get<{ data: ProductCategory[] }>('/mobile/products/categories'),

  getProducts: (params?: { category?: string; search?: string }) =>
    api.get<{ data: Product[] }>('/mobile/products', params),

  getProductById: (id: string) =>
    api.get<Product>(`/mobile/products/${id}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// BANNERS
// ─────────────────────────────────────────────────────────────────────────────
export const bannersApi = {
  getAll: (role?: string) =>
    api.get<{ data: Banner[] }>('/mobile/banners', role ? { role } : undefined),
};

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────
export const notificationsApi = {
  getAll: (role?: string, userId?: string) => {
    const params: Record<string, string> = {};
    if (role) params.role = role;
    if (userId) params.userId = userId;
    return api.get<{ data: AppNotification[] }>(
      '/mobile/notifications',
      Object.keys(params).length ? params : undefined
    );
  },
  delete: (id: string) =>
    api.delete<{ message: string }>(`/mobile/notifications/${id}`, true),
};

// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS
// ─────────────────────────────────────────────────────────────────────────────
export const settingsApi = {
  getMaintenance: () =>
    api.get<{ maintenanceMode: boolean; message?: string }>('/mobile/settings/maintenance'),
  getAppSettings: () =>
    api.get<AppSettings>('/mobile/app-settings'),
};

// ─────────────────────────────────────────────────────────────────────────────
// FESTIVAL / THEME
// ─────────────────────────────────────────────────────────────────────────────
export const festivalApi = {
  getTheme: async (): Promise<ActiveFestival | null> => {
    try {
      return await api.get<ActiveFestival>('/mobile/festival/theme', { timezone: 'Asia/Kolkata' });
    } catch { return null; }
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// OFFERS / REWARDS
// ─────────────────────────────────────────────────────────────────────────────
export const offersApi = {
  getAll: (role?: string) =>
    api.get<{ data: Offer[] }>('/mobile/offers', role ? { role } : undefined),
};

// ─────────────────────────────────────────────────────────────────────────────
// TESTIMONIALS
// ─────────────────────────────────────────────────────────────────────────────
export const testimonialsApi = {
  getAll: () =>
    api.get<{ data: Testimonial[] }>('/mobile/testimonials'),
};

// ─────────────────────────────────────────────────────────────────────────────
// DEALER LOOKUP
// ─────────────────────────────────────────────────────────────────────────────
export const dealerApi = {
  getByPhone: (phone: string) =>
    api.get<DealerInfo>('/mobile/dealer/by-phone', { phone }),
};

// ─────────────────────────────────────────────────────────────────────────────
// SCAN
// ─────────────────────────────────────────────────────────────────────────────
export const scanApi = {
  submit: (qrCode: string, mode: 'single' | 'multi') =>
    api.post<ScanResult>('/mobile/scan', { qrCode, mode }, true),

  getHistory: (page = 1, limit = 50) =>
    api.get<PaginatedScans>('/mobile/scan-history', { page, limit }, true),
};

// ─────────────────────────────────────────────────────────────────────────────
// WALLET
// ─────────────────────────────────────────────────────────────────────────────
export const walletApi = {
  get: (page = 1, limit = 50) =>
    api.get<WalletData>('/mobile/wallet', { page, limit }, true),

  getScanHistory: (page = 1, limit = 50) =>
    api.get<PaginatedScans>('/mobile/scan-history', { page, limit }, true),

  saveBankAccount: (data: BankAccountPayload) =>
    api.post<{ message: string }>('/mobile/wallet/bank-account', data, true),

  redeemReward: (data: { schemeId: string; note?: string }) =>
    api.post<{ message: string }>('/mobile/wallet/redeem', data, true),

  transferPoints: (data: { receiverPhone: string; points: number }) =>
    api.post<{ message: string }>('/mobile/wallet/transfer', data, true),

  getRedemptions: (page = 1, limit = 20) =>
    api.get<{ data: RedemptionRecord[]; total: number; page: number; totalPages: number }>(
      '/mobile/redemptions', { page, limit }, true
    ),

  getDealerBonus: () =>
    api.get<DealerBonus>('/mobile/wallet/dealer-bonus', undefined, true),

  requestDealerBonusWithdrawal: (data: { amount: number }) =>
    api.post<{ message: string }>('/mobile/wallet/dealer-bonus/withdrawals', data, true),
};

// ─────────────────────────────────────────────────────────────────────────────
// ELECTRICIANS (for dealer)
// ─────────────────────────────────────────────────────────────────────────────
export const electriciansApi = {
  getAll: (page = 1, limit = 50, search?: string) =>
    api.get<PaginatedElectricians>('/mobile/electricians', { page, limit, search }, true),

  add: (data: { name: string; phone: string; city?: string; state?: string }) =>
    api.post<{ message: string; electrician: ElectricianProfile }>('/mobile/electricians', data, true),

  getCallList: () =>
    api.get<{ data: CallListItem[] }>('/mobile/electricians/call-list', undefined, true),
};

// ─────────────────────────────────────────────────────────────────────────────
// REDEMPTIONS
// ─────────────────────────────────────────────────────────────────────────────
export const redemptionsApi = {
  getHistory: (page = 1, limit = 20) =>
    api.get<{ data: RedemptionRecord[]; total: number; page: number; totalPages: number }>(
      '/mobile/redemptions', { page, limit }, true
    ),
};

export const ordersApi = {
  getAll: () =>
    api.get<UserOrder[]>('/profile/orders', undefined, true),
};

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────────────────────────────────────────
export const profileApi = {
  update: (data: Partial<UserProfile>) =>
    api.patch<UserProfile>('/mobile/auth/profile', data, true),

  uploadPhoto: (base64DataUri: string, source = 'upload') =>
    api.patch<{ profileImage: string }>('/mobile/profile/photo', { profileImage: base64DataUri, source }, true),

  removePhoto: () =>
    api.delete<{ removed: boolean }>('/mobile/profile/photo', true),

  getQrCode: () =>
    api.get<UserQrCode>('/mobile/profile/qr-code', undefined, true),

  changePassword: (data: { currentPassword?: string; newPassword: string }) =>
    api.patch<{ message: string }>('/mobile/profile/password', data, true),

  updatePreferences: (data: { language?: string; darkMode?: boolean; pushEnabled?: boolean }) =>
    api.patch<UserProfile>('/mobile/auth/profile', data, true),
};

// ─────────────────────────────────────────────────────────────────────────────
// SUPPORT
// ─────────────────────────────────────────────────────────────────────────────
export const supportApi = {
  createTicket: (data: { subject: string; comment: string; photoUrl?: string }) =>
    api.post<{ message: string }>('/mobile/support', data, true),
};

// ─────────────────────────────────────────────────────────────────────────────
// REFERRAL
// ─────────────────────────────────────────────────────────────────────────────
export const referralApi = {
  get: () =>
    api.get<{ code: string; link: string | null; channels: string[] }>('/mobile/referral', undefined, true),
};

// ─────────────────────────────────────────────────────────────────────────────
// APP RATING
// ─────────────────────────────────────────────────────────────────────────────
export const ratingApi = {
  submit: (rating: number, review?: string) =>
    api.post<{ id: string; rating: number }>('/mobile/rating', { rating, review }, true),

  get: () =>
    api.get<{ id: string; rating: number; review: string | null } | null>('/mobile/rating', undefined, true),
};

// ─────────────────────────────────────────────────────────────────────────────
// REWARD SCHEMES
// ─────────────────────────────────────────────────────────────────────────────
export const rewardSchemesApi = {
  getAll: (category?: string) =>
    api.get<{ data: RewardScheme[] }>('/mobile/reward-schemes', category ? { category } : undefined),
};

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

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
  language?: string;
  darkMode?: boolean;
  pushEnabled?: boolean;
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
  // Legacy compat
  fullName?: string;
  pointsBalance?: number;
  scanCount?: number;
};

export type ProductCategory = {
  id: string;
  categoryId?: string;
  label: string;
  slug?: string;
  glyph?: string | null;
  imageUrl?: string | null;
  productCount?: number;
};

export type Product = {
  id: string;
  name: string;
  sub: string;
  description?: string;
  category: string;
  categoryId?: string;
  image?: string;
  imageUrl?: string;
  points: number;
  badge?: string;
  price: number;
  isActive: boolean;
  totalScanned?: number;
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

export type AppSettings = {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  supportPhone: string;
  supportEmail: string;
  whatsappNumber: string;
  appVersion: string;
  minAppVersion: string;
  forceUpdate: boolean;
  scanEnabled: boolean;
  giftsEnabled: boolean;
  referralEnabled: boolean;
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
  qrCode?: string;
};

export type PaginatedElectricians = {
  data: ElectricianProfile[];
  total: number;
  page: number;
  totalPages: number;
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
  totalScans: number;
  status: string;
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

export type UserOrder = {
  id: string;
  status: string;
  title: string;
  userId: string;
  userName: string;
  points: number;
  deliveredAt?: string | null;
  createdAt: string;
};

export type DealerBonus = {
  availableBonus: number;
  totalBonus: number;
  pendingWithdrawals: number;
};

export type BankAccountPayload = {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  upiId?: string;
};

export type CallListItem = {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  city?: string;
  status: string;
};

export type UserQrCode = {
  id: string;
  userId: string;
  qrValue: string;
  qrApiUrl: string | null;
  storedQrImageUrl: string | null;
  generatedAt: string;
};

export type RewardScheme = {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  category: string;
  imageUrl?: string | null;
  mrp?: number | null;
  active: boolean;
};

export type FestivalTheme = {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  bgColor: string;
  cardColor: string;
  textColor: string;
};

export type ActiveFestival = {
  active: boolean;
  source: string;
  timezone: string;
  currentDate: string;
  serverTime: string;
  id: string | null;
  name: string | null;
  slug: string | null;
  greeting: string | null;
  subGreeting: string | null;
  emoji: string | null;
  bannerEmojis: string;
  particleEmojis: string;
  theme: FestivalTheme;
  startDate: string | null;
  endDate: string | null;
};
