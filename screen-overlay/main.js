const { app, BrowserWindow, screen } = require('electron');
const path = require('path');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 420,
    height: 230,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    focusable: false, // never steals focus
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Make overlay appear on all macOS Spaces / virtual desktops and stay above fullscreen apps
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  // Overlay is now fully clickable so you can move/close/interact with it
  // (was previously set to ignore clicks)

  win.loadFile(path.join(__dirname, 'index.html'));

  win.setPosition(20, 60);   // show near top-left
  // Optional: remove the menu
  win.setMenu(null);

  // ─── Auto-move overlay to the monitor the cursor is currently on ───
  if (!process.env.DEBUG_OVERLAY) {
    const OFFSET = { x: 20, y: 60 }; // top-left padding
    setInterval(() => {
      if (win.isDestroyed()) return;
      const point = screen.getCursorScreenPoint();
      const display = screen.getDisplayNearestPoint(point);
      win.setPosition(display.bounds.x + OFFSET.x, display.bounds.y + OFFSET.y, false);
    }, 1000);
  }

  // ─── DEBUG (enable with DEBUG_OVERLAY=1) ───
  if (process.env.DEBUG_OVERLAY === '1') {
    // Allow clicks so we can interact during debugging
    win.setIgnoreMouseEvents(false);
    win.setFocusable(true);
    win.focus();
    // Let DevTools and other windows receive clicks above the overlay while debugging
    win.setAlwaysOnTop(false);
    win.setSize(600, 350);
    win.webContents.openDevTools({ mode: 'detach' });
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  // Keep app alive on macOS, quit on other platforms
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
}); 