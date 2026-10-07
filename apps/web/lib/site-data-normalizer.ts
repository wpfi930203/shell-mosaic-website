import type {
  DiscountCode,
  EmailLog,
  EmailTemplate,
  FilterGroup,
  Order,
  Product,
  ProductImage,
  ProductVariant,
  ShippingMethod,
  SiteData,
} from "@/lib/types";

type ProductCategoryKey = "materials" | "patterns" | "colors" | "applications";

export function normalizeSiteData(siteData: SiteData): SiteData {
  return {
    ...siteData,
    settings: normalizeSettings(siteData.settings),
    shippingMethods: normalizeShippingMethods(siteData.shippingMethods),
    discountCodes: normalizeDiscountCodes(siteData.discountCodes),
    emailTemplates: normalizeEmailTemplates(siteData.emailTemplates),
    emailLogs: normalizeEmailLogs(siteData.emailLogs),
    orders: normalizeOrders(siteData),
    products: siteData.products.map((product) =>
      normalizeProduct(product, siteData.filterGroups),
    ),
  };
}

export function normalizeProduct(product: Product, filterGroups: FilterGroup[]): Product {
  const allowedValues = buildAllowedValueMap(filterGroups);
  const variants = normalizeVariants(product.variants);

  return {
    ...product,
    piecePrice: normalizePrice(product.piecePrice),
    boxPrice: normalizePrice(product.boxPrice),
    compareAtPrice: normalizePrice(product.compareAtPrice ?? 0),
    packQuantity: normalizePackQuantity(product.packQuantity),
    samplePrice: normalizePrice(product.samplePrice ?? 0),
    sampleLabel:
      typeof product.sampleLabel === "string" && product.sampleLabel.trim()
        ? product.sampleLabel.trim()
        : "Order Swatch Sample",
    stockQty: normalizeNonNegativeNumber(product.stockQty),
    lowStockThreshold: normalizeNonNegativeNumber(product.lowStockThreshold),
    images: normalizeProductImages(product.images),
    materials: normalizeCategoryValues(product.materials, allowedValues.materials),
    patterns: normalizeCategoryValues(product.patterns, allowedValues.patterns),
    colors: normalizeCategoryValues(product.colors, allowedValues.colors),
    applications: normalizeCategoryValues(product.applications, allowedValues.applications),
    variants,
  };
}

function normalizeSettings(settings: SiteData["settings"]): SiteData["settings"] {
  return {
    ...settings,
    vatLabel: typeof settings.vatLabel === "string" ? settings.vatLabel : "VAT included",
    checkoutSupportEmail:
      typeof settings.checkoutSupportEmail === "string" ? settings.checkoutSupportEmail : "",
    orderNotificationsEnabled: settings.orderNotificationsEnabled ?? true,
    notificationSenderEmail:
      typeof settings.notificationSenderEmail === "string"
        ? settings.notificationSenderEmail
        : "",
    notificationReplyToEmail:
      typeof settings.notificationReplyToEmail === "string"
        ? settings.notificationReplyToEmail
        : "",
    orderNotificationRecipient:
      typeof settings.orderNotificationRecipient === "string"
        ? settings.orderNotificationRecipient
        : "",
    shippingPromotionText:
      typeof settings.shippingPromotionText === "string"
        ? settings.shippingPromotionText
        : "Spend {amount} more to get free shipping.",
    purchaseAdviceText:
      typeof settings.purchaseAdviceText === "string"
        ? settings.purchaseAdviceText
        : "We recommend adding 10% extra for cuts and breakages.",
  };
}

function buildAllowedValueMap(filterGroups: FilterGroup[]) {
  return {
    materials: getGroupValues(filterGroups, "materials"),
    patterns: getGroupValues(filterGroups, "patterns"),
    colors: getGroupValues(filterGroups, "colors"),
    applications: getGroupValues(filterGroups, "applications"),
  };
}

function getGroupValues(filterGroups: FilterGroup[], key: ProductCategoryKey) {
  const group = filterGroups.find((candidate) => candidate.key === key);
  return new Set((group?.options ?? []).map((option) => option.label));
}

function normalizeCategoryValues(values: string[] | undefined, allowedValues: Set<string>) {
  return Array.from(
    new Set((values ?? []).filter((value) => typeof value === "string" && allowedValues.has(value))),
  );
}

