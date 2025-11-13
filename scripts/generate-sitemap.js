/**
 * Sitemap Generator Script
 * 
 * This script generates a sitemap.xml file for the website.
 * It can be run manually or as part of a build process.
 * 
 * Usage: node scripts/generate-sitemap.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = process.env.SITEMAP_BASE_URL || 'https://www.yenege.com';
const OUTPUT_FILE = path.join(__dirname, '../public/sitemap.xml');

// Static routes that should always be in the sitemap
const staticRoutes = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/events', priority: '0.9', changefreq: 'daily' },
  { path: '/travel', priority: '0.8', changefreq: 'weekly' },
  { path: '/community', priority: '0.8', changefreq: 'weekly' },
  { path: '/about', priority: '0.7', changefreq: 'monthly' },
  { path: '/contact', priority: '0.7', changefreq: 'monthly' },
  { path: '/apply', priority: '0.6', changefreq: 'monthly' },
];

// Get current date in YYYY-MM-DD format
const getCurrentDate = () => {
  return new Date().toISOString().split('T')[0];
};

// Generate sitemap XML
const generateSitemap = (routes) => {
  const urls = routes.map(route => {
    return `  <url>
    <loc>${BASE_URL}${route.path}</loc>
    <lastmod>${route.lastmod || getCurrentDate()}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
  }).join('\n\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

${urls}

</urlset>`;
};

// Main function
const main = () => {
  try {
    console.log('Generating sitemap.xml...');
    console.log(`Base URL: ${BASE_URL}`);
    
    // Generate sitemap with static routes
    // TODO: In the future, you can fetch dynamic routes (like event pages) from your API
    // and add them here
    const sitemap = generateSitemap(staticRoutes);
    
    // Ensure public directory exists
    const publicDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    // Write sitemap to file
    fs.writeFileSync(OUTPUT_FILE, sitemap, 'utf8');
    
    console.log(`✅ Sitemap generated successfully: ${OUTPUT_FILE}`);
    console.log(`   Total URLs: ${staticRoutes.length}`);
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { generateSitemap, staticRoutes };

