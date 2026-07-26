"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("header");

  return (
    <div
      role="group"
      aria-label={t("languageLabel")}
      className="flex items-center gap-0.5 rounded-full border border-ink-200 bg-ink-50/60 p-1"
    >
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          aria-current={loc === locale ? "true" : undefined}
          onClick={() => router.replace(pathname, { locale: loc })}
          className={`rounded-full px-2.5 py-1 text-2xs font-semibold uppercase tracking-wide transition-colors duration-150 ease-out ${
            loc === locale ? "bg-brand-700 text-brand-50" : "text-ink-500 hover:bg-ink-100"
          }`}
        >
          {loc}
        </button>
      ))}
    </div>
  );
}
