import { getTranslations, setRequestLocale } from "next-intl/server";
import ClosingCostsCalculator from "@/components/ClosingCostsCalculator";
import Faq, { FaqItem } from "@/components/Faq";

export default async function HomePage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "home" });
  const tFaq = await getTranslations({ locale, namespace: "faq" });
  const faqItems = tFaq.raw("items") as FaqItem[];

  return (
    <div className="pb-16">
      <section>
        <h1 className="max-w-3xl font-display text-display font-medium tracking-tight text-ink-900">
          {t("h1")}
        </h1>
        <p className="mt-5 max-w-[62ch] text-base leading-relaxed text-ink-600">{t("intro")}</p>
      </section>

      <section className="mt-10">
        <ClosingCostsCalculator />
      </section>

      <section className="mt-20 max-w-[68ch] space-y-12">
        <div>
          <h2 className="font-display text-display-sm font-medium tracking-tight text-ink-900">
            {t("sections.whatAreClosingCosts.title")}
          </h2>
          <p className="mt-4 leading-relaxed text-ink-600">
            {t("sections.whatAreClosingCosts.body")}
          </p>
        </div>

        <div>
          <h2 className="font-display text-display-sm font-medium tracking-tight text-ink-900">
            {t("sections.whatsIncluded.title")}
          </h2>
          <p className="mt-4 leading-relaxed text-ink-600">{t("sections.whatsIncluded.body")}</p>
        </div>

        <div>
          <h2 className="font-display text-display-sm font-medium tracking-tight text-ink-900">
            {t("sections.howToUse.title")}
          </h2>
          <p className="mt-4 leading-relaxed text-ink-600">{t("sections.howToUse.body")}</p>
        </div>

        <div id="mexico">
          <h2 className="font-display text-display-sm font-medium tracking-tight text-ink-900">
            {t("sections.mexicoNote.title")}
          </h2>
          <p className="mt-4 leading-relaxed text-ink-600">{t("sections.mexicoNote.body")}</p>
        </div>
      </section>

      <Faq heading={tFaq("heading")} items={faqItems} />
    </div>
  );
}
