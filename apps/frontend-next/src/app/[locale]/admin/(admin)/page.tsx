// src/app/[locale]/admin/page.tsx

import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";

export default async function AdminPage({
                                            params,
                                        }: {
    params: Promise<{ locale: string }>;
}) {
    const { locale: rawLocale } = await params;
    const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

    const dict = await getDictionary(locale);
    const t = dict.adminHome;

    return (
        <main className="p-6">
            <h1 className="text-2xl font-semibold mb-2">{t.title}</h1>
            <p className="text-brandText-soft text-sm">{t.subtitle}</p>

            <div className="mt-6 rounded-xl border border-dashed border-brandBorder p-4 text-sm text-brandText-soft">
                {t.placeholder}
            </div>
        </main>
    );
}
