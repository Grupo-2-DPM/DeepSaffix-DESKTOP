# DeepSaffix - Cliente Electron + React + Vite

Este proyecto utiliza **Electron**, **React**, **TypeScript** y **Vite** para crear una aplicación de escritorio multiplataforma.

## Estructura del Proyecto

```
deepsaffix-cliente/
├── electron/                    # Código del proceso principal de Electron
│   ├── main.ts                 # Punto de entrada principal de Electron
│   └── preload.ts              # Scripts de pre-carga
├── src/                        # Aplicación React
├── dist-electron/              # Código compilado de Electron (generado)
├── dist/                       # Build de React (generado)
├── release/                    # Aplicaciones empaquetadas (generado)
├── index.html                  # Punto de entrada HTML
├── vite.config.ts              # Configuración de Vite
├── tsconfig.electron.json      # Configuración TypeScript para Electron
├── tsconfig.json               # Configuración TypeScript para React
├── electron-builder.json       # Configuración para empaquetado
└── package.json                # Dependencias y scripts
```

## Prerrequisitos

- **Node.js** (v18 o superior)
- **npm** (v9 o superior)
- **Git**

## Configuración Inicial

### 1. Clonar el repositorio
```bash
git clone https://github.com/Grupo-2-DPM/DeepSaffix-CLIENTE.git
cd deepsaffix-cliente
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Instalar dependencias de desarrollo
```bash
npm install --save-dev electron typescript @types/node @types/electron
npm install --save-dev concurrently wait-on electron-builder
```

## Scripts Disponibles

### Desarrollo
```bash
# Iniciar servidor de desarrollo Vite + Electron (recomendado)
npm run dev:all

# O ejecutar por separado:
npm run dev                     # Iniciar solo Vite (React)
npm run build:electron          # Compilar Electron
npm run electron                # Iniciar solo Electron
```

### Build y Producción
```bash
# Build completo para producción
npm run build:all               # Build de React + Electron

# Empaquetar aplicación (genera ejecutables en /release)
npm run package                 # Para sistema operativo actual
npm run package:linux           # Para Linux
npm run package:win             # Para Windows
npm run package:mac             # Para macOS

# Ejecutar en modo producción (después de build)
npm start                       # Ejecutar desde archivos compilados
```

### Linting y Testing
```bash
npm run lint                    # Verificar código con ESLint
npm test                        # Ejecutar pruebas (si están configuradas)
```

## Configuración Técnica

### Archivos de Configuración Clave

#### **1. `tsconfig.electron.json`** (Configuración ES Modules)
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022", "DOM"],
    "outDir": "./dist-electron",
    "rootDir": "./electron",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "isolatedModules": true
  },
  "include": ["electron/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

#### **2. `package.json` - Scripts principales**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "build:electron": "tsc -p tsconfig.electron.json",
    "electron": "electron . --no-sandbox",
    "dev:electron": "concurrently -k \"npm run dev\" \"npm run build:electron && wait-on tcp:5173 && npm run electron\"",
    "dev:all": "npm run dev:electron",
    "build:all": "npm run build && npm run build:electron",
    "package": "npm run build:all && electron-builder",
    "package:linux": "npm run build:all && electron-builder --linux",
    "package:win": "npm run build:all && electron-builder --win",
    "package:mac": "npm run build:all && electron-builder --mac"
  }
}
```

#### **3. `electron/main.ts`** (Punto de entrada principal)
```typescript
import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;
const isDev = process.env.NODE_ENV === 'development';

async function createWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
```

#### **4. `electron/preload.ts`** (Comunicación segura)
```typescript
import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isDev: process.env.NODE_ENV === 'development',
  // Añadir APIs personalizadas aquí
});
```

