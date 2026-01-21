import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: '#f3f7ed',   // Lightest - backgrounds, subtle accents
                    100: '#e8f0db',  // Light backgrounds
                    200: '#d0e0b8',  // Light borders, avatars
                    300: '#b9d194',  // Medium light
                    400: '#a1c270',  // Medium - Help card text
                    500: '#8ab34d',  // Primary - buttons, brand elements
                    600: '#6e8f3d',  // Hover states
                    700: '#536b2e',  // Text on light backgrounds
                    800: '#37471f',  // Darker text
                    900: '#1c240f',  // Darkest - Help card background
                    950: '#13190b',  // Almost black
                },
            },
        },
    },
    plugins: [],
};
export default config;
