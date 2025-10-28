"use client";

export default function FooterCookiesLink({
                                              onOpenPreferences,
                                          }: {
    onOpenPreferences: () => void;
}) {
    return (
        <button
            className="text-[12px] text-brandText-soft underline hover:text-brandText"
            onClick={onOpenPreferences}
        >
            Cookies
        </button>
    );
}
