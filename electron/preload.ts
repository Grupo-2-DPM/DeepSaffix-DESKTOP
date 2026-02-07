import { contextBridge } from 'electron';

// Exponer APIs seguras al renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Ejemplo de API
  platform: process.platform
});