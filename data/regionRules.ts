/**
 * Reglas de gastos de cierre / escrituración por región, para EE. UU. y México.
 *
 * ⚠️ AVISO GENERAL — DATOS FINANCIEROS NO CONFIRMADOS:
 * Ningún valor numérico de este archivo debe tratarse como una cifra oficial vigente.
 * En México, el ISAI, los aranceles notariales y los derechos de Registro Público
 * cambian cada año y varían por municipio. En Estados Unidos, el transfer tax, el
 * costo del title insurance y las tarifas de cierre varían no solo por estado sino,
 * en varios casos, por CONDADO o incluso por CIUDAD (ver ⚠️ VERIFICAR en cada campo
 * y la nota `localityNote` de cada estado de EE. UU.). Antes de publicar cifras al
 * usuario final, se debe confirmar cada dato con una fuente vigente (departamento de
 * ingresos/hacienda estatal, colegio de notarios, title company o abogado local).
 */

/** Un tramo de una tabla progresiva (cuota fija + % sobre excedente del límite inferior). Usado en México. */
export interface RangoProgresivo {
  limiteInferior: number;
  /** Usa Infinity para el último tramo de la tabla. */
  limiteSuperior: number;
  cuotaFija: number;
  porcentajeExcedente: number;
}

/** Costo calculado como porcentaje del valor, con un piso mínimo en la moneda local. */
export interface CostoPorcentualConMinimo {
  porcentaje: number;
  minimo: number;
}

export interface ExencionPrimeraVivienda {
  aplica: boolean;
  /** Valor de la propiedad (MXN) hasta el cual el ISAI se exenta por completo. */
  valorMaximoExento: number;
}

export interface RegionConfigMX {
  country: "MX";
  regionName: string;
  isai: {
    /** Tasa efectiva de ISAI como decimal, ej. 0.045 = 4.5% */
    porcentaje: number;
    exencionPrimeraVivienda: ExencionPrimeraVivienda;
  };
  /** Tabla progresiva de honorarios notariales por rangos de valor de la propiedad. */
  honorariosNotariales: RangoProgresivo[];
  registroPublico: CostoPorcentualConMinimo;
  avaluo: CostoPorcentualConMinimo;
  /** Gastos fijos adicionales: certificados, avisos notariales, RFC notarial, etc. */
  otrosFijos: number;
  /** Gastos adicionales cuando la compra es con crédito hipotecario. */
  gastosCredito: {
    porcentajeSobreValor: number;
  };
}

export interface RegionConfigUS {
  country: "US";
  regionName: string;
  /**
   * Transfer tax (impuesto de traslado de dominio) a nivel ESTATAL únicamente.
   * En varios estados el condado o la ciudad agregan un componente adicional que
   * NO está incluido aquí — ver `variesSignificantlyByLocality` y `localityNote`.
   */
  transferTax: {
    rate: number;
    variesSignificantlyByLocality: boolean;
    localityNote: string;
  };
  /** Prima de title insurance (owner's policy) como % del valor. Varía por aseguradora/región. */
  titleInsurance: {
    rate: number;
  };
  /** Cargos de registro/grabación del condado, monto fijo aproximado. */
  recordingFees: number;
  /** Honorarios de escrow (CA/AZ) o de abogado de cierre (GA es "attorney state"). */
  escrowAttorneyFees: CostoPorcentualConMinimo;
  /** Rango típico de closing costs totales (% del valor) reportado por fuentes del sector, solo para contexto/validación en UI. */
  typicalClosingCostRange: { min: number; max: number };
  /** Costo adicional genérico de originación si la compra se financia con hipoteca. */
  mortgage: {
    originationRate: number;
  };
  /** Notas sobre impuestos/costos NO modelados explícitamente que el usuario debe conocer. */
  notModeledNote?: string;
}

export type RegionConfig = RegionConfigMX | RegionConfigUS;
export type CountryId = "US" | "MX";

export type RegionId =
  | "us-tx"
  | "us-fl"
  | "us-ca"
  | "us-az"
  | "us-ga"
  | "mx-cdmx"
  | "mx-edomex"
  | "mx-jalisco"
  | "mx-nuevoLeon";

