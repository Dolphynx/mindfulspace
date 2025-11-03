"use client";

export default function FooterCookiesLink({
                                              onOpenPreferencesAction,
                                          }: {
    onOpenPreferencesAction: () => void;
}) {
    return (
        <button
            className="text-[12px] text-brandText-soft underline hover:text-brandText"
            onClick={onOpenPreferencesAction}
        >
            Cookies
        </button>
    );
}
