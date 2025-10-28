"use client";

export default function GlobalNotice() {
    return (
        <div className="sticky top-0 z-[10000] w-full bg-red-600 text-white text-xs flex items-center justify-center px-3 py-1 gap-2 text-center shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-[2px] bg-yellow-300 text-red-700 font-bold text-[10px] leading-none">
                !
            </span>
            <p>
                Ceci est une application de projet scolaire. Toutes les données,
                contenus et fonctionnalités sont fictifs.
            </p>
        </div>
    );
}
