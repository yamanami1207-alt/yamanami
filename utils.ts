import { Bead } from './types';

export function calculateInnerCirc(beads: Bead[]) {
  const nonEmpty = beads.filter(b => b.type !== "empty");
  if (nonEmpty.length === 0) return "0.0";
  const totalDiam = nonEmpty.reduce((s, b) => s + b.size, 0);
  const avgSize = totalDiam / nonEmpty.length;
  const radius = totalDiam / (2 * Math.PI);
  return Math.max(0, (((radius - avgSize / 2) * 2 * Math.PI) / 10) - 0.5).toFixed(1);
}

export function formatPrice(num: number) { 
  return num.toLocaleString(); 
}

export function getSymmetryIdx(selectedIdx: number, beadsCount: number, isSymmetry: boolean) {
  if (!isSymmetry || selectedIdx === 0) return -1;
  const sym = beadsCount - selectedIdx;
  return (sym !== selectedIdx && sym >= 0 && sym < beadsCount) ? sym : -1;
}
