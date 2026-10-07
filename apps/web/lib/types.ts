export type LocaleCode = "en" | "fr" | "pt" | "de" | "ja" | "zh";
export type CurrencyCode = "USD" | "EUR";
export type PaymentMethod = "paypal" | "credit_card";
export type PurchaseMode = "piece" | "box" | "sample";
export type ShippingMode =
  | "international_express"
  | "air_freight"
  | "sea_freight"
  | "sample_courier";
export type ShippingGroup = "standard" | "sample";
export type DiscountType = "percentage" | "fixed" | "free_shipping";
export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "completed";
export type ReviewStatus = "pending" | "approved" | "rejected";
export type LocalizedText = Partial<Record<LocaleCode, string>>;

export interface SiteSettings {
  brandName: string;
  logoType: "text" | "image";
  logoText: string;
  logoPath: string;
  logoWidth: number;
  logoHeight: number;
  storeName: string;
  storeNameTranslations?: LocalizedText;
  storeNameFontFamily: string;
  storeNameFontSize: number;
  storeNameColor: string;
  defaultLocale: LocaleCode;
  defaultCurrency: CurrencyCode;
  enabledLocales: LocaleCode[];
  enabledCurrencies: CurrencyCode[];
  paypalEnabled: boolean;
  creditCardEnabled: boolean;
  paypalMerchantEmail: string;
  paypalClientId: string;
  paypalClientSecret: string;
  freeShippingThreshold: number;
  vatLabel: string;
  checkoutSupportEmail: string;
  orderNotificationsEnabled: boolean;
  notificationSenderEmail: string;
  notificationReplyToEmail: string;
  orderNotificationRecipient: string;
  shippingPromotionText: string;
  purchaseAdviceText: string;
  cookieConsentEnabled: boolean;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
}

export interface MenuItem {
  id: string;
  label: string;
  labelTranslations?: LocalizedText;
  href: string;
  enabled: boolean;
  fontSize: number;
  fontWeight: number;
  color: string;
  children?: MenuItem[];
}

export interface FooterSection {
  id: string;
  title: string;
  titleTranslations?: LocalizedText;
  links: {
    id: string;
    label: string;
    labelTranslations?: LocalizedText;
    href: string;
  }[];
}

export interface FilterGroup {
  key: "materials" | "patterns" | "colors" | "applications";
  label: string;
  labelTranslations?: LocalizedText;
  enabled: boolean;
  options: {
    id: string;
    label: string;
    labelTranslations?: LocalizedText;
    enabled: boolean;
    sortOrder: number;
  }[];
}

export interface ProductImage {
  id: string;
  path: string;
  alt: string;
  type: "main" | "detail";
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  piecePrice: number;
  boxPrice: number;
  packQuantity: number;
  stockQty: number;
  images?: ProductImage[];
  enabled: boolean;
  isDefault?: boolean;
}

export interface ProductReview {
  id: string;
  productId: string;
  orderId: string;
  customerEmail: string;
  customerName: string;
  rating: number;
  content: string;
  status: ReviewStatus;
  verifiedPurchase: boolean;
  images: string[];
  createdAt: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  nameTranslations?: LocalizedText;
  shortDescription: string;
  shortDescriptionTranslations?: LocalizedText;
  descriptionHtml: string;
  descriptionHtmlTranslations?: LocalizedText;
  piecePrice: number;
  boxPrice: number;
  compareAtPrice?: number;
  packQuantity: number;
  samplePrice?: number;
  sampleLabel?: string;
  stockQty: number;
  lowStockThreshold: number;
  sku: string;
  materials: string[];
  patterns: string[];
  colors: string[];
  applications: string[];
  featured: boolean;
  images: ProductImage[];
  variants?: ProductVariant[];
}

export interface Banner {
  id: string;
  title: string;
  titleTranslations?: LocalizedText;
  subtitle: string;
  subtitleTranslations?: LocalizedText;
  image: string;
  href: string;
  enabled: boolean;
  sortOrder: number;
}

export interface GalleryItem {
  id: string;
  title: string;
  titleTranslations?: LocalizedText;
  category: string;
  categoryTranslations?: LocalizedText;
  image: string;
  description: string;
  descriptionTranslations?: LocalizedText;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  freeThreshold: number;
  displayOrder: number;
  shippingMode: ShippingMode;
  shippingGroup: ShippingGroup;
  trackingUrlTemplate?: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DiscountCode {
  id: string;
  code: string;
  type: DiscountType;
  value: number;
  minOrder: number;
  startsAt: string;
  expiresAt: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItemInput {
  productId: string;
  variantId?: string;
  quantity: number;
  pricingMode: PurchaseMode;
}

export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  pricingMode: PurchaseMode;
  piecePrice: number;
  boxPrice: number;
  packQuantity: number;
  samplePrice?: number;
  calculatedPieceQuantity: number;
}

export interface Address {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderDiscountSnapshot {
  code: string;
  type: DiscountType;
  value: number;
  amount: number;
}

export interface Order {
  id: string;
  orderNo: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  paymentStatus: "pending" | "paid";
  paymentMethod: PaymentMethod;
  items: OrderItem[];
  shippingMethodId: string;
  shippingMethodName: string;
  shippingMethodDescription: string;
  shippingMode: ShippingMode;
  shippingAmount: number;
  discountCode?: string;
  discountAmount: number;
  subtotalAmount: number;
  totalAmount: number;
  currency: CurrencyCode;
  shippingAddress: Address;
  trackingNumber: string;
  carrierName: string;
  trackingUrl: string;
  logisticsNotes: string;
  shippedAt: string;
  confirmationEmailSentAt?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  registeredAt: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  applicationScene: string;
  budgetRange: string;
  referenceImagePaths: string[];
  createdAt: string;
}

export interface PageBlock {
  id: string;
  type: "hero" | "product-grid" | "rich-text" | "gallery";
  title: string;
  titleTranslations?: LocalizedText;
  content: string;
  contentTranslations?: LocalizedText;
  imagePath?: string;
}

export interface ManagedPage {
  id: string;
  name: string;
  nameTranslations?: LocalizedText;
  slug: string;
  thumbnail: string;
  blocks: PageBlock[];
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export interface EmailLog {
  id: string;
  templateId: string;
  orderId?: string;
  fromEmail: string;
  replyToEmail: string;
  toEmail: string;
  subject: string;
  body: string;
  status: "queued" | "sent";
  createdAt: string;
}

export interface SiteData {
  settings: SiteSettings;
  mainMenu: MenuItem[];
  footerSections: FooterSection[];
  socialLinks: { id: string; label: string; href: string }[];
  filterGroups: FilterGroup[];
  products: Product[];
  banners: Banner[];
  galleryItems: GalleryItem[];
  shippingMethods: ShippingMethod[];
  discountCodes: DiscountCode[];
  reviews: ProductReview[];
  orders: Order[];
  customers: Customer[];
  inquiries: Inquiry[];
  managedPages: ManagedPage[];
  emailTemplates: EmailTemplate[];
  emailLogs: EmailLog[];
}
