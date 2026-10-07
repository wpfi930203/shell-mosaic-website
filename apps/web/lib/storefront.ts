import type {
  Address,
  CartItemInput,
  CurrencyCode,
  DiscountCode,
  Order,
  OrderDiscountSnapshot,
  OrderItem,
  PaymentMethod,
  Product,
  ProductReview,
  PurchaseMode,
  ShippingMethod,
  SiteData,
} from "@/lib/types";

export interface ProductFilterParams {
  materials?: string[];
  patterns?: string[];
  colors?: string[];
  applications?: string[];
  sort?: "latest" | "price_asc" | "price_desc";
}

export interface DiscountValidationResult {
  code?: DiscountCode;
  message?: string;
}

export interface CartTotals {
  subtotal: number;
  shippingBase: number;
  shipping: number;
  discount: number;
  total: number;
  appliedDiscount?: OrderDiscountSnapshot;
}

export function filterProducts(
  products: Product[],
  params: ProductFilterParams,
): Product[] {
  const { materials = [], patterns = [], colors = [], applications = [], sort } = params;

  const filtered = products.filter((product) => {
    const matchesMaterials =
      materials.length === 0 ||
      materials.every((value) => product.materials.includes(value));
    const matchesPatterns =
      patterns.length === 0 ||
      patterns.every((value) => product.patterns.includes(value));
    const matchesColors =
      colors.length === 0 || colors.every((value) => product.colors.includes(value));
    const matchesApplications =
      applications.length === 0 ||
      applications.every((value) => product.applications.includes(value));

    return (
      matchesMaterials &&
      matchesPatterns &&
      matchesColors &&
      matchesApplications
    );
  });

  if (sort === "price_asc") {
    return filtered.toSorted((a, b) => getSortPrice(a) - getSortPrice(b));
  }

  if (sort === "price_desc") {
    return filtered.toSorted((a, b) => getSortPrice(b) - getSortPrice(a));
  }

  return filtered.toSorted((a, b) => a.name.localeCompare(b.name));
}

export function calculateShippingQuote(
  items: CartItemInput[],
  products: Product[],
  shippingMethod: ShippingMethod,
  freeShippingThreshold: number,
): { subtotal: number; shipping: number; total: number } {
  const totals = calculateCartTotals(items, products, shippingMethod, freeShippingThreshold);

  return {
    subtotal: totals.subtotal,
    shipping: totals.shipping,
    total: totals.total,
  };
}

export function getApplicableShippingMethods(
  items: CartItemInput[],
  shippingMethods: ShippingMethod[],
): ShippingMethod[] {
  const hasStandard = items.some(
    (item) => item.pricingMode === "box" || item.pricingMode === "piece",
  );
  const hasSample = items.some((item) => item.pricingMode === "sample");

  if (hasStandard && !hasSample) {
    return shippingMethods.filter(
      (method) => method.enabled && method.shippingGroup === "standard",
    );
  }

  if (hasSample && !hasStandard) {
    return shippingMethods.filter(
      (method) => method.enabled && method.shippingGroup === "sample",
    );
  }

  return shippingMethods.filter((method) => method.enabled);
}

export function getBoxCount(items: CartItemInput[], products: Product[]): number {
  return items.reduce((sum, item) => {
    if (item.pricingMode !== "box") {
      return sum;
    }

    const product = products.find((candidate) => candidate.id === item.productId);
    if (!product) {
      return sum;
    }

    const pricing = getProductPricing(product, item.variantId);
    if (!pricing.hasPackPricing) {
      return sum;
    }

    return sum + item.quantity;
  }, 0);
}

export function calculateCartTotals(
  items: CartItemInput[],
  products: Product[],
  shippingMethod: ShippingMethod,
  freeShippingThreshold: number,
  discountCodes: DiscountCode[] = [],
  discountCodeInput?: string,
): CartTotals {
  const subtotal = items.reduce((sum, item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    if (!product) {
      return sum;
    }

    return sum + getUnitPrice(product, item.pricingMode, item.variantId) * item.quantity;
  }, 0);

  const effectiveFreeThreshold =
    shippingMethod.freeThreshold > 0 ? shippingMethod.freeThreshold : freeShippingThreshold;
  const boxCount = getBoxCount(items, products);
  const shippingMultiplier = boxCount > 0 ? boxCount : 1;
  const shippingBase =
    subtotal >= effectiveFreeThreshold ? 0 : shippingMethod.price * shippingMultiplier;
  const resolvedDiscount = resolveDiscountCode(discountCodes, discountCodeInput, subtotal);

  let shipping = shippingBase;
  let discount = 0;
  let appliedDiscount: OrderDiscountSnapshot | undefined;

  if (resolvedDiscount.code) {
    const discountCode = resolvedDiscount.code;
    discount =
      discountCode.type === "percentage"
        ? roundMoney((subtotal * discountCode.value) / 100)
        : discountCode.type === "fixed"
          ? Math.min(subtotal, roundMoney(discountCode.value))
          : shippingBase;

    if (discountCode.type === "free_shipping") {
      shipping = 0;
    }

    appliedDiscount = {
      code: discountCode.code,
      type: discountCode.type,
      value: discountCode.value,
      amount: discount,
    };
  }

  return {
    subtotal: roundMoney(subtotal),
    shippingBase: roundMoney(shippingBase),
    shipping: roundMoney(shipping),
    discount: roundMoney(discount),
    total: roundMoney(Math.max(0, subtotal + shippingBase - discount)),
    appliedDiscount,
  };
}