#### **5. `vite.config.ts`** (Configuración de Vite)
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',  // Importante para rutas relativas en Electron
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'esnext'
  },
  server: {
    port: 5173,
    strictPort: true
  }
});
```

#### **6. `electron-builder.json`** (Configuración de empaquetado)
```json
{
  "appId": "com.deepsaffix.cliente",
  "productName": "DeepSaffix Cliente",
  "directories": {
    "output": "release"
  },
  "files": [
    "dist/**/*",
    "dist-electron/**/*",
    "node_modules/**/*"
  ],
  "linux": {
    "target": ["AppImage", "deb", "rpm", "snap"],
    "category": "Utility",
    "icon": "public/icon.png"
  },
  "win": {
    "target": ["nsis", "portable"],
    "icon": "public/icon.ico"
  },
  "mac": {
    "target": ["dmg", "zip"],
    "category": "public.app-category.utilities",
    "icon": "public/icon.icns"
  }
}
```

## Solución de Problemas Comunes

### 1. **Error: `exports is not defined in ES module scope`**
**Causa:** Conflicto entre CommonJS y ES Modules.

**Solución:**
1. Asegurar que `tsconfig.electron.json` use `"module": "ESNext"`
2. Usar `import.meta.url` en lugar de `__dirname`:
```typescript
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
```

### 2. **Error de sandbox en Linux**
```
FATAL:sandbox/linux/suid/client/setuid_sandbox_host.cc:166]
```

**Solución:**
```bash
# Opción A: Ejecutar con flag (desarrollo)
npm run electron -- --no-sandbox

# Opción B: Configurar permisos (solo Linux)
sudo chown root node_modules/electron/dist/chrome-sandbox
sudo chmod 4755 node_modules/electron/dist/chrome-sandbox
```

### 3. **Electron no se conecta a Vite en desarrollo**
**Solución:** Verificar que:
1. Vite esté corriendo en puerto 5173
2. El script `dev:electron` espere correctamente:
```json
"wait-on tcp:5173 && npm run electron"
```

### 4. **Errores de TypeScript con import.meta**
**Solución:** Configurar TypeScript correctamente:
```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "target": "ES2022"
  }
}
```

## Empaquetado para Producción

### Paso a paso:
1. **Crear iconos** en `public/`:
   - `icon.png` (512x512) para Linux
   - `icon.ico` para Windows
   - `icon.icns` para macOS

2. **Construir la aplicación:**
```bash
# Build completo
npm run build:all

# Empaquetar para tu sistema
npm run package

# Empaquetar específico
npm run package:linux
npm run package:win
npm run package:mac
```

3. **Los ejecutables** se generan en `/release/`

### Configuración avanzada de electron-builder:
```bash
# Build con configuración específica
electron-builder --linux --x64 --arm64

# Build para Windows desde Linux (requiere wine)
electron-builder --win --x64

# Firmar aplicaciones (macOS/Windows)
electron-builder --mac --publish always
```

## Comunicación entre Procesos

### Desde el Renderer (React):
```typescript
// Usar APIs expuestas en preload
console.log(window.electronAPI.platform); // 'linux', 'win32', 'darwin'
console.log(window.electronAPI.isDev);    // true/false

// Ejemplo de API personalizada
window.electronAPI.myCustomFunction?.('datos');
```

### Añadir APIs adicionales en preload:
```typescript
contextBridge.exposeInMainWorld('electronAPI', {
  // API existente
  platform: process.platform,
  
  // Nueva API de ejemplo
  showDialog: async (message: string) => {
    return await ipcRenderer.invoke('show-dialog', message);
  },
  
  // API de sistema de archivos (con restricciones)
  readFile: async (filePath: string) => {
    return await ipcRenderer.invoke('read-file', filePath);
  }
});
```

## Configuración de Desarrollo Avanzada

### Hot Reload con electron-reloader
```bash
npm install --save-dev electron-reloader
```

**En main.ts:**
```typescript
import { app, BrowserWindow } from 'electron';

// Solo en desarrollo
if (process.env.NODE_ENV === 'development') {
  try {
    const { default: reload } = await import('electron-reloader');
    reload(module, {
      debug: true,
      watchRenderer: true
    });
  } catch {}
}
```

### Variables de entorno
Crear `.env`:
```env
VITE_APP_NAME=DeepSaffix
VITE_API_URL=http://localhost:3000
```

**En Vite/React:**
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

### Configurar alias en Vite
```typescript
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@assets': path.resolve(__dirname, './src/assets')
    }
  }
});
```

## Recursos Adicionales

- [Documentación oficial de Electron](https://www.electronjs.org/docs)
- [Electron con Vite](https://www.electronjs.org/docs/latest/tutorial/tutorial-vite)
- [Electron + TypeScript Best Practices](https://www.electronforge.io/guides/framework-integration/react-with-typescript)
- [Electron Builder Documentation](https://www.electron.build/)
- [Vite Documentation](https://vitejs.dev/guide/)
- [TypeScript con ES Modules](https://www.typescriptlang.org/docs/handbook/esm-node.html)


## Changelog

### v1.0.0 (Actual)
