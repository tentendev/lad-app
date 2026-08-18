import type { PackTier, Pool, TicketRule } from "@/domain/types";

export const MONTHLY_DIA = 7060;
export const DIA_PER_PULL = 150;

export const OFFICIAL_TICKET_RULES: Record<Pool, TicketRule> = {
  日卡池: { initial: 10, milestones: [{ every: 10, reward: 1, maxReward: 10 }] },
  混池: {
    initial: 10,
    milestones: [
      { at: 50, reward: 5 },
      { at: 100, reward: 5 },
      { at: 150, reward: 5 },
      { at: 250, reward: 5 },
    ],
  },
  月卡池: {
    initial: 0,
    milestones: [
      { every: 5, reward: 1, from: 5, to: 50 },
      { every: 10, reward: 2, from: 60, to: 100 },
    ],
  },
  生日池: { initial: 20, milestones: [] },
  復刻池: { initial: 0, milestones: [] },
};

const sharedMonthlyBirthday: PackTier[] = [
  { tier: "一", price: 15, qty: 3, packPulls: 1, cumPulls: 3, cumCost: 45, per: 15 },
  { tier: "二", price: 30, qty: 3, packPulls: 2, cumPulls: 9, cumCost: 135, per: 15 },
  { tier: "三", price: 150, qty: 3, packPulls: 6, cumPulls: 27, cumCost: 585, per: 25 },
  { tier: "四", price: 290, qty: 2, packPulls: 10, cumPulls: 47, cumCost: 1165, per: 29 },
  { tier: "五", price: 390, qty: 2, packPulls: 12, cumPulls: 71, cumCost: 1945, per: 32.5 },
  { tier: "六", price: 820, qty: 10, packPulls: 20, cumPulls: 271, cumCost: 10145, per: 41 },
  { tier: "七", price: 1490, qty: 1, packPulls: null, cumPulls: 271, cumCost: 11635, per: null },
];

export const PACK_DATA: Record<Pool, PackTier[]> = {
  日卡池: [
    { tier: "一", price: 15, qty: 5, packPulls: 1, cumPulls: 5, cumCost: 75, per: 15 },
    { tier: "二", price: 30, qty: 5, packPulls: 2, cumPulls: 15, cumCost: 225, per: 15 },
    { tier: "三", price: 150, qty: 5, packPulls: 6, cumPulls: 45, cumCost: 975, per: 25 },
    { tier: "四", price: 320, qty: 5, packPulls: 10, cumPulls: 95, cumCost: 2575, per: 32 },
    { tier: "五", price: 390, qty: 3, packPulls: 12, cumPulls: 131, cumCost: 3745, per: 32.5 },
    { tier: "六", price: 820, qty: 10, packPulls: 20, cumPulls: 331, cumCost: 11945, per: 41 },
    { tier: "七", price: 1690, qty: 1, packPulls: 40, cumPulls: 371, cumCost: 13635, per: 42.25 },
  ],
  混池: [
    { tier: "一", price: 15, qty: 5, packPulls: 1, cumPulls: 5, cumCost: 75, per: 15 },
    { tier: "二", price: 30, qty: 3, packPulls: 2, cumPulls: 11, cumCost: 165, per: 15 },
    { tier: "三", price: 150, qty: 5, packPulls: 6, cumPulls: 41, cumCost: 915, per: 25 },
    { tier: "四", price: 320, qty: 5, packPulls: 10, cumPulls: 91, cumCost: 2515, per: 32 },
    { tier: "五", price: 390, qty: 5, packPulls: 12, cumPulls: 151, cumCost: 4465, per: 32.5 },
    { tier: "六", price: 590, qty: 3, packPulls: 16, cumPulls: 199, cumCost: 6235, per: 36.88 },
    { tier: "七", price: 820, qty: 10, packPulls: 20, cumPulls: 399, cumCost: 14435, per: 41 },
    { tier: "八", price: 1690, qty: 1, packPulls: 40, cumPulls: 439, cumCost: 16125, per: 42.25 },
  ],
  月卡池: sharedMonthlyBirthday,
  生日池: sharedMonthlyBirthday,
  復刻池: [
    { tier: "一", price: 30, qty: 1, packPulls: 2, cumPulls: 2, cumCost: 30, per: 15 },
    { tier: "二", price: 150, qty: 3, packPulls: 6, cumPulls: 20, cumCost: 480, per: 25 },
    { tier: "三", price: 320, qty: 5, packPulls: 10, cumPulls: 70, cumCost: 2080, per: 32 },
    { tier: "四", price: 390, qty: 3, packPulls: 12, cumPulls: 106, cumCost: 3250, per: 32.5 },
    { tier: "五", price: 820, qty: 10, packPulls: 20, cumPulls: 306, cumCost: 11450, per: 41 },
  ],
};
