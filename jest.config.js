export default {
  transform: {
    '^.+\.(ts|tsx|js|jsx)$': ['babel-jest', { configFile: './.babelrc' }],
  },
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\.(css|less|sass|scss)$': 'identity-obj-proxy',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@heroicons|react-router-dom|@chakra-ui|framer-motion|uuid|@supabase|html5-qrcode|phosphor-react|qrcode|qrcode.react|react-qr-scanner|webcam-easy|workbox-.*|zod|zustand|@sentry|@prisma|crypto-js|flowbite|history|jspdf|jsqr|react-chartjs-2|react-icons|supabase)/)',
  ],
};