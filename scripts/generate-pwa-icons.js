const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const logoPath = path.join(__dirname, '../public/logo.png');
const outputDir = path.join(__dirname, '../public');

// Brand colors from tailwind.config.js
const colors = {
  indigoDeep: '#1C2951',
  purpleElectric: '#7B5CFF',
  yenegeYellow: '#FFD447',
  tealBreeze: '#3CCFCF',
  coralOrange: '#FF6F5E',
};

async function createBubbleBackground(size) {
  // Create SVG with light gradient background and colorful bubbles
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#F7F7F9;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#FFFFFF;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#F0F0F3;stop-opacity:1" />
        </linearGradient>
        <radialGradient id="bubble1" cx="20%" cy="30%">
          <stop offset="0%" style="stop-color:${colors.yenegeYellow};stop-opacity:0.4" />
          <stop offset="100%" style="stop-color:${colors.yenegeYellow};stop-opacity:0" />
        </radialGradient>
        <radialGradient id="bubble2" cx="80%" cy="70%">
          <stop offset="0%" style="stop-color:${colors.tealBreeze};stop-opacity:0.35" />
          <stop offset="100%" style="stop-color:${colors.tealBreeze};stop-opacity:0" />
        </radialGradient>
        <radialGradient id="bubble3" cx="50%" cy="80%">
          <stop offset="0%" style="stop-color:${colors.coralOrange};stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:${colors.coralOrange};stop-opacity:0" />
        </radialGradient>
        <radialGradient id="bubble4" cx="15%" cy="70%">
          <stop offset="0%" style="stop-color:${colors.purpleElectric};stop-opacity:0.25" />
          <stop offset="100%" style="stop-color:${colors.purpleElectric};stop-opacity:0" />
        </radialGradient>
        <radialGradient id="bubble5" cx="85%" cy="25%">
          <stop offset="0%" style="stop-color:${colors.yenegeYellow};stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:${colors.yenegeYellow};stop-opacity:0" />
        </radialGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#bgGradient)"/>
      <circle cx="${size * 0.2}" cy="${size * 0.3}" r="${size * 0.25}" fill="url(#bubble1)"/>
      <circle cx="${size * 0.8}" cy="${size * 0.7}" r="${size * 0.3}" fill="url(#bubble2)"/>
      <circle cx="${size * 0.5}" cy="${size * 0.8}" r="${size * 0.2}" fill="url(#bubble3)"/>
      <circle cx="${size * 0.15}" cy="${size * 0.7}" r="${size * 0.15}" fill="url(#bubble4)"/>
      <circle cx="${size * 0.85}" cy="${size * 0.25}" r="${size * 0.18}" fill="url(#bubble5)"/>
      <circle cx="${size * 0.7}" cy="${size * 0.15}" r="${size * 0.12}" fill="url(#bubble1)"/>
      <circle cx="${size * 0.3}" cy="${size * 0.85}" r="${size * 0.14}" fill="url(#bubble2)"/>
    </svg>
  `;

  return Buffer.from(svg);
}

async function generateIcon(size) {
  console.log(`Generating ${size}x${size} icon...`);

  try {
    // Create bubble background
    const backgroundSvg = await createBubbleBackground(size);
    const background = sharp(backgroundSvg).resize(size, size);

    // Load and resize logo
    // Use 60% of the icon size for logo (leaving 20% padding on each side)
    const logoSize = Math.floor(size * 0.6);
    const logo = sharp(logoPath)
      .resize(logoSize, logoSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      });

    // Composite logo on top of background, centered
    const logoBuffer = await logo.toBuffer();
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);

    await background
      .composite([{
        input: logoBuffer,
        top: Math.floor((size - logoSize) / 2),
        left: Math.floor((size - logoSize) / 2),
      }])
      .png()
      .toFile(outputPath);

    console.log(`✓ Created ${outputPath}`);
  } catch (error) {
    console.error(`Error generating ${size}x${size} icon:`, error);
    throw error;
  }
}

async function main() {
  console.log('Generating PWA icons...\n');

  // Check if logo exists
  if (!fs.existsSync(logoPath)) {
    console.error(`Error: Logo not found at ${logoPath}`);
    process.exit(1);
  }

  // Generate both icon sizes
  await generateIcon(192);
  await generateIcon(512);

  console.log('\n✓ All icons generated successfully!');
  console.log('\nNext steps:');
  console.log('1. Update public/manifest.json to use the new icon files');
  console.log('2. Clear your browser cache and reinstall the PWA');
}

main().catch(console.error);

