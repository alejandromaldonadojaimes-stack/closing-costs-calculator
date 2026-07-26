const mxnFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatMXN(valor: number): string {
  return mxnFormatter.format(Number.isFinite(valor) ? valor : 0);
}

export function formatUSD(valor: number): string {
  return usdFormatter.format(Number.isFinite(valor) ? valor : 0);
}

/** Convierte lo que el usuario escribe (con $, comas, letras, etc.) en un entero limpio. */
export function parseDigitsToNumber(texto: string): number {
  const soloDigitos = texto.replace(/[^0-9]/g, "");
  if (!soloDigitos) return 0;
  return Number(soloDigitos);
}
