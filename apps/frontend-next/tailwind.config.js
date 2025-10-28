/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        // toutes les routes app et pages de CETTE app Next
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brandGreen: "#3b7a48",
                brandBg: "#f7fcf8",
                brandBorder: "#d9eadf",
                brandSurface: "#eefaf2",
                brandText: {
                    DEFAULT: "#2f3a2f",
                    soft: "#4a5a4a",
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
