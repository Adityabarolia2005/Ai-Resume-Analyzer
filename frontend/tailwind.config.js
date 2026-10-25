/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,jsx}"],
    theme: {
        extend: {
            colors: {
                ink: "#172033",
                mist: "#f4f7fb",
                brand: {
                    50: "#eef2ff",
                    300: "#a5b4fc",
                    500: "#6366f1",
                    600: "#4f46e5",
                    700: "#4338ca"
                }
            },
            boxShadow: {
                soft: "0 16px 50px rgba(33, 44, 77, 0.08)"
            }
        }
    },
    plugins: []
};
