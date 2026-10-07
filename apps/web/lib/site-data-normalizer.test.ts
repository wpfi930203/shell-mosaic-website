import { describe, expect, it } from "vitest";

import { normalizeSiteData } from "./site-data-normalizer";
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
  filterGroups: [
    {
      key: "materials",
      label: "Materials",
      enabled: true,
      options: [{ id: "mat-marble", label: "Marble", enabled: true, sortOrder: 1 }],
    },
    {
      key: "patterns",
      label: "Patterns",
      enabled: true,
      options: [{ id: "pat-hex", label: "Hexagon", enabled: true, sortOrder: 1 }],
    },
    {
      key: "colors",
      label: "Colors",
      enabled: true,
      options: [{ id: "col-white", label: "White & Beige", enabled: true, sortOrder: 1 }],
    },
    {
      key: "applications",
      label: "Application",
      enabled: true,
      options: [
        { id: "app-indoor", label: "Indoor", enabled: true, sortOrder: 1 },
        { id: "app-outdoor", label: "Outdoor", enabled: true, sortOrder: 2 },
      ],
    },
  ],
  products: [
    {
      id: "prod-carrara-fan",
      slug: "carrara-fan-marble-mosaic",
      name: "Carrara Fan Marble Mosaic",
      shortDescription: "",
      descriptionHtml: "",
      piecePrice: 12.9,
      boxPrice: 189,
      compareAtPrice: 219,
      packQuantity: 10,
      samplePrice: 9,
      sampleLabel: "Order Swatch Sample",
      stockQty: 30,
      lowStockThreshold: 10,
      sku: "LA001",
      materials: ["Marble", "Stone"],
      patterns: ["Hexagon"],
      colors: ["White & Beige", "White"],
      applications: ["Indoorcca", "Indoor", "Outdoor", "Indoor"],
      featured: true,
      images: [],
      variants: [
        {
          id: "variant-1",
          name: "Polished Finish",
          sku: "LA001-POL",
          piecePrice: 13.9,
          boxPrice: 199,
          packQuantity: 10,
          stockQty: 12,
          images: [
            {
              id: "variant-image-1",
              path: "/uploads/polished.jpg",
              alt: "polished",
              type: "main",
              sortOrder: 0,
            },
          ],
          enabled: true,
          isDefault: false,
        },
        {
          id: "variant-2",
          name: "Honed Finish",
          sku: "LA001-HON",
          piecePrice: 12.9,
          boxPrice: 189,
          packQuantity: 10,
          stockQty: 8,
          images: [],
          enabled: true,
          isDefault: false,
        },
      ],
    },
  ],
  banners: [],
  galleryItems: [],
  shippingMethods: [],
  discountCodes: [],
  reviews: [],
  orders: [],
  customers: [],
  inquiries: [],
  managedPages: [],
  emailTemplates: [],
  emailLogs: [],
};

describe("normalizeSiteData", () => {
  it("removes category values that are not in the existing catalog", () => {
    const normalized = normalizeSiteData(siteData);

    expect(normalized.products[0]?.materials).toEqual(["Marble"]);
    expect(normalized.products[0]?.colors).toEqual(["White & Beige"]);
    expect(normalized.products[0]?.applications).toEqual(["Indoor", "Outdoor"]);
  });

  it("ensures one enabled variant becomes the default option", () => {
    const normalized = normalizeSiteData(siteData);

    expect(normalized.products[0]?.variants?.[0]?.isDefault).toBe(true);
    expect(normalized.products[0]?.variants?.[1]?.isDefault).toBe(false);
  });

  it("normalizes variant images so storefront galleries stay usable", () => {
    const normalized = normalizeSiteData(siteData);

    expect(normalized.products[0]?.variants?.[0]?.images?.[0]?.sortOrder).toBe(1);
    expect(normalized.products[0]?.variants?.[0]?.images?.[0]?.type).toBe("main");
  });

  it("fills missing shipping snapshots from the shipping catalog", () => {
    const normalized = normalizeSiteData({
      ...siteData,
      shippingMethods: [
        {
          id: "ship-air",
          name: "Air Freight",
          description: "7-15 business days",
          price: 145,
          freeThreshold: 2200,
          displayOrder: 2,
          shippingMode: "air_freight",
          shippingGroup: "standard",
          trackingUrlTemplate: "https://www.17track.net/en/track?nums={trackingNumber}",
          enabled: true,
          createdAt: "2026-06-01T00:00:00.000Z",
          updatedAt: "2026-06-21T00:00:00.000Z",
        },
      ],
      orders: [
        {
          id: "order-1",
          orderNo: "LT-1001",
          customerName: "Test Buyer",
          customerEmail: "buyer@example.com",
          status: "pending",
          paymentStatus: "pending",
          paymentMethod: "paypal",
          items: [],
          shippingMethodId: "ship-air",
          shippingMethodName: "",
          shippingMethodDescription: "",
          shippingMode: "international_express",
          shippingAmount: 145,
          discountCode: "",
          discountAmount: 0,
          subtotalAmount: 200,
          totalAmount: 345,
          currency: "USD",
          shippingAddress: {
            fullName: "Test Buyer",
            email: "buyer@example.com",
            phone: "",
            addressLine1: "",
            addressLine2: "",
            city: "",
            state: "",
            postalCode: "",
            country: "",
          },
          trackingNumber: "",
          carrierName: "",
          trackingUrl: "",
          logisticsNotes: "",
          shippedAt: "",
          confirmationEmailSentAt: "",
          createdAt: "2026-06-21T00:00:00.000Z",
        },
      ],
    });

    expect(normalized.orders[0]?.shippingMethodName).toBe("Air Freight");
    expect(normalized.orders[0]?.shippingMethodDescription).toBe("7-15 business days");
    expect(normalized.orders[0]?.shippingMode).toBe("air_freight");
  });
});
