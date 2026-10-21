/** Clareia (+) ou escurece (−) uma cor hex. `fator` entre −1 e 1. */
export function ajustarCor(hex: string, fator: number): string {
  const limpo = hex.replace('#', '');
  const num = parseInt(limpo.length === 3 ? limpo.replace(/./g, '$&$&') : limpo, 16);
  if (Number.isNaN(num)) return hex;

  const canais = [(num >> 16) & 255, (num >> 8) & 255, num & 255].map((c) => {
    const alvo = fator >= 0 ? 255 : 0;
    return Math.round(c + (alvo - c) * Math.abs(fator));
  });
  return '#' + canais.map((c) => c.toString(16).padStart(2, '0')).join('');
}

/** Luminância relativa (WCAG) — usada para decidir reflexos em carros claros/escuros. */
export function luminancia(hex: string): number {
  const num = parseInt(hex.replace('#', ''), 16);
  const [r, g, b] = [(num >> 16) & 255, (num >> 8) & 255, num & 255].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
