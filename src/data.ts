import { StoneType, Bead } from './types';

export const STONE_TYPES_RAW = [
  { id: "suisho_maru",     name: "水晶 丸",             color: "#f8f9fa", prices: { 8: 120, 10: 180 } },
  { id: "suisho_crack",    name: "水晶 クラック",       color: "#f8f9fa", prices: { 8: 120, 10: 180 } },
  { id: "suisho_cut",      name: "水晶 カット",         color: "#f8f9fa", prices: { 8: 160, 10: 200 } },
  { id: "moonstone",       name: "ムーンストーン",      color: "#e8eff5", prices: { 8: 240, 10: 800 } },
  { id: "labradorite",     name: "ラブラドライト",      color: "#a0b0b0", prices: { 8: 900, 10: 1200 } },
  { id: "rosequartz",      name: "ローズクォーツ",      color: "#ffe0eb", prices: { 8: 110, 10: 200 } },
  { id: "incarose",        name: "インカローズ",        color: "#ff8da1", prices: { 8: 1300, 10: 2800 } },
  { id: "agate_red",       name: "レッドアゲート",      color: "#d9534f", prices: { 8: 120, 10: 180 } },
  { id: "rutile",          name: "ルチルクォーツ",      color: "#fdf8ec", prices: { 8: 330, 10: 600 } },
  { id: "fluorite",        name: "フローライト",        color: "#ccf0cc", prices: { 8: 120, 10: null } },
  { id: "aventurine",      name: "アベンチュリン",      color: "#99cc99", prices: { 8: 120, 10: 200 } },
  { id: "malachite",       name: "マラカイト",          color: "#1e6b3f", prices: { 8: 380, 10: 630 } },
  { id: "amazonite",       name: "アマゾナイト",        color: "#8bd9c7", prices: { 8: 120, 10: null } },
  { id: "aquamarine",      name: "アクアマリン",        color: "#d1edf2", prices: { 8: 1100, 10: 1800 } },
  { id: "blue_topaz",      name: "ブルートパーズ",      color: "#c2e6f9", prices: { 8: 1200, 10: null } },
  { id: "turquoise",       name: "ターコイズ",          color: "#40e0d0", prices: { 8: 580, 10: null } },
  { id: "lapis",           name: "ラピスラズリ",        color: "#254182", prices: { 8: 800, 10: 1200 } },
  { id: "lavender_ame",    name: "ラベンダーアメジスト", color: "#e6e0f5", prices: { 8: 200, 10: 300 } },
  { id: "amethyst",        name: "アメジスト",          color: "#d2c2f0", prices: { 8: 500, 10: 950 } },
  { id: "tigereye_yellow", name: "タイガーアイ",        color: "#ac803b", prices: { 8: 90, 10: 180 } },
  { id: "tigereye_red",    name: "レッドタイガーアイ",   color: "#8d6a4c", prices: { 8: 90, 10: 180 } },
  { id: "tigereye_blue",   name: "ブルータイガーアイ",   color: "#3a4a6e", prices: { 8: 170, 10: 300 } },
  { id: "onyx_maru",       name: "オニキス 丸",          color: "#333333", prices: { 8: 110, 10: 180 } },
  { id: "onyx_cut",        name: "オニキス カット",        color: "#333333", prices: { 8: 160, 10: 260 } },
  { id: "yakusugi",        name: "屋久杉",              color: "#b58d5f", prices: { 8: 500, 10: 700 } },
  { id: "eye_agate",       name: "アイアゲート",        color: "#8c7366", prices: { 8: 130, 10: 180 } },
];

export const STONE_TYPES: StoneType[] = STONE_TYPES_RAW.map(s => ({
  ...s,
  prices: s.prices as { 8: number; 10: number | null },
  image: `/images/${s.id}.png`
}));

export const SIZES = [8, 10];
export const SHIPPING_FREE_THRESHOLD = 5000;
export const SHIPPING_FEE = 400;
export const MIN_BEADS = 10;
export const MAX_BEADS = 35;
export const DEFAULT_BEADS = 24;
export const EMPTY: Bead = { id: "empty", type: "empty", name: "未選択", size: 8, price: 0, color: null, image: null };
