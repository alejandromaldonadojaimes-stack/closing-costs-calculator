import { RegionConfigMX, RangoProgresivo } from "@/data/regionRules";

export type FormaPago = "contado" | "credito";

export interface DatosCalculadora {
  valorPropiedad: number;
  estado: RegionConfigMX;
  formaPago: FormaPago;
  esPrimeraVivienda: boolean;
}

export interface DesgloseEscrituracion {
  isai: number;
  isaiExento: boolean;
  honorariosNotariales: number;
  avaluo: number;
  registroPublico: number;
  otrosFijos: number;
  gastosCredito: number;
  total: number;
  porcentajeSobreValor: number;
}

function buscarRango(valor: number, tabla: RangoProgresivo[]): RangoProgresivo {
  return (
    tabla.find((rango) => valor >= rango.limiteInferior && valor < rango.limiteSuperior) ??
    tabla[tabla.length - 1]
  );
}

function calcularHonorariosNotariales(valor: number, tabla: RangoProgresivo[]): number {
  if (valor <= 0) return 0;
  const rango = buscarRango(valor, tabla);
  return rango.cuotaFija + (valor - rango.limiteInferior) * rango.porcentajeExcedente;
}

function calcularISAI(
  valor: number,
  estado: RegionConfigMX,
  esPrimeraVivienda: boolean
): { monto: number; exento: boolean } {
  const { exencionPrimeraVivienda } = estado.isai;
  const exento =
    esPrimeraVivienda && exencionPrimeraVivienda.aplica && valor <= exencionPrimeraVivienda.valorMaximoExento;

  return { monto: exento ? 0 : valor * estado.isai.porcentaje, exento };
}

function calcularConMinimo(valor: number, config: { porcentaje: number; minimo: number }): number {
  if (valor <= 0) return 0;
  return Math.max(valor * config.porcentaje, config.minimo);
}

export function calcularEscrituracion({
  valorPropiedad,
  estado,
  formaPago,
  esPrimeraVivienda,
}: DatosCalculadora): DesgloseEscrituracion {
  const valor = Number.isFinite(valorPropiedad) && valorPropiedad > 0 ? valorPropiedad : 0;

  const { monto: isai, exento: isaiExento } = calcularISAI(valor, estado, esPrimeraVivienda);
  const honorariosNotariales = calcularHonorariosNotariales(valor, estado.honorariosNotariales);
  const avaluo = calcularConMinimo(valor, estado.avaluo);
  const registroPublico = calcularConMinimo(valor, estado.registroPublico);
  const otrosFijos = valor > 0 ? estado.otrosFijos : 0;
  const gastosCredito = formaPago === "credito" ? valor * estado.gastosCredito.porcentajeSobreValor : 0;

  const total = isai + honorariosNotariales + avaluo + registroPublico + otrosFijos + gastosCredito;
  const porcentajeSobreValor = valor > 0 ? (total / valor) * 100 : 0;

  return {
    isai,
    isaiExento,
    honorariosNotariales,
    avaluo,
    registroPublico,
    otrosFijos,
    gastosCredito,
    total,
    porcentajeSobreValor,
  };
}
