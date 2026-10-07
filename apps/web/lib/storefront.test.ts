import { describe, expect, it } from "vitest";

import {
  calculateCartTotals,
  calculateShippingQuote,
  canSubmitReview,
  createOrderDraft,
  filterProducts,
  resolveDiscountCode,
} from "./storefront";
import type { SiteData } from "./types";

const siteData: SiteData = {
  settings: {
    brandName: "Lansic Tiles",
    logoType: "text",
    logoText: "Lansic",
    logoPath: "",
    logoWidth: 160,
    logoHeight: 56,
    storeName: "Lansic Tiles",
    storeNameFontFamily: "Cormorant Garamond",
    storeNameFontSize: 28,
    storeNameColor: "#1f3c34",
    defaultLocale: "en",
    defaultCurrency: "USD",
    enabledLocales: ["en", "zh", "fr", "pt", "de", "ja"],
    enabledCurrencies: ["USD", "EUR"],
    paypalEnabled: true,
    creditCardEnabled: true,
    paypalMerchantEmail: "",
    paypalClientId: "",
    paypalClientSecret: "",
    freeShippingThreshold: 100,
    vatLabel: "VAT included",
    checkoutSupportEmail: "support@example.com",
    orderNotificationsEnabled: true,
    notificationSenderEmail: "orders@example.com",
    notificationReplyToEmail: "support@example.com",
    orderNotificationRecipient: "owner@example.com",
    shippingPromotionText: "Spend {amount} more to get free shipping.",
    purchaseAdviceText: "Add 10% extra for cuts and breakages.",
    cookieConsentEnabled: true,
    seoTitle: "",
    seoDescription: "",
    seoKeywords: [],
  },
  mainMenu: [],
  footerSections: [],
  socialLinks: [],
  filterGroups: [],
  products: [
    {
      id: "prod-carrara-fan",
      slug: "carrara-fan-marble-mosaic",
      name: "Carrara Fan Marble Mosaic",
      shortDescription: "",
      descriptionHtml: "",
      piecePrice: 1.85,
      boxPrice: 84,
      compareAtPrice: 99,
      packQuantity: 58,
      samplePrice: 8,
      sampleLabel: "Order Swatch Sample",
      stockQty: 88,
      lowStockThreshold: 12,
      sku: "LT-CFM-001",
      materials: ["Marble"],
      patterns: ["Fan Shape"],
      colors: ["White & Beige"],
      applications: ["Indoor"],
      featured: true,
      images: [],
      variants: [],
    },
    {
      id: "prod-emerald-hex",
      slug: "emerald-glass-hexagon-tile",
      name: "Emerald Glass Hexagon Tile",
      shortDescription: "",
      descriptionHtml: "",
      piecePrice: 1.25,
      boxPrice: 58,
      compareAtPrice: 72,
      packQuantity: 58,
      samplePrice: 6,
      sampleLabel: "Order Swatch Sample",
      stockQty: 24,
      lowStockThreshold: 10,
      sku: "LT-EGH-014",
      materials: ["Glass"],
      patterns: ["Hexagon"],
      colors: ["Blue & Green"],
      applications: ["Indoor", "Outdoor"],
      featured: true,
      images: [],
      variants: [
        {
          id: "variant-emerald-gloss",
          name: "Gloss Finish",
          sku: "LT-EGH-014-GLOSS",
          piecePrice: 1.35,
          boxPrice: 62,
          packQuantity: 60,
          stockQty: 12,
          enabled: true,
          isDefault: true,
        },
      ],
    },
  ],
  banners: [],
  galleryItems: [],
  shippingMethods: [
    {
      id: "ship-standard",
      name: "International Express",
      description: "3-7 business days",
      price: 18,
      freeThreshold: 100,
      displayOrder: 1,
      shippingMode: "international_express",
      shippingGroup: "standard",
      trackingUrlTemplate: "https://www.17track.net/en/track?nums={trackingNumber}",
      enabled: true,
      createdAt: "2026-06-01T00:00:00.000Z",
      updatedAt: "2026-06-21T00:00:00.000Z",
    },
  ],
  discountCodes: [
    {
      id: "discount-welcome10",
      code: "WELCOME10",
      type: "percentage",
      value: 10,
      minOrder: 50,
      startsAt: "2026-06-01T00:00:00.000Z",
      expiresAt: "",
      usageLimit: 0,
      usedCount: 0,
      isActive: true,
      createdAt: "2026-06-01T00:00:00.000Z",
      updatedAt: "2026-06-21T00:00:00.000Z",
    },
    {
      id: "discount-freeship",
      code: "FREESHIP",
      type: "free_shipping",
      value: 0,
      minOrder: 50,
      startsAt: "2026-06-01T00:00:00.000Z",
      expiresAt: "",
      usageLimit: 0,
      usedCount: 0,
      isActive: true,
      createdAt: "2026-06-01T00:00:00.000Z",
      updatedAt: "2026-06-21T00:00:00.000Z",
    },
  ],
  reviews: [
    {
      id: "review-1",
      productId: "prod-carrara-fan",
      orderId: "order-1001",
      customerEmail: "sophia@atelierhouse.com",
      customerName: "Sophia L.",
      rating: 5,
      content: "Beautiful veining.",
      status: "approved",
      verifiedPurchase: true,
      images: [],
      createdAt: "2026-06-10T08:00:00.000Z",
    },
  ],
  orders: [
    {
      id: "order-1001",
      orderNo: "LT-1001",
      customerName: "Sophia L.",
      customerEmail: "sophia@atelierhouse.com",
      status: "completed",
      paymentStatus: "paid",
      paymentMethod: "paypal",
      items: [
        {
          productId: "prod-carrara-fan",
          productName: "Carrara Fan Marble Mosaic",
          sku: "LT-CFM-001",
          quantity: 6,
          unitPrice: 84,
          pricingMode: "box",
          piecePrice: 1.85,
          boxPrice: 84,
          packQuantity: 58,
          calculatedPieceQuantity: 348,
        },
      ],
      shippingMethodId: "ship-standard",
      shippingMethodName: "International Express",
      shippingMethodDescription: "3-7 business days",
      shippingMode: "international_express",
      shippingAmount: 0,
      discountCode: "",
      discountAmount: 0,
      subtotalAmount: 504,
      totalAmount: 504,
      currency: "USD",
      shippingAddress: {
        fullName: "Sophia L.",
        email: "sophia@atelierhouse.com",
        phone: "+1 202 555 1834",
        addressLine1: "1 Test St",
        addressLine2: "",
        city: "Los Angeles",
        state: "CA",
        postalCode: "90001",
        country: "US",
      },
      trackingNumber: "",
      carrierName: "",
      trackingUrl: "",
      logisticsNotes: "",
      shippedAt: "",
      confirmationEmailSentAt: "",
      createdAt: "2026-06-09T10:30:00.000Z",
    },
  ],
  customers: [],
  inquiries: [],
  managedPages: [],
  emailTemplates: [],
  emailLogs: [],
};

