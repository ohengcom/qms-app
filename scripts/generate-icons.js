// Simple script to create placeholder icons
// In production, replace with actual icon images

const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../public/icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create SVG placeholder for each size
sizes.forEach(size => {
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#3b82f6"/>
  <text x="50%" y="50%" font-family="system-ui" font-size="${size / 4}" fill="white" text-anchor="middle" dy=".3em" font-weight="bold">QMS</text>
</svg>`;
  
  fs.writeFileSync(path.join(iconsDir, `icon-${size}x${size}.svg`), svg);
  console.log(`Created icon-${size}x${size}.svg`);
});

// Create shortcut icons
const shortcuts = ['add', 'dashboard', 'search'];
shortcuts.forEach(name => {
  const svg = `<svg width="96" height="96" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#3b82f6"/>
  <text x="50%" y="50%" font-family="system-ui" font-size="24" fill="white" text-anchor="middle" dy=".3em" font-weight="bold">${name[0].toUpperCase()}</text>
</svg>`;
  
  fs.writeFileSync(path.join(iconsDir, `shortcut-${name}.svg`), svg);
  console.log(`Created shortcut-${name}.svg`);
});

console.log('All icons generated successfully!');
