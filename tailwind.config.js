const svgToDataUri = require("mini-svg-data-uri");
const flattenColorPalette =
  require("tailwindcss/lib/util/flattenColorPalette").default;

module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./styles/globals.css",
  ],
  theme: {
  	extend: {
  		backgroundImage: {
  			gradient: 'linear-gradient(60deg, #f79533, #f37055, #ef4e7b, #a166ab, #5073b8, #1098ad, #07b39b, #6fba82)'
  		},
  		animation: {
  			opacity: 'opacity 0.25s ease-in-out',
  			appearFromRight: 'appearFromRight 300ms ease-in-out',
  			wiggle: 'wiggle 1.5s ease-in-out infinite',
  			popup: 'popup 0.25s ease-in-out',
  			shimmer: 'shimmer 3s ease-out infinite alternate',
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
  		keyframes: {
  			opacity: {
  				'0%': {
  					opacity: '0'
  				},
  				'100%': {
  					opacity: '1'
  				}
  			},
  			appearFromRight: {
  				'0%': {
  					opacity: '0.3',
  					transform: 'translate(15%, 0px);'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translate(0);'
  				}
  			},
  			wiggle: {
  				'0%, 20%, 80%, 100%': {
  					transform: 'rotate(0deg)'
  				},
  				'30%, 60%': {
  					transform: 'rotate(-2deg)'
  				},
  				'40%, 70%': {
  					transform: 'rotate(2deg)'
  				},
  				'45%': {
  					transform: 'rotate(-4deg)'
  				},
  				'55%': {
  					transform: 'rotate(4deg)'
  				}
  			},
  			popup: {
  				'0%': {
  					transform: 'scale(0.8)',
  					opacity: '0.8'
  				},
  				'50%': {
  					transform: 'scale(1.1)',
  					opacity: '1'
  				},
  				'100%': {
  					transform: 'scale(1)',
  					opacity: '1'
  				}
  			},
  			shimmer: {
  				'0%': {
  					backgroundPosition: '0 50%'
  				},
  				'50%': {
  					backgroundPosition: '100% 50%'
  				},
  				'100%': {
  					backgroundPosition: '0% 50%'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		}
  	}
  },
  plugins: [
    function addVariablesForColors({ addBase, theme }) {
      let allColors = flattenColorPalette(theme("colors"));
      let newVars = Object.fromEntries(
        Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
      );

      addBase({
        ":root": newVars,
      });
    },
    function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          "bg-dot-thick": (value) => ({
            backgroundImage: `url("${svgToDataUri(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="32" height="32" fill="none" stroke="${value}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="rotate(45)"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 9l-6 6" /><path d="M10 12l2 2" /><path d="M12 10l2 2" /><path d="M8 21a5 5 0 0 0 -5 -5" /><path d="M16 3c-7.18 0 -13 5.82 -13 13a5 5 0 0 0 5 5c7.18 0 13 -5.82 13 -13a5 5 0 0 0 -5 -5" /><path d="M16 3a5 5 0 0 0 5 5" /></svg>`
            )}")`,
          }),
        },
        { values: flattenColorPalette(theme("backgroundColor")), type: "color" }
      );
    },
    require("daisyui"),
  ],
  daisyui: {
    themes: [
      "light",
      "dark",
      "forest",
      "dim",
      "black",
      "sunset",
      "night",
      "dracula",
      "luxury",
    ],
  },
};