export function resolveDiscountCode(
  discountCodes: DiscountCode[],
  discountCodeInput: string | undefined,
  subtotal: number,
): DiscountValidationResult {
  const normalizedCode = discountCodeInput?.trim().toUpperCase();
  if (!normalizedCode) {
    return {};
  }

  const discountCode = discountCodes.find(
    (candidate) => candidate.code.trim().toUpperCase() === normalizedCode,
  );
  if (!discountCode) {
    return { message: "Discount code was not found." };
  }

  if (!discountCode.isActive) {
    return { message: "Discount code is disabled." };
  }

  const now = Date.now();
  const startsAt = discountCode.startsAt ? new Date(discountCode.startsAt).getTime() : 0;
  const expiresAt = discountCode.expiresAt ? new Date(discountCode.expiresAt).getTime() : 0;

  if (startsAt && now < startsAt) {
    return { message: "Discount code is not active yet." };
  }

  if (expiresAt && now > expiresAt) {
    return { message: "Discount code has expired." };
  }

  if (discountCode.usageLimit > 0 && discountCode.usedCount >= discountCode.usageLimit) {
    return { message: "Discount code usage limit has been reached." };
  }

  if (subtotal < discountCode.minOrder) {
    return {
      message: `Discount code requires a minimum order of ${discountCode.minOrder.toFixed(2)}.`,
    };
  }

  return { code: discountCode };
}

export function createOrderDraft(
  siteData: SiteData,
  input: {
    customerName: string;
    customerEmail: string;
    shippingAddress: Address;
    shippingMethodId: string;
    paymentMethod: PaymentMethod;
    items: CartItemInput[];
    currency: CurrencyCode;
    discountCode?: string;
  },
): Order {
  const shippingMethod = siteData.shippingMethods.find(
    (method) => method.id === input.shippingMethodId,
  );

  if (!shippingMethod) {
    throw new Error("Invalid shipping method.");
  }

  const totals = calculateCartTotals(
    input.items,
    siteData.products,
    shippingMethod,
    siteData.settings.freeShippingThreshold,
    siteData.discountCodes,
    input.discountCode,
  );

  const items: OrderItem[] = input.items.map((item) => {
    const product = siteData.products.find((candidate) => candidate.id === item.productId);
    if (!product) {
      throw new Error("One or more products were not found.");
    }

    const variant = getProductVariant(product, item.variantId);
    const pricingMode = getEffectivePricingMode(product, item.pricingMode, item.variantId);
    const unitPrice = getUnitPrice(product, pricingMode, item.variantId);
    const calculatedPieceQuantity =
      pricingMode === "box"
        ? item.quantity * getPackQuantity(product, item.variantId)
        : item.quantity;

    return {
      productId: product.id,
      productName: product.name,
      sku: variant?.sku || product.sku,
      variantId: variant?.id,
      variantName: variant?.name,
      quantity: item.quantity,
      unitPrice,
      pricingMode,
      piecePrice: getProductPricing(product, item.variantId).piecePrice,
      boxPrice: getProductPricing(product, item.variantId).boxPrice,
      packQuantity: getPackQuantity(product, item.variantId),
      samplePrice: getProductPricing(product, item.variantId).samplePrice,
      calculatedPieceQuantity,
    };
  });

  const nextSequence = siteData.orders.length + 1003;
  const id = `order-${nextSequence}`;
  return {
    id,
    orderNo: `LT-${nextSequence}`,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    status: "pending",
    paymentStatus: "pending",
    paymentMethod: input.paymentMethod,
    items,
    shippingMethodId: shippingMethod.id,
    shippingMethodName: shippingMethod.name,
    shippingMethodDescription: shippingMethod.description,
    shippingMode: shippingMethod.shippingMode,
    shippingAmount: totals.shipping,
    discountCode: totals.appliedDiscount?.code,
    discountAmount: totals.discount,
    subtotalAmount: totals.subtotal,
    totalAmount: totals.total,
    currency: input.currency,
    shippingAddress: normalizeAddress(input.shippingAddress),
    trackingNumber: "",
    carrierName: "",
    trackingUrl: "",
    logisticsNotes: "",
    shippedAt: "",
    confirmationEmailSentAt: "",
    createdAt: new Date().toISOString(),
  };
}