function normalizeVariants(variants: ProductVariant[] | undefined): ProductVariant[] {
  const normalized = (variants ?? []).map((variant) => ({
    ...variant,
    piecePrice: normalizePrice(variant.piecePrice),
    boxPrice: normalizePrice(variant.boxPrice),
    packQuantity: normalizePackQuantity(variant.packQuantity),
    stockQty: normalizeNonNegativeNumber(variant.stockQty),
    images: normalizeProductImages(variant.images),
    enabled: variant.enabled ?? true,
    isDefault: variant.isDefault ?? false,
  }));

  const defaultVariantId =
    normalized.find((variant) => variant.enabled && variant.isDefault)?.id ??
    normalized.find((variant) => variant.enabled)?.id;

  return normalized.map((variant) => ({
    ...variant,
    isDefault: variant.id === defaultVariantId,
  }));
}

function normalizeProductImages(images: ProductImage[] | undefined): ProductImage[] {
  return (images ?? []).map((image, index) => ({
    ...image,
    alt: typeof image.alt === "string" ? image.alt : "",
    type: image.type === "detail" ? "detail" : "main",
    sortOrder:
      Number.isFinite(image.sortOrder) && image.sortOrder > 0 ? Math.floor(image.sortOrder) : index + 1,
  }));
}

function normalizeShippingMethods(
  shippingMethods: ShippingMethod[] | undefined,
): ShippingMethod[] {
  return (shippingMethods ?? [])
    .map((method, index): ShippingMethod => ({
      ...method,
      description: typeof method.description === "string" ? method.description : "",
      price: normalizePrice(method.price),
      freeThreshold: normalizeNonNegativeNumber(method.freeThreshold),
      displayOrder:
        Number.isFinite(method.displayOrder) && method.displayOrder >= 0
          ? Math.floor(method.displayOrder)
          : index,
      shippingMode: normalizeShippingMode(method.shippingMode),
      shippingGroup: normalizeShippingGroup(method.shippingGroup, method.shippingMode),
      trackingUrlTemplate:
        typeof method.trackingUrlTemplate === "string" ? method.trackingUrlTemplate : "",
      enabled: method.enabled ?? true,
      createdAt: typeof method.createdAt === "string" ? method.createdAt : new Date(0).toISOString(),
      updatedAt:
        typeof method.updatedAt === "string" ? method.updatedAt : typeof method.createdAt === "string"
          ? method.createdAt
          : new Date(0).toISOString(),
    }))
    .toSorted((a, b) => a.displayOrder - b.displayOrder);
}

function normalizeDiscountCodes(discountCodes: DiscountCode[] | undefined) {
  return (discountCodes ?? []).map((code) => ({
    ...code,
    code: typeof code.code === "string" ? code.code.trim().toUpperCase() : "",
    type:
      code.type === "percentage" || code.type === "fixed" || code.type === "free_shipping"
        ? code.type
        : "percentage",
    value: normalizeNonNegativeNumber(code.value),
    minOrder: normalizeNonNegativeNumber(code.minOrder),
    startsAt: typeof code.startsAt === "string" ? code.startsAt : "",
    expiresAt: typeof code.expiresAt === "string" ? code.expiresAt : "",
    usageLimit: normalizeNonNegativeNumber(code.usageLimit),
    usedCount: normalizeNonNegativeNumber(code.usedCount),
    isActive: code.isActive ?? true,
    createdAt: typeof code.createdAt === "string" ? code.createdAt : new Date(0).toISOString(),
    updatedAt:
      typeof code.updatedAt === "string" ? code.updatedAt : typeof code.createdAt === "string"
        ? code.createdAt
        : new Date(0).toISOString(),
  }));
}

function normalizeEmailTemplates(emailTemplates: EmailTemplate[] | undefined) {
  return (emailTemplates ?? []).map((template, index) => ({
    id: typeof template.id === "string" ? template.id : `mail-template-${index + 1}`,
    name: typeof template.name === "string" ? template.name : `Template ${index + 1}`,
    subject: typeof template.subject === "string" ? template.subject : "",
    body: typeof template.body === "string" ? template.body : "",
  }));
}

