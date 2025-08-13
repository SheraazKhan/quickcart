// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { 600: "#4f46e5", 700: "#4338ca" }, // indigo
        accent: { 600: "#10b981", 700: "#059669" } // emerald
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.06), 0 10px 20px rgba(0,0,0,0.06)"
      },
      borderRadius: { xl: "14px" }
    }
  },
  plugins: []
};
