/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["dark"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
      borderRadius: {
        lg: "24px",
        md: "16px",
        sm: "8px",
      },
      borderWidth: {
        lg: "5px",
        md: "2px",
        sm: "1px",
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  daisyui: {
    themes: [
      {
        morpheus: {
          primary: "#B3005E",
          secondary: "#17183b",
          accent: "#FF5F9E",
          neutral: "#14172D",
          "base-100": "#252238",
          info: "#01c2c2",
          success: "#70cc6e",
          warning: "#ea940d",
          error: "#da4444",
        },
      },
      "dark",
      "light",
    ],
  },
};