function normalizeEmailLogs(emailLogs: EmailLog[] | undefined): EmailLog[] {
  return (emailLogs ?? []).map((log, index) => ({
    id: typeof log.id === "string" ? log.id : `mail-log-${index + 1}`,
    templateId: typeof log.templateId === "string" ? log.templateId : "",
    orderId: typeof log.orderId === "string" ? log.orderId : undefined,
    fromEmail: typeof log.fromEmail === "string" ? log.fromEmail : "",
    replyToEmail: typeof log.replyToEmail === "string" ? log.replyToEmail : "",
    toEmail: typeof log.toEmail === "string" ? log.toEmail : "",
    subject: typeof log.subject === "string" ? log.subject : "",
    body: typeof log.body === "string" ? log.body : "",
    status: log.status === "queued" ? "queued" : "sent",
    createdAt: typeof log.createdAt === "string" ? log.createdAt : new Date(0).toISOString(),
  }));
}

function normalizeOrders(siteData: SiteData): Order[] {
  const shippingMethods = normalizeShippingMethods(siteData.shippingMethods);

  return (siteData.orders ?? []).map((order): Order => {
    const shippingMethod = shippingMethods.find((method) => method.id === order.shippingMethodId);

    return {
      ...order,
      items: (order.items ?? []).map((item) => ({
        ...item,
        quantity: Math.max(1, normalizeNonNegativeNumber(item.quantity)),
        unitPrice: normalizePrice(item.unitPrice),
        pricingMode:
          item.pricingMode === "box" || item.pricingMode === "sample"
            ? item.pricingMode
            : "piece",
        piecePrice: normalizePrice(item.piecePrice),
        boxPrice: normalizePrice(item.boxPrice),
        packQuantity: normalizePackQuantity(item.packQuantity),
        samplePrice: normalizePrice(item.samplePrice ?? 0),
        calculatedPieceQuantity: Math.max(0, normalizeNonNegativeNumber(item.calculatedPieceQuantity)),
      })),
      shippingMethodName: order.shippingMethodName || shippingMethod?.name || "",
      shippingMethodDescription:
        order.shippingMethodDescription || shippingMethod?.description || "",
      // The shipping method is the source of truth for the logistics classification,
      // so a resolvable method wins over a stale value stored on the order. Name and
      // description above stay as historical snapshots of what the buyer saw.
      shippingMode: normalizeShippingMode(shippingMethod?.shippingMode ?? order.shippingMode),
      shippingAmount: normalizePrice(order.shippingAmount),
      discountCode:
        typeof order.discountCode === "string" && order.discountCode.trim()
          ? order.discountCode.trim().toUpperCase()
          : "",
      discountAmount: normalizePrice(order.discountAmount ?? 0),
      subtotalAmount: normalizePrice(order.subtotalAmount),
      totalAmount: normalizePrice(order.totalAmount),
      shippingAddress: normalizeOrderAddress(order),
      trackingUrl: typeof order.trackingUrl === "string" ? order.trackingUrl : "",
      logisticsNotes: typeof order.logisticsNotes === "string" ? order.logisticsNotes : "",
      shippedAt: typeof order.shippedAt === "string" ? order.shippedAt : "",
      confirmationEmailSentAt:
        typeof order.confirmationEmailSentAt === "string" ? order.confirmationEmailSentAt : "",
    };
  });
}

function normalizeOrderAddress(order: Order) {
  return {
    fullName: order.shippingAddress?.fullName || order.customerName || "",
    email: order.shippingAddress?.email || order.customerEmail || "",
    phone: order.shippingAddress?.phone || "",
    addressLine1: order.shippingAddress?.addressLine1 || "",
    addressLine2: order.shippingAddress?.addressLine2 || "",
    city: order.shippingAddress?.city || "",
    state: order.shippingAddress?.state || "",
    postalCode: order.shippingAddress?.postalCode || "",
    country: order.shippingAddress?.country || "",
  };
}

function normalizeShippingMode(value: string | undefined) {
  if (
    value === "international_express" ||
    value === "air_freight" ||
    value === "sea_freight" ||
    value === "sample_courier"
  ) {
    return value;
  }

  return "international_express";
}

function normalizeShippingGroup(value: string | undefined, shippingMode: string) {
  if (value === "standard" || value === "sample") {
    return value;
  }

  return shippingMode === "sample_courier" ? "sample" : "standard";
}

function normalizePrice(value: number) {
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function normalizeNonNegativeNumber(value: number) {
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function normalizePackQuantity(value: number) {
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}
