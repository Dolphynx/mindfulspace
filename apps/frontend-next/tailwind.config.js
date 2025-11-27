/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        // toutes les routes app et pages de CETTE app Next
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brandGreen: "#2f6fa3",
                brandBg: "#dbe8f1",
                brandBorder: "#b6cfdd",
                brandSurface: "#e8f1f7",
                brandText: {
                    DEFAULT: "#203040",
                    soft: "#4a5c6a",
                },
            },
            boxShadow: {
                card: "0 8px 24px -8px rgba(0,0,0,0.08)",
                subtle: "0 2px 4px rgba(0,0,0,0.05)",
            },
            borderRadius: {
                card: "1rem",
            },
        },
    },
    plugins: [],
};
