import { Categoria } from '../../../core/models/veiculo.model';

/**
 * Geometria das ilustrações (viewBox 640 × 340, chão em y = 300, carro voltado para a esquerda).
 * Desenhada à mão em paths SVG — nenhuma imagem externa, nenhum logotipo de marca.
 */
export interface Roda {
  cx: number;
  cy: number;
  r: number;
}

export interface PerfilLateral {
  deslocX: number;
  corpo: string;
  janelas: string;
  pilares: string;
  portas: string;
  macanetas: { x: number; y: number }[];
  friso: string;
  sombraInferior: string;
  farol: string;
  lanterna: string;
  retrovisor: string;
  entradaAr: string;
  rodas: [Roda, Roda];
  /** Molduras pretas de para-lama (SUV/picape). */
  molduras?: string;
  /** Detalhes extras: rack de teto, caçamba etc. */
  extras?: string;
}

export const PERFIS: Record<Categoria, PerfilLateral> = {
  Sedã: {
    deslocX: 0,
    corpo:
      'M64 268C56 260 54 246 60 236C66 226 84 220 110 216L205 202C238 182 262 164 292 156C330 150 390 149 420 154C452 162 482 184 504 198L566 204C580 206 588 214 588 228L590 258C590 268 584 274 574 274L523 274A47 47 0 1 0 433 274L195 274A47 47 0 1 0 105 274L76 274C70 274 66 272 64 268Z',
    janelas:
      'M222 198C250 180 272 166 298 161C332 156 388 155 414 159C438 165 460 180 478 194Z',
    pilares: 'M352 157L350 197',
    portas: 'M206 204C205 228 203 246 201 258M351 200L351 272M472 196C470 214 464 226 446 236',
    macanetas: [{ x: 300, y: 212 }, { x: 420, y: 210 }],
    friso: 'M72 234C200 220 420 210 588 214',
    sombraInferior: 'M195 262L433 262L433 274L195 274Z',
    farol: 'M62 236C72 228 92 222 120 218L124 226C104 230 84 236 66 244Z',
    lanterna: 'M570 205C580 207 588 214 588 226L574 222C572 216 570 210 566 206Z',
    retrovisor: 'M240 200C232 192 216 192 214 202L238 207Z',
    entradaAr: 'M58 252L92 252L90 262L62 262Z',
    rodas: [{ cx: 150, cy: 260, r: 40 }, { cx: 478, cy: 260, r: 40 }],
  },
  Hatch: {
    deslocX: 19,
    corpo:
      'M66 268C58 260 56 248 62 238C68 228 86 222 112 218L210 204C240 184 264 166 294 158C340 151 410 150 448 156C476 160 500 172 518 186C534 200 542 216 544 234L546 258C546 268 540 274 530 274L500 274A47 47 0 1 0 410 274L195 274A47 47 0 1 0 105 274L78 274C72 274 68 272 66 268Z',
    janelas:
      'M224 200C252 182 274 168 300 163C342 157 408 156 442 161C464 165 482 176 496 192Z',
    pilares: 'M360 158L358 198',
    portas: 'M208 206C207 228 205 246 203 258M359 200L359 272M478 194C477 208 472 218 462 224',
    macanetas: [{ x: 306, y: 214 }, { x: 424, y: 212 }],
    friso: 'M74 236C200 222 420 212 544 222',
    sombraInferior: 'M195 262L410 262L410 274L195 274Z',
    farol: 'M64 238C74 230 94 224 122 220L126 228C106 232 86 238 68 246Z',
    lanterna: 'M528 196C538 206 542 218 544 232L534 232C532 220 528 208 522 200Z',
    retrovisor: 'M244 202C236 194 220 194 218 204L242 209Z',
    entradaAr: 'M60 254L94 254L92 264L64 264Z',
    rodas: [{ cx: 150, cy: 260, r: 40 }, { cx: 455, cy: 260, r: 40 }],
  },
  SUV: {
    deslocX: 6,
    corpo:
      'M58 262C50 250 50 232 56 220C62 208 82 202 108 199L200 190C226 166 248 140 276 128C330 122 420 121 520 124C540 126 552 134 558 148L572 200C576 214 578 228 578 246L578 258C578 266 572 270 562 270L528 270A52 52 0 1 0 428 270L200 270A52 52 0 1 0 100 270L72 270C66 270 60 266 58 262Z',
    janelas:
      'M214 186C238 164 258 144 284 136C330 131 420 130 512 132C530 134 540 142 546 156L556 184Z',
    pilares: 'M352 133L350 186M462 131L466 186',
    portas: 'M204 192C203 220 202 238 200 250M351 188L351 266M468 188C469 204 470 214 472 222',
    macanetas: [{ x: 296, y: 202 }, { x: 414, y: 200 }],
    friso: 'M64 222C200 206 420 196 572 200',
    sombraInferior: 'M200 258L428 258L428 270L200 270Z',
    farol: 'M56 218C66 208 88 203 116 200L120 208C98 212 76 218 60 226Z',
    lanterna: 'M560 150L572 196L576 214L566 212L556 168Z',
    retrovisor: 'M234 186C226 176 208 176 206 186L232 192Z',
    entradaAr: 'M54 240L94 238L92 254L56 254Z',
    rodas: [{ cx: 150, cy: 256, r: 44 }, { cx: 478, cy: 256, r: 44 }],
    molduras: 'M96 270A55 55 0 1 1 204 270M424 270A55 55 0 1 1 532 270',
    extras: 'M300 121L512 119',
  },
  Picape: {
    deslocX: -7,
    corpo:
      'M48 262C40 250 40 232 46 220C52 208 72 202 98 199L196 188C220 166 238 142 266 130C300 125 350 124 372 126C384 128 390 136 392 148L396 192L604 192C610 192 614 196 614 202L614 258C614 266 608 270 598 270L550 270A52 52 0 1 0 450 270L190 270A52 52 0 1 0 90 270L60 270C54 270 50 266 48 262Z',
    janelas:
      'M208 184C228 164 244 146 270 138C300 133 348 132 364 134C374 136 378 142 380 150L384 182Z',
    pilares: 'M296 134L294 184',
    portas: 'M200 190C199 218 198 236 196 250M295 186L296 266M388 186L390 262',
    macanetas: [{ x: 250, y: 200 }, { x: 338, y: 198 }],
    friso: 'M54 222C200 206 400 200 614 206',
    sombraInferior: 'M190 258L450 258L450 270L190 270Z',
    farol: 'M46 218C56 208 78 203 106 200L110 208C88 212 66 218 50 226Z',
    lanterna: 'M604 204L614 204L614 234L604 234Z',
    retrovisor: 'M228 184C220 174 202 174 200 184L226 190Z',
    entradaAr: 'M44 240L84 238L82 254L46 254Z',
    rodas: [{ cx: 140, cy: 256, r: 44 }, { cx: 500, cy: 256, r: 44 }],
    molduras: 'M86 270A55 55 0 1 1 194 270M446 270A55 55 0 1 1 554 270',
    extras: 'M398 198L604 198',
  },
};

