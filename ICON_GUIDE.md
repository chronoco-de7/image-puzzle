# Setting Up App Icons

To add custom icons to your executable, you need to create icon files for each platform.

## Required Icon Files

Place these files in the project root directory:

- **Windows**: `icon.ico` (256x256 pixels minimum, multi-size recommended)
- **macOS**: `icon.icns` (512x512 pixels, with multiple sizes)
- **Linux**: `icon.png` (512x512 pixels recommended)

## Option 1: Create Icons from PNG

### For Windows (.ico):
1. Create a 256x256 PNG image
2. Use an online converter: https://convertio.co/png-ico/ or https://icoconvert.com/
3. Save as `icon.ico` in the project root

### For macOS (.icns):
1. Create a 512x512 PNG image
2. Use an online converter: https://cloudconvert.com/png-to-icns
3. Or use macOS command line:
   ```bash
   # Create iconset directory
   mkdir icon.iconset
   
   # Copy your PNG to different sizes
   sips -z 16 16 icon.png --out icon.iconset/icon_16x16.png
   sips -z 32 32 icon.png --out icon.iconset/icon_16x16@2x.png
   sips -z 32 32 icon.png --out icon.iconset/icon_32x32.png
   sips -z 64 64 icon.png --out icon.iconset/icon_32x32@2x.png
   sips -z 128 128 icon.png --out icon.iconset/icon_128x128.png
   sips -z 256 256 icon.png --out icon.iconset/icon_128x128@2x.png
   sips -z 256 256 icon.png --out icon.iconset/icon_256x256.png
   sips -z 512 512 icon.png --out icon.iconset/icon_256x256@2x.png
   sips -z 512 512 icon.png --out icon.iconset/icon_512x512.png
   sips -z 1024 1024 icon.png --out icon.iconset/icon_512x512@2x.png
   
   # Convert to .icns
   iconutil -c icns icon.iconset
   ```

### For Linux (.png):
1. Create a 512x512 PNG image
2. Save as `icon.png` in the project root

## Option 2: Use Online Icon Generators

1. **Favicon.io**: https://favicon.io/ - Upload image, download all formats
2. **IconKitchen**: https://icon.kitchen/ - Generate icons for all platforms
3. **AppIcon.co**: https://www.appicon.co/ - Generate app icons

## Option 3: Design Your Own

Create a square image (512x512 or 1024x1024) with:
- Simple, recognizable design
- High contrast
- Works well at small sizes
- Represents the puzzle game (numbers, tiles, etc.)

## Quick Setup

1. Create or download a 512x512 PNG image for your icon
2. Convert it to the required formats:
   - Windows: Convert PNG to ICO (use online converter)
   - macOS: Convert PNG to ICNS (use online converter or command line)
   - Linux: Use the PNG directly
3. Place all three files (`icon.ico`, `icon.icns`, `icon.png`) in the project root
4. Run `npm run build` - the icons will be automatically included

## Testing Icons

After adding icons, test by building:
```bash
npm run build:win    # Test Windows icon
npm run build:mac    # Test macOS icon
npm run build:linux  # Test Linux icon
```

## Notes

- Icons are optional - if you don't provide them, Electron will use default icons
- The icon files must be in the project root directory
- For best results, use high-resolution images (512x512 or larger)
- Icons should have transparent backgrounds (PNG format supports this)

