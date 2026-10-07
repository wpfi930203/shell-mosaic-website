import { NextResponse } from "next/server";

import { readSiteData, writeSiteData } from "@/lib/data-store";
import { createOrderDraft } from "@/lib/storefront";
import type { Address, CartItemInput, CurrencyCode, EmailLog, PaymentMethod } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const siteData = await readSiteData();
  return NextResponse.json(siteData.orders);
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    customerName: string;
    customerEmail: string;
    shippingAddress: Address;
    shippingMethodId: string;
    paymentMethod: PaymentMethod;
    items: CartItemInput[];
    currency: CurrencyCode;
    discountCode?: string;
  };

  const siteData = await readSiteData();
  const order = createOrderDraft(siteData, body);
  const createdAt = new Date().toISOString();
  const orderConfirmationTemplate = siteData.emailTemplates.find(
    (template) => template.id === "mail-order-confirmation",
  );
  const notificationFrom =
    siteData.settings.notificationSenderEmail ||
    siteData.settings.checkoutSupportEmail ||
    siteData.settings.paypalMerchantEmail;
  const notificationReplyTo =
    siteData.settings.notificationReplyToEmail ||
    siteData.settings.checkoutSupportEmail ||
    notificationFrom;
  const emailLogs: EmailLog[] = [];

  if (siteData.settings.orderNotificationsEnabled && orderConfirmationTemplate && notificationFrom) {
    emailLogs.push({
      id: `mail-log-${Date.now()}-customer`,
      templateId: orderConfirmationTemplate.id,
      orderId: order.id,
      fromEmail: notificationFrom,
      replyToEmail: notificationReplyTo,
      toEmail: order.customerEmail,
      subject: `${orderConfirmationTemplate.subject} (${order.orderNo})`,
      body: buildOrderEmailBody(orderConfirmationTemplate.body, order),
      status: "sent",
      createdAt,
    });
  }

  if (siteData.settings.orderNotificationsEnabled && siteData.settings.orderNotificationRecipient) {
    emailLogs.push({
      id: `mail-log-${Date.now()}-admin`,
      templateId: "mail-admin-order-notification",
      orderId: order.id,
      fromEmail: notificationFrom || order.customerEmail,
      replyToEmail: notificationReplyTo || order.customerEmail,
      toEmail: siteData.settings.orderNotificationRecipient,
      subject: `New Lansic order ${order.orderNo}`,
      body: buildAdminNotificationBody(order),
      status: "sent",
      createdAt,
    });
  }

  const nextData = {
    ...siteData,
    discountCodes: siteData.discountCodes.map((code) =>
      code.code === order.discountCode ? { ...code, usedCount: code.usedCount + 1 } : code,
    ),
    orders: [
      {
        ...order,
        confirmationEmailSentAt: emailLogs.some((log) => log.toEmail === order.customerEmail)
          ? createdAt
          : "",
      },
      ...siteData.orders,
    ],
    customers: siteData.customers.some(
      (customer) => customer.email.toLowerCase() === body.customerEmail.toLowerCase(),
    )
      ? siteData.customers.map((customer) =>
          customer.email.toLowerCase() === body.customerEmail.toLowerCase()
            ? {
                ...customer,
                name: body.shippingAddress.fullName || customer.name,
                phone: body.shippingAddress.phone || customer.phone,
              }
            : customer,
        )
      : [
          {
            id: `customer-${siteData.customers.length + 1}`,
            name: body.shippingAddress.fullName || body.customerName,
            email: body.customerEmail,
            phone: body.shippingAddress.phone || "",
            registeredAt: createdAt,
          },
          ...siteData.customers,
        ],
    emailLogs: [...emailLogs, ...(siteData.emailLogs ?? [])],
  };

  await writeSiteData(nextData);

  return NextResponse.json(
    {
      ...nextData.orders[0],
      emailLogCount: emailLogs.length,
    },
    { status: 201 },
  );
}

function buildOrderEmailBody(templateBody: string, order: { orderNo: string; totalAmount: number; currency: string }) {
  return `${templateBody}\n\nOrder No: ${order.orderNo}\nTotal: ${order.currency} ${order.totalAmount.toFixed(2)}`;
}

function buildAdminNotificationBody(order: {
  orderNo: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  currency: string;
}) {
  return `New order received.\n\nOrder No: ${order.orderNo}\nCustomer: ${order.customerName}\nEmail: ${order.customerEmail}\nTotal: ${order.currency} ${order.totalAmount.toFixed(2)}`;
}
