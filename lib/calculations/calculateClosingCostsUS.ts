import { RegionConfigUS } from "@/data/regionRules";
import { FormaPago } from "./calcularEscrituracion";

export interface DatosCalculadoraUS {
  propertyValue: number;
  region: RegionConfigUS;
  formaPago: FormaPago;
}

export interface ClosingCostsBreakdownUS {
  transferTax: number;
  titleInsurance: number;
  recordingFees: number;
  escrowAttorneyFees: number;
  mortgageOrigination: number;
  total: number;
  percentageOfValue: number;
}

function calcularConMinimo(valor: number, config: { porcentaje: number; minimo: number }): number {
  if (valor <= 0) return 0;
  return Math.max(valor * config.porcentaje, config.minimo);
}

export function calculateClosingCostsUS({
  propertyValue,
  region,
  formaPago,
}: DatosCalculadoraUS): ClosingCostsBreakdownUS {
  const value = Number.isFinite(propertyValue) && propertyValue > 0 ? propertyValue : 0;

  const transferTax = value * region.transferTax.rate;
  const titleInsurance = value * region.titleInsurance.rate;
  const recordingFees = value > 0 ? region.recordingFees : 0;
  const escrowAttorneyFees = calcularConMinimo(value, region.escrowAttorneyFees);
  const mortgageOrigination = formaPago === "credito" ? value * region.mortgage.originationRate : 0;

  const total = transferTax + titleInsurance + recordingFees + escrowAttorneyFees + mortgageOrigination;
  const percentageOfValue = value > 0 ? (total / value) * 100 : 0;

  return {
    transferTax,
    titleInsurance,
    recordingFees,
    escrowAttorneyFees,
    mortgageOrigination,
    total,
    percentageOfValue,
  };
}