export const regionRules: Record<RegionId, RegionConfig> = {
  // ─────────────────────────────── ESTADOS UNIDOS ───────────────────────────────
  "us-tx": {
    country: "US",
    regionName: "Texas",
    transferTax: {
      rate: 0, // ⚠️ VERIFICAR: Texas prohíbe transfer taxes estatales/municipales sobre bienes raíces (Texas Tax Code) — confirmar que no aplique una excepción local antes de publicar.
      variesSignificantlyByLocality: false,
      localityNote:
        "Texas no permite transfer tax estatal ni municipal sobre la venta de bienes raíces. Verificar excepciones locales vigentes.",
    },
    titleInsurance: {
      rate: 0.0055, // ⚠️ VERIFICAR: TX usa tarifas "promulgadas" por el Texas Department of Insurance (tabla escalonada, no un % plano) — confirmar tabla vigente.
    },
    recordingFees: 150, // ⚠️ VERIFICAR: aproximado, varía por condado y número de páginas del documento.
    escrowAttorneyFees: { porcentaje: 0.002, minimo: 350 }, // ⚠️ VERIFICAR: honorarios de title company, varían por proveedor.
    typicalClosingCostRange: { min: 0.02, max: 0.035 }, // ⚠️ VERIFICAR: rango reportado por fuentes del sector (Rocket Mortgage / Zillow), sin comisión de agentes.
    mortgage: {
      originationRate: 0.01, // ⚠️ VERIFICAR: depende del prestamista, no del estado.
    },
  },
  "us-fl": {
    country: "US",
    regionName: "Florida",
    transferTax: {
      rate: 0.007, // ⚠️ VERIFICAR: documentary stamp tax sobre la escritura, $0.70 por cada $100 en la mayoría de los condados.
      variesSignificantlyByLocality: true,
      localityNote:
        "Miami-Dade County usa una tasa distinta ($0.60 por $100) y agrega un surtax adicional en propiedades que no son unifamiliares. Confirmar condado exacto antes de publicar.",
    },
    titleInsurance: {
      rate: 0.0055, // ⚠️ VERIFICAR: FL también usa tarifas promulgadas escalonadas (Florida Office of Insurance Regulation).
    },
    recordingFees: 200, // ⚠️ VERIFICAR: FL cobra recording fee por página más doc stamps separados sobre el pagaré hipotecario si aplica.
    escrowAttorneyFees: { porcentaje: 0.0025, minimo: 400 }, // ⚠️ VERIFICAR: cierre puede ser con title company o abogado, honorarios varían.
    typicalClosingCostRange: { min: 0.02, max: 0.04 },
    mortgage: {
      originationRate: 0.01, // ⚠️ VERIFICAR: depende del prestamista.
    },
  },
  "us-ca": {
    country: "US",
    regionName: "California",
    transferTax: {
      rate: 0.0011, // ⚠️ VERIFICAR: piso de county documentary transfer tax ($1.10 por $1,000). NO incluye transfer tax de ciudad.
      variesSignificantlyByLocality: true,
      localityNote:
        "Varias ciudades (San Francisco, Los Ángeles, Oakland, Santa Mónica, Berkeley) cobran un transfer tax ADICIONAL propio, en algunos casos varios puntos porcentuales más (ej. San Francisco y Los Ángeles/Measure ULA en propiedades de alto valor). El % estatal/de condado por sí solo puede subestimar mucho el total real — confirmar la ciudad exacta.",
    },
    titleInsurance: {
      rate: 0.005, // ⚠️ VERIFICAR: en CA las tarifas de title insurance no están reguladas por el estado y varían por aseguradora y región (norte vs. sur de CA).
    },
    recordingFees: 225, // ⚠️ VERIFICAR: algunos condados de CA cobran fees adicionales por página/por parcela notablemente más altos.
    escrowAttorneyFees: { porcentaje: 0.002, minimo: 500 }, // ⚠️ VERIFICAR: honorarios de escrow company, varían por proveedor y región.
    typicalClosingCostRange: { min: 0.02, max: 0.05 }, // ⚠️ VERIFICAR: rango amplio por la variación de transfer tax municipal.
    mortgage: {
      originationRate: 0.01, // ⚠️ VERIFICAR: depende del prestamista.
    },
  },
  "us-az": {
    country: "US",
    regionName: "Arizona",
    transferTax: {
      rate: 0, // ⚠️ VERIFICAR: Arizona prohíbe el real estate transfer tax por ley estatal — confirmar vigencia.
      variesSignificantlyByLocality: false,
      localityNote: "Arizona no permite transfer tax estatal ni municipal sobre bienes raíces residenciales.",
    },
    titleInsurance: {
      rate: 0.0045, // ⚠️ VERIFICAR: tarifas filed-not-set, aproximadas.
    },
    recordingFees: 40, // ⚠️ VERIFICAR: AZ tiene recording fees relativamente bajos, confirmar tarifa vigente del condado.
    escrowAttorneyFees: { porcentaje: 0.0015, minimo: 400 }, // ⚠️ VERIFICAR: honorarios de escrow company.
    typicalClosingCostRange: { min: 0.015, max: 0.03 },
    mortgage: {
      originationRate: 0.01, // ⚠️ VERIFICAR: depende del prestamista.
    },
  },
  "us-ga": {
    country: "US",
    regionName: "Georgia",
    transferTax: {
      rate: 0.001, // ⚠️ VERIFICAR: transfer tax estatal sobre la escritura, $1.00 por cada $1,000 — relativamente uniforme, pero confirmar vigencia.
      variesSignificantlyByLocality: false,
      localityNote:
        "Relativamente uniforme a nivel estatal comparado con FL/CA, pero confirmar si el condado aplica algún cargo adicional.",
    },
    titleInsurance: {
      rate: 0.005, // ⚠️ VERIFICAR: tarifas promulgadas por el Georgia Insurance Department.
    },
    recordingFees: 30, // ⚠️ VERIFICAR: aproximado.
    escrowAttorneyFees: { porcentaje: 0.003, minimo: 500 }, // ⚠️ VERIFICAR: Georgia exige abogado para el cierre ("attorney state"), honorarios más altos que en estados de solo-escrow.
    typicalClosingCostRange: { min: 0.02, max: 0.035 },
    mortgage: {
      originationRate: 0.01, // ⚠️ VERIFICAR: depende del prestamista.
    },
    notModeledNote:
      "Georgia cobra además un intangible recording tax sobre el PAGARÉ hipotecario (~0.30% del monto financiado) cuando la compra se financia. Este cargo es distinto de la comisión de originación y NO está incluido en el cálculo — verificar y sumar aparte si aplica.",
  },

  // ─────────────────────────────────── MÉXICO ───────────────────────────────────
  "mx-cdmx": {
    country: "MX",
    regionName: "Ciudad de México",
    isai: {
      porcentaje: 0.045, // ⚠️ VERIFICAR: tasa efectiva aproximada, la CDMX calcula el ISAI con tablas de valor catastral en UMAs.
      exencionPrimeraVivienda: { aplica: true, valorMaximoExento: 800_000 },
    },
    honorariosNotariales: [
      { limiteInferior: 0, limiteSuperior: 300_000, cuotaFija: 0, porcentajeExcedente: 0.03 },
      { limiteInferior: 300_000, limiteSuperior: 700_000, cuotaFija: 9_000, porcentajeExcedente: 0.025 },
      { limiteInferior: 700_000, limiteSuperior: 1_500_000, cuotaFija: 19_000, porcentajeExcedente: 0.02 },
      { limiteInferior: 1_500_000, limiteSuperior: 3_000_000, cuotaFija: 35_000, porcentajeExcedente: 0.015 },
      { limiteInferior: 3_000_000, limiteSuperior: Infinity, cuotaFija: 57_500, porcentajeExcedente: 0.012 },
    ],
    registroPublico: { porcentaje: 0.005, minimo: 2_000 },
    avaluo: { porcentaje: 0.006, minimo: 3_000 },
    otrosFijos: 4_500,
    gastosCredito: { porcentajeSobreValor: 0.016 },
  },
  "mx-edomex": {
    country: "MX",
    regionName: "Estado de México",
    isai: {
      porcentaje: 0.035, // ⚠️ VERIFICAR
      exencionPrimeraVivienda: { aplica: true, valorMaximoExento: 400_000 },
    },
    honorariosNotariales: [
      { limiteInferior: 0, limiteSuperior: 300_000, cuotaFija: 0, porcentajeExcedente: 0.028 },
      { limiteInferior: 300_000, limiteSuperior: 700_000, cuotaFija: 8_400, porcentajeExcedente: 0.023 },
      { limiteInferior: 700_000, limiteSuperior: 1_500_000, cuotaFija: 17_600, porcentajeExcedente: 0.019 },
      { limiteInferior: 1_500_000, limiteSuperior: 3_000_000, cuotaFija: 32_800, porcentajeExcedente: 0.014 },
      { limiteInferior: 3_000_000, limiteSuperior: Infinity, cuotaFija: 53_800, porcentajeExcedente: 0.011 },
    ],
    registroPublico: { porcentaje: 0.0045, minimo: 1_800 },
    avaluo: { porcentaje: 0.0055, minimo: 2_800 },
    otrosFijos: 4_000,
    gastosCredito: { porcentajeSobreValor: 0.015 },
  },
  "mx-jalisco": {
    country: "MX",
    regionName: "Jalisco",
    isai: {
      porcentaje: 0.02, // ⚠️ VERIFICAR
      exencionPrimeraVivienda: { aplica: true, valorMaximoExento: 500_000 },
    },
    honorariosNotariales: [
      { limiteInferior: 0, limiteSuperior: 300_000, cuotaFija: 0, porcentajeExcedente: 0.025 },
      { limiteInferior: 300_000, limiteSuperior: 700_000, cuotaFija: 7_500, porcentajeExcedente: 0.02 },
      { limiteInferior: 700_000, limiteSuperior: 1_500_000, cuotaFija: 15_500, porcentajeExcedente: 0.016 },
      { limiteInferior: 1_500_000, limiteSuperior: 3_000_000, cuotaFija: 28_300, porcentajeExcedente: 0.012 },
      { limiteInferior: 3_000_000, limiteSuperior: Infinity, cuotaFija: 46_300, porcentajeExcedente: 0.01 },
    ],
    registroPublico: { porcentaje: 0.004, minimo: 1_500 },
    avaluo: { porcentaje: 0.005, minimo: 2_500 },
    otrosFijos: 3_500,
    gastosCredito: { porcentajeSobreValor: 0.013 },
  },
  "mx-nuevoLeon": {
    country: "MX",
    regionName: "Nuevo León",
    isai: {
      porcentaje: 0.02, // ⚠️ VERIFICAR
      exencionPrimeraVivienda: { aplica: true, valorMaximoExento: 600_000 },
    },
    honorariosNotariales: [
      { limiteInferior: 0, limiteSuperior: 300_000, cuotaFija: 0, porcentajeExcedente: 0.026 },
      { limiteInferior: 300_000, limiteSuperior: 700_000, cuotaFija: 7_800, porcentajeExcedente: 0.021 },
      { limiteInferior: 700_000, limiteSuperior: 1_500_000, cuotaFija: 16_200, porcentajeExcedente: 0.017 },
      { limiteInferior: 1_500_000, limiteSuperior: 3_000_000, cuotaFija: 29_800, porcentajeExcedente: 0.013 },
      { limiteInferior: 3_000_000, limiteSuperior: Infinity, cuotaFija: 49_300, porcentajeExcedente: 0.0105 },
    ],
    registroPublico: { porcentaje: 0.004, minimo: 1_500 },
    avaluo: { porcentaje: 0.005, minimo: 2_500 },
    otrosFijos: 3_500,
    gastosCredito: { porcentajeSobreValor: 0.013 },
  },
};

export function getRegionsForCountry(country: CountryId): { id: RegionId; nombre: string }[] {
  return (Object.keys(regionRules) as RegionId[])
    .filter((id) => regionRules[id].country === country)
    .map((id) => ({ id, nombre: regionRules[id].regionName }));
}