function getSortPrice(product: Product) {
  const pricing = getProductPricing(product);
  return pricing.hasPackPricing ? pricing.boxPrice : pricing.piecePrice;
}

export function getProductVariant(product: Product, variantId?: string) {
  const enabledVariants = (product.variants ?? []).filter((variant) => variant.enabled);

  if (enabledVariants.length === 0) {
    return undefined;
  }

  if (variantId) {
    const matched = enabledVariants.find((variant) => variant.id === variantId);
    if (matched) {
      return matched;
    }
  }

  return (
    enabledVariants.find((variant) => variant.isDefault) ??
    enabledVariants[0]
  );
}

export function getProductPricing(product: Product, variantId?: string) {
  const variant = getProductVariant(product, variantId);
  const piecePrice = variant?.piecePrice ?? product.piecePrice;
  const boxPrice = variant?.boxPrice ?? product.boxPrice;
  const packQuantity = normalizePackQuantity(variant?.packQuantity ?? product.packQuantity);
  const stockQty = variant?.stockQty ?? product.stockQty;
  const sku = variant?.sku || product.sku;
  const samplePrice = normalizePrice(product.samplePrice ?? 0);
  const sampleLabel = product.sampleLabel?.trim() || "Order Swatch Sample";
  const compareAtPrice = normalizePrice(product.compareAtPrice ?? 0);

  return {
    piecePrice,
    boxPrice,
    compareAtPrice,
    packQuantity,
    samplePrice,
    sampleLabel,
    stockQty,
    sku,
    variant,
    hasPackPricing: packQuantity > 1 && boxPrice > 0,
    hasSamplePricing: samplePrice > 0,
  };
}

function getEffectivePricingMode(
  product: Product,
  pricingMode: PurchaseMode,
  variantId?: string,
) {
  if (pricingMode === "sample" && getProductPricing(product, variantId).hasSamplePricing) {
    return "sample";
  }

  return pricingMode === "box" && getPackQuantity(product, variantId) > 1 ? "box" : "piece";
}

function getPackQuantity(product: Product, variantId?: string) {
  return normalizePackQuantity(getProductPricing(product, variantId).packQuantity);
}

function normalizePackQuantity(value: number) {
  return Number.isInteger(value) && value > 1 ? value : 0;
}

export function getMaxPurchasableQuantity(
  product: Product,
  pricingMode: PurchaseMode,
  variantId?: string,
) {
  const pricing = getProductPricing(product, variantId);

  if (pricingMode === "box") {
    if (!pricing.hasPackPricing || pricing.packQuantity <= 0) {
      return 0;
    }

    return Math.max(0, Math.floor(pricing.stockQty / pricing.packQuantity));
  }

  return Math.max(0, pricing.stockQty);
}

export function getUnitPrice(product: Product, pricingMode: PurchaseMode, variantId?: string) {
  const pricing = getProductPricing(product, variantId);
  if (pricingMode === "sample" && pricing.hasSamplePricing) {
    return pricing.samplePrice;
  }

  return pricingMode === "box" && pricing.hasPackPricing ? pricing.boxPrice : pricing.piecePrice;
}

export function getProductReviewSummary(
  productId: string,
  reviews: ProductReview[],
): {
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>;
} {
  const approved = reviews.filter(
    (review) => review.productId === productId && review.status === "approved",
  );

  const totalReviews = approved.length;
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  approved.forEach((review) => {
    distribution[review.rating as 1 | 2 | 3 | 4 | 5] += 1;
  });

  const averageRating =
    totalReviews === 0
      ? 0
      : approved.reduce((sum, review) => sum + review.rating, 0) / totalReviews;

  return {
    averageRating,
    totalReviews,
    distribution,
  };
}

export function canSubmitReview(
  siteData: SiteData,
  input: { productId: string; orderId: string; email: string },
): boolean {
  const order = siteData.orders.find(
    (candidate) =>
      candidate.id === input.orderId &&
      candidate.customerEmail.toLowerCase() === input.email.toLowerCase(),
  );

  if (!order) return false;

  const purchased = order.items.some((item) => item.productId === input.productId);
  if (!purchased) return false;

  const alreadyReviewed = siteData.reviews.some(
    (review) =>
      review.productId === input.productId &&
      review.orderId === input.orderId &&
      review.customerEmail.toLowerCase() === input.email.toLowerCase(),
  );

  return !alreadyReviewed;
}

function normalizeAddress(address: Address): Address {
  return {
    fullName: address.fullName?.trim() ?? "",
    email: address.email?.trim() ?? "",
    phone: address.phone?.trim() ?? "",
    addressLine1: address.addressLine1?.trim() ?? "",
    addressLine2: address.addressLine2?.trim() ?? "",
    city: address.city?.trim() ?? "",
    state: address.state?.trim() ?? "",
    postalCode: address.postalCode?.trim() ?? "",
    country: address.country?.trim() ?? "",
  };
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function normalizePrice(value: number) {
  return Number.isFinite(value) && value > 0 ? value : 0;
}
