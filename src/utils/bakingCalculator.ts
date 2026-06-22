import type { Ingredient } from '@/types';

export function scaleIngredients(
  ingredients: Ingredient[],
  originalServings: number,
  targetServings: number
): Ingredient[] {
  if (originalServings <= 0 || targetServings <= 0) {
    throw new Error('Servings must be greater than 0');
  }
  const scale = targetServings / originalServings;
  return ingredients.map((ingredient) => ({
    ...ingredient,
    amount: ingredient.amount * scale,
  }));
}

type PanShape = 'round' | 'square';

interface PanSize {
  diameter?: number;
  side?: number;
  width?: number;
  height?: number;
}

export function calculatePanScale(
  originalPanSize: PanSize,
  targetPanSize: PanSize,
  shape: PanShape = 'round'
): number {
  let originalArea: number;
  let targetArea: number;

  if (shape === 'round') {
    const originalRadius = (originalPanSize.diameter ?? 0) / 2;
    const targetRadius = (targetPanSize.diameter ?? 0) / 2;
    originalArea = Math.PI * originalRadius * originalRadius;
    targetArea = Math.PI * targetRadius * targetRadius;
  } else {
    if (originalPanSize.side !== undefined) {
      originalArea = originalPanSize.side * originalPanSize.side;
    } else {
      originalArea = (originalPanSize.width ?? 0) * (originalPanSize.height ?? 0);
    }
    if (targetPanSize.side !== undefined) {
      targetArea = targetPanSize.side * targetPanSize.side;
    } else {
      targetArea = (targetPanSize.width ?? 0) * (targetPanSize.height ?? 0);
    }
  }

  if (originalArea <= 0) {
    throw new Error('Original pan size must be greater than 0');
  }

  return targetArea / originalArea;
}

export function formatAmount(amount: number): string {
  if (amount === 0) return '0';
  if (Number.isInteger(amount)) return amount.toString();
  if (amount % 1 === 0.5) return `${Math.floor(amount)} 1/2`;
  if (amount % 1 === 0.25) return `${Math.floor(amount)} 1/4`;
  if (amount % 1 === 0.75) return `${Math.floor(amount)} 3/4`;
  if (amount % 1 === 0.33 || Math.abs((amount % 1) - 1 / 3) < 0.01) return `${Math.floor(amount)} 1/3`;
  if (amount % 1 === 0.66 || Math.abs((amount % 1) - 2 / 3) < 0.01) return `${Math.floor(amount)} 2/3`;
  if (amount < 1) {
    return amount.toFixed(2).replace(/\.?0+$/, '');
  }
  return amount.toFixed(1).replace(/\.?0+$/, '');
}
