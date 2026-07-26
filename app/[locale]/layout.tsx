import type { Metadata } from "next";
import Script from "next/script";
import { Fraunces, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { SITE_NAME, SITE_URL } from "@/lib/siteConfig";
import "../globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["opsz", "SOFT"],
});
const instrumentSans = Instrument_Sans({ subsets: ["latin"], variable: "--font-sans" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-mono" });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t("title"),
      template: `%s | ${SITE_NAME}`,
    },
    description: t("description"),
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: {
        en: `${SITE_URL}/en`,
        es: `${SITE_URL}/es`,
        "x-default": `${SITE_URL}/en`,
      },
    },
    openGraph: {
      type: "website",
      locale: locale === "es" ? "es_US" : "en_US",
      url: `${SITE_URL}/${locale}`,
      siteName: SITE_NAME,
      title: t("ogTitle"),
      description: t("ogDescription"),
    },
    twitter: {
      card: "summary_large_image",
      title: t("ogTitle"),
      description: t("ogDescription"),
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;

  if (!routing.locales.includes(locale as AppLocale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: "header" });
  const tFooter = await getTranslations({ locale, namespace: "footer" });

  return (
    <html
      lang={locale}
      className={`${fraunces.variable} ${instrumentSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="flex min-h-screen flex-col bg-[#faf8f5] font-sans text-ink-900 antialiased">
        <NextIntlClientProvider messages={messages}>
          <header className="border-b border-ink-200/70 bg-[#faf8f5]/90 backdrop-blur-sm">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
              <Link
                href="/"
                className="group flex items-center gap-2.5 font-display text-lg font-medium tracking-tight text-ink-900 transition-opacity duration-150 ease-out hover:opacity-70"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-brand-700 font-mono text-[13px] font-semibold text-brand-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_1px_2px_rgba(12,29,21,0.25)]">
                  MC
                </span>
                {SITE_NAME}
              </Link>
              <div className="flex items-center gap-4">
                <p className="hidden font-display text-sm italic text-ink-500 sm:block">
                  {t("tagline")}
                </p>
                <LanguageSwitcher />
              </div>
            </div>
          </header>

          {/* ADSENSE_SLOT_HEADER: script de verificación/carga de Google AdSense */}
          <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6200408625825852"
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />

          <div className="mx-auto grid w-full max-w-7xl flex-1 gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:py-14">
            <main className="min-w-0">{children}</main>

            <aside className="hidden lg:block">
              <div className="sticky top-8 space-y-4">
                {/* ADSENSE_SLOT_SIDEBAR: Insertar aquí el <ins class="adsbygoogle"> del bloque de anuncio lateral. No colocar el código real todavía. */}
                <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-ink-300 bg-ink-100/40 text-center text-2xs text-ink-400">
                  Espacio publicitario
                  <br />
                  (Google AdSense)
                </div>
              </div>
            </aside>
          </div>

          <footer className="border-t border-ink-200/70">
            <div className="mx-auto w-full max-w-7xl px-4 py-8 text-center text-2xs text-ink-400 sm:px-6">
              {tFooter("text", { year: new Date().getFullYear(), siteName: SITE_NAME })}
            </div>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
