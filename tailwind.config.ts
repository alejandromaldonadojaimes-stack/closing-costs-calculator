import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Verde bosque — sustituye el índigo/violeta por defecto. Asociación
        // "tierra / propiedad / dinero que crece", no "SaaS genérico".
        brand: {
          50: "#f0f7f2",
          100: "#dcebe0",
          200: "#b9d7c3",
          300: "#8cbb9d",
          400: "#5c9973",
          500: "#3c7c56",
          600: "#296342",
          700: "#204f36",
          800: "#1b3f2c",
          900: "#173425",
          950: "#0c1d15",
        },
        // Terracota cálido — acento humano, no semántico "success".
        clay: {
          50: "#fdf4ef",
          100: "#fae3d5",
          200: "#f3c2a4",
          300: "#ea9c6c",
          400: "#df7943",
          500: "#c9602c",
          600: "#a84c22",
          700: "#873c1c",
          800: "#6d321c",
          900: "#5a2b19",
        },
        // Neutros cálidos (piedra, no gris-azulado) para fondo y texto.
        ink: {
          50: "#faf8f5",
          100: "#f3efe9",
          200: "#e6ded3",
          300: "#d3c6b3",
          400: "#ac9c85",
          500: "#8a7c68",
          600: "#6b5f4f",
          700: "#544a3d",
          800: "#3a332a",
          900: "#26221c",
          950: "#171410",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        // Escala editorial con pasos intencionales, no la genérica sm/base/lg.
        "2xs": ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.02em" }],
        display: ["clamp(2.25rem, 1.6rem + 2.6vw, 3.75rem)", { lineHeight: "1.04", letterSpacing: "-0.03em" }],
        "display-sm": ["clamp(1.75rem, 1.4rem + 1.4vw, 2.5rem)", { lineHeight: "1.08", letterSpacing: "-0.025em" }],
        figure: ["clamp(2.5rem, 2.1rem + 1.6vw, 3.5rem)", { lineHeight: "1", letterSpacing: "-0.02em" }],
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "out-quart": "cubic-bezier(0.25, 1, 0.5, 1)",
        "in-out-quart": "cubic-bezier(0.77, 0, 0.175, 1)",
      },
      boxShadow: {
        // Multicapa: ambiente + directa + borde de contención. Nunca una sola sombra plana.
        card: "0 1px 1px rgba(23, 20, 16, 0.03), 0 6px 16px -8px rgba(23, 20, 16, 0.08), 0 0 0 1px rgba(23, 20, 16, 0.04)",
        "card-hover": "0 2px 3px rgba(23, 20, 16, 0.04), 0 16px 32px -12px rgba(23, 20, 16, 0.14), 0 0 0 1px rgba(23, 20, 16, 0.05)",
        total: "0 1px 2px rgba(12, 29, 21, 0.15), 0 20px 40px -16px rgba(12, 29, 21, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
        "focus-ring": "0 0 0 3.5px rgba(41, 99, 66, 0.18)",
      },
      keyframes: {
        "check-draw": {
          "0%": { strokeDashoffset: "16" },
          "100%": { strokeDashoffset: "0" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "translateY(4px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        "check-draw": "check-draw 220ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pop-in": "pop-in 320ms cubic-bezier(0.16, 1, 0.3, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
