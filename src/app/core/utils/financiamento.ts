export interface ResultadoFinanciamento {
  valorFinanciado: number;
  parcela: number;
  totalPago: number;
  jurosTotais: number;
  custoTotal: number;
}

/**
 * Tabela Price: PMT = PV · i / (1 − (1 + i)^−n)
 * @param valorVeiculo preço do carro
 * @param entrada valor pago à vista
 * @param parcelas número de meses
 * @param taxaMensalPercentual taxa ao mês em % (1.79 = 1,79% a.m.)
 */
export function calcularPrice(
  valorVeiculo: number,
  entrada: number,
  parcelas: number,
  taxaMensalPercentual: number,
): ResultadoFinanciamento {
  const pv = Math.max(valorVeiculo - entrada, 0);
  const i = taxaMensalPercentual / 100;
  const n = Math.max(Math.round(parcelas), 1);

  const parcela = i === 0 ? pv / n : (pv * i) / (1 - Math.pow(1 + i, -n));
  const totalPago = parcela * n;

  return {
    valorFinanciado: pv,
    parcela,
    totalPago,
    jurosTotais: totalPago - pv,
    custoTotal: totalPago + entrada,
  };
}
