import { DIA_PER_PULL, PACK_OTHER } from "./packs";

type SubscriptionCost = {
  name: string;
  price: number;
  perPull: number;
  detail: string;
};

// Weekly reference: data/戀與深空_禮包總表.csv in the original web project.
const weekly = PACK_OTHER.find(pack => pack.name === "周卡");
if (!weekly) throw new Error("Missing weekly pass reference in PACK_OTHER");

// Taiwan 30-day Aurum Pass price, checked 2026-11-23:
// https://apps.apple.com/tw/app/id6443468077
// 3,000 diamonds claimed over 30 days; gifted crystals are excluded:
// https://shixinote.com/loveanddeepspace-pack/
const monthlyPrice = 150;
const monthlyDiamonds = 3000;
// The same reward table records 1,050 diamonds for the weekly pass.
const weeklyDiamonds = 1050;

export const SUBSCRIPTION_COSTS: readonly SubscriptionCost[] = [
  { name: "月卡", price: monthlyPrice, perPull: monthlyPrice / (monthlyDiamonds / DIA_PER_PULL), detail: "30 天領滿 3,000 鑽＝20 抽；未計贈送晶鑽" },
  { name: "週卡", price: weekly.price, perPull: weekly.price / (weeklyDiamonds / DIA_PER_PULL), detail: "1,050 鑽＝7 抽" },
];

export const SUBSCRIPTION_COST_NOTE = "台灣售價參考；港幣、馬幣價格待補。僅供比較，不計入已選禮包合計。";
