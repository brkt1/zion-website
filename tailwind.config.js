/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // YENEGE Primary Colors
        'yenege-yellow': '#FFD447',      // Yenege Sunrise Yellow - Brand Happiness
        'indigo-deep': '#1C2951',        // Deep Indigo Blue - Professional + Futuristic
        
        // YENEGE Secondary Colors
        'coral-orange': '#FF6F5E',       // Vibrant Coral Orange - Energy, fun, movement
        'purple-electric': '#7B5CFF',    // Electric Purple - Futuristic, youth culture
        'teal-breeze': '#3CCFCF',        // Teal Breeze - Travel, calming balance
        
        // YENEGE Neutral Colors
        'soft-white': '#F7F7F9',         // Soft White - Clean, minimal, futuristic
        'space-grey': '#202124',         // Space Grey - Contrast & elegance
        
        // Legacy colors (kept for backward compatibility)
        'black-primary': '#0a0a0a',
        'black-secondary': '#1a1a1a',
        'gray-dark': '#2a2a2a',
        'gray-medium': '#3a3a3a',
        'gray-light': '#6a6a6a',
        'gold-primary': '#FFD447',       // Mapped to Yenege Yellow
        'gold-secondary': '#FFD447',
        'blue-primary': '#1C2951',       // Mapped to Deep Indigo
        'blue-secondary': '#1C2951',
        'green-primary': '#10b981',
        'green-secondary': '#059669',
        'red-primary': '#ef4444',
        'red-secondary': '#dc2626',
        'purple-primary': '#7B5CFF',     // Mapped to Electric Purple
        'purple-secondary': '#7B5CFF',
        'pink-primary': '#ec4899',
        'pink-secondary': '#db2777',
        'orange-primary': '#FF6F5E',     // Mapped to Coral Orange
        'orange-secondary': '#FF6F5E',
        'yellow-primary': '#FFD447',     // Mapped to Yenege Yellow
        'yellow-secondary': '#FFD447'
      },
      fontFamily: {
        'sans': ['Inter', 'Nunito', 'system-ui', 'sans-serif'],
        'heading': ['Poppins', 'Manrope', 'system-ui', 'sans-serif'],
        'display': ['Outfit', 'Space Grotesk', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'Nunito', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace']
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }]
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem'
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
        'futuristic': '30px',            // Rounded UI for futuristic look
        'card': '30px'                   // Card border radius
      },
      boxShadow: {
        'glow': '0 0 20px rgba(255, 212, 71, 0.3)',
        'glow-lg': '0 0 40px rgba(255, 212, 71, 0.4)',
        'glow-purple': '0 0 20px rgba(123, 92, 255, 0.3)',
        'glow-purple-lg': '0 0 40px rgba(123, 92, 255, 0.4)',
        'glow-yellow': '0 0 20px rgba(255, 212, 71, 0.3)',
        'glow-yellow-lg': '0 0 40px rgba(255, 212, 71, 0.4)',
        'inner-glow': 'inset 0 0 20px rgba(255, 212, 71, 0.2)',
        'neon': '0 0 5px rgba(255, 212, 71, 0.5), 0 0 10px rgba(255, 212, 71, 0.3), 0 0 15px rgba(255, 212, 71, 0.1)',
        'neon-purple': '0 0 5px rgba(123, 92, 255, 0.5), 0 0 10px rgba(123, 92, 255, 0.3), 0 0 15px rgba(123, 92, 255, 0.1)',
        'soft': '0 4px 20px rgba(0, 0, 0, 0.1), 0 0 20px rgba(123, 92, 255, 0.1)',
        'soft-yellow': '0 4px 20px rgba(0, 0, 0, 0.1), 0 0 20px rgba(255, 212, 71, 0.1)'
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'fade-in-down': 'fadeInDown 0.5s ease-out',
        'fade-in-left': 'fadeInLeft 0.5s ease-out',
        'fade-in-right': 'fadeInRight 0.5s ease-out',
        'slide-in-up': 'slideInUp 0.3s ease-out',
        'slide-in-down': 'slideInDown 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'glow-purple': 'glow-purple 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
        'gradient': 'gradient 3s ease infinite',
        'tilt': 'tilt 10s infinite linear',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        fadeInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        fadeInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        slideInUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' }
        },
        slideInDown: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' }
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' }
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(255, 212, 71, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(255, 212, 71, 0.8), 0 0 30px rgba(255, 212, 71, 0.6)' }
        },
        'glow-purple': {
          '0%': { boxShadow: '0 0 5px rgba(123, 92, 255, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(123, 92, 255, 0.8), 0 0 30px rgba(123, 92, 255, 0.6)' }
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' }
        },
        tilt: {
          '0%, 50%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(0.5deg)' },
          '75%': { transform: 'rotate(-0.5deg)' }
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' }
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        // YENEGE Futuristic Gradients
        'yenege-energy': 'linear-gradient(135deg, #FFD447 0%, #FF6F5E 50%, #7B5CFF 100%)',
        'travel-adventure': 'linear-gradient(135deg, #3CCFCF 0%, #FFD447 100%)',
        'night-event': 'linear-gradient(135deg, #1C2951 0%, #7B5CFF 100%)',
        'playful-glow': 'linear-gradient(135deg, #FF6F5E 0%, #FFD447 50%, #3CCFCF 100%)',
        // Legacy gradients (kept for backward compatibility)
        'gradient-mesh': 'linear-gradient(45deg, #FFD447, #FFD447, #FFD447)',
        'gradient-fire': 'linear-gradient(45deg, #FF6F5E, #FF6F5E, #FFD447)',
        'gradient-ocean': 'linear-gradient(45deg, #3CCFCF, #7B5CFF, #7B5CFF)',
        'gradient-sunset': 'linear-gradient(45deg, #FF6F5E, #FFD447, #FFD447)',
        'gradient-aurora': 'linear-gradient(45deg, #3CCFCF, #7B5CFF, #FFD447)',
        'gradient-cosmic': 'linear-gradient(45deg, #FF6F5E, #7B5CFF, #7B5CFF)',
        'gradient-forest': 'linear-gradient(45deg, #3CCFCF, #3CCFCF, #FFD447)',
        'gradient-sky': 'linear-gradient(45deg, #3CCFCF, #7B5CFF, #FFD447)',
        'gradient-sunrise': 'linear-gradient(45deg, #FFD447, #FF6F5E, #FFD447)'
      },
      backdropBlur: {
        xs: '2px'
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding'
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100'
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography')
  ]
}