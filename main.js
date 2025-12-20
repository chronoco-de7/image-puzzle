const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 500,
    height: 700,
    minWidth: 500,
    minHeight: 700,
    maxWidth: 500,
    maxHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    backgroundColor: '#ffffff',
    show: false,
    titleBarStyle: 'default',
    resizable: true
  });

  // Load the HTML file
  win.loadFile(path.join(__dirname, 'index.html')).catch(err => {
    console.error('Error loading index.html:', err);
    // Show window even if there's an error
    win.show();
  });

  // Show window when ready to prevent visual flash
  win.once('ready-to-show', () => {
    win.show();
    // Focus the window on Windows
    if (process.platform === 'win32') {
      win.focus();
    }
  });

  // Handle loading errors
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
    win.show(); // Show window even on error
  });

  // Open DevTools on error for debugging (optional - remove in production)
  win.webContents.on('crashed', () => {
    console.error('Renderer process crashed');
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}).catch(err => {
  console.error('Error starting app:', err);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

