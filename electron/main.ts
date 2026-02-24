import { app, BrowserWindow } from 'electron';
const path = require('path');

async function createWindow(): Promise<void> {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Esto obliga a Electron a ignorar cualquier cache previo
  await win.webContents.session.clearCache();

  win.setTitle('DeepSaffix');
  win.loadFile(path.join(__dirname, '../dist/index.html'));
  win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

export {};