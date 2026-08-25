"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "../lib/admin-auth";
import { isOrderStatus } from "../lib/orders";
import { consumeRequestRateLimit } from "../lib/request-rate-limit";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function updateOrderStatusAction(formData: FormData): Promise<void> {
  const auth = await requireAdmin();
  if (!auth.ok || !consumeRequestRateLimit(`admin-order:${auth.userId}`, 60, 60_000)) return;

  const orderId = String(formData.get("orderId") ?? "");
  const status = formData.get("status");
  if (!UUID_PATTERN.test(orderId) || !isOrderStatus(status)) return;

  await auth.supabase.from("chipma_orders").update({ status }).eq("id", orderId);
  revalidatePath("/admin/orders");
  revalidatePath("/admin/analytics");
}

export async function updateAdminSettingsAction(formData: FormData): Promise<void> {
  const auth = await requireAdmin();
  if (!auth.ok || !consumeRequestRateLimit(`admin-settings:${auth.userId}`, 20, 60_000)) return;

  const supportEmail = String(formData.get("supportEmail") ?? "").trim().toLowerCase();
  const notificationEmail = String(formData.get("notificationEmail") ?? "").trim().toLowerCase();
  const countryCode = String(formData.get("defaultCountryCode") ?? "DE").trim().toUpperCase();
  const lookbackDays = Number(formData.get("analyticsLookbackDays"));
  if (!EMAIL_PATTERN.test(supportEmail) || !EMAIL_PATTERN.test(notificationEmail) || !/^[A-Z]{2}$/.test(countryCode) || !Number.isInteger(lookbackDays) || lookbackDays < 7 || lookbackDays > 365) return;

  await auth.supabase.from("chipma_admin_settings").update({
    support_email: supportEmail,
    order_notification_email: notificationEmail,
    default_country_code: countryCode,
    analytics_lookback_days: lookbackDays,
    updated_by: auth.userId,
  }).eq("id", "general");
  revalidatePath("/admin/settings");
}
