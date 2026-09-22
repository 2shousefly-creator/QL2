import type { GameState } from "../types";
import { creditSharedGold } from "../sharedGold";

export interface CouponDefinition {
  code: string;
  name: string;
  rewardGold: number;
  description?: string;
  expiresAt?: number | null;
}

export const COUPON_CATALOG: Record<string, CouponDefinition> = {
  QL2026: {
    code: "QL2026",
    name: "Quà Tặng Quân Lộ 2026",
    rewardGold: 2000,
    description: "Nhận 2.000 Vàng dùng chung trên toàn hệ thống.",
  },
  GOLD3K: {
    code: "GOLD3K",
    name: "Quà Tặng 3.000 Vàng",
    rewardGold: 3000,
    description: "Nhận 3.000 Vàng dùng chung trên toàn hệ thống.",
  },
};

export type CouponRedeemResult =
  | {
      success: true;
      message: string;
      rewardGold: number;
      code: string;
    }
  | {
      success: false;
      message: string;
      reason: "invalid_code" | "already_used" | "expired" | "empty_input";
    };

export function normalizeCouponCode(input: string): string {
  return (input || "").trim().toUpperCase();
}

export function sanitizeCouponState(raw: unknown): {
  redeemedCodes: string[];
  redeemedAt: Record<string, number>;
} {
  if (!raw || typeof raw !== "object") {
    return { redeemedCodes: [], redeemedAt: {} };
  }
  const obj = raw as Record<string, any>;
  const redeemedCodes = Array.isArray(obj.redeemedCodes)
    ? obj.redeemedCodes
        .map((c) => (typeof c === "string" ? normalizeCouponCode(c) : ""))
        .filter((c): c is string => Boolean(c))
    : [];

  const redeemedAt: Record<string, number> = {};
  if (obj.redeemedAt && typeof obj.redeemedAt === "object" && !Array.isArray(obj.redeemedAt)) {
    for (const [key, val] of Object.entries(obj.redeemedAt)) {
      const num = Number(val);
      if (Number.isFinite(num) && num > 0) {
        redeemedAt[normalizeCouponCode(key)] = Math.trunc(num);
      }
    }
  }

  return { redeemedCodes: Array.from(new Set(redeemedCodes)), redeemedAt };
}

export function isCouponRedeemed(state: GameState, rawCode: string): boolean {
  const code = normalizeCouponCode(rawCode);
  if (!code || !state.coupons?.redeemedCodes) return false;
  return state.coupons.redeemedCodes.includes(code);
}

export function redeemCoupon(
  draft: GameState,
  rawCode: string,
  now = Date.now()
): CouponRedeemResult {
  const code = normalizeCouponCode(rawCode);
  if (!code) {
    return {
      success: false,
      message: "Vui lòng nhập mã coupon.",
      reason: "empty_input",
    };
  }

  // Ensure draft.coupons is initialized
  if (!draft.coupons) {
    draft.coupons = { redeemedCodes: [], redeemedAt: {} };
  }
  if (!Array.isArray(draft.coupons.redeemedCodes)) {
    draft.coupons.redeemedCodes = [];
  }
  if (!draft.coupons.redeemedAt || typeof draft.coupons.redeemedAt !== "object") {
    draft.coupons.redeemedAt = {};
  }

  // Check if already used
  if (draft.coupons.redeemedCodes.includes(code)) {
    return {
      success: false,
      message: `Mã "${code}" đã được sử dụng trên tài khoản này.`,
      reason: "already_used",
    };
  }

  // Lookup in catalog
  const coupon = COUPON_CATALOG[code];
  if (!coupon) {
    return {
      success: false,
      message: `Mã coupon "${code}" không chính xác hoặc không tồn tại.`,
      reason: "invalid_code",
    };
  }

  if (coupon.expiresAt && now > coupon.expiresAt) {
    return {
      success: false,
      message: `Mã coupon "${code}" đã hết hạn.`,
      reason: "expired",
    };
  }

  // Atomic state mutations
  draft.coupons.redeemedCodes.push(code);
  draft.coupons.redeemedAt[code] = now;

  // Credit canonical shared Gold
  creditSharedGold(draft, coupon.rewardGold);

  return {
    success: true,
    message: `Nhập mã thành công! Bạn nhận được +${coupon.rewardGold.toLocaleString("vi-VN")} Vàng.`,
    rewardGold: coupon.rewardGold,
    code,
  };
}
