"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  regionRules,
  getRegionsForCountry,
  CountryId,
  RegionId,
} from "@/data/regionRules";
import { calcularEscrituracion, FormaPago } from "@/lib/calculations/calcularEscrituracion";
import { calculateClosingCostsUS } from "@/lib/calculations/calculateClosingCostsUS";
import { formatMXN, formatUSD, parseDigitsToNumber } from "@/lib/format";

interface FilaDesglose {
  key: string;
  etiqueta: string;
  valor: number;
  ayuda: string;
}

/** Interpola hacia el nuevo valor en vez de saltar de golpe; retargetable si llega un valor nuevo a medio vuelo. */
function useCountUp(value: number, duration = 480) {
  const [display, setDisplay] = useState(value);
  const displayRef = useRef(value);
  const rafRef = useRef<number>();

  useEffect(() => {
    const from = displayRef.current;
    const to = value;
    if (Math.abs(from - to) < 0.005) {
      setDisplay(to);
      displayRef.current = to;
      return;
    }
    const start = performance.now();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t); // ease-out-expo
      const current = from + (to - from) * eased;
      displayRef.current = current;
      setDisplay(current);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  return display;
}

const countryOrder: CountryId[] = ["US", "MX"];

export default function ClosingCostsCalculator() {
  const t = useTranslations("calculator");

  const [country, setCountry] = useState<CountryId>("US");
  const [regionId, setRegionId] = useState<RegionId>("us-tx");
  const [valorTexto, setValorTexto] = useState("400,000");
  const [formaPago, setFormaPago] = useState<FormaPago>("contado");
  const [esPrimeraVivienda, setEsPrimeraVivienda] = useState(false);

  const regionsForCountry = useMemo(() => getRegionsForCountry(country), [country]);
  const region = regionRules[regionId];
  const valorPropiedad = useMemo(() => parseDigitsToNumber(valorTexto), [valorTexto]);

  const handleCountryChange = (nextCountry: CountryId) => {
    setCountry(nextCountry);
    const firstRegion = getRegionsForCountry(nextCountry)[0];
    if (firstRegion) setRegionId(firstRegion.id);
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numero = parseDigitsToNumber(e.target.value);
    setValorTexto(numero > 0 ? numero.toLocaleString("en-US") : "");
  };

  const view = useMemo(() => {
    if (region.country === "MX") {
      const data = calcularEscrituracion({
        valorPropiedad,
        estado: region,
        formaPago,
        esPrimeraVivienda,
      });
      const rows: FilaDesglose[] = [
        {
          key: "isai",
          etiqueta: t("labels.mx.isai"),
          valor: data.isai,
          ayuda: data.isaiExento
            ? t("labels.mx.isaiHelpExempt")
            : t("labels.mx.isaiHelpRate", { rate: (region.isai.porcentaje * 100).toFixed(2) }),
        },
        {
          key: "honorarios",
          etiqueta: t("labels.mx.honorariosNotariales"),
          valor: data.honorariosNotariales,
          ayuda: t("labels.mx.honorariosNotarialesHelp"),
        },
        { key: "avaluo", etiqueta: t("labels.mx.avaluo"), valor: data.avaluo, ayuda: t("labels.mx.avaluoHelp") },
        {
          key: "registro",
          etiqueta: t("labels.mx.registroPublico"),
          valor: data.registroPublico,
          ayuda: t("labels.mx.registroPublicoHelp"),
        },
        {
          key: "otros",
          etiqueta: t("labels.mx.otrosFijos"),
          valor: data.otrosFijos,
          ayuda: t("labels.mx.otrosFijosHelp"),
        },
      ];
      if (formaPago === "credito") {
        rows.push({
          key: "creditoMx",
          etiqueta: t("labels.mx.gastosCredito"),
          valor: data.gastosCredito,
          ayuda: t("labels.mx.gastosCreditoHelp"),
        });
      }
      return {
        rows,
        total: data.total,
        percentage: data.porcentajeSobreValor,
        disclaimer: t("disclaimerMX"),
        formatCurrency: formatMXN,
      };
    }

    const data = calculateClosingCostsUS({ propertyValue: valorPropiedad, region, formaPago });
    const rows: FilaDesglose[] = [
      {
        key: "transferTax",
        etiqueta: t("labels.us.transferTax"),
        valor: data.transferTax,
        ayuda:
          region.transferTax.rate > 0
            ? t("labels.us.transferTaxHelpRate", { rate: (region.transferTax.rate * 100).toFixed(2) })
            : t("labels.us.transferTaxHelpNone"),
      },
      {
        key: "titleInsurance",
        etiqueta: t("labels.us.titleInsurance"),
        valor: data.titleInsurance,
        ayuda: t("labels.us.titleInsuranceHelp"),
      },
      {
        key: "recordingFees",
        etiqueta: t("labels.us.recordingFees"),
        valor: data.recordingFees,
        ayuda: t("labels.us.recordingFeesHelp"),
      },
      {
        key: "escrowAttorneyFees",
        etiqueta: t("labels.us.escrowAttorneyFees"),
        valor: data.escrowAttorneyFees,
        ayuda: t("labels.us.escrowAttorneyFeesHelp"),
      },
    ];
    if (formaPago === "credito") {
      rows.push({
        key: "mortgageOrigination",
        etiqueta: t("labels.us.mortgageOrigination"),
        valor: data.mortgageOrigination,
        ayuda: t("labels.us.mortgageOriginationHelp"),
      });
    }
    return {
      rows,
      total: data.total,
      percentage: data.percentageOfValue,
      disclaimer: t("disclaimerUS"),
      formatCurrency: formatUSD,
    };
  }, [region, valorPropiedad, formaPago, esPrimeraVivienda, t]);

  const totalAnimado = useCountUp(view.total);
  const porcentajeAnimado = useCountUp(view.percentage, 400);
  const pillIndex = formaPago === "credito" ? 1 : 0;
  const currencyCode = region.country === "US" ? "USD" : "MXN";

  return (
    <div id="calculator" className="grid gap-6 lg:grid-cols-5 lg:items-start">
      {/* Formulario */}
      <div className="rounded-[28px] border border-ink-200/70 bg-white p-7 shadow-card sm:p-8 lg:col-span-2">
        <h2 className="font-display text-xl font-medium tracking-tight text-ink-900">{t("formTitle")}</h2>
        <p className="mt-1.5 text-sm text-ink-500">{t("formSubtitle")}</p>

        <div className="mt-7">
          <label htmlFor="country" className="block text-sm font-medium text-ink-700">
            {t("countryLabel")}
          </label>
          <div className="relative mt-2 grid grid-cols-2 rounded-2xl bg-ink-100/70 p-1">
            <div
              aria-hidden
              className="absolute inset-y-1 w-[calc(50%-4px)] rounded-xl bg-white shadow-card transition-transform duration-250 ease-out-expo"
              style={{
                transform:
                  countryOrder.indexOf(country) === 1 ? "translateX(calc(100% + 4px))" : "translateX(0)",
              }}
            />
            {countryOrder.map((c) => (
              <label
                key={c}
                className="relative z-10 flex cursor-pointer select-none items-center justify-center rounded-xl py-2.5 text-center text-sm font-medium transition-[color,transform] duration-150 ease-out active:scale-[0.98]"
              >
                <input
                  type="radio"
                  name="country"
                  value={c}
                  checked={country === c}
                  onChange={() => handleCountryChange(c)}
                  className="sr-only"
                />
                <span className={country === c ? "text-brand-800" : "text-ink-500"}>
                  {t(`countryOptions.${c}`)}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <label htmlFor="region" className="block text-sm font-medium text-ink-700">
            {t(`regionLabel.${country}`)}
          </label>
          <div className="focus-shape relative mt-2 rounded-2xl border border-ink-200 bg-ink-50/60 transition-colors duration-180 ease-out-expo hover:border-ink-300 focus-within:border-brand-600 focus-within:bg-white">
            <select
              id="region"
              value={regionId}
              onChange={(e) => setRegionId(e.target.value as RegionId)}
              className="w-full appearance-none rounded-2xl bg-transparent py-3.5 pl-4 pr-10 text-base font-medium text-ink-900 outline-none"
            >
              {regionsForCountry.map((r) => (
                <option key={r.id} value={r.id}>
                  {t(`regionNames.${r.id}`)}
                </option>
              ))}
            </select>
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="pointer-events-none absolute inset-y-0 right-4 my-auto h-4 w-4 text-ink-400"
            >
              <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <div className="mt-6">
          <label htmlFor="valorPropiedad" className="block text-sm font-medium text-ink-700">
            {t("propertyValueLabel")}
          </label>
          <div className="focus-shape relative mt-2 rounded-2xl border border-ink-200 bg-ink-50/60 transition-colors duration-180 ease-out-expo hover:border-ink-300 focus-within:border-brand-600 focus-within:bg-white">
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center font-mono text-base text-ink-400">
              $
            </span>
            <input
              id="valorPropiedad"
              inputMode="numeric"
              autoComplete="off"
              value={valorTexto}
              onChange={handleValorChange}
              placeholder="400,000"
              className="tabular w-full rounded-2xl bg-transparent py-3.5 pl-9 pr-14 font-mono text-lg font-semibold text-ink-900 outline-none"
            />
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-2xs font-medium tracking-wide text-ink-400">
              {currencyCode}
            </span>
          </div>
        </div>

        <fieldset className="mt-7">
          <legend className="block text-sm font-medium text-ink-700">{t("paymentMethodLabel")}</legend>
          <div className="relative mt-2 grid grid-cols-2 rounded-2xl bg-ink-100/70 p-1">
            <div
              aria-hidden
              className="absolute inset-y-1 w-[calc(50%-4px)] rounded-xl bg-white shadow-card transition-transform duration-250 ease-out-expo"
              style={{ transform: pillIndex === 1 ? "translateX(calc(100% + 4px))" : "translateX(0)" }}
            />
            {(["contado", "credito"] as FormaPago[]).map((opcion) => (
              <label
                key={opcion}
                className="relative z-10 flex cursor-pointer select-none items-center justify-center rounded-xl py-2.5 text-center text-sm font-medium transition-[color,transform] duration-150 ease-out active:scale-[0.98]"
              >
                <input
                  type="radio"
                  name="formaPago"
                  value={opcion}
                  checked={formaPago === opcion}
                  onChange={() => setFormaPago(opcion)}
                  className="sr-only"
                />
                <span className={formaPago === opcion ? "text-brand-800" : "text-ink-500"}>
                  {t(`paymentOptions.${country}.${opcion}`)}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {region.country === "MX" && (
          <label className="mt-8 flex cursor-pointer items-start gap-3.5 rounded-2xl border border-ink-200 bg-ink-50/50 p-4 transition-colors duration-150 ease-out hover:bg-ink-100/50 active:scale-[0.995]">
            <input
              type="checkbox"
              checked={esPrimeraVivienda}
              onChange={(e) => setEsPrimeraVivienda(e.target.checked)}
              className="peer sr-only"
            />
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[7px] border border-ink-300 bg-white transition-all duration-180 ease-out-expo peer-checked:border-brand-600 peer-checked:bg-brand-600 peer-focus-visible:shadow-focus-ring">
              <svg viewBox="0 0 16 16" className="h-3 w-3 overflow-visible" fill="none">
                <path
                  d="M3.5 8.3L6.4 11.2L12.5 4.6"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength="1"
                  style={{
                    strokeDasharray: 1,
                    strokeDashoffset: esPrimeraVivienda ? 0 : 1,
                    transition: esPrimeraVivienda
                      ? "stroke-dashoffset 260ms cubic-bezier(0.16,1,0.3,1) 40ms"
                      : "stroke-dashoffset 120ms ease-out",
                  }}
                />
              </svg>
            </span>
            <span className="text-sm text-ink-700">
              <span className="font-medium text-ink-800">{t("firstHomeLabel")}</span>
              <span className="mt-0.5 block text-2xs leading-relaxed text-ink-500">{t("firstHomeHelp")}</span>
            </span>
          </label>
        )}
      </div>

      {/* Resultados */}
      <div className="rounded-[28px] border border-ink-200/70 bg-white p-7 shadow-card sm:p-8 lg:col-span-3">
        <h2 className="font-display text-xl font-medium tracking-tight text-ink-900">{t("resultsTitle")}</h2>
        <p className="mt-1.5 text-sm text-ink-500">
          {t("resultsSubtitle", { region: t(`regionNames.${regionId}`) })}
        </p>

        <div className="mt-6 divide-y divide-ink-100">
          {view.rows.map((fila) => (
            <div key={fila.key} className="flex items-start justify-between gap-4 py-3.5">
              <div>
                <p className="text-sm font-medium text-ink-800">{fila.etiqueta}</p>
                <p className="mt-0.5 text-2xs leading-relaxed text-ink-500">{fila.ayuda}</p>
              </div>
              <p className="tabular whitespace-nowrap font-mono text-sm font-semibold text-ink-900">
                {view.formatCurrency(fila.valor)}
              </p>
            </div>
          ))}
        </div>

        <div className="relative mt-6 overflow-hidden rounded-[24px] bg-gradient-to-br from-brand-700 to-brand-950 p-8 text-white shadow-total sm:p-9">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_140%_at_0%_0%,rgba(255,255,255,0.10),transparent_55%)]"
          />
          <div className="relative flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-2xs font-medium uppercase tracking-[0.08em] text-brand-200/80">
                {t("totalLabel")}
              </p>
              <p className="tabular mt-1.5 font-mono text-figure font-semibold text-white">
                {view.formatCurrency(totalAnimado)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-right backdrop-blur-sm">
              <p className="text-2xs text-brand-200/80">{t("percentageLabel")}</p>
              <p className="tabular font-mono text-xl font-semibold text-white">
                {porcentajeAnimado.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>

        <p className="mt-5 text-2xs leading-relaxed text-ink-400">{view.disclaimer}</p>
      </div>
    </div>
  );
}
