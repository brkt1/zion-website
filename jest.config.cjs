module.exports = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\.(ts|tsx|js|jsx)$': ['babel-jest', { configFile: './.babelrc' }],
  },
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
  testMatch: ['<rootDir>/src/**/*.test.{js,jsx,ts,tsx}', '!**/server/**/*.test.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(@heroicons|react-router-dom|@chakra-ui|framer-motion|uuid|@supabase|html5-qrcode|phosphor-react|qrcode|qrcode.react|react-qr-scanner|webcam-easy|workbox-.*|zod|zustand|@sentry|@prisma|crypto-js|flowbite|history|jspdf|jsqr|react-chartjs-2|react-icons|supabase)/)',
  ],
};
