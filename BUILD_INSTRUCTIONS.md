# Building 15 Puzzle Game to Executable

This guide will help you convert the web-based 15 Puzzle game into a standalone executable file.

## Prerequisites

1. **Node.js** (version 14 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

## Step 1: Install Dependencies

Open a terminal in the project directory and run:

```bash
npm install
```

This will install Electron and electron-builder, which are needed to package the app.

## Step 2: Test the App Locally

Before building, test that the Electron app works:

```bash
npm start
```

This should open the game in an Electron window. Close it when you're done testing.

## Step 3: Build the Executable

### For Windows (.exe):
```bash
npm run build:win
```

### For macOS (.dmg):
```bash
npm run build:mac
```

### For Linux (.AppImage):
```bash
npm run build:linux
```

### For All Platforms:
```bash
npm run build
```

## Output

The built executable will be in the `dist/` folder:
- **Windows**: `dist/15 Puzzle Setup X.X.X.exe` (installer) or `dist/win-unpacked/15 Puzzle.exe` (portable)
- **macOS**: `dist/15 Puzzle-X.X.X.dmg`
- **Linux**: `dist/15 Puzzle-X.X.X.AppImage`

## Notes

- The first build may take a few minutes as it downloads Electron binaries
- The executable will be larger (100-150MB) because it includes the Chromium browser
- You can distribute the executable file to others without them needing Node.js installed

## Troubleshooting

If you encounter issues:

1. **"electron-builder not found"**: Run `npm install` again
2. **Build fails**: Make sure all files (index.html, styles.css, script.js, main.js) are in the project root
3. **Icon errors**: The build will work without icons, but you can add icon files (icon.ico for Windows, icon.icns for macOS, icon.png for Linux) to customize the app icon

## Optional: Customize the App

- Edit `package.json` to change the app name, version, or description
- Edit `main.js` to change window size, behavior, or add features
- Add icon files to customize the app icon