describe("storefront helpers", () => {
  it("filters products by multiple facets", () => {
    const products = filterProducts(siteData.products, {
      materials: ["Glass"],
      applications: ["Outdoor"],
      sort: "latest",
    });

    expect(products).toHaveLength(1);
    expect(products[0]?.slug).toBe("emerald-glass-hexagon-tile");
  });

  it("calculates free shipping after the threshold", () => {
    const totals = calculateShippingQuote(
      [{ productId: "prod-carrara-fan", quantity: 2, pricingMode: "box" }],
      siteData.products,
      siteData.shippingMethods[0],
      siteData.settings.freeShippingThreshold,
    );

    expect(totals.subtotal).toBe(168);
    expect(totals.shipping).toBe(0);
    expect(totals.total).toBe(168);
  });

  it("creates pending orders", () => {
    const order = createOrderDraft(siteData, {
      customerName: "Test Buyer",
      customerEmail: "buyer@example.com",
      shippingAddress: {
        fullName: "Test Buyer",
        email: "buyer@example.com",
        phone: "+1 202 555 1111",
        addressLine1: "100 Market Street",
        addressLine2: "",
        city: "Miami",
        state: "FL",
        postalCode: "33101",
        country: "US",
      },
      shippingMethodId: "ship-standard",
      paymentMethod: "credit_card",
      items: [
        {
          productId: "prod-emerald-hex",
          variantId: "variant-emerald-gloss",
          quantity: 1,
          pricingMode: "box",
        },
      ],
      currency: "USD",
      discountCode: "WELCOME10",
    });

    expect(order.status).toBe("pending");
    expect(order.paymentMethod).toBe("credit_card");
    expect(order.orderNo).toMatch(/^LT-/);
    expect(order.items[0]?.productName).toBe("Emerald Glass Hexagon Tile");
    expect(order.items[0]?.sku).toBe("LT-EGH-014-GLOSS");
    expect(order.items[0]?.variantName).toBe("Gloss Finish");
    expect(order.items[0]?.packQuantity).toBe(60);
    expect(order.items[0]?.calculatedPieceQuantity).toBe(60);
    expect(order.shippingMethodName).toBe("International Express");
    expect(order.shippingMode).toBe("international_express");
    expect(order.shippingAddress.city).toBe("Miami");
    expect(order.discountCode).toBe("WELCOME10");
    expect(order.discountAmount).toBeGreaterThan(0);
  });

  it("applies percentage discounts to cart totals", () => {
    const totals = calculateCartTotals(
      [{ productId: "prod-carrara-fan", quantity: 1, pricingMode: "box" }],
      siteData.products,
      siteData.shippingMethods[0],
      siteData.settings.freeShippingThreshold,
      siteData.discountCodes,
      "WELCOME10",
    );

    expect(totals.subtotal).toBe(84);
    expect(totals.discount).toBe(8.4);
    expect(totals.total).toBe(93.6);
  });

  it("supports free shipping discount codes", () => {
    const totals = calculateCartTotals(
      [{ productId: "prod-emerald-hex", quantity: 1, pricingMode: "box" }],
      siteData.products,
      siteData.shippingMethods[0],
      siteData.settings.freeShippingThreshold,
      siteData.discountCodes,
      "FREESHIP",
    );

    expect(totals.subtotal).toBe(62);
    expect(totals.shipping).toBe(0);
    expect(totals.discount).toBe(18);
  });

  it("rejects discount codes under the minimum order", () => {
    const result = resolveDiscountCode(siteData.discountCodes, "WELCOME10", 20);

    expect(result.code).toBeUndefined();
    expect(result.message).toContain("minimum order");
  });

  it("rejects duplicate verified reviews", () => {
    const allowed = canSubmitReview(siteData, {
      productId: "prod-carrara-fan",
      orderId: "order-1001",
      email: "sophia@atelierhouse.com",
    });

    expect(allowed).toBe(false);
  });
});