/** Proporções da vista frontal/traseira por carroceria. */
export interface ProporcaoFrontal {
  meiaLargura: number;
  teto: number;
  cintura: number;
  base: number;
}

export const PROPORCOES: Record<Categoria, ProporcaoFrontal> = {
  Hatch: { meiaLargura: 168, teto: 118, cintura: 190, base: 284 },
  Sedã: { meiaLargura: 176, teto: 126, cintura: 194, base: 284 },
  SUV: { meiaLargura: 188, teto: 92, cintura: 176, base: 280 },
  Picape: { meiaLargura: 194, teto: 90, cintura: 174, base: 280 },
};

const CX = 320;

/** Gera os paths da vista frontal/traseira a partir das proporções (metade esquerda + espelho). */
export function geometriaFrontal(p: ProporcaoFrontal) {
  const { meiaLargura: W, teto: T, cintura: C, base: B } = p;
  const e = CX - W;
  const d = CX + W;
  return {
    pneus: [
      { x: e + 10, y: B - 40, w: 42, h: 56 },
      { x: d - 52, y: B - 40, w: 42, h: 56 },
    ],
    carroceria: `M${e} ${B - 8}L${e} ${C + 16}Q${e} ${C} ${e + 18} ${C - 4}L${d - 18} ${C - 4}Q${d} ${C} ${d} ${C + 16}L${d} ${B - 8}Q${d} ${B + 4} ${d - 14} ${B + 4}L${e + 14} ${B + 4}Q${e} ${B + 4} ${e} ${B - 8}Z`,
    cabine: `M${e + 24} ${C - 2}L${e + 62} ${T + 12}Q${e + 68} ${T} ${e + 86} ${T}L${d - 86} ${T}Q${d - 68} ${T} ${d - 62} ${T + 12}L${d - 24} ${C - 2}Z`,
    vidro: `M${e + 40} ${C - 6}L${e + 72} ${T + 14}L${d - 72} ${T + 14}L${d - 40} ${C - 6}Z`,
    vidroTraseiro: `M${e + 50} ${C - 10}L${e + 76} ${T + 18}L${d - 76} ${T + 18}L${d - 50} ${C - 10}Z`,
    capo: `M${e + 18} ${C - 4}L${d - 18} ${C - 4}L${d - 30} ${C + 14}L${e + 30} ${C + 14}Z`,
    farolEsq: `M${e + 12} ${C + 20}L${e + 96} ${C + 28}L${e + 92} ${C + 38}Q${e + 40} ${C + 38} ${e + 14} ${C + 34}Z`,
    grade: { x: CX - W * 0.42, y: C + 30, w: W * 0.84, h: (B - C) * 0.36 },
    entrada: { x: CX - W * 0.55, y: B - 22, w: W * 1.1, h: 12 },
    retrovisorEsq: `M${e + 28} ${C - 12}L${e - 14} ${C - 20}Q${e - 24} ${C - 10} ${e - 14} ${C - 2}L${e + 26} ${C}Z`,
    lanternaBarra: { x: e + 10, y: C + 18, w: W * 2 - 20, h: 10 },
    lanternaEsq: `M${e + 6} ${C + 14}L${e + 84} ${C + 16}L${e + 80} ${C + 34}L${e + 8} ${C + 30}Z`,
    placa: { x: CX - 40, y: C + 46, w: 80, h: 22 },
    difusor: `M${e + 30} ${B - 18}L${d - 30} ${B - 18}L${d - 44} ${B + 2}L${e + 44} ${B + 2}Z`,
    sombra: { cx: CX, cy: B + 16, rx: W + 34, ry: 12 },
    largura: W,
  };
}
